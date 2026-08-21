import React, { memo, useEffect, useState, useCallback } from 'react'
import { useMousePosition } from '../hooks/useMousePosition'
import s from './CustomCursorFollower.module.css'

function CustomCursorFollower({ user, cursorTheme }) {
  const mouse = useMousePosition()
  const activeTheme = cursorTheme || user?.avatarFrame || user?.frame || 'default'
  const [bursts, setBursts] = useState([])

  // Hide native cursor on desktop body when custom cursor is active
  useEffect(() => {
    if (mouse.isFinePointer) {
      document.body.classList.add('has-custom-cursor')
    }
    return () => {
      document.body.classList.remove('has-custom-cursor')
    }
  }, [mouse.isFinePointer])

  // Spawn click burst at exact click position
  const handleGlobalMouseDown = useCallback((e) => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    const id = Date.now() + Math.random()
    const newBurst = {
      id,
      x: e.clientX,
      y: e.clientY,
      theme: activeTheme,
    }
    setBursts((prev) => [...prev.slice(-8), newBurst])

    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id))
    }, 900)
  }, [activeTheme])

  useEffect(() => {
    window.addEventListener('mousedown', handleGlobalMouseDown, { passive: true })
    return () => window.removeEventListener('mousedown', handleGlobalMouseDown)
  }, [handleGlobalMouseDown])

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
        {/* Specific theme accessories */}
        {activeTheme === 'rainbow' && (
          <div className={s.rainbowTrailStream} />
        )}
        {activeTheme === 'sakura_hearts' && (
          <div className={s.sakuraMistWrap}>
            <span className={`${s.floatingHeart} ${s.fh1}`}>♥</span>
            <span className={`${s.floatingHeart} ${s.fh2}`}>♥</span>
          </div>
        )}
        {activeTheme === 'sparkle_stars' && (
          <div className={s.shootingStarTrail} />
        )}
        {(activeTheme === 'cyber_aura' || activeTheme === 'vip8_fire') && (
          <div className={s.lightningArcTrail}>
            <span className={s.lightningFlicker} />
          </div>
        )}
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
        {/* 🌈 Cầu Vồng Pixel (8-Bit Pixel Arrow) */}
        {activeTheme === 'rainbow' && (
          <svg viewBox="0 0 16 16" className={s.pixelArrowSvg}>
            <path
              d="M 0 0 L 0 14 L 4 10 L 7 16 L 9 15 L 6 9 L 11 9 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="1.2"
              strokeLinejoin="miter"
            />
          </svg>
        )}

        {/* 🌸 Trái Tim & Sakura (Delicate Pink Petal) */}
        {activeTheme === 'sakura_hearts' && (
          <svg viewBox="0 0 20 20" className={s.sakuraPetalSvg}>
            <path
              d="M 10 2 C 14 0, 19 5, 18 11 C 17 16, 12 19, 10 20 C 8 19, 3 16, 2 11 C 1 5, 6 0, 10 2 Z"
              fill="url(#sakuraPetalGrad)"
              stroke="#FF8FAB"
              strokeWidth="0.8"
            />
            <defs>
              <linearGradient id="sakuraPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF0F5" />
                <stop offset="50%" stopColor="#FFB7C5" />
                <stop offset="100%" stopColor="#FF69B4" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* ✨ Ngôi Sao Lấp Lánh (Sharp 4-Point Gold Star) */}
        {activeTheme === 'sparkle_stars' && (
          <svg viewBox="0 0 24 24" className={s.sparkleStarSvg}>
            <defs>
              <linearGradient id="sparkleGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9A6" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF9100" />
              </linearGradient>
            </defs>
            <path
              d="M 12 0 Q 12 12, 0 12 Q 12 12, 12 24 Q 12 12, 24 12 Q 12 12, 12 0 Z"
              fill="url(#sparkleGoldGrad)"
              stroke="#FFE57F"
              strokeWidth="0.6"
            />
          </svg>
        )}

        {/* ⚡ Hào Quang Lửa (Flame & Lightning Spark) */}
        {(activeTheme === 'cyber_aura' || activeTheme === 'vip8_fire') && (
          <svg viewBox="0 0 20 24" className={s.flameSparkSvg}>
            <defs>
              <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFEE55" />
                <stop offset="40%" stopColor="#FF7700" />
                <stop offset="100%" stopColor="#FF1100" />
              </linearGradient>
            </defs>
            <polygon
              points="11,0 2,13 9,13 7,24 18,9 11,9"
              fill="url(#flameGrad)"
              stroke="#FFF9A6"
              strokeWidth="0.8"
            />
          </svg>
        )}

        {/* Other Themes */}
        {activeTheme === 'sazabi_verka' && <div className={s.sazabiMonoEyeDot} />}
        {activeTheme === 'gundam_calibarn' && <div className={s.calibarnCoreDiamond} />}
        {activeTheme === 'unicorn_awakened' && <div className={s.unicornCoreV} />}
        {activeTheme === 'wing_zero_ew' && <div className={s.wingZeroCoreOrb} />}
        {activeTheme === 'emerald_royal' && <div className={s.emeraldCoreGem} />}
        {activeTheme === 'god_cosmic' && <div className={s.godCoreStar}>✦</div>}
      </div>

      {/* 3. Click Burst Particle Effects (Spawned at click coordinates) */}
      {bursts.map((b) => (
        <div
          key={b.id}
          className={s.clickBurstWrap}
          style={{ transform: `translate3d(${b.x}px, ${b.y}px, 0)` }}
        >
          {/* 🌈 Rainbow Pixel Burst (4-5 colorful pixel squares) */}
          {b.theme === 'rainbow' && (
            <div className={s.burstRainbow}>
              <span className={`${s.rainbowPixel} ${s.rp1}`} />
              <span className={`${s.rainbowPixel} ${s.rp2}`} />
              <span className={`${s.rainbowPixel} ${s.rp3}`} />
              <span className={`${s.rainbowPixel} ${s.rp4}`} />
              <span className={`${s.rainbowPixel} ${s.rp5}`} />
            </div>
          )}

          {/* 🌸 Sakura Bloom & Falling Petals */}
          {b.theme === 'sakura_hearts' && (
            <div className={s.burstSakura}>
              <span className={s.sakuraMainBloom}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp1}`}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp2}`}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp3}`}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp4}`}>🌸</span>
            </div>
          )}

          {/* ✨ Star Glint Flash & 3 Mini Twinkle Stars */}
          {b.theme === 'sparkle_stars' && (
            <div className={s.burstSparkle}>
              <div className={s.sparkleGlintCross} />
              <span className={`${s.burstMiniStar} ${s.ms1}`}>✦</span>
              <span className={`${s.burstMiniStar} ${s.ms2}`}>✧</span>
              <span className={`${s.burstMiniStar} ${s.ms3}`}>✦</span>
            </div>
          )}

          {/* ⚡ Shockwave & Lightning Electric Flash */}
          {(b.theme === 'cyber_aura' || b.theme === 'vip8_fire') && (
            <div className={s.burstFlame}>
              <div className={s.flameShockwave} />
              <span className={`${s.flameEmber} ${s.fe1}`}>⚡</span>
              <span className={`${s.flameEmber} ${s.fe2}`}>⚡</span>
              <span className={`${s.flameEmber} ${s.fe3}`}>⚡</span>
              <span className={`${s.flameEmber} ${s.fe4}`}>⚡</span>
            </div>
          )}

          {/* Default Ripple for other themes */}
          {b.theme !== 'rainbow' &&
            b.theme !== 'sakura_hearts' &&
            b.theme !== 'sparkle_stars' &&
            b.theme !== 'cyber_aura' &&
            b.theme !== 'vip8_fire' && (
              <div className={s.defaultClickRipple} />
            )}
        </div>
      ))}
    </div>
  )
}

export default memo(CustomCursorFollower)
