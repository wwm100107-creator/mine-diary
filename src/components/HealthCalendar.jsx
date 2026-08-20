import Calendar from './Calendar'
import s from './HealthView.module.css'

export default function HealthCalendar({ userId, mode = 'standard', gender = 'female', onDateSelect }) {
  return <Calendar userId={userId} mode={mode} gender={gender} className={s.healthCalendar} onDateSelect={onDateSelect} />
}
