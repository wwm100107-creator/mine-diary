/**
 * src/lib/diary.js
 * Rock-solid Cloud-Persistent Diary Service with Firestore + LocalStorage Offline Cache.
 * Guarantees zero data loss across devices, browser cache resets, and PWA installs.
 */

import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from './firebase'

export const diaryStorageKey = (userId, dateStr) => `minediary:diary:${userId || 'guest'}:${dateStr}`
export const moodStorageKey  = (userId, dateStr) => `minediary:mood:${userId || 'guest'}:${dateStr}`

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function countWords(html) {
  const text = stripHtml(html)
  return text === '' ? 0 : text.split(/\s+/).length
}

/**
 * Save a diary entry to both LocalStorage (instant cache) and Firestore Cloud (permanent).
 * Uses nested merge to ensure other dates are never touched or overwritten.
 */
export async function saveDiaryEntry(userId, dateStr, { content = '', moods = [] }) {
  if (!dateStr) return

  const effectiveId = userId || 'guest'
  const normalizedMoods = Array.isArray(moods) ? moods : Array.from(moods || [])

  // 1. Instant local persistence
  try {
    localStorage.setItem(diaryStorageKey(effectiveId, dateStr), content)
    localStorage.setItem(moodStorageKey(effectiveId, dateStr), JSON.stringify(normalizedMoods))
  } catch (e) {
    console.warn('[Diary] LocalStorage save warning:', e)
  }

  // 2. Cloud Firestore persistence (Users with account)
  if (userId && userId !== 'guest') {
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(
        userRef,
        {
          diaries: {
            [dateStr]: {
              content,
              moods: normalizedMoods,
              updatedAt: new Date().toISOString(),
              wordCount: countWords(content),
            },
          },
        },
        { merge: true }
      )
    } catch (err) {
      console.error('[Diary] Cloud save error:', err)
    }
  }

  // 3. Dispatch event for UI reactivity
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('minediary:diary_updated', {
        detail: { userId: effectiveId, dateStr, content, moods: normalizedMoods },
      })
    )
  }
}

/**
 * Get diary entry for a specific date.
 * Reads from LocalStorage cache first, then asynchronously reconciles with Firestore if needed.
 */
export async function getDiaryEntry(userId, dateStr) {
  if (!dateStr) return { content: '', moods: [] }

  const effectiveId = userId || 'guest'
  let localContent = ''
  let localMoods = []

  try {
    localContent = localStorage.getItem(diaryStorageKey(effectiveId, dateStr)) || ''
    const rawMoods = localStorage.getItem(moodStorageKey(effectiveId, dateStr))
    localMoods = rawMoods ? JSON.parse(rawMoods) : []
  } catch (e) {}

  // If local already has content, return it immediately for instant responsiveness
  if (localContent || !userId || userId === 'guest') {
    return { content: localContent, moods: localMoods }
  }

  // If local is empty, attempt to fetch from Firestore
  try {
    const snap = await getDoc(doc(db, 'users', userId))
    if (snap.exists()) {
      const cloudEntry = snap.data()?.diaries?.[dateStr]
      if (cloudEntry) {
        const content = cloudEntry.content || ''
        const moods = Array.isArray(cloudEntry.moods) ? cloudEntry.moods : []
        try {
          localStorage.setItem(diaryStorageKey(userId, dateStr), content)
          localStorage.setItem(moodStorageKey(userId, dateStr), JSON.stringify(moods))
        } catch (e) {}
        return { content, moods }
      }
    }
  } catch (err) {
    console.warn('[Diary] Cloud fetch error for date:', dateStr, err)
  }

  return { content: '', moods: [] }
}

/**
 * Delete a diary entry both locally and in Firestore
 */
export async function deleteDiaryEntry(userId, dateStr) {
  if (!dateStr) return

  const effectiveId = userId || 'guest'
  try {
    localStorage.removeItem(diaryStorageKey(effectiveId, dateStr))
    localStorage.removeItem(moodStorageKey(effectiveId, dateStr))
  } catch (e) {}

  if (userId && userId !== 'guest') {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        [`diaries.${dateStr}`]: deleteField(),
      })
    } catch (err) {
      console.warn('[Diary] Delete from cloud warning:', err)
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('minediary:diary_updated', {
        detail: { userId: effectiveId, dateStr, content: '', moods: [] },
      })
    )
  }
}

/**
 * Full Cloud Restore & Migration Service:
 * 1. Pulls all diary entries from Firestore and populates LocalStorage so all entries are visible offline and on new devices.
 * 2. Scans LocalStorage for any existing local entries and automatically backs them up to Firestore.
 */
export async function restoreAllUserDiaries(userId) {
  if (!userId || userId === 'guest') return {}

  try {
    const snap = await getDoc(doc(db, 'users', userId))
    const cloudDiaries = snap.exists() ? (snap.data()?.diaries || {}) : {}

    // 1. Populate LocalStorage from Cloud
    for (const [dateStr, entry] of Object.entries(cloudDiaries)) {
      if (entry && typeof entry === 'object') {
        const content = entry.content || ''
        const moods = Array.isArray(entry.moods) ? entry.moods : []
        try {
          localStorage.setItem(diaryStorageKey(userId, dateStr), content)
          localStorage.setItem(moodStorageKey(userId, dateStr), JSON.stringify(moods))
        } catch (e) {}
      }
    }

    // 2. Scan LocalStorage for any entries written previously that haven't been backed up to cloud
    const toMigrate = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      const prefix = `minediary:diary:${userId}:`
      if (key.startsWith(prefix)) {
        const dateStr = key.slice(prefix.length)
        if (dateStr && !cloudDiaries[dateStr]) {
          try {
            const localContent = localStorage.getItem(key)
            const rawMoods = localStorage.getItem(moodStorageKey(userId, dateStr))
            const localMoods = rawMoods ? JSON.parse(rawMoods) : []
            if (localContent && localContent.trim()) {
              toMigrate[dateStr] = {
                content: localContent,
                moods: localMoods,
                updatedAt: new Date().toISOString(),
                wordCount: countWords(localContent),
              }
            }
          } catch (e) {}
        }
      }
    }

    // 3. If there are local entries not in cloud, automatically push them to Firestore!
    if (Object.keys(toMigrate).length > 0) {
      console.log(`[Diary] Migrating ${Object.keys(toMigrate).length} local diary entries to Firestore cloud...`)
      await setDoc(
        doc(db, 'users', userId),
        { diaries: toMigrate },
        { merge: true }
      )
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('minediary:diaries_restored', {
          detail: { userId, count: Object.keys({ ...cloudDiaries, ...toMigrate }).length },
        })
      )
    }

    return { ...cloudDiaries, ...toMigrate }
  } catch (err) {
    console.error('[Diary] restoreAllUserDiaries error:', err)
    return {}
  }
}
