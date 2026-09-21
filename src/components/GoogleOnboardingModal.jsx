import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import PixelIcon from './PixelIcon'
import PixelAvatar from './PixelAvatar'
import AvatarWithFrame from './AvatarWithFrame'
import AvatarUploadModal from './AvatarUploadModal'
import { AVATARS } from '../utils/avatars'
import s from './GoogleOnboardingModal.module.css'

export default function GoogleOnboardingModal({
  profile,
  onComplete,
  onCancel,
}) {
  const [displayName, setDisplayName] = useState(
    profile?.existingUser?.displayName || profile?.name || 'Bạn Mới'
  )
  const [gender, setGender] = useState(profile?.existingUser?.gender || null) // 'female' | 'male' | null
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.existingUser?.avatar || 'bunny'
  )
  const [selectedFrame, setSelectedFrame] = useState(
    profile?.existingUser?.avatarFrame || 'none'
  )
  const [selectedTheme, setSelectedTheme] = useState(
    profile?.existingUser?.theme || null
  )

  const [isCustomAvatarOpen, setIsCustomAvatarOpen] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = (e) => {
    e.preventDefault()
    setError('')

    if (!gender) {
      setError('Vui lòng chọn Giới tính của bạn để hoàn tất thiết lập hồ sơ!')
      return
    }

    if (!displayName.trim()) {
      setError('Vui lòng nhập Tên hiển thị của bạn!')
      return
    }

    setSubmitting(true)
    onComplete?.({
      gender,
      displayName: displayName.trim(),
      avatar: selectedAvatar,
      avatarFrame: selectedFrame,
      theme: selectedTheme,
    })
  }

  const currentPreset = AVATARS.find((a) => a.id === selectedAvatar)
  const isGooglePic = selectedAvatar === profile?.picture && profile?.picture

  const modalElement = (
    <div className={s.overlay} role="dialog" aria-modal="true">
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.mascotBadge}>
            <PixelIcon name="bunny" size={32} />
          </div>
          <h2 className={s.title}>Chào Mừng Bạn Đến Mine Diary!</h2>
          <div className={s.googlePill} title={profile?.email}>
            <svg width="14" height="14" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            <span>{profile?.email || 'Google Account'}</span>
          </div>
          <p className={s.subtitle}>
            Trước khi bắt đầu, hãy cho Mine Diary biết giới tính và diện mạo yêu thích của bạn nhé!
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className={s.errorBanner} role="alert">
            <PixelIcon name="warning" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 1. Tên hiển thị */}
          <div className={s.section}>
            <div className={s.labelRow}>
              <label className={s.label} htmlFor="google-display-name">
                <PixelIcon name="user" size={14} />
                <span>Tên Hiển Thị Của Bạn</span>
              </label>
              <span className={s.requiredTag}>Bắt buộc</span>
            </div>
            <div className={s.nameInputWrap}>
              <input
                id="google-display-name"
                type="text"
                className={s.nameInput}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên gọi hoặc biệt danh..."
                required
                maxLength={30}
              />
            </div>
          </div>

          {/* 2. Chọn Giới Tính (Bắt Buộc) */}
          <div className={s.section}>
            <div className={s.labelRow}>
              <label className={s.label}>
                <PixelIcon name="heart" size={14} />
                <span>Giới Tính</span>
              </label>
              <span className={s.requiredTag}>Bắt buộc</span>
            </div>
            <div className={s.genderGrid}>
              <div
                className={`${s.genderCard} ${gender === 'female' ? s.genderFemaleActive : ''}`}
                onClick={() => {
                  setGender('female')
                  setError('')
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setGender('female')}
              >
                <PixelIcon name="girl" size={28} />
                <span className={s.genderTitle}>Nữ ♀</span>
                <span className={s.genderDesc}>Dự báo chu kỳ & sức khỏe</span>
              </div>

              <div
                className={`${s.genderCard} ${gender === 'male' ? s.genderMaleActive : ''}`}
                onClick={() => {
                  setGender('male')
                  setError('')
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setGender('male')}
              >
                <PixelIcon name="boy" size={28} />
                <span className={s.genderTitle}>Nam ♂</span>
                <span className={s.genderDesc}>Đồng hành & chăm sóc</span>
              </div>
            </div>

            {/* Dynamic Gender Note */}
            {gender === 'female' && (
              <div className={`${s.genderHintNote} ${s.genderHintFemale}`}>
                <PixelIcon name="flower" size={14} />
                <span>Tính năng theo dõi và dự báo chu kỳ kinh nguyệt sẽ được tự động kích hoạt! 🌸</span>
              </div>
            )}
            {gender === 'male' && (
              <div className={`${s.genderHintNote} ${s.genderHintMale}`}>
                <PixelIcon name="heart" size={14} />
                <span>Bạn sẽ có thể nhận chia sẻ chu kỳ từ người thương để quan tâm đúng lúc! 💖</span>
              </div>
            )}
          </div>

          {/* 3. Chọn Avatar Đại Diện */}
          <div className={s.section}>
            <div className={s.labelRow}>
              <label className={s.label}>
                <PixelIcon name="palette" size={14} />
                <span>Avatar & Khung Viền Đại Diện</span>
              </label>
            </div>

            <div className={s.avatarSectionWrap}>
              {/* Preview Row */}
              <div className={s.avatarPreviewRow}>
                <AvatarWithFrame
                  avatarUrl={selectedAvatar}
                  frameId={selectedFrame}
                  size="md"
                  border={false}
                />
                <div className={s.previewInfo}>
                  <span className={s.avatarCurrentName}>
                    {isGooglePic ? 'Ảnh Google của bạn' : currentPreset?.name || 'Avatar tùy chỉnh'}
                  </span>
                  <span className={s.avatarCurrentHint}>
                    {selectedFrame !== 'none' ? 'Đã chọn khung hiệu ứng ✨' : 'Nhấn bên dưới để đổi nhanh'}
                  </span>
                </div>
                <button
                  type="button"
                  className={s.customAvatarBtn}
                  onClick={() => setIsCustomAvatarOpen(true)}
                  title="Mở bảng tải ảnh lên và chọn khung viền chi tiết"
                >
                  <PixelIcon name="palette" size={14} />
                  <span>Tùy chỉnh 🎨</span>
                </button>
              </div>

              {/* Quick Chips Grid */}
              <div className={s.avatarChipsGrid}>
                {/* Optional Google Picture chip */}
                {profile?.picture && (
                  <div
                    className={`${s.avatarChip} ${isGooglePic ? s.avatarChipSelected : ''}`}
                    onClick={() => setSelectedAvatar(profile.picture)}
                    title="Dùng ảnh đại diện Google"
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={profile.picture}
                      alt="Google Profile"
                      className={s.googlePictureChip}
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* 8 Preset Pixel Avatars */}
                {AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.id
                  return (
                    <div
                      key={av.id}
                      className={`${s.avatarChip} ${isSelected ? s.avatarChipSelected : ''}`}
                      onClick={() => setSelectedAvatar(av.id)}
                      title={`Chọn ${av.name}`}
                      role="button"
                      tabIndex={0}
                    >
                      <PixelAvatar avatarId={av.id} size={28} border={false} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={s.actions}>
            <button
              type="submit"
              className={s.confirmBtn}
              disabled={submitting}
            >
              <PixelIcon name="sparkles" size={16} />
              <span>{submitting ? 'Đang khởi tạo...' : 'Bắt Đầu Sử Dụng Mine Diary ✨'}</span>
            </button>

            <button
              type="button"
              className={s.cancelBtn}
              onClick={onCancel}
              disabled={submitting}
            >
              Hủy / Đăng xuất tài khoản này
            </button>
          </div>
        </form>
      </div>

      {/* Full Avatar Customizer Modal (Upload / Frames / Themes) */}
      {isCustomAvatarOpen && (
        <AvatarUploadModal
          isRegistration={true}
          currentAvatar={selectedAvatar}
          currentFrame={selectedFrame}
          currentTheme={selectedTheme}
          onSave={(newAvatarUrl, newFrameId, newTheme) => {
            if (newAvatarUrl) setSelectedAvatar(newAvatarUrl)
            if (newFrameId) setSelectedFrame(newFrameId)
            if (newTheme) setSelectedTheme(newTheme)
            setIsCustomAvatarOpen(false)
          }}
          onClose={() => setIsCustomAvatarOpen(false)}
        />
      )}
    </div>
  )

  return createPortal(modalElement, document.body)
}
