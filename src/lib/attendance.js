/**
 * src/lib/attendance.js
 * 30-Day Attendance Service with Auto VIP Tier Upgrades
 */

import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'
import { VIP_TIERS } from '../utils/vipTiers'
import { saveSession } from './auth'

function getTodayStr() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Synchronize attendance claimedDays and streak with user's current VIP tier
 * Ensures users granted VIP by Admin automatically have completed tick marks for previous days
 * @param {Object} user
 * @returns {Object} synchronized attendance object
 */
export function syncVipAttendanceProgress(user) {
  if (!user) return { streak: 0, lastCheckInDate: null, claimedDays: [] }

  const vipTier = (user.vipTier || 'normal').toLowerCase()
  const reqDays = VIP_TIERS[vipTier]?.reqDays || 0
  const currentAttendance = user.attendance || { streak: 0, lastCheckInDate: null, claimedDays: [] }
  const existingClaimed = new Set(currentAttendance.claimedDays || [])

  // Auto-fill all required days up to reqDays
  for (let d = 1; d <= reqDays; d++) {
    existingClaimed.add(d)
  }

  const finalClaimedDays = Array.from(existingClaimed).sort((a, b) => a - b)
  const finalStreak = Math.max(currentAttendance.streak || 0, reqDays)

  return {
    ...currentAttendance,
    streak: finalStreak,
    claimedDays: finalClaimedDays,
  }
}

/**
 * Check if the user has already checked in today
 */
export function canCheckInToday(user) {
  if (!user?.id) return false
  const todayStr = getTodayStr()
  const lastCheckIn = user.attendance?.lastCheckInDate
  return lastCheckIn !== todayStr
}

/**
 * Perform Daily Check-in & Claim Rewards
 */
export async function claimDailyAttendance(user) {
  if (!user?.id) throw new Error('Vui lòng đăng nhập để điểm danh!')

  const todayStr = getTodayStr()
  const userRef = doc(db, 'users', user.id)
  const snap = await getDoc(userRef)
  const data = snap.exists() ? snap.data() : {}

  const currentAttendance = data.attendance || {
    streak: 0,
    lastCheckInDate: null,
    claimedDays: [],
  }

  if (currentAttendance.lastCheckInDate === todayStr) {
    throw new Error('Hôm nay bạn đã điểm danh rồi! Hãy quay lại vào ngày mai nhé ✨')
  }

  const newStreak = (currentAttendance.streak || 0) + 1
  const targetDay = Math.min(newStreak, 30)
  const newClaimedDays = Array.from(new Set([...(currentAttendance.claimedDays || []), targetDay]))

  // Check if targetDay triggers a VIP Tier upgrade
  let newVipTier = data.vipTier || user.vipTier || 'normal'
  const currentRank = VIP_TIERS[newVipTier]?.rank || 0

  if (targetDay >= 30 && currentRank < 4) {
    newVipTier = 'god'
  } else if (targetDay >= 14 && currentRank < 3) {
    newVipTier = 'sssvip'
  } else if (targetDay >= 7 && currentRank < 2) {
    newVipTier = 'ssvip'
  } else if (targetDay >= 1 && currentRank < 1) {
    newVipTier = 'svip'
  }

  const updatedAttendance = {
    streak: newStreak,
    lastCheckInDate: todayStr,
    claimedDays: newClaimedDays,
    lastClaimedAt: serverTimestamp(),
  }

  await updateDoc(userRef, {
    attendance: updatedAttendance,
    vipTier: newVipTier,
    updatedAt: serverTimestamp(),
  })

  // Update active session
  const updatedUser = {
    ...user,
    attendance: {
      ...updatedAttendance,
      lastCheckInDate: todayStr,
    },
    vipTier: newVipTier,
  }
  saveSession(updatedUser)

  return {
    dayClaimed: targetDay,
    vipTier: newVipTier,
    unlockedNewTier: newVipTier !== (data.vipTier || 'normal'),
    updatedUser,
  }
}
