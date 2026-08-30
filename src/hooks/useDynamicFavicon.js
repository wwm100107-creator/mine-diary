/**
 * src/hooks/useDynamicFavicon.js
 * Dynamic Favicon Hook with Animated Wolf Icon for Admin & Gender-Themed Icons
 * Impeccable & Ponytail style: reactive, synchronous, rock-solid across all browsers.
 */

import { useEffect } from 'react'
import { isUserAdmin } from '../lib/admin'

export function useDynamicFavicon(user) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const isAdmin = Boolean(
      isUserAdmin(user) ||
      user?.role === 'admin' ||
      user?.isAdmin ||
      user?.id === 'adminserver' ||
      user?.username === 'adminserver'
    )

    let primaryIconUrl = '/favicon.svg'
    let shortcutIconUrl = '/favicon.png'
    let appleIconUrl = '/icon-192.png'
    let iconType = 'image/svg+xml'

    // ── 1. Update Primary Favicon (<link rel="icon">) ──
    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = iconType
    link.href = primaryIconUrl

    // ── 2. Update Shortcut Icon (<link rel="shortcut icon">) ──
    let shortcut = document.querySelector("link[rel='shortcut icon']")
    if (!shortcut) {
      shortcut = document.createElement('link')
      shortcut.rel = 'shortcut icon'
      document.head.appendChild(shortcut)
    }
    shortcut.href = shortcutIconUrl

    // ── 3. Update Apple Touch Icon (<link rel="apple-touch-icon">) ──
    let appleLink = document.querySelector("link[rel='apple-touch-icon']")
    if (!appleLink) {
      appleLink = document.createElement('link')
      appleLink.rel = 'apple-touch-icon'
      document.head.appendChild(appleLink)
    }
    appleLink.href = appleIconUrl

    // ── 4. Update Dynamic Web App Manifest for PWA Installation ──
    let manifestLink = document.querySelector("link[rel='manifest']")
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    const manifestParams = new URLSearchParams()
    if (isAdmin) {
      manifestParams.set('role', 'admin')
      manifestParams.set('isAdmin', 'true')
    } else if (user?.gender) {
      manifestParams.set('gender', user.gender)
    }
    manifestLink.href = `/api/manifest?${manifestParams.toString()}`
  }, [user?.id, user?.gender, user?.role, user?.isAdmin])
}
