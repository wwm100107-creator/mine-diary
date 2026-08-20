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
  discharge: [
    { id: '', label: '-- Chọn dịch tiết --' },
    { id: 'dry', label: 'Khô ráo' },
    { id: 'sticky', label: 'Dính' },
    { id: 'creamy', label: 'Đục/Trắng' },
    { id: 'eggwhite', label: 'Trong/Dai (Lòng trắng trứng)' },
  ],
  lhTest: [
    { id: '', label: '-- Que thử rụng trứng (LH) --' },
    { id: 'negative', label: 'Âm tính (-)' },
    { id: 'positive', label: 'Dương tính (+)' },
    { id: 'peak', label: 'Đạt đỉnh siêu đậm (Peak LH) ⚡' },
  ],
}

export default function SymptomCards({ userId, dateStr }) {
  const storageKey = `minediary:symptoms:${userId}:${dateStr}`
  
  const [data, setData] = useState({
    flow: '',
    physical: [],
    mood: '',
    discharge: '',
    lhTest: '',
    weight: '',
    temperature: '',
  })

  // Load data when date changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      setData(JSON.parse(saved))
    } else {
      setData({ flow: '', physical: [], mood: '', discharge: '', lhTest: '', weight: '', temperature: '' })
    }
  }, [storageKey])

  const updateField = (field, value) => {
    const next = { ...data, [field]: value }
    setData(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const toggleCheckbox = (id) => {
    const current = new Set(data.physical)
    if (current.has(id)) current.delete(id)
    else current.add(id)
    updateField('physical', Array.from(current))
  }

  return (
    <div className={s.cardsGrid}>
      
      {/* 1. Lượng máu (Select) */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Lượng máu</label>
        <select 
          className={s.selectInput}
          value={data.flow}
          onChange={(e) => updateField('flow', e.target.value)}
        >
          {SYMPTOMS.flow.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      {/* 2. Triệu chứng thể chất (Checkbox) */}
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

      {/* 3. Tâm trạng (Select) */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Tâm trạng</label>
        <select 
          className={s.selectInput}
          value={data.mood}
          onChange={(e) => updateField('mood', e.target.value)}
        >
          {SYMPTOMS.mood.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      {/* 4. Dịch tiết (Select) */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Dịch tiết</label>
        <select 
          className={s.selectInput}
          value={data.discharge}
          onChange={(e) => updateField('discharge', e.target.value)}
        >
          {SYMPTOMS.discharge.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      {/* 5. Que thử rụng trứng LH */}
      <div className={s.symptomBlock}>
        <label className={s.blockLabel}>Que thử rụng trứng (LH)</label>
        <select 
          className={s.selectInput}
          value={data.lhTest || ''}
          onChange={(e) => updateField('lhTest', e.target.value)}
        >
          {SYMPTOMS.lhTest.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>

      <div className={s.twoColumns}>
        {/* 5. Cân nặng */}
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
          </div>
        </div>

        {/* 6. Thân nhiệt (BBT) */}
        <div className={s.symptomBlock}>
          <label className={s.blockLabel}>Thân nhiệt (°C)</label>
          <div className={s.inputWrap}>
            <input
              type="number"
              step="0.1"
              className={s.numberInput}
              value={data.temperature}
              onChange={e => updateField('temperature', e.target.value)}
              placeholder="36.5"
            />
          </div>
        </div>
      </div>

    </div>
  )
}
