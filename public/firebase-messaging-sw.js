// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Background Service Worker for Native Web Push Notifications
// Ponytail style: minimal, auto-initializes with URL params or compat config, standard push fallback.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

const params = new URL(location).searchParams
const firebaseConfig = {
  apiKey: params.get('apiKey') || '',
  authDomain: params.get('authDomain') || '',
  projectId: params.get('projectId') || '',
  storageBucket: params.get('storageBucket') || '',
  messagingSenderId: params.get('messagingSenderId') || '',
  appId: params.get('appId') || '',
}

try {
  if (firebaseConfig.projectId) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }
    const messaging = firebase.messaging()

    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM SW] onBackgroundMessage:', payload)
      const title = payload.notification?.title || payload.data?.title || 'Mine Diary 🌸'
      const options = {
        body: payload.notification?.body || payload.data?.body || 'Bạn có tin nhắn mới!',
        icon: payload.notification?.icon || payload.data?.icon || '/favicon.svg',
        badge: '/favicon.svg',
        data: payload.data || {},
        vibrate: [200, 100, 200],
      }
      self.registration.showNotification(title, options)
    })
  }
} catch (e) {
  console.warn('[FCM SW] Init warning:', e)
}

// Native Web Push Event Fallback
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json()
      const title = data.notification?.title || data.title || 'Mine Diary 🌸'
      const options = {
        body: data.notification?.body || data.body || 'Bạn có thông báo mới!',
        icon: data.notification?.icon || '/favicon.svg',
        badge: '/favicon.svg',
        data: data.data || data,
      }
      event.waitUntil(self.registration.showNotification(title, options))
    } catch (err) {
      const text = event.data.text()
      event.waitUntil(
        self.registration.showNotification('Mine Diary 🌸', {
          body: text || 'Bạn có tin nhắn mới!',
          icon: '/favicon.svg',
        })
      )
    }
  }
})

// Focus app window on notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/#chat'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
