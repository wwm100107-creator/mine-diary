import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PixelAvatar from './PixelAvatar'
import AvatarFrameOverlay, { AVATAR_FRAMES } from './AvatarFrameOverlay'
import { AVATARS } from '../utils/avatars'
import { cropToSquare, generatePixelArt } from '../utils/pixelArt'
import s from './AvatarUploadModal.module.css'

export default function AvatarUploadModal({ currentAvatar, currentFrame = 'none', onSave, onClose }) {
  const [tab, setTab] = useState('upload') // 'upload' | 'preset'
  const [rawImage, setRawImage] = useState(null)
  const [originalPreview, setOriginalPreview] = useState(null)
  const [pixelatedPreview, setPixelatedPreview] = useState(null)
  const [avatarChoice, setAvatarChoice] = useState('pixel') // 'pixel' | 'original'
  const [pixelDensity, setPixelDensity] = useState(40) // 32 | 40 | 48
  const [selectedPreset, setSelectedPreset] = useState(currentAvatar || 'bunny')
  const [selectedFrame, setSelectedFrame] = useState(currentFrame || 'none')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

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
    onSave(finalAvatar, selectedFrame)
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={s.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Cập nhật avatar">
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <div className={s.titleGroup}>
            <span className={s.titleIcon}>🎨</span>
            <h3 className={s.title}>Cập Nhật Avatar & Khung Viền</h3>
          </div>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Đóng">
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

          {/* ── 4. Animated Frame Selection Section (Horizontal Scroller) ── */}
          <div className={s.frameSelectorSection}>
            <div className={s.frameSelectorHeader}>
              <span className={s.frameSelectorTitle}>✨ Chọn Khung Viền Pixel Động:</span>
              <span className={s.selectedFrameBadge}>
                {AVATAR_FRAMES.find((f) => f.id === selectedFrame)?.name || 'Mặc định'}
              </span>
            </div>

            <div className={s.framesScrollRow}>
              {AVATAR_FRAMES.map((frame) => {
                const isFrameActive = selectedFrame === frame.id
                return (
                  <button
                    key={frame.id}
                    type="button"
                    className={`${s.frameOptionCard} ${isFrameActive ? s.frameActive : ''}`}
                    onClick={() => setSelectedFrame(frame.id)}
                    title={`${frame.name} (${frame.desc})`}
                  >
                    <div className={s.miniFramePreview}>
                      <PixelAvatar
                        avatarId={rawImage ? (avatarChoice === 'pixel' ? pixelatedPreview : originalPreview) : selectedPreset}
                        size={32}
                        border={false}
                        frameId={frame.id}
                      />
                    </div>
                    <span className={s.frameCardName}>
                      {frame.icon} {frame.name}
                    </span>
                    {isFrameActive && <span className={s.frameCheckBadge}>✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={s.footer}>
          <button type="button" className={s.cancelBtn} onClick={onClose}>
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
