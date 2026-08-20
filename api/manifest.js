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
        finalIsAdmin = Boolean(parsed.isAdmin || parsed.role === 'admin' || parsed.id === 'adminserver')
      }
    } catch (e) {}
  }

  const isUserAdmin = finalIsAdmin || finalRole === 'admin'

  let appName = 'Mine Diary - Nhật Ký & Chu Kỳ Pixel'
  let shortName = 'MineDiary'
  let themeColor = '#FFB7C5'
  let backgroundColor = '#FFF8F2'
  let icons = []

  if (isUserAdmin) {
    // 1. Admin: Static Wolf PNG for OS PWA installation support
    appName = 'Mine Diary Admin - Quản Trị Hệ Thống'
    shortName = 'MineAdmin'
    themeColor = '#1E293B'
    backgroundColor = '#0F172A'
    icons = [
      {
        src: '/icon-wolf-static.png',
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-wolf-static.png',
        sizes: '192x192 512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-wolf-static.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ]
  } else if (gender === 'female') {
    // 2. Female User: Pink Bunny Icon
    appName = 'Mine Diary - Nhật Ký & Chu Kỳ'
    shortName = 'MineDiary'
    themeColor = '#FFB7C5'
    backgroundColor = '#FFF8F2'
    icons = [
      {
        src: '/icon-bunny.svg',
        sizes: '48x48 72x72 96x96 128x128 192x192 256x256 512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-bunny.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ]
  } else if (gender === 'male') {
    // 3. Male User: Blue Bear Icon
    appName = 'Mine Diary - Nhật Ký & Tin Nhắn'
    shortName = 'MineDiary'
    themeColor = '#90CAF9'
    backgroundColor = '#F0F8FF'
    icons = [
      {
        src: '/icon-bear.svg',
        sizes: '48x48 72x72 96x96 128x128 192x192 256x256 512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-bear.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ]
  } else {
    // 4. Guest / Unauthenticated: Split Hybrid Icon
    appName = 'Mine Diary - Nhật Ký & Chu Kỳ Pixel'
    shortName = 'MineDiary'
    themeColor = '#FFB7C5'
    backgroundColor = '#FFF8F2'
    icons = [
      {
        src: '/icon-split.svg',
        sizes: '48x48 72x72 96x96 128x128 192x192 256x256 512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon-split.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ]
  }

  const manifest = {
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
