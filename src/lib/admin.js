/**
 * src/lib/admin.js
 * Admin Management Service & Permissions (Ponytail YAGNI)
 */

import {
  collection, doc, getDoc, getDocs, updateDoc, setDoc, deleteDoc,
  serverTimestamp, Timestamp, orderBy, query, where, onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { VIP_TIERS } from '../utils/vipTiers'

/**
 * 1. Verify if a user has Admin privileges
 * Strictly limited to `adminserver` or accounts explicitly granted role 'admin'.
 */
export function isUserAdmin(user) {
  if (!user) return false
  const id = (user.id || '').toLowerCase()
  const username = (user.username || '').toLowerCase()
  
  if (id === 'adminserver' || username === 'adminserver') {
    return true
  }

  if (user.role === 'admin' || user.isAdmin === true) {
    return true
  }

  return false
}

/**
 * 1.1 Check if a user is permanently protected & immune from ban/delete/restriction
 */
export function isProtectedUser(userOrId) {
  if (!userOrId) return false
  const id = (typeof userOrId === 'string' ? userOrId : (userOrId.id || '')).toLowerCase()
  const username = (typeof userOrId === 'object' ? (userOrId.username || '') : '').toLowerCase()
  return id === 'adminserver' || username === 'adminserver' || Boolean(typeof userOrId === 'object' && (userOrId.isProtected || userOrId.isImmune))
}

/**
 * 2. Fetch all user accounts from Database
 */
export async function fetchAllUsers() {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAtDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : null,
      banUntilDate: d.data().banUntil?.toDate ? d.data().banUntil.toDate() : (d.data().banUntil ? new Date(d.data().banUntil) : null),
      appealDate: d.data().appeal?.submittedAt?.toDate ? d.data().appeal.submittedAt.toDate() : null,
    }))
  } catch (err) {
    // Fallback if index not yet ready
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAtDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : null,
      banUntilDate: d.data().banUntil?.toDate ? d.data().banUntil.toDate() : (d.data().banUntil ? new Date(d.data().banUntil) : null),
      appealDate: d.data().appeal?.submittedAt?.toDate ? d.data().appeal.submittedAt.toDate() : null,
    }))
  }
}

/**
 * 2.1 Real-time live listener for all accounts
 */
export function subscribeToAllUsers(callback, onError) {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        const users = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAtDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : null,
          banUntilDate: d.data().banUntil?.toDate ? d.data().banUntil.toDate() : (d.data().banUntil ? new Date(d.data().banUntil) : null),
          appealDate: d.data().appeal?.submittedAt?.toDate ? d.data().appeal.submittedAt.toDate() : null,
        }))
        callback(users)
      },
      (err) => {
        console.warn('subscribeToAllUsers ordered query fallback:', err)
        return onSnapshot(
          collection(db, 'users'),
          (snap) => {
            const users = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
              createdAtDate: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : null,
              banUntilDate: d.data().banUntil?.toDate ? d.data().banUntil.toDate() : (d.data().banUntil ? new Date(d.data().banUntil) : null),
              appealDate: d.data().appeal?.submittedAt?.toDate ? d.data().appeal.submittedAt.toDate() : null,
            }))
            callback(users)
          },
          onError
        )
      }
    )
  } catch (err) {
    if (onError) onError(err)
    return () => {}
  }
}

/**
 * 3. Ban a user account (Supports Presets & Custom Duration / Exact Date-Time)
 * Strictly immune for adminserver.
 * @param {{ userId: string, durationDays: number, customBanUntil?: string|Date, reason: string }}
 */
export async function banUser({ userId, durationDays, customBanUntil, reason }) {
  if (isProtectedUser(userId)) {
    throw new Error('Tài khoản Quản trị viên tối cao (adminserver) là Bất tử, không thể bị khóa hoặc hạn chế!')
  }

  let banUntil = null

  if (customBanUntil) {
    banUntil = new Date(customBanUntil)
  } else if (durationDays > 0) {
    banUntil = new Date(Date.now() + durationDays * 86_400_000)
  }

  const updateData = {
    isBanned: true,
    banReason: reason.trim() || 'Vi phạm điều khoản cộng đồng',
    bannedAt: serverTimestamp(),
    banDurationDays: durationDays,
    banUntil: banUntil ? Timestamp.fromDate(banUntil) : null,
  }

  await updateDoc(doc(db, 'users', userId), updateData)
  return updateData
}

/**
 * 3.1 Delete a user account completely (with cascading cleanup of chats and relationships)
 * Strictly immune for adminserver.
 */
