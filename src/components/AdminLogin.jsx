import React, { useState } from 'react'
import { loginUser, verifyAndCompleteAdmin2FA } from '../lib/auth'
import { isUserAdmin } from '../lib/admin'
import s from './AdminLogin.module.css'

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
      setError('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu Quản trị.')
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

      // 2. Security Guard: Verify that this account actually has Admin rights
      if (!isUserAdmin(res)) {
        setError('Truy cập bị từ chối: Tài khoản này không có quyền Quản trị viên!')
        return
      }

      onLoginSuccess?.(res)
    } catch (err) {
      setError(err.message || 'Xác thực tài khoản Quản trị thất bại!')
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
        throw new Error('Tài khoản không đủ quyền hạn quản trị hệ thống!')
      }

      onLoginSuccess?.(sessionAdmin)
    } catch (err) {
      setTwoFactorError(err.message || 'Mã xác thực 2FA không chính xác hoặc đã hết hạn!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.container}>
      <div className={s.cyberGrid} aria-hidden="true" />

      <div className={s.card}>
        {/* Header */}
        <header className={s.header}>
          <div className={s.shieldBadge}>🛡️</div>
          <div className={s.badgeRealm}>SECURE REALM // ADMIN PORTAL</div>
          <h1 className={s.title}>Đăng Nhập Quản Trị</h1>
          <p className={s.subtitle}>
            Cổng xác thực tối mật dành cho Quản trị viên hệ thống Mine Diary.
          </p>
        </header>

        {/* Error Banner */}
        {(error || twoFactorError) && (
          <div className={s.errorBanner} role="alert">
            <span>⚠️</span>
            <span>{error || twoFactorError}</span>
          </div>
        )}

        {/* Form Body: Step 1 vs Step 2 (2FA) */}
        {!twoFactorState ? (
          <form className={s.form} onSubmit={handlePrimarySubmit}>
            <div className={s.field}>
              <label className={s.label} htmlFor="admin-username">Tài Khoản Quản Trị</label>
              <input
                id="admin-username"
                className={s.input}
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="adminminediary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="admin-password">Mật Khẩu</label>
              <div className={s.inputWrapper}>
                <input
                  id="admin-password"
                  className={s.input}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={s.togglePassBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Xác Thực Danh Tính 🛡️'}
            </button>
          </form>
        ) : (
          <form className={s.form} onSubmit={handle2FASubmit}>
            <div className={s.twoFactorBox}>
              <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                {twoFactorState.isFirstTimeSetup
                  ? 'Quét mã QR trong ứng dụng Google Authenticator và nhập mã 6 số:'
                  : 'Nhập mã bảo mật 6 số từ Google Authenticator hoặc mã dự phòng:'}
              </p>

              {twoFactorState.isFirstTimeSetup && twoFactorState.otpAuthUrl && (
                <div style={{ padding: '8px', background: '#fff', borderRadius: '8px', display: 'inline-block', margin: '0 auto' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(twoFactorState.otpAuthUrl)}`}
                    alt="2FA QR Code"
                    width="150"
                    height="150"
                  />
                </div>
              )}

              <input
                className={s.totpInput}
                type="text"
                maxLength={8}
                autoFocus
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading || !totpCode.trim()}
            >
              {loading ? 'Đang kiểm tra 2FA...' : 'Hoàn Tất Đăng Nhập 🚀'}
            </button>

            <button
              type="button"
              className={s.backLink}
              onClick={() => {
                setTwoFactorState(null)
                setTwoFactorError('')
              }}
              style={{ justifyContent: 'center' }}
            >
              ← Quay lại nhập mật khẩu
            </button>
          </form>
        )}

        {/* Footer: Return to User App */}
        <footer className={s.footer}>
          <button
            type="button"
            className={s.backLink}
            onClick={onBackToApp}
          >
            ← Quay về trang Nhật Ký Người Dùng
          </button>
        </footer>
      </div>
    </div>
  )
}
