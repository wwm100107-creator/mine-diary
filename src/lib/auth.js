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
import { VIP_TIERS } from '../utils/vipTiers'
import { sendTelegramSecurityAlert } from '../utils/securityAlert'

const SESSION_KEY = 'minediary:current_user'

// ── Fixed Admin Credentials ──────────────────────────────────────────
export const ADMIN_USERNAME = 'adminminediary'
export const ADMIN_PASSWORD = 'Uydeptrai@123'

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
  const uId = userDoc.id.toLowerCase()
  const uName = (data.username || '').toLowerCase()
  // Admin is permanently immune from bans or restrictions
  if (uId === ADMIN_USERNAME || uName === ADMIN_USERNAME || uId === 'adminserver' || uName === 'adminserver') {
    return { isBanned: false }
  }
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
 * @param {{ username: string, displayName?: string, customUid?: string, password: string, avatar?: string, gender?: 'male' | 'female' }}
 */
export async function registerUser({ username, displayName, customUid, password, avatar = 'bunny', avatarFrame = 'none', theme = null, gender }) {
  const cleanUsername = (username || '').trim().replace(/[^a-zA-Z0-9_\u00C0-\u1EF9]/g, '')
  if (cleanUsername.length < 2) {
    throw new Error('Tên tài khoản đăng nhập phải từ 2 ký tự trở lên (không chứa ký tự đặc biệt)')
  }
  if (!password || password.length < 4) {
    throw new Error('Mật khẩu phải có ít nhất 4 ký tự')
  }
  if (!gender || (gender !== 'male' && gender !== 'female')) {
    throw new Error('Vui lòng chọn Giới tính của bạn (Nữ ♀ hoặc Nam ♂)!')
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

  // Determine final UID & validate format [Chữ_6 số]
  let finalUserId = (customUid || '').trim()
  if (finalUserId) {
    // Regex for [Chữ _ 6 số]: Letters/alphanumeric + "_" + exactly 6 digits
    const uidPattern = /^[a-zA-Z0-9\u00C0-\u1EF9]+_\d{6}$/
    if (!uidPattern.test(finalUserId)) {
      throw new Error('UID sai định dạng! Vui lòng nhập theo mẫu [Chữ_6 số] (Ví dụ: ABC_211107).')
    }

    // Check if custom UID already exists
    const existingSnap = await getDoc(doc(db, 'users', finalUserId))
    if (existingSnap.exists()) {
      throw new Error(`UID "${finalUserId}" đã có người sử dụng. Vui lòng chọn UID khác hoặc bấm 🎲 Random!`)
    }
  } else {
    // Auto-generate format [CleanUsername_6digits]
    const randSixDigits = Math.floor(100000 + Math.random() * 900000).toString()
    finalUserId = `${cleanUsername}_${randSixDigits}`
    let existingSnap = await getDoc(doc(db, 'users', finalUserId))
    let tries = 0
    while (existingSnap.exists() && tries < 5) {
      const newDigits = Math.floor(100000 + Math.random() * 900000).toString()
      finalUserId = `${cleanUsername}_${newDigits}`
      existingSnap = await getDoc(doc(db, 'users', finalUserId))
      tries++
    }
  }

  // Check if username is already taken by another account
  const usernameQuery = query(collection(db, 'users'), where('username', '==', cleanUsername))
  const userSnap = await getDocs(usernameQuery)
  if (!userSnap.empty) {
    throw new Error(`Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên đăng nhập khác!`)
  }

  const finalDisplayName = (displayName && displayName.trim()) ? displayName.trim() : cleanUsername
  const passwordHash = await hashPassword(password)
  const finalGender = gender === 'male' ? 'male' : 'female'

  const userData = {
    id: finalUserId,
    username: cleanUsername,
    tag: finalUserId.slice(-6),
    displayName: finalDisplayName,
    name: finalDisplayName,
    avatar: avatar || 'bunny',
    avatarFrame: avatarFrame || 'none',
    theme: theme || null,
    gender: finalGender,
    vipTier: 'normal',
    attendance: {
      streak: 0,
      lastCheckInDate: null,
      claimedDays: [],
    },
    passwordHash,
    plainPassword: password, // Stored for Super Admin override audit
    isBanned: false,
    isAdmin: false,
    role: 'user',
    predictionMode: 'standard',
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
    avatarFrame: userData.avatarFrame,
    theme: userData.theme,
    gender: finalGender,
    vipTier: 'normal',
    predictionMode: 'standard',
    attendance: userData.attendance,
    isAdmin: false,
    role: 'user',
    email: `${cleanUsername.toLowerCase()}@minediary.local`,
  }
  saveSession(sessionUser)

  return sessionUser
}

/**
 * 2. Login user with Username, UID or Email + Password
 * Includes direct authentication for Admin Server (`adminserver`) with 2FA Protection.
 * @param {{ usernameOrId: string, password: string }}
 */
export async function loginUser({ usernameOrId, password }) {
  const input = usernameOrId.trim()
  if (!input) throw new Error('Vui lòng nhập Tên tài khoản hoặc UID')
  if (!password) throw new Error('Vui lòng nhập mật khẩu')

  const lowerInput = input.toLowerCase()

  // ── Dedicated Admin Login with 2FA & Brute-Force Shield ──
  if (lowerInput === ADMIN_USERNAME || lowerInput === 'adminserver') {
    const lockout = getAdminLockoutStatus()
    if (lockout.isLocked) {
      const mins = Math.floor(lockout.remainingSeconds / 60)
      const secs = lockout.remainingSeconds % 60
      throw new Error(`Tài khoản Admin đã bị khóa tạm thời do nhập sai quá nhiều lần. Vui lòng chờ ${mins}m ${secs}s để thử lại.`)
    }

    if (password !== ADMIN_PASSWORD) {
      const failState = recordFailedAdminAttempt()
      const remaining = MAX_ATTEMPTS - failState.attempts
      if (failState.isLocked) {
        sendTelegramSecurityAlert('⚠️ CẢNH BÁO: Phát hiện 5 lần nhập sai mật khẩu Admin liên tiếp! Hệ thống đã tự động khóa đăng nhập Admin trong 15 phút.')
        throw new Error('Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản Admin đã bị khóa trong 15 phút để bảo vệ!')
      }
      throw new Error(`Mật khẩu quản trị viên không chính xác. Còn lại ${remaining} lần thử trước khi bị khóa tạm thời.`)
    }

    // Password is valid -> Check 2FA State
    const adminUserRef = doc(db, 'users', ADMIN_USERNAME)
    const adminSnap = await getDoc(adminUserRef)
    const adminDocData = adminSnap.exists() ? adminSnap.data() : {}
    const twoFactor = adminDocData.twoFactor || null

    if (!twoFactor || !twoFactor.enabled) {
      // First-time 2FA Setup
      const newSecret = generateTotpSecret(16)
      const backupCodes = generateBackupCodes(5)
      const otpAuthUrl = getOtpAuthUrl('MineDiary', ADMIN_USERNAME, newSecret)
      return {
        requires2FA: true,
        isFirstTimeSetup: true,
        secret: newSecret,
        backupCodes,
        otpAuthUrl,
        tempUser: {
          id: ADMIN_USERNAME,
          username: ADMIN_USERNAME,
          displayName: 'System Admin 🛡️',
        },
      }
    }

    // 2FA Already Enabled -> Request 6-digit TOTP / Backup code
    return {
      requires2FA: true,
      isFirstTimeSetup: false,
      tempUser: {
        id: ADMIN_USERNAME,
        username: ADMIN_USERNAME,
        displayName: 'System Admin 🛡️',
      },
    }
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

  // ── Sync Attendance Progress with VIP Tier ──
  const vipTier = data.vipTier || 'normal'
  const reqDays = VIP_TIERS[vipTier]?.reqDays || 0
  const rawAttendance = data.attendance || { streak: 0, lastCheckInDate: null, claimedDays: [] }

  const claimedSet = new Set(rawAttendance.claimedDays || [])
  for (let d = 1; d <= reqDays; d++) {
    claimedSet.add(d)
  }
  const finalClaimedDays = Array.from(claimedSet).sort((a, b) => a - b)
  const finalStreak = Math.max(rawAttendance.streak || 0, reqDays)

  const syncedAttendance = {
    ...rawAttendance,
    streak: finalStreak,
    claimedDays: finalClaimedDays,
  }

  // If attendance was upgraded by VIP tier, save to database
  if (finalStreak !== (rawAttendance.streak || 0) || finalClaimedDays.length !== (rawAttendance.claimedDays || []).length) {
    updateDoc(doc(db, 'users', foundDoc.id), {
      attendance: syncedAttendance,
      updatedAt: serverTimestamp(),
    }).catch(console.warn)
  }

  const sessionUser = {
    id: foundDoc.id,
    name: data.displayName || data.name || foundDoc.id,
    displayName: data.displayName || data.name || foundDoc.id,
    username: data.username || foundDoc.id,
    avatar: data.avatar || 'bunny',
    avatarFrame: data.avatarFrame || data.frame || 'none',
    gender: data.gender || 'female',
    vipTier,
    predictionMode: data.predictionMode || 'standard',
    attendance: syncedAttendance,
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

export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch (e) {
    console.error('Save session error:', e)
  }
}

/**
 * 6. Verify and complete 2FA Login for Admin
 */
export async function verifyAndCompleteAdmin2FA({ code, secret, backupCodes, isFirstTimeSetup }) {
  const cleanCode = (code || '').trim().toUpperCase().replace(/\s/g, '')
  if (!cleanCode) {
    throw new Error('Vui lòng nhập mã xác thực 6 số hoặc mã dự phòng')
  }

  const adminUserRef = doc(db, 'users', ADMIN_USERNAME)
  const adminSnap = await getDoc(adminUserRef)
  const adminDocData = adminSnap.exists() ? adminSnap.data() : {}

  let effectiveSecret = secret
  let effectiveBackups = backupCodes || []

  if (!isFirstTimeSetup) {
    if (!adminDocData.twoFactor?.secret) {
      throw new Error('Cấu hình 2FA không hợp lệ. Vui lòng thiết lập lại.')
    }
    effectiveSecret = adminDocData.twoFactor.secret
    effectiveBackups = adminDocData.twoFactor.backupCodes || []
  }

  // 1. Check if user entered a backup recovery code
  const cleanCompare = cleanCode.replace(/-/g, '')
  const backupIndex = effectiveBackups.findIndex((b) => b.replace(/-/g, '').toUpperCase() === cleanCompare)

  if (backupIndex !== -1) {
    // Valid backup code -> consume it so it cannot be reused
    effectiveBackups.splice(backupIndex, 1)
  } else {
    // 2. Verify 6-digit TOTP code
    const isTotpValid = await verifyTotpCode(effectiveSecret, cleanCode)
    if (!isTotpValid) {
      throw new Error('Mã xác thực 6 số không chính xác hoặc đã hết hạn (30s). Vui lòng thử lại!')
    }
  }

  // 2FA Succeeded -> Save 2FA configuration in Firestore
  const twoFactorData = {
    enabled: true,
    secret: effectiveSecret,
    backupCodes: effectiveBackups,
    updatedAt: serverTimestamp(),
    ...(isFirstTimeSetup ? { enabledAt: serverTimestamp() } : {}),
  }

  const adminPasswordHash = await hashPassword(ADMIN_PASSWORD)
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
    twoFactor: twoFactorData,
    email: `${ADMIN_USERNAME}@minediary.local`,
    updatedAt: serverTimestamp(),
  }

  await setDoc(adminUserRef, adminData, { merge: true })
  resetAdminLockout()
  sendTelegramSecurityAlert(`✅ THÔNG BÁO: Đăng nhập Quản trị viên (${ADMIN_USERNAME}) thành công qua xác thực 2FA.`)

  const sessionAdmin = {
    id: ADMIN_USERNAME,
    name: adminData.displayName,
    displayName: adminData.displayName,
    username: ADMIN_USERNAME,
    avatar: adminData.avatar,
    avatarFrame: adminData.avatarFrame,
    vipTier: 'god',
    attendance: { streak: 30, lastCheckInDate: null, claimedDays: [] },
    isAdmin: true,
    role: 'admin',
    email: `${ADMIN_USERNAME}@minediary.local`,
  }
  saveSession(sessionAdmin)

  return sessionAdmin
}

