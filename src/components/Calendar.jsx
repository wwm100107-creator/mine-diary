import { useState, useMemo, useRef, useEffect } from 'react'
import {
  loadMarkedDates,
  predictNextPeriod,
  getDayIcons,
  addDayIcon,
  moveDayIcon,
  removeDayIcon,
  toDateStr,
  getCustomTrayIcons,
  addCustomTrayIcon,
  removeCustomTrayIcon,
} from '../utils/cycle'
import { useCycleCalendar } from '../hooks/useCycleCalendar'
import { syncUserCustomIcons } from '../lib/social'
import IconPickerModal from './IconPickerModal'
import s from './Calendar.module.css'

// Vietnamese month/day names
const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
  'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
  'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
]
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const WEEKENDS = new Set([5, 6]) // index in WEEKDAYS (T7, CN)

// Format Vietnam time (Asia/Ho_Chi_Minh) in HH:mm:ss
function getVietnamTime() {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

function buildGrid(year, month) {
  const days = []
  const firstDow = new Date(year, month, 1).getDay() // 0=Sun
  const startOffset = (firstDow + 6) % 7 // Mon-first: Sun=6

  // Previous month fill
  const prevDays = new Date(year, month, 0).getDate()
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, prevDays - i), otherMonth: true })
  }

  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), otherMonth: false })
  }

  // Next month fill
  const remaining = (7 - (days.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), otherMonth: true })
  }

  return days
}

