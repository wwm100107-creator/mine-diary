import React, { memo } from 'react'
import s from './AvatarFrameOverlay.module.css'

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Mặc định', icon: '🚫', desc: 'Không khung viền' },
  { id: 'god_cosmic', name: '🌌 GOD Nữ Thần', icon: '👑', desc: 'Cấp bậc Tối Thượng GOD Mode — Song Nữ Thần Valkyrie, lửa địa ngục & lôi quang 7 màu nhấp nháy' },
  { id: 'vip10_thunder', name: '⚡ SSSVIP Song Long', icon: '⚡', desc: 'SSSVIP Song Long Lôi Thần — Đầu rồng phong lôi, sấm sét liên tục & điện quang chớp giật' },
  { id: 'vip9_frost', name: '❄️ SSVIP Cánh Băng', icon: '❄️', desc: 'SSVIP Thiên Thần Băng Tuyết — Cánh thiên thần bạch kim & sương băng huyền ảo' },
  { id: 'vip8_fire', name: '🔥 SVIP Thánh Hỏa', icon: '🔥', desc: 'SVIP Cánh thiên thần trắng, vương miện hoàng gia & hào quang lửa' },
  { id: 'cyber_aura', name: '⚡ Hào Quang Lửa', icon: '✨', desc: 'Lửa vàng & điện quang chớp giật' },
  { id: 'rainbow', name: '🌈 Cầu Vồng Pixel', icon: '🌈', desc: 'Viền cầu vồng luân chuyển 8-bit' },
  { id: 'sparkle_stars', name: '✨ Ngôi Sao Lấp Lánh', icon: '⭐', desc: 'Sao pixel nhấp nháy 4 góc' },
  { id: 'sakura_hearts', name: '🌸 Trái Tim & Sakura', icon: '🌸', desc: 'Hoa anh đào & tim hồng nhịp đập' },
]

