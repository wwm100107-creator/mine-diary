/**
 * src/utils/videoLoop.js
 * Universal Infinite Video Looper & Autoplay Guard
 * Ensures video avatars loop seamlessly without end-gaps, browser throttles, or pause glitches.
 */

/**
 * Setup infinite seamless loop for an HTMLVideoElement.
 * @param {HTMLVideoElement} videoElement
 * @returns {() => void} Cleanup function
 */
export function setupInfiniteVideoLoop(videoElement) {
  if (!videoElement) return () => {}

  videoElement.muted = true
  videoElement.playsInline = true
  videoElement.loop = true

  const forcePlay = () => {
    if (videoElement.paused) {
      const p = videoElement.play()
      if (p !== undefined) {
        p.catch(() => {
          // Autoplay policy fallback: ensure muted and retry
          videoElement.muted = true
          videoElement.play().catch(() => {})
        })
      }
    }
  }

  const handleEnded = () => {
    try {
      videoElement.currentTime = 0
    } catch (e) {}
    forcePlay()
  }

  const handlePause = () => {
    // Auto-resume if paused unexpectedly (e.g. power-saving or background tab resume)
    if (videoElement.paused && !videoElement.seeking) {
      forcePlay()
    }
  }

  const handleTimeUpdate = () => {
    // Zero-gap seamless loop: rewind ~40ms before video ends to avoid 1-frame black gap/freeze
    if (videoElement.duration > 0.2 && videoElement.duration - videoElement.currentTime < 0.04) {
      try {
        videoElement.currentTime = 0
      } catch (e) {}
      forcePlay()
    }
  }

  videoElement.addEventListener('ended', handleEnded)
  videoElement.addEventListener('pause', handlePause)
  videoElement.addEventListener('timeupdate', handleTimeUpdate)

  // Start initial playback
  forcePlay()

  return () => {
    videoElement.removeEventListener('ended', handleEnded)
    videoElement.removeEventListener('pause', handlePause)
    videoElement.removeEventListener('timeupdate', handleTimeUpdate)
  }
}
