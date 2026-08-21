// public/firebase-messaging-sw.js
// Firebase Cloud Messaging & Web Push Background Service Worker
// Supports iOS 16.4+ (Standalone PWA) and Android OS-level Lock Screen Notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

const params = new URL(location).searchParams
const firebaseConfig = {
  apiKey: params.get('apiKey') || 'AIzaSyBs-sAlF8tQEDdGuj8smBVbtFK9uDZ8_9E',
  authDomain: params.get('authDomain') || 'mine-diary-11279.firebaseapp.com',
  projectId: params.get('projectId') || 'mine-diary-11279',
  storageBucket: params.get('storageBucket') || 'mine-diary-11279.firebasestorage.app',
  messagingSenderId: params.get('messagingSenderId') || '460955731657',
  appId: params.get('appId') || '1:460955731657:web:ea44acfe6fc4fdc2d1ef18',
}

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// 1. Firebase Cloud Messaging Background Handler
try {
  if (firebaseConfig.projectId) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }
    const messaging = firebase.messaging()

    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM SW] onBackgroundMessage received:', payload)
      const title = payload.notification?.title || payload.data?.title || 'Mine Diary 🌸'
      const options = {
        body: payload.notification?.body || payload.data?.body || 'Bạn có thông báo mới!',
        icon: payload.notification?.icon || payload.data?.icon || '/icon-192.png',
        badge: '/badge-72.png',
        tag: payload.data?.tag || 'minediary-push',
        renotify: true,
        silent: false,
        data: {
          url: payload.data?.url || payload.fcmOptions?.link || '/#chat',
          ...payload.data,
        },
        vibrate: [200, 100, 200, 100, 250, 100, 300],
      }
      self.registration.showNotification(title, options)
    })
  }
} catch (e) {
  console.warn('[FCM SW] Init warning:', e)
}

// 2. Native Web Push Event Handler (Universal fallback for Web Push / iOS 16.4+ / Android)
self.addEventListener('push', (event) => {
  if (!event.data) return

  let title = 'Mine Diary 🌸'
  let options = {
    body: 'Bạn có tin nhắn mới!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'minediary-push',
    renotify: true,
    silent: false,
    data: { url: '/#chat' },
    vibrate: [200, 100, 200, 100, 250, 100, 300],
  }

  try {
    const data = event.data.json()
    title = data.notification?.title || data.title || title
    options.body = data.notification?.body || data.body || options.body
    options.icon = data.notification?.icon || data.icon || options.icon
    if (data.data) {
      options.data = { ...options.data, ...data.data }
    }
  } catch (err) {
    const text = event.data.text()
    if (text) options.body = text
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// 3. Notification Click: Open / Focus app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/#chat'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            return client.focus()
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
