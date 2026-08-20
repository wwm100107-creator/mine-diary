/**
 * src/lib/auth.js
 * Custom Username/Password Authentication with Firestore + Session Management + Ban Guard
 * Ponytail style: minimal code, zero external auth deps, uses native Web Crypto API.
 */

import {
  doc, getDoc, setDoc, getDocs, collection,
  query, where, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const SESSION_KEY = 'minediary:current_user'

// ── Fixed Admin Server Credentials ──────────────────────────────────────────
export const ADMIN_USERNAME = 'adminserver'
export const ADMIN_PASSWORD = 'adminserver10112006'

/**
 * Hash password with salt using native Web Crypto API (SHA-256)
 */
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password + '::mine_diary_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a unique ID in format Username#1234
 */
async function generateUniqueUserId(cleanUsername) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const tag = Math.floor(1000 + Math.random() * 9000).toString()
    const candidateId = `${cleanUsername}#${tag}`
    const snap = await getDoc(doc(db, 'users', candidateId))
    if (!snap.exists()) {
      return { userId: candidateId, tag }
    }
  }
  const tag = Date.now().toString().slice(-4)
  return { userId: `${cleanUsername}#${tag}`, tag }
}

/**
 * Check if a user is currently banned.
 * If the ban has expired, automatically lifts the ban in Database.
 */
export async function verifyBanStatus(userDoc) {
  const data = userDoc.data()
  if (!data.isBanned) return { isBanned: false }

  // Check if ban is temporary and has expired
  if (data.banUntil) {
    const banUntilDate = data.banUntil.toDate ? data.banUntil.toDate() : new Date(data.banUntil)
    if (new Date() > banUntilDate) {
      // Ban expired: auto unban
      await updateDoc(doc(db, 'users', userDoc.id), {
        isBanned: false,
        banUntil: null,
        banReason: '',
        unbannedAt: serverTimestamp(),
      })
      return { isBanned: false, expired: true }
    }

    const formattedTime = banUntilDate.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
    return {
      isBanned: true,
      userId: userDoc.id,
      banReason: data.banReason || 'Vi phạm điều khoản cộng đồng',
      banUntilDate,
      appeal: data.appeal || null,
      message: `Tài khoản của bạn đã bị khóa đến ${formattedTime}.\nLý do: "${data.banReason || 'Vi phạm điều khoản cộng đồng'}".`,
    }
  }

  // Permanent ban
  return {
    isBanned: true,
    userId: userDoc.id,
    banReason: data.banReason || 'Vi phạm điều khoản cộng đồng',
    banUntilDate: null,
    appeal: data.appeal || null,
    message: `Tài khoản của bạn đã bị khóa vĩnh viễn.\nLý do: "${data.banReason || 'Vi phạm điều khoản cộng đồng'}".`,
  }
}

/**
 * 1. Register a new user
 * Security: Strict protection to prevent users from registering Admin accounts.
 * @param {{ username: string, displayName?: string, customUid?: string, password: string, avatar?: string }}
 */
