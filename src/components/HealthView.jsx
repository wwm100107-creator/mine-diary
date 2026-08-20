import { useState, useMemo, useEffect } from 'react'
import s from './HealthView.module.css'
import HealthCalendar from './HealthCalendar'
import SymptomCards from './SymptomCards'
import HealthChart from './HealthChart'
import FertilityBar from './FertilityBar'
import AvatarWithFrame from './AvatarWithFrame'
import { today, loadMarkedDates, getCustomTrayIcons } from '../utils/cycle'
import { useCycleCalendar } from '../hooks/useCycleCalendar'
import {
  syncUserCycleData,
  subscribeToUserRelationships,
  sendChatMessage,
  updateUserPredictionMode,
} from '../lib/social'
import { usePartnerCycleData } from '../hooks/usePartnerCycleData'

const CARE_MESSAGES = [
  { icon: '🍵', title: 'Uống nước ấm', text: 'Em nhớ uống một ly nước ấm và giữ ấm bụng nha 💖' },
  { icon: '🧋', title: 'Đặt trà sữa', text: 'Hôm nay mệt không em? Để anh đặt trà sữa / đồ ngọt cho em nhé! 🧋✨' },
  { icon: '🌙', title: 'Nghỉ ngơi sớm', text: 'Hôm nay em đã vất vả rồi, tối nay nhớ đi ngủ sớm và giữ sức khỏe nha 🌙' },
  { icon: '💊', title: 'Nhắc uống thuốc', text: 'Em yêu đừng quên uống thuốc hoặc bổ sung vitamin đúng giờ nhé! 💊' },
  { icon: '🌸', title: 'Hỏi han chu kỳ', text: 'Chu kỳ sắp tới rồi, em thấy trong người có khó chịu hay đau lưng không? ❤️' },
  { icon: '❤️', title: 'Thương em', text: 'Thương em nhiều lắm, lúc nào cũng có anh ở bên cạnh chăm sóc em! 🥰' },
]

