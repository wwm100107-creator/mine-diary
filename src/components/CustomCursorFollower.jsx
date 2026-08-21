import React, { memo, useEffect } from 'react'
import { useMousePosition } from '../hooks/useMousePosition'
import s from './CustomCursorFollower.module.css'

function CustomCursorFollower({ user, cursorTheme }) {
  const mouse = useMousePosition()
  const activeTheme = cursorTheme || user?.avatarFrame || user?.frame || 'default'

  // Hide native cursor on desktop body when custom cursor is active
  useEffect(() => {
    if (mouse.isFinePointer) {
      document.body.classList.add('has-custom-cursor')
    }
    return () => {
      document.body.classList.remove('has-custom-cursor')
    }
  }, [mouse.isFinePointer])

  if (!mouse.isFinePointer || !mouse.visible) return null

  const { x, y, rawX, rawY, clicking, hovering } = mouse

  return (
    <div className={s.cursorRoot} aria-hidden="true">
      {/* 1. Trailing Follower Ring / Theme Halo (Smooth Lerp Position) */}
      <div
        className={`${s.followerRing} ${s[activeTheme] || s.default} ${hovering ? s.ringHover : ''} ${clicking ? s.ringClick : ''}`}
        style={{
          transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`,
        }}
      >
        {activeTheme === 'sazabi_verka' && <div className={s.mechaReticleRing} />}
        {activeTheme === 'gundam_calibarn' && <div className={s.permetRing} />}
        {activeTheme === 'unicorn_awakened' && <div className={s.psychoRing} />}
        {activeTheme === 'wing_zero_ew' && <div className={s.wingRing} />}
        {activeTheme === 'emerald_royal' && <div className={s.emeraldRing} />}
        {activeTheme === 'god_cosmic' && <div className={s.godRing} />}
      </div>

      {/* 2. Instant Sharp Pointer Dot / Core Reticle (Raw Instant Coordinates) */}
      <div
        className={`${s.pointerCore} ${s[`core_${activeTheme}`] || s.core_default} ${hovering ? s.coreHover : ''} ${clicking ? s.coreClick : ''}`}
        style={{
          transform: `translate3d(${rawX}px, ${rawY}px, 0) translate(-50%, -50%)`,
        }}
      >
        {activeTheme === 'sazabi_verka' && <div className={s.sazabiMonoEyeDot} />}
        {activeTheme === 'gundam_calibarn' && <div className={s.calibarnCoreDiamond} />}
        {activeTheme === 'unicorn_awakened' && <div className={s.unicornCoreV} />}
        {activeTheme === 'wing_zero_ew' && <div className={s.wingZeroCoreOrb} />}
        {activeTheme === 'emerald_royal' && <div className={s.emeraldCoreGem} />}
        {activeTheme === 'god_cosmic' && <div className={s.godCoreStar}>✦</div>}
      </div>
    </div>
  )
}

export default memo(CustomCursorFollower)
