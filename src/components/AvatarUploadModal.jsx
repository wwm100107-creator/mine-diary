import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import PixelAvatar from './PixelAvatar'
import AvatarFrameOverlay, { AVATAR_FRAMES, FRAME_COLLECTIONS } from './AvatarFrameOverlay'
import { AVATARS } from '../utils/avatars'
import { cropToSquare, generatePixelArt } from '../utils/pixelArt'
import { THEME_PRESETS, applyTheme, getSavedTheme } from '../utils/theme'
import { isFrameUnlocked, getFrameRequirementInfo } from '../utils/vipTiers'
import { getCurrentUser } from '../lib/auth'
import s from './AvatarUploadModal.module.css'

export default function AvatarUploadModal({
  user,
  isRegistration = false,
  currentAvatar,
  currentFrame = 'none',
  currentTheme = null,
  onSave,
  onClose,
}) {
  const currentUser = isRegistration
    ? { id: 'guest_register', vipTier: 'normal', role: 'user', isAdmin: false }
    : (user || getCurrentUser() || { vipTier: 'normal', role: 'user', isAdmin: false })
  const [tab, setTab] = useState('upload') // 'upload' | 'preset'
  const [rawImage, setRawImage] = useState(null)
  const [originalPreview, setOriginalPreview] = useState(null)
  const [pixelatedPreview, setPixelatedPreview] = useState(null)
  const [avatarChoice, setAvatarChoice] = useState('pixel') // 'pixel' | 'original'
  const [pixelDensity, setPixelDensity] = useState(40) // 32 | 40 | 48
  const [selectedPreset, setSelectedPreset] = useState(currentAvatar || 'bunny')
  const [selectedFrame, setSelectedFrame] = useState(currentFrame || 'none')
  const [selectedFrameCollection, setSelectedFrameCollection] = useState('all')
  const [vipWarning, setVipWarning] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)


  // ── Theme State & Realtime Preview Engine ──
  const resolvedInitialTheme =
    typeof currentTheme === 'object' && currentTheme !== null && currentTheme.colors
      ? currentTheme
      : (typeof currentTheme === 'string'
          ? (THEME_PRESETS.find(p => p.id === currentTheme) || THEME_PRESETS[0])
          : getSavedTheme())

  const initialThemeRef = useRef(resolvedInitialTheme)
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeRef.current?.id || 'strawberry')
  const [customColors, setCustomColors] = useState(
    initialThemeRef.current?.colors || {
      bg: '#FFF8F2',
      primary: '#FF8FAB',
      text: '#3D2B35',
      card: '#FFFFFF',
    }
  )
  const [showCustomPicker, setShowCustomPicker] = useState(initialThemeRef.current?.id === 'custom')

  const fileInputRef = useRef(null)

  // When rawImage or pixelDensity changes, generate previews
  useEffect(() => {
    if (!rawImage) return

    let isMounted = true
    setIsProcessing(true)

    Promise.all([
      cropToSquare(rawImage, 256),
      generatePixelArt(rawImage, pixelDensity, 256),
    ]).then(([orig, pixel]) => {
      if (isMounted) {
        setOriginalPreview(orig)
        setPixelatedPreview(pixel)
        setIsProcessing(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [rawImage, pixelDensity])

  // File selection handler
  const handleFileChange = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setRawImage(e.target.result)
      setAvatarChoice('pixel')
    }
    reader.readAsDataURL(file)
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // ── Realtime Theme Handlers ──
  const handleSelectPresetTheme = (preset) => {
    setSelectedThemeId(preset.id)
    setShowCustomPicker(false)
    setCustomColors(preset.colors)
    applyTheme(preset)
  }

  const handleCustomColorChange = (key, hexValue) => {
    const updated = { ...customColors, [key]: hexValue }
    setCustomColors(updated)
    setSelectedThemeId('custom')
    applyTheme({
      id: 'custom',
      name: '🎨 Tự Phối Màu',
      colors: updated,
    })
  }

  const handleToggleCustom = () => {
    setShowCustomPicker(true)
    setSelectedThemeId('custom')
    applyTheme({
      id: 'custom',
      name: '🎨 Tự Phối Màu',
      colors: customColors,
    })
  }

  // Close with revert if not saved
  const handleCancel = () => {
    applyTheme(initialThemeRef.current)
    onClose()
  }

  // Save handler
  const handleSave = () => {
    let finalAvatar = selectedPreset
    if (tab === 'upload') {
      if (avatarChoice === 'pixel' && pixelatedPreview) {
        finalAvatar = pixelatedPreview
      } else if (avatarChoice === 'original' && originalPreview) {
        finalAvatar = originalPreview
      }
    }

    const finalTheme = selectedThemeId === 'custom'
      ? { id: 'custom', name: '🎨 Tự Phối Màu', colors: customColors }
      : THEME_PRESETS.find(p => p.id === selectedThemeId) || THEME_PRESETS[0]

    applyTheme(finalTheme)
    onSave(finalAvatar, selectedFrame, finalTheme)
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={s.modalOverlay} onClick={handleCancel} role="dialog" aria-modal="true" aria-label="Cập nhật avatar & giao diện">
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.titleGroup}>
            <span className={s.titleIcon}>🎨</span>
            <h3 className={s.title}>Cập Nhật Avatar & Giao Diện</h3>
          </div>
          <button type="button" className={s.closeBtn} onClick={handleCancel} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={s.tabRow}>
          <button
            type="button"
            className={`${s.tabBtn} ${tab === 'upload' ? s.activeTab : ''}`}
            onClick={() => setTab('upload')}
          >
            <span>📷 Tải Ảnh & Pixel Art</span>
          </button>
          <button
            type="button"
            className={`${s.tabBtn} ${tab === 'preset' ? s.activeTab : ''}`}
            onClick={() => setTab('preset')}
          >
            <span>🐰 Kho Avatar Có Sẵn</span>
          </button>
        </div>

        {/* Body Content */}
        <div className={s.bodyContent}>
          {tab === 'upload' ? (
            /* Tab 1: Upload & Pixelate Comparison */
            !rawImage ? (
              /* Dropzone */
              <div
                className={`${s.dropZone} ${isDraggingOver ? s.dropZoneActive : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
                <div className={s.dropIcon}>📸</div>
                <div className={s.dropTitle}>Kéo thả ảnh vào đây</div>
                <div className={s.dropSub}>hoặc bấm để chọn file từ máy tính / điện thoại</div>
                <button type="button" className={s.browseBtn}>
                  Chọn ảnh từ thiết bị ✨
                </button>
              </div>
            ) : (
              /* Preview & Comparison Screen */
              <div className={s.previewScreen}>
                {/* Comparison Frames (1:1 Side by Side) */}
                <div className={s.comparisonRow}>
                  {/* Left: Original */}
                  <div
                    className={`${s.compareCard} ${avatarChoice === 'original' ? s.cardSelected : ''}`}
                    onClick={() => setAvatarChoice('original')}
                  >
                    <div className={s.cardBadge}>Ảnh Gốc</div>
                    <div className={s.frameWrap}>
                      {originalPreview ? (
                        <img src={originalPreview} alt="Ảnh Gốc" className={s.previewImgOriginal} />
                      ) : (
                        <div className={s.loadingBox}>Đang xử lý...</div>
                      )}
                      {selectedFrame && selectedFrame !== 'none' && (
                        <AvatarFrameOverlay frameId={selectedFrame} size={100} />
                      )}
                    </div>
                    <span className={s.cardLabel}>
                      {avatarChoice === 'original' ? '✓ Đang chọn' : 'Chọn ảnh gốc'}
                    </span>
                  </div>

                  {/* VS / Transform Arrow */}
                  <div className={s.transformPill}>
                    <span>✨</span>
                  </div>

                  {/* Right: Pixel Art */}
                  <div
                    className={`${s.compareCard} ${avatarChoice === 'pixel' ? s.cardSelected : ''}`}
                    onClick={() => setAvatarChoice('pixel')}
                  >
                    <div className={`${s.cardBadge} ${s.badgePixel}`}>Ảnh Pixel Art 🎨</div>
                    <div className={s.frameWrap}>
                      {isProcessing ? (
                        <div className={s.loadingBox}>Đang pixel hóa...</div>
                      ) : pixelatedPreview ? (
                        <img src={pixelatedPreview} alt="Ảnh Pixel" className={s.previewImgPixel} />
                      ) : null}
                      {selectedFrame && selectedFrame !== 'none' && (
                        <AvatarFrameOverlay frameId={selectedFrame} size={100} />
                      )}
                    </div>
                    <span className={s.cardLabel}>
                      {avatarChoice === 'pixel' ? '✓ Đang chọn' : 'Chọn ảnh pixel'}
                    </span>
                  </div>
                </div>

                {/* Pixel Style / Density Controls (Visible when Pixel mode selected) */}
                {avatarChoice === 'pixel' && (
                  <div className={s.densityRow}>
                    <span className={s.densityLabel}>Độ phân giải Pixel:</span>
                    <div className={s.densityOptions}>
                      {[
                        { label: 'Retro 32px', val: 32 },
                        { label: 'Vừa vặn 40px', val: 40 },
                        { label: 'Chi tiết 48px', val: 48 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          className={`${s.densityBtn} ${pixelDensity === item.val ? s.densityActive : ''}`}
                          onClick={() => setPixelDensity(item.val)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Choice Radio Buttons */}
                <div className={s.radioChoiceGroup}>
                  <button
                    type="button"
                    className={`${s.radioChoiceBtn} ${avatarChoice === 'original' ? s.radioActive : ''}`}
                    onClick={() => setAvatarChoice('original')}
                  >
                    <span className={s.radioDot}>{avatarChoice === 'original' ? '●' : '○'}</span>
                    <span>Giữ ảnh gốc</span>
                  </button>

                  <button
                    type="button"
                    className={`${s.radioChoiceBtn} ${avatarChoice === 'pixel' ? s.radioActive : ''}`}
                    onClick={() => setAvatarChoice('pixel')}
                  >
                    <span className={s.radioDot}>{avatarChoice === 'pixel' ? '●' : '○'}</span>
                    <span>Chuyển thành Pixel 🎨</span>
                  </button>
                </div>

                {/* Change Photo Trigger */}
                <div className={s.changePhotoRow}>
                  <button
                    type="button"
                    className={s.reselectBtn}
                    onClick={() => {
                      setRawImage(null)
                      setOriginalPreview(null)
                      setPixelatedPreview(null)
                    }}
                  >
                    🔄 Chọn ảnh khác
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Tab 2: Preset Avatars Grid */
            <div className={s.presetGrid}>
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`${s.presetItem} ${selectedPreset === av.id ? s.presetSelected : ''}`}
                  onClick={() => setSelectedPreset(av.id)}
                >
                  <PixelAvatar avatarId={av.id} size={48} border={false} frameId={selectedPreset === av.id ? selectedFrame : 'none'} />
                  <span className={s.presetName}>{av.name}</span>
                  {selectedPreset === av.id && <span className={s.presetCheckBadge}>✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* ── 3. Animated Frame Selection Section (Grouped by Themed Collections) ── */}
          <div className={s.frameSelectorSection}>
            <div className={s.frameSelectorHeader}>
              <span className={s.frameSelectorTitle}>✨ Chọn Khung Viền Pixel Động:</span>
              <span className={s.selectedFrameBadge}>
                {AVATAR_FRAMES.find((f) => f.id === selectedFrame)?.name || 'Mặc định'}
              </span>
            </div>

            {/* Frame Collections / Theme Category Tabs */}
            <div className={s.frameCollectionTabsRow} role="tablist" aria-label="Bộ sưu tập khung viền">
              {FRAME_COLLECTIONS.map((col) => {
                const isActive = selectedFrameCollection === col.id
                const frameCount = col.id === 'all'
                  ? AVATAR_FRAMES.length
                  : AVATAR_FRAMES.filter((f) => f.category === col.id).length

                return (
                  <button
                    key={col.id}
                    type="button"
                    className={`${s.collectionTabBtn} ${isActive ? s.collectionTabActive : ''}`}
                    onClick={() => setSelectedFrameCollection(col.id)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <span>{col.name}</span>
                    <span className={s.collectionCountBadge}>{frameCount}</span>
                  </button>
                )
              })}
            </div>

            {/* Active Collection Description */}
            {selectedFrameCollection !== 'all' && (
              <div className={s.collectionDescBanner}>
                <span className={s.collectionDescIcon}>
                  {FRAME_COLLECTIONS.find((c) => c.id === selectedFrameCollection)?.icon || '✨'}
                </span>
                <span className={s.collectionDescText}>
                  {FRAME_COLLECTIONS.find((c) => c.id === selectedFrameCollection)?.desc}
                </span>
              </div>
            )}

            {vipWarning && (
              <div className={s.vipWarningBanner}>
                <span>🔒</span> {vipWarning}
              </div>
            )}

            <div className={s.framesScrollRow}>
              {(selectedFrameCollection === 'all'
                ? AVATAR_FRAMES
                : AVATAR_FRAMES.filter((f) => f.id === 'none' || f.category === selectedFrameCollection)
              ).map((frame) => {
                const isFrameActive = selectedFrame === frame.id
                const isUnlocked = isFrameUnlocked(frame.id, currentUser)
                const reqInfo = getFrameRequirementInfo(frame.id)

                return (
                  <button
                    key={frame.id}
                    type="button"
                    className={`${s.frameOptionCard} ${isFrameActive ? s.frameActive : ''} ${!isUnlocked ? s.frameLocked : ''}`}
                    onClick={() => {
                      if (!isUnlocked) {
                        setVipWarning(
                          isRegistration
                            ? `Khung "${frame.name}" bị khóa! Hãy hoàn tất đăng ký tài khoản và điểm danh ${reqInfo?.reqDays} ngày để mở khóa cấp ${reqInfo?.badge || reqInfo?.name}! 🔒`
                            : `Khung "${frame.name}" đang bị khóa! Cần đạt quyền hạn ${reqInfo?.badge || reqInfo?.name} (Điểm danh ${reqInfo?.reqDays} ngày) hoặc được Admin cấp quyền để mở khóa! ✨`
                        )
                        return
                      }
                      setVipWarning('')
                      setSelectedFrame(frame.id)
                    }}
                    title={!isUnlocked ? `[BỊ KHÓA] Yêu cầu ${reqInfo?.badge || reqInfo?.name}` : `${frame.name} (${frame.desc})`}
                  >
                    {!isUnlocked && (
                      <div className={s.lockOverlayBadge}>
                        <span>🔒</span> {reqInfo?.badge || reqInfo?.shortName || 'VIP'}
                      </div>
                    )}
                    <div className={s.miniFramePreview}>
                      <PixelAvatar
                        avatarId={rawImage ? (avatarChoice === 'pixel' ? pixelatedPreview : originalPreview) : (selectedPreset || currentAvatar || 'bunny')}
                        size={40}
                        border={false}
                        frameId={frame.id}
                      />
                    </div>
                    <span className={s.frameCardName}>
                      {frame.name}
                    </span>
                    {isFrameActive && <span className={s.frameCheckBadge}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>


          {/* ── 4. Theme Palette & Colors Selection Section ── */}
          <div className={s.themeSelectorSection}>
            <div className={s.themeSelectorHeader}>
              <div className={s.themeTitleGroup}>
                <span className={s.themeIcon}>🎨</span>
                <span className={s.themeSelectorTitle}>Màu Sắc Giao Diện (Theme):</span>
              </div>
              <span className={s.selectedThemeBadge}>
                {selectedThemeId === 'custom'
                  ? '🎨 Tự Phối Màu'
                  : THEME_PRESETS.find((p) => p.id === selectedThemeId)?.name || '🍓 Dâu Tây'}
              </span>
            </div>

            {/* Presets Grid */}
            <div className={s.themePresetsGrid}>
              {THEME_PRESETS.map((preset) => {
                const isThemeActive = selectedThemeId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${s.themePresetBtn} ${isThemeActive ? s.themeActive : ''}`}
                    onClick={() => handleSelectPresetTheme(preset)}
                    title={`${preset.name}: ${preset.desc}`}
                  >
                    <span
                      className={s.themeColorCircle}
                      style={{ background: preset.swatch }}
                    />
                    <span className={s.themePresetName}>{preset.name}</span>
                    {isThemeActive && <span className={s.themeCheckMark}>✓</span>}
                  </button>
                )
              })}

              {/* Custom Mix Color Button */}
              <button
                type="button"
                className={`${s.themePresetBtn} ${s.customMixBtn} ${selectedThemeId === 'custom' ? s.themeActive : ''}`}
                onClick={handleToggleCustom}
                title="Tự mix màu sắc giao diện theo ý thích"
              >
                <span className={`${s.themeColorCircle} ${s.customPaletteIcon}`}>
                  🎨
                </span>
                <span className={s.themePresetName}>+ Tự Mix Màu</span>
                {selectedThemeId === 'custom' && <span className={s.themeCheckMark}>✓</span>}
              </button>
            </div>

            {/* Custom Color Pickers Panel (Revealed when Custom selected) */}
            {showCustomPicker && (
              <div className={s.customPickerBox}>
                <div className={s.customPickerTitle}>
                  <span>🎛️ Bảng Chọn Màu Trực Tiếp:</span>
                  <span className={s.previewLiveBadge}>● Live Preview</span>
                </div>
                <div className={s.colorPickersGrid}>
                  {/* Background Color */}
                  <label className={s.pickerItem}>
                    <span className={s.pickerLabel}>Màu Nền (Page BG):</span>
                    <div className={s.pickerInputRow}>
                      <input
                        type="color"
                        className={s.nativeColorPicker}
                        value={customColors.bg}
                        onChange={(e) => handleCustomColorChange('bg', e.target.value)}
                      />
                      <span className={s.hexValue}>{customColors.bg}</span>
                    </div>
                  </label>

                  {/* Primary Accent Color */}
                  <label className={s.pickerItem}>
                    <span className={s.pickerLabel}>Màu Chính (Primary):</span>
                    <div className={s.pickerInputRow}>
                      <input
                        type="color"
                        className={s.nativeColorPicker}
                        value={customColors.primary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      />
                      <span className={s.hexValue}>{customColors.primary}</span>
                    </div>
                  </label>

                  {/* Text Color */}
                  <label className={s.pickerItem}>
                    <span className={s.pickerLabel}>Màu Chữ (Text / Ink):</span>
                    <div className={s.pickerInputRow}>
                      <input
                        type="color"
                        className={s.nativeColorPicker}
                        value={customColors.text}
                        onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      />
                      <span className={s.hexValue}>{customColors.text}</span>
                    </div>
                  </label>

                  {/* Card Color */}
                  <label className={s.pickerItem}>
                    <span className={s.pickerLabel}>Màu Khung Thẻ (Card):</span>
                    <div className={s.pickerInputRow}>
                      <input
                        type="color"
                        className={s.nativeColorPicker}
                        value={customColors.card || '#FFFFFF'}
                        onChange={(e) => handleCustomColorChange('card', e.target.value)}
                      />
                      <span className={s.hexValue}>{customColors.card || '#FFFFFF'}</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={s.footer}>
          <button type="button" className={s.cancelBtn} onClick={handleCancel}>
            Hủy
          </button>
          <button
            type="button"
            className={s.saveBtn}
            onClick={handleSave}
            disabled={tab === 'upload' && !rawImage && !selectedPreset}
          >
            Lưu Thay Đổi ✨
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
