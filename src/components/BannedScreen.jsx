import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { submitBanAppeal } from '../lib/admin'
import s from './BannedScreen.module.css'

export default function BannedScreen({ banDetails, onLogout, onAppealSubmitted }) {
  const { userId, banReason, banUntilDate, appeal } = banDetails || {}

  // ── Countdown Timer State ──
  const [now, setNow] = useState(Date.now())
  const [isAppealOpen, setIsAppealOpen] = useState(false)
  const [appealMessage, setAppealMessage] = useState('')
  const [appealSubmitting, setAppealSubmitting] = useState(false)
  const [appealSuccess, setAppealSuccess] = useState('')
  const [appealError, setAppealError] = useState('')

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate remaining time
  const targetDate = useMemo(() => {
    if (!banUntilDate) return null
    return banUntilDate instanceof Date ? banUntilDate : new Date(banUntilDate)
  }, [banUntilDate])

  const timeDiff = targetDate ? Math.max(0, targetDate.getTime() - now) : null
  const isPermanent = !targetDate
  const isExpired = targetDate && timeDiff <= 0

  const countdownParts = useMemo(() => {
    if (!targetDate || isExpired) return null
    const totalSecs = Math.floor(timeDiff / 1000)
    const days = Math.floor(totalSecs / 86400)
    const hours = Math.floor((totalSecs % 86400) / 3600)
    const minutes = Math.floor((totalSecs % 3600) / 60)
    const seconds = totalSecs % 60

    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    }
  }, [targetDate, timeDiff, isExpired])

  // Handle Appeal Submit
  const handleSendAppeal = async (e) => {
    e?.preventDefault()
    if (!appealMessage.trim()) return

    setAppealSubmitting(true)
    setAppealError('')
    try {
      await submitBanAppeal({
        userId: userId || 'unknown',
        appealMessage: appealMessage.trim(),
      })
      setAppealSuccess('Đã gửi đơn khiếu nại thành công! Quản trị viên sẽ sớm xem xét giải quyết.')
      onAppealSubmitted?.()
      setTimeout(() => {
        setIsAppealOpen(false)
      }, 2500)
    } catch (err) {
      setAppealError(err.message || 'Gửi khiếu nại thất bại. Vui lòng thử lại!')
    } finally {
      setAppealSubmitting(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className={s.bannedOverlay} role="alertdialog" aria-modal="true" aria-label="Tài khoản bị khóa">
      
      {/* Pixel floating background particles */}
      <div className={s.pixelDust} aria-hidden="true" />

      {/* Main Center Card */}
      <div className={s.bannedCard}>
        
        {/* Top Header with Crying Pixel Mascot & Warning */}
        <div className={s.cardHeader}>
          <div className={s.mascotWrapper}>
            <div className={s.cryingMascot} aria-hidden="true">😿🐰</div>
            <div className={s.warningPill}>⚠️ LỆNH CẤM TRUY CẬP</div>
          </div>
          <h1 className={s.mainTitle}>
            {isPermanent ? 'Tài Khoản Đã Bị Khóa Vĩnh Viễn!' : 'Tài Khoản Đã Bị Tạm Khóa!'}
          </h1>
          <p className={s.subtitle}>
            Rất tiếc, tài khoản <strong className={s.uidTag}>#{userId || 'User'}</strong> của bạn hiện đang bị giới hạn quyền truy cập do vi phạm quy định cộng đồng.
          </p>
        </div>

        {/* Reason Box */}
        <div className={s.reasonBox}>
          <div className={s.reasonHeader}>
            <span className={s.reasonIcon}>📜</span>
            <span className={s.reasonLabel}>Lý do từ Quản trị viên:</span>
          </div>
          <div className={s.reasonContent}>
            "{banReason || 'Vi phạm tiêu chuẩn cộng đồng hoặc có hành vi không phù hợp.'}"
          </div>
        </div>

        {/* Countdown Timer Area */}
        <div className={s.timerSection}>
          <div className={s.timerHeader}>
            <span>⏳ THỜI GIAN KHÓA CÒN LẠI</span>
          </div>

          {isPermanent ? (
            <div className={s.permanentBadge}>
              <span className={s.permanentIcon}>⛔</span>
              <span>KHÓA VĨNH VIỄN — KHÔNG THỂ TỰ MỞ</span>
            </div>
          ) : isExpired ? (
            <div className={s.expiredBadge}>
              <span className={s.expiredIcon}>🎉</span>
              <span>Thời hạn cấm đã kết thúc! Bạn có thể đăng xuất và đăng nhập lại ngay.</span>
            </div>
          ) : (
            <div className={s.countdownDisplay}>
              <div className={s.countdownUnit}>
                <span className={s.countdownNum}>{countdownParts?.days}</span>
                <span className={s.countdownLabel}>NGÀY</span>
              </div>
              <span className={s.colonDivider}>:</span>
              <div className={s.countdownUnit}>
                <span className={s.countdownNum}>{countdownParts?.hours}</span>
                <span className={s.countdownLabel}>GIỜ</span>
              </div>
              <span className={s.colonDivider}>:</span>
              <div className={s.countdownUnit}>
                <span className={s.countdownNum}>{countdownParts?.minutes}</span>
                <span className={s.countdownLabel}>PHÚT</span>
              </div>
              <span className={s.colonDivider}>:</span>
              <div className={s.countdownUnit}>
                <span className={s.countdownNum}>{countdownParts?.seconds}</span>
                <span className={s.countdownLabel}>GIÂY</span>
              </div>
            </div>
          )}
        </div>

        {/* Existing Appeal Notice if any */}
        {appeal && (
          <div className={s.existingAppealBox}>
            <div className={s.appealStatusLine}>
              <span>💌 Trạng thái khiếu nại:</span>
              <span className={`${s.appealStatusTag} ${s[appeal.status]}`}>
                {appeal.status === 'pending' ? '⏳ Đang chờ Admin duyệt' : appeal.status === 'approved' ? '✓ Đã chấp thuận' : '✕ Bị từ chối'}
              </span>
            </div>
            <p className={s.appealTextPreview}>"{appeal.message}"</p>
          </div>
        )}

        {/* Bottom Action Buttons (Horizontal Row) */}
        <div className={s.actionRow}>
          <button
            type="button"
            className={s.appealBtn}
            onClick={() => {
              setAppealSuccess('')
              setAppealError('')
              setIsAppealOpen(true)
            }}
          >
            <span className={s.btnIcon}>💌</span>
            <span>Gửi Khiếu Nại</span>
          </button>

          <button
            type="button"
            className={s.logoutBtn}
            onClick={onLogout}
          >
            <span className={s.btnIcon}>🚪</span>
            <span>Đăng Xuất</span>
          </button>
        </div>

      </div>

      {/* ── Modal Gửi Khiếu Nại (Appeal Modal) ── */}
      {isAppealOpen && (
        <div className={s.appealModalOverlay} onClick={() => !appealSubmitting && setIsAppealOpen(false)}>
          <div className={s.appealModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={s.appealModalHeader}>
              <div className={s.appealModalTitleGroup}>
                <span className={s.appealModalIcon}>💌</span>
                <h3 className={s.appealModalTitle}>Gửi Đơn Khiếu Nại Ban</h3>
              </div>
              <button
                type="button"
                className={s.appealCloseBtn}
                onClick={() => setIsAppealOpen(false)}
                disabled={appealSubmitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAppeal} className={s.appealForm}>
              <p className={s.appealGuideline}>
                Nếu bạn cho rằng đây là một sự nhầm lẫn hoặc muốn giải trình với Quản trị viên, vui lòng ghi rõ lý do bên dưới:
              </p>

              <textarea
                className={s.appealTextarea}
                rows={4}
                placeholder="Nhập lời giải trình, lý do bạn muốn mở khóa tài khoản..."
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                required
                disabled={appealSubmitting}
                autoFocus
              />

              {appealError && <div className={s.appealErrorMsg}>⚠️ {appealError}</div>}
              {appealSuccess && <div className={s.appealSuccessMsg}>✨ {appealSuccess}</div>}

              <div className={s.appealModalActions}>
                <button
                  type="button"
                  className={s.appealCancelBtn}
                  onClick={() => setIsAppealOpen(false)}
                  disabled={appealSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={s.appealSubmitBtn}
                  disabled={appealSubmitting || !appealMessage.trim()}
                >
                  {appealSubmitting ? 'Đang gửi...' : 'Gửi Kháng Nghị 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>,
    document.body
  )
}
