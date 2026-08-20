import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/animations.css'
import { applyTheme, getSavedTheme } from './utils/theme'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'

// ── Anti-FOUC: Synchronously apply saved theme before React mounts ──
try {
  applyTheme(getSavedTheme())
} catch (e) {
  console.warn('[Theme] Early init warning:', e)
}

// ponytail: CLIENT_ID hardcode tạm, chuyển sang .env khi deploy
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'PASTE_YOUR_CLIENT_ID_HERE'

// ── PWA: Service Worker Registration for Offline Caching (Production only) ──
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service Worker registration failed:', err)
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
