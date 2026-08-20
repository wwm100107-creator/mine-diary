import React, { useState, useMemo, useEffect } from 'react'
import s from './PartnerCycleView.module.css'
import Calendar from './Calendar'
import FertilityBar from './FertilityBar'
import HealthChart from './HealthChart'
import AvatarWithFrame from './AvatarWithFrame'
import { subscribeToUserRelationships, sendChatMessage } from '../lib/social'
import { usePartnerCycleData } from '../hooks/usePartnerCycleData'

const CARE_PRESETS = [
  { icon: '🍵', title: 'Uống nước ấm', text: 'Em nhớ uống một ly nước ấm và giữ ấm bụng nha 💖' },
  { icon: '🧋', title: 'Đặt trà sữa', text: 'Hôm nay mệt không em? Để anh đặt trà sữa / đồ ngọt cho em nhé! 🧋✨' },
  { icon: '🌙', title: 'Nghỉ ngơi sớm', text: 'Hôm nay em đã vất vả rồi, tối nay nhớ đi ngủ sớm và giữ sức khỏe nha 🌙' },
  { icon: '💊', title: 'Nhắc uống thuốc', text: 'Em yêu đừng quên uống thuốc hoặc bổ sung vitamin đúng giờ nhé! 💊' },
  { icon: '🌸', title: 'Hỏi han chu kỳ', text: 'Chu kỳ sắp tới rồi, em thấy trong người có khó chịu hay đau lưng không? ❤️' },
  { icon: '❤️', title: 'Thương em', text: 'Thương em nhiều lắm, lúc nào cũng có anh ở bên cạnh chăm sóc em! 🥰' },
]

