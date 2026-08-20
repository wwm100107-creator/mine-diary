import React, { useState, useEffect, useRef } from 'react'
import s from './PixelToast.module.css'
import AvatarWithFrame from './AvatarWithFrame'

function ToastItem({ toast, onDismiss, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  
  const duration = toast.duration || 4500
  const remainingTimeRef = useRef(duration)
  const startTimeRef = useRef(Date.now())
  const timerRef = useRef(null)
  const progressIntervalRef = useRef(null)

  const isCare = toast.type === 'care_reminder' || toast.isSystemMessage || toast.variant === 'care'

  const handleStartTimer = () => {
    startTimeRef.current = Date.now()
    timerRef.current = setTimeout(() => {
      handleClose()
    }, remainingTimeRef.current)

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed)
      setProgress((currentRemaining / duration) * 100)
    }, 50)
  }

  const handlePauseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    const elapsed = Date.now() - startTimeRef.current
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed)
  }

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(toast.id)
    }, 280)
  }

  useEffect(() => {
    handleStartTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  return (
    <div
      className={`${s.pixelToast} ${isCare ? s.toastCare : s.toastNormal} ${isExiting ? s.pixelToastExiting : ''}`}
      onMouseEnter={() => {
        setIsHovered(true)
        handlePauseTimer()
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        handleStartTimer()
      }}
      onClick={() => {
        onClick?.(toast)
        handleClose()
      }}
      role="alert"
      aria-live="assertive"
    >
      {/* Care Sparkling Heart Icon */}
      {isCare && <span className={s.sparkleHeartBadge}>💖</span>}

      {/* Sender Avatar */}
      <div className={s.avatarWrap}>
        <AvatarWithFrame
          avatarUrl={toast.avatar || 'bunny'}
          frameId={toast.avatarFrame || toast.frame || 'none'}
          size={36}
          border={false}
        />
      </div>

      {/* Content Area */}
      <div className={s.contentWrap}>
        <div className={s.topRow}>
          <span className={`${s.senderName} ${isCare ? s.senderNameCare : ''}`}>
            {toast.senderName || 'Người bạn'}
          </span>
          <span className={`${s.tagBadge} ${isCare ? s.tagBadgeCare : s.tagBadgeNormal}`}>
            {isCare ? '💖 Yêu thương' : '💬 Tin nhắn mới'}
          </span>
        </div>

        <div className={`${s.messageSnippet} ${isCare ? s.messageSnippetCare : ''}`} title={toast.text}>
          {toast.text || 'Đã gửi một tin nhắn cho bạn...'}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        className={s.closeBtn}
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        title="Đóng thông báo"
        aria-label="Đóng thông báo"
      >
        ✕
      </button>

      {/* Progress countdown bar */}
      <div
        className={`${s.countdownProgress} ${isCare ? s.countdownProgressCare : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export default function PixelToastContainer({ toasts, onDismiss, onToastClick }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className={s.toastContainer}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onClick={onToastClick}
        />
      ))}
    </div>
  )
}
