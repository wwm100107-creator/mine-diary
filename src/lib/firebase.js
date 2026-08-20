// src/lib/firebase.js
// Central Firebase init with safe singleton instances (Deadlock-Free on Rapid Reloads)
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// ponytail: Ensure singleton app instance across hot reloads & rapid F5
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// ponytail: Standard rock-solid getFirestore avoids multi-tab IndexedDB lock freezes on rapid F5 reloads
export const db = getFirestore(app)
export const storage = getStorage(app)

let messagingInstance = null
export async function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null
  const supported = await isSupported().catch(() => false)
  if (!supported) return null
  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app)
    } catch (e) {
      console.warn('[FCM] getMessaging warning:', e)
    }
  }
  return messagingInstance
}


