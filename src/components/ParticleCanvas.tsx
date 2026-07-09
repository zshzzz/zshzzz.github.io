import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  baseAlpha: number
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const surface = el.getContext('2d')
    if (!surface) return
    const canvas: HTMLCanvasElement = el
    const ctx: CanvasRenderingContext2D = surface

    let animId = 0
    let w = 0
    let h = 0
    let mouseX = -9999
    let mouseY = -9999
    let dpr = 1
    const particles: Particle[] = []
    const COUNT = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 14000))
    const REPEL_RADIUS = 140
    const REPEL_FORCE = 0.55
    const LINK_DIST = 130

    function getAccentColor(): string {
      return (
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() ||
        '#ffd166'
      )
    }

    function getAccent2(): string {
      return (
        getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim() ||
        '#2ec4b6'
      )
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function initParticles() {
      particles.length = 0
      for (let i = 0; i < COUNT; i++) {
        const alpha = Math.random() * 0.45 + 0.12
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 2.2 + 0.6,
          alpha,
          baseAlpha: alpha,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const color = getAccentColor()
      const color2 = getAccent2()

      for (const p of particles) {
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.hypot(dx, dy)
        if (dist < REPEL_RADIUS && dist > 0) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
          p.alpha = Math.min(1, p.baseAlpha + 0.35)
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05
        }

        p.vx *= 0.985
        p.vy *= 0.985
        p.x += p.vx
        p.y += p.vy

        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = p.alpha
        ctx.fill()
      }

      // Spatial hash for links — O(n) instead of O(n²)
      const cellSize = LINK_DIST
      const grid = new Map<string, number[]>()
      for (let i = 0; i < particles.length; i++) {
        const key = `${Math.floor(particles[i].x / cellSize)},${Math.floor(particles[i].y / cellSize)}`
        let bucket = grid.get(key)
        if (!bucket) {
          bucket = []
          grid.set(key, bucket)
        }
        bucket.push(i)
      }

      ctx.lineWidth = 0.7
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        const cx = Math.floor(a.x / cellSize)
        const cy = Math.floor(a.y / cellSize)
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const bucket = grid.get(`${cx + ox},${cy + oy}`)
            if (!bucket) continue
            for (const j of bucket) {
              if (j <= i) continue
              const b = particles[j]
              const dx = a.x - b.x
              const dy = a.y - b.y
              const dist = Math.hypot(dx, dy)
              if (dist < LINK_DIST) {
                const t = 1 - dist / LINK_DIST
                ctx.beginPath()
                ctx.moveTo(a.x, a.y)
                ctx.lineTo(b.x, b.y)
                ctx.strokeStyle = t > 0.55 ? color2 : color
                ctx.globalAlpha = t * 0.12
                ctx.stroke()
              }
            }
          }
        }
      }
      ctx.globalAlpha = 1

      // Soft cursor glow
      if (mouseX > 0 && mouseY > 0) {
        const g = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 90)
        g.addColorStop(0, color)
        g.addColorStop(1, 'transparent')
        ctx.globalAlpha = 0.06
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(mouseX, mouseY, 90, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    function onMouseLeave() {
      mouseX = -9999
      mouseY = -9999
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(animId)
      } else {
        animId = requestAnimationFrame(draw)
      }
    }

    resize()
    initParticles()
    draw()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
}
