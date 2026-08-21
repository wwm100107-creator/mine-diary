import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/animations.css'
import { applyTheme, getSavedTheme } from './utils/theme'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'

// ── Global Recovery: Auto-recover from dynamic module chunk failures ──
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    console.warn('[Vite] Chunk preload failure, auto-reloading page...')
    window.location.reload()
  })
}

// ── PWA & Web Push: Register background service worker ──
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
    .then((reg) => {
      console.log('[PWA] Push Service Worker active with scope:', reg.scope)
    })
    .catch((err) => {
      console.warn('[PWA] Service Worker registration warning:', err)
    })
}

// ── Anti-FOUC: Synchronously apply saved theme before React mounts ──
try {
  applyTheme(getSavedTheme())
} catch (e) {
  console.warn('[Theme] Early init warning:', e)
}

// ponytail: CLIENT_ID hardcode tạm, chuyển sang .env khi deploy
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id'

try {
  const container = document.getElementById('root')
  if (container) {
    const root = createRoot(container)
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        </ErrorBoundary>
      </StrictMode>
    )
  }
} catch (bootErr) {
  console.error('[App Boot Failure]:', bootErr)
}

