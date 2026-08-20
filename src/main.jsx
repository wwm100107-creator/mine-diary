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

// ── Anti-FOUC: Synchronously apply saved theme before React mounts ──
try {
  applyTheme(getSavedTheme())
} catch (e) {
  console.warn('[Theme] Early init warning:', e)
}

// ponytail: CLIENT_ID hardcode tạm, chuyển sang .env khi deploy
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'PASTE_YOUR_CLIENT_ID_HERE'

// ── PWA: Safe Service Worker Registration (Production only) ──
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update().catch(() => {})
      })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration skipped:', err)
      })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
