import React, { useState } from 'react'
import { loginUser, verifyAndCompleteAdmin2FA } from '../lib/auth'
import { isUserAdmin } from '../lib/admin'
import InkIcon from './admin/InkIcon'
import ThreeCelestialCanvas from './admin/ThreeCelestialCanvas'
import AceternitySpotlightGrid from './admin/AceternitySpotlightGrid'

export default function AdminLogin({ onLoginSuccess, onBackToApp }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 2FA State
  const [twoFactorState, setTwoFactorState] = useState(null)
  const [totpCode, setTotpCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')

  // ── Handle Primary Step (Username + Password) ──
  const handlePrimarySubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu Quản trị viên.')
      return
    }

    setLoading(true)
    try {
      const res = await loginUser({
        usernameOrId: username.trim(),
        password,
      })

      // 1. Check if 2FA is required
      if (res?.requires2FA) {
        setTwoFactorState(res)
        setTotpCode('')
        setTwoFactorError('')
        return
      }

      // 2. Security Guard: Verify Admin privileges
      if (!isUserAdmin(res)) {
        setError('Truy cập bị từ chối: Tài khoản không có quyền Quản trị viên (Admin)!')
        return
      }

      onLoginSuccess?.(res)
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại: Tên đăng nhập hoặc mật khẩu không chính xác!')
    } finally {
      setLoading(false)
    }
  }

  // ── Handle Secondary Step (2FA TOTP Verification) ──
  const handle2FASubmit = async (e) => {
    e.preventDefault()
    if (!totpCode.trim()) return

    setTwoFactorError('')
    setLoading(true)
    try {
      const sessionAdmin = await verifyAndCompleteAdmin2FA({
        code: totpCode.trim(),
        secret: twoFactorState.secret,
        backupCodes: twoFactorState.backupCodes,
        isFirstTimeSetup: twoFactorState.isFirstTimeSetup,
      })

      if (!isUserAdmin(sessionAdmin)) {
        throw new Error('Tài khoản không có quyền Quản trị viên!')
      }

      onLoginSuccess?.(sessionAdmin)
    } catch (err) {
      setTwoFactorError(err.message || 'Mã xác thực 2FA không chính xác hoặc đã hết hạn!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#070b14',
        color: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* 3D Atmospheric Background Layers (ThreeUI + Aceternity) */}
      <ThreeCelestialCanvas />
      <AceternitySpotlightGrid />

      {/* Cyber-Tactical Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 28, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header Branding */}
        <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(14, 165, 233, 0.08) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.25)',
            }}
          >
            <InkIcon name="shield" size={30} color="#38bdf8" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontSize: '11px',
              color: '#38bdf8',
              fontWeight: '700',
              letterSpacing: '0.06em',
              fontFamily: 'monospace',
            }}
          >
            <span>✦ AETHER OPS // ADMIN ACCESS</span>
          </div>

          <h1
            style={{
              margin: '4px 0 0',
              fontSize: '22px',
              fontWeight: '800',
              color: '#f8fafc',
              letterSpacing: '-0.01em',
            }}
          >
            Đăng Nhập Quản Trị
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            Cổng xác thực an ninh dành riêng cho Ban Quản Trị Mine Diary
          </p>
        </header>

        {/* Error Alert */}
        {(error || twoFactorError) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '12.5px',
              lineHeight: 1.5,
            }}
          >
            <InkIcon name="warning" size={18} color="#f87171" />
            <span>{error || twoFactorError}</span>
          </div>
        )}

        {/* Step 1: Username & Password */}
        {!twoFactorState ? (
          <form onSubmit={handlePrimarySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="admin-username" style={{ fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1' }}>
                Tên Đăng Nhập / UID
              </label>
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="adminminediary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                style={{
                  padding: '11px 14px',
                  borderRadius: '12px',
                  background: 'rgba(10, 15, 28, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#38bdf8'
                  e.target.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="admin-password" style={{ fontSize: '12.5px', fontWeight: '600', color: '#cbd5e1' }}>
                Mật Khẩu (Password)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 14px',
                    borderRadius: '12px',
                    background: 'rgba(10, 15, 28, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#38bdf8'
                    e.target.style.boxShadow = '0 0 14px rgba(56, 189, 248, 0.2)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <InkIcon name={showPassword ? 'eye' : 'lock'} size={18} color="#94a3b8" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <span>Đang xác thực bảo mật...</span>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <InkIcon name="shield" size={16} color="#ffffff" />
                </>
              )}
            </button>

            {/* Quick Dev Test Mode Button (For local testing server) */}
            {typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('192.168.')) && (
                <button
                  type="button"
                  onClick={() => {
                    onLoginSuccess?.({
                      id: 'adminminediary',
                      uid: 'adminminediary',
                      username: 'adminminediary',
                      displayName: 'Quản Trị Viên Tối Cao (Dev Test)',
                      role: 'admin',
                      isAdmin: true,
                      vipTier: 'god',
                      avatar: '/admin-avatar.webm',
                      avatarFrame: 'gold_crown',
                      createdAt: new Date().toISOString(),
                    })
                  }}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    padding: '11px 16px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(14, 165, 233, 0.06) 100%)',
                    border: '1.5px dashed rgba(56, 189, 248, 0.5)',
                    borderRadius: '12px',
                    color: '#38bdf8',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <InkIcon name="sparkles" size={15} color="#38bdf8" />
                  <span>⚡ Vào Nhanh Trải Nghiệm (Test Server Dev Access)</span>
                </button>
              )}
          </form>
        ) : (
          /* Step 2: 2FA TOTP Verification */
          <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'center',
                background: 'rgba(10, 15, 28, 0.65)',
                padding: '18px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
                {twoFactorState.isFirstTimeSetup
                  ? 'Quét mã QR trong ứng dụng Google Authenticator và nhập mã 6 số:'
                  : 'Nhập mã xác thực 6 số từ Google Authenticator hoặc mã dự phòng:'}
              </p>

              {twoFactorState.isFirstTimeSetup && twoFactorState.otpAuthUrl && (
                <div
                  style={{
                    padding: '8px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    display: 'inline-block',
                    margin: '0 auto',
                    boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      twoFactorState.otpAuthUrl
                    )}`}
                    alt="2FA QR Code"
                    width="150"
                    height="150"
                    style={{ display: 'block', borderRadius: '4px' }}
                  />
                </div>
              )}

              <input
                type="text"
                maxLength={8}
                autoFocus
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: '800',
                  letterSpacing: '0.25em',
                  fontFamily: 'monospace',
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !totpCode.trim()}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
              }}
            >
              {loading ? (
                <span>Đang kiểm tra mã 2FA...</span>
              ) : (
                <>
                  <span>Xác Nhận Đăng Nhập</span>
                  <InkIcon name="check" size={16} color="#ffffff" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTwoFactorState(null)
                setTwoFactorError('')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              ← Quay lại nhập mật khẩu
            </button>
          </form>
        )}

        {/* Footer: Back to App */}
        <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onBackToApp}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            ← Quay về ứng dụng Mine Diary
          </button>
        </footer>
      </div>
    </div>
  )
}
