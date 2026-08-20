import Calendar from './Calendar'
import s from './HealthView.module.css'

export default function HealthCalendar({ userId, mode = 'standard', onDateSelect }) {
  return <Calendar userId={userId} mode={mode} className={s.healthCalendar} onDateSelect={onDateSelect} />
}
