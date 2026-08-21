import { useState, useEffect } from 'react'
import s from './SymptomCards.module.css'

const SYMPTOMS = {
  flow: [
    { id: '', label: '-- Chọn lượng máu --' },
    { id: 'light', label: 'Ít 💧' },
    { id: 'medium', label: 'Vừa 🩸' },
    { id: 'heavy', label: 'Nhiều 🌊' }
  ],
  physical: [
    { id: 'cramps', label: 'Đau bụng 😣' },
    { id: 'headache', label: 'Đau đầu 🤕' },
    { id: 'fatigue', label: 'Mệt mỏi 🥱' },
    { id: 'acne', label: 'Nổi mụn 😶' },
    { id: 'backache', label: 'Đau lưng 😖' },
  ],
  mood: [
    { id: '', label: '-- Chọn tâm trạng --' },
    { id: 'happy', label: 'Vui vẻ 🙂' },
    { id: 'sad', label: 'Buồn bã 😢' },
    { id: 'angry', label: 'Cáu gắt 😠' },
    { id: 'sensitive', label: 'Nhạy cảm 🥺' },
  ],
  // ── Advanced AI Mode fields ────────────────────────────
  discharge: [
    { id: '', label: '-- Chọn dịch nhầy --' },
    { id: 'dry', label: '🏜️ Khô ráo' },
    { id: 'sticky', label: '🍯 Dính đặc' },
    { id: 'creamy', label: '🥛 Đục / Trắng kem' },
    { id: 'eggwhite', label: '🥚 Trong suốt / Dai (Lòng trắng trứng)' },
  ],
  lhTest: [
    { id: '', label: '-- Kết quả que LH --' },
    { id: 'negative', label: '⚪ Âm tính (-)' },
    { id: 'positive', label: '🟡 Dương tính (+)' },
    { id: 'peak', label: '⚡ Đạt đỉnh Peak LH (Siêu đậm)' },
  ],
}

const EMPTY_STATE = {
  flow: '',
  physical: [],
  mood: '',
  discharge: '',
  lhTest: '',
  weight: '',
  temperature: '',
}

