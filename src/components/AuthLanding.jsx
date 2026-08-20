import React, { useState } from 'react'
import PixelAvatar from './PixelAvatar'
import { AVATARS, getAvatar } from '../utils/avatars'
import { loginUser, registerUser } from '../lib/auth'
import { submitBanAppeal } from '../lib/admin'
import s from './AuthLanding.module.css'

const RANDOM_UID_PREFIXES = [
  'Bunny', 'Miu', 'Sakura', 'Star', 'Berry',
  'Pixel', 'Kiki', 'Neko', 'Sweet', 'Luna',
  'Pika', 'Chibi', 'BaoBao', 'Yuki', 'Hana',
]

function generateRandomUid() {
  const prefix = RANDOM_UID_PREFIXES[Math.floor(Math.random() * RANDOM_UID_PREFIXES.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}_${num}`
}

export default function AuthLanding({
  onAuthSuccess,
  onGoogleLogin,
  initialBanError = '',
  initialBannedInfo = null,
}) {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialBanError || '')

  // Banned state & Appeal modal
  const [bannedInfo, setBannedInfo] = useState(initialBannedInfo || null)
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false)
  const [appealText, setAppealText] = useState('')
  const [appealSubmitting, setAppealSubmitting] = useState(false)
  const [appealSuccess, setAppealSuccess] = useState('')
  const [appealError, setAppealError] = useState('')

  useEffect(() => {
    if (initialBanError) {
      setError(initialBanError)
    }
    if (initialBannedInfo) {
      setBannedInfo(initialBannedInfo)
    }
  }, [initialBanError, initialBannedInfo])

  // Form states
  const [loginInput, setLoginInput] = useState({ usernameOrId: '', password: '' })
  const [registerInput, setRegisterInput] = useState({
    username: '',
    displayName: '',
    customUid: '',
    password: '',
    confirmPassword: '',
    avatar: 'bunny',
  })

  // Selected avatar object for display
  const currentSelectedAvatar = getAvatar(registerInput.avatar)

  // Randomize UID generator
  const handleGenerateUid = () => {
    const rand = generateRandomUid()
    setRegisterInput((prev) => ({ ...prev, customUid: rand }))
  }

  // ── Handle Login ──
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setBannedInfo(null)
    setLoading(true)
    try {
      const user = await loginUser({
        usernameOrId: loginInput.usernameOrId,
        password: loginInput.password,
      })
      onAuthSuccess?.(user)
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!')
      if (err.isBanned && err.banDetails) {
        setBannedInfo(err.banDetails)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Handle Register ──
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setBannedInfo(null)
    if (registerInput.password !== registerInput.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!')
      return
    }

    setLoading(true)
    try {
      const user = await registerUser({
        username: registerInput.username,
        displayName: registerInput.displayName,
        customUid: registerInput.customUid,
        password: registerInput.password,
        avatar: registerInput.avatar,
      })
      onAuthSuccess?.(user)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  // ── Handle Ban Appeal Submit ──
  const handleAppealSubmit = async (e) => {
    e.preventDefault()
    if (!bannedInfo?.userId || !appealText.trim()) return

    setAppealSubmitting(true)
    setAppealError('')
    try {
      await submitBanAppeal({
        userId: bannedInfo.userId,
        appealMessage: appealText.trim(),
      })
      setAppealSuccess('Đơn khiếu nại của bạn đã được gửi đến Ban Quản Trị và đang chờ xét duyệt! ✨')
      setAppealText('')
    } catch (err) {
      setAppealError('Không thể gửi khiếu nại: ' + err.message)
    } finally {
      setAppealSubmitting(false)
    }
  }

  return (
    <div className={s.landing}>
      {/* Floating Retro Background Elements */}
      <div className={`${s.bgFloating} ${s.float1}`} aria-hidden="true">🌸</div>
      <div className={`${s.bgFloating} ${s.float2}`} aria-hidden="true">✦</div>
      <div className={`${s.bgFloating} ${s.float3}`} aria-hidden="true">🍓</div>
      <div className={`${s.bgFloating} ${s.float4}`} aria-hidden="true">✨</div>

      {/* Main Auth Card */}
      <div className={s.authCard}>
        {/* Brand Header */}
        <div className={s.brandHeader}>
          <div className={s.logoBadge}>
            <span>✦</span> Cute Pixel Diary <span>✦</span>
          </div>
          <h1 className={s.brandTitle}>Mine<span>Diary</span></h1>
          <p className={s.brandSubtitle}>Ghi lại mỗi ngày, nhỏ thôi cũng được ✨</p>
        </div>

        {/* Tab Switcher */}
        <div className={s.tabSwitch} role="tablist">
          <button
            type="button"
            className={`${s.tabBtn} ${tab === 'login' ? s.active : ''}`}
            onClick={() => {
              setTab('login')
              setError('')
              setBannedInfo(null)
            }}
            role="tab"
            aria-selected={tab === 'login'}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${tab === 'register' ? s.active : ''}`}
            onClick={() => {
              setTab('register')
              setError('')
              setBannedInfo(null)
            }}
            role="tab"
            aria-selected={tab === 'register'}
          >
            Đăng Ký
          </button>
        </div>

        {/* Error / Alert Message Banner */}
        {error && (
          <div className={s.errorBanner} role="alert">
            <div className={s.errorHeader}>
              <span className={s.errorIcon}>⚠️</span>
              <span className={s.errorMsg}>{error}</span>
            </div>
            {bannedInfo && (
              <button
                type="button"
                className={s.appealBtn}
                onClick={() => setIsAppealModalOpen(true)}
              >
                Gửi Đơn Khiếu Nại Mở Khóa 💌
              </button>
            )}
          </div>
        )}

        {/* ── Login Form ── */}
        {tab === 'login' && (
          <form className={s.authForm} onSubmit={handleLogin}>
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>Tên Tài Khoản Hoặc UID</label>
              <div className={s.inputFieldWrap}>
                <span className={s.inputIcon} aria-hidden="true">👤</span>
                <input
                  type="text"
                  className={s.pixelInput}
                  placeholder="Nhập username hoặc #UID..."
                  value={loginInput.usernameOrId}
                  onChange={(e) => setLoginInput({ ...loginInput, usernameOrId: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={s.inputGroup}>
              <label className={s.inputLabel}>Mật Khẩu</label>
              <div className={s.inputFieldWrap}>
                <span className={s.inputIcon} aria-hidden="true">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={s.pixelInput}
                  placeholder="••••••••"
                  value={loginInput.password}
                  onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className={s.togglePassBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
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
              {loading ? 'Đang xác thực...' : 'Đăng Nhập Ngay 🚀'}
            </button>
          </form>
        )}

        {/* ── Register Form ── */}
        {tab === 'register' && (
          <form className={s.authForm} onSubmit={handleRegister}>
            {/* 1. Tên tài khoản (Đăng nhập) */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>
                <span>Tên Tài Khoản (Đăng nhập)</span>
                <span className={s.tagPreview}>Dùng để đăng nhập</span>
              </label>
              <div className={s.inputFieldWrap}>
                <span className={s.inputIcon} aria-hidden="true">👤</span>
                <input
                  type="text"
                  className={s.pixelInput}
                  placeholder="Ví dụ: bonghoa99, sakura..."
                  value={registerInput.username}
                  onChange={(e) => setRegisterInput({ ...registerInput, username: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* 2. Tên người dùng (Display Name) */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>
                <span>Tên Người Dùng (Hiển thị)</span>
                <span className={s.tagPreview}>Hiển thị ra ngoài</span>
              </label>
              <div className={s.inputFieldWrap}>
                <span className={s.inputIcon} aria-hidden="true">✨</span>
                <input
                  type="text"
                  className={s.pixelInput}
                  placeholder="Ví dụ: Bông Hoa Nhỏ 🌸, Bé Miu..."
                  value={registerInput.displayName}
                  onChange={(e) => setRegisterInput({ ...registerInput, displayName: e.target.value })}
                />
              </div>
            </div>

            {/* 3. UID Cá Nhân + Nút Random 🎲 */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>
                <span>UID Cá Nhân</span>
                <span className={s.tagPreview}>Tự đặt hoặc bấm Random</span>
              </label>
              <div className={s.uidInputRow}>
                <div className={s.inputFieldWrap} style={{ flex: 1 }}>
                  <span className={s.inputIcon} aria-hidden="true">#</span>
                  <input
                    type="text"
                    className={s.pixelInput}
                    placeholder="Ví dụ: MiuMiu_99, UY123..."
                    value={registerInput.customUid}
                    onChange={(e) => setRegisterInput({ ...registerInput, customUid: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className={s.randomUidBtn}
                  onClick={handleGenerateUid}
                  title="Tạo UID ngẫu nhiên"
                >
                  <span className={s.diceIcon}>🎲</span> Random
                </button>
              </div>
            </div>

            {/* 4. Avatar Selector Trigger */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>Avatar Pixel Của Bạn</label>
              <div className={s.avatarPickerRow}>
                <div className={s.avatarCurrent}>
                  <PixelAvatar avatarId={registerInput.avatar} size={36} border={false} />
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 13 }}>
                    {currentSelectedAvatar.name}
                  </span>
                </div>
                <button
                  type="button"
                  className={s.avatarChangeBtn}
                  onClick={() => setIsAvatarModalOpen(true)}
                >
                  Đổi Avatar 🎨
                </button>
              </div>
            </div>

            {/* 5. Mật Khẩu */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>Mật Khẩu</label>
              <div className={s.inputFieldWrap}>
                <span className={s.inputIcon} aria-hidden="true">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={s.pixelInput}
                  placeholder="Tối thiểu 4 ký tự"
                  value={registerInput.password}
                  onChange={(e) => setRegisterInput({ ...registerInput, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className={s.togglePassBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            {/* 6. Xác Nhận Mật Khẩu */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>Xác Nhận Mật Khẩu</label>
              <div className={s.inputFieldWrap}>
                <span className={s.inputIcon} aria-hidden="true">✓</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={s.pixelInput}
                  placeholder="Nhập lại mật khẩu"
                  value={registerInput.confirmPassword}
                  onChange={(e) => setRegisterInput({ ...registerInput, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={s.submitBtn}
              disabled={loading}
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký Tài Khoản ✨'}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className={s.divider}>
          <span>hoặc</span>
        </div>

        {/* Google Quick Login */}
        <button
          type="button"
          className={s.googleBtn}
          onClick={onGoogleLogin}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
          </svg>
          Đăng nhập nhanh bằng Google
        </button>
      </div>

      {/* ── Pixel Avatar Picker Modal ── */}
      {isAvatarModalOpen && (
        <div className={s.modalOverlay} onClick={() => setIsAvatarModalOpen(false)}>
          <div className={s.avatarModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <span>🎨</span> Chọn Avatar Pixel
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setIsAvatarModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={s.avatarGrid}>
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`${s.avatarItem} ${registerInput.avatar === av.id ? s.selected : ''}`}
                  onClick={() => {
                    setRegisterInput({ ...registerInput, avatar: av.id })
                    setIsAvatarModalOpen(false)
                  }}
                >
                  <PixelAvatar avatarId={av.id} size={48} border={false} />
                  <span className={s.avatarName}>{av.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Ban Appeal Modal ── */}
      {isAppealModalOpen && (
        <div className={s.modalOverlay} onClick={() => setIsAppealModalOpen(false)}>
          <div className={s.appealModal} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>
                <span>💌</span> Gửi Khiếu Nại Mở Khóa Tài Khoản
              </h3>
              <button
                type="button"
                className={s.modalCloseBtn}
                onClick={() => setIsAppealModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAppealSubmit} className={s.appealForm}>
              <div className={s.appealTargetInfo}>
                <span>Tài khoản: <strong>{bannedInfo?.userId}</strong></span>
                <span>Lý do cấm: <em>{bannedInfo?.banReason}</em></span>
              </div>

              {appealSuccess ? (
                <div className={s.appealSuccessBox}>
                  {appealSuccess}
                </div>
              ) : (
                <>
                  <label className={s.appealLabel}>Giải trình hoặc lời nhắn đến Quản Trị Viên:</label>
                  <textarea
                    className={s.appealTextarea}
                    rows={4}
                    placeholder="Hãy nêu lý do bạn cho rằng tài khoản bị khóa nhầm hoặc lời xin lỗi chân thành..."
                    value={appealText}
                    onChange={(e) => setAppealText(e.target.value)}
                    required
                  />

                  {appealError && <div className={s.appealErrorMsg}>{appealError}</div>}

                  <div className={s.appealActions}>
                    <button
                      type="button"
                      className={s.cancelBtn}
                      onClick={() => setIsAppealModalOpen(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className={s.submitAppealBtn}
                      disabled={appealSubmitting || !appealText.trim()}
                    >
                      {appealSubmitting ? 'Đang gửi...' : 'Gửi Khiếu Nại ✨'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