export default function Calendar({ userId, mode = 'standard', gender = 'female', showCyclePrediction = true, markedDates = null, iconMap = null, userLogs = null, onDateSelect, className, readOnly = false }) {
  const isMale = gender === 'male'
  // showCyclePrediction=false: strip used in Diary tab — no period/fertile UI regardless of gender
  const showCycle = showCyclePrediction && !isMale
  // iconMap: { [dateStr]: string[] } override from Firestore (partner view)
  const getIcons = (dateStr) => (iconMap && iconMap[dateStr] !== undefined) ? iconMap[dateStr] : getDayIcons(userId, dateStr)

  const now = new Date()
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [tick, setTick] = useState(0)

  // ── Digital Clock (Asia/Ho_Chi_Minh Timezone) ────────────────────────────
  const [currentTime, setCurrentTime] = useState(() => getVietnamTime())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getVietnamTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Custom Tray Icons State ──────────────────────────────────────────────
  const [customIcons, setCustomIcons] = useState(() => getCustomTrayIcons(userId))
  const [showIconPicker, setShowIconPicker] = useState(false)

  useEffect(() => {
    setCustomIcons(getCustomTrayIcons(userId))
  }, [userId])

  // ── 1. Centralized Hover / Tap State (Mutual Exclusion) ───────────────────
  const [hoveredDate, setHoveredDate] = useState(null)
  const [activeDate, setActiveDate] = useState(null)
  const [dragOverDate, setDragOverDate] = useState(null)
  const [isTrashOver, setIsTrashOver] = useState(false)
  const [touchGhost, setTouchGhost] = useState(null) // { icon: string, x: number, y: number }

  const isDraggingRef = useRef(false)
  const activeDragPayloadRef = useRef(null)
  const lastTapRef = useRef({ dateStr: null, time: 0 })

  // Timers for Debounce Open (450ms) & Hysteresis Close (150ms)
  const hoverOpenTimerRef = useRef(null)
  const hoverCloseTimerRef = useRef(null)

  const todayStr = toDateStr(now)
  const grid = useMemo(() => buildGrid(view.year, view.month), [view])

  // ── Centralized Cycle & Fertility Prediction with Dynamic Engine (Standard vs Advanced AI) ──
  // markedDates/userLogs props: when provided (e.g. partner Firestore data), overrides localStorage reads
  const {
    prediction,
    predictedPeriodSet: predictedSet,
    fertileSet,
    dayLevelMap,
    ovulationDateStr,
    confidence,
    insights,
    bbtShiftDetected,
    lhPeakDetected,
  } = useCycleCalendar({ userId, mode, markedDates, userLogs, dayIconMap: iconMap, tick })




  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
      if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    }
  }, [])

  // ── Optimized Hover Handlers: Debounce + Hysteresis + Container Fallback ──

  // 1. Debounce Open (450ms on Desktop Mouse)
  const handleCellMouseEnter = (dateStr) => {
    if (isDraggingRef.current) return

    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }

    if (hoveredDate === dateStr) return

    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current)
      hoverOpenTimerRef.current = null
    }

    hoverOpenTimerRef.current = setTimeout(() => {
      setHoveredDate(dateStr)
      hoverOpenTimerRef.current = null
    }, 450)
  }

  // 2. Hysteresis Close (150ms on Desktop Mouse)
  const handleCellMouseLeave = () => {
    if (isDraggingRef.current) return

    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current)
      hoverOpenTimerRef.current = null
    }

    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
    }
    hoverCloseTimerRef.current = setTimeout(() => {
      setHoveredDate(null)
      hoverCloseTimerRef.current = null
    }, 150)
  }

  // 3. Fallback Container Handler: Đóng pop-up ngay khi chuột ra khỏi Calendar
  const handleCalendarMouseLeave = () => {
    if (isDraggingRef.current) return
    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current)
      hoverOpenTimerRef.current = null
    }
    if (hoverCloseTimerRef.current) {
      clearTimeout(hoverCloseTimerRef.current)
      hoverCloseTimerRef.current = null
    }
    setHoveredDate(null)
  }

  // ── Touch & Click Handler: Tap vs Double Tap / Select Diary ────────────────
  function handleDayClick(cell) {
    if (cell.otherMonth || isDraggingRef.current) return

    const str = toDateStr(cell.date)
    const isTouch = (typeof window !== 'undefined') && (
      window.matchMedia?.('(pointer: coarse)').matches || ('ontouchstart' in window)
    )
    const nowTime = Date.now()
    const isDoubleTap = lastTapRef.current.dateStr === str && (nowTime - lastTapRef.current.time < 380)
    lastTapRef.current = { dateStr: str, time: nowTime }

    if (isTouch) {
      if (isDoubleTap || hoveredDate === str) {
        if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
        if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
        setHoveredDate(null)
        setActiveDate(str)
        onDateSelect?.(str)
        return
      }

      setHoveredDate(str)
    } else {
      if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
      if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
      setHoveredDate(null)
      setActiveDate(str)
      onDateSelect?.(str)
    }
  }

  // ── Custom Tray Icon Management Handlers ─────────────────────────────────
  const handleAddCustomIcon = (icon) => {
    const updated = addCustomTrayIcon(userId, icon)
    setCustomIcons(updated)
    syncUserCustomIcons(userId, updated)
  }

  const handleRemoveCustomIcon = (e, icon) => {
    e.stopPropagation()
    const updated = removeCustomTrayIcon(userId, icon)
    setCustomIcons(updated)
    syncUserCustomIcons(userId, updated)
  }

  // ── Desktop Drag from Icon Tray ──────────────────────────────────────────
  function handleTrayDragStart(e, icon, isCustom = false) {
    isDraggingRef.current = true
    if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    setHoveredDate(null)
    const payload = { type: isCustom ? 'TRAY_CUSTOM' : 'TRAY', icon }
    activeDragPayloadRef.current = payload
    e.dataTransfer.setData('text/plain', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'all'
  }

  // ── Desktop Drag existing icon from day cell (Move or Trash) ─────────────
  function handleIconDragStart(e, fromDateStr, iconIndex, icon) {
    e.stopPropagation()
    isDraggingRef.current = true
    if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    setHoveredDate(null)
    const payload = { type: 'MOVE', fromDate: fromDateStr, iconIndex, icon }
    activeDragPayloadRef.current = payload
    e.dataTransfer.setData('text/plain', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'all'
  }

  function handleDragEnd() {
    setTimeout(() => {
      isDraggingRef.current = false
      activeDragPayloadRef.current = null
    }, 150)
    setDragOverDate(null)
    setIsTrashOver(false)
  }

  function handleDayDragOver(e, cell) {
    if (cell.otherMonth) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDayDragEnter(e, cell) {
    if (cell.otherMonth) return
    e.preventDefault()
    e.stopPropagation()
    setDragOverDate(toDateStr(cell.date))
  }

  function handleDayDragLeave(e, cell) {
    e.preventDefault()
    e.stopPropagation()
    const str = toDateStr(cell.date)
    if (dragOverDate === str) {
      setDragOverDate(null)
    }
  }

  function handleDayDrop(e, cell) {
    e.preventDefault()
    e.stopPropagation()
    setDragOverDate(null)
    setHoveredDate(null)
    if (cell.otherMonth) {
      handleDragEnd()
      return
    }

    let payload = activeDragPayloadRef.current
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain')
        if (raw) payload = JSON.parse(raw)
      } catch (err) {
        console.error('Drop error:', err)
      }
    }

    if (payload) {
      const targetDateStr = toDateStr(cell.date)
      if (payload.type === 'TRAY' || payload.type === 'TRAY_CUSTOM') {
        addDayIcon(userId, targetDateStr, payload.icon)
      } else if (payload.type === 'MOVE') {
        if (payload.fromDate !== targetDateStr) {
          moveDayIcon(userId, payload.fromDate, targetDateStr, payload.iconIndex)
        }
      }
      setTick(t => t + 1)
    }

    handleDragEnd()
  }

  // ── Trash Drop Handler ───────────────────────────────────────────────────
  function handleTrashDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsTrashOver(false)
    setHoveredDate(null)

    let payload = activeDragPayloadRef.current
    if (!payload) {
      try {
        const raw = e.dataTransfer.getData('text/plain')
        if (raw) payload = JSON.parse(raw)
      } catch (err) {
        console.error('Trash drop error:', err)
      }
    }

    if (payload) {
      if (payload.type === 'MOVE') {
        removeDayIcon(userId, payload.fromDate, payload.iconIndex)
        setTick(t => t + 1)
      } else if (payload.type === 'TRAY_CUSTOM') {
        handleRemoveCustomIcon(e, payload.icon)
      }
    }

    handleDragEnd()
  }

  // ── 📱 Mobile Touch Drag & Drop System (Standard Touch Events) ───────────
  function handleTouchStart(e, payload) {
    if (e.touches.length !== 1) return
    isDraggingRef.current = true
    activeDragPayloadRef.current = payload
    const touch = e.touches[0]
    setTouchGhost({
      icon: payload.icon,
      x: touch.clientX,
      y: touch.clientY,
    })
  }

  function handleTouchMove(e) {
    if (!isDraggingRef.current || !activeDragPayloadRef.current) return
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    setTouchGhost(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null)

    const elem = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!elem) return

    // 1. Over trash zone check
    const trashElem = elem.closest('[data-trash-zone="true"]')
    if (trashElem) {
      setIsTrashOver(true)
      setDragOverDate(null)
      return
    } else {
      setIsTrashOver(false)
    }

    // 2. Over day cell check
    const dayElem = elem.closest('[data-date]')
    if (dayElem) {
      const targetDate = dayElem.getAttribute('data-date')
      setDragOverDate(targetDate)
    } else {
      setDragOverDate(null)
    }
  }

  function handleTouchEnd(e) {
    if (!isDraggingRef.current || !activeDragPayloadRef.current) return
    const payload = activeDragPayloadRef.current
    const touch = e.changedTouches?.[0]

    if (touch) {
      const elem = document.elementFromPoint(touch.clientX, touch.clientY)
      if (elem) {
        // 1. Drop into Trash
        const trashElem = elem.closest('[data-trash-zone="true"]')
        if (trashElem) {
          if (payload.type === 'MOVE') {
            removeDayIcon(userId, payload.fromDate, payload.iconIndex)
            setTick(t => t + 1)
          } else if (payload.type === 'TRAY_CUSTOM') {
            handleRemoveCustomIcon(e, payload.icon)
          }
        } else {
          // 2. Drop into Day Cell
          const dayElem = elem.closest('[data-date]')
          if (dayElem) {
            const targetDateStr = dayElem.getAttribute('data-date')
            if (targetDateStr) {
              if (payload.type === 'TRAY' || payload.type === 'TRAY_CUSTOM') {
                addDayIcon(userId, targetDateStr, payload.icon)
              } else if (payload.type === 'MOVE') {
                if (payload.fromDate !== targetDateStr) {
                  moveDayIcon(userId, payload.fromDate, targetDateStr, payload.iconIndex)
                }
              }
              setTick(t => t + 1)
            }
          }
        }
      }
    }

    // Clean up
    setTouchGhost(null)
    setDragOverDate(null)
    setIsTrashOver(false)
    setTimeout(() => {
      isDraggingRef.current = false
      activeDragPayloadRef.current = null
    }, 150)
  }

  // Navigation
  function prevMonth() {
    if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    setHoveredDate(null)
    setView(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    )
  }

  function nextMonth() {
    if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    setHoveredDate(null)
    setView(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    )
  }

  function goToday() {
    if (hoverOpenTimerRef.current) clearTimeout(hoverOpenTimerRef.current)
    if (hoverCloseTimerRef.current) clearTimeout(hoverCloseTimerRef.current)
    setHoveredDate(null)
    setView({ year: now.getFullYear(), month: now.getMonth() })
  }

  // Prediction label formatting
  const predictedLabel = prediction
    ? prediction.predictedStart.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
      })
    : null

  const confidenceLabel = {
    high: 'Độ tin cậy cao (≥3 chu kỳ)',
    medium: 'Độ tin cậy TB (2 chu kỳ)',
    low: 'Dự đoán mặc định (1 chu kỳ)',
  }

  return (
    <aside
      className={`${s.calendar} ${className || ''}`}
      aria-label="Lịch chu kỳ pixel"
      onMouseLeave={handleCalendarMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Touch Ghost Clone Follower */}
      {touchGhost && (
        <div
          className={s.touchGhost}
          style={{ left: `${touchGhost.x}px`, top: `${touchGhost.y}px` }}
          aria-hidden="true"
        >
          {touchGhost.icon}
        </div>
      )}

      {/* ── 1. Cute Pixel Header (Digital Clock + Month/Year Navigation) ── */}
      <div className={s.header}>
        {/* Digital Clock (Asia/Ho_Chi_Minh) */}
        <div className={s.digitalClock} title="Giờ Việt Nam (Asia/Ho_Chi_Minh)">
          <span className={s.clockIcon} aria-hidden="true">⏰</span>
          <span className={s.clockTime}>{currentTime}</span>
        </div>

        {/* Month / Year Navigator */}
        <div className={s.monthNav}>
          <button className={s.navBtn} onClick={prevMonth} aria-label="Tháng trước" title="Tháng trước">
            ◀
          </button>
          <div className={s.title}>
            {MONTHS_VI[view.month]} {view.year}
          </div>
          <button className={s.navBtn} onClick={nextMonth} aria-label="Tháng sau" title="Tháng sau">
            ▶
          </button>
        </div>
      </div>

      {/* ── 2. Unified 7-Column Grid Container (Weekdays + Day Cells) ── */}
      <div
        className={s.grid}
        role="grid"
        aria-label="Lưới lịch 7 cột"
        onMouseLeave={handleCalendarMouseLeave}
      >
        {/* Weekday Header Cells (T2 - CN) */}
        {WEEKDAYS.map((d, i) => (
          <div
            key={`weekday-${d}`}
            className={`${s.weekdayCell} ${WEEKENDS.has(i) ? s.weekend : ''}`}
            aria-hidden="true"
          >
            <span className={s.weekdayText}>{d}</span>
          </div>
        ))}

        {/* Month Day Cells */}
        {grid.map((cell, i) => {
          if (cell.otherMonth) {
            return (
              <div
                key={`empty-${i}`}
                className={s.emptyDayCell}
                aria-hidden="true"
              />
            )
          }

          const str = toDateStr(cell.date)
          const isToday = str === todayStr
          const isPred = predictedSet.has(str)
          const isFertile = fertileSet.has(str)
          const isOvulation =
            prediction?.ovulationDate &&
            str === toDateStr(prediction.ovulationDate)

          // ── Advanced AI: 3-level fertility coloring ──
          const aiLevel = dayLevelMap.get(str) // 'peak' | 'high' | 'low' | undefined

          const dayIcons = getIcons(str)
          const maxVisible = 3

          const visibleIcons = dayIcons.slice(0, maxVisible)
          const extraCount = dayIcons.length - maxVisible

          const isHovered = hoveredDate === str
          const isActive = activeDate === str
          const isDropTarget = dragOverDate === str

          const cls = [
            s.day,
            isToday ? s.isToday : '',
            // showCycle = showCyclePrediction && !isMale — both Diary tab and male get no cycle styling
            showCycle && isPred ? s.predicted : '',
            showCycle && aiLevel === 'peak' ? s.fertileAiPeak :
            showCycle && aiLevel === 'high' ? s.fertileAiHigh :
            showCycle && aiLevel === 'low'  ? s.fertileAiLow  :
            showCycle && isFertile          ? s.fertile        : '',
            isHovered ? s.isHovered : '',
            isActive ? s.activeDay : '',
            isDropTarget ? s.dragOver : '',
          ].join(' ')

          return (
            <div
              key={i}
              className={cls}
              data-date={str}
              onClick={() => handleDayClick(cell)}
              onMouseEnter={() => handleCellMouseEnter(str)}
              onMouseLeave={handleCellMouseLeave}
              onDragOver={(e) => handleDayDragOver(e, cell)}
              onDragEnter={(e) => handleDayDragEnter(e, cell)}
              onDragLeave={(e) => handleDayDragLeave(e, cell)}
              onDrop={(e) => handleDayDrop(e, cell)}
              role="gridcell"
              tabIndex={0}
              aria-label={`${str}${dayIcons.length > 0 ? ` (icons: ${dayIcons.join(', ')})` : ''}`}
            >
              {/* Inner container: scales on hover / tap */}
              <div className={s.dayInner}>
                <span className={s.dayNumber}>{cell.date.getDate()}</span>

                {/* 1. Predicted Period: Grayscale Strawberry 🍓 (Health tab & female only) */}
                {showCycle && isPred && dayIcons.length === 0 && (
                  <span
                    className={s.predictedStrawberry}
                    title="Dự đoán chu kỳ (Dâu tây mờ)"
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    🍓
                  </span>
                )}

                {/* 2. Ovulation Flower Indicator (Health tab & female only) */}
                {showCycle && isOvulation && (
                  <span
                    className={s.ovulationIcon}
                    title="Ngày rụng trứng"
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    🌸
                  </span>
                )}

                {/* 3. Playing-Card Stacked Icons */}
                {dayIcons.length > 0 && (
                  <div
                    className={s.iconStack}
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                    onDragOver={(e) => e.stopPropagation()}
                  >
                    {visibleIcons.map((icon, idx) => (
                      <span
                        key={idx}
                        className={s.stackedIcon}
                        style={{ zIndex: idx + 1 }}
                        draggable={true}
                        onDragStart={(e) => handleIconDragStart(e, str, idx, icon)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => {
                          e.stopPropagation()
                          handleTouchStart(e, { type: 'MOVE', fromDate: str, iconIndex: idx, icon })
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.stopPropagation()}
                        onMouseLeave={(e) => e.stopPropagation()}
                        onDragOver={(e) => e.stopPropagation()}
                        title="Kéo sang ngày khác hoặc kéo vào Thùng rác để xóa"
                      >
                        {icon}
                      </span>
                    ))}
                    {extraCount > 0 && (
                      <span
                        className={s.extraBadge}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={(e) => e.stopPropagation()}
                        onMouseLeave={(e) => e.stopPropagation()}
                      >
                        +{extraCount}
                      </span>
                    )}
                  </div>
                )}

                {/* 4. Mini Quick Write Diary Button on Zoom Pop-up */}
                {isHovered && (
                  <button
                    type="button"
                    className={s.openDiaryMiniBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      setHoveredDate(null)
                      setActiveDate(str)
                      onDateSelect?.(str)
                    }}
                    title="Viết nhật ký cho ngày này"
                  >
                    ✍️
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 3. Cute Pixel Icon Tray & Trash Zone Row (Hidden in readOnly mode) ── */}
      {!readOnly && (
        <div className={s.trayAndTrashRow}>
          {/* Khay Icon (Hỗ trợ cuộn ngang mượt mà khi thêm nhiều icon) */}
          <div className={s.iconTray} role="toolbar" aria-label="Khay biểu tượng">
            <span className={s.trayLabel}>Khay Icon:</span>
            
            <div className={s.trayItems}>
              {/* Default Icons — period icons (🍓❌) hidden for MALE only; Diary tab female still needs them to mark manually */}
              {[
                { icon: '🍓', title: 'Kinh nguyệt (Bắt đầu)', maleHide: true },
                { icon: '❌', title: 'Kết thúc kinh',          maleHide: true },
                { icon: '🎂', title: 'Sinh nhật / Kỷ niệm',   maleHide: false },
              ]
                .filter(({ maleHide }) => !maleHide || !isMale)
                .map(({ icon, title }) => (
                  <button
                    key={icon}
                    type="button"
                    className={s.trayBtn}
                    draggable={true}
                    onDragStart={(e) => handleTrayDragStart(e, icon)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, { type: 'TRAY', icon })}
                    title={`Kéo thả ${title} vào ô ngày`}
                  >
                    {icon}
                  </button>
                ))}




              {/* Custom Added Icons */}
              {customIcons.map((icon, idx) => (
                <div key={`custom-${icon}-${idx}`} className={s.customTrayItem}>
                  <button
                    type="button"
                    className={s.trayBtn}
                    draggable={true}
                    onDragStart={(e) => handleTrayDragStart(e, icon, true)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, { type: 'TRAY_CUSTOM', icon, isCustom: true })}
                    title={`Kéo thả icon ${icon} vào ô ngày (hoặc kéo vào Thùng rác để xóa)`}
                  >
                    {icon}
                  </button>
                  <button
                    type="button"
                    className={s.removeTrayIconBtn}
                    onClick={(e) => handleRemoveCustomIcon(e, icon)}
                    title="Xóa icon khỏi khay"
                    aria-label={`Xóa icon ${icon}`}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add Custom Icon Button (➕) */}
              <button
                type="button"
                className={s.addTrayIconBtn}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowIconPicker(true)
                }}
                title="Thêm icon tùy chỉnh vào khay"
                aria-label="Thêm icon tùy chỉnh"
              >
                ➕
              </button>
            </div>
          </div>

          {/* Khu vực Thùng rác xóa icon */}
          <div
            className={`${s.trashZone} ${isTrashOver ? s.trashOver : ''}`}
            data-trash-zone="true"
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              e.dataTransfer.dropEffect = 'move'
              setIsTrashOver(true)
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsTrashOver(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsTrashOver(false)
            }}
            onDrop={handleTrashDrop}
            title="Kéo thả icon từ ô ngày hoặc khay vào đây để xóa"
          >
            <span className={s.trashIcon}>🗑️</span>
            <span className={s.trashText}>Thùng rác</span>
          </div>
        </div>
      )}

      {/* ── 4. Custom Icon Picker Modal ── */}
      {showIconPicker && (
        <IconPickerModal
          onSelectIcon={handleAddCustomIcon}
          onClose={() => setShowIconPicker(false)}
          existingIcons={['🍓', '❌', '🎂', ...customIcons]}
        />
      )}

      {/* ── 5. Cute Prediction Banner & Footer ── */}
      {prediction && (
        <div className={s.prediction} aria-live="polite">
          <div className={s.predictionHeader}>
            <span className={s.predictionLabel}>✨ Chu kỳ tiếp theo</span>
            <span className={s.confidence}>{confidenceLabel[prediction.confidence]}</span>
          </div>
          <div className={s.predictionValue}>
            Dự kiến: <strong>{predictedLabel}</strong> ({prediction.cycleLength} ngày/chu kỳ)
          </div>
          {prediction.ovulationDate && (
            <div className={s.predictionOvulation}>
              <span>🌸 Rụng trứng:</span> <strong>{prediction.ovulationDate.toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'long',
              })}</strong>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Today Quick Button ── */}
      <div className={s.footer}>
        <button className={s.todayBtn} onClick={goToday} title="Quay về tháng hiện tại">
          <span>★</span> Hôm nay
        </button>
      </div>
    </aside>
  )
}
