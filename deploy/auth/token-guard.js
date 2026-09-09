/**
 * deploy/auth/token-guard.js
 * Production-grade JWT & Session Segregation Architecture
 * 
 * Enforces strict cryptographic isolation between End-User and Admin sessions:
 * 1. Distinct Audiences (`aud`): 'user-api' vs 'admin-api'
 * 2. Distinct Issuers (`iss`): 'minediary-user-auth' vs 'minediary-admin-auth'
 * 3. Distinct Secret Keys: USER_JWT_SECRET vs ADMIN_JWT_SECRET (or distinct asymmetric RSA/ECDSA key pairs)
 * 4. Subdomain-Locked Cookies: SameSite=Strict, Domain-specific (no wildcard dot)
 */

import crypto from 'crypto'

// Environment Secrets (Must be completely distinct in production)
const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'user-super-secret-key-32-chars-min!!'
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-vault-isolated-key-32-chars!!'

/**
 * Sign a token specifically for End-Users
 */
export function signUserToken(user) {
  const payload = {
    sub: user.id,
    type: 'end_user',
    role: 'user',
    aud: 'user-api',
    iss: 'minediary-user-auth',
    scopes: ['diary:read', 'diary:write', 'chat:read', 'chat:write'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600), // 7 days
  }
  return signHmacToken(payload, USER_JWT_SECRET)
}

/**
 * Sign a token specifically for Administrators (Requires MFA / Hardware Key verification)
 */
export function signAdminToken(adminUser, { mfaVerified = false } = {}) {
  if (!mfaVerified) {
    throw new Error('Admin tokens strictly require verified MFA/2FA status.')
  }

  const payload = {
    sub: adminUser.id,
    type: 'system_admin',
    role: 'superadmin',
    aud: 'admin-api',
    iss: 'minediary-admin-auth',
    mfa: true,
    scopes: ['admin:all', 'users:manage', 'telemetry:view', 'security:audit'],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (2 * 3600), // Short-lived: 2 hours
  }
  return signHmacToken(payload, ADMIN_JWT_SECRET)
}

/**
 * Middleware: Verify Admin API requests (Zero-Trust)
 * Rejects ALL user tokens even if signature is somehow valid on another key.
 */
export function verifyAdminAccess(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Missing admin session token' })
  }

  try {
    // 1. Must verify using ADMIN_JWT_SECRET (Fails immediately if signed with User Secret)
    const decoded = verifyHmacToken(token, ADMIN_JWT_SECRET)

    // 2. Cryptographic Claim Guard: Audience must be 'admin-api'
    if (decoded.aud !== 'admin-api' || decoded.iss !== 'minediary-admin-auth') {
      return res.status(403).json({ error: 'Forbidden: Invalid token audience for admin realm' })
    }

    // 3. Role and Scope Guard
    if (decoded.role !== 'superadmin' || !decoded.mfa) {
      return res.status(403).json({ error: 'Forbidden: Requires superadmin role with active MFA' })
    }

    req.admin = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin token', reason: err.message })
  }
}

/**
 * Middleware: Verify End-User API requests
 * Rejects Admin tokens from operating on standard user data contexts without explicit delegation.
 */
export function verifyUserAccess(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' })
  }

  try {
    const decoded = verifyHmacToken(token, USER_JWT_SECRET)

    if (decoded.aud !== 'user-api' || decoded.iss !== 'minediary-user-auth') {
      return res.status(403).json({ error: 'Forbidden: Invalid token audience for user realm' })
    }

    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired user token', reason: err.message })
  }
}

// ── Cookie Segregation Strategy ──────────────────────────────────────────────
export const COOKIE_OPTIONS = {
  // End-user cookie bound strictly to app.example.com
  USER_SESSION: {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    domain: 'app.example.com', // NOT .example.com (prevents leakage to admin.example.com)
    path: '/',
    maxAge: 7 * 24 * 3600 * 1000,
  },
  // Admin cookie bound strictly to admin.example.com with SameSite=Strict
  ADMIN_SESSION: {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    domain: 'admin.example.com', // Isolated strictly to admin subdomain
    path: '/',
    maxAge: 2 * 3600 * 1000,
  },
}

// ── Helper primitives ────────────────────────────────────────────────────────
function signHmacToken(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url')
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(`${b64Header}.${b64Payload}`).digest('base64url')
  return `${b64Header}.${b64Payload}.${signature}`
}

function verifyHmacToken(jwt, secret) {
  const [b64Header, b64Payload, signature] = jwt.split('.')
  if (!b64Header || !b64Payload || !signature) throw new Error('Malformed token structure')

  const expectedSig = crypto.createHmac('sha256', secret).update(`${b64Header}.${b64Payload}`).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    throw new Error('Cryptographic signature mismatch')
  }

  const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'))
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp && payload.exp < now) throw new Error('Token expired')
  return payload
}

function extractToken(req) {
  const authHeader = req.headers?.authorization || ''
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim()
  return req.cookies?.session_token || null
}
