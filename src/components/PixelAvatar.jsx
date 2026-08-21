import React from 'react'
import { getAvatar } from '../utils/avatars'
import AvatarFrameOverlay from './AvatarFrameOverlay'

/**
 * PixelAvatar - Renders a cute pixel art avatar (SVG preset or custom uploaded/pixelated image)
 * with support for animated pixel frames overlay and responsive size preset scaling.
 */
export default function PixelAvatar({
  avatarId,
  frameId = 'none',
  size = 36,
  sizePreset,
  border = true,
  className = '',
  style = {},
}) {
  const isCustomImage =
    typeof avatarId === 'string' &&
    (avatarId.startsWith('data:image/') || avatarId.startsWith('http') || avatarId.startsWith('blob:'))

  const numericSize = typeof size === 'number' ? size : 36
  const computedPreset = sizePreset || (numericSize <= 36 ? 'sm' : numericSize <= 50 ? 'md' : 'lg')

  const containerStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: numericSize,
    height: numericSize,
    flexShrink: 0,
    overflow: 'visible',
    zIndex: 10,
    ...style,
  }

  const avatar = !isCustomImage ? getAvatar(avatarId) : null

  return (
    <div className={className} style={containerStyle} title={avatar?.name || 'Avatar'}>
      {/* Base Avatar Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: numericSize > 48 ? 10 : 6,
          backgroundColor: isCustomImage ? '#FFF0F5' : avatar?.bg || '#FFF0F5',
          border: border ? `2px solid var(--color-border-mid)` : 'none',
          boxShadow: border ? `2px 2px 0 var(--color-border-mid)` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isCustomImage ? 0 : Math.max(2, Math.floor(numericSize * 0.08)),
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >

        {isCustomImage ? (
          <img
            src={avatarId}
            alt="Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              imageRendering: 'pixelated',
            }}
          />
        ) : (
          <div
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            dangerouslySetInnerHTML={{ __html: avatar?.svg || '' }}
          />
        )}
      </div>

      {/* Animated Pixel Avatar Frame Overlay */}
      {frameId && frameId !== 'none' && (
        <AvatarFrameOverlay frameId={frameId} size={numericSize} sizePreset={computedPreset} />
      )}
    </div>
  )
}