function AvatarFrameOverlayComponent({ frameId = 'none', size = 36, sizePreset }) {
  if (!frameId || frameId === 'none') return null

  // Auto-determine scale preset: 'xs' -> 0.65, 'sm' -> 0.72, 'md'/'lg' -> 1.0
  const activePreset = sizePreset || (size <= 36 ? 'sm' : size <= 50 ? 'md' : 'lg')
  const scale = activePreset === 'xs' ? 0.65 : activePreset === 'sm' ? 0.72 : 1.0

  // Scale offset based on avatar size for standard corner frames
  const starSize = Math.max(6, Math.floor(size * 0.22))
  const cornerOffset = -Math.floor(starSize * 0.35)

  return (
    <div
      className={`${s.frameOverlay} ${s[frameId] || ''} ${s[`size_${activePreset}`] || ''}`}
      style={{
        '--frame-size': `${size}px`,
        '--frame-scale': scale,
      }}
      aria-hidden="true"
    >
      
      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🌌 GOD MODE — NỮ THẦN SÁNG THẾ & LÔI QUANG 7 MÀU (SUPREME GODDESS RAINBOW LIGHTNING)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'god_cosmic' && (
        <div className={s.godContainer}>
          {/* Layer 1: 7-Color Rainbow Shifting Lightning Aura */}
          <div className={s.godRainbowLightningAura} />
          <div className={s.godInfernoFireAura} />

          {/* Layer 2: Rapid 7-Color Zigzag Lightning Sparks & Embers */}
          <div className={s.godRainbowSparks}>
            <span className={`${s.godBolt} ${s.gb1}`}>⚡</span>
            <span className={`${s.godBolt} ${s.gb2}`}>✦</span>
            <span className={`${s.godBolt} ${s.gb3}`}>⚡</span>
            <span className={`${s.godBolt} ${s.gb4}`}>✧</span>
            <span className={`${s.godBolt} ${s.gb5}`}>⚡</span>
            <span className={`${s.godBolt} ${s.gb6}`}>★</span>
            <span className={`${s.godBolt} ${s.gb7}`}>⚡</span>
            <span className={`${s.godBolt} ${s.gb8}`}>✦</span>
          </div>

          {/* Layer 3: Central Double Obsidian Frame & Golden Laurel Wreath */}
          <div className={s.godCentralFrame}>
            <div className={s.godMagmaRing} />
            <div className={s.godLaurelWreath}>
              <svg viewBox="0 0 48 48" className={s.laurelSvg}>
                {/* Golden Laurel Leaves Left */}
                <path d="M12,18 C8,14 6,22 10,24 C14,26 14,20 12,18 Z" fill="url(#godGoldLeafGrad)" />
                <path d="M10,26 C6,24 6,32 10,33 C14,34 13,28 10,26 Z" fill="url(#godGoldLeafGrad)" />
                <path d="M12,34 C9,34 10,40 14,40 C17,40 15,35 12,34 Z" fill="url(#godGoldLeafGrad)" />
                {/* Golden Laurel Leaves Right */}
                <path d="M36,18 C40,14 42,22 38,24 C34,26 34,20 36,18 Z" fill="url(#godGoldLeafGrad)" />
                <path d="M38,26 C42,24 42,32 38,33 C34,34 35,28 38,26 Z" fill="url(#godGoldLeafGrad)" />
                <path d="M36,34 C39,34 38,40 34,40 C31,40 33,35 36,34 Z" fill="url(#godGoldLeafGrad)" />
              </svg>
            </div>
            <div className={s.godRainbowSurge} />
          </div>

          {/* Layer 4: Left & Right Dark Angel Goddesses with Magenta/Crimson Wings */}
          <div className={`${s.godValkyrie} ${s.valkyrieLeft}`}>
            <svg viewBox="0 0 52 56" className={s.goddessSvg}>
              {/* Grand Magenta & Crimson Fiery Wings */}
              <path d="M52,6 C38,0 24,8 14,18 C4,28 0,42 0,54 C12,46 26,48 36,40 C46,32 50,20 52,6 Z" fill="url(#godWingMagentaGrad)" />
              <path d="M48,12 C36,10 24,18 16,28 C8,38 10,48 20,50 C30,46 40,36 44,26 Z" fill="url(#godWingCrimsonGrad)" />
              {/* Purple Hair & Goddess Head */}
              <path d="M42,20 C36,16 32,24 34,32 C36,40 44,38 46,30 Z" fill="#9333EA" />
              <circle cx="38" cy="24" r="3.2" fill="#FDE047" />
              {/* Glowing Red Eyes */}
              <circle cx="37" cy="24" r="1.4" fill="#FF0000" className={s.goddessEye} />
              {/* Goddess Golden Crown */}
              <polygon points="34,16 38,20 42,16 40,12 36,12" fill="url(#godGoldLeafGrad)" />
              <circle cx="38" cy="14" r="0.9" fill="#DC2626" />
            </svg>
          </div>
          <div className={`${s.godValkyrie} ${s.valkyrieRight}`}>
            <svg viewBox="0 0 52 56" className={s.goddessSvg}>
              {/* Grand Magenta & Crimson Fiery Wings */}
              <path d="M0,6 C14,0 28,8 38,18 C48,28 52,42 52,54 C40,46 26,48 16,40 C6,32 2,20 0,6 Z" fill="url(#godWingMagentaGrad)" />
              <path d="M4,12 C16,10 28,18 36,28 C44,38 42,48 32,50 C22,46 12,36 8,26 Z" fill="url(#godWingCrimsonGrad)" />
              {/* Purple Hair & Goddess Head */}
              <path d="M10,20 C16,16 20,24 18,32 C16,40 8,38 6,30 Z" fill="#9333EA" />
              <circle cx="14" cy="24" r="3.2" fill="#FDE047" />
              {/* Glowing Red Eyes */}
              <circle cx="15" cy="24" r="1.4" fill="#FF0000" className={s.goddessEye} />
              {/* Goddess Golden Crown */}
              <polygon points="18,16 14,20 10,16 12,12 16,12" fill="url(#godGoldLeafGrad)" />
              <circle cx="14" cy="14" r="0.9" fill="#DC2626" />
            </svg>
          </div>

          {/* Layer 5: Top Imperial Gold Crown with Ruby Heart */}
          <div className={s.godImperialCrown}>
            <svg viewBox="0 0 40 26" className={s.crownSvg}>
              <defs>
                <linearGradient id="godGoldLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9C4" />
                  <stop offset="35%" stopColor="#FFD700" />
                  <stop offset="70%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>
                <linearGradient id="godWingMagentaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="35%" stopColor="#E879F9" />
                  <stop offset="70%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="godWingCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#DC2626" />
                  <stop offset="100%" stopColor="#18181B" />
                </linearGradient>
                <linearGradient id="godInfernoGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#FF0000" />
                  <stop offset="40%" stopColor="#FF5500" />
                  <stop offset="75%" stopColor="#FFE600" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
              {/* Crown Base & Arches */}
              <path d="M6,22 L34,22 L36,17 L31,10 L25,17 L20,4 L15,17 L9,10 L4,17 Z" fill="url(#godGoldLeafGrad)" stroke="#5D4037" strokeWidth="1" />
              {/* Center Ruby Gem */}
              <polygon points="20,8 24,13 20,18 16,13" fill="#DC2626" stroke="#FFF" strokeWidth="0.8" className={s.godRubyGem} />
              {/* Side Rubies */}
              <circle cx="9" cy="11" r="1.5" fill="#EF4444" />
              <circle cx="31" cy="11" r="1.5" fill="#EF4444" />
              <circle cx="20" cy="4" r="1.8" fill="#FFE600" />
            </svg>
          </div>

          {/* Layer 6: Lower White Wings & Blazing Inferno Flames */}
          <div className={s.godLowerWings}>
            <svg viewBox="0 0 54 22" className={s.lowerWingsSvg}>
              {/* Left & Right White Angel Feathers */}
              <path d="M16,6 C10,2 2,6 0,14 C8,12 14,14 18,18 C16,12 18,8 16,6 Z" fill="#FFFFFF" filter="drop-shadow(0 0 4px #FFF)" />
              <path d="M38,6 C44,2 52,6 54,14 C46,12 40,14 36,18 C38,12 36,8 38,6 Z" fill="#FFFFFF" filter="drop-shadow(0 0 4px #FFF)" />
            </svg>
          </div>

          {/* Layer 7: Bottom Inferno Base, Ribbon & GOD Badge */}
          <div className={s.godBottomBadge}>
            <div className={s.godInfernoFlames} />
            <div className={s.godRibbon}>
              <span className={s.godCrestGlow}>♦</span>
              <span className={s.godText}>👑 GOD 👑</span>
              <span className={s.godCrestGlow}>♦</span>
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
              <linearGradient id="sssvipGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#E0F7FA" />
                <stop offset="70%" stopColor="#00FFFF" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Layer 5: Top Imperial Thunder Storm Crown (Vương Miện Lôi Thần) */}
          <div className={s.vip10Crown}>
            <svg viewBox="0 0 44 26" className={s.thunderCrownSvg}>
              {/* Crown Base Obsidian Rim */}
              <path d="M4,22 L40,22 L38,18 L6,18 Z" fill="#0F172A" stroke="#0284C7" strokeWidth="0.8" />
              {/* Gold Crown Tier with 5 Peaks */}
              <polygon points="6,18 2,8 10,13 16,5 22,1 28,5 34,13 42,8 38,18" fill="url(#sssvipGoldGrad)" stroke="#B45309" strokeWidth="0.7" />
              {/* Inner Cyan/Electric Highlights */}
              <polygon points="10,17 7,10 13,14 18,8 22,4 26,8 31,14 37,10 34,17" fill="url(#sssvipDragonGrad)" opacity="0.85" />
              {/* Center Lightning Trident / Finial */}
              <polygon points="22,0 20,5 24,5" fill="#00FFFF" />
              <circle cx="22" cy="0" r="1.2" fill="#FFFFFF" />
              {/* Left & Right Peak Gold/Cyan Gems */}
              <circle cx="2" cy="8" r="1" fill="#00FFFF" />
              <circle cx="16" cy="5" r="1.1" fill="#FFD700" />
              <circle cx="28" cy="5" r="1.1" fill="#FFD700" />
              <circle cx="42" cy="8" r="1" fill="#00FFFF" />
              {/* Central Glowing Electric Diamond Gem */}
              <polygon points="22,9 26,14 22,19 18,14" fill="url(#sssvipGemGrad)" stroke="#FFFFFF" strokeWidth="0.7" className={s.thunderGem} />
              <circle cx="22" cy="14" r="1.2" fill="#FFFFFF" opacity="0.9" />
            </svg>
          </div>

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
      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🔥 SVIP — THIÊN THẦN LỬA & VƯƠNG MIỆN HOÀNG GIA (SOLAR ANGEL ROYAL SVIP)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'vip8_fire' && (
        <div className={s.vip8Container}>
          {/* Layer 1: Blazing Solar Fire Aura Glow */}
          <div className={s.vip8SolarFireAura} />
          <div className={s.vip8SolarRing} />

          {/* Layer 2: Floating Fire Particle Sparks */}
          <div className={s.vip8Sparks}>
            <span className={`${s.vip8Spark} ${s.s1}`}>✦</span>
            <span className={`${s.vip8Spark} ${s.s2}`}>✧</span>
            <span className={`${s.vip8Spark} ${s.s3}`}>✦</span>
            <span className={`${s.vip8Spark} ${s.s4}`}>✧</span>
            <span className={`${s.vip8Spark} ${s.s5}`}>★</span>
            <span className={`${s.vip8Spark} ${s.s6}`}>✦</span>
          </div>

          {/* Layer 3: Left & Right Grand White Angelic Wings with Crimson Inner Glow */}
          <div className={`${s.vip8AngelWing} ${s.wingLeft}`}>
            <svg viewBox="0 0 46 64" className={s.angelWingSvg}>
              {/* Outer Primary White Feathers */}
              <path d="M46,6 C32,0 18,8 8,22 C0,34 -2,48 4,58 C14,64 26,56 34,44 C38,36 42,22 46,6 Z" fill="url(#svipWhiteWingGrad)" />
              {/* Middle Layer Carved Feathers */}
              <path d="M44,14 C32,10 20,18 12,30 C6,40 10,50 20,54 C28,54 36,44 40,32 Z" fill="url(#svipInnerFeatherGrad)" />
              {/* Inner Fiery Crimson Glow Feathers */}
              <path d="M46,24 C36,20 26,28 20,38 C16,46 22,50 30,50 C36,48 42,38 44,30 Z" fill="url(#svipCrimsonGlowGrad)" />
              {/* White Feather Highlights */}
              <path d="M42,10 C34,8 24,14 18,24 C14,32 18,40 26,42" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.8" />
            </svg>
          </div>
          <div className={`${s.vip8AngelWing} ${s.wingRight}`}>
            <svg viewBox="0 0 46 64" className={s.angelWingSvg}>
              {/* Outer Primary White Feathers */}
              <path d="M0,6 C14,0 28,8 38,22 C46,34 48,48 42,58 C32,64 20,56 12,44 C8,36 4,22 0,6 Z" fill="url(#svipWhiteWingGrad)" />
              {/* Middle Layer Carved Feathers */}
              <path d="M2,14 C14,10 26,18 34,30 C40,40 36,50 26,54 C18,54 10,44 6,32 Z" fill="url(#svipInnerFeatherGrad)" />
              {/* Inner Fiery Crimson Glow Feathers */}
              <path d="M0,24 C10,20 20,28 26,38 C30,46 24,50 16,50 C10,48 4,38 2,30 Z" fill="url(#svipCrimsonGlowGrad)" />
              {/* White Feather Highlights */}
              <path d="M4,10 C12,8 22,14 28,24 C32,32 28,40 20,42" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.8" />
            </svg>
          </div>

          {/* Layer 4: Left & Right White Silver Bramble Antlers */}
          <div className={`${s.vip8Bramble} ${s.brambleLeft}`}>
            <svg viewBox="0 0 36 24" className={s.brambleSvg}>
              <path d="M36,22 C26,18 16,16 6,10 C2,7 0,3 0,0 C3,5 8,8 14,10 C10,8 6,4 4,1 C9,6 16,9 22,10 C16,9 12,6 9,3 C16,8 24,12 32,14 Z" fill="url(#svipSilverBrambleGrad)" stroke="#FFFFFF" strokeWidth="0.6" />
              {/* Thorns */}
              <polygon points="12,10 8,6 14,9" fill="#FFFFFF" />
              <polygon points="20,13 16,8 22,12" fill="#FFFFFF" />
              <polygon points="28,16 25,12 30,15" fill="#FFFFFF" />
            </svg>
          </div>
          <div className={`${s.vip8Bramble} ${s.brambleRight}`}>
            <svg viewBox="0 0 36 24" className={s.brambleSvg}>
              <path d="M0,22 C10,18 20,16 30,10 C34,7 36,3 36,0 C33,5 28,8 22,10 C26,8 30,4 32,1 C27,6 20,9 14,10 C20,9 24,6 27,3 C20,8 12,12 4,14 Z" fill="url(#svipSilverBrambleGrad)" stroke="#FFFFFF" strokeWidth="0.6" />
              {/* Thorns */}
              <polygon points="24,10 28,6 22,9" fill="#FFFFFF" />
              <polygon points="16,13 20,8 14,12" fill="#FFFFFF" />
              <polygon points="8,16 11,12 6,15" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Layer 5: Top Imperial Red & Gold Royal Crown with Ruby Finials */}
          <div className={s.vip8Crown}>
            <svg viewBox="0 0 46 32" className={s.crownSvg}>
              <defs>
                <linearGradient id="svipGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFDF0" />
                  <stop offset="25%" stopColor="#FFE066" />
                  <stop offset="60%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="svipRubyVelvetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF1E56" />
                  <stop offset="45%" stopColor="#C0082A" />
                  <stop offset="100%" stopColor="#5D0014" />
                </linearGradient>
                <linearGradient id="svipRubyGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF6B8B" />
                  <stop offset="50%" stopColor="#FF0040" />
                  <stop offset="100%" stopColor="#780016" />
                </linearGradient>
                <linearGradient id="svipWhiteWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="55%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                <linearGradient id="svipInnerFeatherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#FFE4E6" />
                  <stop offset="100%" stopColor="#FDA4AF" />
                </linearGradient>
                <linearGradient id="svipCrimsonGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF4D6D" />
                  <stop offset="60%" stopColor="#E11D48" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
                <linearGradient id="svipSilverBrambleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#94A3B8" />
                </linearGradient>
                <linearGradient id="svipRibbonGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9C4" />
                  <stop offset="25%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="75%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="svipCrimsonThornsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF1E56" />
                  <stop offset="50%" stopColor="#C0082A" />
                  <stop offset="100%" stopColor="#3B0007" />
                </linearGradient>
              </defs>

              {/* Glowing Fiery Halo beneath Crown */}
              <ellipse cx="23" cy="27" rx="16" ry="4" fill="#FF5500" opacity="0.6" filter="blur(1px)" />

              {/* Crown Royal Velvet Interior Cushion */}
              <path d="M10,24 C10,13 36,13 36,24 Z" fill="url(#svipRubyVelvetGrad)" />

              {/* Crown Base Band with Velvet and Gold Trim */}
              <rect x="8" y="23" width="30" height="6" rx="3" fill="#881337" stroke="url(#svipGoldGrad)" strokeWidth="1.2" />
              {/* Gold Filigree / Oval Studs on Band */}
              <circle cx="13" cy="26" r="1.4" fill="url(#svipGoldGrad)" />
              <circle cx="18" cy="26" r="1.4" fill="url(#svipRubyGemGrad)" />
              <circle cx="23" cy="26" r="1.8" fill="url(#svipGoldGrad)" />
              <circle cx="28" cy="26" r="1.4" fill="url(#svipRubyGemGrad)" />
              <circle cx="33" cy="26" r="1.4" fill="url(#svipGoldGrad)" />

              {/* Gold Crown Arches & 5 Peaks */}
              <path d="M8,23 L4,12 L12,17 L17,8 L23,2 L29,8 L34,17 L42,12 L38,23 Z" fill="url(#svipGoldGrad)" stroke="#78350F" strokeWidth="0.8" />

              {/* Left/Right Peak Ruby Gems */}
              <circle cx="4" cy="12" r="1.8" fill="url(#svipRubyGemGrad)" stroke="#FFD700" strokeWidth="0.6" />
              <circle cx="17" cy="8" r="1.8" fill="url(#svipRubyGemGrad)" stroke="#FFD700" strokeWidth="0.6" />
              <circle cx="29" cy="8" r="1.8" fill="url(#svipRubyGemGrad)" stroke="#FFD700" strokeWidth="0.6" />
              <circle cx="42" cy="12" r="1.8" fill="url(#svipRubyGemGrad)" stroke="#FFD700" strokeWidth="0.6" />

              {/* Center Grand Cross / Fleur-de-lis & Ruby Drop */}
              <polygon points="23,0 21,5 25,5" fill="#FFE066" />
              <circle cx="23" cy="0" r="1.4" fill="#FF0040" stroke="#FFD700" strokeWidth="0.6" />
              {/* Grand Central Teardrop Ruby Gem */}
              <polygon points="23,9 26,14 23,20 20,14" fill="url(#svipRubyGemGrad)" stroke="#FFF9C4" strokeWidth="0.8" className={s.vip8Gem} />
              <circle cx="23" cy="14" r="1.2" fill="#FFFFFF" opacity="0.9" />
            </svg>
          </div>

          {/* Layer 6: Bottom Crimson Spikes, Flowing Golden Ribbon Banner & SVIP Text */}
          <div className={s.vip8BottomBadge}>
            {/* Fan of Sharp Crimson Spikes / Crystal Blades */}
            <div className={s.bottomCrimsonSpikes}>
              <svg viewBox="0 0 48 20" className={s.spikesSvg}>
                {/* Spreading Blades */}
                <polygon points="24,20 22,0 26,0" fill="#E11D48" stroke="#881337" strokeWidth="0.5" />
                <polygon points="24,19 18,2 22,0" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,19 30,2 26,0" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,17 13,4 17,2" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,17 35,4 31,2" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,15 8,7 12,5" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,15 40,7 36,5" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,12 4,11 7,9" fill="url(#svipCrimsonThornsGrad)" />
                <polygon points="24,12 44,11 41,9" fill="url(#svipCrimsonThornsGrad)" />
                {/* Center Silver-tipped Spearhead */}
                <polygon points="24,20 23,10 25,10" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Curved Flowing Gold Ribbon Banner */}
            <div className={s.vip8RibbonWrapper}>
              <svg viewBox="0 0 100 24" className={s.ribbonBannerSvg}>
                {/* Left Swallowtail */}
                <path d="M12,6 L0,4 L4,11 L0,18 L12,16 Z" fill="#92400E" />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="url(#svipRibbonGoldGrad)" stroke="#78350F" strokeWidth="0.6" />
                {/* Right Swallowtail */}
                <path d="M88,6 L100,4 L96,11 L100,18 L88,16 Z" fill="#92400E" />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="url(#svipRibbonGoldGrad)" stroke="#78350F" strokeWidth="0.6" />
                {/* Central Curved Ribbon Body */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="url(#svipRibbonGoldGrad)" stroke="#78350F" strokeWidth="0.8" />
                {/* Top/Bottom Shimmer Highlights */}
                <path d="M11,7 C31,4 69,4 89,7" stroke="#FFFDF0" strokeWidth="0.8" fill="none" opacity="0.9" />
                <path d="M13,17 C33,20 67,20 87,17" stroke="#78350F" strokeWidth="0.8" fill="none" opacity="0.7" />
              </svg>

              {/* Text SVIP Centered on Banner */}
              <span className={s.vip8Text}>SVIP</span>
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
