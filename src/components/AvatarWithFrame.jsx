import React, { memo } from 'react'
import PixelAvatar from './PixelAvatar'

/**
 * AvatarWithFrame - Reusable Memoized Avatar Component with Animated Pixel Frames
 * Optimized to prevent unnecessary re-renders during high-frequency chat typing.
 *
 * Props:
 *  - avatarUrl / avatarId: string (preset ID like 'bunny' or Data URL / Image URL)
 *  - frameId: string ('rainbow' | 'sparkle_stars' | 'cyber_aura' | 'sakura_hearts' | 'none')
 *  - size: number (default 36)
 *  - border: boolean (default true)
 *  - className: string
 *  - style: CSSProperties
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

  return (
    <PixelAvatar
      avatarId={finalAvatar}
      frameId={finalFrame}
      size={size}
      border={border}
      className={className}
      style={style}
    />
  )
}

// Memoize to prevent CSS animations restarting or causing UI lag during typing or chat updates
export default memo(AvatarWithFrameComponent)
