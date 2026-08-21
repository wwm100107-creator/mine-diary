import { useState, useEffect, useRef } from 'react'

/**
 * High-performance rAF Mouse Tracking Hook for Custom Cursor Follower
 * Tracks position, clicking state, hover on interactive elements, and desktop pointer check.
 */
export function useMousePosition() {
  const [mouse, setMouse] = useState({
    x: -100,
    y: -100,
    rawX: -100,
    rawY: -100,
    visible: false,
    clicking: false,
    hovering: false,
    isFinePointer: false,
  })

  const posRef = useRef({
    x: -100,
    y: -100,
    targetX: -100,
    targetY: -100,
    visible: false,
    clicking: false,
    hovering: false,
  })
  const rafRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isFine = window.matchMedia('(pointer: fine)').matches
    if (!isFine) return

    setMouse((prev) => ({ ...prev, isFinePointer: true }))

    const handleMouseMove = (e) => {
      posRef.current.targetX = e.clientX
      posRef.current.targetY = e.clientY
      posRef.current.visible = true
    }

    const handleMouseDown = () => {
      posRef.current.clicking = true
      setMouse((prev) => ({ ...prev, clicking: true }))
    }

    const handleMouseUp = () => {
      posRef.current.clicking = false
      setMouse((prev) => ({ ...prev, clicking: false }))
    }

    const handleMouseOver = (e) => {
      const target = e.target
      const isInteractive = target?.closest(
        'button, a, input, textarea, select, [role="button"], [tabindex="0"], label, .clickable'
      )
      const hovering = !!isInteractive
      if (posRef.current.hovering !== hovering) {
        posRef.current.hovering = hovering
        setMouse((prev) => ({ ...prev, hovering }))
      }
    }

    const handleMouseLeave = () => {
      posRef.current.visible = false
      setMouse((prev) => ({ ...prev, visible: false }))
    }

    const loop = () => {
      // Smooth lerp (linear interpolation) for follower ring
      posRef.current.x += (posRef.current.targetX - posRef.current.x) * 0.4
      posRef.current.y += (posRef.current.targetY - posRef.current.y) * 0.4

      setMouse({
        x: posRef.current.x,
        y: posRef.current.y,
        rawX: posRef.current.targetX,
        rawY: posRef.current.targetY,
        visible: posRef.current.visible,
        clicking: posRef.current.clicking,
        hovering: posRef.current.hovering,
        isFinePointer: true,
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return mouse
}

export default useMousePosition
