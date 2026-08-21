import { useState, useEffect, useMemo } from 'react'
import {
  getUser,
  subscribeToRelationship,
  subscribeToPartnerCycleData,
} from '../lib/social'
import { predictNextPeriod } from '../utils/cycle'

/**
 * Hook to retrieve and calculate partner's cycle & health data
 * @param {string} currentUserId - Logged in user ID
 * @param {string} partnerId - Partner user ID
 */
export function usePartnerCycleData(currentUserId, partnerId) {
  const [partnerUser, setPartnerUser] = useState(null)
  const [relationship, setRelationship] = useState(null)
  const [cycleData, setCycleData] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Fetch Partner user profile
  useEffect(() => {
    if (!partnerId) {
      setPartnerUser(null)
      return
    }
    getUser(partnerId)
      .then((u) => setPartnerUser(u))
      .catch(console.error)
  }, [partnerId])

  // 2. Subscribe to Relationship Status
  useEffect(() => {
    if (!currentUserId || !partnerId) {
      setRelationship(null)
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToRelationship(currentUserId, partnerId, (rel) => {
      setRelationship(rel)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [currentUserId, partnerId])

  // 3. Check if partner granted permission to share cycle data
  const hasPermission = useMemo(() => {
    if (!relationship || relationship.status !== 'accepted') return false
    return Boolean(relationship.isCycleShared || relationship.shareCycleData)
  }, [relationship])

  // 4. Subscribe to partner's cycle data if authorized
  useEffect(() => {
    if (!hasPermission || !partnerId) {
      setCycleData(null)
      return
    }

    const unsubscribe = subscribeToPartnerCycleData(partnerId, (data) => {
      setCycleData(data)
    })
    return () => unsubscribe()
  }, [hasPermission, partnerId])

  const markedDates = useMemo(() => cycleData?.markedDates || [], [cycleData])
  const symptoms = useMemo(() => cycleData?.symptoms || {}, [cycleData])
  const customIcons = useMemo(() => cycleData?.customIcons || [], [cycleData])
  const dayIconMap = useMemo(() => cycleData?.dayIconMap || {}, [cycleData])

  // 5. Calculate real-time period & ovulation prediction
  const prediction = useMemo(() => {
    if (!markedDates.length) return null
    return predictNextPeriod(
      markedDates,
      partnerId,
      partnerUser?.predictionMode || 'standard',
      symptoms,
      dayIconMap
    )
  }, [markedDates, partnerId, partnerUser?.predictionMode, symptoms, dayIconMap])


  return {
    hasPermission,
    partnerUser,
    relationship,
    prediction,
    markedDates,
    symptoms,
    customIcons,
    dayIconMap,
    loading,
  }
}