export default function HealthView({ user }) {
  const [selectedDate, setSelectedDate] = useState(today())
  const [viewMode, setViewMode] = useState('self') // 'self' | 'partner'
  const [userRelationships, setUserRelationships] = useState([])
  const [sentToast, setSentToast] = useState('')

  // ── Prediction Mode State ('standard' | 'advanced') ──
  const [predictionMode, setPredictionMode] = useState(user?.predictionMode || 'standard')
  const [isUpdatingMode, setIsUpdatingMode] = useState(false)
  const [modeNotice, setModeNotice] = useState('')

  useEffect(() => {
    if (user?.predictionMode) {
      setPredictionMode(user.predictionMode)
    }
  }, [user?.predictionMode])

  const handleTogglePredictionMode = async (newMode) => {
    if (newMode === predictionMode || isUpdatingMode || !user?.id) return
    setIsUpdatingMode(true)
    setPredictionMode(newMode)
    setModeNotice('')
    try {
      await updateUserPredictionMode(user.id, newMode)
      setModeNotice(
        newMode === 'advanced'
          ? '✨ Đã bật Chế độ AI Bayesian (Quét BBT, LH & Dịch nhầy)!'
          : '🌿 Đã chuyển sang Chế độ Chu kỳ Chuẩn (Standard Days)!'
      )
      setTimeout(() => setModeNotice(''), 3000)
    } catch (err) {
      console.error('Failed to update predictionMode:', err)
    } finally {
      setIsUpdatingMode(false)
    }
  }

  // 1. Centralized Cycle Prediction Hook (Standard vs Advanced AI)
  const {
    prediction,
    markedDates: allMarks,
    insights,
    confidence,
    bbtShiftDetected,
    lhPeakDetected,
  } = useCycleCalendar({
    userId: user?.id,
    mode: predictionMode,
  })

  useEffect(() => {
    if (!user?.id) return
    const customIcons = getCustomTrayIcons(user.id)
    syncUserCycleData(user.id, {
      markedDates: allMarks,
      customIcons,
    })
  }, [user?.id, allMarks])

  // 2. Subscribe to relationships to find partner
  useEffect(() => {
    if (!user?.id) return
    const unsubscribe = subscribeToUserRelationships(user.id, (rels) => {
      setUserRelationships(rels)
    })
    return () => unsubscribe()
  }, [user?.id])

  // Find partner who accepted a relationship (especially Couple with shareCycleData)
  const coupleRel = useMemo(() => {
    return userRelationships.find(
      (r) => r.status === 'accepted' && (r.shareCycleData || r.type === 'couple')
    )
  }, [userRelationships])

  const partnerId = useMemo(() => {
    if (!coupleRel) return null
    return coupleRel.participants.find((p) => p !== user.id)
  }, [coupleRel, user?.id])

  // 3. Hook to fetch Partner cycle data
  const {
    hasPermission: hasPartnerPermission,
    partnerUser,
    prediction: partnerPrediction,
    markedDates: partnerMarks,
    loading: partnerLoading,
  } = usePartnerCycleData(user.id, partnerId)

  // 4. Send quick care reminder into 1-on-1 chat
  const handleSendCareReminder = async (item) => {
    if (!user?.id || !partnerId) return
    try {
      await sendChatMessage(user.id, partnerId, item.text, {
        isSystemMessage: true,
        type: 'care_reminder',
        metadata: { icon: item.icon, title: item.title },
      })
      setSentToast(`Đã gửi "${item.title}" vào phòng chat của 2 bạn! 💌`)
      setTimeout(() => setSentToast(''), 3000)
    } catch (err) {
      console.error('Send care reminder error:', err)
    }
  }

  return (
    <div className={s.healthView} role="main" aria-label="Sức khỏe Nữ giới">
      
      {/* ── Top Prediction Algorithm Engine Switcher Card ── */}
      <div className={`${s.algorithmSwitcherCard} ${predictionMode === 'advanced' ? s.cardModeAdvanced : s.cardModeStandard}`}>
        <div className={s.algorithmInfoGroup}>
          <div className={s.algorithmIconWrap}>
            {predictionMode === 'advanced' ? '✨' : '🌿'}
          </div>
          <div className={s.algorithmTextWrap}>
            <div className={s.algorithmTitleRow}>
              <h3 className={s.algorithmTitle}>
                Thuật Toán Dự Đoán: {predictionMode === 'advanced' ? 'Chuyên Sâu (AI Bayesian)' : 'Cơ Bản (Standard Days)'}
              </h3>
              <span className={`${s.algorithmBadge} ${predictionMode === 'advanced' ? s.badgeAi : s.badgeStandard}`}>
                {predictionMode === 'advanced' ? '⚡ AI Đa Thông Số' : '🌱 Chu Kỳ Chuẩn'}
              </span>
            </div>
            <p className={s.algorithmDesc}>
              {predictionMode === 'advanced'
                ? 'Quét sâu BBT (thân nhiệt), que thử LH và dịch nhầy để bẻ cong lịch rụng trứng & cửa sổ thụ thai chính xác nhất.'
                : 'Tính toán chu kỳ trung bình thuần túy dựa trên lịch sử ngày dâu (O = Chu kỳ - 14 ngày).'}
            </p>
            {modeNotice && (
              <div className={s.modeNoticeBanner}>
                {modeNotice}
              </div>
            )}
          </div>
        </div>

        {/* Tactile Toggle Pill */}
        <div className={s.toggleContainer} role="radiogroup" aria-label="Chọn thuật toán dự đoán chu kỳ">
          <button
            type="button"
            className={`${s.toggleOptionBtn} ${predictionMode === 'standard' ? s.toggleActiveStandard : ''}`}
            onClick={() => handleTogglePredictionMode('standard')}
            disabled={isUpdatingMode}
            role="radio"
            aria-checked={predictionMode === 'standard'}
          >
            <span>🌿</span> Cơ Bản
          </button>
          <button
            type="button"
            className={`${s.toggleOptionBtn} ${predictionMode === 'advanced' ? s.toggleActiveAdvanced : ''}`}
            onClick={() => handleTogglePredictionMode('advanced')}
            disabled={isUpdatingMode}
            role="radio"
            aria-checked={predictionMode === 'advanced'}
          >
            <span>✨</span> Chuyên Sâu (AI)
          </button>
        </div>
      </div>

      {/* ── Mode Switcher: only show if partner is FEMALE (has a cycle) ── */}
      {coupleRel && partnerUser && partnerUser.gender !== 'male' && (
        <div className={s.modeSwitcher}>
          <button
            type="button"
            className={`${s.switchTabBtn} ${viewMode === 'self' ? s.switchTabBtnActive : ''}`}
            onClick={() => setViewMode('self')}
          >
            <span>🌸</span> Sức Khỏe Của Tôi
          </button>
          <button
            type="button"
            className={`${s.switchTabBtn} ${viewMode === 'partner' ? s.switchTabBtnActive : ''}`}
            onClick={() => setViewMode('partner')}
          >
            <span>💖</span> Chu Kỳ {partnerUser.displayName}
            {hasPartnerPermission ? ' (Đang chia sẻ 🌸)' : ' (Chưa chia sẻ 🔒)'}
          </button>
        </div>
      )}


      {/* ════════════════════════════════════════════════════════════════
          MODE 1: VIEW PARTNER'S CYCLE DATA (Theo Dõi Chu Kỳ Người Thương)
         ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'partner' && partnerUser ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Partner Profile Banner */}
          <div className={s.partnerProfileBanner}>
            <div className={s.partnerInfoGroup}>
              <AvatarWithFrame
                avatarUrl={partnerUser.avatar || 'bunny'}
                frameId={partnerUser.avatarFrame || partnerUser.frame || 'none'}
                size={54}
              />
              <div>
                <h3 className={s.partnerName}>
                  {coupleRel.customIcon || '💖'} {partnerUser.displayName}
                </h3>
                <div className={s.partnerRelTag}>
                  UID: #{partnerUser.id} • Mối quan hệ: <strong>{coupleRel.customName}</strong>
                </div>
              </div>
            </div>
            {hasPartnerPermission ? (
              <div style={{ background: '#E8F5E9', border: '1.5px solid #81C784', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#2E7D32', fontWeight: 'bold' }}>
                ✓ Đã cấp quyền theo dõi chu kỳ
              </div>
            ) : (
              <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#E65100' }}>
                🔒 Đối phương chưa bật chia sẻ dữ liệu chu kỳ
              </div>
            )}
          </div>

          {/* Partner Prediction & Stats (If permission granted) */}
          {hasPartnerPermission ? (
            <>
              <div className={s.partnerStatsGrid}>
                <div className={s.partnerStatCard}>
                  <span className={s.partnerStatLabel}><span>🌸</span> Kỳ kinh tiếp theo:</span>
                  <span className={s.partnerStatValue} style={{ color: '#D81B60' }}>
                    {partnerPrediction?.predictedStart
                      ? partnerPrediction.predictedStart.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                      : 'Đang cập nhật...'}
                  </span>
                </div>
                <div className={s.partnerStatCard}>
                  <span className={s.partnerStatLabel}><span>✨</span> Ngày rụng trứng:</span>
                  <span className={s.partnerStatValue} style={{ color: '#8E24AA' }}>
                    {partnerPrediction?.ovulationDate
                      ? partnerPrediction.ovulationDate.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })
                      : 'Đang cập nhật...'}
                  </span>
                </div>
                <div className={s.partnerStatCard}>
                  <span className={s.partnerStatLabel}><span>⏳</span> Độ dài chu kỳ:</span>
                  <span className={s.partnerStatValue}>
                    {partnerPrediction?.cycleLength ? `${partnerPrediction.cycleLength} ngày` : '28 ngày'}
                  </span>
                </div>
              </div>

              {/* Fertility Bar for Partner */}
              <FertilityBar prediction={partnerPrediction} />

              {/* Khay Nhắc Nhở & Hỏi Han (Quick Care Messages to Chat) */}
              <div className={s.careTraySection}>
                <h3 className={s.careTrayTitle}>
                  <span>💌</span> Khay Nhắc Nhở & Yêu Thương (Gửi Thẳng Vào Khung Chat)
                </h3>
                <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', margin: 0 }}>
                  Bấm một chạm để gửi ngay lời nhắc chăm sóc ngọt ngào vào phòng chat riêng giữa 2 bạn:
                </p>

                {sentToast && (
                  <div style={{ background: '#E8F5E9', border: '1.5px solid #4CAF50', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#2E7D32', fontWeight: 'bold' }}>
                    ✓ {sentToast}
                  </div>
                )}

                <div className={s.careBtnGrid}>
                  {CARE_MESSAGES.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={s.careBtn}
                      onClick={() => handleSendCareReminder(item)}
                    >
                      <span className={s.careBtnIcon}>{item.icon}</span>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: 10, color: 'var(--color-ink-light)', marginTop: 2 }}>
                          {item.text}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={s.pixelCard} style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: 16, color: '#D81B60' }}>
                Chưa Có Quyền Truy Cập Dữ Liệu
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', maxWidth: 400, margin: '8px auto' }}>
                Người thương của bạn chưa bật chia sẻ dữ liệu chu kỳ. Khi nào bạn ấy đồng ý chia sẻ trong phần kết đôi, dữ liệu sẽ tự động hiển thị tại đây nhé!
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════════
            MODE 2: VIEW CURRENT USER'S OWN CYCLE (Sức Khỏe Của Tôi)
           ════════════════════════════════════════════════════════════════ */
        <>
          {/* Top Section: Standalone Calendar & Daily Symptoms Form */}
          <div className={s.topSection}>
            <div className={s.pixelCard}>
              <h2 className={s.cardTitle}>
                <span>📅</span> Lịch Chu Kỳ {predictionMode === 'advanced' ? '(AI Bayesian)' : '(Chu Kỳ Chuẩn)'}
              </h2>
              <HealthCalendar userId={user.id} mode={predictionMode} gender={user?.gender || 'female'} onDateSelect={setSelectedDate} />

              
              {/* Dynamic Insights if Advanced AI mode active */}
              {predictionMode === 'advanced' && insights?.length > 0 && (
                <div style={{ marginTop: 14, padding: '10px 12px', background: '#F3E5F5', border: '1.5px solid #CE93D8', borderRadius: 10, fontSize: 11, color: '#4A148C', lineHeight: 1.5 }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>🧠 Phân tích AI theo thời gian thực:</strong>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {insights.map((ins, idx) => (
                      <li key={idx} style={{ marginBottom: 2 }}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={s.pixelCard}>
              <h2 className={s.cardTitle}>
                <span>📝</span> Triệu Chứng: {selectedDate.split('-').reverse().join('/')}
              </h2>
              <SymptomCards userId={user.id} dateStr={selectedDate} mode={predictionMode} />
            </div>
          </div>

          {/* Middle Section: 7-Day Fertility Probability Strip & Disclaimer */}
          <FertilityBar prediction={prediction} />

          {/* Bottom Section: Historical Cycle Charts */}
          <div className={s.bottomSection}>
            <div className={s.pixelCard}>
              <h2 className={s.cardTitle}><span>📊</span> Thống Kê & Phân Tích</h2>
              <HealthChart userId={user.id} />
            </div>
          </div>
        </>
      )}

    </div>
  )
}
