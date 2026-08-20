import React, { memo } from 'react'
import s from './AvatarFrameOverlay.module.css'

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Mặc định', icon: '🚫', desc: 'Không khung viền' },
  { id: 'vip8_fire', name: '👑 VIP 8 Rồng Lửa', icon: '🔥', desc: 'Rồng vàng hoàng kim & hào quang lửa bùng cháy VIP' },
  { id: 'cyber_aura', name: 'Hào Quang Lửa', icon: '⚡', desc: 'Lửa vàng & điện quang chớp giật' },
  { id: 'rainbow', name: 'Cầu Vồng Pixel', icon: '🌈', desc: 'Viền cầu vồng luân chuyển 8-bit' },
  { id: 'sparkle_stars', name: 'Ngôi Sao Lấp Lánh', icon: '✨', desc: 'Sao pixel nhấp nháy 4 góc' },
  { id: 'sakura_hearts', name: 'Trái Tim & Sakura', icon: '🌸', desc: 'Hoa anh đào & tim hồng nhịp đập' },
]

function AvatarFrameOverlayComponent({ frameId = 'none', size = 36 }) {
  if (!frameId || frameId === 'none') return null

  // Scale offset based on avatar size
  const starSize = Math.max(6, Math.floor(size * 0.22))
  const cornerOffset = -Math.floor(starSize * 0.35)

  return (
    <div className={`${s.frameOverlay} ${s[frameId] || ''}`} aria-hidden="true">
      {/* ── Frame 0: 👑 VIP 8 Fire Frame (Supreme Dragon Gold & Flame Masterpiece) ── */}
      {frameId === 'vip8_fire' && (
        <div className={s.vip8Container}>
          {/* Layer 1: Blazing Multi-Tier Fire Aura Glow */}
          <div className={s.vip8FireAura} />

          {/* Layer 2: Floating Fire Particle Sparks */}
          <div className={s.vip8Sparks}>
            <span className={`${s.vip8Spark} ${s.s1}`}>✦</span>
            <span className={`${s.vip8Spark} ${s.s2}`}>■</span>
            <span className={`${s.vip8Spark} ${s.s3}`}>✦</span>
            <span className={`${s.vip8Spark} ${s.s4}`}>■</span>
            <span className={`${s.vip8Spark} ${s.s5}`}>✦</span>
            <span className={`${s.vip8Spark} ${s.s6}`}>■</span>
          </div>

          {/* Layer 3: Base Gold Border with Light Sweep */}
          <div className={s.vip8GoldBorder}>
            <div className={s.vip8ShineSweep} />
          </div>

          {/* Layer 4: Left & Right Flaming Dragon Wings */}
          <div className={`${s.vip8DragonWing} ${s.wingLeft}`}>
            <svg viewBox="0 0 24 32" className={s.dragonSvg}>
              <path d="M24,2 C16,0 8,8 2,16 C-1,20 0,26 6,30 C12,34 18,28 20,22 C22,18 24,10 24,2 Z" fill="url(#vip8GoldGrad)" />
              <path d="M22,6 C16,6 10,12 6,18 C4,21 6,24 10,26 C14,28 18,22 20,18 Z" fill="url(#vip8FireGrad)" />
              <circle cx="16" cy="12" r="2.5" fill="#FF1E00" />
              <circle cx="16" cy="12" r="1.2" fill="#FFE600" />
            </svg>
          </div>
          <div className={`${s.vip8DragonWing} ${s.wingRight}`}>
            <svg viewBox="0 0 24 32" className={s.dragonSvg}>
              <path d="M0,2 C8,0 16,8 22,16 C25,20 24,26 18,30 C12,34 6,28 4,22 C2,18 0,10 0,2 Z" fill="url(#vip8GoldGrad)" />
              <path d="M2,6 C8,6 14,12 18,18 C20,21 18,24 14,26 C10,28 6,22 4,18 Z" fill="url(#vip8FireGrad)" />
              <circle cx="8" cy="12" r="2.5" fill="#FF1E00" />
              <circle cx="8" cy="12" r="1.2" fill="#FFE600" />
            </svg>
          </div>

          {/* Layer 5: Top Royal Crown with Pulsing Gemstone */}
          <div className={s.vip8Crown}>
            <svg viewBox="0 0 36 22" className={s.crownSvg}>
              <defs>
                <linearGradient id="vip8GoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF59D" />
                  <stop offset="30%" stopColor="#FFD700" />
                  <stop offset="70%" stopColor="#FF9800" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
                <linearGradient id="vip8FireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFE600" />
                  <stop offset="50%" stopColor="#FF3D00" />
                  <stop offset="100%" stopColor="#8B0000" />
                </linearGradient>
                <radialGradient id="vip8GemGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F368E0" />
                  <stop offset="50%" stopColor="#9B59B6" />
                  <stop offset="100%" stopColor="#481878" />
                </radialGradient>
              </defs>
              {/* Crown Base & Arches */}
              <path d="M4,20 L32,20 L34,16 L30,10 L24,16 L18,4 L12,16 L6,10 L2,16 Z" fill="url(#vip8GoldGrad)" stroke="#684200" strokeWidth="1" />
              {/* Velvet Red Arch */}
              <path d="M8,18 C8,12 28,12 28,18 Z" fill="url(#vip8FireGrad)" />
              {/* Center Sparkling Gem */}
              <polygon points="18,7 23,12 18,17 13,12" fill="url(#vip8GemGrad)" stroke="#FFE600" strokeWidth="0.8" className={s.vip8Gem} />
              {/* Top Rubies */}
              <circle cx="6" cy="10" r="1.6" fill="#FF1E00" stroke="#FFD700" strokeWidth="0.5" />
              <circle cx="18" cy="4" r="2.2" fill="#FFD700" stroke="#FF1E00" strokeWidth="0.8" />
              <circle cx="30" cy="10" r="1.6" fill="#FF1E00" stroke="#FFD700" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Layer 6: Bottom VIP 8 Ribbon Banner with Dragon Claws */}
          <div className={s.vip8BottomBadge}>
            <div className={s.clawLeft}>
              <span>▲</span><span>▲</span>
            </div>
            <div className={s.clawRight}>
              <span>▲</span><span>▲</span>
            </div>
            <div className={s.vip8Ribbon}>
              <span className={s.vip8Text}>VIP 8</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Frame 1: Rainbow Pixel Cycling Border ── */}
      {frameId === 'rainbow' && (
        <div className={s.rainbowBorder} />
      )}

      {/* ── Frame 2: Sparkle Stars in 4 Corners ── */}
      {frameId === 'sparkle_stars' && (
        <>
          <div className={s.sparkleBorder} />
          {/* Top-Left Star */}
          <span
            className={`${s.pixelStar} ${s.starTL}`}
            style={{ width: starSize, height: starSize, top: cornerOffset, left: cornerOffset }}
          >
            ✦
          </span>
          {/* Top-Right Star */}
          <span
            className={`${s.pixelStar} ${s.starTR}`}
            style={{ width: starSize, height: starSize, top: cornerOffset, right: cornerOffset }}
          >
            ✦
          </span>
          {/* Bottom-Left Star */}
          <span
            className={`${s.pixelStar} ${s.starBL}`}
            style={{ width: starSize, height: starSize, bottom: cornerOffset, left: cornerOffset }}
          >
            ✦
          </span>
          {/* Bottom-Right Star */}
          <span
            className={`${s.pixelStar} ${s.starBR}`}
            style={{ width: starSize, height: starSize, bottom: cornerOffset, right: cornerOffset }}
          >
            ✦
          </span>
        </>
      )}

      {/* ── Frame 3: Cyber Aura / Electric Flame ── */}
      {frameId === 'cyber_aura' && (
        <>
          <div className={s.flameAura} />
          <div className={s.flameSparks}>
            <span className={`${s.sparkPoint} ${s.p1}`}>■</span>
            <span className={`${s.sparkPoint} ${s.p2}`}>■</span>
            <span className={`${s.sparkPoint} ${s.p3}`}>■</span>
            <span className={`${s.sparkPoint} ${s.p4}`}>■</span>
          </div>
        </>
      )}

      {/* ── Frame 4: Sakura Hearts ── */}
      {frameId === 'sakura_hearts' && (
        <>
          <div className={s.sakuraBorder} />
          <span
            className={`${s.pixelHeart} ${s.heartTop}`}
            style={{ width: starSize, height: starSize, top: cornerOffset, right: cornerOffset }}
          >
            ♥
          </span>
          <span
            className={`${s.pixelHeart} ${s.heartBottom}`}
            style={{ width: starSize, height: starSize, bottom: cornerOffset, left: cornerOffset }}
          >
            🌸
          </span>
        </>
      )}
    </div>
  )
}

export default memo(AvatarFrameOverlayComponent)
