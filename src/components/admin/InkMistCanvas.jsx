import React, { useEffect, useRef } from 'react'

/**
 * InkMistCanvas — Tiên Nghịch Thủy Mặc Nền Giấy Tuyên Chỉ (Xuan Rice Paper & Sumi Ink)
 * Renders an antique parchment silk/rice paper background with gentle drifting
 * sumi ink wash clouds, golden Qi embers, jade motes, and swift sword brush strokes.
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

    // ── 1. Sumi Ink Wash Clouds (Khói Mực Sơn Hà Trôi Dạt) ──
    const inkBlobs = Array.from({ length: 6 }, (_, i) => ({
      x: (width / 6) * i + Math.random() * 100,
      y: (height / 4) * (i % 4) + Math.random() * 80,
      radius: Math.random() * 200 + 260,
      baseRadius: Math.random() * 200 + 260,
      angle: Math.random() * Math.PI * 2,
      speed: 0.0006 + Math.random() * 0.001,
      driftX: (Math.random() - 0.5) * 0.2,
      driftY: (Math.random() - 0.5) * 0.12,
      color:
        i % 3 === 0
          ? 'rgba(30, 41, 59, 0.07)' // Mực than nhẹ (Charcoal ink)
          : i % 3 === 1
          ? 'rgba(15, 23, 42, 0.05)' // Mực tàu cổ phong
          : 'rgba(51, 65, 85, 0.06)', // Sương lam thủy mặc
    }))

    // ── 2. Celestial Qi Particles (Bụi Linh Khí Kim Quang & Bích Ngọc) ──
    const particleCount = Math.min(40, Math.floor(width / 38))
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.9,
      speedY: -(Math.random() * 0.4 + 0.12),
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      hue: Math.random() > 0.5 ? 'amber' : 'cyan',
    }))

    // ── 3. Ethereal Sword Qi Beams (Nét Bút Kiếm Ý) ──
    let swordBeams = []
    const spawnSwordBeam = () => {
      if (Math.random() < 0.015 && swordBeams.length < 3) {
        swordBeams.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 140 + 90,
          angle: -Math.PI / 4 + (Math.random() - 0.5) * 0.25,
          speed: Math.random() * 3.5 + 2.5,
          opacity: 0.5,
        })
      }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // ── Nền Giấy Tuyên Chỉ Cổ Phong (Antique Xuan Rice Paper Gradient) ──
      const paperGrad = ctx.createLinearGradient(0, 0, width, height)
      paperGrad.addColorStop(0, '#fdfbf7')
      paperGrad.addColorStop(0.5, '#f7f2ea')
      paperGrad.addColorStop(1, '#f3ede2')
      ctx.fillStyle = paperGrad
      ctx.fillRect(0, 0, width, height)

      // ── Mực Thủy Mặc Sơn Hà Loang Mờ ──
      for (const blob of inkBlobs) {
        blob.angle += blob.speed
        blob.x += blob.driftX
        blob.y += blob.driftY
        if (blob.x < -blob.radius) blob.x = width + blob.radius
        if (blob.x > width + blob.radius) blob.x = -blob.radius
        if (blob.y < -blob.radius) blob.y = height + blob.radius
        if (blob.y > height + blob.radius) blob.y = -blob.radius

        const currentRadius = blob.baseRadius + Math.sin(blob.angle) * 40

        const grad = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          currentRadius
        )
        grad.addColorStop(0, blob.color)
        grad.addColorStop(0.5, blob.color.replace(/[\d\.]+\)$/, '0.02)'))
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Linh Khí Du Động ──
      for (const p of particles) {
        p.y += p.speedY
        p.x += p.speedX
        p.pulse += p.pulseSpeed
        const currentAlpha = Math.max(0.15, p.baseAlpha + Math.sin(p.pulse) * 0.25)

        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        const glowGrad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 3.5
        )
        if (p.hue === 'cyan') {
          glowGrad.addColorStop(0, `rgba(2, 132, 199, ${currentAlpha * 0.7})`)
          glowGrad.addColorStop(0.6, `rgba(56, 189, 248, ${currentAlpha * 0.2})`)
          glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        } else {
          glowGrad.addColorStop(0, `rgba(217, 119, 6, ${currentAlpha * 0.7})`)
          glowGrad.addColorStop(0.6, `rgba(245, 158, 11, ${currentAlpha * 0.2})`)
          glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        }

        ctx.fillStyle = glowGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = p.hue === 'cyan' ? '#0369a1' : '#b45309'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Kiếm Ý Thoảng Qua ──
      spawnSwordBeam()
      for (let i = swordBeams.length - 1; i >= 0; i--) {
        const beam = swordBeams[i]
        beam.x += Math.cos(beam.angle) * beam.speed
        beam.y += Math.sin(beam.angle) * beam.speed
        beam.opacity -= 0.008

        if (beam.opacity <= 0) {
          swordBeams.splice(i, 1)
          continue
        }

        const tailX = beam.x - Math.cos(beam.angle) * beam.length
        const tailY = beam.y - Math.sin(beam.angle) * beam.length

        const beamGrad = ctx.createLinearGradient(tailX, tailY, beam.x, beam.y)
        beamGrad.addColorStop(0, 'rgba(2, 132, 199, 0)')
        beamGrad.addColorStop(0.7, `rgba(2, 132, 199, ${beam.opacity * 0.35})`)
        beamGrad.addColorStop(1, `rgba(15, 23, 42, ${beam.opacity * 0.6})`)

        ctx.strokeStyle = beamGrad
        ctx.lineWidth = 1.6
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
