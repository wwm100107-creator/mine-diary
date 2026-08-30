/**
 * src/utils/totp.js
 * RFC 6238 Time-based One-Time Password (TOTP) Generator & Verifier
 * Ponytail style: zero external dependencies, uses native Web Crypto API (HMAC-SHA1).
 * 100% compatible with Google Authenticator, Apple Passwords, Microsoft Authenticator, 1Password.
 */

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * Decode Base32 string to Uint8Array
 */
function base32ToBytes(base32) {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '')
  let bits = 0
  let value = 0
  const bytes = []

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_CHARS.indexOf(clean[i])
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(bytes)
}

/**
 * Generate a random 16-character Base32 secret
 */
export function generateTotpSecret(length = 16) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let secret = ''
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[bytes[i] % 32]
  }
  return secret
}

/**
 * Generate 5 emergency backup recovery codes
 */
export function generateBackupCodes(count = 5) {
  const codes = []
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(4)
    crypto.getRandomValues(bytes)
    const code = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`)
  }
  return codes
}

/**
 * Compute HMAC-SHA1 using native Web Crypto API
 */
async function hmacSha1(keyBytes, messageBytes) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes)
  return new Uint8Array(signature)
}

/**
 * Compute 6-digit TOTP code for a given timestamp
 * @param {string} secret - Base32 encoded secret
 * @param {number} timeStepOffset - Offset in 30s steps (-1, 0, +1 for drift tolerance)
 */
export async function generateTotpCode(secret, timeStepOffset = 0) {
  const keyBytes = base32ToBytes(secret)
  const epoch = Math.floor(Date.now() / 1000)
  const counter = Math.floor(epoch / 30) + timeStepOffset

  // 8-byte big-endian counter
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setUint32(4, counter, false) // big endian

  const hmacResult = await hmacSha1(keyBytes, new Uint8Array(buffer))

  // Dynamic truncation (RFC 4226)
  const offset = hmacResult[hmacResult.length - 1] & 0x0f
  const binary =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)

  const otp = binary % 1000000
  return otp.toString().padStart(6, '0')
}

/**
 * Verify a 6-digit TOTP code against a secret with +/- 1 time step tolerance (90s window)
 */
export async function verifyTotpCode(secret, userCode) {
  const cleanCode = (userCode || '').trim().replace(/[\s-]/g, '')
  if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return false
  }

  // Check current step, previous step (-1), and next step (+1) for network latency / clock skew
  const steps = [0, -1, 1]
  for (const step of steps) {
    const validCode = await generateTotpCode(secret, step)
    if (validCode === cleanCode) {
      return true
    }
  }

  return false
}

/**
 * Format standard otpauth URL for Google Authenticator QR Code
 */
export function getOtpAuthUrl(issuer, accountName, secret) {
  const encIssuer = encodeURIComponent(issuer)
  const encAccount = encodeURIComponent(accountName)
  return `otpauth://totp/${encIssuer}:${encAccount}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`
}
