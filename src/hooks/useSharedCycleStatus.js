/**
 * src/hooks/useSharedCycleStatus.js
 * Global Real-time Hook for Navbar & Partner Cycle Synchronization
 * Ponytail style: minimal reactive listener, auto-healing, memoized state, instant re-render.
 */

import { useState, useEffect } from 'react'
import { subscribeToUserRelationships, getUser, updateRelationshipCycleSharing } from '../lib/social'

export function useSharedCycleStatus(user) {
  const [hasSharedCycleAccess, setHasSharedCycleAccess] = useState(false)
  const [sharedFemalePartners, setSharedFemalePartners] = useState([])
  const [partnerUser, setPartnerUser] = useState(null)
  const [sharedRelationship, setSharedRelationship] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setHasSharedCycleAccess(false)
      setSharedFemalePartners([])
      setPartnerUser(null)
      setSharedRelationship(null)
      setLoading(false)
      return
    }

    // Subscribe to all relationships of current user in real time
    const unsubscribe = subscribeToUserRelationships(user.id, async (relationships) => {
      try {
        const acceptedRels = relationships.filter((r) => r.status === 'accepted')

        if (acceptedRels.length === 0) {
          setHasSharedCycleAccess(false)
          setSharedFemalePartners([])
          setPartnerUser(null)
          setSharedRelationship(null)
          setLoading(false)
          return
        }

        // Check all accepted relationships to find all female partners who shared their cycle
        const validFemalePartners = []

        for (const rel of acceptedRels) {
          const partnerId = rel.participants?.find((p) => p !== user.id)
          if (!partnerId) continue

          const pUser = await getUser(partnerId)
          if (!pUser) continue

          const isPartnerFemale = pUser.gender === 'female' || !pUser.gender
          const isExplicitlyShared = Boolean(rel.isCycleShared || rel.shareCycleData)

          // If partner is Female and either:
          // 1. isCycleShared is true
          // 2. Or is a couple relationship (auto-healing legacy overwrite)
          if (isPartnerFemale && (isExplicitlyShared || rel.type === 'couple')) {
            validFemalePartners.push({
              partnerUser: pUser,
              relationship: rel,
            })

            // Auto-heal relationship in database if isCycleShared was false
            if (!isExplicitlyShared) {
              updateRelationshipCycleSharing(rel.id, true).catch(() => {})
            }
          }
        }

        if (validFemalePartners.length > 0) {
          setHasSharedCycleAccess(true)
          setSharedFemalePartners(validFemalePartners)
          setPartnerUser(validFemalePartners[0].partnerUser)
          setSharedRelationship(validFemalePartners[0].relationship)
        } else {
          setHasSharedCycleAccess(false)
          setSharedFemalePartners([])
          setPartnerUser(null)
          setSharedRelationship(null)
        }
      } catch (err) {
        console.warn('[useSharedCycleStatus] Sync error:', err)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [user?.id])

  return {
    hasSharedCycleAccess,
    sharedFemalePartners,
    partnerUser,
    sharedRelationship,
    loading,
  }
}
