/**
 * src/lib/push.js
 * Firebase Cloud Messaging (FCM) & Web Push Notification Client Service
 * Ponytail style: minimal native registration, resilient fallback, fast token dispatch.
 */

import { getToken, onMessage } from 'firebase/messaging'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, firebaseConfig, getFirebaseMessaging } from './firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

/**
 * Request Notification Permission and register FCM Token in Database
 * @param {Object} user - Logged in user object
 * @returns {Promise<string|null>} FCM Token if granted, null otherwise
 */
export async function requestNotificationPermission(user) {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    console.warn('[Push] Push notifications not supported in this browser.')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('[Push] Notification permission denied or dismissed.')
      return null
    }

    // Register firebase-messaging-sw with Firebase config query parameters
    const swUrl = new URL('/firebase-messaging-sw.js', window.location.origin)
    Object.entries(firebaseConfig).forEach(([key, val]) => {
      if (val) swUrl.searchParams.set(key, val)
    })

    const registration = await navigator.serviceWorker.register(swUrl.pathname + swUrl.search, {
      scope: '/',
    })

    const messaging = await getFirebaseMessaging()
    if (!messaging) {
      console.warn('[Push] Firebase Messaging not supported on this platform.')
      return null
    }

    const tokenOptions = { serviceWorkerRegistration: registration }
    if (VAPID_KEY) {
      tokenOptions.vapidKey = VAPID_KEY
    }

    const token = await getToken(messaging, tokenOptions)
    if (token && user?.id) {
      // Save FCM Token into User's record in Database
      await updateDoc(doc(db, 'users', user.id), {
        fcmToken: token,
        fcmUpdatedAt: serverTimestamp(),
      })
      localStorage.setItem(`minediary:fcm_token:${user.id}`, token)
      console.log('[Push] FCM Token successfully saved:', token.slice(0, 15) + '...')
      return token
    }
  } catch (err) {
    console.warn('[Push] Error requesting FCM push permission:', err)
  }

  return null
}

/**
 * Send Push Notification to a recipient user when a new message is sent
 * @param {Object} params
 * @param {string} params.recipientUserId - Target user ID to receive push notification
 * @param {string} params.title - Notification Title (e.g. Sender Name)
 * @param {string} params.body - Notification Body (e.g. Message text)
 * @param {string} [params.icon] - Optional avatar icon
 * @param {Object} [params.data] - Additional payload data
 */
export async function sendPushNotification({ recipientUserId, title, body, icon = '/favicon.svg', data = {} }) {
  if (!recipientUserId) return

  try {
    // 1. Fetch recipient's FCM token from Firestore
    const userDoc = await getDoc(doc(db, 'users', recipientUserId))
    if (!userDoc.exists()) return

    const recipientData = userDoc.data()
    const fcmToken = recipientData.fcmToken
    if (!fcmToken) return

    // 2. Dispatch to Serverless / API push trigger
    await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: fcmToken,
        title: title || 'Mine Diary 🌸',
        body: body || 'Bạn có tin nhắn mới!',
        icon: icon || recipientData.avatar || '/favicon.svg',
        data: {
          url: '/#chat',
          partnerId: data.partnerId || '',
          ...data,
        },
      }),
    }).catch((e) => {
      console.warn('[Push] API send-push network warning:', e)
    })
  } catch (err) {
    console.warn('[Push] Error dispatching push notification:', err)
  }
}
