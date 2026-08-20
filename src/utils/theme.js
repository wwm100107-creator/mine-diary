/**
 * src/utils/theme.js
 * Theme Management & Realtime Dynamic Palette Engine (Cute Pixel Aesthetics)
 */

export const THEME_PRESETS = [
  {
    id: 'strawberry',
    name: '🍓 Dâu Tây',
    desc: 'Hồng pastel ngọt ngào (Mặc định)',
    colors: {
      bg: '#FFF8F2',
      primary: '#FF8FAB',
      text: '#3D2B35',
      card: '#FFFFFF',
    },
    swatch: 'linear-gradient(135deg, #FFB7C5 0%, #FF8FAB 100%)',
  },
  {
    id: 'mint',
    name: '🍵 Bạc Hà',
    desc: 'Xanh mint thanh mát & thư thái',
    colors: {
      bg: '#F0FAF7',
      primary: '#5EB5A0',
      text: '#1E3A34',
      card: '#FFFFFF',
    },
    swatch: 'linear-gradient(135deg, #B7E3D8 0%, #5EB5A0 100%)',
  },
  {
    id: 'lavender',
    name: '🔮 Oải Hương',
    desc: 'Tím mộng mơ đầy cảm hứng',
    colors: {
      bg: '#F7F2FC',
      primary: '#B892D4',
      text: '#2F223D',
      card: '#FFFFFF',
    },
    swatch: 'linear-gradient(135deg, #D4B7E3 0%, #B892D4 100%)',
  },
  {
    id: 'lemon',
    name: '🍋 Chanh Vàng',
    desc: 'Vàng mật ong ấm áp & tràn năng lượng',
    colors: {
      bg: '#FFFDF0',
      primary: '#E5B838',
      text: '#3D3620',
      card: '#FFFFFF',
    },
    swatch: 'linear-gradient(135deg, #FFE99A 0%, #E5B838 100%)',
  },
  {
    id: 'ocean',
    name: '🌊 Soda Biển',
    desc: 'Xanh dương đại dương trong lành',
    colors: {
      bg: '#F0F8FF',
      primary: '#4BA3E3',
      text: '#1A2F45',
      card: '#FFFFFF',
    },
    swatch: 'linear-gradient(135deg, #BCE0FD 0%, #4BA3E3 100%)',
  },
  {
    id: 'night_sky',
    name: '🌌 Đêm Sao',
    desc: 'Giao diện tối pixel huyền bí',
    colors: {
      bg: '#1E1A29',
      primary: '#A472E8',
      text: '#F5EFFB',
      card: '#282337',
    },
    swatch: 'linear-gradient(135deg, #2D2240 0%, #A472E8 100%)',
  },
]

/**
 * Adjust hex color brightness/opacity helper
 */
function adjustColor(hex, amount) {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('')
  }
  const num = parseInt(cleanHex, 16)
  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0x00ff) + amount
  let b = (num & 0x0000ff) + amount

  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Apply theme to document.documentElement in real-time
 * @param {{ id: string, colors: { bg: string, primary: string, text: string, card?: string } }} themeConfig
 */
export function applyTheme(themeConfig) {
  if (typeof document === 'undefined' || !themeConfig) return

  let colors = themeConfig.colors
  if (!colors && typeof themeConfig === 'string') {
    const found = THEME_PRESETS.find(p => p.id === themeConfig)
    colors = found ? found.colors : THEME_PRESETS[0].colors
  }

  if (!colors) return

  const root = document.documentElement

  const bg = colors.bg || '#FFF8F2'
  const primary = colors.primary || '#FF8FAB'
  const text = colors.text || '#3D2B35'
  const card = colors.card || '#FFFFFF'

  // Dynamic derivatives
  const primaryLight = adjustColor(primary, 40)
  const primaryLighter = adjustColor(primary, 70)
  const primaryDark = adjustColor(primary, -35)
  const borderMid = adjustColor(primary, 25)
  const borderSubtle = adjustColor(bg, -20)
  const textSoft = adjustColor(text, 50)
  const textFaint = adjustColor(text, 90)

  root.style.setProperty('--color-cream', bg)
  root.style.setProperty('--color-cream-dark', adjustColor(bg, -10))
  root.style.setProperty('--color-white', card)

  root.style.setProperty('--color-pink-50', adjustColor(primary, 95))
  root.style.setProperty('--color-pink-100', primaryLighter)
  root.style.setProperty('--color-pink-200', primaryLight)
  root.style.setProperty('--color-pink-300', primary)
  root.style.setProperty('--color-pink-400', primary)
  root.style.setProperty('--color-pink-500', primaryDark)

  root.style.setProperty('--color-ink', text)
  root.style.setProperty('--color-ink-soft', textSoft)
  root.style.setProperty('--color-ink-faint', textFaint)

  root.style.setProperty('--color-border', borderSubtle)
  root.style.setProperty('--color-border-mid', borderMid)

  // Save to localStorage for instant reload persistence
  try {
    localStorage.setItem('minediary:theme', JSON.stringify(themeConfig))
  } catch (e) {
    console.error('Save theme error:', e)
  }
}

/**
 * Load saved theme from localStorage
 */
export function getSavedTheme() {
  try {
    const raw = localStorage.getItem('minediary:theme')
    return raw ? JSON.parse(raw) : THEME_PRESETS[0]
  } catch (e) {
    return THEME_PRESETS[0]
  }
}
