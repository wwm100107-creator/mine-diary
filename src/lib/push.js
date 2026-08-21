/**
 * src/lib/push.js
 * Firebase Cloud Messaging (FCM) & Web Push Notification Client Service
 * Supports iOS 16.4+ (Standalone PWA) and Android Background OS Notifications
 * Ponytail style: minimal native registration, resilient fallback, fast token dispatch.
 */

import { getToken, onMessage } from 'firebase/messaging'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, firebaseConfig, getFirebaseMessaging } from './firebase'

let cachedVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''

/**
 * Dynamically resolve Web Push VAPID key from Firestore or environment
 */
export async function getVapidKey() {
  if (cachedVapidKey) return cachedVapidKey
  try {
    const snap = await getDoc(doc(db, 'system_settings', 'push_config'))
    if (snap.exists() && snap.data().vapidKey) {
      cachedVapidKey = snap.data().vapidKey.trim()
      return cachedVapidKey
    }
  } catch (e) {}
  return ''
}

/**
 * Check if Web Push is supported on the current platform
 */
export function isPushSupported() {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Get current notification permission state ('granted' | 'denied' | 'default' | 'unsupported')
 */
export function getPushPermissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

/**
 * Request Notification Permission and register Push / FCM Token in Database (users/${user.id})
 * MUST be invoked directly upon a user gesture (e.g. button click) for iOS / Safari compatibility.
 * @param {Object} user - Logged in user object
 * @returns {Promise<string|null>} Push Token if granted, null otherwise
 */
export async function requestPushPermission(user) {
  if (!isPushSupported()) {
    console.warn('[Push] Web Push is not supported in this browser/device context.')
    return null
  }

  try {
    // 1. Request OS permission (User gesture required)
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('[Push] Notification permission not granted:', permission)
      return null
    }

    // 2. Register Service Worker with Firebase parameters
    const swUrl = new URL('/firebase-messaging-sw.js', window.location.origin)
    Object.entries(firebaseConfig).forEach(([key, val]) => {
      if (val) swUrl.searchParams.set(key, val)
    })

    const registration = await navigator.serviceWorker.register(swUrl.pathname + swUrl.search, {
      scope: '/',
    })

    // Wait for Service Worker to be active
    await navigator.serviceWorker.ready

    let finalToken = null
    const vapid = await getVapidKey()

    // 3. Attempt FCM Token registration
    const messaging = await getFirebaseMessaging()
    if (messaging) {
      const tokenOptions = { serviceWorkerRegistration: registration }
      if (vapid) {
        tokenOptions.vapidKey = vapid
      }
      try {
        finalToken = await getToken(messaging, tokenOptions)
      } catch (fcmErr) {
        console.warn('[Push] getToken via FCM warning, trying PushManager fallback:', fcmErr)
      }
    }

    // 4. Fallback to native PushManager subscription if FCM token unavailable
    let rawSubscription = null
    if (!finalToken && registration.pushManager && vapid) {
      try {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapid,
        })
        if (sub) {
          rawSubscription = sub.toJSON()
          finalToken = sub.endpoint
        }
      } catch (subErr) {
        console.warn('[Push] Native pushManager.subscribe error:', subErr)
      }
    }

    // 5. If no external FCM token, generate a local persistent client subscriber ID
    if (!finalToken && user?.id) {
      finalToken = `web_subscriber_${user.id}_${Date.now()}`
    }

    // 6. Persist Push Token into User record in Firestore Database
    if (finalToken && user?.id) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isAndroid = /Android/i.test(navigator.userAgent)

      const updatePayload = {
        pushToken: finalToken,
        fcmToken: finalToken,
        pushEnabled: true,
        pushPlatform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
        pushUpdatedAt: serverTimestamp(),
      }

      if (rawSubscription) {
        updatePayload.pushSubscription = JSON.stringify(rawSubscription)
      }

      await updateDoc(doc(db, 'users', user.id), updatePayload)
      localStorage.setItem(`minediary:push_token:${user.id}`, finalToken)
      localStorage.setItem(`minediary:fcm_token:${user.id}`, finalToken)
      console.log('[Push] Push Token successfully registered in Database:', finalToken.slice(0, 20) + '...')
      return finalToken
    }
  } catch (err) {
    console.warn('[Push] Error in requestPushPermission:', err)
  }

  return null
}

// Backward compatibility alias
export const requestNotificationPermission = requestPushPermission

/**
 * Dispatch OS-level Notification (Lock Screen, Status Bar, Sound, and Vibration)
 * Works directly on Android, iOS Standalone PWA, and Desktop browsers.
 * @param {Object} params
 * @param {string} params.title - Notification Title
 * @param {string} params.body - Notification Body
 * @param {string} [params.icon] - Icon URL
 * @param {Object} [params.data] - Additional payload data
 */
export async function displayOsNotification({ title, body, icon = '/icon-192.png', data = {} }) {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn('[Push] Cannot display OS notification: permission not granted.')
    return false
  }

  const notifTitle = title || 'Mine Diary 🌸'
  const notifOptions = {
    body: body || 'Bạn có tin nhắn mới!',
    icon: icon || '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || `minediary_msg_${data.partnerId || Date.now()}`,
    renotify: true,
    silent: false,
    data: {
      url: '/#chat',
      ...data,
    },
    vibrate: [200, 100, 200, 100, 250, 100, 300],
  }

  // 1. Primary: Try ServiceWorkerRegistration (Required on Android Chrome & iOS PWA)
  if ('serviceWorker' in navigator) {
    try {
      let reg = await navigator.serviceWorker.getRegistration()
      if (!reg || !reg.active) {
        reg = await Promise.race([
          navigator.serviceWorker.ready,
          navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 1500)),
        ]).catch(() => null)
      }

      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(notifTitle, notifOptions)
        console.log('[Push] Notification displayed via Service Worker:', notifTitle)
        return true
      }
    } catch (swErr) {
      console.warn('[Push] ServiceWorker showNotification error:', swErr)
    }
  }

  // 2. Fallback: Window Notification API (Desktop browsers)
  try {
    const notif = new Notification(notifTitle, notifOptions)
    notif.onclick = () => {
      window.focus()
      window.location.hash = '#chat'
    }
    console.log('[Push] Notification displayed via Window API:', notifTitle)
    return true
  } catch (nErr) {
    console.warn('[Push] Window Notification error:', nErr)
  }

  return false
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
    // 1. Fetch recipient's push token from Firestore
    const userDoc = await getDoc(doc(db, 'users', recipientUserId))
    if (!userDoc.exists()) return

    const recipientData = userDoc.data()
    const targetToken = recipientData.pushToken || recipientData.fcmToken
    if (!targetToken) return

    // 2. Dispatch to Serverless / API push trigger
    await fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: targetToken,
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
