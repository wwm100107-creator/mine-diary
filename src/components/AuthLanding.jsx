import React, { useState, useEffect } from 'react'
import PixelAvatar from './PixelAvatar'
import AvatarWithFrame from './AvatarWithFrame'
import AvatarUploadModal from './AvatarUploadModal'
import BannedScreen from './BannedScreen'
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
  const num = Math.floor(100000 + Math.random() * 900000)
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
    avatarFrame: 'none',
    theme: null,
    gender: null, // Initially null -> no iOS droplet active
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

    if (!registerInput.gender) {
      setError('Vui lòng chọn Giới tính của bạn (Nữ ♀ hoặc Nam ♂)!')
      return
    }

    if (registerInput.password !== registerInput.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!')
      return
    }

    if (registerInput.customUid) {
      const uidPattern = /^[a-zA-Z0-9\u00C0-\u1EF9]+_\d{6}$/
      if (!uidPattern.test(registerInput.customUid.trim())) {
        setError('UID sai định dạng! Vui lòng nhập theo mẫu [Chữ_6 số] (Ví dụ: ABC_211107).')
        return
      }
    }

    setLoading(true)
    try {
      const user = await registerUser({
        username: registerInput.username,
        displayName: registerInput.displayName,
        customUid: registerInput.customUid,
        password: registerInput.password,
        avatar: registerInput.avatar,
        avatarFrame: registerInput.avatarFrame || 'none',
        theme: registerInput.theme || null,
        gender: registerInput.gender,
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

  if (bannedInfo) {
    return (
      <BannedScreen
        banDetails={bannedInfo}
        onLogout={() => {
          setBannedInfo(null)
          setError('')
        }}
      />
    )
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
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁️'}
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
                  placeholder="Vui lòng nhập tên đăng nhập ..."
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
                  placeholder="Vui lòng nhập tên hiển thị ..."
                  value={registerInput.displayName}
                  onChange={(e) => setRegisterInput({ ...registerInput, displayName: e.target.value })}
                />
              </div>
            </div>

            {/* 3. UID Cá Nhân + Nút Random 🎲 */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>
                <span>UID Cá Nhân</span>
                <span className={s.tagPreview}>Mẫu [Chữ_6 số]</span>
              </label>
              <div className={s.uidInputRow}>
                <div className={s.inputFieldWrap} style={{ flex: 1 }}>
                  <span className={s.inputIcon} aria-hidden="true">#</span>
                  <input
                    type="text"
                    className={s.pixelInput}
                    placeholder="Nhập [chữ_ 6 số], VD: ABC_211107"
                    value={registerInput.customUid}
                    onChange={(e) => setRegisterInput({ ...registerInput, customUid: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  className={s.randomUidBtn}
                  onClick={handleGenerateUid}
                  title="Tạo UID ngẫu nhiên đúng mẫu [Chữ_6 số]"
                >
                  <span className={s.diceIcon}>🎲</span> Random
                </button>
              </div>
            </div>

            {/* 4. Giới Tính (Gender: Nữ ♀ / Nam ♂) — iOS Liquid Droplet Switcher */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>
                <span>Giới Tính</span>
                <span className={s.tagPreview}>Nữ ♀ hoặc Nam ♂</span>
              </label>
              <div className={s.genderDropletContainer}>
                {/* iOS Liquid Droplet Glass Indicator */}
                <div
                  className={`${s.dropletIndicator} ${
                    registerInput.gender === 'female'
                      ? s.dropletFemale
                      : registerInput.gender === 'male'
                      ? s.dropletMale
                      : s.dropletHidden
                  }`}
                  aria-hidden="true"
                />

                <button
                  type="button"
                  className={`${s.genderOptionBtn} ${registerInput.gender === 'female' ? s.genderActiveFemale : ''}`}
                  onClick={() => setRegisterInput({ ...registerInput, gender: 'female' })}
                  title="Chọn giới tính Nữ"
                >
                  <span className={s.genderLabel}>Nữ ♀</span>
                </button>

                <button
                  type="button"
                  className={`${s.genderOptionBtn} ${registerInput.gender === 'male' ? s.genderActiveMale : ''}`}
                  onClick={() => setRegisterInput({ ...registerInput, gender: 'male' })}
                  title="Chọn giới tính Nam"
                >
                  <span className={s.genderLabel}>Nam ♂</span>
                </button>
              </div>

              {/* Dynamic Note when Nữ ♀ is selected */}
              {registerInput.gender === 'female' && (
                <div className={s.femaleCycleNote}>
                  🌸 Có tính năng tính chu kỳ
                </div>
              )}
            </div>

            {/* 5. Avatar Pixel Của Bạn */}
            <div className={s.inputGroup}>
              <label className={s.inputLabel}>
                <span>Avatar & Khung Viền Của Bạn</span>
                <span className={s.tagPreview}>Tùy chỉnh cá nhân</span>
              </label>
              <div className={s.avatarPickerRow}>
                <div
                  className={s.avatarCurrent}
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Nhấn để đổi avatar và khung viền"
                  role="button"
                  tabIndex={0}
                >
                  <AvatarWithFrame
                    avatarUrl={registerInput.avatar}
                    frameId={registerInput.avatarFrame || 'none'}
                    size={40}
                    border={false}
                  />
                  <div className={s.avatarInfo}>
                    <span className={s.avatarNameText}>
                      {currentSelectedAvatar?.name || 'Tùy chỉnh'}
                    </span>
                    {registerInput.avatarFrame && registerInput.avatarFrame !== 'none' ? (
                      <span className={s.avatarFrameBadge}>✨ Khung hiệu ứng</span>
                    ) : (
                      <span className={s.avatarSubtext}>Bấm để đổi avatar / khung</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={s.avatarChangeBtn}
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Mở bảng chọn Avatar, Khung viền & Theme"
                >
                  Đổi Avatar 🎨
                </button>
              </div>
            </div>

            {/* 6. Mật Khẩu */}
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

      {/* ── Full Avatar, Frame & Theme Customization Modal (New User: VIP Tier is strictly Normal) ── */}
      {isAvatarModalOpen && (
        <AvatarUploadModal
          user={{ id: 'guest_register', vipTier: 'normal', role: 'user', isAdmin: false }}
          isRegistration={true}
          currentAvatar={registerInput.avatar}
          currentFrame={registerInput.avatarFrame || 'none'}
          currentTheme={registerInput.theme || null}
          onSave={(newAvatar, newFrame, newTheme) => {
            setRegisterInput((prev) => ({
              ...prev,
              avatar: newAvatar,
              avatarFrame: newFrame || 'none',
              theme: newTheme || null,
            }))
            setIsAvatarModalOpen(false)
          }}
          onClose={() => setIsAvatarModalOpen(false)}
        />
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