export default function SymptomCards({ userId, dateStr, mode = 'standard' }) {
  const storageKey = `minediary:symptoms:${userId}:${dateStr}`
  const isAdvanced = mode === 'advanced'
  
  const [data, setData] = useState(EMPTY_STATE)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    setData(saved ? JSON.parse(saved) : { ...EMPTY_STATE })
  }, [storageKey])

  const updateField = (field, value) => {
    const next = { ...data, [field]: value }
    setData(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('minediary:cycle_updated', { detail: { userId } }))
    }
  }


  const toggleCheckbox = (id) => {
    const current = new Set(data.physical)
    if (current.has(id)) current.delete(id)
    else current.add(id)
    updateField('physical', Array.from(current))
  }

  return (
    <div className={s.cardsGrid}>

      {/* ── Nhóm cơ bản (luôn hiển thị) ── */}

      {/* 1. Lượng máu */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Lượng máu</label>
        <select className={s.selectInput} value={data.flow} onChange={e => updateField('flow', e.target.value)}>
          {SYMPTOMS.flow.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      {/* 2. Triệu chứng thể chất */}
      <div className={s.symptomBlock}>
        <span className={s.blockLabel}>Triệu chứng thể chất</span>
        <div className={s.checkboxGrid}>
          {SYMPTOMS.physical.map(opt => (
            <label key={opt.id} className={s.checkboxLabel}>
              <input
                type="checkbox"
                checked={data.physical.includes(opt.id)}
                onChange={() => toggleCheckbox(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* 3. Tâm trạng */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Tâm trạng</label>
        <select className={s.selectInput} value={data.mood} onChange={e => updateField('mood', e.target.value)}>
          {SYMPTOMS.mood.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      {/* 4. Cân nặng (luôn hiển thị) */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Cân nặng (kg)</label>
        <div className={s.inputWrap}>
          <input
            type="number"
            step="0.1"
            className={s.numberInput}
            value={data.weight}
            onChange={e => updateField('weight', e.target.value)}
            placeholder="50.5"
          />
          <span className={s.inputDeco}>⚖️</span>
        </div>
      </div>

      {/* ── Nhóm AI Chuyên Sâu (chỉ hiện khi Advanced mode) ── */}
      {isAdvanced && (
        <div className={s.aiSectionGroup}>
          <div className={s.aiSectionHeader}>
            <span className={s.aiSectionIcon}>✨</span>
            <span className={s.aiSectionTitle}>Thông số AI Bayesian</span>
            <span className={s.aiSectionBadge}>ADVANCED</span>
          </div>
          <p className={s.aiSectionDesc}>
            Dữ liệu dưới đây được Engine AI Bayesian quét để tinh chỉnh ngày rụng trứng chính xác nhất.
          </p>

          {/* A. Thân nhiệt BBT */}
          <div className={`${s.symptomBlock} ${s.aiField}`}>
            <label className={s.aiFieldLabel}>
              🌡️ Thân nhiệt Cơ bản (BBT)
              <span className={s.aiFieldHint}>Đo ngay khi thức dậy, trước khi ra khỏi giường</span>
            </label>
            <div className={`${s.inputWrap} ${s.aiInputWrap}`}>
              <input
                type="number"
                step="0.01"
                min="35"
                max="40"
                className={s.numberInput}
                value={data.temperature}
                onChange={e => updateField('temperature', e.target.value)}
                placeholder="36.50"
              />
              <span className={s.inputDeco}>°C</span>
            </div>
            {data.temperature && parseFloat(data.temperature) >= 36.7 && (
              <div className={s.bbtHighAlert}>⚡ Nhiệt độ cao — Có thể đã rụng trứng rồi!</div>
            )}
          </div>

          {/* B. Dịch nhầy cổ tử cung */}
          <div className={`${s.symptomBlock} ${s.aiField}`}>
            <label className={s.aiFieldLabel}>
              💧 Dịch nhầy cổ tử cung (CM)
              <span className={s.aiFieldHint}>Quan sát chất tiết trong ngày</span>
            </label>
            <div className={s.dischargeOptions}>
              {SYMPTOMS.discharge.filter(o => o.id).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${s.dischargeBtn} ${data.discharge === opt.id ? s.dischargeBtnActive : ''}`}
                  onClick={() => updateField('discharge', data.discharge === opt.id ? '' : opt.id)}
                  title={opt.label}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {data.discharge === 'eggwhite' && (
              <div className={s.eggwhiteAlert}>🥚 Dịch nhầy lòng trắng trứng — Đỉnh thụ thai đang đến!</div>
            )}
          </div>

          {/* C. Que thử rụng trứng LH */}
          <div className={`${s.symptomBlock} ${s.aiField}`}>
            <label className={s.aiFieldLabel}>
              ⚡ Que thử rụng trứng (LH Test)
              <span className={s.aiFieldHint}>Kết quả que thử LH hôm nay</span>
            </label>
            <div className={s.lhOptions}>
              {SYMPTOMS.lhTest.filter(o => o.id).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  className={`${s.lhBtn} ${s[`lhBtn_${opt.id}`]} ${data.lhTest === opt.id ? s.lhBtnActive : ''}`}
                  onClick={() => updateField('lhTest', data.lhTest === opt.id ? '' : opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {data.lhTest === 'peak' && (
              <div className={s.lhPeakAlert}>⚡ Đỉnh LH! Rụng trứng dự kiến trong 24–36h tới. Engine AI đã cập nhật lịch!</div>
            )}
          </div>
        </div>
      )}

      {/* Gợi ý mở chế độ AI (hiện khi standard) */}
      {!isAdvanced && (
        <div className={s.advancedTeaser}>
          <span>✨</span>
          <span>Bật chế độ <strong>Chuyên Sâu (AI)</strong> ở đầu trang để ghi thêm BBT, dịch nhầy & que thử LH.</span>
        </div>
      )}

    </div>
  )
}
