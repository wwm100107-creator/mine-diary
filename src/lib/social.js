/**
 * src/lib/social.js
 * Streamlined Realtime Chat + Message Requests + Animated Avatar Frames Sync
 *
 * Firestore structure:
 *   users/{userId}          — { displayName, avatar, avatarFrame, email, updatedAt }
 *   chats/{chatId}          — { id, participants: [uid1, uid2], initiatorId, status: 'pending'|'accepted', lastMessage, updatedAt }
 *   chats/{chatId}/messages — { senderId, text, createdAt }
 *   chatId = [uid1, uid2].sort().join('__')
 */

import {
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { sendPushNotification } from './push'
import { restoreCycleDataToLocalStorage } from '../utils/cycle'

// ── User profile ──────────────────────────────────────────────────────────────

/** Upsert user profile on login / registration */
export async function upsertUser({
  id,
  name,
  displayName,
  email,
  avatar,
  avatarFrame,
  gender,
  theme,
  vipTier,
  role,
  isAdmin,
  attendance,
}) {
  const data = {
    displayName: displayName || name || '',
    name: displayName || name || '',
    email: email || '',
    updatedAt: serverTimestamp(),
  }
  if (avatar) data.avatar = avatar
  if (avatarFrame !== undefined) data.avatarFrame = avatarFrame
  if (gender !== undefined) data.gender = gender
  if (theme !== undefined) data.theme = theme
  if (vipTier !== undefined) data.vipTier = vipTier
  if (role !== undefined) data.role = role
  if (isAdmin !== undefined) data.isAdmin = isAdmin
  if (attendance !== undefined) data.attendance = attendance

  await setDoc(doc(db, 'users', id), data, { merge: true })
}

/**
 * Update user avatar, frame, and theme in Firestore database.
 * Directly saves optimized Data URL or preset avatar ID with instant persistence (~50ms).
 * @param {string} userId
 * @param {string} avatarDataUrl - Data URL of chosen image or preset avatar ID
 * @param {string} avatarFrame - Animated frame ID ('none' | 'rainbow' | 'sparkle_stars' | ...)
 * @param {object|null} theme - Theme preset or custom theme object
 * @returns {Promise<string>} Final URL or Data URL saved
 */
export async function uploadUserAvatar(userId, avatarDataUrl, avatarFrame = 'none', theme = null) {
  if (!userId) return avatarDataUrl

  const finalUrl = avatarDataUrl || 'bunny'
  const targetFrame = avatarFrame || 'none'

  const userPayload = {
    avatar: finalUrl,
    avatarFrame: targetFrame,
    frame: targetFrame,
    updatedAt: serverTimestamp(),
  }
  if (theme) {
    userPayload.theme = theme
  }

  // Direct fast save to Firestore database (instantaneous ~50ms, rock solid)
  await setDoc(doc(db, 'users', userId), userPayload, { merge: true })

  return finalUrl
}

/** Sync custom tray icons to user document in Firestore */
export async function syncUserCustomIcons(userId, customIcons) {
  if (!userId) return
  try {
    await setDoc(
      doc(db, 'users', userId),
      { customIcons, updatedAt: serverTimestamp() },
      { merge: true }
    )
  } catch (err) {
    console.error('Error syncing custom icons to Firestore:', err)
  }
}

/** Get a user by ID. Returns null if not found. */
export async function getUser(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (err) {
    console.error('Error fetching user:', err)
    return null
  }
}

/**
 * Find single user by ID or Username
 */
export async function findUser(input) {
  const clean = input.trim().replace(/^#/, '')
  if (!clean) return null

  // 1. Direct document ID lookup
  const direct = await getUser(clean)
  if (direct) return direct

  // 2. Query by username or displayName
  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', clean)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const d = snap.docs[0]
      return { id: d.id, ...d.data() }
    }
  } catch (err) {
    console.error('Query user error:', err)
  }

  return null
}

/**
 * Search multiple users by UID, Display Name, or Username.
 * Returns an array of matched user objects with avatar and frame.
 * @param {string} input - Search keyword
 * @param {string} currentUserId - ID of current user to exclude
 */
