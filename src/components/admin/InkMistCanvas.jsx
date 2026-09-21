import React, { useEffect, useRef } from 'react'

/**
 * InkMistCanvas — Tiên Nghịch & Thủy Mặc Canvas Background Effect
 * Renders smooth floating ink wash clouds, drifting ethereal mist,
 * and celestial Qi particles with zero jagged edges (GPU smooth).
 */
export default function InkMistCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // ── 1. Ink Clouds (Thủy Mặc Sơn Hà Mây Khói) ──
    const inkBlobs = Array.from({ length: 6 }, (_, i) => ({
      x: (width / 6) * i + Math.random() * 100,
      y: (height / 4) * (i % 4) + Math.random() * 80,
      radius: Math.random() * 180 + 220,
      baseRadius: Math.random() * 180 + 220,
      angle: Math.random() * Math.PI * 2,
      speed: 0.0008 + Math.random() * 0.0012,
      driftX: (Math.random() - 0.5) * 0.25,
      driftY: (Math.random() - 0.5) * 0.15,
      color:
        i % 3 === 0
          ? 'rgba(14, 28, 48, 0.45)' // Thâm lam mực
          : i % 3 === 1
          ? 'rgba(26, 18, 38, 0.35)' // Tử khí mực
          : 'rgba(8, 16, 26, 0.55)', // Huyền mặc sâu
    }))

    // ── 2. Celestial Qi Particles (Linh Khí Du Động) ──
    const particleCount = Math.min(45, Math.floor(width / 35))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      hue: Math.random() > 0.4 ? 190 : 45, // Cyan linh khí (190) hoặc Kim quang đan vận (45)
    }))

    // ── 3. Ethereal Sword Qi Beams (Kiếm Ý Thoảng Qua) ──
    let swordBeams = []
    const spawnSwordBeam = () => {
      if (Math.random() < 0.018 && swordBeams.length < 3) {
        swordBeams.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 120 + 80,
          angle: -Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          speed: Math.random() * 4 + 3,
          opacity: 0.6,
        })
      }
    }

    let time = 0

    const render = () => {
      time += 0.01
      ctx.clearRect(0, 0, width, height)

      // Base rice-paper ink wash dark gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#06080c')
      bgGrad.addColorStop(0.5, '#0b0f17')
      bgGrad.addColorStop(1, '#05070a')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // ── Render Ink Mist Blobs with Soft Radial Blur ──
      for (const blob of inkBlobs) {
        blob.angle += blob.speed
        blob.x += blob.driftX
        blob.y += blob.driftY
        if (blob.x < -blob.radius) blob.x = width + blob.radius
        if (blob.x > width + blob.radius) blob.x = -blob.radius
        if (blob.y < -blob.radius) blob.y = height + blob.radius
        if (blob.y > height + blob.radius) blob.y = -blob.radius

        const currentRadius = blob.baseRadius + Math.sin(blob.angle) * 35

        const grad = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          currentRadius
        )
        grad.addColorStop(0, blob.color)
        grad.addColorStop(0.6, blob.color.replace(/[\d\.]+\)$/, '0.15)'))
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Render Celestial Qi Particles ──
      for (const p of particles) {
        p.y += p.speedY
        p.x += p.speedX
        p.pulse += p.pulseSpeed
        const currentAlpha = Math.max(0.1, p.baseAlpha + Math.sin(p.pulse) * 0.3)

        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // Particle Glow Halo
        const glowGrad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 3.5
        )
        if (p.hue === 190) {
          glowGrad.addColorStop(0, `rgba(56, 189, 248, ${currentAlpha})`)
          glowGrad.addColorStop(0.5, `rgba(14, 165, 233, ${currentAlpha * 0.4})`)
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        } else {
          glowGrad.addColorStop(0, `rgba(251, 191, 36, ${currentAlpha})`)
          glowGrad.addColorStop(0.5, `rgba(245, 158, 11, ${currentAlpha * 0.35})`)
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        }

        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2)
        ctx.fill()

        // Core dot
        ctx.fillStyle = p.hue === 190 ? '#e0f2fe' : '#fef3c7'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Render Sword Qi Beams ──
      spawnSwordBeam()
      for (let i = swordBeams.length - 1; i >= 0; i--) {
        const beam = swordBeams[i]
        beam.x += Math.cos(beam.angle) * beam.speed
        beam.y += Math.sin(beam.angle) * beam.speed
        beam.opacity -= 0.009

        if (beam.opacity <= 0) {
          swordBeams.splice(i, 1)
          continue
        }

        const tailX = beam.x - Math.cos(beam.angle) * beam.length
        const tailY = beam.y - Math.sin(beam.angle) * beam.length

        const beamGrad = ctx.createLinearGradient(tailX, tailY, beam.x, beam.y)
        beamGrad.addColorStop(0, 'rgba(56, 189, 248, 0)')
        beamGrad.addColorStop(0.7, `rgba(56, 189, 248, ${beam.opacity * 0.4})`)
        beamGrad.addColorStop(1, `rgba(255, 255, 255, ${beam.opacity})`)

        ctx.strokeStyle = beamGrad
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(beam.x, beam.y)
        ctx.stroke()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  )
}
