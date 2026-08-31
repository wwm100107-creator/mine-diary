/**
 * api/manifest.js
 * Dynamic Web App Manifest Generator for PWA Installation
 * Ponytail style: zero dependencies, fast JSON output, role & gender adaptive.
 */

export default function handler(req, res) {
  const { role, gender, isAdmin } = req.query || {}

  // Check query params first, then fallback to parsing session from Cookie headers
  let finalRole = role || ''
  let finalGender = gender || ''
  let finalIsAdmin = role === 'admin' || isAdmin === 'true' || isAdmin === '1'

  if (!finalRole && !finalGender && req.headers?.cookie) {
    try {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(';').map((c) => {
          const [k, ...v] = c.trim().split('=')
          return [k, decodeURIComponent(v.join('='))]
        })
      )
      const rawUser = cookies['minediary_user'] || cookies['minediary:session']
      if (rawUser) {
        const parsed = JSON.parse(rawUser)
        finalRole = parsed.role || (parsed.isAdmin ? 'admin' : 'user')
        finalGender = parsed.gender || ''
        finalIsAdmin = Boolean(parsed.isAdmin || parsed.role === 'admin' || parsed.id === 'adminminediary')
      }
    } catch (e) {}
  }

  const isUserAdmin = finalIsAdmin || finalRole === 'admin'

  let appName = 'Mine Diary - Nhật Ký & Chu Kỳ Pixel'
  let shortName = 'MineDiary'
  let themeColor = '#FFB7C5'
  let backgroundColor = '#FFF8F2'
  const icons = [
    {
      src: '/icon-192.png?v=storybook',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icon-512.png?v=storybook',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/favicon.svg?v=storybook',
      sizes: '48x48 72x72 96x96 128x128 192x192 256x256 512x512',
      type: 'image/svg+xml',
      purpose: 'any',
    },
  ]

  const manifest = {
    id: 'minediary-pwa-app-v2',
    name: appName,
    short_name: shortName,
    description: 'Nhật ký cá nhân và theo dõi chu kỳ dễ thương phong cách cute pixel',
    start_url: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: themeColor,
    orientation: 'portrait-primary',
    icons,
  }

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60')
  return res.status(200).json(manifest)
}
