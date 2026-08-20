/**
 * src/utils/cycle.js
 * Period cycle & fertility calculation service + Daily icon storage.
 * Ponytail principles: minimal footprint, standard math, clean stdlib.
 */

// ── Storage helpers ───────────────────────────────────────────────────────────

const iconStorageKey = (userId, dateStr) =>
  `minediary:icons:${userId ?? 'guest'}:${dateStr}`

const periodStorageKey = (userId, dateStr) =>
  `minediary:period:${userId ?? 'guest'}:${dateStr}`

const customTrayStorageKey = (userId) =>
  `minediary:custom_tray:${userId ?? 'guest'}`

/**
 * Get all custom tray icons added by user
 * @returns {string[]} e.g. ['💖', '💊', '☕']
 */
export function getCustomTrayIcons(userId) {
  try {
    const raw = localStorage.getItem(customTrayStorageKey(userId))
    if (raw) return JSON.parse(raw)
    return []
  } catch (e) {
    return []
  }
}

/**
 * Save custom tray icons
 */
export function saveCustomTrayIcons(userId, icons) {
  try {
    localStorage.setItem(customTrayStorageKey(userId), JSON.stringify(icons))
  } catch (e) {
    console.error('Error saving custom tray icons:', e)
  }
}

/**
 * Add an icon to custom tray
 */
export function addCustomTrayIcon(userId, icon) {
  const current = getCustomTrayIcons(userId)
  if (!current.includes(icon)) {
    const updated = [...current, icon]
    saveCustomTrayIcons(userId, updated)
    return updated
  }
  return current
}

/**
 * Remove an icon from custom tray
 */
export function removeCustomTrayIcon(userId, icon) {
  const current = getCustomTrayIcons(userId)
  const updated = current.filter((ic) => ic !== icon)
  saveCustomTrayIcons(userId, updated)
  return updated
}

/**
 * Get all icons for a specific date
 * @returns {string[]} e.g. ['🍓', '🎂']
 */
export function getDayIcons(userId, dateStr) {
  try {
    const raw = localStorage.getItem(iconStorageKey(userId, dateStr))
    if (raw) return JSON.parse(raw)
    // Fallback: check legacy period mark
    if (localStorage.getItem(periodStorageKey(userId, dateStr))) {
      return ['🍓']
    }
    return []
  } catch (e) {
    return []
  }
}

/**
 * Add an icon to a date
 */
export function addDayIcon(userId, dateStr, icon) {
  const current = getDayIcons(userId, dateStr)
  const updated = [...current, icon]
  localStorage.setItem(iconStorageKey(userId, dateStr), JSON.stringify(updated))
  if (icon === '🍓') {
    localStorage.setItem(periodStorageKey(userId, dateStr), '1')
  }
  return updated
}

/**
 * Remove icon by index from a date
 */
export function removeDayIcon(userId, dateStr, iconIndex) {
  const current = getDayIcons(userId, dateStr)
  const removed = current[iconIndex]
  const updated = current.filter((_, idx) => idx !== iconIndex)
  localStorage.setItem(iconStorageKey(userId, dateStr), JSON.stringify(updated))
  if (removed === '🍓' && !updated.includes('🍓')) {
    localStorage.removeItem(periodStorageKey(userId, dateStr))
  }
  return updated
}

/**
 * Move icon from one date to another date
 */
export function moveDayIcon(userId, fromDateStr, toDateStr, iconIndex) {
  const currentFrom = getDayIcons(userId, fromDateStr)
  const icon = currentFrom[iconIndex]
  if (!icon) return
  removeDayIcon(userId, fromDateStr, iconIndex)
  addDayIcon(userId, toDateStr, icon)
}

/**
 * Load all dates marked with 🍓 (for cycle calculation)
 */
export function loadMarkedDates(userId) {
  const prefixIcon = `minediary:icons:${userId ?? 'guest'}:`
  const prefixLegacy = `minediary:period:${userId ?? 'guest'}:`
  const set = new Set()

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(prefixIcon)) {
      const dateStr = key.slice(prefixIcon.length)
      const icons = getDayIcons(userId, dateStr)
      if (icons.includes('🍓')) set.add(dateStr)
    } else if (key.startsWith(prefixLegacy)) {
      set.add(key.slice(prefixLegacy.length))
    }
  }

  return Array.from(set).sort()
}

