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
    }, 1000)
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
        {activeTheme === 'cyber_aura' && (
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
              points="12,1 23,12 12,23 1,12"
              fill="url(#emeraldGemGrad)"
              stroke="#FFD700"
              strokeWidth="1.2"
            />
            <polygon
              points="12,5 19,12 12,19 5,12"
              fill="#FFFFFF"
              opacity="0.35"
            />
          </svg>
        )}

        {/* 🔥 6. SVIP Thánh Hỏa (Royal Golden Flame Arrow) */}
        {activeTheme === 'vip8_fire' && (
          <svg viewBox="0 0 24 24" className={s.royalFlameArrowSvg}>
            <defs>
              <linearGradient id="holyFireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="35%" stopColor="#FF7700" />
                <stop offset="85%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
            </defs>
            <path
              d="M 2 2 L 10 22 L 13 14 L 21 17 L 22 14 L 14 11 L 22 3 Z"
              fill="url(#holyFireGrad)"
              stroke="#FFD700"
              strokeWidth="1"
            />
          </svg>
        )}

        {/* ❄️ 7. SSVIP Cánh Băng (Translucent Frost Crystal Spear) */}
        {activeTheme === 'vip9_frost' && (
          <svg viewBox="0 0 24 24" className={s.frostSpearSvg}>
            <defs>
              <linearGradient id="frostIceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="40%" stopColor="#BAE6FD" />
                <stop offset="80%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            <polygon
              points="12,1 18,9 14,23 12,19 10,23 6,9"
              fill="url(#frostIceGrad)"
              stroke="#E0F2FE"
              strokeWidth="0.8"
              opacity="0.9"
            />
            <line x1="12" y1="2" x2="12" y2="19" stroke="#FFFFFF" strokeWidth="1" />
          </svg>
        )}

        {/* ⚡ 8. SSSVIP Song Long (Teal Dragon Head Silhouette) */}
        {activeTheme === 'vip10_thunder' && (
          <svg viewBox="0 0 26 26" className={s.tealDragonSvg}>
            <defs>
              <linearGradient id="tealDragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0FFFF" />
                <stop offset="40%" stopColor="#00FFFF" />
                <stop offset="85%" stopColor="#0099B8" />
                <stop offset="100%" stopColor="#004D5A" />
              </linearGradient>
            </defs>
            <path
              d="M 2 20 C 6 16, 8 10, 14 6 C 16 2, 22 2, 24 6 C 22 10, 18 12, 22 18 C 18 16, 14 18, 10 24 C 6 22, 4 21, 2 20 Z"
              fill="url(#tealDragonGrad)"
              stroke="#00FFFF"
              strokeWidth="1"
            />
            <circle cx="16" cy="8" r="1.5" fill="#FFE57F" />
          </svg>
        )}

        {/* 🌌 9. GOD Nữ Thần (Cosmic North Star & Valkyrie Halo) */}
        {activeTheme === 'god_cosmic' && (
          <svg viewBox="0 0 26 26" className={s.godNorthStarSvg}>
            <defs>
              <linearGradient id="godCosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9A6" />
                <stop offset="35%" stopColor="#FF0077" />
                <stop offset="70%" stopColor="#B000FF" />
                <stop offset="100%" stopColor="#00F2FE" />
              </linearGradient>
            </defs>
            <polygon
              points="13,0 16,9 25,12 16,15 13,24 10,15 1,12 10,9"
              fill="url(#godCosmicGrad)"
              stroke="#FFF9A6"
              strokeWidth="0.8"
            />
            <circle cx="13" cy="12" r="3" fill="#FFFFFF" opacity="0.9" />
          </svg>
        )}

        {/* 🌈 10. Gundam Calibarn: Angular Cybernetic Chamfered Sleek Arrow */}
        {activeTheme === 'gundam_calibarn' && (
          <svg viewBox="0 0 24 24" className={s.calibarnCyberArrowSvg}>
            <defs>
              <linearGradient id="calibarnArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
            </defs>
            <polygon
              points="2,2 8,22 12,14 20,18 22,15 14,11 22,4"
              fill="url(#calibarnArrowGrad)"
              stroke="#00F5D4"
              strokeWidth="1.2"
            />
            {/* Permet Score 8 Accent Slit on Cursor */}
            <line x1="6" y1="8" x2="12" y2="13" stroke="#FF0055" strokeWidth="1.2" />
            <circle cx="12" cy="14" r="1.5" fill="#00FFFF" />
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
            {/* 4 Corner Crosshair Brackets */}
            <path d="M 4 9 L 4 4 L 9 4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <path d="M 22 9 L 22 4 L 17 4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <path d="M 4 17 L 4 22 L 9 22" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            <path d="M 22 17 L 22 22 L 17 22" stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="square" />
            {/* Center Exposed Psycho-Frame Core */}
            <circle cx="13" cy="13" r="3" fill="#00FF88" stroke="#FFFFFF" strokeWidth="0.8" />
            <line x1="13" y1="7" x2="13" y2="19" stroke="#00FF88" strokeWidth="0.8" />
            <line x1="7" y1="13" x2="19" y2="13" stroke="#00FF88" strokeWidth="0.8" />
          </svg>
        )}

        {/* 🪶 12. Wing Zero Custom: Armored Mechanical Angel Feather Blade */}
        {activeTheme === 'wing_zero_ew' && (
          <svg viewBox="0 0 24 24" className={s.wingZeroBladeFeatherSvg}>
            <defs>
              <linearGradient id="wzBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="50%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
            </defs>
            <path
              d="M 2 2 C 10 4, 18 10, 22 22 C 14 18, 6 12, 2 2 Z"
              fill="url(#wzBladeGrad)"
              stroke="#60A5FA"
              strokeWidth="1"
            />
            {/* Blade Spine */}
            <line x1="2" y1="2" x2="20" y2="20" stroke="#FFD700" strokeWidth="0.8" />
            <circle cx="6" cy="6" r="1.5" fill="#00FF88" />
          </svg>
        )}

        {/* 🔴 13. Sazabi ver.Ka: Neo Zeon Crimson Red Target Lock Reticle */}
        {activeTheme === 'sazabi_verka' && (
          <svg viewBox="0 0 26 26" className={s.sazabiLockOnReticleSvg}>
            {/* Outer Circular Lock-on Target */}
            <circle cx="13" cy="13" r="10" stroke="#FF1E27" strokeWidth="1.4" strokeDasharray="4 2" fill="none" />
            <path d="M 2 13 L 6 13 M 20 13 L 24 13 M 13 2 L 13 6 M 13 20 L 13 24" stroke="#FF1E27" strokeWidth="1.5" />
            {/* Center Glowing Green Mono-Eye */}
            <circle cx="13" cy="13" r="2.8" fill="#00FF66" stroke="#FFE57F" strokeWidth="0.6" />
          </svg>
        )}
      </div>

      {/* 3. Click Burst Particle Effects (Spawned at click coordinates) */}
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

          {/* 🪶 12. Wing Zero Custom: 3 Falling Mechanical Feathers */}
          {b.theme === 'wing_zero_ew' && (
            <div className={s.burstWingZero}>
              <div className={s.angelFeatherFlash} />
              <span className={`${s.dropFeather} ${s.df1}`}>🪶</span>
              <span className={`${s.dropFeather} ${s.df2}`}>🪶</span>
              <span className={`${s.dropFeather} ${s.df3}`}>🪶</span>
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
    </div>
  )
}

export default memo(CustomCursorFollower)
