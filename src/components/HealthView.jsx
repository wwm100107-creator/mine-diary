import { useState, useMemo } from 'react'
import s from './HealthView.module.css'
import HealthCalendar from './HealthCalendar'
import SymptomCards from './SymptomCards'
import HealthChart from './HealthChart'
import FertilityBar from './FertilityBar'
import { today, loadMarkedDates, predictNextPeriod } from '../utils/cycle'

export default function HealthView({ user }) {
  const [selectedDate, setSelectedDate] = useState(today())

  // Compute prediction for real-time fertility probability
  const allMarks = useMemo(() => loadMarkedDates(user?.id), [user?.id])
  const prediction = useMemo(
    () => predictNextPeriod(allMarks, user?.id),
    [allMarks, user?.id]
  )

  return (
    <div className={s.healthView} role="main" aria-label="Sức khỏe Nữ giới">
      
      {/* Top Section: Standalone Calendar & Daily Symptoms Form */}
      <div className={s.topSection}>
        <div className={s.pixelCard}>
          <h2 className={s.cardTitle}><span>📅</span> Lịch Chu Kỳ</h2>
          <HealthCalendar userId={user.id} onDateSelect={setSelectedDate} />
        </div>

        <div className={s.pixelCard}>
          <h2 className={s.cardTitle}>
            <span>📝</span> Triệu Chứng: {selectedDate.split('-').reverse().join('/')}
          </h2>
          <SymptomCards userId={user.id} dateStr={selectedDate} />
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

    </div>
  )
}
