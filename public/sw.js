// public/sw.js — Universal PWA & Push Service Worker
// Automatically imports firebase-messaging-sw for background push notifications

try {
  importScripts('/firebase-messaging-sw.js')
} catch (e) {
  // Fallback direct push event listener if importScripts fails
  self.addEventListener('push', (event) => {
    if (!event.data) return
    const title = 'Mine Diary 🌸'
    const options = {
      body: event.data.text() || 'Bạn có tin nhắn mới!',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'minediary-push',
      renotify: true,
      data: { url: '/#chat' },
      vibrate: [200, 100, 200],
    }
    event.waitUntil(self.registration.showNotification(title, options))
  })
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})


