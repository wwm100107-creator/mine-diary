import React, { useState, useEffect } from 'react'
import s from './IosInstallBottomSheet.module.css'

export default function IosInstallBottomSheet({ isIOS, isStandalone }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Only show on iOS/iPadOS when in Browser mode (!isStandalone)
    if (!isIOS || isStandalone) {
      setIsOpen(false)
      return
    }

    // Check if dismissed recently in localStorage
    try {
      const dismissedUntil = localStorage.getItem('minediary:ios_install_dismissed')
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        return
      }
    } catch (e) {}

    // Delay 1.5s after load so user is not bombarded instantly
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isIOS, isStandalone])

  const handleDismiss = () => {
    setIsOpen(false)
    try {
      // Cooldown for 24 hours
      localStorage.setItem('minediary:ios_install_dismissed', String(Date.now() + 24 * 3600 * 1000))
    } catch (e) {}
  }

  if (!isOpen) return null

  return (
    <div className={s.sheetContainer} role="dialog" aria-modal="true">
      <div className={s.sheetBackdrop} onClick={handleDismiss} />
      <div className={s.sheetCard}>
        {/* Decorative Pink Ribbon Bar */}
        <div className={s.topBarIndicator} />

        <button
          type="button"
          className={s.closeBtn}
          onClick={handleDismiss}
          aria-label="Đóng hướng dẫn"
        >
          ✕
        </button>

        <div className={s.contentWrap}>
          {/* Cute Floating Mascot Header */}
          <div className={s.headerRow}>
            <div className={s.mascotBadge}>
              <span className={s.mascotEmoji}>🐰</span>
              <span className={s.sparkleBadge}>✨</span>
            </div>
            <div className={s.headerText}>
              <h4 className={s.title}>Cài Đặt Mine Diary 🌸</h4>
              <p className={s.subtitle}>
                Thêm ra Màn hình chính để nhận thông báo tin nhắn và lời nhắc chu kỳ ngoài màn hình khóa nhé! 💖
              </p>
            </div>
          </div>

          {/* 2-Step Visual Guidance Cards */}
          <div className={s.stepsGrid}>
            <div className={s.stepCard}>
              <div className={s.stepNumberBadge}>1</div>
              <div className={s.stepIconBox}>
                <svg viewBox="0 0 24 24" className={s.safariShareIcon} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <div className={s.stepInfo}>
                <span className={s.stepAction}>Bấm nút <strong>Chia sẻ</strong></span>
                <span className={s.stepHint}>ở thanh dưới cùng Safari</span>
              </div>
            </div>

            <div className={s.stepCard}>
              <div className={s.stepNumberBadge}>2</div>
              <div className={s.stepIconBox}>
                <span className={s.addPlusEmoji}>➕</span>
              </div>
              <div className={s.stepInfo}>
                <span className={s.stepAction}>Chọn <strong>Thêm vào MH chính</strong></span>
                <span className={s.stepHint}>(Add to Home Screen)</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className={s.bottomRow}>
            <div className={s.pointingArrowWrap}>
              <span className={s.bounceArrow}>👇</span>
              <span className={s.arrowText}>Nút chia sẻ ở ngay dưới thanh này</span>
            </div>
            <button
              type="button"
              className={s.gotItBtn}
              onClick={handleDismiss}
            >
              Đã hiểu rồi! 📲
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
