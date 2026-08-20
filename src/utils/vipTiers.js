/**
 * src/utils/vipTiers.js
 * VIP Tier Hierarchy, Permissions Guard, and 30-Day Attendance Rewards
 * Ponytail style: pure functions, minimal dependencies, fast lookup.
 */

export const VIP_TIERS = {
  normal: {
    id: 'normal',
    name: 'Bình Thường',
    shortName: 'Thành viên',
    rank: 0,
    badge: '🌱 Thành viên',
    color: '#6B7280',
    bg: '#F3F4F6',
  },
  svip: {
    id: 'svip',
    name: 'SVIP Thánh Hỏa',
    shortName: 'SVIP',
    rank: 1,
    badge: '🔥 SVIP',
    frameId: 'vip8_fire',
    reqDays: 1,
    color: '#EF4444',
    bg: '#FEF2F2',
  },
  ssvip: {
    id: 'ssvip',
    name: 'SSVIP Cánh Băng',
    shortName: 'SSVIP',
    rank: 2,
    badge: '❄️ SSVIP',
    frameId: 'vip9_frost',
    reqDays: 7,
    color: '#0284C7',
    bg: '#F0F9FF',
  },
  sssvip: {
    id: 'sssvip',
    name: 'SSSVIP Song Long',
    shortName: 'SSSVIP',
    rank: 3,
    badge: '⚡ SSSVIP',
    frameId: 'vip10_thunder',
    reqDays: 14,
    color: '#D97706',
    bg: '#FFFBEB',
  },
  god: {
    id: 'god',
    name: 'GOD Nữ Thần Tối Thượng',
    shortName: 'GOD',
    rank: 4,
    badge: '🌌 GOD',
    frameId: 'god_cosmic',
    reqDays: 30,
    color: '#9333EA',
    bg: '#FAF5FF',
  },
}

export const FRAME_VIP_REQUIREMENT = {
  vip8_fire: 'svip',
  vip9_frost: 'ssvip',
  vip10_thunder: 'sssvip',
  god_cosmic: 'god',
}

/**
 * Get effective VIP Rank number for a user (0 to 4)
 */
export function getUserVipRank(user) {
  if (!user) return 0
  const id = (user.id || '').toLowerCase()
  const username = (user.username || '').toLowerCase()

  // Admin always has maximum GOD rank (Rank 4)
  if (id === 'adminserver' || username === 'adminserver' || user.isAdmin || user.role === 'admin') {
    return 4
  }

  const tierId = user.vipTier || 'normal'
  return VIP_TIERS[tierId]?.rank || 0
}

/**
 * Get effective VIP Tier Object for a user
 */
export function getUserVipTier(user) {
  if (!user) return VIP_TIERS.normal
  const id = (user.id || '').toLowerCase()
  const username = (user.username || '').toLowerCase()

  if (id === 'adminserver' || username === 'adminserver' || user.isAdmin || user.role === 'admin') {
    return VIP_TIERS.god
  }

  const tierId = user.vipTier || 'normal'
  return VIP_TIERS[tierId] || VIP_TIERS.normal
}

/**
 * Check if a specific avatar frame is unlocked for the user
 */
export function isFrameUnlocked(frameId, user) {
  if (!frameId || frameId === 'none') return true

  // Regular non-VIP frames are always unlocked
  const requiredTierId = FRAME_VIP_REQUIREMENT[frameId]
  if (!requiredTierId) return true

  const userRank = getUserVipRank(user)
  const reqRank = VIP_TIERS[requiredTierId]?.rank || 0

  return userRank >= reqRank
}

/**
 * Get required Tier info for a frame (null if free)
 */
export function getFrameRequirementInfo(frameId) {
  const reqTierId = FRAME_VIP_REQUIREMENT[frameId]
  if (!reqTierId) return null
  return VIP_TIERS[reqTierId] || null
}

/**
 * 30-Day Attendance Roadmap & Milestone Rewards
 */
export const ATTENDANCE_ROADMAP = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  if (day === 1) {
    return {
      day: 1,
      title: 'Mở Khóa SVIP 🔥',
      rewardType: 'vip',
      vipTier: 'svip',
      frameId: 'vip8_fire',
      desc: 'Khung SVIP Thánh Hỏa',
      isMilestone: true,
      badge: '🔥 SVIP',
    }
  }
  if (day === 7) {
    return {
      day: 7,
      title: 'Mở Khóa SSVIP ❄️',
      rewardType: 'vip',
      vipTier: 'ssvip',
      frameId: 'vip9_frost',
      desc: 'Khung SSVIP Cánh Băng',
      isMilestone: true,
      badge: '❄️ SSVIP',
    }
  }
  if (day === 14) {
    return {
      day: 14,
      title: 'Mở Khóa SSSVIP ⚡',
      rewardType: 'vip',
      vipTier: 'sssvip',
      frameId: 'vip10_thunder',
      desc: 'Khung SSSVIP Song Long',
      isMilestone: true,
      badge: '⚡ SSSVIP',
    }
  }
  if (day === 30) {
    return {
      day: 30,
      title: 'Mở Khóa GOD 🌌',
      rewardType: 'vip',
      vipTier: 'god',
      frameId: 'god_cosmic',
      desc: 'Khung GOD Nữ Thần Tối Thượng',
      isMilestone: true,
      badge: '🌌 GOD',
    }
  }

  const dailyGiftIcons = ['⭐', '💖', '🌸', '💎', '🍬', '✨', '🎁', '🍀']
  const icon = dailyGiftIcons[(day - 1) % dailyGiftIcons.length]
  return {
    day,
    title: `Quà Ngày ${day} ${icon}`,
    rewardType: 'item',
    desc: `Điểm tích lũy Ngày ${day}`,
    isMilestone: false,
    icon,
  }
})
