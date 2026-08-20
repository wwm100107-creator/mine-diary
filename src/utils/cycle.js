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
 * Predict next period, ovulation day, and fertile window
 * @param {string[]} markedDates - sorted 'YYYY-MM-DD'
 */
export function predictNextPeriod(markedDates, userId = 'guest') {
  if (!markedDates.length) return null

  const cycles = extractCycles(userId, markedDates)
  const starts = cycles.map(c => new Date(c.startDate))

  // Average duration of period bleeding
  const avgDuration = Math.round(
    cycles.reduce((acc, c) => acc + c.days, 0) / cycles.length
  ) || 5

  if (starts.length < 2) {
    const predictedStart = new Date(starts[0])
    predictedStart.setDate(predictedStart.getDate() + 28)

    const ovulationDate = new Date(predictedStart)
    ovulationDate.setDate(ovulationDate.getDate() - 14)

    return {
      cycles,
      predictedStart,
      predictedDuration: Math.max(3, Math.min(avgDuration, 7)),
      cycleLength: 28,
      ovulationDate,
      confidence: 'low',
    }
  }

  // Calculate interval between cycle starts
  const lengths = []
  for (let i = 1; i < starts.length; i++) {
    const len = (starts[i] - starts[i - 1]) / 86_400_000
    lengths.push(len)
    cycles[i - 1].cycleLength = len
  }

  // Median is robust against anomalies
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
    cycles,
    predictedStart,
    predictedDuration: Math.max(3, Math.min(avgDuration, 7)),
    cycleLength,
    ovulationDate,
    confidence: starts.length >= 3 ? 'high' : 'medium',
  }
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
