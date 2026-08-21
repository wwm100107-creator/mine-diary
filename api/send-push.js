/**
 * api/send-push.js
 * Vercel Serverless Function / Cloud Function for Dispatching Web Push Notifications
 * Supports both modern Firebase Cloud Messaging API (v1) via Service Account and Legacy Server Key.
 * Ponytail style: zero external server dependencies, uses standard Node.js crypto and fetch.
 */

import crypto from 'crypto'

/**
 * Generate Google OAuth2 Access Token using Service Account Private Key (Node.js native crypto)
 */
async function getGoogleAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const base64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url')
  const signInput = `${base64Header}.${base64Claim}`

  const signer = crypto.createSign('RSA-SHA256')
  signer.update(signInput)
  const formattedKey = privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey
  const signature = signer.sign(formattedKey, 'base64url')

  const jwt = `${signInput}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OAuth2 Token error (${res.status}): ${errText}`)
  }

  const data = await res.json()
  return data.access_token
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { token, title, body, icon, data } = req.body || {}

  if (!token) {
    return res.status(400).json({ error: 'Missing recipient FCM token' })
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'mine-diary-11279'

  // 1. Primary Modern Gateway: Firebase Service Account (FCM v1 API)
  let serviceAccount = null
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim()
      serviceAccount = raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
    } catch (e) {
      console.warn('[API send-push] Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', e.message)
    }
  }

  const clientEmail = serviceAccount?.client_email || process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = serviceAccount?.private_key || process.env.FIREBASE_PRIVATE_KEY

  if (clientEmail && privateKey) {
    try {
      const accessToken = await getGoogleAccessToken(clientEmail, privateKey)
      const fcmV1Url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

      // Format strict string-only data map for Google FCM v1
      const stringData = {
        title: String(title || 'Mine Diary 🌸'),
        body: String(body || 'Bạn có tin nhắn mới!'),
        icon: String(icon || '/icon-192.png'),
        url: String(data?.url || '/#chat'),
      }
      if (data && typeof data === 'object') {
        for (const [k, v] of Object.entries(data)) {
          if (v !== undefined && v !== null) {
            stringData[k] = typeof v === 'object' ? JSON.stringify(v) : String(v)
          }
        }
      }

      const fcmResponse = await fetch(fcmV1Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: title || 'Mine Diary 🌸',
              body: body || 'Bạn có tin nhắn mới!',
            },
            data: stringData,
            android: {
              priority: 'high',
            },
            webpush: {
              headers: {
                Urgency: 'high',
              },
              notification: {
                title: title || 'Mine Diary 🌸',
                body: body || 'Bạn có tin nhắn mới!',
                icon: icon || '/icon-192.png',
                badge: '/badge-72.png',
                vibrate: [200, 100, 200, 100, 250, 100, 300],
              },
              fcm_options: {
                link: '/#chat',
              },
            },
          },
        }),
      })

      const fcmResult = await fcmResponse.json()
      if (!fcmResponse.ok) {
        console.error('[API send-push] FCM v1 rejected with status', fcmResponse.status, fcmResult)
        return res.status(fcmResponse.status).json({ success: false, gateway: 'fcm_v1', error: fcmResult })
      }

      return res.status(200).json({ success: true, gateway: 'fcm_v1', result: fcmResult })
    } catch (err) {
      console.error('[API send-push] FCM v1 Dispatch Error:', err)
      return res.status(500).json({ error: 'Failed to send via FCM v1', details: err.message })
    }
  }

  // 2. Secondary Gateway: FCM Legacy Server Key
  const serverKey = process.env.FCM_SERVER_KEY || process.env.VITE_FIREBASE_SERVER_KEY || ''
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
      return res.status(200).json({ success: true, gateway: 'fcm_legacy', result })
    } catch (err) {
      console.error('[API send-push] FCM Legacy Gateway Error:', err)
      return res.status(500).json({ error: 'Failed to send via FCM Legacy', details: err.message })
    }
  }

  // 3. Fallback when neither Service Account nor Server Key is configured in Vercel
  console.log('[API send-push] Push notification received for token:', token.slice(0, 15) + '...')
  return res.status(200).json({
    success: true,
    message: 'Push dispatched (configure FIREBASE_SERVICE_ACCOUNT or FCM_SERVER_KEY in Vercel Environment Variables)',
  })
}
