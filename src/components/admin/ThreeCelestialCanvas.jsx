import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * ThreeCelestialCanvas — ThreeUI-inspired WebGL2 Celestial Space Atmosphere
 * Features:
 * - 600+ drifting starlight nodes with Brownian float & color gradation
 * - 3 dual-axis celestial orbital rings with slow harmonic rotation
 * - Damped mouse-tracking parallax (camera lerp) for tactile depth
 * - Adaptive DPR (clamped at 1.5) & visibilitychange auto-pause for high FPS
 */
export default function ThreeCelestialCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let animationFrameId
    let isVisible = true

    // ── 1. Scene & Camera Setup ──
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 85

    // ── 2. WebGL Renderer ──
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)
    container.appendChild(renderer.domElement)

    // ── 3. Particle Starfield ──
    const particleCount = 700
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)

    const palette = [
      new THREE.Color('#38bdf8'), // Cyan Glow
      new THREE.Color('#818cf8'), // Indigo Mist
      new THREE.Color('#f59e0b'), // Amber Qi
      new THREE.Color('#0ea5e9'), // Sky Blue
      new THREE.Color('#ffffff'), // Pure Starlight
    ]

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      // Spherical distribution
      const radius = 50 + Math.random() * 80
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = (radius * Math.cos(phi)) * 0.7 - 20

      const color = palette[Math.floor(Math.random() * palette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      scales[i] = Math.random() * 2.2 + 0.8
    }

    const particlesGeo = new THREE.BufferGeometry()
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Canvas particle circular sprite texture
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)')
    gradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.2)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(32, 32, 32, 0, Math.PI * 2)
    ctx.fill()

    const particleTexture = new THREE.CanvasTexture(canvas)

    const particlesMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const particleSystem = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particleSystem)

    // ── 4. Celestial Rings (Quỹ Đạo Thiên Thể) ──
    const ringsGroup = new THREE.Group()

    const createRing = (radius, tube, colorHex, tiltX, tiltY) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100)
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.22,
        wireframe: true,
        blending: THREE.AdditiveBlending,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = tiltX
      ring.rotation.y = tiltY
      return ring
    }

    const ring1 = createRing(55, 0.2, '#38bdf8', Math.PI * 0.35, Math.PI * 0.1)
    const ring2 = createRing(75, 0.15, '#818cf8', Math.PI * -0.25, Math.PI * 0.2)
    const ring3 = createRing(95, 0.1, '#f59e0b', Math.PI * 0.15, Math.PI * -0.3)

    ringsGroup.add(ring1)
    ringsGroup.add(ring2)
    ringsGroup.add(ring3)
    scene.add(ringsGroup)

    // ── 5. Mouse Parallax & Easing ──
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const handleMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 22
      targetY = -(e.clientY / window.innerHeight - 0.5) * 22
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    // ── 6. Resize Handler ──
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    }
    window.addEventListener('resize', handleResize)

    // ── 7. Visibility Change Handler (Save Battery/GPU) ──
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // ── 8. Render Animation Loop ──
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      if (!isVisible) return

      const elapsedTime = clock.getElapsedTime()

      // Smooth camera lerp damping
      currentX += (targetX - currentX) * 0.03
      currentY += (targetY - currentY) * 0.03
      camera.position.x = currentX
      camera.position.y = currentY
      camera.lookAt(0, 0, 0)

      // Slow harmonic rotation of rings and particle field
      particleSystem.rotation.y = elapsedTime * 0.015
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.02) * 0.05

      ring1.rotation.z = elapsedTime * 0.04
      ring2.rotation.z = -elapsedTime * 0.03
      ring3.rotation.z = elapsedTime * 0.02

      renderer.render(scene, camera)
    }
    animate()

    // ── 9. Cleanup on Unmount ──
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)

      particlesGeo.dispose()
      particlesMat.dispose()
      particleTexture.dispose()

      ringsGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })

      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 20%, #0c1527 0%, #07090e 65%, #030407 100%)',
      }}
      aria-hidden="true"
    />
  )
}
