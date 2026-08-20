import Calendar from './Calendar'
import s from './HealthView.module.css'

export default function HealthCalendar({ userId, onDateSelect }) {
  // Pass className to Calendar to override sidebar styles
  return <Calendar userId={userId} className={s.healthCalendar} onDateSelect={onDateSelect} />
}
