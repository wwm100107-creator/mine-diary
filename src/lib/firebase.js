// src/lib/firebase.js
// Central Firebase init with Safe Offline Persistence + Storage
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// ponytail: Ensure singleton app instance across hot reloads & rapid F5
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// ponytail: Safely initialize Firestore with persistent multi-tab cache,
// falling back gracefully to getFirestore if IndexedDB is temporarily locked on rapid refresh
let firestoreDb
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  })
} catch (err) {
  try {
    firestoreDb = getFirestore(app)
  } catch (fallbackErr) {
    console.warn('[Firebase] Fallback getFirestore:', fallbackErr)
  }
}

export const db = firestoreDb || getFirestore(app)
export const storage = getStorage(app)