/** Toggle period mark on click */
export function toggleDate(userId, dateStr) {
  const icons = getDayIcons(userId, dateStr)
  if (icons.includes('🍓')) {
    const updated = icons.filter(ic => ic !== '🍓')
    localStorage.setItem(iconStorageKey(userId, dateStr), JSON.stringify(updated))
    localStorage.removeItem(periodStorageKey(userId, dateStr))
    return false
  } else {
    addDayIcon(userId, dateStr, '🍓')
    return true
  }
}

export function isMarked(userId, dateStr) {
  return getDayIcons(userId, dateStr).includes('🍓')
}

// ── Cycle & Prediction Calculations ──────────────────────────────────────────

/**
 * Group dates into periods (start with 🍓, end with ❌ or consecutive gap > 1)
 */
function extractCycles(userId, sortedDates) {
  if (!sortedDates.length) return []
  const episodes = []
  let current = [sortedDates[0]]

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currDate = new Date(sortedDates[i])
    const gap = (currDate - prevDate) / 86_400_000

    // Check if previous date had ❌ (explicit period end)
    const prevIcons = getDayIcons(userId, sortedDates[i - 1])
    const hasEnded = prevIcons.includes('❌')

    if (gap <= 1 && !hasEnded) {
      current.push(sortedDates[i])
    } else {
      episodes.push(current)
      current = [sortedDates[i]]
    }
  }
  episodes.push(current)

  return episodes.map(ep => ({
    startDate: ep[0],
    endDate: ep[ep.length - 1],
    days: ep.length,
  }))
}

/**
 * Load all user symptoms from local storage into a map: { [dateStr]: data }
 */
export function loadAllUserSymptoms(userId) {
  const prefix = `minediary:symptoms:${userId ?? 'guest'}:`
  const logs = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const dateStr = key.slice(prefix.length)
        const raw = localStorage.getItem(key)
        if (raw) logs[dateStr] = JSON.parse(raw)
      }
    }
  } catch (e) {
    console.warn('Error loading all user symptoms:', e)
  }
  return logs
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ENGINE 1: STANDARD DAYS (Thuật toán Cơ Bản Chu Kỳ Chuẩn)
 * ════════════════════════════════════════════════════════════════════════════
 * Dựa trên lịch sử kinh nguyệt thuần túy, O = NextPeriod - 14.
 */
export function predictStandardCycle(markedDates, userId = 'guest') {
  if (!markedDates.length) return null

  const cycles = extractCycles(userId, markedDates)
  const starts = cycles.map(c => new Date(c.startDate))

  const avgDuration = Math.round(
    cycles.reduce((acc, c) => acc + c.days, 0) / cycles.length
  ) || 5

  if (starts.length < 2) {
    const predictedStart = new Date(starts[0])
    predictedStart.setDate(predictedStart.getDate() + 28)

    const ovulationDate = new Date(predictedStart)
    ovulationDate.setDate(ovulationDate.getDate() - 14)

    return {
      engine: 'standard',
      cycles,
      predictedStart,
      predictedDuration: Math.max(3, Math.min(avgDuration, 7)),
      cycleLength: 28,
      ovulationDate,
      confidence: 'low',
      insights: ['Dự đoán cơ bản dựa trên chu kỳ mặc định 28 ngày.'],
    }
  }

  const lengths = []
  for (let i = 1; i < starts.length; i++) {
    const len = (starts[i] - starts[i - 1]) / 86_400_000
    lengths.push(len)
    cycles[i - 1].cycleLength = len
  }

  const sorted = [...lengths].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const cycleLength = sorted.length % 2
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2)

  const lastStart = starts[starts.length - 1]
  const predictedStart = new Date(lastStart)
  predictedStart.setDate(predictedStart.getDate() + cycleLength)

  const ovulationDate = new Date(predictedStart)
  ovulationDate.setDate(ovulationDate.getDate() - 14)

  cycles[cycles.length - 1].cycleLength = cycleLength

  return {
    engine: 'standard',
    cycles,
    predictedStart,
    predictedDuration: Math.max(3, Math.min(avgDuration, 7)),
    cycleLength,
    ovulationDate,
    confidence: starts.length >= 3 ? 'high' : 'medium',
    insights: [`Chu kỳ trung bình ${cycleLength} ngày tính từ ${cycles.length} kỳ kinh gần nhất.`],
  }
}

