// public/sw.js — Native Lightweight & Safe Service Worker for Mine Diary PWA
const CACHE_NAME = 'minediary-cache-v3'
const PRECACHE_ASSETS = [
  '/favicon.svg',
  '/icons.svg',
  '/manifest.json',
]

// ── 1. Install Event: Precache ONLY essential static icons (NEVER precache index.html) ──
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)).catch(console.warn)
  )
  self.skipWaiting()
})

// ── 2. Activate Event: Immediately purge ALL older caches ──
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

// ── 3. Fetch Event: Safe Network-First for HTML/Scripts ──
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Only handle GET requests, ignore chrome-extension / non-http
  if (e.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return
  }

  // Bypass Firebase / Google Auth / Cloud Storage APIs
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.hostname.includes('firebasestorage.googleapis.com')
  ) {
    return
  }

  // A. HTML / Page Navigations: ALWAYS Network-First, NEVER serve stale index.html
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    )
    return
  }

  // B. Fonts & Media Assets: Cache-First with Network fallback
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone))
            }
            return networkRes
          })
          .catch(() => cached || fetch(e.request))
      })
    )
    return
  }

  // C. JS / CSS Chunks: Network with Cache fallback & Auto-Purge on 404
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

