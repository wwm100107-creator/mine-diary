/**
 * src/hooks/useCycleCalendar.js
 * Central Hook for Dual-Engine Cycle & Fertility Prediction
 * Ponytail & Impeccable principles: Single shared data source, reactive caching, clean output.
 */

import { useMemo } from 'react'
import {
  loadMarkedDates,
  loadAllUserSymptoms,
  predictNextPeriod,
  calculateWeeklyFertility,
  toDateStr,
} from '../utils/cycle'

export function useCycleCalendar({
  userId,
  mode = 'standard',
  markedDates = null,
  userLogs = null,
  tick = 0,
}) {
  // 1. Resolve raw marked dates and user logs from shared source if not passed
  const resolvedMarks = useMemo(() => {
    if (Array.isArray(markedDates)) return markedDates
    return loadMarkedDates(userId)
  }, [userId, markedDates, tick])

  const resolvedLogs = useMemo(() => {
    if (userLogs && typeof userLogs === 'object') return userLogs
    return loadAllUserSymptoms(userId)
  }, [userId, userLogs, tick])

  // 2. Execute selected prediction engine
  const prediction = useMemo(() => {
    return predictNextPeriod(resolvedMarks, userId, mode, resolvedLogs)
  }, [resolvedMarks, userId, mode, resolvedLogs])

  // 3. Generate Calendar Sets for Day Rendering
  const predictedPeriodSet = useMemo(() => {
    if (!prediction?.predictedStart) return new Set()
    const set = new Set()
    const duration = prediction.predictedDuration || 5
    for (let i = 0; i < duration; i++) {
      const d = new Date(prediction.predictedStart)
      d.setDate(d.getDate() + i)
      set.add(toDateStr(d))
    }
    return set
  }, [prediction?.predictedStart, prediction?.predictedDuration])

  const fertileSet = useMemo(() => {
    if (!prediction?.ovulationDate) return new Set()
    const set = new Set()

    if (prediction.fertileStart && prediction.fertileEnd) {
      const start = new Date(prediction.fertileStart)
      const end = new Date(prediction.fertileEnd)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        set.add(toDateStr(d))
      }
    } else {
      // Fallback: Ovulation - 5 to Ovulation + 1
      for (let i = -5; i <= 1; i++) {
        const d = new Date(prediction.ovulationDate)
        d.setDate(d.getDate() + i)
        set.add(toDateStr(d))
      }
    }
    return set
  }, [prediction?.ovulationDate, prediction?.fertileStart, prediction?.fertileEnd])

  const ovulationDateStr = useMemo(() => {
    if (!prediction?.ovulationDate) return null
    return toDateStr(new Date(prediction.ovulationDate))
  }, [prediction?.ovulationDate])

  const weeklyFertility = useMemo(() => {
    return calculateWeeklyFertility(prediction)
  }, [prediction])

  return {
    mode: prediction?.engine || mode,
    prediction,
    markedDates: resolvedMarks,
    userLogs: resolvedLogs,
    predictedPeriodSet,
    fertileSet,
    ovulationDateStr,
    weeklyFertility,
    confidence: prediction?.confidence || 'low',
    insights: prediction?.insights || [],
    bbtShiftDetected: Boolean(prediction?.bbtShiftDetected),
    lhPeakDetected: Boolean(prediction?.lhPeakDetected),
    eggwhitePeakDetected: Boolean(prediction?.eggwhitePeakDetected),
  }
}
