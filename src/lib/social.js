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
export async function sendChatMessage(myId, targetId, text) {
  const cId = getChatId(myId, targetId)
  const chatDocRef = doc(db, 'chats', cId)
  const snap = await getDoc(chatDocRef)

  if (!snap.exists()) {
    // 1. First message: Create room with status 'pending' & initiatorId
    await setDoc(chatDocRef, {
      id: cId,
      participants: [myId, targetId],
      initiatorId: myId,
      status: 'pending',
      lastMessage: text.trim(),
      lastSenderId: myId,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    })
  } else {
    // 2. Subsequent message: Update last message
    await setDoc(chatDocRef, {
      lastMessage: text.trim(),
      lastSenderId: myId,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  // 3. Add message sub-document
  await addDoc(collection(db, 'chats', cId, 'messages'), {
    senderId: myId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  })
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
    const chats = []
    for (const d of snapshot.docs) {
      const data = d.data()
      if (data.status === 'declined') continue // ignore declined

      const partnerId = data.participants.find((p) => p !== myId)
      if (!partnerId) continue

      // Fetch partner profile
      const partnerDoc = await getUser(partnerId)
      const partnerDisplayName = partnerDoc?.displayName || partnerDoc?.name || partnerId
      const partnerAvatar = partnerDoc?.avatar || 'bunny'
      const partnerFrame = partnerDoc?.avatarFrame || partnerDoc?.frame || 'none'

      chats.push({
        chatId: d.id,
        partnerId,
        displayName: partnerDisplayName,
        avatar: partnerAvatar,
        avatarFrame: partnerFrame,
        status: data.status, // 'pending' | 'accepted'
        initiatorId: data.initiatorId,
        lastMessage: data.lastMessage,
        lastSenderId: data.lastSenderId,
        updatedAt: data.updatedAt,
      })
    }
    callback(chats)
  }, (err) => {
    console.error('User chats subscription error:', err)
  })
}

// ── Local recent chats cache (fast boot) ──────────────────────────────────────

const recentKey = (userId) => `minediary:recent_chats:${userId}`

export function getRecentChats(userId) {
  try {
    const raw = localStorage.getItem(recentKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function saveRecentChat(userId, partner, status = 'accepted') {
  if (!userId || !partner?.id) return
  const current = getRecentChats(userId)
  const filtered = current.filter((c) => c.id !== partner.id)
  const updated = [
    {
      id: partner.id,
      displayName: partner.displayName || partner.id,
      avatar: partner.avatar || 'bunny',
      avatarFrame: partner.avatarFrame || partner.frame || 'none',
      status: status || 'accepted',
      lastSeen: Date.now(),
    },
    ...filtered,
  ].slice(0, 15) // Keep top 15

  try {
    localStorage.setItem(recentKey(userId), JSON.stringify(updated))
  } catch (e) {
    console.error('Save recent chat error:', e)
  }
}
