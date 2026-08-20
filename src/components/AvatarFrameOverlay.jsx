import React, { memo } from 'react'
import s from './AvatarFrameOverlay.module.css'

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Mặc định', icon: '🚫', desc: 'Không khung viền' },
  { id: 'rainbow', name: 'Cầu Vồng Pixel', icon: '🌈', desc: 'Viền cầu vồng luân chuyển 8-bit' },
  { id: 'sparkle_stars', name: 'Ngôi Sao Lấp Lánh', icon: '✨', desc: 'Sao pixel nhấp nháy 4 góc' },
  { id: 'cyber_aura', name: 'Hào Quang Lửa', icon: '🔥', desc: 'Lửa vàng & điện quang chớp giật' },
  { id: 'sakura_hearts', name: 'Trái Tim & Sakura', icon: '🌸', desc: 'Hoa anh đào & tim hồng nhịp đập' },
]

function AvatarFrameOverlayComponent({ frameId = 'none', size = 36 }) {
  if (!frameId || frameId === 'none') return null

  // Scale offset based on avatar size
  const starSize = Math.max(6, Math.floor(size * 0.22))
  const cornerOffset = -Math.floor(starSize * 0.35)

  return (
    <div className={`${s.frameOverlay} ${s[frameId] || ''}`} aria-hidden="true">
      {/* Frame 1: Rainbow Pixel Cycling Border */}
      {frameId === 'rainbow' && (
        <div className={s.rainbowBorder} />
      )}

      {/* Frame 2: Sparkle Stars in 4 Corners */}
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

      {/* Frame 3: Cyber Aura / Electric Flame */}
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

      {/* Frame 4: Sakura Hearts (Bonus) */}
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
