import React from 'react'

/**
 * PixelIcon - Handcrafted Pixel-Art SVG Icons for Mine Diary
 * Styled specifically for the Cute Pixel Craft / Tamagotchi aesthetic.
 * All icons are plotted on a 16x16 grid with crispEdges rendering.
 */

const ICONS = {
  // 🛡️ Shield - Royal Guardian Crest
  shield: (
    <g>
      <rect x="2" y="2" width="12" height="3" fill="#B45309" />
      <rect x="3" y="3" width="10" height="2" fill="#FDE68A" />
      <rect x="2" y="5" width="12" height="4" fill="#B45309" />
      <rect x="3" y="5" width="10" height="4" fill="#F59E0B" />
      <rect x="3" y="9" width="10" height="3" fill="#B45309" />
      <rect x="4" y="9" width="8" height="2" fill="#D97706" />
      <rect x="5" y="12" width="6" height="2" fill="#B45309" />
      <rect x="6" y="12" width="4" height="1" fill="#D97706" />
      <rect x="7" y="14" width="2" height="1" fill="#B45309" />
      {/* Center Jewel Crest (Ruby Pink) */}
      <rect x="7" y="6" width="2" height="3" fill="#F43F5E" />
      <rect x="6" y="7" width="4" height="1" fill="#F43F5E" />
      <rect x="7" y="7" width="1" height="1" fill="#FFE4E6" />
    </g>
  ),

  // 🚪 Door / Logout - Wooden door with arrow
  door: (
    <g>
      <rect x="2" y="2" width="8" height="12" fill="#78350F" />
      <rect x="3" y="3" width="6" height="10" fill="#D97706" />
      <rect x="4" y="4" width="2" height="4" fill="#B45309" />
      <rect x="4" y="9" width="2" height="3" fill="#B45309" />
      {/* Golden Handle */}
      <rect x="7" y="8" width="1" height="2" fill="#FDE68A" />
      {/* Exit Arrow */}
      <rect x="10" y="7" width="4" height="2" fill="#EC4899" />
      <rect x="12" y="5" width="1" height="2" fill="#EC4899" />
      <rect x="13" y="6" width="1" height="2" fill="#EC4899" />
      <rect x="14" y="7" width="1" height="2" fill="#EC4899" />
      <rect x="13" y="8" width="1" height="2" fill="#EC4899" />
      <rect x="12" y="9" width="1" height="2" fill="#EC4899" />
    </g>
  ),

  // 👥 Users - Two Pixel Chibi Friends
  users: (
    <g>
      {/* Friend 1 (Pastel Pink Chibi) */}
      <rect x="2" y="3" width="5" height="4" fill="#2D222A" />
      <rect x="3" y="4" width="3" height="3" fill="#FFB7C5" />
      <rect x="3" y="5" width="1" height="1" fill="#2D222A" />
      <rect x="5" y="5" width="1" height="1" fill="#2D222A" />
      <rect x="1" y="8" width="7" height="6" fill="#F472B6" />
      <rect x="2" y="9" width="5" height="4" fill="#FF8FAB" />

      {/* Friend 2 (Sky Mint Chibi) */}
      <rect x="9" y="2" width="5" height="4" fill="#2D222A" />
      <rect x="10" y="3" width="3" height="3" fill="#BAE6FD" />
      <rect x="10" y="4" width="1" height="1" fill="#2D222A" />
      <rect x="12" y="4" width="1" height="1" fill="#2D222A" />
      <rect x="8" y="7" width="7" height="7" fill="#38BDF8" />
      <rect x="9" y="8" width="5" height="5" fill="#7DD3FC" />
    </g>
  ),

  // ⚡ Bolt / Zap - Bright Electric Lightning
  bolt: (
    <g>
      <rect x="8" y="1" width="3" height="2" fill="#78350F" />
      <rect x="7" y="3" width="4" height="2" fill="#F59E0B" />
      <rect x="8" y="3" width="2" height="2" fill="#FEF08A" />
      <rect x="6" y="5" width="4" height="2" fill="#F59E0B" />
      <rect x="7" y="5" width="2" height="2" fill="#FEF08A" />
      <rect x="3" y="7" width="10" height="2" fill="#F59E0B" />
      <rect x="5" y="7" width="6" height="2" fill="#FFFBEB" />
      <rect x="5" y="9" width="5" height="2" fill="#F59E0B" />
      <rect x="6" y="9" width="3" height="2" fill="#FEF08A" />
      <rect x="6" y="11" width="3" height="2" fill="#F59E0B" />
      <rect x="7" y="11" width="1" height="2" fill="#FFFBEB" />
      <rect x="7" y="13" width="2" height="2" fill="#D97706" />
      <rect x="7" y="14" width="1" height="1" fill="#FEF08A" />
    </g>
  ),

  // 🟢 Active Dot / Pulse - Cute glowing orb
  activeDot: (
    <g>
      <rect x="5" y="3" width="6" height="1" fill="#065F46" />
      <rect x="3" y="5" width="1" height="6" fill="#065F46" />
      <rect x="12" y="5" width="1" height="6" fill="#065F46" />
      <rect x="5" y="12" width="6" height="1" fill="#065F46" />
      <rect x="4" y="4" width="8" height="8" fill="#10B981" />
      <rect x="5" y="5" width="6" height="6" fill="#34D399" />
      <rect x="5" y="5" width="2" height="2" fill="#ECFDF5" />
    </g>
  ),

  // ⛔ Ban - Crimson Octagon Stop Barrier
  ban: (
    <g>
      <rect x="4" y="2" width="8" height="12" fill="#991B1B" />
      <rect x="2" y="4" width="12" height="8" fill="#991B1B" />
      <rect x="3" y="3" width="10" height="10" fill="#EF4444" />
      <rect x="4" y="4" width="8" height="8" fill="#DC2626" />
      {/* White Bar */}
      <rect x="4" y="7" width="8" height="2" fill="#FFFFFF" />
    </g>
  ),

  // 📬 Mail / Appeal - Cute Letter with Pink Heart Seal
  mail: (
    <g>
      <rect x="2" y="4" width="12" height="9" fill="#B45309" />
      <rect x="3" y="5" width="10" height="7" fill="#FFFBEB" />
      {/* Envelope Flap folds */}
      <rect x="3" y="5" width="2" height="1" fill="#FDE68A" />
      <rect x="5" y="6" width="2" height="1" fill="#FDE68A" />
      <rect x="7" y="7" width="2" height="1" fill="#FDE68A" />
      <rect x="9" y="6" width="2" height="1" fill="#FDE68A" />
      <rect x="11" y="5" width="2" height="1" fill="#FDE68A" />
      {/* Heart Seal */}
      <rect x="7" y="8" width="2" height="2" fill="#EC4899" />
      <rect x="6" y="8" width="1" height="1" fill="#F43F5E" />
      <rect x="9" y="8" width="1" height="1" fill="#F43F5E" />
      <rect x="7" y="10" width="2" height="1" fill="#F43F5E" />
    </g>
  ),

  // 🔍 Search - Pixel Magnifying Glass
  search: (
    <g>
      {/* Glass Rim */}
      <rect x="4" y="2" width="5" height="1" fill="#334155" />
      <rect x="4" y="8" width="5" height="1" fill="#334155" />
      <rect x="3" y="3" width="1" height="5" fill="#334155" />
      <rect x="9" y="3" width="1" height="5" fill="#334155" />
      {/* Lens Glass */}
      <rect x="4" y="3" width="5" height="5" fill="#E0F2FE" />
      <rect x="5" y="4" width="2" height="2" fill="#FFFFFF" />
      {/* Brass Joint */}
      <rect x="8" y="8" width="2" height="2" fill="#D97706" />
      {/* Wooden Handle */}
      <rect x="9" y="9" width="2" height="2" fill="#B45309" />
      <rect x="10" y="10" width="2" height="2" fill="#78350F" />
      <rect x="11" y="11" width="2" height="2" fill="#B45309" />
      <rect x="12" y="12" width="2" height="2" fill="#78350F" />
    </g>
  ),

  // 🔄 Refresh - Two Orbiting Arrows
  refresh: (
    <g>
      {/* Top Arc */}
      <rect x="5" y="2" width="6" height="2" fill="#0284C7" />
      <rect x="3" y="4" width="2" height="3" fill="#0284C7" />
      <rect x="11" y="3" width="2" height="2" fill="#0284C7" />
      {/* Top Arrow Head */}
      <rect x="11" y="1" width="3" height="2" fill="#38BDF8" />
      <rect x="12" y="3" width="2" height="2" fill="#38BDF8" />
      {/* Bottom Arc */}
      <rect x="5" y="12" width="6" height="2" fill="#0284C7" />
      <rect x="11" y="9" width="2" height="3" fill="#0284C7" />
      <rect x="3" y="11" width="2" height="2" fill="#0284C7" />
      {/* Bottom Arrow Head */}
      <rect x="2" y="13" width="3" height="2" fill="#38BDF8" />
      <rect x="2" y="11" width="2" height="2" fill="#38BDF8" />
    </g>
  ),

  // ⏳ Hourglass - Sand Timer
  hourglass: (
    <g>
      {/* Top and Bottom Caps */}
      <rect x="3" y="1" width="10" height="2" fill="#78350F" />
      <rect x="4" y="2" width="8" height="1" fill="#D97706" />
      <rect x="3" y="13" width="10" height="2" fill="#78350F" />
      <rect x="4" y="13" width="8" height="1" fill="#D97706" />
      {/* Glass Body */}
      <rect x="4" y="3" width="8" height="2" fill="#BAE6FD" />
      <rect x="5" y="5" width="6" height="2" fill="#BAE6FD" />
      <rect x="7" y="7" width="2" height="2" fill="#93C5FD" />
      <rect x="5" y="9" width="6" height="2" fill="#BAE6FD" />
      <rect x="4" y="11" width="8" height="2" fill="#BAE6FD" />
      {/* Golden Sand */}
      <rect x="5" y="4" width="6" height="1" fill="#FBBF24" />
      <rect x="6" y="5" width="4" height="1" fill="#F59E0B" />
      <rect x="7" y="7" width="2" height="2" fill="#FDE68A" />
      <rect x="7" y="9" width="2" height="1" fill="#F59E0B" />
      <rect x="6" y="11" width="4" height="1" fill="#FBBF24" />
      <rect x="5" y="12" width="6" height="1" fill="#F59E0B" />
    </g>
  ),

  // 🔒 Lock - Solid Padlock
  lock: (
    <g>
      {/* Shackle */}
      <rect x="5" y="2" width="6" height="2" fill="#475569" />
      <rect x="5" y="4" width="2" height="3" fill="#64748B" />
      <rect x="9" y="4" width="2" height="3" fill="#64748B" />
      {/* Lock Body */}
      <rect x="3" y="6" width="10" height="8" fill="#B45309" />
      <rect x="4" y="7" width="8" height="6" fill="#FBBF24" />
      <rect x="5" y="8" width="6" height="4" fill="#FDE68A" />
      {/* Keyhole */}
      <rect x="7" y="9" width="2" height="2" fill="#78350F" />
      <rect x="7" y="11" width="2" height="1" fill="#78350F" />
    </g>
  ),

  // 🔓 Unlock - Open Padlock
  unlock: (
    <g>
      {/* Raised Open Shackle */}
      <rect x="5" y="1" width="6" height="2" fill="#475569" />
      <rect x="5" y="3" width="2" height="3" fill="#64748B" />
      <rect x="9" y="3" width="2" height="1" fill="#64748B" />
      {/* Lock Body */}
      <rect x="3" y="6" width="10" height="8" fill="#B45309" />
      <rect x="4" y="7" width="8" height="6" fill="#FBBF24" />
      <rect x="5" y="8" width="6" height="4" fill="#FDE68A" />
      {/* Keyhole */}
      <rect x="7" y="9" width="2" height="2" fill="#78350F" />
      <rect x="7" y="11" width="2" height="1" fill="#78350F" />
    </g>
  ),

  // 🔑 Key - Vintage Brass Dungeon Key
  key: (
    <g>
      {/* Ring Head */}
      <rect x="2" y="3" width="5" height="5" fill="#B45309" />
      <rect x="3" y="4" width="3" height="3" fill="#FDE68A" />
      <rect x="4" y="5" width="1" height="1" fill="#B45309" />
      {/* Shaft */}
      <rect x="6" y="5" width="8" height="2" fill="#F59E0B" />
      <rect x="7" y="5" width="6" height="1" fill="#FEF08A" />
      {/* Teeth */}
      <rect x="11" y="7" width="1" height="3" fill="#D97706" />
      <rect x="13" y="7" width="1" height="2" fill="#D97706" />
    </g>
  ),

  // 👑 Crown - Royal Golden Crown with Ruby & Sapphire
  crown: (
    <g>
      {/* Bottom Band */}
      <rect x="2" y="11" width="12" height="3" fill="#B45309" />
      <rect x="3" y="12" width="10" height="1" fill="#FDE68A" />
      {/* Crown Body & 3 Peaks */}
      <rect x="2" y="7" width="3" height="4" fill="#F59E0B" />
      <rect x="3" y="5" width="2" height="2" fill="#FBBF24" />
      <rect x="7" y="5" width="2" height="6" fill="#F59E0B" />
      <rect x="7" y="3" width="2" height="2" fill="#FBBF24" />
      <rect x="11" y="7" width="3" height="4" fill="#F59E0B" />
      <rect x="11" y="5" width="2" height="2" fill="#FBBF24" />
      <rect x="4" y="9" width="8" height="2" fill="#F59E0B" />
      {/* Jewels */}
      <rect x="3" y="12" width="2" height="1" fill="#3B82F6" />
      <rect x="7" y="12" width="2" height="1" fill="#EF4444" />
      <rect x="11" y="12" width="2" height="1" fill="#10B981" />
      {/* Peak Jewels */}
      <rect x="3" y="4" width="2" height="1" fill="#FFFFFF" />
      <rect x="7" y="2" width="2" height="1" fill="#FFFFFF" />
      <rect x="11" y="4" width="2" height="1" fill="#FFFFFF" />
    </g>
  ),

  // 👁️ Eye - Anime/Chibi Eye with Shiny Pupil
  eye: (
    <g>
      <rect x="2" y="7" width="12" height="2" fill="#1E293B" />
      <rect x="3" y="5" width="10" height="6" fill="#1E293B" />
      <rect x="4" y="6" width="8" height="4" fill="#FFFFFF" />
      {/* Iris */}
      <rect x="6" y="6" width="4" height="4" fill="#6366F1" />
      <rect x="7" y="7" width="2" height="2" fill="#312E81" />
      {/* Glint Highlight */}
      <rect x="6" y="6" width="1" height="1" fill="#FFFFFF" />
      <rect x="8" y="8" width="1" height="1" fill="#A5B4FC" />
    </g>
  ),

  // 🔒 Eye Closed / Hidden
  eyeClosed: (
    <g>
      <rect x="2" y="8" width="12" height="2" fill="#475569" />
      <rect x="4" y="7" width="8" height="1" fill="#334155" />
      {/* Downward lashes */}
      <rect x="3" y="10" width="2" height="2" fill="#475569" />
      <rect x="7" y="10" width="2" height="2" fill="#475569" />
      <rect x="11" y="10" width="2" height="2" fill="#475569" />
    </g>
  ),

  // 🗑️ Trash - Cute Pixel Wastebin
  trash: (
    <g>
      {/* Handle & Lid */}
      <rect x="6" y="2" width="4" height="1" fill="#991B1B" />
      <rect x="2" y="3" width="12" height="2" fill="#DC2626" />
      <rect x="3" y="4" width="10" height="1" fill="#EF4444" />
      {/* Bin Body */}
      <rect x="4" y="5" width="8" height="9" fill="#B91C1C" />
      <rect x="5" y="6" width="6" height="7" fill="#EF4444" />
      {/* Vertical Ribs */}
      <rect x="6" y="7" width="1" height="5" fill="#991B1B" />
      <rect x="8" y="7" width="1" height="5" fill="#991B1B" />
      <rect x="9" y="7" width="1" height="5" fill="#991B1B" />
    </g>
  ),

  // ✓ Check - Crisp Mint Green Checkmark
  check: (
    <g>
      <rect x="2" y="8" width="2" height="2" fill="#047857" />
      <rect x="4" y="10" width="2" height="2" fill="#047857" />
      <rect x="6" y="12" width="3" height="2" fill="#047857" />
      <rect x="8" y="9" width="2" height="3" fill="#047857" />
      <rect x="10" y="6" width="2" height="3" fill="#047857" />
      <rect x="12" y="3" width="2" height="3" fill="#047857" />
      {/* Inner Mint Highlight */}
      <rect x="3" y="8" width="1" height="1" fill="#34D399" />
      <rect x="5" y="10" width="1" height="1" fill="#34D399" />
      <rect x="7" y="12" width="1" height="1" fill="#6EE7B7" />
      <rect x="9" y="9" width="1" height="1" fill="#34D399" />
      <rect x="11" y="6" width="1" height="1" fill="#34D399" />
      <rect x="13" y="3" width="1" height="1" fill="#6EE7B7" />
    </g>
  ),

  // ✕ Cross / Reject - Crisp Pixel X
  cross: (
    <g>
      <rect x="3" y="3" width="2" height="2" fill="#DC2626" />
      <rect x="11" y="3" width="2" height="2" fill="#DC2626" />
      <rect x="5" y="5" width="2" height="2" fill="#EF4444" />
      <rect x="9" y="5" width="2" height="2" fill="#EF4444" />
      <rect x="7" y="7" width="2" height="2" fill="#B91C1C" />
      <rect x="5" y="9" width="2" height="2" fill="#EF4444" />
      <rect x="9" y="9" width="2" height="2" fill="#EF4444" />
      <rect x="3" y="11" width="2" height="2" fill="#DC2626" />
      <rect x="11" y="11" width="2" height="2" fill="#DC2626" />
    </g>
  ),

  // 🌐 Globe - Earth with Continents
  globe: (
    <g>
      <rect x="5" y="2" width="6" height="12" fill="#0369A1" />
      <rect x="2" y="5" width="12" height="6" fill="#0369A1" />
      <rect x="3" y="3" width="10" height="10" fill="#0284C7" />
      <rect x="4" y="4" width="8" height="8" fill="#38BDF8" />
      {/* Green Continents */}
      <rect x="5" y="4" width="3" height="3" fill="#22C55E" />
      <rect x="7" y="6" width="3" height="3" fill="#15803D" />
      <rect x="9" y="5" width="2" height="2" fill="#22C55E" />
      <rect x="4" y="9" width="4" height="2" fill="#22C55E" />
      <rect x="8" y="10" width="3" height="1" fill="#15803D" />
      {/* Grid Lines */}
      <rect x="7" y="2" width="1" height="12" fill="#BAE6FD" />
      <rect x="2" y="7" width="12" height="1" fill="#BAE6FD" />
    </g>
  ),

  // 💻 Device / Laptop - Retro Clamshell Laptop
  device: (
    <g>
      {/* Screen Frame */}
      <rect x="3" y="2" width="10" height="8" fill="#334155" />
      <rect x="4" y="3" width="8" height="6" fill="#0284C7" />
      {/* Glowing Display */}
      <rect x="5" y="4" width="6" height="4" fill="#38BDF8" />
      <rect x="6" y="5" width="2" height="1" fill="#FFFFFF" />
      {/* Keyboard Base */}
      <rect x="1" y="10" width="14" height="3" fill="#475569" />
      <rect x="2" y="11" width="12" height="1" fill="#94A3B8" />
      <rect x="6" y="12" width="4" height="1" fill="#CBD5E1" />
    </g>
  ),

  // 📋 Clipboard - Document Board
  clipboard: (
    <g>
      {/* Metal Top Clip */}
      <rect x="6" y="1" width="4" height="2" fill="#475569" />
      <rect x="7" y="1" width="2" height="1" fill="#94A3B8" />
      {/* Board */}
      <rect x="2" y="3" width="12" height="12" fill="#92400E" />
      {/* Paper */}
      <rect x="4" y="4" width="8" height="10" fill="#FFFBEB" />
      {/* Text Lines */}
      <rect x="5" y="6" width="6" height="1" fill="#CBD5E1" />
      <rect x="5" y="8" width="5" height="1" fill="#CBD5E1" />
      <rect x="5" y="10" width="6" height="1" fill="#CBD5E1" />
      <rect x="5" y="12" width="3" height="1" fill="#CBD5E1" />
    </g>
  ),

  // ⚙️ Gear - Mechanical Cog
  gear: (
    <g>
      {/* Cog Core */}
      <rect x="4" y="4" width="8" height="8" fill="#475569" />
      <rect x="5" y="5" width="6" height="6" fill="#64748B" />
      {/* Center Hole */}
      <rect x="7" y="7" width="2" height="2" fill="#1E293B" />
      {/* Teeth (Cross & Corners) */}
      <rect x="7" y="2" width="2" height="2" fill="#94A3B8" />
      <rect x="7" y="12" width="2" height="2" fill="#94A3B8" />
      <rect x="2" y="7" width="2" height="2" fill="#94A3B8" />
      <rect x="12" y="7" width="2" height="2" fill="#94A3B8" />
      <rect x="3" y="3" width="2" height="2" fill="#64748B" />
      <rect x="11" y="3" width="2" height="2" fill="#64748B" />
      <rect x="3" y="11" width="2" height="2" fill="#64748B" />
      <rect x="11" y="11" width="2" height="2" fill="#64748B" />
    </g>
  ),

  // 🔥 Flame / Fire - Cute Cozy Bonfire
  flame: (
    <g>
      <rect x="7" y="1" width="2" height="2" fill="#EA580C" />
      <rect x="6" y="3" width="4" height="2" fill="#EA580C" />
      <rect x="5" y="5" width="6" height="2" fill="#F97316" />
      <rect x="4" y="7" width="8" height="5" fill="#EA580C" />
      <rect x="5" y="8" width="6" height="4" fill="#F59E0B" />
      <rect x="6" y="9" width="4" height="3" fill="#FDE047" />
      <rect x="7" y="10" width="2" height="2" fill="#FEF9C3" />
      <rect x="5" y="12" width="6" height="2" fill="#C2410C" />
    </g>
  ),

  // ✨ Sparkles - 4-Point Magic Stars
  sparkles: (
    <g>
      {/* Large Star */}
      <rect x="10" y="2" width="2" height="6" fill="#F59E0B" />
      <rect x="8" y="4" width="6" height="2" fill="#F59E0B" />
      <rect x="10" y="4" width="2" height="2" fill="#FEF08A" />
      {/* Small Star */}
      <rect x="4" y="9" width="2" height="4" fill="#EC4899" />
      <rect x="3" y="10" width="4" height="2" fill="#EC4899" />
      <rect x="4" y="10" width="2" height="2" fill="#FFF1F2" />
      {/* Glints */}
      <rect x="3" y="3" width="1" height="1" fill="#FDE047" />
      <rect x="13" y="12" width="1" height="1" fill="#FDE047" />
    </g>
  ),

  // ⚠️ Warning - Hazard Alert Triangle
  warning: (
    <g>
      <rect x="7" y="2" width="2" height="2" fill="#B45309" />
      <rect x="6" y="4" width="4" height="2" fill="#F59E0B" />
      <rect x="5" y="6" width="6" height="2" fill="#F59E0B" />
      <rect x="4" y="8" width="8" height="2" fill="#FBBF24" />
      <rect x="3" y="10" width="10" height="2" fill="#FBBF24" />
      <rect x="2" y="12" width="12" height="2" fill="#B45309" />
      {/* Exclamation Mark */}
      <rect x="7" y="5" width="2" height="4" fill="#1E293B" />
      <rect x="7" y="10" width="2" height="2" fill="#1E293B" />
    </g>
  ),

  // 🌸 Flower - Cute 5-Petal Sakura
  flower: (
    <g>
      {/* Petals */}
      <rect x="6" y="2" width="4" height="3" fill="#F472B6" />
      <rect x="2" y="6" width="3" height="4" fill="#F472B6" />
      <rect x="11" y="6" width="3" height="4" fill="#F472B6" />
      <rect x="4" y="10" width="3" height="4" fill="#F472B6" />
      <rect x="9" y="10" width="3" height="4" fill="#F472B6" />
      <rect x="5" y="5" width="6" height="6" fill="#FBCFE8" />
      {/* Pistil */}
      <rect x="7" y="7" width="2" height="2" fill="#F59E0B" />
    </g>
  ),

  // ❄️ Snowflake - Symmetrical Crystal
  snowflake: (
    <g>
      {/* Cross Arms */}
      <rect x="7" y="1" width="2" height="14" fill="#38BDF8" />
      <rect x="1" y="7" width="14" height="2" fill="#38BDF8" />
      {/* Diagonal Spikes */}
      <rect x="4" y="4" width="2" height="2" fill="#BAE6FD" />
      <rect x="10" y="4" width="2" height="2" fill="#BAE6FD" />
      <rect x="4" y="10" width="2" height="2" fill="#BAE6FD" />
      <rect x="10" y="10" width="2" height="2" fill="#BAE6FD" />
      {/* White Core Center */}
      <rect x="7" y="7" width="2" height="2" fill="#FFFFFF" />
    </g>
  ),

  // 🌱 Plant / Sprout - Sweet Green Seedling
  plant: (
    <g>
      {/* Soil Mound */}
      <rect x="4" y="12" width="8" height="2" fill="#78350F" />
      <rect x="5" y="13" width="6" height="1" fill="#451A03" />
      {/* Stem */}
      <rect x="7" y="7" width="2" height="5" fill="#15803D" />
      {/* Left Leaf */}
      <rect x="4" y="5" width="3" height="3" fill="#22C55E" />
      <rect x="5" y="4" width="2" height="2" fill="#4ADE80" />
      {/* Right Leaf */}
      <rect x="9" y="4" width="3" height="3" fill="#22C55E" />
      <rect x="9" y="3" width="2" height="2" fill="#86EFAC" />
    </g>
  ),

  // 🌌 Galaxy / Saturn - Cosmic Planet
  galaxy: (
    <g>
      {/* Planet Sphere */}
      <rect x="5" y="5" width="6" height="6" fill="#7C3AED" />
      <rect x="6" y="6" width="4" height="4" fill="#A855F7" />
      <rect x="7" y="6" width="2" height="2" fill="#E9D5FF" />
      {/* Ring Belt */}
      <rect x="1" y="8" width="4" height="1" fill="#EC4899" />
      <rect x="4" y="9" width="3" height="1" fill="#F43F5E" />
      <rect x="9" y="7" width="3" height="1" fill="#F43F5E" />
      <rect x="11" y="8" width="4" height="1" fill="#EC4899" />
      {/* Distant Stars */}
      <rect x="3" y="2" width="1" height="1" fill="#FDE047" />
      <rect x="13" y="13" width="1" height="1" fill="#FDE047" />
    </g>
  ),

  // 👦 Boy - Cute Pixel Chibi Face
  boy: (
    <g>
      {/* Hair */}
      <rect x="4" y="2" width="8" height="4" fill="#1E293B" />
      <rect x="3" y="4" width="10" height="2" fill="#334155" />
      {/* Face */}
      <rect x="4" y="6" width="8" height="5" fill="#FED7AA" />
      {/* Eyes */}
      <rect x="5" y="7" width="1" height="2" fill="#1E293B" />
      <rect x="9" y="7" width="1" height="2" fill="#1E293B" />
      {/* Blush */}
      <rect x="4" y="9" width="2" height="1" fill="#FB7185" />
      <rect x="9" y="9" width="2" height="1" fill="#FB7185" />
      {/* Collar */}
      <rect x="5" y="11" width="6" height="3" fill="#3B82F6" />
    </g>
  ),

  // 👧 Girl - Cute Pixel Chibi Face with Ribbon
  girl: (
    <g>
      {/* Ribbon Bow */}
      <rect x="9" y="1" width="3" height="2" fill="#EF4444" />
      <rect x="10" y="2" width="1" height="1" fill="#FEE2E2" />
      {/* Hair */}
      <rect x="4" y="2" width="6" height="4" fill="#6B21A8" />
      <rect x="3" y="4" width="10" height="3" fill="#7E22CE" />
      <rect x="2" y="7" width="2" height="5" fill="#7E22CE" />
      <rect x="12" y="7" width="2" height="5" fill="#7E22CE" />
      {/* Face */}
      <rect x="4" y="6" width="8" height="5" fill="#FED7AA" />
      {/* Eyes */}
      <rect x="5" y="7" width="1" height="2" fill="#1E293B" />
      <rect x="9" y="7" width="1" height="2" fill="#1E293B" />
      {/* Blush */}
      <rect x="4" y="9" width="2" height="1" fill="#FB7185" />
      <rect x="9" y="9" width="2" height="1" fill="#FB7185" />
      {/* Dress */}
      <rect x="5" y="11" width="6" height="3" fill="#F472B6" />
    </g>
  ),

  // 🚀 Rocket - Space Rocket Blastoff
  rocket: (
    <g>
      {/* Nose Cone */}
      <rect x="11" y="2" width="3" height="3" fill="#EF4444" />
      <rect x="9" y="4" width="3" height="3" fill="#EF4444" />
      {/* Cabin Body */}
      <rect x="6" y="6" width="4" height="4" fill="#F8FAFC" />
      <rect x="8" y="6" width="2" height="2" fill="#0284C7" />
      <rect x="4" y="9" width="4" height="3" fill="#CBD5E1" />
      {/* Fins */}
      <rect x="7" y="10" width="2" height="3" fill="#DC2626" />
      <rect x="2" y="7" width="3" height="2" fill="#DC2626" />
      {/* Flame Thruster */}
      <rect x="2" y="11" width="3" height="3" fill="#F59E0B" />
      <rect x="1" y="13" width="2" height="2" fill="#FDE047" />
    </g>
  ),

  // 📅 Calendar - Wall Grid Calendar
  calendar: (
    <g>
      {/* Top Header */}
      <rect x="2" y="2" width="12" height="3" fill="#DC2626" />
      <rect x="4" y="1" width="2" height="2" fill="#1E293B" />
      <rect x="10" y="1" width="2" height="2" fill="#1E293B" />
      {/* Calendar Page */}
      <rect x="2" y="5" width="12" height="9" fill="#FFFBEB" />
      <rect x="3" y="6" width="10" height="7" fill="#FFFFFF" />
      {/* Day Dots */}
      <rect x="4" y="7" width="1" height="1" fill="#64748B" />
      <rect x="7" y="7" width="1" height="1" fill="#64748B" />
      <rect x="10" y="7" width="1" height="1" fill="#64748B" />
      <rect x="4" y="9" width="1" height="1" fill="#64748B" />
      <rect x="7" y="9" width="1" height="1" fill="#EF4444" />
      <rect x="10" y="9" width="1" height="1" fill="#64748B" />
      <rect x="4" y="11" width="1" height="1" fill="#64748B" />
      <rect x="7" y="11" width="1" height="1" fill="#64748B" />
    </g>
  ),

  // 📜 Scroll - Parchment
  scroll: (
    <g>
      <rect x="2" y="2" width="12" height="2" fill="#B45309" />
      <rect x="3" y="4" width="10" height="8" fill="#FEF3C7" />
      <rect x="2" y="12" width="12" height="2" fill="#B45309" />
      {/* Writing lines */}
      <rect x="5" y="6" width="6" height="1" fill="#D97706" />
      <rect x="5" y="8" width="5" height="1" fill="#D97706" />
      <rect x="5" y="10" width="4" height="1" fill="#D97706" />
    </g>
  ),

  // 🎁 Gift - Present with Gold Ribbon
  gift: (
    <g>
      {/* Ribbon Bow */}
      <rect x="6" y="2" width="4" height="2" fill="#FACC15" />
      <rect x="5" y="3" width="2" height="1" fill="#FEF08A" />
      <rect x="9" y="3" width="2" height="1" fill="#FEF08A" />
      {/* Lid */}
      <rect x="2" y="4" width="12" height="3" fill="#EC4899" />
      <rect x="7" y="4" width="2" height="3" fill="#FACC15" />
      {/* Box */}
      <rect x="3" y="7" width="10" height="7" fill="#F472B6" />
      <rect x="7" y="7" width="2" height="7" fill="#FACC15" />
      <rect x="3" y="9" width="10" height="2" fill="#FACC15" />
    </g>
  ),

  // 📖 Book / Diary
  book: (
    <g>
      <rect x="3" y="2" width="10" height="12" fill="#E11D48" />
      <rect x="4" y="3" width="8" height="10" fill="#FB7185" />
      {/* Page Edges */}
      <rect x="11" y="3" width="2" height="10" fill="#FFFBEB" />
      {/* Golden Bookmark Ribbon */}
      <rect x="7" y="2" width="2" height="5" fill="#FACC15" />
      <rect x="7" y="6" width="1" height="2" fill="#FACC15" />
      {/* Spine Detail */}
      <rect x="3" y="2" width="2" height="12" fill="#9F1239" />
    </g>
  ),

  // 💖 Heart - Glowing Pink Valentine Heart
  heart: (
    <g>
      <rect x="3" y="4" width="4" height="4" fill="#F43F5E" />
      <rect x="9" y="4" width="4" height="4" fill="#F43F5E" />
      <rect x="4" y="3" width="2" height="1" fill="#FB7185" />
      <rect x="10" y="3" width="2" height="1" fill="#FB7185" />
      <rect x="4" y="8" width="8" height="2" fill="#F43F5E" />
      <rect x="5" y="10" width="6" height="2" fill="#E11D48" />
      <rect x="6" y="12" width="4" height="1" fill="#BE123C" />
      <rect x="7" y="13" width="2" height="1" fill="#9F1239" />
      {/* Shiny Highlight */}
      <rect x="4" y="4" width="2" height="2" fill="#FFF1F2" />
    </g>
  ),

  // 💬 Chat - Speech Bubble
  chat: (
    <g>
      <rect x="2" y="3" width="12" height="8" fill="#0284C7" />
      <rect x="3" y="4" width="10" height="6" fill="#38BDF8" />
      {/* Tail */}
      <rect x="3" y="11" width="3" height="2" fill="#0284C7" />
      <rect x="3" y="11" width="2" height="1" fill="#38BDF8" />
      {/* Dots */}
      <rect x="5" y="6" width="1" height="2" fill="#FFFFFF" />
      <rect x="7" y="6" width="1" height="2" fill="#FFFFFF" />
      <rect x="9" y="6" width="1" height="2" fill="#FFFFFF" />
    </g>
  ),

  // 🎉 Party - Popper Confetti
  party: (
    <g>
      <rect x="2" y="10" width="5" height="4" fill="#F59E0B" />
      <rect x="3" y="9" width="5" height="4" fill="#EF4444" />
      <rect x="4" y="8" width="5" height="4" fill="#F59E0B" />
      {/* Confetti Sparks */}
      <rect x="10" y="2" width="2" height="2" fill="#3B82F6" />
      <rect x="13" y="5" width="2" height="2" fill="#EC4899" />
      <rect x="8" y="3" width="1" height="2" fill="#10B981" />
      <rect x="11" y="8" width="2" height="1" fill="#FACC15" />
    </g>
  ),

  // ⭐ Star - Cute 5-Point Gold Star
  star: (
    <g>
      <rect x="7" y="2" width="2" height="2" fill="#F59E0B" />
      <rect x="7" y="3" width="1" height="1" fill="#FEF08A" />
      <rect x="6" y="4" width="4" height="2" fill="#F59E0B" />
      <rect x="2" y="6" width="12" height="2" fill="#F59E0B" />
      <rect x="3" y="6" width="10" height="1" fill="#FEF08A" />
      <rect x="4" y="8" width="8" height="2" fill="#F59E0B" />
      <rect x="5" y="10" width="6" height="2" fill="#F59E0B" />
      <rect x="3" y="12" width="3" height="2" fill="#F59E0B" />
      <rect x="10" y="12" width="3" height="2" fill="#F59E0B" />
      <rect x="4" y="12" width="1" height="1" fill="#FEF08A" />
      <rect x="11" y="12" width="1" height="1" fill="#FEF08A" />
    </g>
  ),

  // 💎 Gem - Sparkling Cyan Crystal
  gem: (
    <g>
      <rect x="5" y="3" width="6" height="2" fill="#0891B2" />
      <rect x="6" y="3" width="4" height="1" fill="#CFFAFE" />
      <rect x="3" y="5" width="10" height="3" fill="#06B6D4" />
      <rect x="5" y="5" width="6" height="2" fill="#67E8F9" />
      <rect x="5" y="5" width="2" height="1" fill="#FFFFFF" />
      <rect x="4" y="8" width="8" height="2" fill="#06B6D4" />
      <rect x="5" y="10" width="6" height="2" fill="#0891B2" />
      <rect x="7" y="12" width="2" height="2" fill="#0E7490" />
    </g>
  ),

  // 👤 User - Pixel Profile Avatar
  user: (
    <g>
      <rect x="5" y="2" width="6" height="6" fill="#64748B" />
      <rect x="6" y="3" width="4" height="4" fill="#94A3B8" />
      <rect x="7" y="8" width="2" height="1" fill="#475569" />
      <rect x="3" y="9" width="10" height="2" fill="#475569" />
      <rect x="2" y="11" width="12" height="3" fill="#64748B" />
      <rect x="3" y="12" width="10" height="2" fill="#94A3B8" />
    </g>
  ),

  // 🔔 Bell - Golden Notification Chime
  bell: (
    <g>
      <rect x="7" y="1" width="2" height="2" fill="#B45309" />
      <rect x="6" y="3" width="4" height="2" fill="#F59E0B" />
      <rect x="5" y="5" width="6" height="5" fill="#F59E0B" />
      <rect x="6" y="4" width="2" height="4" fill="#FEF08A" />
      <rect x="3" y="10" width="10" height="2" fill="#B45309" />
      <rect x="4" y="10" width="8" height="1" fill="#FDE68A" />
      <rect x="7" y="12" width="2" height="2" fill="#78350F" />
      <rect x="7" y="13" width="2" height="1" fill="#F59E0B" />
    </g>
  ),

  // ➕ Plus - Crisp Action Plus
  plus: (
    <g>
      <rect x="7" y="2" width="2" height="12" fill="#0284C7" />
      <rect x="2" y="7" width="12" height="2" fill="#0284C7" />
      <rect x="7" y="3" width="2" height="10" fill="#38BDF8" />
      <rect x="3" y="7" width="10" height="2" fill="#38BDF8" />
      <rect x="7" y="7" width="2" height="2" fill="#FFFFFF" />
    </g>
  ),

  // 🐰 Bunny - Sweet Happy Pixel Bunny
  bunny: (
    <g>
      <rect x="3" y="1" width="3" height="6" fill="#CBD5E1" />
      <rect x="4" y="2" width="1" height="4" fill="#FDA4AF" />
      <rect x="10" y="1" width="3" height="6" fill="#CBD5E1" />
      <rect x="11" y="2" width="1" height="4" fill="#FDA4AF" />
      <rect x="3" y="6" width="10" height="8" fill="#F8FAFC" />
      <rect x="2" y="7" width="12" height="6" fill="#F8FAFC" />
      <rect x="4" y="8" width="2" height="2" fill="#1E293B" />
      <rect x="5" y="8" width="1" height="1" fill="#FFFFFF" />
      <rect x="10" y="8" width="2" height="2" fill="#1E293B" />
      <rect x="11" y="8" width="1" height="1" fill="#FFFFFF" />
      <rect x="3" y="10" width="2" height="1" fill="#FB7185" />
      <rect x="11" y="10" width="2" height="1" fill="#FB7185" />
      <rect x="7" y="10" width="2" height="1" fill="#F43F5E" />
    </g>
  ),

  // 😿🐰 Crying Mascot / Crying Bunny - Pixel Mascot with Tears
  cryingBunny: (
    <g>
      <rect x="3" y="1" width="3" height="6" fill="#CBD5E1" />
      <rect x="4" y="2" width="1" height="4" fill="#FDA4AF" />
      <rect x="10" y="1" width="3" height="6" fill="#CBD5E1" />
      <rect x="11" y="2" width="1" height="4" fill="#FDA4AF" />
      <rect x="3" y="6" width="10" height="8" fill="#F8FAFC" />
      <rect x="2" y="7" width="12" height="6" fill="#F8FAFC" />
      <rect x="4" y="8" width="2" height="2" fill="#334155" />
      <rect x="10" y="8" width="2" height="2" fill="#334155" />
      <rect x="3" y="10" width="2" height="1" fill="#FB7185" />
      <rect x="11" y="10" width="2" height="1" fill="#FB7185" />
      <rect x="7" y="10" width="2" height="1" fill="#F43F5E" />
      <rect x="7" y="11" width="2" height="1" fill="#475569" />
      <rect x="5" y="10" width="1" height="3" fill="#38BDF8" />
      <rect x="5" y="13" width="2" height="2" fill="#0284C7" />
      <rect x="10" y="10" width="1" height="3" fill="#38BDF8" />
      <rect x="9" y="13" width="2" height="2" fill="#0284C7" />
      <rect x="4" y="14" width="1" height="1" fill="#7DD3FC" />
      <rect x="11" y="14" width="1" height="1" fill="#7DD3FC" />
    </g>
  ),

  // 🍓 Strawberry - Sweet Pixel Strawberry
  strawberry: (
    <g>
      <rect x="7" y="1" width="2" height="2" fill="#15803D" />
      <rect x="4" y="3" width="8" height="2" fill="#22C55E" />
      <rect x="6" y="2" width="4" height="1" fill="#4ADE80" />
      <rect x="3" y="5" width="10" height="6" fill="#E11D48" />
      <rect x="4" y="4" width="8" height="8" fill="#F43F5E" />
      <rect x="5" y="11" width="6" height="2" fill="#E11D48" />
      <rect x="6" y="13" width="4" height="1" fill="#BE123C" />
      <rect x="7" y="14" width="2" height="1" fill="#9F1239" />
      <rect x="5" y="6" width="1" height="1" fill="#FEF08A" />
      <rect x="8" y="6" width="1" height="1" fill="#FEF08A" />
      <rect x="10" y="7" width="1" height="1" fill="#FEF08A" />
      <rect x="6" y="9" width="1" height="1" fill="#FEF08A" />
      <rect x="9" y="9" width="1" height="1" fill="#FEF08A" />
      <rect x="7" y="11" width="1" height="1" fill="#FEF08A" />
    </g>
  ),

  // 🎲 Dice - Pixel White Game Die with Red & Black Pips
  dice: (
    <g>
      <rect x="2" y="2" width="12" height="12" fill="#334155" />
      <rect x="3" y="3" width="10" height="10" fill="#FFFFFF" />
      <rect x="3" y="3" width="9" height="1" fill="#F8FAFC" />
      <rect x="4" y="4" width="2" height="2" fill="#1E293B" />
      <rect x="10" y="4" width="2" height="2" fill="#1E293B" />
      <rect x="7" y="7" width="2" height="2" fill="#EF4444" />
      <rect x="4" y="10" width="2" height="2" fill="#1E293B" />
      <rect x="10" y="10" width="2" height="2" fill="#1E293B" />
    </g>
  ),

  // 🎨 Palette - Artist's Paint Palette
  palette: (
    <g>
      <rect x="3" y="2" width="10" height="11" fill="#B45309" />
      <rect x="2" y="4" width="12" height="7" fill="#B45309" />
      <rect x="3" y="3" width="9" height="9" fill="#D97706" />
      <rect x="9" y="8" width="2" height="2" fill="#1E293B" />
      <rect x="4" y="4" width="2" height="2" fill="#EC4899" />
      <rect x="7" y="3" width="2" height="2" fill="#3B82F6" />
      <rect x="10" y="4" width="2" height="2" fill="#EAB308" />
      <rect x="4" y="8" width="2" height="2" fill="#10B981" />
    </g>
  ),

  // ⬇️ Arrow Down - Pixel Arrow pointing down
  arrowDown: (
    <g>
      <rect x="7" y="2" width="2" height="7" fill="#F43F5E" />
      <rect x="6" y="8" width="4" height="2" fill="#F43F5E" />
      <rect x="5" y="9" width="6" height="2" fill="#F43F5E" />
      <rect x="4" y="10" width="8" height="2" fill="#FB7185" />
      <rect x="6" y="12" width="4" height="2" fill="#FB7185" />
      <rect x="7" y="14" width="2" height="1" fill="#FDA4AF" />
    </g>
  ),
}

export default function PixelIcon({
  name,
  size = 16,
  color,
  className = '',
  style = {},
  title,
}) {
  const iconContent = ICONS[name] || ICONS.shield

  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      style={{
        imageRendering: 'pixelated',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : 'presentation'}
    >
      {title && <title>{title}</title>}
      {iconContent}
    </svg>
  )
}
