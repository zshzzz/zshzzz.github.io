import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

const COLS = 25
const ROWS = 14
const TICK_BASE = 110
const SIZE = 16

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Point = { x: number; y: number }

const HIGH_SCORE_KEY = 'snake-high-score'

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ref: wrapRef, inView } = useInView<HTMLDivElement>()
  const inViewRef = useRef(inView)
  const dirRef = useRef<Dir>('RIGHT')
  const pendingDirRef = useRef<Dir>('RIGHT')
  const snakeRef = useRef<Point[]>([
    { x: 5, y: 7 },
    { x: 4, y: 7 },
    { x: 3, y: 7 },
  ])
  const foodRef = useRef<Point>({ x: 15, y: 7 })
  const scoreRef = useRef(0)
  const gameRef = useRef<'playing' | 'over' | 'idle'>('idle')
  const animRef = useRef(0)
  const lastTickRef = useRef(0)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10)
  )
  const [gameState, setGameState] = useState<'playing' | 'over' | 'idle'>('idle')

  useEffect(() => {
    inViewRef.current = inView
  }, [inView])

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current
    let pos: Point
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y))
    foodRef.current = pos
  }, [])

  const reset = useCallback(() => {
    snakeRef.current = [
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 },
    ]
    dirRef.current = 'RIGHT'
    pendingDirRef.current = 'RIGHT'
    scoreRef.current = 0
    setScore(0)
    gameRef.current = 'playing'
    setGameState('playing')
    spawnFood()
  }, [spawnFood])

  const setDir = useCallback((next: Dir) => {
    const dir = dirRef.current
    const illegal =
      (next === 'UP' && dir === 'DOWN') ||
      (next === 'DOWN' && dir === 'UP') ||
      (next === 'LEFT' && dir === 'RIGHT') ||
      (next === 'RIGHT' && dir === 'LEFT')
    if (!illegal) pendingDirRef.current = next
    if (gameRef.current === 'idle') reset()
  }, [reset])

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const surface = el.getContext('2d')
    if (!surface) return
    const canvas: HTMLCanvasElement = el
    const ctx: CanvasRenderingContext2D = surface
    const w = COLS * SIZE
    const h = ROWS * SIZE
    canvas.width = w
    canvas.height = h

    function getColors() {
      const style = getComputedStyle(document.documentElement)
      return {
        accent: style.getPropertyValue('--accent').trim() || '#ffd166',
        accent2: style.getPropertyValue('--accent2').trim() || '#2ec4b6',
        border: style.getPropertyValue('--border-soft').trim() || 'rgba(255,255,255,0.1)',
        panel: style.getPropertyValue('--panel').trim() || 'rgba(12,17,26,0.82)',
        textMain: style.getPropertyValue('--text-main').trim() || '#f4f1ea',
      }
    }

    function draw(ts: number) {
      if (inViewRef.current && gameRef.current === 'playing') {
        const tickInterval = Math.max(60, TICK_BASE - scoreRef.current * 2)
        if (ts - lastTickRef.current > tickInterval) {
          lastTickRef.current = ts
          dirRef.current = pendingDirRef.current
          const snake = snakeRef.current
          const head = { ...snake[0] }

          switch (dirRef.current) {
            case 'UP':
              head.y--
              break
            case 'DOWN':
              head.y++
              break
            case 'LEFT':
              head.x--
              break
            case 'RIGHT':
              head.x++
              break
          }

          head.x = (head.x + COLS) % COLS
          head.y = (head.y + ROWS) % ROWS

          if (snake.some((s) => s.x === head.x && s.y === head.y)) {
            gameRef.current = 'over'
            setGameState('over')
            setHighScore((prev) => {
              const newHigh = Math.max(scoreRef.current, prev)
              localStorage.setItem(HIGH_SCORE_KEY, String(newHigh))
              return newHigh
            })
          } else {
            snake.unshift(head)
            if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
              scoreRef.current++
              setScore(scoreRef.current)
              spawnFood()
            } else {
              snake.pop()
            }
          }
        }
      }

      const colors = getColors()
      ctx.fillStyle = colors.panel
      ctx.fillRect(0, 0, w, h)

      ctx.strokeStyle = colors.border
      ctx.lineWidth = 0.3
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath()
        ctx.moveTo(x * SIZE, 0)
        ctx.lineTo(x * SIZE, h)
        ctx.stroke()
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * SIZE)
        ctx.lineTo(w, y * SIZE)
        ctx.stroke()
      }

      const food = foodRef.current
      ctx.fillStyle = colors.accent2
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.arc(food.x * SIZE + SIZE / 2, food.y * SIZE + SIZE / 2, SIZE / 2 - 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      const snake = snakeRef.current
      snake.forEach((seg, i) => {
        ctx.fillStyle = colors.accent
        ctx.globalAlpha = i === 0 ? 1 : 0.7 - (i / snake.length) * 0.4
        const r = i === 0 ? 4 : 3
        const pad = i === 0 ? 1 : 2
        ctx.beginPath()
        ctx.roundRect(seg.x * SIZE + pad, seg.y * SIZE + pad, SIZE - pad * 2, SIZE - pad * 2, r)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      if (gameRef.current === 'over' || gameRef.current === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = colors.textMain
        ctx.font = `700 22px 'Space Grotesk', sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(gameRef.current === 'over' ? 'Game Over' : 'Ready?', w / 2, h / 2 - 10)
        ctx.font = `500 12px 'JetBrains Mono', monospace`
        ctx.fillStyle = colors.accent
        ctx.fillText(
          gameRef.current === 'over'
            ? `Score ${scoreRef.current}  ·  space / click`
            : 'arrows or pad',
          w / 2,
          h / 2 + 16
        )
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [spawnFood])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowUp':
          setDir('UP')
          e.preventDefault()
          break
        case 'ArrowDown':
          setDir('DOWN')
          e.preventDefault()
          break
        case 'ArrowLeft':
          setDir('LEFT')
          e.preventDefault()
          break
        case 'ArrowRight':
          setDir('RIGHT')
          e.preventDefault()
          break
        case ' ':
          if (gameRef.current === 'over' || gameRef.current === 'idle') reset()
          e.preventDefault()
          break
      }
    }

    // Only capture keys when pointer is over the widget or canvas focused
    const el = wrapRef.current
    if (!el) return

    function onFocusIn() {
      window.addEventListener('keydown', onKeyDown)
    }
    function onFocusOut(e: FocusEvent) {
      if (!el!.contains(e.relatedTarget as Node)) {
        window.removeEventListener('keydown', onKeyDown)
      }
    }
    function onEnter() {
      window.addEventListener('keydown', onKeyDown)
    }
    function onLeave() {
      if (!el!.contains(document.activeElement)) {
        window.removeEventListener('keydown', onKeyDown)
      }
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
    }
  }, [reset, setDir, wrapRef])

  return (
    <div className="widget-card snake-widget" ref={wrapRef}>
      <div className="widget-header">
        <span className="widget-kicker">Snake</span>
        <div className="snake-scores">
          <span>Score {score}</span>
          <span>Best {highScore}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="snake-canvas"
        tabIndex={0}
        onClick={() => {
          if (gameState === 'over' || gameState === 'idle') reset()
          canvasRef.current?.focus()
        }}
      />
      <div className="snake-pad" aria-label="方向控制">
        <button type="button" className="pad-btn pad-up" onClick={() => setDir('UP')}>
          ↑
        </button>
        <button type="button" className="pad-btn pad-left" onClick={() => setDir('LEFT')}>
          ←
        </button>
        <button type="button" className="pad-btn pad-down" onClick={() => setDir('DOWN')}>
          ↓
        </button>
        <button type="button" className="pad-btn pad-right" onClick={() => setDir('RIGHT')}>
          →
        </button>
      </div>
      <p className="snake-hint">hover + arrows · pad on mobile · wrap walls · space restart</p>
    </div>
  )
}
