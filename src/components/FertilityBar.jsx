import React, { useMemo } from 'react'
import { calculateWeeklyFertility } from '../utils/cycle'
import s from './FertilityBar.module.css'

/**
 * Mini SVG Pie / Donut Chart component
 */
function MiniPieChart({ percentage, color }) {
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className={s.pieWrap}>
      <svg className={s.pieSvg} viewBox="0 0 36 36">
        <circle
          className={s.pieBgCircle}
          cx="18"
          cy="18"
          r={radius}
        />
        <circle
          className={s.pieProgressCircle}
          cx="18"
          cy="18"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={s.pieText}>{percentage}%</span>
    </div>
  )
}

export default function FertilityBar({ prediction }) {
  // Use clinical Gaussian distribution around ovulation date
  const weeklyData = useMemo(() => {
    return calculateWeeklyFertility(prediction)
  }, [prediction])

  return (
    <div className={s.container}>
      {/* Header & Legend */}
      <div className={s.header}>
        <h3 className={s.title}>
          <span>🌸</span> Thanh Khả Năng Thụ Thai (Tuần Này)
        </h3>
        <div className={s.legend}>
          <div className={s.legendItem}>
            <span className={`${s.legendDot} ${s.dotLow}`} /> &lt;30% Thấp
          </div>
          <div className={s.legendItem}>
            <span className={`${s.legendDot} ${s.dotMid}`} /> 30-69% Vừa
          </div>
          <div className={s.legendItem}>
            <span className={`${s.legendDot} ${s.dotHigh}`} /> ≥70% Đỉnh
          </div>
        </div>
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className={s.strip}>
        {weeklyData.map((item) => (
          <div
            key={item.key}
            className={`${s.dayColumn} ${item.isPeak ? s.peakDay : ''} ${
              item.isToday ? s.todayColumn : ''
            }`}
          >
            {item.isPeak && <span className={s.peakBadge}>Đỉnh 🌸</span>}
            <span className={s.weekdayName}>{item.name}</span>
            <span className={s.dateSub}>{item.dateLabel}</span>

            {/* Mini Pie Chart */}
            <MiniPieChart percentage={item.percentage} color={item.color} />

            <span className={`${s.chanceLabel} ${s[item.level]}`}>
              {item.levelLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Legal Disclaimer */}
      <div className={s.disclaimer} role="note">
        <span className={s.disclaimerIcon} aria-hidden="true">⚠️</span>
        <span>
          <strong>Lưu ý y tế:</strong> Số liệu chỉ mang tính chất tham khảo, không thay thế biện pháp tránh thai y tế.
        </span>
      </div>
    </div>
  )
}
