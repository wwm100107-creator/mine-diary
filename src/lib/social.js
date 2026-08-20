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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { dataUrlToBlob } from '../utils/pixelArt'
import { sendPushNotification } from './push'

// ── User profile ──────────────────────────────────────────────────────────────

/** Upsert user profile on login */
export async function upsertUser({ id, name, email, avatar, avatarFrame }) {
  const data = {
    displayName: name,
    email: email || '',
    updatedAt: serverTimestamp(),
  }
  if (avatar) data.avatar = avatar
  if (avatarFrame !== undefined) data.avatarFrame = avatarFrame
  await setDoc(doc(db, 'users', id), data, { merge: true })
}

/**
 * Upload Avatar to Cloud Storage & Update user document in Database.
 * Fallback to direct optimized Data URL if Storage Bucket is offline or unconfigured.
 * @param {string} userId
 * @param {string} avatarDataUrl - Data URL of chosen image (Original or Pixel)
 * @param {string} avatarFrame - Animated frame ID ('none' | 'rainbow' | 'sparkle_stars' | 'cyber_aura' | 'sakura_hearts')
 * @returns {Promise<string>} Final URL or Data URL saved
 */
export async function uploadUserAvatar(userId, avatarDataUrl, avatarFrame = 'none') {
  if (!userId) return avatarDataUrl

  let finalUrl = avatarDataUrl

  // 1. If it's a preset avatar id like 'bunny'
  if (!avatarDataUrl || !avatarDataUrl.startsWith('data:image/')) {
    await setDoc(
      doc(db, 'users', userId),
      { avatar: avatarDataUrl || 'bunny', avatarFrame: avatarFrame || 'none', updatedAt: serverTimestamp() },
      { merge: true }
    )
    return avatarDataUrl
  }

  // 2. Try Firebase Cloud Storage upload
  try {
    const blob = dataUrlToBlob(avatarDataUrl)
    const storageRef = ref(storage, `avatars/${userId}_${Date.now()}.png`)
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/png',
    })
    finalUrl = await getDownloadURL(snapshot.ref)
  } catch (storageErr) {
    console.warn('Storage upload fallback to Data URL:', storageErr)
    finalUrl = avatarDataUrl
  }

  // 3. Update Database (Firestore)
  await setDoc(
    doc(db, 'users', userId),
    { avatar: finalUrl, avatarFrame: avatarFrame || 'none', updatedAt: serverTimestamp() },
    { merge: true }
  )

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

  if (!snap.exists()) {
    // 1. First message: Create room with status 'pending' & initiatorId
    await setDoc(chatDocRef, {
      id: cId,
      participants: [myId, targetId],
      initiatorId: myId,
      status: 'pending',
      lastMessage: text.trim(),
      lastSenderId: myId,
      lastMessageType: msgType,
      isSystemMessage: isSystem,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  } else {
    // 2. Subsequent message: Update last message
    await setDoc(chatDocRef, {
      lastMessage: text.trim(),
      lastSenderId: myId,
      lastMessageType: msgType,
      isSystemMessage: isSystem,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  // 3. Add message sub-document
  await addDoc(collection(db, 'chats', cId, 'messages'), {
    senderId: myId,
    text: text.trim(),
    isSystemMessage: isSystem,
    type: msgType,
    metadata: options.metadata || null,
    createdAt: serverTimestamp(),
  })

  // 4. Trigger Native Web Push Notification (FCM) to recipient
  try {
    getUser(myId).then((senderUser) => {
      const senderName = senderUser?.displayName || senderUser?.name || senderUser?.username || myId
      sendPushNotification({
        recipientUserId: targetId,
        title: `${senderName} 💬`,
        body: text.trim(),
        icon: senderUser?.avatar || '/favicon.svg',
        data: {
          partnerId: myId,
          type: msgType,
        },
      }).catch(() => {})
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
 */
export function subscribeToUserChats(myId, callback) {
  if (!myId) return () => {}
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', myId)
  )
  return onSnapshot(q, async (snapshot) => {
    try {
      const activeDocs = snapshot.docs.filter((d) => d.data()?.status !== 'declined')
      const chatPromises = activeDocs.map(async (d) => {
        const data = d.data()
        const partnerId = data.participants?.find((p) => p !== myId)
        if (!partnerId) return null

        // Fetch partner profile (Skip if partner account was deleted)
        const partnerDoc = await getUser(partnerId)
        if (!partnerDoc) return null

        return {
          chatId: d.id,
          partnerId,
          displayName: partnerDoc.displayName || partnerDoc.name || partnerId,
          avatar: partnerDoc.avatar || 'bunny',
          avatarFrame: partnerDoc.avatarFrame || partnerDoc.frame || 'none',
          status: data.status, // 'pending' | 'accepted'
          initiatorId: data.initiatorId,
          lastMessage: data.lastMessage,
          lastSenderId: data.lastSenderId,
          lastMessageType: data.lastMessageType || 'text',
          isSystemMessage: data.isSystemMessage || false,
          updatedAt: data.updatedAt,
        }
      })

      const resolvedChats = await Promise.all(chatPromises)
      callback(resolvedChats.filter(Boolean))
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
 * isCycleShared flag decides if cycle data is visible to the other party.
 */
export async function acceptRelationshipRequest(relId, isCycleShared = false) {
  const relRef = doc(db, 'relationships', relId)
  await setDoc(relRef, {
    status: 'accepted',
    isCycleShared: Boolean(isCycleShared),
    shareCycleData: Boolean(isCycleShared),
    cancelRequesterId: null,
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
 * Sync user's cycle marks and custom icons to Firestore so partner can view
 */
export async function syncUserCycleData(userId, { markedDates = [], customIcons = [], symptoms = {} }) {
  if (!userId) return
  try {
    const cycleRef = doc(db, 'users', userId, 'health', 'cycleData')
    await setDoc(cycleRef, {
      markedDates,
      customIcons,
      symptoms,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (err) {
    console.error('Error syncing cycle data to Firestore:', err)
  }
}

/**
 * Subscribe to partner's synced cycle data
 */
export function subscribeToPartnerCycleData(partnerId, callback) {
  if (!partnerId) return () => {}
  const cycleRef = doc(db, 'users', partnerId, 'health', 'cycleData')
  return onSnapshot(cycleRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data())
    } else {
      callback(null)
    }
  }, (err) => {
    console.warn('Partner cycle data subscription:', err)
  })
}

// ── Realtime Chats System (No stale localStorage caching) ──────────────────────

export function getRecentChats() {
  return []
}

export function saveRecentChat() {
  // No-op: Realtime state strictly driven by Firestore database
}

