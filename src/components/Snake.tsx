import { useCallback, useEffect, useRef, useState } from 'react'

const COLS = 25
const ROWS = 14
const TICK_BASE = 110
const SIZE = 16

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Point = { x: number; y: number }

const HIGH_SCORE_KEY = 'snake-high-score'

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dirRef = useRef<Dir>('RIGHT')
  const snakeRef = useRef<Point[]>([{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }])
  const foodRef = useRef<Point>({ x: 15, y: 7 })
  const scoreRef = useRef(0)
  const gameRef = useRef<'playing' | 'over' | 'idle'>('playing')
  const animRef = useRef(0)
  const lastTickRef = useRef(0)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10)
  })
  const [, setGameState] = useState<'playing' | 'over' | 'idle'>('playing')

  const spawnFood = useCallback(() => {
    const snake = snakeRef.current
    let pos: Point
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y))
    foodRef.current = pos
  }, [])

  const reset = useCallback(() => {
    snakeRef.current = [{ x: 5, y: 7 }, { x: 4, y: 7 }, { x: 3, y: 7 }]
    dirRef.current = 'RIGHT'
    scoreRef.current = 0
    setScore(0)
    gameRef.current = 'playing'
    setGameState('playing')
    spawnFood()
  }, [spawnFood])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
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
      const tickInterval = Math.max(60, TICK_BASE - scoreRef.current * 2)

      if (gameRef.current === 'playing' && ts - lastTickRef.current > tickInterval) {
        lastTickRef.current = ts
        const snake = snakeRef.current
        const head = { ...snake[0] }

        switch (dirRef.current) {
          case 'UP': head.y--; break
          case 'DOWN': head.y++; break
          case 'LEFT': head.x--; break
          case 'RIGHT': head.x++; break
        }

        head.x = (head.x + COLS) % COLS
        head.y = (head.y + ROWS) % ROWS

        if (snake.some((s) => s.x === head.x && s.y === head.y)) {
          gameRef.current = 'over'
          setGameState('over')
          const newHigh = Math.max(scoreRef.current, highScore)
          setHighScore(newHigh)
          localStorage.setItem(HIGH_SCORE_KEY, String(newHigh))
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

      if (gameRef.current === 'over') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, 0, w, h)
        ctx.fillStyle = colors.textMain
        ctx.font = `700 24px 'Space Grotesk', sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText('游戏结束', w / 2, h / 2 - 10)
        ctx.font = `500 12px 'IBM Plex Mono', monospace`
        ctx.fillStyle = colors.accent
        ctx.fillText(`得分: ${scoreRef.current}  |  按空格重新开始`, w / 2, h / 2 + 16)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [highScore, spawnFood])

  useEffect(() => {
    const canvas = canvasRef.current!
    function onKeyDown(e: KeyboardEvent) {
      const dir = dirRef.current
      switch (e.key) {
        case 'ArrowUp':
          if (dir !== 'DOWN') dirRef.current = 'UP'
          e.preventDefault()
          break
        case 'ArrowDown':
          if (dir !== 'UP') dirRef.current = 'DOWN'
          e.preventDefault()
          break
        case 'ArrowLeft':
          if (dir !== 'RIGHT') dirRef.current = 'LEFT'
          e.preventDefault()
          break
        case 'ArrowRight':
          if (dir !== 'LEFT') dirRef.current = 'RIGHT'
          e.preventDefault()
          break
        case ' ':
          if (gameRef.current === 'over') reset()
          e.preventDefault()
          break
      }
    }

    canvas.addEventListener('keydown', onKeyDown)
    return () => canvas.removeEventListener('keydown', onKeyDown)
  }, [reset])

  return (
    <div className="widget-card snake-widget">
      <div className="widget-header">
        <span className="widget-kicker">贪吃蛇</span>
        <div className="snake-scores">
          <span>得分: {score}</span>
          <span>最高: {highScore}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="snake-canvas" tabIndex={0} />
      <p className="snake-hint">方向键移动 · 点击画布获取焦点 · 空格重新开始</p>
    </div>
  )
}
