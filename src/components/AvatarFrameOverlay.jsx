import React, { memo } from 'react'
import s from './AvatarFrameOverlay.module.css'

export const FRAME_COLLECTIONS = [
  { id: 'all', name: '✨ Tất Cả', icon: '✨', desc: 'Duyệt tất cả các khung avatar' },
  { id: 'vip', name: '👑 Chủ Đề VIP', icon: '👑', desc: 'Bộ sưu tập Hoàng Gia & Độc Quyền: GOD, SSSVIP, SSVIP, SVIP, Hào Quang Lửa' },
  { id: 'mecha', name: '🤖 Cơ Khí & Mecha', icon: '🤖', desc: 'Bộ sưu tập Mobile Suit & Chiến Giáp: Sazabi ver.Ka, Cyber Mech...' },
  { id: 'fantasy', name: '🌿 Phép Thuật & Kỳ Ảo', icon: '🌿', desc: 'Bộ sưu tập Thần Thoại: Hoàng Gia Lục Bảo, Sakura Hearts...' },
  { id: 'classic', name: '🎨 Cổ Điển & Dễ Thương', icon: '🌸', desc: 'Bộ sưu tập Pixel Retro: Cầu Vồng, Ngôi Sao Lấp Lánh...' },
]

export const AVATAR_FRAMES = [
  { id: 'none', name: 'Mặc định', icon: '🚫', category: 'all', desc: 'Không khung viền' },

  // ── 👑 BỘ SƯU TẬP CHỦ ĐỀ VIP (VIP COLLECTION) ──
  { id: 'god_cosmic', name: '🌌 GOD Nữ Thần', icon: '👑', category: 'vip', desc: 'Cấp bậc Tối Thượng GOD Mode — Song Nữ Thần Valkyrie, lửa địa ngục & lôi quang 7 màu nhấp nháy' },
  { id: 'vip10_thunder', name: '⚡ SSSVIP Song Long', icon: '⚡', category: 'vip', desc: 'SSSVIP Song Long Lôi Thần — Đầu rồng phong lôi, sấm sét liên tục & điện quang chớp giật' },
  { id: 'vip9_frost', name: '❄️ SSVIP Cánh Băng', icon: '❄️', category: 'vip', desc: 'SSVIP Thiên Thần Băng Tuyết — Cánh thiên thần bạch kim & sương băng huyền ảo' },
  { id: 'vip8_fire', name: '🔥 SVIP Thánh Hỏa', icon: '🔥', category: 'vip', desc: 'SVIP Cánh thiên thần trắng, vương miện hoàng gia & hào quang lửa' },
  { id: 'cyber_aura', name: '⚡ Hào Quang Lửa', icon: '✨', category: 'vip', desc: 'Lửa vàng & điện quang chớp giật' },

  // ── 🤖 BỘ SƯU TẬP CƠ KHÍ & MECHA (GUNDAM & MECHA) ──
  { id: 'sazabi_verka', name: '🔴 Sazabi ver.Ka', icon: '🤖', category: 'mecha', desc: 'MSN-04 Sazabi ver.Ka — Giáp đỏ Crimson Neo Zeon, mắt Mono-eye radar quét liên tục, giáp vai Funnel & động cơ phản lực nhiệt hạch' },
  { id: 'gundam_calibarn', name: '🌈 Gundam Calibarn', icon: '🤖', category: 'mecha', desc: 'X-EX01 Gundam Calibarn (Permet Score 8) — Giáp trắng tinh khôi, sừng V-fin sắc bén, rãnh Permet 7 màu phát quang & luồng hạt Data Storm' },
  { id: 'unicorn_awakened', name: '🦄 Unicorn Awakened', icon: '🤖', category: 'mecha', desc: 'RX-0 Full Armor Unicorn (Awakened Mode) — Giáp trắng tuyết phân tách, sừng V-fin Destroy vàng rực, khung tâm linh Psycho-Frame lục quang hô hấp & tinh thể phát sáng' },
  { id: 'wing_zero_ew', name: '🪶 Wing Zero Custom', icon: '🤖', category: 'mecha', desc: 'XXXG-00W0 Wing Zero Custom (Endless Waltz) — Cánh thiên thần cơ khí vỗ nhịp lơ lửng, lõi Zero System lục quang phát sáng & hiệu ứng lông vũ rơi' },



  // ── 🌿 BỘ SƯU TẬP PHÉP THUẬT & KỲ ẢO (FANTASY & MAGIC) ──
  { id: 'emerald_royal', name: '🌿 Hoàng Gia Lục Bảo', icon: '💎', category: 'fantasy', desc: 'Emerald Royal & Elven Magic — Hào quang ngọc bích, viền vàng ánh kim, vương miện ngọc thạch & dải băng hoàng gia Elven' },
  { id: 'sakura_hearts', name: '🌸 Trái Tim & Sakura', icon: '🌸', category: 'fantasy', desc: 'Hoa anh đào & tim hồng nhịp đập' },

  // ── 🎨 BỘ SƯU TẬP CỔ ĐIỂN & DỄ THƯƠNG (CLASSIC & CUTE) ──
  { id: 'sparkle_stars', name: '✨ Ngôi Sao Lấp Lánh', icon: '⭐', category: 'classic', desc: 'Sao pixel nhấp nháy 4 góc' },
  { id: 'rainbow', name: '🌈 Cầu Vồng Pixel', icon: '🌈', category: 'classic', desc: 'Viền cầu vồng luân chuyển 8-bit' },
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

          {/* Layer 7: Bottom Inferno Base, Red-Purple Lightning Aura, LED Ribbon & GOD Banner */}
          <div className={s.godBottomBadge}>
            <div className={s.godInfernoFlames} />
            
            {/* Red & Purple Flashing Lightning Aura around Ribbon */}
            <div className={s.godRibbonLightningAura}>
              <span className={`${s.godRibbonBolt} ${s.grb1}`}>⚡</span>
              <span className={`${s.godRibbonBolt} ${s.grb2}`}>✦</span>
              <span className={`${s.godRibbonBolt} ${s.grb3}`}>⚡</span>
              <span className={`${s.godRibbonBolt} ${s.grb4}`}>★</span>
              <span className={`${s.godRibbonBolt} ${s.grb5}`}>⚡</span>
              <span className={`${s.godRibbonBolt} ${s.grb6}`}>✦</span>
            </div>

            {/* Luxurious Curved Flowing Swallowtail Ribbon for GOD */}
            <div className={s.godRibbonWrapper}>
              <svg viewBox="0 0 100 24" className={s.ribbonBannerSvg}>
                <defs>
                  <linearGradient id="godRibbonImperialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2E0854" />
                    <stop offset="20%" stopColor="#7F1D1D" />
                    <stop offset="50%" stopColor="#C026D3" />
                    <stop offset="80%" stopColor="#991B1B" />
                    <stop offset="100%" stopColor="#1E053A" />
                  </linearGradient>
                  <linearGradient id="godRibbonGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE57F" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                </defs>
                {/* Left Swallowtail */}
                <path d="M12,6 L0,4 L4,11 L0,18 L12,16 Z" fill="#450A0A" />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="url(#godRibbonImperialGrad)" stroke="url(#godRibbonGoldTrim)" strokeWidth="0.7" />
                {/* Right Swallowtail */}
                <path d="M88,6 L100,4 L96,11 L100,18 L88,16 Z" fill="#450A0A" />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="url(#godRibbonImperialGrad)" stroke="url(#godRibbonGoldTrim)" strokeWidth="0.7" />
                {/* Central Curved Ribbon Body */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="url(#godRibbonImperialGrad)" stroke="url(#godRibbonGoldTrim)" strokeWidth="0.9" />
                {/* Top/Bottom Shimmer Highlights */}
                <path d="M11,7 C31,4 69,4 89,7" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.9" />
                <path d="M13,17 C33,20 67,20 87,17" stroke="#FF1E56" strokeWidth="0.8" fill="none" opacity="0.8" />
                
                {/* EXACT CONTOUR SLIM ANIMATED LED RUNNER */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="none" strokeWidth="1" className={s.godSvgLedPath} />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="none" strokeWidth="1" className={s.godSvgLedPath} />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="none" strokeWidth="1" className={s.godSvgLedPath} />
              </svg>

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

          {/* Layer 6: Bottom Clouds, Chains, Thunder Lightning Aura & SSSVIP Ribbon */}
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

            {/* Thunder Storm Lightning Aura around Ribbon */}
            <div className={s.vip10RibbonLightningAura}>
              <span className={`${s.sssvipRibbonBolt} ${s.srb1}`}>⚡</span>
              <span className={`${s.sssvipRibbonBolt} ${s.srb2}`}>✦</span>
              <span className={`${s.sssvipRibbonBolt} ${s.srb3}`}>⚡</span>
              <span className={`${s.sssvipRibbonBolt} ${s.srb4}`}>■</span>
              <span className={`${s.sssvipRibbonBolt} ${s.srb5}`}>⚡</span>
            </div>

            {/* Luxurious Curved Flowing Swallowtail Ribbon for SSSVIP */}
            <div className={s.vip10RibbonWrapper}>
              <svg viewBox="0 0 100 24" className={s.ribbonBannerSvg}>
                <defs>
                  <linearGradient id="sssvipRibbonStormGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0F172A" />
                    <stop offset="25%" stopColor="#1E293B" />
                    <stop offset="50%" stopColor="#0284C7" />
                    <stop offset="75%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#0A192F" />
                  </linearGradient>
                  <linearGradient id="sssvipRibbonGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9C4" />
                    <stop offset="50%" stopColor="#00FFFF" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
                {/* Left Swallowtail */}
                <path d="M12,6 L0,4 L4,11 L0,18 L12,16 Z" fill="#0A0F1D" />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="url(#sssvipRibbonStormGrad)" stroke="url(#sssvipRibbonGoldTrim)" strokeWidth="0.7" />
                {/* Right Swallowtail */}
                <path d="M88,6 L100,4 L96,11 L100,18 L88,16 Z" fill="#0A0F1D" />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="url(#sssvipRibbonStormGrad)" stroke="url(#sssvipRibbonGoldTrim)" strokeWidth="0.7" />
                {/* Central Curved Ribbon Body */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="url(#sssvipRibbonStormGrad)" stroke="url(#sssvipRibbonGoldTrim)" strokeWidth="0.9" />
                {/* Top/Bottom Shimmer Highlights */}
                <path d="M11,7 C31,4 69,4 89,7" stroke="#00FFFF" strokeWidth="0.8" fill="none" opacity="0.95" />
                <path d="M13,17 C33,20 67,20 87,17" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.8" />

                {/* EXACT CONTOUR SLIM ANIMATED LED RUNNER */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="none" strokeWidth="1" className={s.sssvipSvgLedPath} />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="none" strokeWidth="1" className={s.sssvipSvgLedPath} />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="none" strokeWidth="1" className={s.sssvipSvgLedPath} />
              </svg>

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

          {/* Layer 6: Bottom Feathered Wreath, Frost Mist Aura & SSVIP Ribbon */}
          <div className={s.vip9BottomBadge}>
            {/* Bottom Feathered Wings Spread */}
            <div className={s.bottomFeatherWreath}>
              <svg viewBox="0 0 48 18" className={s.bottomWreathSvg}>
                <path d="M24,18 L27,12 L36,16 L42,10 L48,6 C40,8 34,14 24,14 C14,14 8,8 0,6 L6,10 L12,16 L21,12 Z" fill="url(#ssvipWingGrad)" />
                {/* Center Ice Crystal Spike */}
                <polygon points="24,4 27,11 24,18 21,11" fill="#FFFFFF" stroke="#80DEEA" strokeWidth="0.6" className={s.wreathCrystal} />
              </svg>
            </div>

            {/* Frost Mist & Diamond Dust Aura around Ribbon */}
            <div className={s.vip9RibbonMistAura}>
              <span className={`${s.ssvipRibbonCrystal} ${s.src1}`}>❄</span>
              <span className={`${s.ssvipRibbonCrystal} ${s.src2}`}>✦</span>
              <span className={`${s.ssvipRibbonCrystal} ${s.src3}`}>✧</span>
              <span className={`${s.ssvipRibbonCrystal} ${s.src4}`}>❄</span>
              <span className={`${s.ssvipRibbonCrystal} ${s.src5}`}>✦</span>
            </div>

            {/* Luxurious Curved Flowing Swallowtail Ribbon for SSVIP */}
            <div className={s.vip9RibbonWrapper}>
              <svg viewBox="0 0 100 24" className={s.ribbonBannerSvg}>
                <defs>
                  <linearGradient id="ssvipRibbonIceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="25%" stopColor="#E0F2FE" />
                    <stop offset="50%" stopColor="#BAE6FD" />
                    <stop offset="75%" stopColor="#7DD3FC" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                  <linearGradient id="ssvipRibbonSilverTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#CBE6FE" />
                    <stop offset="100%" stopColor="#7DA0FA" />
                  </linearGradient>
                </defs>
                {/* Left Swallowtail */}
                <path d="M12,6 L0,4 L4,11 L0,18 L12,16 Z" fill="#3B82F6" />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="url(#ssvipRibbonIceGrad)" stroke="url(#ssvipRibbonSilverTrim)" strokeWidth="0.7" />
                {/* Right Swallowtail */}
                <path d="M88,6 L100,4 L96,11 L100,18 L88,16 Z" fill="#3B82F6" />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="url(#ssvipRibbonIceGrad)" stroke="url(#ssvipRibbonSilverTrim)" strokeWidth="0.7" />
                {/* Central Curved Ribbon Body */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="url(#ssvipRibbonIceGrad)" stroke="url(#ssvipRibbonSilverTrim)" strokeWidth="0.9" />
                {/* Top/Bottom Shimmer Highlights */}
                <path d="M11,7 C31,4 69,4 89,7" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.95" />
                <path d="M13,17 C33,20 67,20 87,17" stroke="#7DA0FA" strokeWidth="0.8" fill="none" opacity="0.8" />

                {/* EXACT CONTOUR SLIM ANIMATED LED RUNNER */}
                <path d="M10,6 C30,3 70,3 90,6 L88,18 C68,21 32,21 12,18 Z" fill="none" strokeWidth="1" className={s.ssvipSvgLedPath} />
                <path d="M12,6 L2,4 L6,11 L2,18 L12,16 Z" fill="none" strokeWidth="1" className={s.ssvipSvgLedPath} />
                <path d="M88,6 L98,4 L94,11 L98,18 L88,16 Z" fill="none" strokeWidth="1" className={s.ssvipSvgLedPath} />
              </svg>

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

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🌿 EMERALD ROYAL / ELVEN MAGIC — HOÀNG GIA LỤC BẢO
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'emerald_royal' && (
        <div className={s.emeraldContainer}>
          {/* Layer 1: Hào Quang Phép Thuật (Aura Background) */}
          <div className={s.emeraldAuraPulse} />
          <div className={s.emeraldInnerTealGlow} />

          {/* Layer 2: Viền Vàng Cánh Điệu (Main Golden Border + Glint/Shine effect) */}
          <div className={s.emeraldGoldBorder}>
            <div className={s.emeraldGlintShine} />
          </div>

          {/* Layer 5: Hiệu ứng Hạt Năng Lượng (Sparkles & Stars 4 cánh) */}
          <div className={s.emeraldSparkles}>
            <span className={`${s.emeraldMote} ${s.em1}`}>✦</span>
            <span className={`${s.emeraldMote} ${s.em2}`}>✧</span>
            <span className={`${s.emeraldMote} ${s.em3}`}>★</span>
            <span className={`${s.emeraldMote} ${s.em4}`}>✦</span>
            <span className={`${s.emeraldMote} ${s.em5}`}>✧</span>
            <span className={`${s.emeraldMote} ${s.em6}`}>✦</span>
          </div>

          {/* Layer 3: Vương Miện Lục Bảo (Top Emerald Crown with SVG Gem & Filigree Wings) */}
          <div className={s.emeraldTopCrown}>
            <svg
              className={s.emeraldCrownSvg}
              viewBox="0 0 120 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="emGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF275" />
                  <stop offset="35%" stopColor="#FFD700" />
                  <stop offset="70%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="emGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A7F3D0" />
                  <stop offset="30%" stopColor="#00F5D4" />
                  <stop offset="70%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#022C22" />
                </linearGradient>
                <filter id="emGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Elven Wings / Golden Filigree Spreading Left and Right */}
              <path
                d="M 60 42 C 45 42, 25 36, 6 22 C 16 18, 32 24, 46 32 C 34 20, 20 12, 4 4 C 18 6, 38 18, 52 30 Z"
                fill="url(#emGoldGrad)"
                stroke="#FFD700"
                strokeWidth="0.8"
                filter="url(#emGlow)"
              />
              <path
                d="M 60 42 C 75 42, 95 36, 114 22 C 104 18, 88 24, 74 32 C 86 20, 100 12, 116 4 C 102 6, 82 18, 68 30 Z"
                fill="url(#emGoldGrad)"
                stroke="#FFD700"
                strokeWidth="0.8"
                filter="url(#emGlow)"
              />

              {/* Center Royal Crown Crest */}
              <path
                d="M 44 48 L 48 30 L 54 38 L 60 20 L 66 38 L 72 30 L 76 48 Z"
                fill="url(#emGoldGrad)"
                stroke="#FFE066"
                strokeWidth="1"
              />

              {/* Central Glowing Emerald Rhombus/Hexagon Gem */}
              <polygon
                points="60,14 70,28 60,42 50,28"
                fill="url(#emGemGrad)"
                stroke="#A7F3D0"
                strokeWidth="1.2"
                filter="url(#emGlow)"
              />
              {/* Inner Facet Highlights */}
              <polygon
                points="60,18 66,28 60,38 54,28"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.7"
                opacity="0.85"
              />
              <circle cx="60" cy="28" r="2.2" fill="#FFFFFF" opacity="0.95" />
            </svg>
          </div>

          {/* Layer 4: Bảng Tên Vàng Lục (Bottom Banner Plaque) */}
          <div className={s.emeraldBottomBanner}>
            <svg
              className={s.emeraldBannerSvg}
              viewBox="0 0 120 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Swallowtail Winged Ribbon Tails */}
              <path
                d="M 12 18 L 0 6 L 16 12 L 0 28 L 12 18 Z"
                fill="url(#emGoldGrad)"
                stroke="#FFD700"
                strokeWidth="0.8"
              />
              <path
                d="M 108 18 L 120 6 L 104 12 L 120 28 L 108 18 Z"
                fill="url(#emGoldGrad)"
                stroke="#FFD700"
                strokeWidth="0.8"
              />

              {/* Main Curved Plaque Body */}
              <path
                d="M 14 8 Q 60 14 106 8 L 102 28 Q 60 34 18 28 Z"
                fill="#022C22"
                stroke="url(#emGoldGrad)"
                strokeWidth="1.5"
              />
              <path
                d="M 17 11 Q 60 16 103 11 L 100 25 Q 60 30 20 25 Z"
                fill="#064E3B"
                stroke="#00F5D4"
                strokeWidth="0.6"
                strokeDasharray="2,2"
              />

              {/* Gold Filigree Corner Ornaments */}
              <circle cx="22" cy="18" r="2" fill="#FFD700" />
              <circle cx="98" cy="18" r="2" fill="#FFD700" />
              
              {/* Central Text: ELVEN ROYAL */}
              <text
                x="60"
                y="22"
                textAnchor="middle"
                fontSize="7.5"
                fontFamily="'1FTV-VIP-Festigan', 'Courier New', monospace"
                fontWeight="900"
                fill="#FFE066"
                letterSpacing="1.2"
                stroke="#78350F"
                strokeWidth="0.3"
              >
                ELVEN
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🔴 MSN-04 SAZABI VER.KA — NEO ZEON COMMANDER MOBILE SUIT
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'sazabi_verka' && (
        <div className={s.sazabiContainer}>
          {/* Layer 1: Thruster Exhaust Fire Jet Plumes & Space Dust Particles */}
          <div className={s.sazabiBottomThrusters}>
            <div className={`${s.sazabiJetFlame} ${s.jetLeft}`} />
            <div className={`${s.sazabiJetFlame} ${s.jetCenter}`} />
            <div className={`${s.sazabiJetFlame} ${s.jetRight}`} />
            <div className={s.sazabiJetAuraGlow} />
          </div>

          {/* Layer 2: Thermal Spark Particles (Space Combat Dust) */}
          <div className={s.sazabiParticles}>
            <span className={`${s.sazabiSpark} ${s.sp1}`}>•</span>
            <span className={`${s.sazabiSpark} ${s.sp2}`}>✦</span>
            <span className={`${s.sazabiSpark} ${s.sp3}`}>•</span>
            <span className={`${s.sazabiSpark} ${s.sp4}`}>✦</span>
            <span className={`${s.sazabiSpark} ${s.sp5}`}>•</span>
            <span className={`${s.sazabiSpark} ${s.sp6}`}>✦</span>
          </div>

          {/* Layer 3: Main Armored Chassis with Polygon/Clip-path & Gold/Black Trim */}
          <div className={s.sazabiMainArmorFrame}>
            <div className={s.sazabiArmorGleam} />
            <div className={s.sazabiCautionDecals}>
              <span className={s.sazabiDecalLeft}>04</span>
              <span className={s.sazabiDecalRight}>CA</span>
            </div>
          </div>

          {/* Layer 4: Flanking Shoulder Armor, Open Heat Vents & Funnel Pods (Left & Right) */}
          <div className={s.sazabiShouldersWrap}>
            {/* Left Shoulder Armor */}
            <div className={`${s.sazabiShoulder} ${s.shoulderLeft}`}>
              <svg viewBox="0 0 50 60" className={s.shoulderSvg} fill="none">
                <defs>
                  <linearGradient id="sazabiCrimsonL" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF1E27" />
                    <stop offset="40%" stopColor="#C00000" />
                    <stop offset="85%" stopColor="#7A0000" />
                    <stop offset="100%" stopColor="#4A0000" />
                  </linearGradient>
                </defs>
                {/* Outward Flared Angular Shoulder Armor Plate */}
                <polygon points="50,10 8,16 0,38 20,58 50,45" fill="url(#sazabiCrimsonL)" stroke="#FFD700" strokeWidth="1.2" />
                <polygon points="45,16 12,21 5,36 20,50 45,41" fill="#1C1C22" stroke="#FF1E27" strokeWidth="0.8" />
                {/* Glowing Heat Dissipation Exhaust Vents */}
                <rect x="10" y="24" width="28" height="4" rx="1" fill="#FFCC00" className={s.sazabiHeatVentGlow} />
                <rect x="14" y="32" width="22" height="4" rx="1" fill="#FF6600" className={s.sazabiHeatVentGlow} />
                {/* Gold Funnel Rack Indicator */}
                <circle cx="28" cy="18" r="2.5" fill="#FFD700" />
                <circle cx="38" cy="17" r="2.5" fill="#FFD700" />
              </svg>
            </div>

            {/* Right Shoulder Armor */}
            <div className={`${s.sazabiShoulder} ${s.shoulderRight}`}>
              <svg viewBox="0 0 50 60" className={s.shoulderSvg} fill="none">
                <defs>
                  <linearGradient id="sazabiCrimsonR" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF1E27" />
                    <stop offset="40%" stopColor="#C00000" />
                    <stop offset="85%" stopColor="#7A0000" />
                    <stop offset="100%" stopColor="#4A0000" />
                  </linearGradient>
                </defs>
                {/* Outward Flared Angular Shoulder Armor Plate */}
                <polygon points="0,10 42,16 50,38 30,58 0,45" fill="url(#sazabiCrimsonR)" stroke="#FFD700" strokeWidth="1.2" />
                <polygon points="5,16 38,21 45,36 30,50 5,41" fill="#1C1C22" stroke="#FF1E27" strokeWidth="0.8" />
                {/* Glowing Heat Dissipation Exhaust Vents */}
                <rect x="12" y="24" width="28" height="4" rx="1" fill="#FFCC00" className={s.sazabiHeatVentGlow} />
                <rect x="14" y="32" width="22" height="4" rx="1" fill="#FF6600" className={s.sazabiHeatVentGlow} />
                {/* Gold Funnel Rack Indicator */}
                <circle cx="22" cy="18" r="2.5" fill="#FFD700" />
                <circle cx="12" cy="17" r="2.5" fill="#FFD700" />
              </svg>
            </div>
          </div>

          {/* Layer 5: Đỉnh khung (Mono-eye Head & Helmet Crest with Animated Scanning Mono-eye) */}
          <div className={s.sazabiHeadCrest}>
            <svg viewBox="0 0 120 54" className={s.sazabiHeadSvg} fill="none">
              <defs>
                <linearGradient id="sazabiHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF333A" />
                  <stop offset="40%" stopColor="#B30006" />
                  <stop offset="100%" stopColor="#570003" />
                </linearGradient>
                <linearGradient id="sazabiAntennaGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF275" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>

              {/* Neo Zeon Long Commander V-Antenna / Golden Horn */}
              <polygon points="60,0 64,22 60,20 56,22" fill="url(#sazabiAntennaGold)" stroke="#FFE066" strokeWidth="0.8" />
              <polygon points="60,12 82,18 64,24" fill="url(#sazabiAntennaGold)" stroke="#FFE066" strokeWidth="0.6" />
              <polygon points="60,12 38,18 56,24" fill="url(#sazabiAntennaGold)" stroke="#FFE066" strokeWidth="0.6" />

              {/* Sazabi Armored Forehead Helmet */}
              <path
                d="M 32 36 L 46 22 L 60 16 L 74 22 L 88 36 L 78 44 L 60 40 L 42 44 Z"
                fill="url(#sazabiHeadGrad)"
                stroke="#FFD700"
                strokeWidth="1.2"
              />

              {/* Horizontal Visor Slit (Black Glass) */}
              <path
                d="M 44 32 L 60 28 L 76 32 L 72 38 L 60 36 L 48 38 Z"
                fill="#0A0A0D"
                stroke="#222"
                strokeWidth="0.8"
              />
            </svg>

            {/* Glowing Emerald Green Mono-Eye Sweeping Left-Right Inside Visor */}
            <div className={s.sazabiMonoEyeVisorTrack}>
              <div className={s.sazabiMonoEyeLens}>
                <div className={s.sazabiMonoEyeFlare} />
              </div>
            </div>
          </div>

          {/* Layer 6: Đáy khung (Bottom Heavy Waist Armor / Mega Particle Cannon Plaque) */}
          <div className={s.sazabiBottomPlaque}>
            <svg viewBox="0 0 120 32" className={s.sazabiBottomSvg} fill="none">
              <polygon
                points="18,4 102,4 112,24 60,32 8,24"
                fill="#151518"
                stroke="#FF1E27"
                strokeWidth="1.5"
              />
              <polygon
                points="24,7 96,7 104,22 60,28 16,22"
                fill="url(#sazabiHeadGrad)"
                stroke="#FFD700"
                strokeWidth="0.8"
              />
              {/* Abdominal Mega Particle Cannon Emitter (Center Circle) */}
              <circle cx="60" cy="16" r="5" fill="#1C1C22" stroke="#FFCC00" strokeWidth="1.2" />
              <circle cx="60" cy="16" r="2.5" fill="#FF3B30" className={s.sazabiCannonCoreGlow} />
              
              {/* Decal Text: NEO ZEON MSN-04 */}
              <text
                x="60"
                y="11"
                textAnchor="middle"
                fontSize="5"
                fontFamily="'1FTV-VIP-Festigan', monospace"
                fontWeight="900"
                fill="#FFD700"
                letterSpacing="1"
              >
                NEO ZEON
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🌈 X-EX01 GUNDAM CALIBARN — PERMET SCORE 8 (RAINBOW PERMET)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'gundam_calibarn' && (
        <div className={s.calibarnContainer}>
          {/* Layer 1: Data Storm / Permet Score 8 Rainbow Field Aura */}
          <div className={s.calibarnRainbowAura} />
          <div className={s.calibarnPureWhiteHalo} />

          {/* Layer 2: GUND-Format Data Stream Particles (Square Pixels & Diamond Sparks) */}
          <div className={s.calibarnDataStorm}>
            <span className={`${s.calibarnPixel} ${s.cp1}`}>■</span>
            <span className={`${s.calibarnPixel} ${s.cp2}`}>▪</span>
            <span className={`${s.calibarnPixel} ${s.cp3}`}>✦</span>
            <span className={`${s.calibarnPixel} ${s.cp4}`}>■</span>
            <span className={`${s.calibarnPixel} ${s.cp5}`}>▪</span>
            <span className={`${s.calibarnPixel} ${s.cp6}`}>✧</span>
            <span className={`${s.calibarnPixel} ${s.cp7}`}>■</span>
            <span className={`${s.calibarnPixel} ${s.cp8}`}>✦</span>
          </div>

          {/* Layer 3: Main Sleek White Armor Frame with Glowing Rainbow Permet Slits */}
          <div className={s.calibarnArmorChassis}>
            {/* Rainbow Permet Score 8 Running Channels (Left & Right) */}
            <div className={`${s.permetChannel} ${s.permetLeft}`} />
            <div className={`${s.permetChannel} ${s.permetRight}`} />
            <div className={`${s.permetChannel} ${s.permetTop}`} />
            <div className={`${s.permetChannel} ${s.permetBottom}`} />
            
            {/* White Armor Glisten & Specular Sheen */}
            <div className={s.calibarnArmorSheen} />
            
            {/* Decal Marks: GUNDAM CALIBARN / SCORE 8 */}
            <div className={s.calibarnDecals}>
              <span className={s.decalLeft}>SCORE 8</span>
              <span className={s.decalRight}>X-EX01</span>
            </div>
          </div>

          {/* Layer 4: Flanking Sleek Shoulder Armor with Rainbow Permet Slits (Left & Right) */}
          <div className={s.calibarnShouldersWrap}>
            {/* Left Sleek Winglet Armor */}
            <div className={`${s.calibarnShoulder} ${s.calibarnShoulderLeft}`}>
              <svg viewBox="0 0 45 60" className={s.calibarnShoulderSvg} fill="none">
                <defs>
                  <linearGradient id="calibarnWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="calibarnRainbowSvg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF0055" />
                    <stop offset="25%" stopColor="#FF7700" />
                    <stop offset="50%" stopColor="#00FF66" />
                    <stop offset="75%" stopColor="#00F2FE" />
                    <stop offset="100%" stopColor="#B000FF" />
                  </linearGradient>
                </defs>
                {/* Sleek Angular Pure White Armor Fin */}
                <polygon points="45,8 10,18 0,38 22,54 45,44" fill="url(#calibarnWhiteGrad)" stroke="#E2E8F0" strokeWidth="1" />
                <polygon points="42,14 15,22 8,36 22,48 42,40" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.6" />
                {/* Rainbow Permet Score 8 Glowing Slits */}
                <polygon points="36,18 18,24 14,32 24,42 36,36" fill="url(#calibarnRainbowSvg)" className={s.calibarnPermetSvgGlow} />
                <line x1="16" y1="26" x2="32" y2="20" stroke="#FFFFFF" strokeWidth="1" opacity="0.9" />
              </svg>
            </div>

            {/* Right Sleek Winglet Armor */}
            <div className={`${s.calibarnShoulder} ${s.calibarnShoulderRight}`}>
              <svg viewBox="0 0 45 60" className={s.calibarnShoulderSvg} fill="none">
                {/* Sleek Angular Pure White Armor Fin */}
                <polygon points="0,8 35,18 45,38 23,54 0,44" fill="url(#calibarnWhiteGrad)" stroke="#E2E8F0" strokeWidth="1" />
                <polygon points="3,14 30,22 37,36 23,48 3,40" fill="#0F172A" stroke="#94A3B8" strokeWidth="0.6" />
                {/* Rainbow Permet Score 8 Glowing Slits */}
                <polygon points="9,18 27,24 31,32 21,42 9,36" fill="url(#calibarnRainbowSvg)" className={s.calibarnPermetSvgGlow} />
                <line x1="29" y1="26" x2="13" y2="20" stroke="#FFFFFF" strokeWidth="1" opacity="0.9" />
              </svg>
            </div>
          </div>

          {/* Layer 5: Đỉnh khung (V-fin & Main Cyan Sensor with Rainbow Shell Unit) */}
          <div className={s.calibarnHeadCrest}>
            <svg viewBox="0 0 120 54" className={s.calibarnHeadSvg} fill="none">
              <defs>
                <linearGradient id="calibarnVFinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="70%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="calibarnGoldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFF275" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
                <filter id="calibarnCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Iconic Sharp White V-Fin with Multi-Prism Tips */}
              <polygon points="60,26 88,4 84,18 64,28" fill="url(#calibarnVFinGrad)" stroke="#E2E8F0" strokeWidth="0.8" />
              <polygon points="60,26 32,4 36,18 56,28" fill="url(#calibarnVFinGrad)" stroke="#E2E8F0" strokeWidth="0.8" />
              
              {/* Secondary Lower V-Fin Wings */}
              <polygon points="60,28 78,14 74,22 62,30" fill="url(#calibarnGoldAccent)" stroke="#FFD700" strokeWidth="0.5" />
              <polygon points="60,28 42,14 46,22 58,30" fill="url(#calibarnGoldAccent)" stroke="#FFD700" strokeWidth="0.5" />

              {/* Forehead Armor & Rainbow Shell Unit Crest */}
              <path
                d="M 44 42 L 52 26 L 60 22 L 68 26 L 76 42 L 60 38 Z"
                fill="#0F172A"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              {/* Central Rainbow Permet Score 8 Shifting Core in Forehead */}
              <polygon
                points="60,24 65,30 60,36 55,30"
                fill="url(#calibarnRainbowSvg)"
                className={s.calibarnPermetSvgGlow}
              />

              {/* Main Optical Sensor (Cyan/Emerald Crystal Camera) */}
              <rect
                x="56"
                y="18"
                width="8"
                height="4"
                rx="1"
                fill="#00F5D4"
                stroke="#FFFFFF"
                strokeWidth="0.8"
                filter="url(#calibarnCyanGlow)"
                className={s.calibarnMainSensorGlow}
              />
            </svg>
          </div>

          {/* Layer 6: Đáy khung (Variable Rod Rifle Thruster Chevron / Lower Plaque) */}
          <div className={s.calibarnBottomPlaque}>
            <svg viewBox="0 0 120 32" className={s.calibarnBottomSvg} fill="none">
              {/* Sleek Variable Rod Chevron Cowl */}
              <polygon
                points="22,4 98,4 108,22 60,30 12,22"
                fill="#0F172A"
                stroke="#E2E8F0"
                strokeWidth="1.2"
              />
              {/* Rainbow Permet Glowing Underglow Bar */}
              <polygon
                points="26,8 94,8 102,18 60,26 18,18"
                fill="url(#calibarnRainbowSvg)"
                className={s.calibarnPermetSvgGlow}
              />
              <polygon
                points="30,10 90,10 96,16 60,22 24,16"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="0.6"
              />
              
              {/* Central Text: CALIBARN */}
              <text
                x="60"
                y="17"
                textAnchor="middle"
                fontSize="6"
                fontFamily="'1FTV-VIP-Festigan', 'Courier New', monospace"
                fontWeight="900"
                fill="#0F172A"
                letterSpacing="1.2"
              >
                CALIBARN
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🦄 RX-0 FULL ARMOR UNICORN VER.KA (AWAKENED PSYCHO-FRAME)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'unicorn_awakened' && (
        <div className={s.unicornContainer}>
          {/* Layer 1: Psycho-Field Awakened Green Radiant Aura (Resonance Breathing) */}
          <div className={s.unicornPsychoAura} />
          <div className={s.unicornInnerFieldGlow} />

          {/* Layer 2: Psycho-Frame Crystal Shards / Floating Green Dust Particles */}
          <div className={s.unicornCrystals}>
            <span className={`${s.unicornShard} ${s.uc1}`}>✦</span>
            <span className={`${s.unicornShard} ${s.uc2}`}>◆</span>
            <span className={`${s.unicornShard} ${s.uc3}`}>✧</span>
            <span className={`${s.unicornShard} ${s.uc4}`}>✦</span>
            <span className={`${s.unicornShard} ${s.uc5}`}>■</span>
            <span className={`${s.unicornShard} ${s.uc6}`}>◆</span>
            <span className={`${s.unicornShard} ${s.uc7}`}>✦</span>
            <span className={`${s.unicornShard} ${s.uc8}`}>✧</span>
          </div>

          {/* Layer 3: Layered Divided Snow-White Armor Panels with Exposed Green Psycho-Frame Gaps */}
          <div className={s.unicornChassisFrame}>
            {/* Exposed Glowing Green Psycho-Frame Under-Chassis */}
            <div className={s.unicornPsychoUnderglow} />
            
            {/* Segmented Snow White Armor Corner & Edge Plates */}
            <div className={`${s.armorPlate} ${s.plateTL}`} />
            <div className={`${s.armorPlate} ${s.plateTR}`} />
            <div className={`${s.armorPlate} ${s.plateBL}`} />
            <div className={`${s.armorPlate} ${s.plateBR}`} />
            <div className={`${s.armorPlate} ${s.plateTop}`} />
            <div className={`${s.armorPlate} ${s.plateBottom}`} />

            {/* Specular Pure White Armor Gleam */}
            <div className={s.unicornArmorGleam} />

            {/* Decal Marks: RX-0 UNICORN / PSYCHO-FRAME */}
            <div className={s.unicornDecals}>
              <span className={s.uDecalLeft}>RX-0</span>
              <span className={s.uDecalRight}>AWAKENED</span>
            </div>
          </div>

          {/* Layer 4: Flanking Armed Armor DE / Shield & Beam Gatling Arrays (Left & Right) */}
          <div className={s.unicornShieldsWrap}>
            {/* Left Full Armor Shield */}
            <div className={`${s.unicornShield} ${s.shieldLeft}`}>
              <svg viewBox="0 0 50 64" className={s.unicornShieldSvg} fill="none">
                <defs>
                  <linearGradient id="unicornWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                  <linearGradient id="psychoGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E6FFF2" />
                    <stop offset="30%" stopColor="#00FF88" />
                    <stop offset="70%" stopColor="#00E676" />
                    <stop offset="100%" stopColor="#00B050" />
                  </linearGradient>
                </defs>
                {/* Full Armor Armed Armor DE Silhouette */}
                <polygon points="46,6 16,14 0,36 18,58 46,48" fill="url(#unicornWhiteGrad)" stroke="#E2E8F0" strokeWidth="1" />
                <polygon points="40,12 20,18 8,34 20,50 40,44" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
                {/* Exposed Cross-Shaped Psycho-Frame Core */}
                <polygon points="34,16 26,22 14,34 26,44 34,38" fill="url(#psychoGreenGrad)" className={s.psychoSvgPulse} />
                <line x1="20" y1="24" x2="30" y2="40" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.95" />
                {/* Beam Gatling Barrel Tips */}
                <rect x="2" y="38" width="6" height="14" rx="1" fill="#1E293B" stroke="#64748B" strokeWidth="0.5" />
                <rect x="10" y="44" width="6" height="14" rx="1" fill="#1E293B" stroke="#64748B" strokeWidth="0.5" />
              </svg>
            </div>

            {/* Right Full Armor Shield */}
            <div className={`${s.unicornShield} ${s.shieldRight}`}>
              <svg viewBox="0 0 50 64" className={s.unicornShieldSvg} fill="none">
                {/* Full Armor Armed Armor DE Silhouette */}
                <polygon points="4,6 34,14 50,36 32,58 4,48" fill="url(#unicornWhiteGrad)" stroke="#E2E8F0" strokeWidth="1" />
                <polygon points="10,12 30,18 42,34 30,50 10,44" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
                {/* Exposed Cross-Shaped Psycho-Frame Core */}
                <polygon points="16,16 24,22 36,34 24,44 16,38" fill="url(#psychoGreenGrad)" className={s.psychoSvgPulse} />
                <line x1="30" y1="24" x2="20" y2="40" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.95" />
                {/* Beam Gatling Barrel Tips */}
                <rect x="42" y="38" width="6" height="14" rx="1" fill="#1E293B" stroke="#64748B" strokeWidth="0.5" />
                <rect x="34" y="44" width="6" height="14" rx="1" fill="#1E293B" stroke="#64748B" strokeWidth="0.5" />
              </svg>
            </div>
          </div>

          {/* Layer 5: Đỉnh khung (Fully Opened Destroy Mode Golden V-Fin & Psycho-Frame Head Crest) */}
          <div className={s.unicornHeadCrest}>
            <svg viewBox="0 0 120 54" className={s.unicornHeadSvg} fill="none">
              <defs>
                <linearGradient id="unicornVFinGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF9A6" />
                  <stop offset="40%" stopColor="#FFD700" />
                  <stop offset="85%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <filter id="psychoGreenGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Fully Split V-Fin in Destroy Mode (Wide Sharp Golden Horns) */}
              <polygon points="60,30 96,2 88,18 64,32" fill="url(#unicornVFinGold)" stroke="#FFE066" strokeWidth="1" />
              <polygon points="60,30 24,2 32,18 56,32" fill="url(#unicornVFinGold)" stroke="#FFE066" strokeWidth="1" />
              
              {/* Inner V-Fin Golden Prisms */}
              <polygon points="60,30 82,10 76,18 62,32" fill="#FFF275" stroke="#FFD700" strokeWidth="0.6" />
              <polygon points="60,30 38,10 44,18 58,32" fill="#FFF275" stroke="#FFD700" strokeWidth="0.6" />

              {/* Central White Forehead Armor Crest */}
              <polygon points="54,44 56,22 60,18 64,22 66,44 60,40" fill="url(#unicornWhiteGrad)" stroke="#E2E8F0" strokeWidth="0.8" />

              {/* Central Glowing Green Psycho-Frame Forehead & Eye Visor */}
              <polygon
                points="56,32 60,26 64,32 60,36"
                fill="url(#psychoGreenGrad)"
                filter="url(#psychoGreenGlow)"
                className={s.psychoSvgPulse}
              />
              <rect
                x="56"
                y="36"
                width="8"
                height="3"
                rx="0.8"
                fill="#00FF88"
                filter="url(#psychoGreenGlow)"
                className={s.psychoSvgPulse}
              />
            </svg>
          </div>

          {/* Layer 6: Đáy khung (Lower Waist Armor / Armed Armor Plaque) */}
          <div className={s.unicornBottomPlaque}>
            <svg viewBox="0 0 120 32" className={s.unicornBottomSvg} fill="none">
              {/* Angular White Armor Plaque */}
              <polygon
                points="20,4 100,4 110,22 60,30 10,22"
                fill="#0F172A"
                stroke="#E2E8F0"
                strokeWidth="1.4"
              />
              {/* Exposed Green Psycho-Frame Chevron Channel */}
              <polygon
                points="24,8 96,8 104,18 60,26 16,18"
                fill="url(#psychoGreenGrad)"
                className={s.psychoSvgPulse}
              />
              <polygon
                points="28,10 92,10 98,16 60,22 22,16"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="0.6"
              />
              
              {/* Central Text: UNICORN */}
              <text
                x="60"
                y="17"
                textAnchor="middle"
                fontSize="6"
                fontFamily="'1FTV-VIP-Festigan', 'Courier New', monospace"
                fontWeight="900"
                fill="#0F172A"
                letterSpacing="1.2"
              >
                UNICORN
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
         FRAME: 🪶 XXXG-00W0 WING GUNDAM ZERO CUSTOM (ENDLESS WALTZ)
         ══════════════════════════════════════════════════════════════════════ */}
      {frameId === 'wing_zero_ew' && (
        <div className={s.wingZeroContainer}>
          {/* Layer 1: Celestial Blue & Pure White Radiant Halo */}
          <div className={s.wingZeroAura} />
          <div className={s.wingZeroInnerBorderGlow} />

          {/* Layer 2: Falling Angel Feathers Drifting from Top to Bottom */}
          <div className={s.wingZeroFallingFeathers}>
            <div className={`${s.fallingFeather} ${s.ff1}`}>
              <svg viewBox="0 0 20 30" className={s.featherSvg} fill="none">
                <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.9)" stroke="#93C5FD" strokeWidth="0.5" />
                <line x1="10" y1="2" x2="10" y2="28" stroke="#60A5FA" strokeWidth="0.6" />
              </svg>
            </div>
            <div className={`${s.fallingFeather} ${s.ff2}`}>
              <svg viewBox="0 0 20 30" className={s.featherSvg} fill="none">
                <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.85)" stroke="#93C5FD" strokeWidth="0.5" />
                <line x1="10" y1="2" x2="10" y2="28" stroke="#60A5FA" strokeWidth="0.6" />
              </svg>
            </div>
            <div className={`${s.fallingFeather} ${s.ff3}`}>
              <svg viewBox="0 0 20 30" className={s.featherSvg} fill="none">
                <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.9)" stroke="#93C5FD" strokeWidth="0.5" />
                <line x1="10" y1="2" x2="10" y2="28" stroke="#60A5FA" strokeWidth="0.6" />
              </svg>
            </div>
            <div className={`${s.fallingFeather} ${s.ff4}`}>
              <svg viewBox="0 0 20 30" className={s.featherSvg} fill="none">
                <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.8)" stroke="#93C5FD" strokeWidth="0.5" />
                <line x1="10" y1="2" x2="10" y2="28" stroke="#60A5FA" strokeWidth="0.6" />
              </svg>
            </div>
            <div className={`${s.fallingFeather} ${s.ff5}`}>
              <svg viewBox="0 0 20 30" className={s.featherSvg} fill="none">
                <path d="M 10 0 C 18 8, 20 20, 10 30 C 0 20, 2 8, 10 0 Z" fill="rgba(255,255,255,0.95)" stroke="#93C5FD" strokeWidth="0.5" />
                <line x1="10" y1="2" x2="10" y2="28" stroke="#60A5FA" strokeWidth="0.6" />
              </svg>
            </div>
          </div>

          {/* Layer 3: Main Cobalt Blue, Crimson Red & Pure White Armored Chassis */}
          <div className={s.wingZeroChassisFrame}>
            <div className={s.wingZeroGlint} />
            <div className={s.wingZeroDecals}>
              <span className={s.wzDecalL}>XXXG-00W0</span>
              <span className={s.wzDecalR}>EW</span>
            </div>
          </div>

          {/* Layer 4: Flanking Multi-Layer Mechanical Angel Wings (Hovering Flap Motion) */}
          <div className={s.wingZeroWingsWrap}>
            {/* Left Mechanical Angel Wing Cluster */}
            <div className={`${s.wingZeroWingGroup} ${s.wingLeft}`}>
              <svg viewBox="0 0 60 80" className={s.wingSvg} fill="none">
                <defs>
                  <linearGradient id="wzWhiteWing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="65%" stopColor="#F0F9FF" />
                    <stop offset="100%" stopColor="#BAE6FD" />
                  </linearGradient>
                  <linearGradient id="wzBlueTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>

                {/* Primary Feather Tier 1 (Outer Long Curve) */}
                <path
                  d="M 55 70 C 35 65, 8 45, 2 20 C 15 28, 35 48, 55 58 Z"
                  fill="url(#wzWhiteWing)"
                  stroke="#93C5FD"
                  strokeWidth="0.8"
                />
                {/* Primary Feather Tier 2 */}
                <path
                  d="M 55 58 C 30 50, 10 32, 8 10 C 22 18, 40 38, 55 46 Z"
                  fill="url(#wzWhiteWing)"
                  stroke="#93C5FD"
                  strokeWidth="0.8"
                />
                {/* Primary Feather Tier 3 (Upper Wing Tip) */}
                <path
                  d="M 55 46 C 35 36, 18 18, 16 0 C 28 8, 45 26, 55 35 Z"
                  fill="url(#wzWhiteWing)"
                  stroke="#93C5FD"
                  strokeWidth="0.8"
                />

                {/* Inner Mechanical Feather Plate & Blue/Gold Trim */}
                <path
                  d="M 55 65 C 40 60, 25 50, 20 36 C 30 40, 45 52, 55 55 Z"
                  fill="url(#wzBlueTrim)"
                  stroke="#FFD700"
                  strokeWidth="0.6"
                />
              </svg>
            </div>

            {/* Right Mechanical Angel Wing Cluster */}
            <div className={`${s.wingZeroWingGroup} ${s.wingRight}`}>
              <svg viewBox="0 0 60 80" className={s.wingSvg} fill="none">
                {/* Primary Feather Tier 1 (Outer Long Curve) */}
                <path
                  d="M 5 70 C 25 65, 52 45, 58 20 C 45 28, 25 48, 5 58 Z"
                  fill="url(#wzWhiteWing)"
                  stroke="#93C5FD"
                  strokeWidth="0.8"
                />
                {/* Primary Feather Tier 2 */}
                <path
                  d="M 5 58 C 30 50, 50 32, 52 10 C 38 18, 20 38, 5 46 Z"
                  fill="url(#wzWhiteWing)"
                  stroke="#93C5FD"
                  strokeWidth="0.8"
                />
                {/* Primary Feather Tier 3 (Upper Wing Tip) */}
                <path
                  d="M 5 46 C 25 36, 42 18, 44 0 C 32 8, 15 26, 5 35 Z"
                  fill="url(#wzWhiteWing)"
                  stroke="#93C5FD"
                  strokeWidth="0.8"
                />

                {/* Inner Mechanical Feather Plate & Blue/Gold Trim */}
                <path
                  d="M 5 65 C 20 60, 35 50, 40 36 C 30 40, 15 52, 5 55 Z"
                  fill="url(#wzBlueTrim)"
                  stroke="#FFD700"
                  strokeWidth="0.6"
                />
              </svg>
            </div>
          </div>

          {/* Layer 5: Đỉnh khung (Classic Wing Zero Gold & White V-Fin with Forehead Cyan Camera) */}
          <div className={s.wingZeroHeadCrest}>
            <svg viewBox="0 0 120 54" className={s.wingZeroHeadSvg} fill="none">
              <defs>
                <linearGradient id="wzGoldFin" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF785" />
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="wzCobaltHead" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#0B2559" />
                </linearGradient>
              </defs>

              {/* Classic Sharp Gold V-Fin Antenna */}
              <polygon points="60,26 92,6 86,18 64,28" fill="url(#wzGoldFin)" stroke="#FFE066" strokeWidth="0.8" />
              <polygon points="60,26 28,6 34,18 56,28" fill="url(#wzGoldFin)" stroke="#FFE066" strokeWidth="0.8" />
              
              {/* Central White Forehead Horn Accent */}
              <polygon points="60,14 65,26 60,24 55,26" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.6" />

              {/* Head Shell Armor (Cobalt Blue & Crimson Red Accents) */}
              <path
                d="M 44 42 L 52 26 L 60 22 L 68 26 L 76 42 L 60 38 Z"
                fill="url(#wzCobaltHead)"
                stroke="#DC2626"
                strokeWidth="1"
              />

              {/* Main Cyan Sensor Camera */}
              <rect x="56" y="22" width="8" height="3" rx="0.8" fill="#00F5D4" stroke="#FFFFFF" strokeWidth="0.6" className={s.wzSensorGlow} />
            </svg>
          </div>

          {/* Layer 6: Mép dưới (Zero System Orb - Lõi Năng Lượng Xanh Lá Lồi 3D) */}
          <div className={s.wingZeroBottomPlaque}>
            <svg viewBox="0 0 120 40" className={s.wingZeroBottomSvg} fill="none">
              <defs>
                <radialGradient id="zeroSystemOrbGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#E6FFF2" />
                  <stop offset="25%" stopColor="#00FF88" />
                  <stop offset="65%" stopColor="#00A859" />
                  <stop offset="100%" stopColor="#02381C" />
                </radialGradient>
                <filter id="zeroOrbGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Crimson Red & Cobalt Blue Lower Armor Plaque */}
              <polygon
                points="22,12 98,12 110,32 60,38 10,32"
                fill="#0B2559"
                stroke="#DC2626"
                strokeWidth="1.6"
              />
              <polygon
                points="28,15 92,15 100,28 60,34 20,28"
                fill="#FFFFFF"
                stroke="#FFD700"
                strokeWidth="0.8"
              />
              
              {/* Text: ZERO SYSTEM */}
              <text
                x="60"
                y="24"
                textAnchor="middle"
                fontSize="5"
                fontFamily="'1FTV-VIP-Festigan', monospace"
                fontWeight="900"
                fill="#0B2559"
                letterSpacing="1.2"
              >
                ZERO SYSTEM
              </text>

              {/* Outer Hexagonal Bezel for Zero System Orb (Red & Gold) */}
              <polygon
                points="60,20 69,25 69,35 60,40 51,35 51,25"
                fill="#DC2626"
                stroke="#FFD700"
                strokeWidth="1.2"
              />
              <circle cx="60" cy="30" r="7.5" fill="#0B2559" stroke="#FFD700" strokeWidth="0.8" />

              {/* 3D Glowing Convex Green Zero System Orb */}
              <circle
                cx="60"
                cy="30"
                r="6"
                fill="url(#zeroSystemOrbGrad)"
                filter="url(#zeroOrbGlow)"
                className={s.zeroOrbPulse}
              />
              {/* Specular Highlight Reflection */}
              <ellipse cx="58" cy="28" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.9" />
            </svg>
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