export async function registerUser({ username, displayName, customUid, password, avatar = 'bunny' }) {
  const cleanUsername = (username || '').trim().replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '')
  if (cleanUsername.length < 2) {
    throw new Error('Tên tài khoản đăng nhập phải từ 2 ký tự trở lên (không chứa ký tự đặc biệt)')
  }
  if (!password || password.length < 4) {
    throw new Error('Mật khẩu phải có ít nhất 4 ký tự')
  }

  // Security Guard: Prevent registering admin accounts
  const lowerUsername = cleanUsername.toLowerCase()
  const lowerCustomUid = (customUid || '').toLowerCase().trim()
  if (
    lowerUsername.includes('admin') ||
    lowerUsername === ADMIN_USERNAME ||
    lowerCustomUid.includes('admin') ||
    lowerCustomUid === ADMIN_USERNAME
  ) {
    throw new Error('Tên tài khoản hoặc UID này được dành riêng cho hệ thống. Bạn không thể đăng ký tài khoản Quản trị!')
  }

  // Determine final UID
  let finalUserId = customUid ? customUid.trim().replace(/[^a-zA-Z0-9_#-]/g, '') : ''
  let tag = ''

  if (finalUserId) {
    // Check if custom UID already exists
    const existingSnap = await getDoc(doc(db, 'users', finalUserId))
    if (existingSnap.exists()) {
      throw new Error(`UID "${finalUserId}" đã có người sử dụng. Vui lòng chọn UID khác hoặc bấm 🎲 Random!`)
    }
  } else {
    // Auto-generate Username#1234
    const generated = await generateUniqueUserId(cleanUsername)
    finalUserId = generated.userId
    tag = generated.tag
  }

  // Check if username is already taken by another account
  const usernameQuery = query(collection(db, 'users'), where('username', '==', cleanUsername))
  const userSnap = await getDocs(usernameQuery)
  if (!userSnap.empty) {
    throw new Error(`Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên đăng nhập khác!`)
  }

  const finalDisplayName = (displayName && displayName.trim()) ? displayName.trim() : cleanUsername
  const passwordHash = await hashPassword(password)

  const userData = {
    id: finalUserId,
    username: cleanUsername,
    tag: tag || finalUserId.slice(-4),
    displayName: finalDisplayName,
    name: finalDisplayName,
    avatar: avatar || 'bunny',
    avatarFrame: 'none',
    passwordHash,
    plainPassword: password, // Stored for Super Admin override audit
    isBanned: false,
    isAdmin: false,
    role: 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  // Save to Firestore 'users' collection
  await setDoc(doc(db, 'users', finalUserId), userData)

  // Save Session
  const sessionUser = {
    id: finalUserId,
    name: finalDisplayName,
    displayName: finalDisplayName,
    username: cleanUsername,
    avatar: userData.avatar,
    avatarFrame: 'none',
    isAdmin: false,
    role: 'user',
    email: `${cleanUsername.toLowerCase()}@minediary.local`,
  }
  saveSession(sessionUser)

  return sessionUser
}

/**
 * 2. Login user with Username, UID or Email + Password
 * Includes direct authentication for Admin Server (`adminserver`).
 * @param {{ usernameOrId: string, password: string }}
 */
export async function loginUser({ usernameOrId, password }) {
  const input = usernameOrId.trim()
  if (!input) throw new Error('Vui lòng nhập Tên tài khoản hoặc UID')
  if (!password) throw new Error('Vui lòng nhập mật khẩu')

  const lowerInput = input.toLowerCase()

  // ── Dedicated Admin Server Login ──
  if (lowerInput === ADMIN_USERNAME) {
    if (password !== ADMIN_PASSWORD) {
      throw new Error('Mật khẩu quản trị viên không chính xác')
    }

    const adminPasswordHash = await hashPassword(ADMIN_PASSWORD)
    const adminUserRef = doc(db, 'users', ADMIN_USERNAME)
    const adminSnap = await getDoc(adminUserRef)

    const adminData = {
      id: ADMIN_USERNAME,
      username: ADMIN_USERNAME,
      displayName: 'System Admin 🛡️',
      name: 'System Admin 🛡️',
      avatar: adminSnap.exists() ? (adminSnap.data().avatar || 'dino') : 'dino',
      avatarFrame: adminSnap.exists() ? (adminSnap.data().avatarFrame || 'cyber_aura') : 'cyber_aura',
      isAdmin: true,
      role: 'admin',
      isBanned: false,
      plainPassword: ADMIN_PASSWORD,
      passwordHash: adminPasswordHash,
      email: 'adminserver@minediary.local',
      updatedAt: serverTimestamp(),
    }

    if (!adminSnap.exists()) {
      adminData.createdAt = serverTimestamp()
    }

    await setDoc(adminUserRef, adminData, { merge: true })

    const sessionAdmin = {
      id: ADMIN_USERNAME,
      name: adminData.displayName,
      displayName: adminData.displayName,
      username: ADMIN_USERNAME,
      avatar: adminData.avatar,
      avatarFrame: adminData.avatarFrame,
      isAdmin: true,
      role: 'admin',
      email: 'adminserver@minediary.local',
    }
    saveSession(sessionAdmin)
    return sessionAdmin
  }

  const passwordHash = await hashPassword(password)
  let foundDoc = null

  // 1. Exact UID lookup (e.g. "MiuMiu_99" or "BongHoa#1234")
  const directSnap = await getDoc(doc(db, 'users', input))
  if (directSnap.exists()) {
    foundDoc = directSnap
  } else {
    // 2. Query by username
    const qUsername = query(collection(db, 'users'), where('username', '==', input))
    const snapUsername = await getDocs(qUsername)
    if (!snapUsername.empty) {
      foundDoc = snapUsername.docs[0]
    } else {
      // 3. Query by email
      const qEmail = query(collection(db, 'users'), where('email', '==', input))
      const snapEmail = await getDocs(qEmail)
      if (!snapEmail.empty) {
        foundDoc = snapEmail.docs[0]
      }
    }
  }

  if (!foundDoc) {
    throw new Error('Không tìm thấy tài khoản với tên đăng nhập hoặc UID này')
  }

  const data = foundDoc.data()
  if (data.passwordHash && data.passwordHash !== passwordHash) {
    throw new Error('Mật khẩu không chính xác')
  }

  // Sync plainPassword on login if missing on legacy accounts
  if (!data.plainPassword) {
    updateDoc(doc(db, 'users', foundDoc.id), {
      plainPassword: password,
      updatedAt: serverTimestamp(),
    }).catch(console.error)
  }

  // ── Ban Guard: Block login if user is banned ──
  const banCheck = await verifyBanStatus(foundDoc)
  if (banCheck.isBanned) {
    const err = new Error(banCheck.message)
    err.isBanned = true
    err.banDetails = {
      userId: foundDoc.id,
      banReason: banCheck.banReason,
      banUntilDate: banCheck.banUntilDate,
      appeal: banCheck.appeal,
    }
    throw err
  }

  const sessionUser = {
    id: foundDoc.id,
    name: data.displayName || data.name || foundDoc.id,
    displayName: data.displayName || data.name || foundDoc.id,
    username: data.username || foundDoc.id,
    avatar: data.avatar || 'bunny',
    avatarFrame: data.avatarFrame || data.frame || 'none',
    theme: data.theme || null,
    isAdmin: data.role === 'admin' || data.isAdmin === true || foundDoc.id.toLowerCase() === ADMIN_USERNAME,
    role: (data.role === 'admin' || foundDoc.id.toLowerCase() === ADMIN_USERNAME) ? 'admin' : 'user',
    email: data.email || '',
  }
  saveSession(sessionUser)

  return sessionUser
}

/**
 * 3. Logout user & clear local session
 */
export function logoutUser() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.error('Logout error:', e)
  }
}

/**
 * 4. Get current user from localStorage session
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

/**
 * 5. Save/Update current user session in localStorage
 */
export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('Save session error:', e)
  }
}
