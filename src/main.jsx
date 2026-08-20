import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/tokens.css'
import './styles/typography.css'
import './styles/animations.css'
import { applyTheme, getSavedTheme } from './utils/theme'
import App from './App.jsx'

// ── Anti-FOUC: Synchronously apply saved theme before React mounts ──
applyTheme(getSavedTheme())

// ponytail: CLIENT_ID hardcode tạm, chuyển sang .env khi deploy
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'PASTE_YOUR_CLIENT_ID_HERE'

// ── PWA: Service Worker Registration for Offline Caching ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service Worker registration failed:', err)
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
