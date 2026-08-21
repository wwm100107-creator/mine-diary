import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import s from './HealthChart.module.css'
import { loadMarkedDates, loadAllUserSymptoms, predictNextPeriod } from '../utils/cycle'

const SYMPTOM_COLORS = {
  cramps:   { label: 'Đau bụng',  color: '#FF8FAB' },
  fatigue:  { label: 'Mệt mỏi',  color: '#CDB4DB' },
  acne:     { label: 'Nổi mụn',  color: '#FFC8DD' },
  headache: { label: 'Đau đầu',  color: '#BDE0FE' },
  backache: { label: 'Đau lưng', color: '#B5EAD7' },
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className={s.tooltip}>
        <span className={s.tooltipLabel}>{payload[0].payload.month || payload[0].name}</span>
        <span className={s.tooltipValue}>
          {payload[0].value} {payload[0].payload.length ? 'ngày' : 'lần'}
        </span>
      </div>
    )
  }
  return null
}

// markedDates: override localStorage (used for partner view from Firestore)
// symptoms: override localStorage (used for partner view from Firestore)
export default function HealthChart({ userId, markedDates: markedDatesProp = null, symptoms: symptomsProp = null }) {

  const cycleData = useMemo(() => {
    // Use prop override (Firestore) when available, else read localStorage
    const marks = markedDatesProp !== null ? markedDatesProp : loadMarkedDates(userId)
    const prediction = predictNextPeriod(marks)
    if (!prediction || !prediction.cycles) return []
    const recent = prediction.cycles.slice(-6)
    return recent.map(c => {
      const d = new Date(c.startDate)
      return {
        month: `T${d.getMonth() + 1}`,
        length: c.cycleLength || prediction.cycleLength
      }
    })
  }, [userId, markedDatesProp])

  // ── Compute symptom frequency from REAL data (Firestore prop or localStorage) ──
  const symptomData = useMemo(() => {
    // Partner view: symptomsProp is { [dateStr]: { physical: [], ... } } from Firestore
    const logs = symptomsProp !== null ? symptomsProp : loadAllUserSymptoms(userId)
    const counts = {}
    for (const entry of Object.values(logs)) {
      if (!Array.isArray(entry?.physical)) continue
      for (const sym of entry.physical) {
        counts[sym] = (counts[sym] || 0) + 1
      }
    }
    return Object.entries(counts)
      .map(([id, value]) => ({
        name: SYMPTOM_COLORS[id]?.label || id,
        value,
        color: SYMPTOM_COLORS[id]?.color || '#CDB4DB',
      }))
      .sort((a, b) => b.value - a.value)
  }, [userId, symptomsProp])


  return (
    <div className={s.chartWrap}>

      {/* Cycle Length Chart */}
      <div className={s.chartBlock}>
        <h3 className={s.chartTitle}>Độ dài chu kỳ ({cycleData.length || 0} chu kỳ gần nhất)</h3>
        <div className={s.chartContainer}>
          {cycleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cycleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: '#889BA6', fontSize: 12, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#889BA6', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#FFF0F5' }} content={<CustomTooltip />} />
                <Bar dataKey="length" fill="#FFB7C5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ padding: 16, color: '#889BA6', textAlign: 'center', fontSize: 14 }}>Chưa đủ dữ liệu chu kỳ. Hãy nhập thêm các ngày đèn đỏ!</p>
          )}
        </div>
      </div>

      {/* Symptoms Pie Chart */}
      <div className={s.chartBlock}>
        <h3 className={s.chartTitle}>Tần suất triệu chứng</h3>
        <div className={s.chartContainer}>
          {symptomData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={symptomData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {symptomData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: '#685D61' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ padding: 16, color: '#889BA6', textAlign: 'center', fontSize: 14 }}>Chưa ghi nhận triệu chứng nào. Hãy thêm dữ liệu hàng ngày!</p>
          )}
        </div>
      </div>

    </div>
  )
}

