import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

interface Ripple {
  x: number
  y: number
  r: number
  max: number
  alpha: number
  hueShift: number
}

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

export default function RippleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>()
  const inViewRef = useRef(inView)
  const [count, setCount] = useState(0)

  useEffect(() => {
    inViewRef.current = inView
  }, [inView])

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
    const ripples: Ripple[] = []
    const orbs: Orb[] = []

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      w = parent.clientWidth
      h = 280
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!orbs.length) {
        for (let i = 0; i < 18; i++) {
          orbs.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            r: Math.random() * 3 + 1.5,
          })
        }
      }
    }

    function getAccent() {
      return (
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() ||
        '#ffd166'
      )
    }

    function getAccent2() {
      return (
        getComputedStyle(document.documentElement).getPropertyValue('--accent2').trim() ||
        '#2ec4b6'
      )
    }

    function spawn(x: number, y: number) {
      ripples.push({
        x,
        y,
        r: 2,
        max: 40 + Math.random() * 80,
        alpha: 0.7,
        hueShift: Math.random(),
      })
      setCount((c) => c + 1)

      // Push nearby orbs
      for (const o of orbs) {
        const dx = o.x - x
        const dy = o.y - y
        const dist = Math.hypot(dx, dy) || 1
        if (dist < 120) {
          const f = (120 - dist) / 120
          o.vx += (dx / dist) * f * 2.5
          o.vy += (dy / dist) * f * 2.5
        }
      }
    }

    function draw() {
      if (!inViewRef.current) {
        animId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, w, h)
      const accent = getAccent()
      const accent2 = getAccent2()

      // soft floor
      const bg = ctx.createLinearGradient(0, 0, w, h)
      bg.addColorStop(0, 'rgba(255,255,255,0.02)')
      bg.addColorStop(1, 'rgba(255,255,255,0.0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // orbs
      for (const o of orbs) {
        o.vx *= 0.99
        o.vy *= 0.99
        o.x += o.vx
        o.y += o.vy
        if (o.x < 0 || o.x > w) o.vx *= -1
        if (o.y < 0 || o.y > h) o.vy *= -1
        o.x = Math.max(0, Math.min(w, o.x))
        o.y = Math.max(0, Math.min(h, o.y))

        ctx.beginPath()
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2)
        ctx.fillStyle = accent2
        ctx.globalAlpha = 0.35
        ctx.fill()
      }

      // ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.r += 1.6
        r.alpha *= 0.975
        if (r.r > r.max || r.alpha < 0.02) {
          ripples.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.strokeStyle = r.hueShift > 0.5 ? accent2 : accent
        ctx.globalAlpha = r.alpha
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r * 0.55, 0, Math.PI * 2)
        ctx.globalAlpha = r.alpha * 0.4
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      animId = requestAnimationFrame(draw)
    }

    function onClick(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      spawn(e.clientX - rect.left, e.clientY - rect.top)
    }

    function onTouch(e: TouchEvent) {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const t = e.touches[0]
      if (t) spawn(t.clientX - rect.left, t.clientY - rect.top)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('touchstart', onTouch, { passive: false })

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('touchstart', onTouch)
    }
  }, [])

  return (
    <div className="widget-card" ref={wrapRef}>
      <div className="widget-header">
        <span className="widget-kicker">涟漪力场</span>
        <span className="widget-sub">点击 / 触碰 · {count} 次涟漪</span>
      </div>
      <canvas ref={canvasRef} className="ripple-canvas" />
      <p className="snake-hint">点一下，粒子会被推开，波纹会扩散。</p>
    </div>
  )
}