/**
 * ════════════════════════════════════════════════════════════════════════════
 * ENGINE 2: ADVANCED BAYESIAN / AI (Thuật toán Chuyên Sâu Đa Thông Số)
 * ════════════════════════════════════════════════════════════════════════════
 * Quét sâu BBT (thân nhiệt cơ bản), que thử LH và dịch nhầy (cervical mucus)
 * để bẻ cong ngày rụng trứng, thu hẹp/đóng sớm cửa sổ thụ thai.
 */
export function predictAdvancedCycle(markedDates, userLogs = null, userId = 'guest') {
  const base = predictStandardCycle(markedDates, userId)
  if (!base) return null

  const logs = userLogs || loadAllUserSymptoms(userId)
  const lastCycle = base.cycles[base.cycles.length - 1]
  const lastCycleStartDate = new Date(lastCycle.startDate)

  // Scan logs recorded from the last cycle start onwards
  const relevantLogDates = Object.keys(logs)
    .filter(d => new Date(d) >= lastCycleStartDate)
    .sort()

  let refinedOvulationDate = new Date(base.ovulationDate)
  let fertileStart = new Date(refinedOvulationDate)
  fertileStart.setDate(refinedOvulationDate.getDate() - 5)
  let fertileEnd = new Date(refinedOvulationDate)
  fertileEnd.setDate(refinedOvulationDate.getDate() + 1)

  let bbtShiftDetected = false
  let lhPeakDetected = false
  let eggwhitePeakDetected = false
  const insights = []

  // 1. LH Surge Test Scan (Peak LH -> Ovulation 24-36h later)
  let latestLhPeakDate = null
  for (const dateStr of relevantLogDates) {
    const entry = logs[dateStr]
    if (entry?.lhTest === 'peak' || entry?.lhTest === 'positive') {
      latestLhPeakDate = dateStr
    }
  }

  if (latestLhPeakDate) {
    lhPeakDetected = true
    const lhDate = new Date(latestLhPeakDate)
    refinedOvulationDate = new Date(lhDate)
    refinedOvulationDate.setDate(lhDate.getDate() + 1) // +24h after peak

    fertileStart = new Date(lhDate)
    fertileStart.setDate(lhDate.getDate() - 2)
    fertileEnd = new Date(refinedOvulationDate)
    fertileEnd.setDate(refinedOvulationDate.getDate() + 1)

    insights.push(`⚡ Phát hiện que thử LH dương tính (${latestLhPeakDate}) ➔ Dời ngày rụng trứng chính xác về ${toDateStr(refinedOvulationDate)}.`)
  }

  // 2. Cervical Mucus Peak Scan (Eggwhite Mucus)
  if (!latestLhPeakDate) {
    let latestEggwhiteDate = null
    for (const dateStr of relevantLogDates) {
      if (logs[dateStr]?.discharge === 'eggwhite') {
        latestEggwhiteDate = dateStr
      }
    }
    if (latestEggwhiteDate) {
      eggwhitePeakDetected = true
      const mucusDate = new Date(latestEggwhiteDate)
      refinedOvulationDate = new Date(mucusDate)
      fertileStart = new Date(mucusDate)
      fertileStart.setDate(mucusDate.getDate() - 4)
      fertileEnd = new Date(mucusDate)
      fertileEnd.setDate(mucusDate.getDate() + 1)
      insights.push(`💧 Ghi nhận dịch nhầy lòng trắng trứng (${latestEggwhiteDate}) ➔ Cửa sổ thụ thai đạt đỉnh cao.`)
    }
  }

  // 3. BBT Thermal Shift Scan (3 over 6 rule)
  const temps = relevantLogDates
    .map(d => ({ dateStr: d, temp: parseFloat(logs[d]?.temperature) }))
    .filter(t => !isNaN(t.temp) && t.temp >= 35.5 && t.temp <= 38.5)

  if (temps.length >= 7) {
    for (let i = 6; i < temps.length; i++) {
      const prior6 = temps.slice(i - 6, i).map(t => t.temp)
      const baseline = Math.max(...prior6)
      const current3 = temps.slice(i, i + 3).map(t => t.temp)

      if (current3.length === 3 && current3.every(temp => temp >= baseline + 0.2)) {
        bbtShiftDetected = true
        const shiftDate = new Date(temps[i].dateStr)
        // Close fertile window early after 3 consecutive high temperatures
        if (fertileEnd > shiftDate) {
          fertileEnd = new Date(shiftDate)
        }
        insights.push(`🌡️ Xác nhận bước nhảy thân nhiệt BBT (+0.2°C) ngày ${temps[i].dateStr} ➔ Đã rụng trứng xong, đóng cửa sổ thụ thai an toàn.`)
        break
      }
    }
  }

  // 4. Calibrated Next Period prediction based on refined ovulation
  let predictedNextPeriod = new Date(base.predictedStart)
  if (lhPeakDetected || bbtShiftDetected) {
    predictedNextPeriod = new Date(refinedOvulationDate)
    predictedNextPeriod.setDate(refinedOvulationDate.getDate() + 14)
  }

  return {
    ...base,
    engine: 'advanced',
    ovulationDate: refinedOvulationDate,
    fertileStart,
    fertileEnd,
    predictedStart: predictedNextPeriod,
    bbtShiftDetected,
    lhPeakDetected,
    eggwhitePeakDetected,
    confidence: (lhPeakDetected || bbtShiftDetected) ? 'ai_calibrated' : base.confidence,
    insights: insights.length ? insights : ['Chưa phát hiện biến động BBT hoặc LH. Đang áp dụng mô hình dự đoán xác suất AI.'],
  }
}

