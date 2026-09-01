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
    zIndex: isVideo ? 99 : 10,
    ...style,
  }

  const avatar = (!isCustomImage && !isVideo) ? (getAvatar(avatarId) || getAvatar('bunny')) : null

  return (
    <div className={className} style={containerStyle} title={avatar?.name || (isVideo ? 'Video Avatar' : 'Avatar')}>
      {/* Base Avatar Container */}
      <div
        style={{
          width: isVideo ? '150%' : '100%',
          height: isVideo ? '150%' : '100%',
          borderRadius: isVideo ? '50%' : (numericSize > 48 ? 10 : 6),
          backgroundColor: isVideo ? 'transparent' : (isCustomImage ? '#FFF0F5' : avatar?.bg || '#FFF0F5'),
          border: isVideo ? 'none' : (border ? `2px solid var(--color-border-mid)` : 'none'),
          boxShadow: isVideo
            ? '0 6px 20px rgba(0, 0, 0, 0.5), 0 0 0 1.5px rgba(255, 255, 255, 0.22)'
            : (border ? `2px 2px 0 var(--color-border-mid)` : 'none'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          overflow: 'hidden',
          position: isVideo ? 'absolute' : 'relative',
          top: isVideo ? '50%' : 'auto',
          left: isVideo ? '50%' : 'auto',
          transform: isVideo ? 'translate(-50%, -50%) translateZ(0)' : 'none',
          zIndex: isVideo ? 99 : 1,
          WebkitMaskImage: isVideo ? '-webkit-radial-gradient(white, black)' : 'none',
          maskImage: isVideo ? 'radial-gradient(white, black)' : 'none',
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
              borderRadius: '50%',
              display: 'block',
              pointerEvents: 'none',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              imageRendering: '-webkit-optimize-contrast',
              filter: 'contrast(1.04) brightness(1.02)',
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
