/**
 * src/hooks/useDynamicFavicon.js
 * Dynamic Favicon Hook with Animated Wolf Icon for Admin & Gender-Themed Icons
 * Impeccable & Ponytail style: reactive, seamless browser tab favicon updates with fallback.
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

    let iconUrl = '/icon-split.svg'
    let iconType = 'image/svg+xml'

    if (isAdmin) {
      // 1. Admin Account: Animated Pixel Wolf (Howling at crescent moon with smoke aura)
      iconUrl = '/icon-wolf-animated.gif'
      iconType = 'image/gif'
    } else if (user?.gender === 'female') {
      // 2. Female User: Cute Pink Bunny
      iconUrl = '/icon-bunny.svg'
      iconType = 'image/svg+xml'
    } else if (user?.gender === 'male') {
      // 3. Male User: Cute Blue Bear
      iconUrl = '/icon-bear.svg'
      iconType = 'image/svg+xml'
    } else {
      // 4. Guest / Unauthenticated: Split Half-Bunny Half-Bear
      iconUrl = '/icon-split.svg'
      iconType = 'image/svg+xml'
    }

    const setFavicon = (url, type) => {
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.type = type
      link.href = url

      // Also update apple-touch-icon if applicable
      let appleLink = document.querySelector("link[rel='apple-touch-icon']")
      if (appleLink) {
        appleLink.href = url
      }

      // ── Update dynamic web app manifest for PWA installation ──
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
    }

    if (isAdmin) {
      // Verify GIF support with image fallback to static PNG / SVG
      const img = new Image()
      img.onload = () => {
        setFavicon('/icon-wolf-animated.gif', 'image/gif')
      }
      img.onerror = () => {
        // Fallback to static PNG or SVG
        setFavicon('/icon-wolf-static.png', 'image/png')
      }
      img.src = '/icon-wolf-animated.gif'
    } else {
      setFavicon(iconUrl, iconType)
    }
  }, [user?.id, user?.gender, user?.role, user?.isAdmin])
}
