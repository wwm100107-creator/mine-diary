import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import PixelAvatar from './PixelAvatar'
import { ATTENDANCE_ROADMAP, getUserVipTier } from '../utils/vipTiers'
import { claimDailyAttendance, canCheckInToday } from '../lib/attendance'
import s from './AttendanceModal.module.css'

export default function AttendanceModal({ user, onUpdateUser, onClose }) {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const currentVip = getUserVipTier(user)
  const reqDaysForVip = currentVip?.reqDays || 0

  const attendance = user?.attendance || { streak: 0, lastCheckInDate: null, claimedDays: [] }
  const claimedDays = new Set(attendance.claimedDays || [])
  for (let d = 1; d <= reqDaysForVip; d++) {
    claimedDays.add(d)
  }
  const streak = Math.max(attendance.streak || 0, reqDaysForVip)
  const isAvailableToday = canCheckInToday(user)
  const nextClaimDay = isAvailableToday ? Math.min(streak + 1, 30) : streak

  const handleClaim = async () => {
    if (!isAvailableToday || loading) return
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const result = await claimDailyAttendance(user)
      onUpdateUser?.(result.updatedUser)

      if (result.unlockedNewTier) {
        setSuccessMessage(`🎉 CHÚC MỪNG! Bạn đã thăng hạng lên ${result.vipTier.toUpperCase()} và mở khóa thêm khung viền mới!`)
      } else {
        setSuccessMessage(`✨ Điểm danh Ngày ${result.dayClaimed} thành công! Hãy tiếp tục duy trì để mở khóa GOD 🌌!`)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi điểm danh. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div className={s.modalOverlay} onClick={onClose}>
      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.modalHeader}>
          <div className={s.headerTitleWrap}>
            <span className={s.headerIcon}>🎁</span>
            <div>
              <h2 className={s.modalTitle}>Lộ Trình 30 Ngày Điểm Danh Nhận VIP</h2>
              <p className={s.modalSubtitle}>
                Điểm danh mỗi ngày để nâng cấp quyền hạn và mở khóa khung viền huyền thoại!
              </p>
            </div>
          </div>
          <button type="button" className={s.closeBtn} onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        {/* Current VIP Status Card */}
        <div className={s.userStatusCard}>
          <div className={s.statusLeft}>
            <PixelAvatar avatarId={user?.avatar || 'bunny'} frameId={user?.avatarFrame || 'none'} size={44} border={false} />
            <div>
              <div className={s.userNameText}>{user?.displayName || user?.username || 'Bạn'}</div>
              <div className={s.userVipBadge} style={{ color: currentVip.color, background: currentVip.bg }}>
                {currentVip.badge} (Rank {currentVip.rank}/4)
              </div>
            </div>
          </div>
          <div className={s.streakCounter}>
            <span className={s.streakLabel}>Chuỗi điểm danh</span>
            <span className={s.streakValue}>{streak} / 30 Ngày</span>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className={s.successBanner}>
            <span>🎉</span> {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className={s.errorBanner}>
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        {/* 30-Day Grid */}
        <div className={s.gridContainer}>
          {ATTENDANCE_ROADMAP.map((item) => {
            const isClaimed = claimedDays.has(item.day)
            const isToday = isAvailableToday && item.day === nextClaimDay
            const isLocked = !isClaimed && item.day > nextClaimDay

            return (
              <div
                key={item.day}
                className={`${s.dayCard} ${isClaimed ? s.dayClaimed : ''} ${isToday ? s.dayToday : ''} ${item.isMilestone ? s.milestoneCard : ''}`}
              >
                <div className={s.dayHeader}>
                  <span className={s.dayBadge}>Ngày {item.day}</span>
                  {isClaimed && <span className={s.checkMark}>✓</span>}
                  {isToday && <span className={s.todayTag}>Hôm nay</span>}
                </div>

                {/* Reward Preview */}
                <div className={s.rewardPreview}>
                  {item.isMilestone ? (
                    <div className={s.milestoneFrameBox}>
                      <PixelAvatar avatarId="bunny" frameId={item.frameId} size={36} border={false} />
                      <div className={s.milestoneBadgeTag} style={{ color: item.badge?.includes('GOD') ? '#9333EA' : item.badge?.includes('SSS') ? '#D97706' : item.badge?.includes('SS') ? '#0284C7' : '#EF4444' }}>
                        {item.badge}
                      </div>
                    </div>
                  ) : (
                    <div className={s.regularRewardBox}>
                      <span className={s.regularIcon}>{item.icon}</span>
                      <span className={s.regularText}>{item.desc}</span>
                    </div>
                  )}
                </div>

                {/* Card footer / status */}
                <div className={s.cardFooter}>
                  {isClaimed ? (
                    <span className={s.statusClaimed}>Đã nhận</span>
                  ) : isToday ? (
                    <span className={s.statusReady}>Sẵn sàng!</span>
                  ) : (
                    <span className={s.statusLocked}>🔒 Khóa</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className={s.modalFooter}>
          {isAvailableToday ? (
            <button
              type="button"
              className={s.claimActionBtn}
              onClick={handleClaim}
              disabled={loading}
            >
              {loading ? '⏳ Đang nhận thưởng...' : `🎁 Điểm Danh Nhận Quà Ngày ${nextClaimDay} Ngay!`}
            </button>
          ) : (
            <div className={s.alreadyCheckedInNotice}>
              ✓ Hôm nay bạn đã điểm danh rồi. Hãy quay lại vào ngày mai nhé! ✨
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
