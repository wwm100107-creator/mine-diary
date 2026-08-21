import React, { useState } from 'react'
import { requestPushPermission } from '../lib/push'
import { usePwaInstallState } from '../hooks/usePwaInstallState'
import s from './NotificationPermissionModal.module.css'

export default function NotificationPermissionModal({ user, onClose, onPermissionGranted }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { isIOS, isStandalone, needsIosInstallFirst, canInstall, promptInstall } = usePwaInstallState()

  const handleGrant = async () => {
    setLoading(true)
    try {
      const token = await requestPushPermission(user)
      if (token) {
        setSuccess(true)
        if (onPermissionGranted) onPermissionGranted(token)
        setTimeout(() => {
          onClose()
        }, 1200)
      } else {
        onClose()
      }
    } catch (err) {
      console.warn('[NotificationModal] Permission error:', err)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('minediary:dismiss_notif_modal', 'true')
    } catch (e) {}
    onClose()
  }

  return (
    <div className={s.modalOverlay} onClick={handleDismiss}>
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Decorative Sparkle Aura */}
        <div className={s.topSparkleAura} aria-hidden="true" />

        {/* Cute Floating Pixel Avatar / Icon */}
        <div className={s.iconWrapper}>
          <div className={s.iconBubble}>
            <span className={s.mainIcon}>🔔</span>
            <span className={s.subIcon}>💖</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={s.title}>
          {success
            ? 'Đã Bật Thông Báo Thành Công! 🎉'
            : needsIosInstallFirst
            ? 'Cài Đặt PWA Màn Hình Khóa 📱'
            : 'Bật Thông Báo Màn Hình Khóa 🌸'}
        </h3>

        {/* Prompt Copy */}
        <p className={s.description}>
          {success
            ? 'Từ bây giờ bạn sẽ nhận được thông báo tin nhắn và lời nhắc yêu thương ngay tức thì kể cả khi tắt app!'
            : needsIosInstallFirst
            ? 'Trên iPhone/iPad (iOS 16.4+), Apple yêu cầu thêm App ra Màn hình chính để kích hoạt tính năng nhận thông báo ngoài màn hình khóa.'
            : 'Cho phép Mine Diary gửi thông báo để không bỏ lỡ tin nhắn và nhắc nhở chu kỳ từ người ấy kể cả khi đã tắt app nhé! 💖'}
        </p>

        {/* iOS 16.4+ Step-by-Step Helper Guide */}
        {needsIosInstallFirst && !success && (
          <div className={s.featureGrid} style={{ background: '#FFF0F5', borderColor: '#FF8FAB' }}>
            <div className={s.featureTag}>
              <span>1️⃣</span> Bấm nút <strong>Chia sẻ ⎋</strong> ở thanh dưới Safari
            </div>
            <div className={s.featureTag}>
              <span>2️⃣</span> Chọn <strong>Thêm vào Màn hình chính ➕</strong>
            </div>
            <div className={s.featureTag}>
              <span>3️⃣</span> Mở App từ màn hình chính để nhận thông báo!
            </div>
          </div>
        )}

        {/* Highlight Feature Badges */}
        {!needsIosInstallFirst && !success && (
          <div className={s.featureGrid}>
            <div className={s.featureTag}>
              <span>💌</span> Tin nhắn từ người ấy (khi tắt màn hình)
            </div>
            <div className={s.featureTag}>
              <span>🌸</span> Lời nhắc chu kỳ yêu thương
            </div>
            <div className={s.featureTag}>
              <span>⚡</span> Hoạt động trên cả Android & iOS 16.4+
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={s.actionRow}>
          {!success && (
            <button
              type="button"
              className={s.dismissBtn}
              onClick={handleDismiss}
              disabled={loading}
            >
              Để sau nha
            </button>
          )}

          {needsIosInstallFirst ? (
            <button
              type="button"
              className={s.grantBtn}
              onClick={handleDismiss}
            >
              Đã hiểu, để mình thêm! 📲
            </button>
          ) : (
            <button
              type="button"
              className={`${s.grantBtn} ${success ? s.successBtn : ''}`}
              onClick={success ? onClose : handleGrant}
              disabled={loading}
            >
              {loading ? 'Đang kích hoạt...' : success ? 'Tuyệt vời! ✨' : 'Cho Phép Ngay ✨'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
