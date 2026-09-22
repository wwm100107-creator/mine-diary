import React, { useState, useEffect } from 'react'

/**
 * AceternitySpotlightGrid — Aceternity UI inspired Technical Dot Matrix & Mouse Spotlight
 * Layers a refined 0.5px technical dot grid with cursor-following radial illumination
 * and subtle perimeter vignette mask.
 */
export default function AceternitySpotlightGrid() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  useEffect(() => {
    let ticking = false
    const handleMouseMove = (e) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setMousePos({ x: e.clientX, y: e.clientY })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* 1. Tactical Dot Matrix Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px, 72px 72px, 72px 72px',
          backgroundPosition: '0 0, 0 0, 0 0',
          opacity: 0.75,
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 40%, transparent 85%)',
        }}
      />

      {/* 2. Mouse Tracking Radial Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.07), rgba(99, 102, 241, 0.03) 40%, transparent 75%)`,
          transition: 'background 0.05s ease',
        }}
      />

      {/* 3. Subtle Horizon Glow Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4) 30%, rgba(129, 140, 248, 0.6) 50%, rgba(56, 189, 248, 0.4) 70%, transparent)',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
        }}
      />
    </div>
  )
}
