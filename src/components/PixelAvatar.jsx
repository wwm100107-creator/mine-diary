import React, { useRef, useEffect, useState } from 'react'
import { getAvatar } from '../utils/avatars'
import AvatarFrameOverlay from './AvatarFrameOverlay'
import { setupInfiniteVideoLoop } from '../utils/videoLoop'

/**
 * PixelAvatar - Renders a cute pixel art avatar (SVG preset, custom image, or MP4 video avatar)
 * with support for animated pixel frames overlay, video infinite loop, and responsive scaling.
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
  const [hasError, setHasError] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    setHasError(false)
  }, [avatarId])

  const isVideo =
    !hasError &&
    typeof avatarId === 'string' &&
    (avatarId.endsWith('.mp4') ||
      avatarId.endsWith('.webm') ||
      avatarId.startsWith('data:video/') ||
      avatarId.includes('.mp4') ||
      avatarId.includes('.webm'))

  const isCustomImage =
    !hasError &&
    !isVideo &&
    typeof avatarId === 'string' &&
    !avatarId.endsWith('.mp4') &&
    !avatarId.endsWith('.webm') &&
    (avatarId.startsWith('data:image/') || avatarId.startsWith('http') || avatarId.startsWith('blob:') || avatarId.startsWith('/') || avatarId.includes('.'))

  // Infinite Video Looper: ensures continuous seamless playback across all browsers & mobile devices
  useEffect(() => {
    if (isVideo && videoRef.current) {
      return setupInfiniteVideoLoop(videoRef.current)
    }
  }, [isVideo, avatarId])

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

  const avatar = (!isCustomImage && !isVideo) ? (getAvatar(avatarId) || getAvatar('bunny')) : null

  return (
    <div className={className} style={containerStyle} title={avatar?.name || (isVideo ? 'Video Avatar' : 'Avatar')}>
      {/* Base Avatar Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: isVideo ? '50%' : (numericSize > 48 ? 10 : 6),
          backgroundColor: isVideo ? 'transparent' : (isCustomImage ? '#FFF0F5' : avatar?.bg || '#FFF0F5'),
          border: isVideo ? 'none' : (border ? `2px solid var(--color-border-mid)` : 'none'),
          boxShadow: isVideo ? 'none' : (border ? `2px 2px 0 var(--color-border-mid)` : 'none'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: (isCustomImage || isVideo) ? 0 : Math.max(2, Math.floor(numericSize * 0.08)),
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={avatarId}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={() => setHasError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 'inherit',
              display: 'block',
              pointerEvents: 'none',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          />
        ) : isCustomImage ? (
          <img
            src={avatarId}
            alt="Avatar"
            onError={() => setHasError(true)}
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

      {/* Animated Pixel Avatar Frame Overlay (Skip if video already includes built-in animated frame) */}
      {frameId && frameId !== 'none' && !isVideo && (
        <AvatarFrameOverlay frameId={frameId} size={numericSize} sizePreset={computedPreset} />
      )}
    </div>
  )
}
