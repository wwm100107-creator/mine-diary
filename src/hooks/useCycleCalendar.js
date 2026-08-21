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
  dayIconMap = null,
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
    return predictNextPeriod(resolvedMarks, userId, mode, resolvedLogs, dayIconMap)
  }, [resolvedMarks, userId, mode, resolvedLogs, dayIconMap])


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

  // 4. ── Advanced AI: 3-level day coloring map ─────────────────────────────
  // Returns: Map<dateStr, 'peak' | 'high' | 'low'>
  // Standard mode: empty map (uses plain fertileSet coloring instead)
  const dayLevelMap = useMemo(() => {
    if (mode !== 'advanced' || !prediction?.ovulationDate) return new Map()

    const map = new Map()
    const ovStr = toDateStr(new Date(prediction.ovulationDate))

    // Walk every day in the fertile window and assign levels
    for (const dateStr of fertileSet) {
      const d = new Date(dateStr)
      const ov = new Date(prediction.ovulationDate)
      ov.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((d - ov) / 86_400_000) // days relative to ovulation

      // Default probabilistic level (Standard Days logic inside Advanced)
      let level = 'low'
      if (diff === 0 || diff === -1) level = 'peak'       // O, O-1 → peak
      else if (diff >= -3 && diff <= 1) level = 'high'    // O-3..O+1 → high
      else level = 'low'                                   // outer days → low

      map.set(dateStr, level)
    }

    // LH Peak override: LH peak day + next day → force 'peak'
    if (prediction.lhPeakDetected) {
      // Find the LH peak day from logs (scan resolvedLogs)
      for (const [dateStr, entry] of Object.entries(resolvedLogs)) {
        if (entry?.lhTest === 'peak' || entry?.lhTest === 'positive') {
          map.set(dateStr, 'peak')
          // next day
          const next = new Date(dateStr)
          next.setDate(next.getDate() + 1)
          map.set(toDateStr(next), 'peak')
        }
      }
    }

    // BBT shift override: days AFTER confirmed shift → downgrade to 'low' (window closed)
    if (prediction.bbtShiftDetected) {
      // Find first BBT shift date from logs using same 3-over-6 logic result
      // Cheapest: use fertileEnd as the cutoff (already computed in Engine 2)
      if (prediction.fertileEnd) {
        const cutoff = toDateStr(new Date(prediction.fertileEnd))
        for (const [dateStr] of map) {
          if (dateStr > cutoff) {
            map.set(dateStr, 'low')
          }
        }
      }
    }

    return map
  }, [mode, prediction, fertileSet, resolvedLogs])

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
    dayLevelMap,
    ovulationDateStr,
    weeklyFertility,
    confidence: prediction?.confidence || 'low',
    insights: prediction?.insights || [],
    bbtShiftDetected: Boolean(prediction?.bbtShiftDetected),
    lhPeakDetected: Boolean(prediction?.lhPeakDetected),
    eggwhitePeakDetected: Boolean(prediction?.eggwhitePeakDetected),
  }
}
