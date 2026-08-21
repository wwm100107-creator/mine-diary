import React, { memo, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import s from './CustomCursorFollower.module.css'

// Separate Click Bursts Component to prevent re-rendering the main cursor refs
function ClickBurstsLayer({ bursts }) {
  if (!bursts || bursts.length === 0) return null

  return (
    <>
      {bursts.map((b) => (
        <div
          key={b.id}
          className={s.clickBurstWrap}
          style={{ transform: `translate3d(${b.x}px, ${b.y}px, 0)` }}
        >
          {/* 🌈 1. Rainbow Pixel Burst */}
          {b.theme === 'rainbow' && (
            <div className={s.burstRainbow}>
              <span className={`${s.rainbowPixel} ${s.rp1}`} />
              <span className={`${s.rainbowPixel} ${s.rp2}`} />
              <span className={`${s.rainbowPixel} ${s.rp3}`} />
              <span className={`${s.rainbowPixel} ${s.rp4}`} />
              <span className={`${s.rainbowPixel} ${s.rp5}`} />
            </div>
          )}

          {/* 🌸 2. Sakura Bloom & Falling Petals */}
          {b.theme === 'sakura_hearts' && (
            <div className={s.burstSakura}>
              <span className={s.sakuraMainBloom}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp1}`}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp2}`}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp3}`}>🌸</span>
              <span className={`${s.sakuraFlyPetal} ${s.sp4}`}>🌸</span>
            </div>
          )}

          {/* ✨ 3. Star Glint Flash & Mini Twinkle Stars */}
          {b.theme === 'sparkle_stars' && (
            <div className={s.burstSparkle}>
              <div className={s.sparkleGlintCross} />
              <span className={`${s.burstMiniStar} ${s.ms1}`}>✦</span>
              <span className={`${s.burstMiniStar} ${s.ms2}`}>✧</span>
              <span className={`${s.burstMiniStar} ${s.ms3}`}>✦</span>
            </div>
          )}

          {/* ⚡ 4. Shockwave & Lightning Electric Flash */}
          {b.theme === 'cyber_aura' && (
            <div className={s.burstFlame}>
              <div className={s.flameShockwave} />
              <span className={`${s.flameEmber} ${s.fe1}`}>⚡</span>
              <span className={`${s.flameEmber} ${s.fe2}`}>⚡</span>
              <span className={`${s.flameEmber} ${s.fe3}`}>⚡</span>
              <span className={`${s.flameEmber} ${s.fe4}`}>⚡</span>
            </div>
          )}

          {/* 🌿 5. Hoàng Gia Lục Bảo: Concentric Green Water Ripple */}
          {b.theme === 'emerald_royal' && (
            <div className={s.burstEmerald}>
              <div className={`${s.emeraldRipple} ${s.er1}`} />
              <div className={`${s.emeraldRipple} ${s.er2}`} />
              <div className={`${s.emeraldRipple} ${s.er3}`} />
              <span className={`${s.emeraldLeafSpark} ${s.ls1}`}>🌿</span>
              <span className={`${s.emeraldLeafSpark} ${s.ls2}`}>💎</span>
            </div>
          )}

          {/* 🔥 6. SVIP Thánh Hỏa: Fire Tornado Vortex Pillar */}
          {b.theme === 'vip8_fire' && (
            <div className={s.burstHolyFire}>
              <div className={s.fireTornadoColumn} />
              <span className={`${s.tornadoFlame} ${s.tf1}`}>🔥</span>
              <span className={`${s.tornadoFlame} ${s.tf2}`}>🔥</span>
              <span className={`${s.tornadoFlame} ${s.tf3}`}>🔥</span>
            </div>
          )}

          {/* ❄️ 7. SSVIP Cánh Băng: Shattered Ice Glass Burst */}
          {b.theme === 'vip9_frost' && (
            <div className={s.burstFrostGlass}>
              <div className={s.frostCrackCenter} />
              <span className={`${s.iceShard} ${s.is1}`} />
              <span className={`${s.iceShard} ${s.is2}`} />
              <span className={`${s.iceShard} ${s.is3}`} />
              <span className={`${s.iceShard} ${s.is4}`} />
              <span className={`${s.iceShard} ${s.is5}`} />
              <span className={`${s.iceShard} ${s.is6}`} />
            </div>
          )}

          {/* ⚡ 8. SSSVIP Song Long: Dual Cross "X" Lightning Strike */}
          {b.theme === 'vip10_thunder' && (
            <div className={s.burstSongLong}>
              <div className={`${s.lightningBoltX} ${s.lbx1}`} />
              <div className={`${s.lightningBoltX} ${s.lbx2}`} />
              <div className={s.thunderCoreFlash} />
              <span className={`${s.dragonEnergySpark} ${s.des1}`}>⚡</span>
              <span className={`${s.dragonEnergySpark} ${s.des2}`}>⚡</span>
            </div>
          )}

          {/* 🌌 9. GOD Nữ Thần: Blackhole Implosion & Supernova Burst */}
          {b.theme === 'god_cosmic' && (
            <div className={s.burstGodCosmic}>
              <div className={s.blackHoleCore} />
              <div className={s.supernovaShockwave} />
              <span className={`${s.supernovaRay} ${s.snr1}`}>✦</span>
              <span className={`${s.supernovaRay} ${s.snr2}`}>★</span>
              <span className={`${s.supernovaRay} ${s.snr3}`}>✦</span>
              <span className={`${s.supernovaRay} ${s.snr4}`}>★</span>
            </div>
          )}

          {/* 🌈 10. Gundam Calibarn: Flashing Radar Coordinate Scan Grid */}
          {b.theme === 'gundam_calibarn' && (
            <div className={s.burstCalibarnRadar}>
              <div className={s.radarScanCircle} />
              <div className={s.radarCrossGrid} />
              <span className={`${s.radarCoordinateText} ${s.rct1}`}>POS_X: 8.8</span>
              <span className={`${s.radarCoordinateText} ${s.rct2}`}>PERMET: 8</span>
              <span className={`${s.calibarnPixelFly} ${s.cpf1}`}>■</span>
              <span className={`${s.calibarnPixelFly} ${s.cpf2}`}>■</span>
              <span className={`${s.calibarnPixelFly} ${s.cpf3}`}>■</span>
            </div>
          )}

          {/* 🦄 11. Unicorn Awakened: Explosive Green Psycho-Field Cross Flash */}
          {b.theme === 'unicorn_awakened' && (
            <div className={s.burstUnicornCross}>
              <div className={`${s.psychoCrossRay} ${s.pcrVertical}`} />
              <div className={`${s.psychoCrossRay} ${s.pcrHorizontal}`} />
              <div className={s.psychoBurstCore} />
              <span className={`${s.unicornCrystalShard} ${s.ucs1}`}>✦</span>
              <span className={`${s.unicornCrystalShard} ${s.ucs2}`}>◆</span>
              <span className={`${s.unicornCrystalShard} ${s.ucs3}`}>✦</span>
            </div>
          )}

          {/* 🪶 12. Wing Zero Custom: Pure White Mechanical Angel Feathers & Zero System Glint */}
          {b.theme === 'wing_zero_ew' && (
            <div className={s.burstWingZero}>
              <div className={s.angelFeatherFlash} />
              <div className={s.zeroSystemGreenOrb} />
              
              {/* 5 Falling Pure White Mechanical Feathers (SVG Vector Matching Avatar Frame) */}
              <div className={`${s.wzFeatherItem} ${s.wzf1}`}>
                <svg viewBox="0 0 20 30" className={s.wzFeatherSvg} fill="none">
                  <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.95)" stroke="#93C5FD" strokeWidth="0.8" />
                  <line x1="10" y1="2" x2="10" y2="28" stroke="#38BDF8" strokeWidth="0.8" />
                  <path d="M 10 9 L 16 13 M 10 15 L 17 19 M 10 21 L 15 25" stroke="#BAE6FD" strokeWidth="0.5" />
                  <path d="M 10 9 L 4 13 M 10 15 L 3 19 M 10 21 L 5 25" stroke="#BAE6FD" strokeWidth="0.5" />
                </svg>
              </div>
              <div className={`${s.wzFeatherItem} ${s.wzf2}`}>
                <svg viewBox="0 0 20 30" className={s.wzFeatherSvg} fill="none">
                  <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.95)" stroke="#93C5FD" strokeWidth="0.8" />
                  <line x1="10" y1="2" x2="10" y2="28" stroke="#38BDF8" strokeWidth="0.8" />
                  <path d="M 10 9 L 16 13 M 10 15 L 17 19 M 10 21 L 15 25" stroke="#BAE6FD" strokeWidth="0.5" />
                  <path d="M 10 9 L 4 13 M 10 15 L 3 19 M 10 21 L 5 25" stroke="#BAE6FD" strokeWidth="0.5" />
                </svg>
              </div>
              <div className={`${s.wzFeatherItem} ${s.wzf3}`}>
                <svg viewBox="0 0 20 30" className={s.wzFeatherSvg} fill="none">
                  <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.95)" stroke="#93C5FD" strokeWidth="0.8" />
                  <line x1="10" y1="2" x2="10" y2="28" stroke="#38BDF8" strokeWidth="0.8" />
                  <path d="M 10 9 L 16 13 M 10 15 L 17 19 M 10 21 L 15 25" stroke="#BAE6FD" strokeWidth="0.5" />
                  <path d="M 10 9 L 4 13 M 10 15 L 3 19 M 10 21 L 5 25" stroke="#BAE6FD" strokeWidth="0.5" />
                </svg>
              </div>
              <div className={`${s.wzFeatherItem} ${s.wzf4}`}>
                <svg viewBox="0 0 20 30" className={s.wzFeatherSvg} fill="none">
                  <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.9)" stroke="#93C5FD" strokeWidth="0.75" />
                  <line x1="10" y1="2" x2="10" y2="28" stroke="#38BDF8" strokeWidth="0.75" />
                </svg>
              </div>
              <div className={`${s.wzFeatherItem} ${s.wzf5}`}>
                <svg viewBox="0 0 20 30" className={s.wzFeatherSvg} fill="none">
                  <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.9)" stroke="#93C5FD" strokeWidth="0.75" />
                  <line x1="10" y1="2" x2="10" y2="28" stroke="#38BDF8" strokeWidth="0.75" />
                </svg>
              </div>

              {/* Sparkle Glints */}
              <span className={`${s.wzSparkle} ${s.wzs1}`}>✦</span>
              <span className={`${s.wzSparkle} ${s.wzs2}`}>✧</span>
              <span className={`${s.wzSparkle} ${s.wzs3}`}>✦</span>
            </div>
          )}

          {/* 🔴 13. Sazabi ver.Ka: Intense Mono-Eye Laser Flash & Target Lock Flare */}
          {b.theme === 'sazabi_verka' && (
            <div className={s.burstSazabiLock}>
              <div className={s.sazabiLockCircle} />
              <div className={s.sazabiMonoEyeFlashCenter} />
              <span className={`${s.targetLockBracket} ${s.tlb1}`}>[</span>
              <span className={`${s.targetLockBracket} ${s.tlb2}`}>]</span>
              <span className={`${s.sazabiSparks} ${s.ss1}`}>•</span>
              <span className={`${s.sazabiSparks} ${s.ss2}`}>•</span>
            </div>
          )}

          {/* Default Ripple */}
          {b.theme !== 'rainbow' &&
            b.theme !== 'sakura_hearts' &&
            b.theme !== 'sparkle_stars' &&
            b.theme !== 'cyber_aura' &&
            b.theme !== 'emerald_royal' &&
            b.theme !== 'vip8_fire' &&
            b.theme !== 'vip9_frost' &&
            b.theme !== 'vip10_thunder' &&
            b.theme !== 'god_cosmic' &&
            b.theme !== 'gundam_calibarn' &&
            b.theme !== 'unicorn_awakened' &&
            b.theme !== 'wing_zero_ew' &&
            b.theme !== 'sazabi_verka' && (
              <div className={s.defaultClickRipple} />
            )}
        </div>
      ))}
    </>
  )
}

const MemoClickBursts = memo(ClickBurstsLayer)

function CustomCursorFollower({ user, cursorTheme }) {
  const activeTheme = cursorTheme || user?.avatarFrame || user?.frame || 'default'

  const [bursts, setBursts] = useState([])
  const burstTimersRef = useRef([]) // ponytail: collect timeouts for cleanup, avoids setState-after-unmount
  const [isMounted, setIsMounted] = useState(false)

  const rootRef = useRef(null)
  const ringRef = useRef(null)
  const coreRef = useRef(null)

  const posRef = useRef({
    targetX: -100,
    targetY: -100,
    lerpX: -100,
    lerpY: -100,
    lastX: -100,
    lastY: -100,
    targetAngle: 0,
    lerpAngle: 0,
    isVisible: false,
  })

  // 1. Unconditionally inject global cursor: none !important style in document head
  useEffect(() => {
    setIsMounted(true)
    let styleEl = document.getElementById('custom-cursor-hide-native')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'custom-cursor-hide-native'
      styleEl.innerHTML = `
        html, body, *, *::before, *::after {
          cursor: none !important;
        }
      `
      document.head.appendChild(styleEl)
    }

    return () => {
      const existing = document.getElementById('custom-cursor-hide-native')
      if (existing) existing.remove()
    }
  }, [])

  // 2. High-performance Mouse Movement & Angle Heading Tracking
  useEffect(() => {
    let rafId = null

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const p = posRef.current

      // Calculate direction delta & heading angle
      if (p.isVisible && p.lastX !== -100) {
        const dx = clientX - p.lastX
        const dy = clientY - p.lastY
        const dist = Math.hypot(dx, dy)

        if (dist > 1.5) {
          p.targetAngle = Math.atan2(dy, dx) * (180 / Math.PI)
        }
      }

      p.lastX = clientX
      p.lastY = clientY
      p.targetX = clientX
      p.targetY = clientY

      if (!p.isVisible) {
        p.isVisible = true
        p.lerpX = clientX
        p.lerpY = clientY
        p.lastX = clientX
        p.lastY = clientY
        if (rootRef.current) {
          rootRef.current.style.opacity = '1'
        }
      }
    }

    const handleMouseDown = (e) => {
      if (ringRef.current) ringRef.current.classList.add(s.ringClick)
      
      const id = Date.now() + Math.random()
      const newBurst = {
        id,
        x: e.clientX,
        y: e.clientY,
        theme: activeTheme,
      }
      setBursts((prev) => [...prev.slice(-8), newBurst])
      const tid = setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id))
        burstTimersRef.current = burstTimersRef.current.filter((t) => t !== tid)
      }, 1000)
      burstTimersRef.current.push(tid)
    }

    const handleMouseUp = () => {
      if (ringRef.current) ringRef.current.classList.remove(s.ringClick)
    }

    const handleMouseOver = (e) => {
      const target = e.target
      const isInteractive = target?.closest(
        'button, a, input, textarea, select, [role="button"], [tabindex="0"], label, .clickable'
      )
      if (ringRef.current) {
        if (isInteractive) {
          ringRef.current.classList.add(s.ringHover)
        } else {
          ringRef.current.classList.remove(s.ringHover)
        }
      }
    }

    const handleMouseLeave = () => {
      posRef.current.isVisible = false
      if (rootRef.current) {
        rootRef.current.style.opacity = '0'
      }
    }

    // High performance rAF loop for smooth trailing ring & directional angle rotation
    const loop = () => {
      const p = posRef.current
      if (p.isVisible) {
        // Smooth position lerp for trailing ring
        p.lerpX += (p.targetX - p.lerpX) * 0.35
        p.lerpY += (p.targetY - p.lerpY) * 0.35

        // Smooth angle lerp (shortest angular distance)
        let diff = (p.targetAngle - p.lerpAngle) % 360
        if (diff > 180) diff -= 360
        if (diff < -180) diff += 360
        p.lerpAngle += diff * 0.25

        // Hardware GPU update without React re-render
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${p.lerpX}px, ${p.lerpY}px, 0) translate(-50%, -50%)`
        }

        if (coreRef.current) {
          coreRef.current.style.transform = `translate3d(${p.targetX}px, ${p.targetY}px, 0) translate(-50%, -50%) rotate(${p.lerpAngle}deg)`
        }
      }
      rafId = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    rafId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId) cancelAnimationFrame(rafId)
      // Clear all pending burst-removal timers to prevent setState-after-unmount/re-mount
      burstTimersRef.current.forEach(clearTimeout)
      burstTimersRef.current = []
    }
  }, [activeTheme])

  if (!isMounted || typeof document === 'undefined') return null

  const content = (
    <div
      ref={rootRef}
      className={s.cursorRoot}
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      {/* 1. Trailing Follower Ring / Theme Halo (Smooth Lerp Position) */}
      <div
        ref={ringRef}
        className={`${s.followerRing} ${s[activeTheme] || s.default}`}
      >
        {/* 🌈 Rainbow Pixel Trail */}
        {activeTheme === 'rainbow' && (
          <div className={s.rainbowTrailStream} />
        )}

        {/* 🌸 Sakura Hearts Trail */}
        {activeTheme === 'sakura_hearts' && (
          <div className={s.sakuraMistWrap}>
            <span className={`${s.floatingHeart} ${s.fh1}`}>♥</span>
            <span className={`${s.floatingHeart} ${s.fh2}`}>♥</span>
          </div>
        )}

        {/* ✨ Sparkle Stars Trail */}
        {activeTheme === 'sparkle_stars' && (
          <div className={s.shootingStarTrail} />
        )}

        {/* ⚡ Cyber Aura Trail */}
        {activeTheme === 'cyber_aura' && (
          <div className={s.lightningArcTrail}>
            <span className={s.lightningFlicker} />
          </div>
        )}

        {/* 🌿 5. Hoàng Gia Lục Bảo (Fairy Dust Trail) */}
        {activeTheme === 'emerald_royal' && (
          <div className={s.fairyDustTrail}>
            <span className={`${s.fairyDust} ${s.fd1}`}>✦</span>
            <span className={`${s.fairyDust} ${s.fd2}`}>✧</span>
            <span className={`${s.fairyDust} ${s.fd3}`}>▪</span>
          </div>
        )}

        {/* 🔥 6. SVIP Thánh Hỏa (Roaring Flame & Ash Embers) */}
        {activeTheme === 'vip8_fire' && (
          <div className={s.holyFireTrail}>
            <span className={`${s.ashEmber} ${s.ae1}`}>•</span>
            <span className={`${s.ashEmber} ${s.ae2}`}>•</span>
            <span className={`${s.ashEmber} ${s.ae3}`}>•</span>
          </div>
        )}

        {/* ❄️ 7. SSVIP Cánh Băng (Frost Breath & Swirling Snowflakes) */}
        {activeTheme === 'vip9_frost' && (
          <div className={s.frostBreathTrail}>
            <span className={`${s.swirlSnowflake} ${s.sf1}`}>❄</span>
            <span className={`${s.swirlSnowflake} ${s.sf2}`}>✦</span>
            <span className={`${s.swirlSnowflake} ${s.sf3}`}>*</span>
          </div>
        )}

        {/* ⚡ 8. SSSVIP Song Long (Ethereal Dragon Tail & Cyan Lightning) */}
        {activeTheme === 'vip10_thunder' && (
          <div className={s.dragonTailTrail}>
            <div className={s.dragonTailSinuous} />
            <span className={`${s.dragonLightning} ${s.dl1}`}>⚡</span>
            <span className={`${s.dragonLightning} ${s.dl2}`}>⚡</span>
          </div>
        )}

        {/* 🌌 9. GOD Nữ Thần (Cosmic Galaxy Swirl & Stardust) */}
        {activeTheme === 'god_cosmic' && (
          <div className={s.godGalaxySwirl}>
            <div className={s.galaxySpiralRing} />
            <span className={`${s.cosmicStardust} ${s.cs1}`}>✦</span>
            <span className={`${s.cosmicStardust} ${s.cs2}`}>★</span>
            <span className={`${s.cosmicStardust} ${s.cs3}`}>✧</span>
          </div>
        )}

        {/* 🌈 10. Gundam Calibarn (Segmented Dashed Rainbow Permet Stream) */}
        {activeTheme === 'gundam_calibarn' && (
          <div className={s.calibarnDashedPermetTrail}>
            <span className={`${s.permetSegment} ${s.ps1}`} />
            <span className={`${s.permetSegment} ${s.ps2}`} />
            <span className={`${s.permetSegment} ${s.ps3}`} />
            <span className={`${s.permetSegment} ${s.ps4}`} />
          </div>
        )}

        {/* 🦄 11. Unicorn Awakened (Radiant Emerald Psycho-Frame Breathing Glow) */}
        {activeTheme === 'unicorn_awakened' && (
          <div className={s.unicornPsychoBreathingTrail}>
            <div className={s.psychoBreathingRing} />
            <span className={`${s.psychoDustSpark} ${s.pds1}`}>✦</span>
            <span className={`${s.psychoDustSpark} ${s.pds2}`}>◆</span>
          </div>
        )}

        {/* 🪶 12. Wing Zero Custom (Angelic Halo Glow) */}
        {activeTheme === 'wing_zero_ew' && (
          <div className={s.wingZeroAngelHaloTrail}>
            <div className={s.angelHaloRing} />
            <span className={`${s.haloFeatherSpark} ${s.hfs1}`}>🪶</span>
          </div>
        )}

        {/* 🔴 13. Sazabi ver.Ka (Rocket Thruster Jet Exhaust & Space Dust) */}
        {activeTheme === 'sazabi_verka' && (
          <div className={s.sazabiThrusterJetTrail}>
            <div className={s.sazabiJetFlame} />
            <span className={`${s.spaceDust} ${s.sd1}`} />
            <span className={`${s.spaceDust} ${s.sd2}`} />
          </div>
        )}
      </div>

      {/* 2. Instant Sharp Pointer Core (Dynamic Heading Direction) */}
      <div
        ref={coreRef}
        className={`${s.pointerCore} ${s[`core_${activeTheme}`] || s.core_default}`}
      >
        {/* 🌈 Cầu Vồng Pixel (Directional 8-Bit Pixel Arrow pointing right by default) */}
        {activeTheme === 'rainbow' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <path
              d="M 22 12 L 8 4 L 11 10 L 2 10 L 2 14 L 11 14 L 8 20 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="1.6"
              strokeLinejoin="miter"
            />
          </svg>
        )}

        {/* 🌸 Trái Tim & Sakura (Delicate Pink Petal) */}
        {activeTheme === 'sakura_hearts' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <path
              d="M 22 12 C 16 6, 8 4, 2 8 C 4 14, 8 20, 16 20 C 19 18, 22 14, 22 12 Z"
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

        {/* ⚡ Hào Quang Lửa (Directional Flame Dart) */}
        {activeTheme === 'cyber_aura' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF1100" />
                <stop offset="50%" stopColor="#FF7700" />
                <stop offset="100%" stopColor="#FFEE55" />
              </linearGradient>
            </defs>
            <polygon
              points="24,12 11,3 13,10 0,10 0,14 13,14 11,21"
              fill="url(#flameGrad)"
              stroke="#FFF9A6"
              strokeWidth="0.8"
            />
          </svg>
        )}

        {/* 🌿 5. Hoàng Gia Lục Bảo (Glowing Emerald Rhombus Gem) */}
        {activeTheme === 'emerald_royal' && (
          <svg viewBox="0 0 24 24" className={s.emeraldRhombusSvg}>
            <defs>
              <linearGradient id="emeraldGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E6FFF2" />
                <stop offset="35%" stopColor="#00FF88" />
                <stop offset="75%" stopColor="#00C988" />
                <stop offset="100%" stopColor="#006940" />
              </linearGradient>
            </defs>
            <polygon
              points="22,12 12,3 2,12 12,21"
              fill="url(#emeraldGemGrad)"
              stroke="#FFD700"
              strokeWidth="1.2"
            />
            <polygon
              points="18,12 12,6 6,12 12,18"
              fill="#FFFFFF"
              opacity="0.35"
            />
          </svg>
        )}

        {/* 🔥 6. SVIP Thánh Hỏa (Directional Royal Golden Flame Arrow) */}
        {activeTheme === 'vip8_fire' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="holyFireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7F1D1D" />
                <stop offset="40%" stopColor="#DC2626" />
                <stop offset="80%" stopColor="#FF7700" />
                <stop offset="100%" stopColor="#FFF275" />
              </linearGradient>
            </defs>
            <path
              d="M 23 12 L 7 3 L 11 10 L 0 10 L 0 14 L 11 14 L 7 21 Z"
              fill="url(#holyFireGrad)"
              stroke="#FFD700"
              strokeWidth="1.2"
            />
          </svg>
        )}

        {/* ❄️ 7. SSVIP Cánh Băng (Directional Frost Crystal Spear) */}
        {activeTheme === 'vip9_frost' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="frostIceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="50%" stopColor="#38BDF8" />
                <stop offset="90%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <polygon
              points="24,12 14,5 16,10 0,11 0,13 16,14 14,19"
              fill="url(#frostIceGrad)"
              stroke="#E0F2FE"
              strokeWidth="0.8"
            />
            <line x1="0" y1="12" x2="22" y2="12" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        )}

        {/* ⚡ 8. SSSVIP Song Long (Directional Teal Dragon Head) */}
        {activeTheme === 'vip10_thunder' && (
          <svg viewBox="0 0 26 26" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="tealDragonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#004D5A" />
                <stop offset="40%" stopColor="#0099B8" />
                <stop offset="80%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#E0FFFF" />
              </linearGradient>
            </defs>
            <path
              d="M 24 13 C 18 8, 14 6, 8 2 C 10 7, 8 10, 2 12 C 8 14, 10 17, 8 22 C 14 18, 18 16, 24 13 Z"
              fill="url(#tealDragonGrad)"
              stroke="#00FFFF"
              strokeWidth="1.2"
            />
            <circle cx="16" cy="11" r="1.5" fill="#FFE57F" />
          </svg>
        )}

        {/* 🌌 9. GOD Nữ Thần: Directional Cosmic Valkyrie Star Dart */}
        {activeTheme === 'god_cosmic' && (
          <svg viewBox="0 0 26 26" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="godCosmicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF0077" />
                <stop offset="40%" stopColor="#B000FF" />
                <stop offset="80%" stopColor="#00F2FE" />
                <stop offset="100%" stopColor="#FFF9A6" />
              </linearGradient>
            </defs>
            <polygon
              points="26,13 14,4 16,10 0,9 2,13 0,17 16,16 14,22"
              fill="url(#godCosmicGrad)"
              stroke="#FFF9A6"
              strokeWidth="1.2"
            />
            <circle cx="16" cy="13" r="2.5" fill="#FFFFFF" />
          </svg>
        )}

        {/* 🌈 10. Gundam Calibarn: Directional Angular Cybernetic Arrow */}
        {activeTheme === 'gundam_calibarn' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="calibarnArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#64748B" />
                <stop offset="50%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <polygon
              points="23,12 11,3 14,10 0,10 0,14 14,14 11,21"
              fill="url(#calibarnArrowGrad)"
              stroke="#00F5D4"
              strokeWidth="1.2"
            />
            <line x1="6" y1="12" x2="18" y2="12" stroke="#FF0055" strokeWidth="1.4" />
            <circle cx="18" cy="12" r="1.5" fill="#00FFFF" />
          </svg>
        )}

        {/* 🦄 11. Unicorn Awakened: Destroy Mode Expanded White Armor Crosshair */}
        {activeTheme === 'unicorn_awakened' && (
          <svg viewBox="0 0 26 26" className={s.unicornCrosshairSvg}>
            <defs>
              <linearGradient id="unicornArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
            <path d="M 4 9 L 4 4 L 9 4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <path d="M 22 9 L 22 4 L 17 4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <path d="M 4 17 L 4 22 L 9 22" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <path d="M 22 17 L 22 22 L 17 22" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <circle cx="13" cy="13" r="3" fill="#00FF88" stroke="#FFFFFF" strokeWidth="0.8" />
            <line x1="13" y1="7" x2="13" y2="19" stroke="#00FF88" strokeWidth="0.8" />
            <line x1="7" y1="13" x2="19" y2="13" stroke="#00FF88" strokeWidth="0.8" />
          </svg>
        )}

        {/* 🪶 12. Wing Zero Custom: Directional Mechanical Angel Feather Blade */}
        {activeTheme === 'wing_zero_ew' && (
          <svg viewBox="0 0 24 24" className={s.directionalArrowSvg}>
            <defs>
              <linearGradient id="wzBladeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="60%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <path
              d="M 23 12 C 16 5, 8 2, 0 6 C 6 12, 6 16, 0 20 C 8 22, 16 19, 23 12 Z"
              fill="url(#wzBladeGrad)"
              stroke="#60A5FA"
              strokeWidth="1"
            />
            <line x1="2" y1="12" x2="20" y2="12" stroke="#FFD700" strokeWidth="0.8" />
            <circle cx="16" cy="12" r="1.5" fill="#00FF88" />
          </svg>
        )}

        {/* 🔴 13. Sazabi ver.Ka: Neo Zeon Crimson Red Target Lock Reticle */}
        {activeTheme === 'sazabi_verka' && (
          <svg viewBox="0 0 26 26" className={s.sazabiLockOnReticleSvg}>
            <circle cx="13" cy="13" r="10" stroke="#FF1E27" strokeWidth="1.4" strokeDasharray="4 2" fill="none" />
            <path d="M 2 13 L 6 13 M 20 13 L 24 13 M 13 2 L 13 6 M 13 20 L 13 24" stroke="#FF1E27" strokeWidth="1.5" />
            <circle cx="13" cy="13" r="2.8" fill="#00FF66" stroke="#FFE57F" strokeWidth="0.6" />
          </svg>
        )}
      </div>

      {/* 3. Click Burst Particle Effects (Spawned at exact clientX / clientY) */}
      <MemoClickBursts bursts={bursts} />
    </div>
  )

  return createPortal(content, document.body)
}

export default memo(CustomCursorFollower)
