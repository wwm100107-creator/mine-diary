import { useState, useRef, useEffect } from 'react'
import s from './EasterEgg.module.css'

export default function EasterEgg() {
  const [isOpen, setIsOpen] = useState(false)
  const eggRef = useRef(null)

  // Close when tapping outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (eggRef.current && !eggRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  return (
    <div
      ref={eggRef}
      className={`${s.easterEggWrapper} ${isOpen ? s.active : ''}`}
      onClick={() => setIsOpen((prev) => !prev)}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      role="button"
      tabIndex={0}
      aria-label="Chữ ký tác giả"
    >
      {/* ── 1. Delicate Sparkling Cluster (Default View) ── */}
      <div className={s.sparkleCluster} aria-hidden="true">
        <span className={`${s.sparkle} ${s.sparkle1}`}>✨</span>
        <span className={`${s.sparkle} ${s.sparkle2}`}>✦</span>
        <span className={`${s.sparkle} ${s.sparkle3}`}>♥</span>
      </div>

      {/* ── 2. Romantic Cute Pixel Tooltip / Dialogue Card ── */}
      <div className={s.tooltipCard} role="tooltip">
        <div className={s.cardHeart} aria-hidden="true">🌸</div>
        <div className={s.dedicationText}>dành cho em</div>
        <div className={s.authorTag}>@uy.pham</div>
        <div className={s.tooltipTail} aria-hidden="true" />
      </div>
    </div>
  )
}
