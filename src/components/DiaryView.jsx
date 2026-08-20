import { useState, useRef, useCallback } from 'react'
import Calendar from './Calendar'
import DiaryEditor from './DiaryEditor'
import s from '../App.module.css' // Reuse main app styles for now

// ── Storage helpers ───────────────────────────────────────────────────────────
const diaryKey = (userId, dateStr) => `minediary:diary:${userId}:${dateStr}`
const moodKey  = (userId, dateStr) => `minediary:mood:${userId}:${dateStr}`

const DAYS_VI   = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy']
const MONTHS_VI = ['tháng 1','tháng 2','tháng 3','tháng 4','tháng 5','tháng 6',
                   'tháng 7','tháng 8','tháng 9','tháng 10','tháng 11','tháng 12']

const MOODS = [
  { id: 'happy', label: '☀ Vui',      cls: s.moodHappy  },
  { id: 'love',  label: '♥ Yêu',      cls: s.moodLove   },
  { id: 'calm',  label: '✿ Bình yên', cls: s.moodCalm   },
  { id: 'dream', label: '✦ Mơ mộng', cls: s.moodDream  },
  { id: 'sad',   label: '☁ Buồn',     cls: s.moodSad    },
]

function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return DAYS_VI[d.getDay()].toUpperCase()
}

function formatFullDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_VI[d.getMonth()]} ${d.getFullYear()}`
}

function formatMiniDate(dateStr) {
  if (!dateStr) return '--'
  const [, m, dd] = dateStr.split('-')
  return `${dd}/${m}`
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
function countWords(html) {
  const text = stripHtml(html)
  return text === '' ? 0 : text.split(/\s+/).length
}

export default function DiaryView({ user }) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [calShrunk,    setCalShrunk]    = useState(false)
  const [diaryHtml,    setDiaryHtml]    = useState('')
  const [activeMoods,  setActiveMoods]  = useState(new Set())
  const [savedVisible, setSavedVisible] = useState(false)
  const autosaveTimer = useRef(null)

  // ── Select date ────────────────────────────────────────────────────────
  const handleDateSelect = useCallback((dateStr) => {
    if (selectedDate && user) {
      localStorage.setItem(diaryKey(user.id, selectedDate), diaryHtml)
      localStorage.setItem(moodKey(user.id, selectedDate), JSON.stringify([...activeMoods]))
    }
    setSelectedDate(dateStr)
    setCalShrunk(true)

    const saved      = localStorage.getItem(diaryKey(user.id, dateStr)) ?? ''
    const savedMoods = JSON.parse(localStorage.getItem(moodKey(user.id, dateStr)) ?? '[]')
    setDiaryHtml(saved)
    setActiveMoods(new Set(savedMoods))
  }, [selectedDate, user, diaryHtml, activeMoods])

  // ── Save ───────────────────────────────────────────────────────────────
  const saveDiary = useCallback((html, moods) => {
    if (!selectedDate || !user) return
    localStorage.setItem(diaryKey(user.id, selectedDate), html ?? diaryHtml)
    localStorage.setItem(moodKey(user.id, selectedDate), JSON.stringify([...(moods ?? activeMoods)]))
    setSavedVisible(true)
    setTimeout(() => setSavedVisible(false), 2000)
  }, [selectedDate, user, diaryHtml, activeMoods])

  const handleEditorChange = useCallback((html) => {
    setDiaryHtml(html)
    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => saveDiary(html), 800)
  }, [saveDiary])

  const toggleMood = (id) => {
    setActiveMoods(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      saveDiary(diaryHtml, next)
      return next
    })
  }

  return (
    <>
      {/* Calendar slide panel */}
      <div className={`${s.calendarPanel} ${calShrunk ? s.shrunk : ''}`}>
        <Calendar userId={user.id} onDateSelect={handleDateSelect} />
      </div>

      {/* Mini calendar */}
      <div
        className={`${s.miniCal} ${calShrunk ? s.visible : ''}`}
        role="complementary"
        aria-label="Lịch thu nhỏ"
      >
        <div className={s.miniCalHeader}>
          <span className={s.miniCalDate}>{formatMiniDate(selectedDate)}</span>
          <button
            className={s.miniCalExpandBtn}
            onClick={() => setCalShrunk(false)}
            aria-label="Mở rộng lịch"
            title="Mở lịch"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="0" y="0" width="2" height="6" fill="currentColor"/>
              <rect x="0" y="0" width="6" height="2" fill="currentColor"/>
              <rect x="8" y="0" width="6" height="2" fill="currentColor"/>
              <rect x="12" y="0" width="2" height="6" fill="currentColor"/>
              <rect x="0" y="8" width="2" height="6" fill="currentColor"/>
              <rect x="0" y="12" width="6" height="2" fill="currentColor"/>
              <rect x="8" y="12" width="6" height="2" fill="currentColor"/>
              <rect x="12" y="8" width="2" height="6" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div className={s.miniCalBody}>
          <span className={s.miniCalLabel}>Đang xem</span>
          <span className={s.miniCalHint}>
            {selectedDate ? formatFullDate(selectedDate) : '—'}
          </span>
        </div>
      </div>

      {/* Diary section */}
      <section className={s.diaryWrapper} aria-label="Nhật ký">
        {!selectedDate ? (
          <div className={s.prompt}>
            <div className={s.promptIcon} aria-hidden="true">📖</div>
            <p className={s.promptText}>Hôm nay bạn có gì<br/>muốn kể không? ✨</p>
            <p className={s.promptHint}>Chọn một ngày trên lịch để bắt đầu</p>
          </div>
        ) : (
          <div key={selectedDate} className={s.writingView}>
            <div className={s.diaryHeader}>
              <div className={s.diaryDateBlock}>
                <div className={s.diaryDateDay}>{formatDayHeader(selectedDate)}</div>
                <div className={s.diaryDateFull}>{formatFullDate(selectedDate)}</div>
              </div>
              <div className={s.diaryHeaderActions}>
                <span
                  className={`${s.saveStatus} ${savedVisible ? s.visible : ''}`}
                  role="status" aria-live="polite"
                >✓ Đã lưu</span>
                <button className={s.saveBtn} onClick={() => saveDiary()}>Lưu</button>
              </div>
            </div>

            <div className={s.moodBar} aria-label="Tâm trạng hôm nay">
              <span className={s.moodBarLabel}>Tâm trạng:</span>
              {MOODS.map(({ id, label, cls }) => (
                <button
                  key={id}
                  className={`${s.moodTag} ${cls} ${activeMoods.has(id) ? s.moodActive : ''}`}
                  onClick={() => toggleMood(id)}
                  role="checkbox"
                  aria-pressed={activeMoods.has(id)}
                >{label}</button>
              ))}
            </div>

            <DiaryEditor
              content={diaryHtml}
              onChange={handleEditorChange}
            />

            <div className={s.diaryFooter}>
              <span className={s.wordCount} aria-live="polite">
                {countWords(diaryHtml)} từ
              </span>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
