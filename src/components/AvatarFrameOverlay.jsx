import React, { memo } from 'react'
import s from './AvatarFrameOverlay.module.css'

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Mặc định', icon: '🚫', desc: 'Không khung viền' },
  { id: 'god_cosmic', name: '🌌 GOD Sáng Thế', icon: '👑', desc: 'Cấp bậc Tối Thượng GOD Mode — Cực quang 6 cánh thiên thần & tinh vân vô cực' },
  { id: 'vip10_thunder', name: '⚡ SSSVIP Song Long', icon: '⚡', desc: 'SSSVIP Song Long Lôi Thần — Đầu rồng phong lôi, sấm sét liên tục & điện quang chớp giật' },
  { id: 'vip9_frost', name: '❄️ SSVIP Cánh Băng', icon: '❄️', desc: 'SSVIP Thiên Thần Băng Tuyết — Cánh thiên thần bạch kim & sương băng huyền ảo' },
  { id: 'vip8_fire', name: '🔥 SVIP Rồng Lửa', icon: '🔥', desc: 'SVIP Rồng vàng hoàng kim & hào quang lửa cháy bùng nổ' },
  { id: 'cyber_aura', name: '⚡ Hào Quang Lửa', icon: '✨', desc: 'Lửa vàng & điện quang chớp giật' },
  { id: 'rainbow', name: '🌈 Cầu Vồng Pixel', icon: '🌈', desc: 'Viền cầu vồng luân chuyển 8-bit' },
  { id: 'sparkle_stars', name: '✨ Ngôi Sao Lấp Lánh', icon: '⭐', desc: 'Sao pixel nhấp nháy 4 góc' },
  { id: 'sakura_hearts', name: '🌸 Trái Tim & Sakura', icon: '🌸', desc: 'Hoa anh đào & tim hồng nhịp đập' },
]

