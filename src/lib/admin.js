/**
 * src/lib/admin.js
 * Admin Management Service & Permissions (Ponytail YAGNI)
 */

import {
  collection, doc, getDocs, updateDoc, setDoc,
  serverTimestamp, Timestamp, orderBy, query,
} from 'firebase/firestore'
import { db } from './firebase'

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
 * 3. Ban a user account (Supports Presets & Custom Duration / Exact Date-Time)
 * @param {{ userId: string, durationDays: number, customBanUntil?: string|Date, reason: string }}
 */
export async function banUser({ userId, durationDays, customBanUntil, reason }) {
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