export default function PartnerCycleView({ user }) {
  const [userRelationships, setUserRelationships] = useState([])
  const [customMsg, setCustomMsg] = useState('')
  const [sentToast, setSentToast] = useState('')

  // 1. Subscribe to relationships to find partner
  useEffect(() => {
    if (!user?.id) return
    const unsubscribe = subscribeToUserRelationships(user.id, (rels) => {
      setUserRelationships(rels)
    })
    return () => unsubscribe()
  }, [user?.id])

  const coupleRel = useMemo(() => {
    return userRelationships.find(
      (r) => r.status === 'accepted' && (r.shareCycleData || r.type === 'couple')
    )
  }, [userRelationships])

  const partnerId = useMemo(() => {
    if (!coupleRel) return null
    return coupleRel.participants.find((p) => p !== user.id)
  }, [coupleRel, user?.id])

  // 2. Fetch Partner Cycle Data
  const {
    hasPermission,
    partnerUser,
    prediction,
    loading,
  } = usePartnerCycleData(user.id, partnerId)

  // 3. Send Care Message to 1-on-1 Chat
  const handleSendLoveMessage = async (textToSend) => {
    const finalMsg = (textToSend || customMsg).trim()
    if (!finalMsg || !user?.id || !partnerId) return

    try {
      await sendChatMessage(user.id, partnerId, finalMsg, {
        isSystemMessage: true,
        type: 'care_reminder',
        metadata: { icon: '💌', title: 'Lời Nhắc Yêu Thương' },
      })
      setCustomMsg('')
      setSentToast('Đã gửi lời yêu thương vào phòng chat của 2 bạn! 💌')
      setTimeout(() => setSentToast(''), 3500)
    } catch (err) {
      console.error('Send care message error:', err)
    }
  }

  if (!coupleRel || !partnerUser) {
    return (
      <div className={s.partnerView}>
        <div className={s.pixelCard} style={{ textAlign: 'center', padding: 48, margin: 'auto' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💖</div>
          <h3 className={s.cardTitle} style={{ justifyContent: 'center' }}>
            Chưa Có Kết Nối Người Thương
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', maxWidth: 360, margin: '8px auto 0', lineHeight: 1.5 }}>
            Hãy vào tab <strong>Tin nhắn 💬</strong> và bấm <strong>Set Quan Hệ</strong> với người thương của bạn để bắt đầu đồng bộ và chăm sóc chu kỳ nhé!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={s.partnerView} role="main" aria-label="Theo dõi chu kỳ người thương">
      {/* ── 1. Hero Banner: Partner Profile & Status ── */}
      <div className={s.partnerHeroBanner}>
        <div className={s.partnerHeroLeft}>
          <AvatarWithFrame
            avatarUrl={partnerUser.avatar || 'bunny'}
            frameId={partnerUser.avatarFrame || partnerUser.frame || 'none'}
            size={56}
          />
          <div>
            <h2 className={s.partnerHeroName}>
              {coupleRel.customIcon || '💖'} {partnerUser.displayName || partnerUser.name || partnerUser.id}
            </h2>
            <div className={s.partnerHeroSub}>
              UID: #{partnerUser.id} • Mối quan hệ: <strong>{coupleRel.customName}</strong>
            </div>
          </div>
        </div>

        {hasPermission ? (
          <div className={s.sharingStatusBadge}>
            <span>🌸</span> Đang chia sẻ chu kỳ thời gian thực
          </div>
        ) : (
          <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#E65100', fontWeight: 'bold' }}>
            🔒 Đối phương chưa bật quyền chia sẻ chu kỳ
          </div>
        )}
      </div>

      {hasPermission ? (
        <>
          {/* ── 2. Quick Key Stats ── */}
          <div className={s.statsRow}>
            <div className={s.statCard}>
              <span className={s.statLabel}><span>🌸</span> Kỳ kinh tiếp theo:</span>
              <span className={s.statValue}>
                {prediction?.predictedStart
                  ? prediction.predictedStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                  : 'Đang tính toán...'}
              </span>
            </div>
            <div className={s.statCard}>
              <span className={s.statLabel}><span>✨</span> Ngày rụng trứng:</span>
              <span className={s.statValue} style={{ color: '#8E24AA' }}>
                {prediction?.ovulationDate
                  ? prediction.ovulationDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                  : 'Đang tính toán...'}
              </span>
            </div>
            <div className={s.statCard}>
              <span className={s.statLabel}><span>⏳</span> Chu kỳ trung bình:</span>
              <span className={s.statValue} style={{ color: '#0284C7' }}>
                {prediction?.cycleLength ? `${prediction.cycleLength} ngày` : '28 ngày'}
              </span>
            </div>
          </div>

          {/* ── 3. Top Section: ReadOnly Calendar + Care Message Form ── */}
          <div className={s.topSection}>
            {/* Left: View-Only Calendar */}
            <div className={s.pixelCard}>
              <h3 className={s.cardTitle}>
                <span>📅</span> Lịch Chu Kỳ (Chế độ xem)
              </h3>
              <Calendar userId={partnerId} readOnly={true} />
            </div>

            {/* Right: Care Messages & Love Textarea */}
            <div className={s.pixelCard}>
              <h3 className={s.cardTitle} style={{ color: '#D81B60' }}>
                <span>💖</span> Nhắc Nhở & Hỏi Han Người Thương
              </h3>
              <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', margin: '-8px 0 12px 0' }}>
                Chọn lời nhắc nhanh hoặc tự soạn tin nhắn gửi thẳng vào phòng chat riêng của 2 bạn:
              </p>

              <div className={s.careBox}>
                {/* One-tap presets */}
                <div className={s.carePresetGrid}>
                  {CARE_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={s.carePresetBtn}
                      onClick={() => setCustomMsg(p.text)}
                      title={p.text}
                    >
                      <span>{p.icon}</span> {p.title}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  className={s.careTextarea}
                  placeholder="Gõ lời yêu thương, dặn dò hoặc hỏi han chu kỳ gửi đến người thương..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                />

                {sentToast && (
                  <div className={s.toastPill}>
                    ✓ {sentToast}
                  </div>
                )}

                <button
                  type="button"
                  className={s.sendLoveBtn}
                  onClick={() => handleSendLoveMessage()}
                  disabled={!customMsg.trim()}
                >
                  <span>💌</span> Gửi Yêu Thương Vào Chat
                </button>
              </div>
            </div>
          </div>

          {/* ── 4. Middle: Fertility Strip ── */}
          <FertilityBar prediction={prediction} />

          {/* ── 5. Bottom: Historical Charts ── */}
          <div className={s.pixelCard}>
            <h3 className={s.cardTitle}><span>📊</span> Thống Kê & Phân Tích Chu Kỳ</h3>
            <HealthChart userId={partnerId} />
          </div>
        </>
      ) : (
        /* Permission Locked Notice */
        <div className={s.pixelCard} style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🔒</div>
          <h3 className={s.cardTitle} style={{ justifyContent: 'center', color: '#D81B60' }}>
            Chưa Được Cấp Quyền Truy Cập Dữ Liệu
          </h3>
          <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', maxWidth: 420, margin: '8px auto', lineHeight: 1.5 }}>
            Bạn và <strong>{partnerUser.displayName}</strong> đã kết đôi thành công. Khi nào bạn ấy đồng ý chia sẻ thông tin chu kỳ, lịch và dự đoán sẽ tự động hiển thị tại đây nhé!
          </p>
        </div>
      )}
    </div>
  )
}
