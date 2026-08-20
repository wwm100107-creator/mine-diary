import React, { memo } from 'react'
import PixelAvatar from './PixelAvatar'

const SIZE_PRESETS = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
}

/**
 * AvatarWithFrame - Reusable Memoized Avatar Component with Animated Pixel Frames
 * Supports responsive scaling presets: 'xs' | 'sm' | 'md' | 'lg' | 'xl' or numeric size.
 */
function AvatarWithFrameComponent({
  avatarUrl,
  avatarId,
  frameId = 'none',
  size = 36,
  border = true,
  className = '',
  style = {},
}) {
  const finalAvatar = avatarUrl || avatarId || 'bunny'
  const finalFrame = frameId || 'none'
  const numericSize = typeof size === 'number' ? size : (SIZE_PRESETS[size] || 36)
  const sizePreset = typeof size === 'string' && SIZE_PRESETS[size]
    ? size
    : (numericSize <= 36 ? 'sm' : numericSize <= 50 ? 'md' : 'lg')

  return (
    <PixelAvatar
      avatarId={finalAvatar}
      frameId={finalFrame}
      size={numericSize}
      sizePreset={sizePreset}
      border={border}
      className={className}
      style={style}
    />
  )
}

// Memoize to prevent CSS animations restarting or causing UI lag during typing or chat updates
export default memo(AvatarWithFrameComponent)