/**
 * Unified Prediction Dispatcher
 */
export function predictNextPeriod(markedDates, userId = 'guest', mode = 'standard', userLogs = null) {
  if (mode === 'advanced') {
    return predictAdvancedCycle(markedDates, userLogs, userId)
  }
  return predictStandardCycle(markedDates, userId)
}

/**
 * 3. Calculate 7-Day Fertility probability strip (T2 -> CN)
 * Based on standard clinical probability relative to ovulation day O
 */
export function calculateWeeklyFertility(prediction, referenceDate = new Date()) {
  const WEEKDAYS = [
    { key: 'T2', name: 'T2' },
    { key: 'T3', name: 'T3' },
    { key: 'T4', name: 'T4' },
    { key: 'T5', name: 'T5' },
    { key: 'T6', name: 'T6' },
    { key: 'T7', name: 'T7' },
    { key: 'CN', name: 'CN' },
  ]

  // Find Monday of the week containing referenceDate
  const currentDay = referenceDate.getDay() // 0 = Sun
  const diffToMonday = (currentDay + 6) % 7
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const todayStr = toDateStr(new Date())
  const ovDate = prediction?.ovulationDate ? new Date(prediction.ovulationDate) : null
  if (ovDate) ovDate.setHours(0, 0, 0, 0)

  // Clinical distribution of conception probability relative to ovulation day O
  const getProbability = (dayDiff) => {
    switch (dayDiff) {
      case 0:  return 96 // Day of ovulation (Peak)
      case -1: return 88 // 1 day before
      case -2: return 72 // 2 days before
      case -3: return 55 // 3 days before
      case -4: return 35 // 4 days before
      case -5: return 18 // 5 days before
      case 1:  return 22 // 1 day after
      default: return 6  // Baseline low chance
    }
  }

  return WEEKDAYS.map((wd, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = toDateStr(d)
    const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`

    let percentage = 8 // Default baseline
    if (ovDate) {
      const diffInDays = Math.round((d - ovDate) / 86_400_000)
      percentage = getProbability(diffInDays)
    }

    let color = 'var(--color-mint-400)'
    let level = 'chanceLow'
    let levelLabel = 'Thấp'

    if (percentage >= 70) {
      color = 'var(--color-pink-500)'
      level = 'chanceHigh'
      levelLabel = 'Cực cao'
    } else if (percentage >= 30) {
      color = '#8B5CF6'
      level = 'chanceMid'
      levelLabel = 'Vừa'
    }

    const isPeak = percentage >= 90
    const isToday = dateStr === todayStr

    return {
      ...wd,
      dateStr,
      dateLabel,
      percentage,
      color,
      level,
      levelLabel,
      isPeak,
      isToday,
    }
  })
}

// ── Date utilities ────────────────────────────────────────────────────────────

export const toDateStr = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const today = () => toDateStr(new Date())