export async function searchUsers(input, currentUserId = '') {
  const clean = input.trim().toLowerCase().replace(/^#/, '')
  if (!clean) return []

  const resultsMap = new Map()

  // 1. Direct document ID lookup
  try {
    const directSnap = await getDoc(doc(db, 'users', clean))
    if (directSnap.exists() && directSnap.id !== currentUserId) {
      const data = directSnap.data()
      resultsMap.set(directSnap.id, {
        id: directSnap.id,
        uid: directSnap.id,
        displayName: data.displayName || data.name || directSnap.id,
        username: data.username || '',
        avatar: data.avatar || 'bunny',
        avatarFrame: data.avatarFrame || data.frame || 'none',
        isBanned: data.isBanned || false,
      })
    }
  } catch (err) {
    console.error('Direct user search error:', err)
  }

  // 2. Query users collection and match case-insensitively
  try {
    const q = query(collection(db, 'users'))
    const snap = await getDocs(q)
    snap.docs.forEach((d) => {
      if (d.id === currentUserId) return
      const data = d.data()
      const dId = d.id.toLowerCase()
      const dName = (data.displayName || data.name || '').toLowerCase()
      const dUsername = (data.username || '').toLowerCase()

      if (
        dId.includes(clean) ||
        dName.includes(clean) ||
        dUsername.includes(clean)
      ) {
        if (!resultsMap.has(d.id)) {
          resultsMap.set(d.id, {
            id: d.id,
            uid: d.id,
            displayName: data.displayName || data.name || d.id,
            username: data.username || '',
            avatar: data.avatar || 'bunny',
            avatarFrame: data.avatarFrame || data.frame || 'none',
            isBanned: data.isBanned || false,
          })
        }
      }
    })
  } catch (err) {
    console.error('Search users collection error:', err)
  }

  return Array.from(resultsMap.values()).filter((u) => !u.isBanned)
}

// ── Chat operations ──────────────────────────────────────────────────────────

/** Deterministic chat ID from two user IDs */
export const getChatId = (a, b) => [a, b].sort().join('__')

/**
 * Send a message in realtime.
 * If chat room does not exist yet, initializes with status: 'pending' and initiatorId: myId.
 */
export async function sendChatMessage(myId, targetId, text, options = {}) {
  const cId = getChatId(myId, targetId)
  const chatDocRef = doc(db, 'chats', cId)
  const snap = await getDoc(chatDocRef)

  const isSystem = options.isSystemMessage || false
  const msgType = options.type || (isSystem ? 'system' : 'text')

  let senderUser = null
  try {
    senderUser = await getUser(myId)
  } catch (e) {}

  const senderName = senderUser?.displayName || senderUser?.name || senderUser?.username || myId
  const senderAvatar = senderUser?.avatar || 'bunny'
  const senderFrame = senderUser?.avatarFrame || senderUser?.frame || 'none'

  const chatPayload = {
    lastMessage: text.trim(),
    lastSenderId: myId,
    lastSenderName: senderName,
    lastSenderAvatar: senderAvatar,
    lastSenderFrame: senderFrame,
    lastMessageType: msgType,
    isSystemMessage: isSystem,
    updatedAt: serverTimestamp(),
  }

  if (!snap.exists()) {
    // 1. First message: Create room with status 'pending' & initiatorId
    await setDoc(chatDocRef, {
      id: cId,
      participants: [myId, targetId],
      initiatorId: myId,
      status: 'pending',
      createdAt: serverTimestamp(),
      ...chatPayload,
    })
  } else {
    // 2. Subsequent message: Update last message and sender metadata
    await setDoc(chatDocRef, chatPayload, { merge: true })
  }

  // 3. Add message sub-document
  await addDoc(collection(db, 'chats', cId, 'messages'), {
    senderId: myId,
    senderName,
    senderAvatar,
    senderFrame,
    text: text.trim(),
    isSystemMessage: isSystem,
    type: msgType,
    metadata: options.metadata || null,
    createdAt: serverTimestamp(),
  })

  // 4. Trigger Native Web Push Notification (FCM) to recipient
  try {
    sendPushNotification({
      recipientUserId: targetId,
      title: `${senderName} 💬`,
      body: text.trim(),
      icon: '/icon-192.png',
      data: {
        chatId: cId,
        partnerId: myId,
        tag: `chat_${cId}`,
        type: msgType,
      },
    }).catch(() => {})
  } catch (pushErr) {
    console.warn('[Social] Push dispatch warning:', pushErr)
  }
}

/**
 * Accept a Message Request
 */
export async function acceptChatRequest(myId, targetId) {
  const cId = getChatId(myId, targetId)
  await setDoc(doc(db, 'chats', cId), {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Decline a Message Request
 */
export async function declineChatRequest(myId, targetId) {
  const cId = getChatId(myId, targetId)
  await setDoc(doc(db, 'chats', cId), {
    status: 'declined',
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Subscribe to messages in a chat room in realtime
 */
export function subscribeToMessages(myId, targetId, callback) {
  const cId = getChatId(myId, targetId)
  const q = query(
    collection(db, 'chats', cId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    callback(msgs)
  }, (err) => {
    console.error('Messages subscription error:', err)
  })
}

/**
 * Subscribe to chat room metadata (status, initiatorId)
 */
export function subscribeToChatRoom(myId, targetId, callback) {
  const cId = getChatId(myId, targetId)
  return onSnapshot(doc(db, 'chats', cId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data())
    } else {
      callback(null)
    }
  }, (err) => {
    console.error('Chat room subscription error:', err)
  })
}

/**
 * Subscribe to all chats involving the current user (inbox realtime listener)
 * High performance zero-latency synchronous mapping with asynchronous background profile enrichment.
 */
export function subscribeToUserChats(myId, callback) {
  if (!myId) return () => {}
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', myId)
  )
  return onSnapshot(q, (snapshot) => {
    try {
      const activeDocs = snapshot.docs.filter((d) => d.data()?.status !== 'declined')
      const chats = activeDocs.map((d) => {
        const data = d.data()
        const partnerId = data.participants?.find((p) => p !== myId) || ''
        return {
          chatId: d.id,
          partnerId,
          displayName: data.lastSenderId === partnerId ? (data.lastSenderName || partnerId) : partnerId,
          avatar: data.lastSenderId === partnerId ? (data.lastSenderAvatar || 'bunny') : 'bunny',
          avatarFrame: data.lastSenderId === partnerId ? (data.lastSenderFrame || 'none') : 'none',
          status: data.status, // 'pending' | 'accepted'
          initiatorId: data.initiatorId,
          lastMessage: data.lastMessage,
          lastSenderId: data.lastSenderId,
          lastSenderName: data.lastSenderName || '',
          lastMessageType: data.lastMessageType || 'text',
          isSystemMessage: data.isSystemMessage || false,
          updatedAt: data.updatedAt,
        }
      })

      // Immediately callback synchronously with zero latency!
      callback(chats)

      // Background enrichment of full partner profiles (async cache fill without blocking)
      Promise.all(chats.map(async (c) => {
        if (!c.partnerId) return c
        try {
          const partnerDoc = await getUser(c.partnerId)
          if (partnerDoc) {
            c.displayName = partnerDoc.displayName || partnerDoc.name || c.partnerId
            c.avatar = partnerDoc.avatar || c.avatar || 'bunny'
            c.avatarFrame = partnerDoc.avatarFrame || partnerDoc.frame || c.avatarFrame || 'none'
          }
        } catch (e) {}
        return c
      })).then((enriched) => {
        callback(enriched)
      }).catch(() => {})
    } catch (err) {
      console.warn('[Social] Error processing chats snapshot:', err)
    }
  }, (err) => {
    console.warn('User chats subscription warning:', err)
  })
}

// ── Relationships System ───────────────────────────────────────────────────

export const RELATIONSHIP_TYPES = [
  { id: 'couple', label: 'Cặp đôi', icon: '💖', desc: 'Người yêu / Bạn đời' },
  { id: 'bros',   label: 'Huynh đệ', icon: '🤝', desc: 'Anh em chí cốt' },
  { id: 'sis',    label: 'Tỷ muội',  icon: '👭', desc: 'Chị em kết nghĩa' },
  { id: 'master', label: 'Sư đồ',    icon: '👑', desc: 'Sư phụ & Đệ tử' },
  { id: 'custom', label: 'Tùy chỉnh', icon: '🌸', desc: 'Tên & Icon tùy chọn' },
]

export const getRelationshipId = (a, b) => [a, b].sort().join('__')

/**
 * Send or update a relationship request
 */
export async function sendRelationshipRequest({ senderId, receiverId, type = 'couple', customName = '', customIcon = '', customIconImage = null, isCycleShared = false }) {
  const relId = getRelationshipId(senderId, receiverId)
  const relRef = doc(db, 'relationships', relId)
  
  const relTypeObj = RELATIONSHIP_TYPES.find(t => t.id === type) || RELATIONSHIP_TYPES[0]
  const finalName = (customName && customName.trim()) ? customName.trim() : relTypeObj.label
  const finalIcon = (customIcon && customIcon.trim()) ? customIcon.trim() : relTypeObj.icon

  const data = {
    id: relId,
    participants: [senderId, receiverId],
    senderId,
    receiverId,
    type,
    customName: finalName,
    customIcon: finalIcon,
    customIconImage: customIconImage || null,
    status: 'pending',
    isCycleShared: Boolean(isCycleShared),
    shareCycleData: Boolean(isCycleShared),
    cancelRequesterId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(relRef, data, { merge: true })
  return data
}

/**
 * Accept a relationship request.
 * Preserves isCycleShared if sender already enabled it, or if receiver enables it now.
 */
export async function acceptRelationshipRequest(relId, isCycleShared = false) {
  const relRef = doc(db, 'relationships', relId)
  const snap = await getDoc(relRef)
  const existing = snap.exists() ? snap.data() : {}
  const finalShare = Boolean(existing.isCycleShared || existing.shareCycleData || isCycleShared)

  await setDoc(relRef, {
    status: 'accepted',
    isCycleShared: finalShare,
    shareCycleData: finalShare,
    cancelRequesterId: null,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Update cycle sharing toggle for an active relationship
 */
export async function updateRelationshipCycleSharing(relId, isCycleShared) {
  const relRef = doc(db, 'relationships', relId)
  await setDoc(relRef, {
    isCycleShared: Boolean(isCycleShared),
    shareCycleData: Boolean(isCycleShared),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Decline a relationship request
 */
export async function declineRelationshipRequest(relId) {
  const relRef = doc(db, 'relationships', relId)
  await setDoc(relRef, {
    status: 'declined',
    cancelRequesterId: null,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Request to cancel an existing relationship (sets status to 'cancel_pending')
 */
export async function requestCancelRelationship(relId, requesterId) {
  const relRef = doc(db, 'relationships', relId)
  await setDoc(relRef, {
    status: 'cancel_pending',
    cancelRequesterId: requesterId,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Confirm cancellation of a relationship (dissolves the relationship)
 */
export async function confirmCancelRelationship(relId) {
  const relRef = doc(db, 'relationships', relId)
  await setDoc(relRef, {
    status: 'cancelled',
    isCycleShared: false,
    shareCycleData: false,
    cancelRequesterId: null,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Cancel the cancellation request (keep relationship)
 */
export async function abortCancelRelationship(relId) {
  const relRef = doc(db, 'relationships', relId)
  await setDoc(relRef, {
    status: 'accepted',
    cancelRequesterId: null,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Subscribe to active relationship between two users in realtime
 */
export function subscribeToRelationship(uidA, uidB, callback) {
  if (!uidA || !uidB) return () => {}
  const relId = getRelationshipId(uidA, uidB)
  const relRef = doc(db, 'relationships', relId)
  return onSnapshot(relRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() })
    } else {
      callback(null)
    }
  }, (err) => {
    console.error('Relationship subscription error:', err)
  })
}

/**
 * Subscribe to all relationships of a user
 */
export function subscribeToUserRelationships(userId, callback) {
  if (!userId) return () => {}
  const q = query(
    collection(db, 'relationships'),
    where('participants', 'array-contains', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const rels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(rels)
  }, (err) => {
    console.error('User relationships subscription error:', err)
  })
}

// ── Cycle Data Sync for Partner Sharing ─────────────────────────────────────

/**
 * Restore user's own cycle data from Firestore into LocalStorage
 */
export async function restoreUserCycleData(userId) {
  if (!userId || userId === 'guest') return null
  try {
    const data = await getPartnerCycleData(userId)
    if (data && (
      (data.markedDates && data.markedDates.length > 0) ||
      (data.dayIconMap && Object.keys(data.dayIconMap).length > 0) ||
      (data.symptoms && Object.keys(data.symptoms).length > 0) ||
      (data.customIcons && data.customIcons.length > 0)
    )) {
      console.log('[CycleRestore] Restoring user cycle data from Firestore into local cache:', data.markedDates?.length, 'dates')
      restoreCycleDataToLocalStorage(userId, data)
      return data
    }
  } catch (err) {
    console.warn('[CycleRestore] Failed to restore cycle data:', err)
  }
  return null
}

/**
 * Sync user's cycle marks and custom icons to Firestore so partner can view
 * Saves dual-location: root collection 'cycleData/{userId}' AND subcollection 'users/{userId}/health/cycleData'
 * With automatic safety merge to protect against empty-cache overwrites.
 */
export async function syncUserCycleData(userId, { markedDates = [], customIcons = [], symptoms = {}, dayIconMap = {} }) {
  if (!userId || userId === 'guest') return
  try {
    const isIncomingEmpty =
      (!markedDates || markedDates.length === 0) &&
      (!customIcons || customIcons.length === 0) &&
      (!symptoms || Object.keys(symptoms).length === 0) &&
      (!dayIconMap || Object.keys(dayIconMap).length === 0)

    const existingRemote = await getPartnerCycleData(userId)

    // 1. SAFETY SHIELD: If local storage is completely empty (new browser / PWA reset),
    // and Firestore already has data, RESTORE remote data to local instead of wiping the cloud!
    if (isIncomingEmpty) {
      if (existingRemote && (
        (existingRemote.markedDates && existingRemote.markedDates.length > 0) ||
        (existingRemote.dayIconMap && Object.keys(existingRemote.dayIconMap).length > 0)
      )) {
        console.log('[CycleSync] Preserving remote cycle data, restoring to local storage instead of wiping cloud.')
        restoreCycleDataToLocalStorage(userId, existingRemote)
        return
      }
    }

    // 2. MERGE SHIELD: Seamlessly union local and remote data to never lose historical dates
    let mergedMarkedDates = Array.isArray(markedDates) ? [...markedDates] : []
    let mergedCustomIcons = Array.isArray(customIcons) ? [...customIcons] : []
    let mergedSymptoms = symptoms ? { ...symptoms } : {}
    let mergedDayIconMap = dayIconMap ? { ...dayIconMap } : {}

    if (existingRemote) {
      if (Array.isArray(existingRemote.markedDates) && existingRemote.markedDates.length > 0) {
        mergedMarkedDates = Array.from(new Set([...existingRemote.markedDates, ...mergedMarkedDates])).sort()
      }
      if (Array.isArray(existingRemote.customIcons) && existingRemote.customIcons.length > 0) {
        mergedCustomIcons = Array.from(new Set([...existingRemote.customIcons, ...mergedCustomIcons]))
      }
      if (existingRemote.symptoms && typeof existingRemote.symptoms === 'object') {
        mergedSymptoms = { ...existingRemote.symptoms, ...mergedSymptoms }
      }
      if (existingRemote.dayIconMap && typeof existingRemote.dayIconMap === 'object') {
        for (const [dateKey, icons] of Object.entries(existingRemote.dayIconMap)) {
          if (Array.isArray(icons)) {
            const current = mergedDayIconMap[dateKey] || []
            mergedDayIconMap[dateKey] = Array.from(new Set([...icons, ...current]))
          }
        }
      }
    }

    // Ensure all marked cycle dates have strawberry icon in dayIconMap
    for (const d of mergedMarkedDates) {
      if (!mergedDayIconMap[d]) {
        mergedDayIconMap[d] = ['🍓']
      } else if (!mergedDayIconMap[d].includes('🍓')) {
        mergedDayIconMap[d] = ['🍓', ...mergedDayIconMap[d]]
      }
    }

    const payload = {
      userId,
      markedDates: mergedMarkedDates,
      customIcons: mergedCustomIcons,
      symptoms: mergedSymptoms,
      dayIconMap: mergedDayIconMap,
      updatedAt: serverTimestamp(),
    }

    // Write to both original userId and lowercase to ensure no casing mismatches
    const uids = Array.from(new Set([userId, String(userId).toLowerCase()]))
    const promises = []

    for (const uid of uids) {
      promises.push(
        setDoc(doc(db, 'cycleData', uid), payload, { merge: true }).catch((err) => {
          console.warn('[CycleSync] Root write error:', err?.message)
        })
      )
      promises.push(
        setDoc(doc(db, 'users', uid, 'health', 'cycleData'), payload, { merge: true }).catch((err) => {
          console.warn('[CycleSync] Subcollection write error:', err?.message)
        })
      )
    }

    await Promise.allSettled(promises)
  } catch (err) {
    console.error('Error syncing cycle data to Firestore:', err)
  }
}

/**
 * Directly fetch partner's cycle data on-demand from root or subcollection (case-insensitive)
 */
export async function getPartnerCycleData(partnerId) {
  if (!partnerId) return null
  const candidates = Array.from(new Set([
    partnerId,
    String(partnerId).toLowerCase(),
    String(partnerId).toUpperCase(),
  ]))

  for (const pid of candidates) {
    try {
      const rootSnap = await getDoc(doc(db, 'cycleData', pid))
      if (rootSnap.exists() && rootSnap.data()?.markedDates?.length > 0) {
        return rootSnap.data()
      }
    } catch (e) {}

    try {
      const subSnap = await getDoc(doc(db, 'users', pid, 'health', 'cycleData'))
      if (subSnap.exists() && subSnap.data()?.markedDates?.length > 0) {
        return subSnap.data()
      }
    } catch (e) {}
  }

  // If no markedDates were found in non-empty docs, return whatever doc exists
  for (const pid of candidates) {
    try {
      const rootSnap = await getDoc(doc(db, 'cycleData', pid))
      if (rootSnap.exists()) return rootSnap.data()
    } catch (e) {}
    try {
      const subSnap = await getDoc(doc(db, 'users', pid, 'health', 'cycleData'))
      if (subSnap.exists()) return subSnap.data()
    } catch (e) {}
  }

  return null
}

/**
 * Subscribe to partner's synced cycle data
 * Resilient multi-source listener: listens to root 'cycleData/{partnerId}' AND subcollection 'users/{partnerId}/health/cycleData'
 */
export function subscribeToPartnerCycleData(partnerId, callback) {
  if (!partnerId) return () => {}

  const pids = Array.from(new Set([
    partnerId,
    String(partnerId).toLowerCase(),
  ]))

  let bestData = null
  const unsubs = []

  const updateBest = (data) => {
    if (!data) return
    // Always prefer data with more markedDates or newer timestamp
    if (
      !bestData ||
      (data.markedDates && data.markedDates.length > (bestData.markedDates?.length || 0)) ||
      (data.markedDates?.length === bestData.markedDates?.length && data.updatedAt)
    ) {
      bestData = data
      callback(bestData)
    }
  }

  for (const pid of pids) {
    // 1. Root collection listener
    const unsubRoot = onSnapshot(
      doc(db, 'cycleData', pid),
      (snap) => {
        if (snap.exists()) {
          updateBest(snap.data())
        }
      },
      (err) => {
        console.warn('Root cycleData subscription:', err?.message)
      }
    )
    unsubs.push(unsubRoot)

    // 2. Subcollection listener fallback
    const unsubSub = onSnapshot(
      doc(db, 'users', pid, 'health', 'cycleData'),
      (snap) => {
        if (snap.exists()) {
          updateBest(snap.data())
        }
      },
      (err) => {
        console.warn('Subcollection cycleData subscription:', err?.message)
      }
    )
    unsubs.push(unsubSub)
  }

  return () => {
    unsubs.forEach((u) => {
      try { u() } catch (e) {}
    })
  }
}

// ── Realtime Chats System (No stale localStorage caching) ──────────────────────

export function getRecentChats() {
  return []
}

export function saveRecentChat() {
  // No-op: Realtime state strictly driven by Firestore database
}

/**
 * Update predictionMode for user ('standard' | 'advanced')
 */
export async function updateUserPredictionMode(userId, mode) {
  if (!userId) return mode
  const validMode = mode === 'advanced' ? 'advanced' : 'standard'
  try {
    await setDoc(doc(db, 'users', userId), {
      predictionMode: validMode,
      updatedAt: serverTimestamp(),
    }, { merge: true })
    return validMode
  } catch (err) {
    console.error('Error updating predictionMode:', err)
    throw err
  }
}