export async function deleteUserAccount(userId) {
  if (isProtectedUser(userId)) {
    throw new Error('Tài khoản Quản trị viên tối cao (adminserver) là Bất tử, không thể bị xóa!')
  }

  // 1. Delete user document
  await deleteDoc(doc(db, 'users', userId))

  // 2. Cascade delete all chat rooms & messages involving this user
  try {
    const qChats = query(collection(db, 'chats'), where('participants', 'array-contains', userId))
    const chatsSnap = await getDocs(qChats)
    for (const cDoc of chatsSnap.docs) {
      // Delete message sub-documents
      const msgsSnap = await getDocs(collection(db, 'chats', cDoc.id, 'messages'))
      for (const mDoc of msgsSnap.docs) {
        await deleteDoc(doc(db, 'chats', cDoc.id, 'messages', mDoc.id))
      }
      await deleteDoc(doc(db, 'chats', cDoc.id))
    }
  } catch (err) {
    console.warn('Cascade delete chats warning:', err)
  }

  // 3. Cascade delete all relationships involving this user
  try {
    const qRels = query(collection(db, 'relationships'), where('participants', 'array-contains', userId))
    const relsSnap = await getDocs(qRels)
    for (const rDoc of relsSnap.docs) {
      await deleteDoc(doc(db, 'relationships', rDoc.id))
    }
  } catch (err) {
    console.warn('Cascade delete relationships warning:', err)
  }

  return true
}

/**
 * 4. Unban a user account
 */
export async function unbanUser(userId) {
  const updateData = {
    isBanned: false,
    banReason: '',
    banUntil: null,
    banDurationDays: 0,
    unbannedAt: serverTimestamp(),
  }

  await updateDoc(doc(db, 'users', userId), updateData)
  return updateData
}

/**
 * 5. Submit Ban Appeal (Called by banned user)
 */
export async function submitBanAppeal({ userId, appealMessage }) {
  const appealData = {
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    message: appealMessage.trim(),
    submittedAt: serverTimestamp(),
  }

  await setDoc(doc(db, 'users', userId), {
    appeal: appealData,
  }, { merge: true })

  return appealData
}

/**
 * 6. Approve Ban Appeal (Unbans user + marks appeal approved)
 */
export async function approveBanAppeal(userId) {
  const updateData = {
    isBanned: false,
    banReason: '',
    banUntil: null,
    banDurationDays: 0,
    unbannedAt: serverTimestamp(),
    'appeal.status': 'approved',
    'appeal.reviewedAt': serverTimestamp(),
  }

  await updateDoc(doc(db, 'users', userId), updateData)
  return true
}

/**
 * 7. Reject Ban Appeal
 */
export async function rejectBanAppeal(userId, note = '') {
  await updateDoc(doc(db, 'users', userId), {
    'appeal.status': 'rejected',
    'appeal.rejectNote': note.trim(),
    'appeal.reviewedAt': serverTimestamp(),
  })
  return true
}

/**
 * 8. Reset user password (Administrative password reset)
 */
export async function resetUserPassword(userId, newPassword) {
  const msgBuffer = new TextEncoder().encode(newPassword + '::mine_diary_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  await updateDoc(doc(db, 'users', userId), {
    passwordHash,
    plainPassword: newPassword,
    updatedAt: serverTimestamp(),
  })
  return true
}

/**
 * 9. Update User VIP Tier (Admin Exclusive)
 * Automatically syncs attendance claimed days and streak corresponding to the required days for that VIP tier
 * @param {string} userId
 * @param {'normal' | 'svip' | 'ssvip' | 'sssvip' | 'god'} newVipTier
 */
export async function updateUserVipTier(userId, newVipTier) {
  const allowedTiers = ['normal', 'svip', 'ssvip', 'sssvip', 'god']
  const targetTier = allowedTiers.includes(newVipTier) ? newVipTier : 'normal'
  const reqDays = VIP_TIERS[targetTier]?.reqDays || 0
  const targetFrameId = VIP_TIERS[targetTier]?.frameId || 'none'

  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  const userData = userSnap.exists() ? userSnap.data() : {}
  const currentAttendance = userData.attendance || { streak: 0, lastCheckInDate: null, claimedDays: [] }

  // Auto-fill all required days up to reqDays
  const existingClaimed = new Set(currentAttendance.claimedDays || [])
  for (let d = 1; d <= reqDays; d++) {
    existingClaimed.add(d)
  }

  const updatedAttendance = {
    ...currentAttendance,
    streak: Math.max(currentAttendance.streak || 0, reqDays),
    claimedDays: Array.from(existingClaimed).sort((a, b) => a - b),
  }

  const updatePayload = {
    vipTier: targetTier,
    attendance: updatedAttendance,
    vipUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  // Auto-equip the newly granted VIP frame if granting a VIP tier
  if (targetFrameId && targetFrameId !== 'none') {
    updatePayload.avatarFrame = targetFrameId
  } else if (targetTier === 'normal') {
    // If downgraded to normal and was wearing a VIP frame, reset frame to none
    if (['god_cosmic', 'vip10_thunder', 'vip9_frost', 'vip8_fire'].includes(userData.avatarFrame)) {
      updatePayload.avatarFrame = 'none'
    }
  }

  await updateDoc(userRef, updatePayload)
  return true
}
