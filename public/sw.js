// public/sw.js — Native Lightweight Service Worker for Mine Diary PWA
const CACHE_NAME = 'minediary-cache-v1'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
  '/manifest.json',
]

// ── 1. Install Event: Precache core app shell ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

// ── 2. Activate Event: Clean up outdated caches ──
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── 3. Fetch Event: Offline caching strategies ──
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Only handle GET requests, ignore chrome-extension
  if (e.request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return
  }

  // Bypass Firebase / Google Auth APIs (Firestore manages its own offline IndexedDB)
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com/identitytoolkit') ||
    url.hostname.includes('securetoken.googleapis.com')
  ) {
    return
  }

  // A. Fonts & Static Assets: Stale-While-Revalidate with Cache-First Fallback
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|css|js)$/)
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
            }
            return networkRes
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  // B. HTML / Page Navigations: Network-First with Cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
          }
          return res
        })
        .catch(() =>
          caches.match(e.request).then((cached) => cached || caches.match('/index.html'))
        )
    )
    return
  }

  // C. Default: Network with Cache fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
