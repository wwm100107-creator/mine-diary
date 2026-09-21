import { useState, useRef, useCallback, useEffect } from 'react'
import Calendar from './Calendar'
import DiaryEditor from './DiaryEditor'
import { saveDiaryEntry, getDiaryEntry, countWords } from '../lib/diary'
import s from '../App.module.css' // Reuse main app styles for now

const DAYS_VI   = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
const MONTHS_VI = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6',
                   'tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12']

const MOODS = [
  { id: 'happy', label: '☀ Vui',      cls: s.moodHappy  },
  { id: 'love',  label: '♥ Yêu',      cls: s.moodLove   },
  { id: 'calm',  label: '✿ Bình yên', cls: s.moodCalm   },
  { id: 'dream', label: '✦ Mơ mộng', cls: s.moodDream  },
  { id: 'sad',   label: '☁ Buồn',     cls: s.moodSad    },
]

function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return DAYS_VI[d.getDay()].toUpperCase()
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_VI[d.getMonth()]} ${d.getFullYear()}`
}

function formatMiniDate(dateStr) {
  if (!dateStr) return '--'
  const [, m, dd] = dateStr.split('-')
  return `${dd}/${m}`
}

export default function DiaryView({ user }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [calShrunk,    setCalShrunk]    = useState(false)
  const [diaryHtml,    setDiaryHtml]    = useState('')
  const [activeMoods,  setActiveMoods]  = useState(new Set())
  const [savedVisible, setSavedVisible] = useState(false)
  const autosaveTimer = useRef(null)

  // ── Select date ────────────────────────────────────────────────────────
  const handleDateSelect = useCallback(async (dateStr) => {
    if (selectedDate && user) {
      saveDiaryEntry(user.id, selectedDate, { content: diaryHtml, moods: [...activeMoods] })
    }
    setSelectedDate(dateStr)
    setCalShrunk(true)

    // Load from local cache immediately, then reconcile with Firestore
    const entry = await getDiaryEntry(user?.id, dateStr)
    setDiaryHtml(entry.content || '')
    setActiveMoods(new Set(entry.moods || []))
  }, [selectedDate, user, diaryHtml, activeMoods])

  // Re-sync if cloud restore completed in background
  useEffect(() => {
    if (!selectedDate || !user?.id) return
    const onRestored = () => {
      getDiaryEntry(user.id, selectedDate).then((entry) => {
        if (entry.content && !diaryHtml) {
          setDiaryHtml(entry.content)
          setActiveMoods(new Set(entry.moods || []))
        }
      })
    }
    window.addEventListener('minediary:diaries_restored', onRestored)
    return () => window.removeEventListener('minediary:diaries_restored', onRestored)
  }, [selectedDate, user?.id, diaryHtml])

  // ── Save ───────────────────────────────────────────────────────────────
  const saveDiary = useCallback((html, moods) => {
    if (!selectedDate || !user) return
    const contentToSave = html ?? diaryHtml
    const moodsToSave = moods ?? activeMoods
    saveDiaryEntry(user.id, selectedDate, { content: contentToSave, moods: moodsToSave })
    setSavedVisible(true)
    setTimeout(() => setSavedVisible(false), 2500)
  }, [selectedDate, user, diaryHtml, activeMoods])

  const handleEditorChange = useCallback((html) => {
    setDiaryHtml(html)
    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => saveDiary(html), 800)
  }, [saveDiary])

  const toggleMood = (id) => {
    setActiveMoods(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveDiary(diaryHtml, next)
      return next
    })
  }

  return (
    <>
      {/* Calendar slide panel */}
      <div className={`${s.calendarPanel} ${calShrunk ? s.shrunk : ''}`}>
        <Calendar userId={user.id} gender={user?.gender || 'female'} showCyclePrediction={false} onDateSelect={handleDateSelect} />

      </div>

      {/* Compact floating mini-calendar pill button */}
      <button
        className={`${s.miniCal} ${calShrunk ? s.visible : ''}`}
        onClick={() => setCalShrunk(false)}
        aria-label="Mở lại toàn bộ lịch"
        title="Nhấp để mở lại lịch"
      >
        <span className={s.miniCalIcon} aria-hidden="true">📅</span>
        <span className={s.miniCalDateText}>{formatMiniDate(selectedDate)}</span>
        <span className={s.miniCalExpandIcon} aria-hidden="true">
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M1 5V1H5M9 1H13V5M13 9V13H9M5 13H1V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {/* Diary section */}
      <section className={s.diaryWrapper} aria-label="Nhật ký">
        {!selectedDate ? (
          <div className={s.prompt}>
            <div className={s.promptIcon} aria-hidden="true">📖</div>
            <p className={s.promptText}>Hôm nay bạn có gì<br/>muốn kể không? ✨</p>
            <p className={s.promptHint}>Chọn một ngày trên lịch để bắt đầu</p>
          </div>
        ) : (
          <div key={selectedDate} className={s.writingView}>
            <div className={s.diaryHeader}>
              <div className={s.diaryDateBlock}>
                <div className={s.diaryDateDay}>{formatDayHeader(selectedDate)}</div>
                <div className={s.diaryDateFull}>{formatFullDate(selectedDate)}</div>
              </div>
              <div className={s.diaryHeaderActions}>
                {calShrunk && (
                  <button
                    className={s.headerCalBtn}
                    onClick={() => setCalShrunk(false)}
                    title="Mở bảng lịch"
                  >
                    📅 Lịch
                  </button>
                )}
                <span
                  className={`${s.saveStatus} ${savedVisible ? s.visible : ''}`}
                  role="status" aria-live="polite"
                >✓ Đã lưu đám mây</span>
                <button className={s.saveBtn} onClick={() => saveDiary()}>Lưu</button>
              </div>
            </div>

            <div className={s.moodBar} aria-label="Tâm trạng hôm nay">
              <span className={s.moodBarLabel}>Tâm trạng:</span>
              {MOODS.map(({ id, label, cls }) => (
                <button
                  key={id}
                  className={`${s.moodTag} ${cls} ${activeMoods.has(id) ? s.moodActive : ''}`}
                  onClick={() => toggleMood(id)}
                  role="checkbox"
                  aria-pressed={activeMoods.has(id)}
                >{label}</button>
              ))}
            </div>

            <DiaryEditor
              content={diaryHtml}
              onChange={handleEditorChange}
            />

            <div className={s.diaryFooter}>
              <span className={s.wordCount} aria-live="polite">
                {countWords(diaryHtml)} từ
              </span>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
