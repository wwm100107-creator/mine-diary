/**
 * src/hooks/usePwaInstallState.js
 * PWA Standalone Mode & Web Push Readiness Detection Hook
 * Identifies iOS 16.4+ standalone state, Android install prompt, and Web Push capabilities.
 * Ponytail style: minimal dependencies, native Web APIs, clean reactive state.
 */

import { useState, useEffect, useCallback } from 'react'

export function usePwaInstallState() {
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [permission, setPermission] = useState('default')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Detect Standalone / PWA Mode
    const checkStandalone = () => {
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isNavStandalone = window.navigator.standalone === true
      const isAndroidPwa = document.referrer.includes('android-app://')
      const standalone = isDisplayStandalone || isNavStandalone || isAndroidPwa
      setIsStandalone(standalone)
      setIsInstalled(standalone)
      return standalone
    }

    // 2. Detect iOS / iPadOS (including iPad with desktop Safari userAgent)
    const checkIsIOS = () => {
      const isIosDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      setIsIOS(isIosDevice)
      return isIosDevice
    }

    // 3. Detect Android
    const checkIsAndroid = () => {
      const isAndroidDevice = /Android/i.test(navigator.userAgent)
      setIsAndroid(isAndroidDevice)
      return isAndroidDevice
    }

    // 4. Detect Web Push Support
    const checkPushSupport = () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
      setIsPushSupported(supported)
      if ('Notification' in window) {
        setPermission(Notification.permission)
      }
      return supported
    }

    checkStandalone()
    checkIsIOS()
    checkIsAndroid()
    checkPushSupport()

    // 5. Listen for display-mode change
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleMediaChange = (e) => {
      setIsStandalone(e.matches)
      setIsInstalled(e.matches)
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    // 6. Listen for Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 7. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsStandalone(true)
      setDeferredPrompt(null)
      console.log('[PWA] App successfully installed to Home Screen!')
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Trigger Android/Chrome native install prompt
  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: 'dismissed', ready: false }
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      return { outcome, ready: true }
    } catch (e) {
      console.warn('[PWA] promptInstall error:', e)
      return { outcome: 'dismissed', ready: false }
    }
  }, [deferredPrompt])

  // iOS 16.4+ Web Push requires app to be added to Home Screen first
  const needsIosInstallFirst = isIOS && !isStandalone
  const isIosPushReady = isIOS ? isStandalone && isPushSupported : isPushSupported
  const canInstall = Boolean(deferredPrompt) || needsIosInstallFirst

  return {
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isPushSupported,
    isIosPushReady,
    needsIosInstallFirst,
    permission,
    canInstall,
    promptInstall,
    deferredPrompt,
  }
}

export default usePwaInstallState
