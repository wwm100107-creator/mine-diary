import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import s from './HealthChart.module.css'
import { loadMarkedDates, predictNextPeriod } from '../utils/cycle'

const symptomData = [
  { name: 'Đau bụng', value: 4, color: '#FF8FAB' }, // pink-400
  { name: 'Mệt mỏi', value: 3, color: '#CDB4DB' },  // lavender
  { name: 'Nổi mụn', value: 2, color: '#FFC8DD' },  // pink-200
  { name: 'Đau đầu', value: 1, color: '#BDE0FE' },  // blue
]

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

export default function HealthChart({ userId }) {
  
  // Lấy dữ liệu chu kỳ thực tế thay vì mock
  const cycleData = useMemo(() => {
    const marks = loadMarkedDates(userId)
    const prediction = predictNextPeriod(marks)
    if (!prediction || !prediction.cycles) return []
    
    // Lấy tối đa 6 chu kỳ gần nhất
    const recent = prediction.cycles.slice(-6)
    return recent.map(c => {
      const d = new Date(c.startDate)
      return {
        month: `T${d.getMonth() + 1}`,
        length: c.cycleLength || prediction.cycleLength // fallback for last cycle
      }
    })
  }, [userId])

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
        </div>
      </div>

    </div>
  )
}
