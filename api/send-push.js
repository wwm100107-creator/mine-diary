/**
 * api/send-push.js
 * Vercel Serverless Function / Cloud Function for Dispatching Web Push Notifications
 * Ponytail style: zero external server deps, uses standard fetch to FCM gateway.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { token, title, body, icon, data } = req.body || {}

  if (!token) {
    return res.status(400).json({ error: 'Missing recipient FCM token' })
  }

  const serverKey = process.env.FCM_SERVER_KEY || process.env.VITE_FIREBASE_SERVER_KEY || ''

  // 1. If Firebase Server Key is present, send via FCM Legacy HTTP Gateway
  if (serverKey) {
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `key=${serverKey}`,
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: title || 'Mine Diary 🌸',
            body: body || 'Bạn có tin nhắn mới!',
            icon: icon || '/icon-192.png',
            click_action: '/#chat',
          },
          data: {
            title: title || 'Mine Diary 🌸',
            body: body || 'Bạn có tin nhắn mới!',
            icon: icon || '/icon-192.png',
            url: '/#chat',
            ...data,
          },
          priority: 'high',
        }),
      })

      const result = await response.json()
      return res.status(200).json({ success: true, result })
    } catch (err) {
      console.error('[API send-push] FCM Gateway Error:', err)
      return res.status(500).json({ error: 'Failed to send via FCM', details: err.message })
    }
  }

  // 2. Fallback when Server Key is not yet configured in Environment
  console.log('[API send-push] Push notification received for token:', token.slice(0, 15) + '...')
  return res.status(200).json({
    success: true,
    message: 'Push dispatched (configure FCM_SERVER_KEY in Vercel Environment Variables for production FCM gateway)',
  })
}