function AvatarFrameOverlayComponent({ frameId = 'none', size = 36 }) {
  if (!frameId || frameId === 'none') return null

  // Scale offset based on avatar size
  const starSize = Math.max(6, Math.floor(size * 0.22))
  const cornerOffset = -Math.floor(starSize * 0.35)

  return (
    <div className={`${s.frameOverlay} ${s[frameId] || ''}`} aria-hidden="true">
      
      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🌌 GOD MODE — SÁNG THẾ THẦN LINH VÔ CỰC (SUPREME COSMIC CREATOR)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'god_cosmic' && (
        <div className={s.godContainer}>
          {/* Rotating Cosmic God Halo (360 Deg Celestial Wheel) */}
          <div className={s.godHaloWheel}>
            <div className={s.godHaloRay1} />
            <div className={s.godHaloRay2} />
            <div className={s.godHaloRing} />
          </div>

          {/* Multi-Dimensional Prismatic Aura */}
          <div className={s.godAuraGlow} />

          {/* Stardust Celestial Particles */}
          <div className={s.godParticles}>
            <span className={`${s.godStar} ${s.g1}`}>★</span>
            <span className={`${s.godStar} ${s.g2}`}>✦</span>
            <span className={`${s.godStar} ${s.g3}`}>✧</span>
            <span className={`${s.godStar} ${s.g4}`}>✨</span>
            <span className={`${s.godStar} ${s.g5}`}>✦</span>
            <span className={`${s.godStar} ${s.g6}`}>⭐</span>
          </div>

          {/* Six Angelic Celestial Wings (3 Left, 3 Right) */}
          <div className={`${s.godWingsWrap} ${s.godWingsLeft}`}>
            <svg viewBox="0 0 32 40" className={s.godWingsSvg}>
              <path d="M32,4 C22,0 12,6 4,14 C-2,20 0,28 8,34 C16,40 24,32 28,24 C30,20 32,12 32,4 Z" fill="url(#godWingsGrad)" />
              <path d="M30,10 C22,8 14,14 8,22 C5,26 8,30 14,32 C20,34 26,26 28,20 Z" fill="url(#godInnerGrad)" />
              <path d="M32,18 C26,16 20,20 16,26 C14,29 16,32 20,34 C24,36 28,30 30,26 Z" fill="url(#godLightGrad)" />
            </svg>
          </div>
          <div className={`${s.godWingsWrap} ${s.godWingsRight}`}>
            <svg viewBox="0 0 32 40" className={s.godWingsSvg}>
              <path d="M0,4 C10,0 20,6 28,14 C34,20 32,28 24,34 C16,40 8,32 4,24 C2,20 0,12 0,4 Z" fill="url(#godWingsGrad)" />
              <path d="M2,10 C10,8 18,14 24,22 C27,26 24,30 18,32 C12,34 6,26 4,20 Z" fill="url(#godInnerGrad)" />
              <path d="M0,18 C6,16 12,20 16,26 C18,29 16,32 12,34 C8,36 4,30 2,26 Z" fill="url(#godLightGrad)" />
            </svg>
          </div>

          {/* Base Diamond Prismatic Border with Infinite Shimmer */}
          <div className={s.godGoldBorder}>
            <div className={s.godPrismSweep} />
          </div>

          {/* Supreme God Crown with 7-Color Rainbow Infinity Gem */}
          <div className={s.godCrown}>
            <svg viewBox="0 0 40 26" className={s.crownSvg}>
              <defs>
                <linearGradient id="godWingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="25%" stopColor="#FFF275" />
                  <stop offset="50%" stopColor="#FF77E9" />
                  <stop offset="75%" stopColor="#70A6FF" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
                <linearGradient id="godInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE600" />
                  <stop offset="50%" stopColor="#FF007F" />
                  <stop offset="100%" stopColor="#7928CA" />
                </linearGradient>
                <linearGradient id="godLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#00DFD8" />
                </linearGradient>
                <linearGradient id="godCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDE7" />
                  <stop offset="30%" stopColor="#FFD700" />
                  <stop offset="60%" stopColor="#FFA000" />
                  <stop offset="100%" stopColor="#FF6F00" />
                </linearGradient>
                <radialGradient id="godGemGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="30%" stopColor="#00F2FE" />
                  <stop offset="65%" stopColor="#E056FD" />
                  <stop offset="100%" stopColor="#FF007F" />
                </radialGradient>
              </defs>
              {/* Solar Halo Spikes behind crown */}
              <path d="M20,0 L23,8 L32,3 L29,11 L38,9 L32,16 L40,18 L32,22 L8,22 L0,18 L8,16 L2,9 L11,11 L8,3 L17,8 Z" fill="url(#godWingsGrad)" opacity="0.85" />
              {/* Main Golden Sovereign Crown */}
              <path d="M6,22 L34,22 L36,17 L31,10 L25,17 L20,4 L15,17 L9,10 L4,17 Z" fill="url(#godCrownGrad)" stroke="#B8860B" strokeWidth="1" />
              {/* Infinity Center Diamond Gem */}
              <polygon points="20,6 26,13 20,20 14,13" fill="url(#godGemGrad)" stroke="#FFF" strokeWidth="1" className={s.godGemFlash} />
              {/* Flanking Cosmic Orbs */}
              <circle cx="9" cy="10" r="2" fill="#00F2FE" stroke="#FFF" strokeWidth="0.6" />
              <circle cx="20" cy="4" r="2.5" fill="#FFE600" stroke="#FF007F" strokeWidth="0.8" />
              <circle cx="31" cy="10" r="2" fill="#00F2FE" stroke="#FFF" strokeWidth="0.6" />
            </svg>
          </div>

          {/* Bottom GOD Diamond Ribbon Badge */}
          <div className={s.godBottomBadge}>
            <div className={s.godHaloArch} />
            <div className={s.godRibbon}>
              <span className={s.godText}>👑 GOD 👑</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: ⚡ SSSVIP — SONG LONG LÔI THẦN (TWIN STORM DRAGONS SSSVIP)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'vip10_thunder' && (
        <div className={s.vip10Container}>
          {/* Layer 1: Continuous Lightning Storm Aura Glow */}
          <div className={s.vip10StormAura} />
          <div className={s.vip10ThunderAura} />

          {/* Layer 2: Zigzag Lightning Bolts & Electric Plasma Sparks */}
          <div className={s.vip10Sparks}>
            <span className={`${s.vip10Bolt} ${s.t1}`}>⚡</span>
            <span className={`${s.vip10Bolt} ${s.t2}`}>✦</span>
            <span className={`${s.vip10Bolt} ${s.t3}`}>⚡</span>
            <span className={`${s.vip10Bolt} ${s.t4}`}>■</span>
            <span className={`${s.vip10Bolt} ${s.t5}`}>⚡</span>
            <span className={`${s.vip10Bolt} ${s.t6}`}>✦</span>
            <span className={`${s.vip10Bolt} ${s.t7}`}>⚡</span>
          </div>

          {/* Layer 3: Dark Obsidian Outer Rim & Glowing Blue Core */}
          <div className={s.vip10ObsidianBorder}>
            <div className={s.vip10NeonRing} />
            <div className={s.vip10ElectricSurge} />
          </div>

          {/* Layer 4: Left & Right Epic Storm Dragon Heads with Glowing Red Eyes */}
          <div className={`${s.vip10DragonHead} ${s.headLeft}`}>
            <svg viewBox="0 0 44 48" className={s.stormDragonSvg}>
              {/* Back Mane Spikes (Silver & Electric Blue) */}
              <path d="M44,4 C34,0 22,6 14,14 C6,22 2,34 0,44 C10,38 20,40 28,34 C36,28 42,18 44,4 Z" fill="url(#sssvipManeGrad)" />
              <path d="M40,10 C30,8 20,16 12,24 C6,32 6,40 14,44 C22,42 30,34 36,26 Z" fill="url(#sssvipBodyGrad)" />
              {/* Dragon Snout & Fierce Jaws */}
              <path d="M38,22 L24,24 L16,28 L12,24 L16,22 L10,18 L18,18 L22,14 L30,16 Z" fill="url(#sssvipBodyGrad)" stroke="#00FFFF" strokeWidth="0.8" />
              {/* Dragon Teeth & Tongue */}
              <polygon points="18,24 20,27 22,24" fill="#FFFFFF" />
              <path d="M16,25 C12,28 8,30 4,28 C8,26 12,26 14,24 Z" fill="#FF4500" />
              {/* Fierce Glowing Red/Orange Dragon Eye */}
              <circle cx="22" cy="18" r="2.4" fill="#FF1E00" className={s.dragonEyeStorm} />
              <circle cx="22" cy="18" r="1.1" fill="#FFE600" />
              {/* Lightning Crackle on Horns */}
              <polygon points="34,8 30,16 36,15 28,26 32,18 26,18" fill="#00FFFF" className={s.hornLightning} />
            </svg>
          </div>
          <div className={`${s.vip10DragonHead} ${s.headRight}`}>
            <svg viewBox="0 0 44 48" className={s.stormDragonSvg}>
              {/* Back Mane Spikes (Silver & Electric Blue) */}
              <path d="M0,4 C10,0 22,6 30,14 C38,22 42,34 44,44 C34,38 24,40 16,34 C8,28 2,18 0,4 Z" fill="url(#sssvipManeGrad)" />
              <path d="M4,10 C14,8 24,16 32,24 C38,32 38,40 30,44 C22,42 14,34 8,26 Z" fill="url(#sssvipBodyGrad)" />
              {/* Dragon Snout & Fierce Jaws */}
              <path d="M6,22 L20,24 L28,28 L32,24 L28,22 L34,18 L26,18 L22,14 L14,16 Z" fill="url(#sssvipBodyGrad)" stroke="#00FFFF" strokeWidth="0.8" />
              {/* Dragon Teeth & Tongue */}
              <polygon points="26,24 24,27 22,24" fill="#FFFFFF" />
              <path d="M28,25 C32,28 36,30 40,28 C36,26 32,26 30,24 Z" fill="#FF4500" />
              {/* Fierce Glowing Red/Orange Dragon Eye */}
              <circle cx="22" cy="18" r="2.4" fill="#FF1E00" className={s.dragonEyeStorm} />
              <circle cx="22" cy="18" r="1.1" fill="#FFE600" />
              {/* Lightning Crackle on Horns */}
              <polygon points="10,8 14,16 8,15 16,26 12,18 18,18" fill="#00FFFF" className={s.hornLightning} />
            </svg>
          </div>

          {/* Layer 5: Gradients Definition */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <linearGradient id="sssvipManeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E0F7FA" />
                <stop offset="65%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#0D47A1" />
              </linearGradient>
              <linearGradient id="sssvipBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="40%" stopColor="#0F172A" />
                <stop offset="80%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#00FFFF" />
              </linearGradient>
              <linearGradient id="sssvipGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9C4" />
                <stop offset="35%" stopColor="#FFD700" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
          </svg>

          {/* Layer 6: Bottom Oriental Storm Clouds, Golden Chains & SSSVIP Banner */}
          <div className={s.vip10BottomBadge}>
            {/* Swirling White/Cyan Storm Clouds */}
            <div className={s.bottomClouds}>
              <svg viewBox="0 0 48 14" className={s.cloudsSvg}>
                <path d="M6,10 C2,10 0,8 2,5 C4,2 8,2 10,4 C12,1 18,1 20,4 C22,1 28,1 30,4 C32,2 36,2 38,5 C40,8 38,10 34,10 Z" fill="#FFFFFF" opacity="0.9" />
                <path d="M12,12 C8,12 6,10 8,8 C10,6 14,6 16,8 C18,5 24,5 26,8 C28,5 34,5 36,8 C38,10 36,12 32,12 Z" fill="#BAE6FD" opacity="0.75" />
              </svg>
            </div>

            {/* Golden Chains Swag */}
            <div className={s.goldenChains}>
              <span>⛓</span><span>✦</span><span>⛓</span>
            </div>

            {/* SSSVIP Ornate Cyber Banner */}
            <div className={s.vip10Ribbon}>
              <span className={s.vip10Text}>SSSVIP</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: ❄️ SSVIP — THIÊN THẦN CÁNH BĂNG (FROST ANGELIC FEATHERED SSVIP)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'vip9_frost' && (
        <div className={s.vip9Container}>
          {/* Layer 1: Ethereal Billowing Glacial Mist Aura (Sương Băng) */}
          <div className={s.vip9MistAura} />
          <div className={s.vip9IceAura} />

          {/* Layer 2: Twinkling 4-Point Diamond Sparkles & Snowflakes */}
          <div className={s.vip9Sparks}>
            <span className={`${s.vip9Crystal} ${s.c1}`}>✦</span>
            <span className={`${s.vip9Crystal} ${s.c2}`}>✧</span>
            <span className={`${s.vip9Crystal} ${s.c3}`}>❄</span>
            <span className={`${s.vip9Crystal} ${s.c4}`}>✦</span>
            <span className={`${s.vip9Crystal} ${s.c5}`}>✧</span>
            <span className={`${s.vip9Crystal} ${s.c6}`}>✨</span>
            <span className={`${s.vip9Crystal} ${s.c7}`}>✦</span>
            <span className={`${s.vip9Crystal} ${s.c8}`}>✧</span>
          </div>

          {/* Layer 3: Crystalline Silver-Blue Border with Diamond Sweep */}
          <div className={s.vip9Border}>
            <div className={s.vip9FrostSweep} />
          </div>

          {/* Layer 4: Grand Sweeping Feathered Angelic Ice Wings (Left & Right) */}
          <div className={`${s.vip9IceWing} ${s.iceWingLeft}`}>
            <svg viewBox="0 0 36 48" className={s.iceWingSvg}>
              {/* Outer Primary Feathers */}
              <path d="M36,4 C24,0 12,6 4,16 C-2,24 0,34 8,42 C18,48 28,40 32,32 C34,26 36,16 36,4 Z" fill="url(#ssvipWingGrad)" />
              {/* Middle Layer Carved Feathers */}
              <path d="M34,10 C24,8 14,14 8,22 C4,28 8,36 16,40 C22,42 28,34 32,26 Z" fill="url(#ssvipInnerGrad)" />
              {/* Inner Diamond Highlights */}
              <path d="M36,18 C28,16 20,20 16,28 C14,32 18,36 24,38 C28,38 32,32 34,26 Z" fill="url(#ssvipLightGrad)" />
              {/* Diamond Star Accent */}
              <polygon points="12,18 14,14 16,18 14,22" fill="#FFFFFF" className={s.wingSparkle} />
            </svg>
          </div>
          <div className={`${s.vip9IceWing} ${s.iceWingRight}`}>
            <svg viewBox="0 0 36 48" className={s.iceWingSvg}>
              {/* Outer Primary Feathers */}
              <path d="M0,4 C12,0 24,6 32,16 C38,24 36,34 28,42 C18,48 8,40 4,32 C2,26 0,16 0,4 Z" fill="url(#ssvipWingGrad)" />
              {/* Middle Layer Carved Feathers */}
              <path d="M2,10 C12,8 22,14 28,22 C32,28 28,36 20,40 C14,42 8,34 4,26 Z" fill="url(#ssvipInnerGrad)" />
              {/* Inner Diamond Highlights */}
              <path d="M0,18 C8,16 16,20 20,28 C22,32 18,36 12,38 C8,38 4,32 2,26 Z" fill="url(#ssvipLightGrad)" />
              {/* Diamond Star Accent */}
              <polygon points="24,18 22,14 20,18 22,22" fill="#FFFFFF" className={s.wingSparkle} />
            </svg>
          </div>

          {/* Layer 5: Top Imperial Diamond Crown with Mini Wings */}
          <div className={s.vip9Crown}>
            <svg viewBox="0 0 44 26" className={s.crownSvg}>
              <defs>
                <linearGradient id="ssvipWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="30%" stopColor="#E8F4FD" />
                  <stop offset="65%" stopColor="#CBE6FE" />
                  <stop offset="100%" stopColor="#8AA8F8" />
                </linearGradient>
                <linearGradient id="ssvipInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#DCE4FF" />
                  <stop offset="100%" stopColor="#99C5FE" />
                </linearGradient>
                <linearGradient id="ssvipLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#BCE0FD" />
                </linearGradient>
                <linearGradient id="ssvipCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#E1EFFF" />
                  <stop offset="80%" stopColor="#ADC8FF" />
                  <stop offset="100%" stopColor="#7DA0FA" />
                </linearGradient>
                <radialGradient id="ssvipDiamondGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#E0F7FA" />
                  <stop offset="80%" stopColor="#80DEEA" />
                  <stop offset="100%" stopColor="#00BCD4" />
                </radialGradient>
              </defs>
              {/* Mini Wings flanking crown */}
              <path d="M6,14 C12,6 18,10 19,16 C16,18 10,18 6,14 Z" fill="url(#ssvipWingGrad)" />
              <path d="M38,14 C32,6 26,10 25,16 C28,18 34,18 38,14 Z" fill="url(#ssvipWingGrad)" />
              {/* Platinum Base Arch & Spikes */}
              <path d="M8,24 L36,24 L38,18 L32,10 L27,18 L22,2 L17,18 L12,10 L6,18 Z" fill="url(#ssvipCrownGrad)" stroke="#7DA0FA" strokeWidth="0.8" />
              {/* Cross Finial at center top */}
              <polygon points="22,0 23,3 26,3 23,5 24,8 22,6 20,8 21,5 18,3 21,3" fill="#FFFFFF" stroke="#ADC8FF" strokeWidth="0.5" className={s.crownCross} />
              {/* Pearl/Diamond Row along base */}
              <circle cx="12" cy="22" r="1.3" fill="#FFFFFF" stroke="#7DA0FA" strokeWidth="0.4" />
              <circle cx="17" cy="22" r="1.3" fill="#FFFFFF" stroke="#7DA0FA" strokeWidth="0.4" />
              <circle cx="22" cy="22" r="1.6" fill="#FFFFFF" stroke="#7DA0FA" strokeWidth="0.5" />
              <circle cx="27" cy="22" r="1.3" fill="#FFFFFF" stroke="#7DA0FA" strokeWidth="0.4" />
              <circle cx="32" cy="22" r="1.3" fill="#FFFFFF" stroke="#7DA0FA" strokeWidth="0.4" />
              {/* Center Ice Diamond Gem */}
              <polygon points="22,8 26,13 22,18 18,13" fill="url(#ssvipDiamondGrad)" stroke="#FFFFFF" strokeWidth="0.8" className={s.vip9IceGem} />
            </svg>
          </div>

          {/* Layer 6: Bottom Feathered Wreath & SSVIP Ribbon */}
          <div className={s.vip9BottomBadge}>
            {/* Bottom Feathered Wings Spread */}
            <div className={s.bottomFeatherWreath}>
              <svg viewBox="0 0 48 18" className={s.bottomWreathSvg}>
                <path d="M24,18 L27,12 L36,16 L42,10 L48,6 C40,8 34,14 24,14 C14,14 8,8 0,6 L6,10 L12,16 L21,12 Z" fill="url(#ssvipWingGrad)" />
                {/* Center Ice Crystal Spike */}
                <polygon points="24,4 27,11 24,18 21,11" fill="#FFFFFF" stroke="#80DEEA" strokeWidth="0.6" className={s.wreathCrystal} />
              </svg>
            </div>

            {/* Frosted SSVIP Ribbon Banner */}
            <div className={s.vip9Ribbon}>
              <span className={s.vip9Text}>SSVIP</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🔥 SVIP — RỒNG LỬA HOÀNG KIM (SUPREME GOLD FIRE DRAGON SVIP)
         ══════════════════════════════════════════════════════════════════════ */}
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

          {/* Layer 4: Left & Right Dragon Heads with Ruby Eyes and Flame Flares */}
          <div className={`${s.vip8DragonWing} ${s.wingLeft}`}>
            <svg viewBox="0 0 28 36" className={s.dragonSvg}>
              {/* Dragon Wing & Mane */}
              <path d="M28,2 C18,0 8,8 2,18 C-2,24 0,30 8,34 C16,38 22,30 24,24 C26,20 28,10 28,2 Z" fill="url(#vip8GoldGrad)" />
              <path d="M26,6 C18,6 12,12 6,20 C4,23 8,26 12,28 C16,30 22,24 24,20 Z" fill="url(#vip8FireGrad)" />
              {/* Dragon Head Profile */}
              <path d="M20,10 L14,12 L11,9 L15,8 L13,5 L18,7 L22,6 Z" fill="url(#vip8GoldGrad)" stroke="#684200" strokeWidth="0.8" />
              {/* Glowing Ruby Eye */}
              <circle cx="16" cy="9" r="1.8" fill="#FF0000" className={s.dragonEye} />
              <circle cx="16" cy="9" r="0.8" fill="#FFE600" />
              {/* Left Diamond Ruby Gem */}
              <polygon points="26,20 28,24 26,28 24,24" fill="#FF1E00" stroke="#FFD700" strokeWidth="0.6" className={s.borderGem} />
              {/* Flaming Fireball at base */}
              <circle cx="10" cy="26" r="4.5" fill="url(#vip8FireGrad)" className={s.fireOrb} />
            </svg>
          </div>
          <div className={`${s.vip8DragonWing} ${s.wingRight}`}>
            <svg viewBox="0 0 28 36" className={s.dragonSvg}>
              {/* Dragon Wing & Mane */}
              <path d="M0,2 C10,0 20,8 26,18 C30,24 28,30 20,34 C12,38 6,30 4,24 C2,20 0,10 0,2 Z" fill="url(#vip8GoldGrad)" />
              <path d="M2,6 C10,6 16,12 22,20 C24,23 20,26 16,28 C12,30 6,24 4,20 Z" fill="url(#vip8FireGrad)" />
              {/* Dragon Head Profile */}
              <path d="M8,10 L14,12 L17,9 L13,8 L15,5 L10,7 L6,6 Z" fill="url(#vip8GoldGrad)" stroke="#684200" strokeWidth="0.8" />
              {/* Glowing Ruby Eye */}
              <circle cx="12" cy="9" r="1.8" fill="#FF0000" className={s.dragonEye} />
              <circle cx="12" cy="9" r="0.8" fill="#FFE600" />
              {/* Right Diamond Ruby Gem */}
              <polygon points="2,20 4,24 2,28 0,24" fill="#FF1E00" stroke="#FFD700" strokeWidth="0.6" className={s.borderGem} />
              {/* Flaming Fireball at base */}
              <circle cx="18" cy="26" r="4.5" fill="url(#vip8FireGrad)" className={s.fireOrb} />
            </svg>
          </div>

          {/* Layer 5: Top Royal Imperial Crown with Purple Amethyst Gem & Wings */}
          <div className={s.vip8Crown}>
            <svg viewBox="0 0 40 26" className={s.crownSvg}>
              <defs>
                <linearGradient id="vip8GoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9C4" />
                  <stop offset="25%" stopColor="#FFD700" />
                  <stop offset="60%" stopColor="#FF9800" />
                  <stop offset="100%" stopColor="#8D6E63" />
                </linearGradient>
                <linearGradient id="vip8FireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFE600" />
                  <stop offset="45%" stopColor="#FF3D00" />
                  <stop offset="100%" stopColor="#8B0000" />
                </linearGradient>
                <linearGradient id="vip8RubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF5252" />
                  <stop offset="50%" stopColor="#D50000" />
                  <stop offset="100%" stopColor="#5D0000" />
                </linearGradient>
                <radialGradient id="vip8GemGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E056FD" />
                  <stop offset="50%" stopColor="#9B59B6" />
                  <stop offset="100%" stopColor="#3C096C" />
                </radialGradient>
              </defs>
              {/* Crown Top Spikes */}
              <path d="M20,0 L23,7 L31,3 L27,10 L37,8 L30,16 L38,20 L8,20 L2,16 L11,10 L7,3 L15,7 Z" fill="url(#vip8GoldGrad)" opacity="0.9" />
              {/* Velvet Red Interior Dome */}
              <path d="M7,22 C7,12 33,12 33,22 Z" fill="url(#vip8RubyGrad)" />
              {/* Crown Base & Gold Filigree */}
              <path d="M5,24 L35,24 L37,18 L32,12 L26,18 L20,4 L14,18 L8,12 L3,18 Z" fill="url(#vip8GoldGrad)" stroke="#5D4037" strokeWidth="1" />
              {/* Purple Wings Flanking Amethyst Gem */}
              <path d="M12,14 C15,11 17,14 18,14 C17,17 14,16 12,14 Z" fill="#9B59B6" />
              <path d="M28,14 C25,11 23,14 22,14 C23,17 26,16 28,14 Z" fill="#9B59B6" />
              {/* Center Hexagonal Amethyst Gem */}
              <polygon points="20,8 24,11 24,17 20,20 16,17 16,11" fill="url(#vip8GemGrad)" stroke="#FFF59D" strokeWidth="1" className={s.vip8Gem} />
              {/* Top Rubies */}
              <circle cx="8" cy="12" r="1.8" fill="#FF1E00" stroke="#FFD700" strokeWidth="0.6" />
              <circle cx="20" cy="4" r="2.4" fill="#FFD700" stroke="#D50000" strokeWidth="0.8" />
              <circle cx="32" cy="12" r="1.8" fill="#FF1E00" stroke="#FFD700" strokeWidth="0.6" />
            </svg>
          </div>

          {/* Layer 6: Bottom SVIP Crest Banner with Dragon Claws & Center Ruby */}
          <div className={s.vip8BottomBadge}>
            {/* Center Ruby Crest at top of banner */}
            <div className={s.centerRubyCrest}>
              <svg viewBox="0 0 16 14" className={s.rubyCrestSvg}>
                <polygon points="8,0 16,5 12,14 4,14 0,5" fill="url(#vip8GoldGrad)" stroke="#5D4037" strokeWidth="0.8" />
                <polygon points="8,3 12,6 10,11 6,11 4,6" fill="url(#vip8RubyGrad)" stroke="#FFD700" strokeWidth="0.6" className={s.crestRuby} />
              </svg>
            </div>

            {/* Dragon Claws Left & Right */}
            <div className={s.clawLeft}>
              <span>▲</span><span>▲</span><span>▲</span>
            </div>
            <div className={s.clawRight}>
              <span>▲</span><span>▲</span><span>▲</span>
            </div>

            {/* Red & Gold SVIP Ribbon */}
            <div className={s.vip8Ribbon}>
              <span className={s.vip8Text}>SVIP</span>
            </div>

            {/* Bottom Gold Wings Spread */}
            <div className={s.bottomGoldWings}>
              <span>❮</span><span>✦</span><span>❯</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Standard Frames ── */}
      {frameId === 'rainbow' && <div className={s.rainbowBorder} />}

      {frameId === 'sparkle_stars' && (
        <>
          <div className={s.sparkleBorder} />
          <span className={`${s.pixelStar} ${s.starTL}`} style={{ width: starSize, height: starSize, top: cornerOffset, left: cornerOffset }}>✦</span>
          <span className={`${s.pixelStar} ${s.starTR}`} style={{ width: starSize, height: starSize, top: cornerOffset, right: cornerOffset }}>✦</span>
          <span className={`${s.pixelStar} ${s.starBL}`} style={{ width: starSize, height: starSize, bottom: cornerOffset, left: cornerOffset }}>✦</span>
          <span className={`${s.pixelStar} ${s.starBR}`} style={{ width: starSize, height: starSize, bottom: cornerOffset, right: cornerOffset }}>✦</span>
        </>
      )}

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

      {frameId === 'sakura_hearts' && (
        <>
          <div className={s.sakuraBorder} />
          <span className={`${s.pixelHeart} ${s.heartTop}`} style={{ width: starSize, height: starSize, top: cornerOffset, right: cornerOffset }}>♥</span>
          <span className={`${s.pixelHeart} ${s.heartBottom}`} style={{ width: starSize, height: starSize, bottom: cornerOffset, left: cornerOffset }}>🌸</span>
        </>
      )}
    </div>
  )
}

export default memo(AvatarFrameOverlayComponent)
