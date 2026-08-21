// public/firebase-messaging-sw.js
// Firebase Cloud Messaging & Web Push Background Service Worker
// Supports iOS 16.4+ (Standalone PWA) and Android OS-level Lock Screen Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Unified Native Web Push & FCM Event Handler (Deduplicated with tag collapsing)
self.addEventListener('push', (event) => {
  if (!event.data) return

  let title = 'Mine Diary 🌸'
  let options = {
    body: 'Bạn có tin nhắn mới!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'minediary-chat',
    renotify: true,
    silent: false,
    data: { url: '/#chat' },
    vibrate: [200, 100, 200, 100, 250, 100, 300],
  }

  try {
    const data = event.data.json()
    const notif = data.notification || {}
    const payloadData = data.data || {}

    title = notif.title || payloadData.title || data.title || title
    options.body = notif.body || payloadData.body || data.body || options.body
    options.icon = notif.icon || payloadData.icon || data.icon || '/icon-192.png'
    options.tag = payloadData.tag || notif.tag || `chat_${payloadData.partnerId || 'default'}`
    if (payloadData) {
      options.data = { ...options.data, ...payloadData }
    }
  } catch (err) {
    const text = event.data.text()
    if (text) options.body = text
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification Click: Open / Focus app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/#chat'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && client.url.includes(self.location.origin)) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
