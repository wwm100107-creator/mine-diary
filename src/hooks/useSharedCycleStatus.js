/**
 * src/hooks/useSharedCycleStatus.js
 * Global Real-time Hook for Navbar & Partner Cycle Synchronization
 * Ponytail style: minimal reactive listener, memoized state, instant re-render.
 */

import { useState, useEffect } from 'react'
import { subscribeToUserRelationships, getUser } from '../lib/social'

export function useSharedCycleStatus(user) {
  const [hasSharedCycleAccess, setHasSharedCycleAccess] = useState(false)
  const [partnerUser, setPartnerUser] = useState(null)
  const [sharedRelationship, setSharedRelationship] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setHasSharedCycleAccess(false)
      setPartnerUser(null)
      setSharedRelationship(null)
      setLoading(false)
      return
    }

    // Subscribe to all relationships of current user in real time
    const unsubscribe = subscribeToUserRelationships(user.id, async (relationships) => {
      try {
        // Find all accepted relationships where cycle data sharing is enabled
        const activeSharedRels = relationships.filter(
          (r) => r.status === 'accepted' && Boolean(r.isCycleShared || r.shareCycleData)
        )

        if (activeSharedRels.length === 0) {
          setHasSharedCycleAccess(false)
          setPartnerUser(null)
          setSharedRelationship(null)
          setLoading(false)
          return
        }

        // Check if any partner is female
        let foundFemalePartner = null
        let foundRel = null

        for (const rel of activeSharedRels) {
          const partnerId = rel.participants?.find((p) => p !== user.id)
          if (!partnerId) continue

          const pUser = await getUser(partnerId)
          // Female or default undefined female cycle
          if (pUser && (pUser.gender === 'female' || !pUser.gender)) {
            foundFemalePartner = pUser
            foundRel = rel
            break
          }
        }

        if (foundFemalePartner && foundRel) {
          setHasSharedCycleAccess(true)
          setPartnerUser(foundFemalePartner)
          setSharedRelationship(foundRel)
        } else {
          setHasSharedCycleAccess(false)
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
    partnerUser,
    sharedRelationship,
    loading,
  }
}
