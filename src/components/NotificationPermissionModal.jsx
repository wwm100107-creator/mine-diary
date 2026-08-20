import React, { useState } from 'react'
import { requestNotificationPermission } from '../lib/push'
import s from './NotificationPermissionModal.module.css'

export default function NotificationPermissionModal({ user, onClose, onPermissionGranted }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleGrant = async () => {
    setLoading(true)
    try {
      const token = await requestNotificationPermission(user)
      if (token) {
        setSuccess(true)
        if (onPermissionGranted) onPermissionGranted(token)
        setTimeout(() => {
          onClose()
        }, 1200)
      } else {
        // If permission was denied by browser prompt
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
          {success ? 'Đã Bật Thông Báo Thành Công! 🎉' : 'Bật Thông Báo Nhắc Nhở 🌸'}
        </h3>

        {/* Prompt Copy */}
        <p className={s.description}>
          {success
            ? 'Từ bây giờ bạn sẽ nhận được thông báo tin nhắn và lời nhắc yêu thương ngay tức thì!'
            : 'Cho phép Minediary gửi thông báo để không bỏ lỡ tin nhắn và nhắc nhở từ người ấy nhé! 💖'}
        </p>

        {/* Highlight Feature Badges */}
        {!success && (
          <div className={s.featureGrid}>
            <div className={s.featureTag}>
              <span>💌</span> Tin nhắn từ người ấy
            </div>
            <div className={s.featureTag}>
              <span>🌸</span> Nhắc nhở chu kỳ & thuốc
            </div>
            <div className={s.featureTag}>
              <span>✨</span> Nhận khi thoát ứng dụng
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
          <button
            type="button"
            className={`${s.grantBtn} ${success ? s.successBtn : ''}`}
            onClick={success ? onClose : handleGrant}
            disabled={loading}
          >
            {loading ? 'Đang kích hoạt...' : success ? 'Tuyệt vời! ✨' : 'Cho Phép Ngay ✨'}
          </button>
        </div>
      </div>
    </div>
  )
}
