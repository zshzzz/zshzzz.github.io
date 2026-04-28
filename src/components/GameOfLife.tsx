import { useCallback, useEffect, useRef, useState } from 'react'

const CELL_SIZE = 8
const TICK_MS = 120

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<boolean[][]>([])
  const animRef = useRef(0)
  const lastTickRef = useRef(0)
  const [running, setRunning] = useState(true)
  const [cols, setCols] = useState(50)
  const [rows, setRows] = useState(35)

  const makeGrid = useCallback((c: number, r: number, fill = false) => {
    return Array.from({ length: r }, () =>
      Array.from({ length: c }, () => (fill ? Math.random() > 0.7 : false))
    )
  }, [])

  const initGliderGun = useCallback((c: number, r: number) => {
    const grid = makeGrid(c, r)
    // Place a glider gun pattern near top-left
    const gun = [
      [1, 5], [1, 6], [2, 5], [2, 6],
      [11, 5], [11, 6], [11, 7], [12, 4], [12, 8], [13, 3], [13, 9],
      [14, 3], [14, 9], [15, 6], [16, 4], [16, 8], [17, 5], [17, 6], [17, 7],
      [18, 6], [21, 3], [21, 4], [21, 5], [22, 3], [22, 4], [22, 5],
      [23, 2], [23, 6], [25, 1], [25, 2], [25, 6], [25, 7],
      [35, 3], [35, 4], [36, 3], [36, 4],
    ]
    for (const [gy, gx] of gun) {
      if (gy < r && gx < c) grid[gy][gx] = true
    }
    return grid
  }, [makeGrid])

  useEffect(() => {
    const canvas = canvasRef.current!

    function resize() {
      const parent = canvas.parentElement!
      const w = parent.clientWidth
      const h = 280
      canvas.width = w
      canvas.height = h
      const newCols = Math.floor(w / CELL_SIZE)
      const newRows = Math.floor(h / CELL_SIZE)
      setCols(newCols)
      setRows(newRows)
      gridRef.current = initGliderGun(newCols, newRows)
    }

    resize()

    const observer = new ResizeObserver(resize)
    if (canvas.parentElement) observer.observe(canvas.parentElement)

    return () => observer.disconnect()
  }, [initGliderGun])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    function getColors() {
      const style = getComputedStyle(document.documentElement)
      return {
        accent: style.getPropertyValue('--accent').trim() || '#ffd166',
        grid: style.getPropertyValue('--grid-line').trim() || 'rgba(255,255,255,0.04)',
      }
    }

    function step(grid: boolean[][]) {
      const r = grid.length
      const c = grid[0]?.length || 0
      const next = makeGrid(c, r)
      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          let neighbors = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const ny = (y + dy + r) % r
              const nx = (x + dx + c) % c
              if (grid[ny][nx]) neighbors++
            }
          }
          if (grid[y][x]) {
            next[y][x] = neighbors === 2 || neighbors === 3
          } else {
            next[y][x] = neighbors === 3
          }
        }
      }
      return next
    }

    function draw(ts: number) {
      if (!document.hidden && running && ts - lastTickRef.current > TICK_MS) {
        gridRef.current = step(gridRef.current)
        lastTickRef.current = ts
      }

      const grid = gridRef.current
      const { accent, grid: gridColor } = getColors()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 0.5
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, rows * CELL_SIZE)
        ctx.stroke()
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(cols * CELL_SIZE, y * CELL_SIZE)
        ctx.stroke()
      }

      // Draw cells
      ctx.fillStyle = accent
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < (grid[y]?.length || 0); x++) {
          if (grid[y][x]) {
            ctx.globalAlpha = 0.85
            ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
          }
        }
      }
      ctx.globalAlpha = 1

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [running, cols, rows, makeGrid])

  function handleCanvasClick(e: React.MouseEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE)
    const grid = gridRef.current
    if (y >= 0 && y < grid.length && x >= 0 && x < (grid[0]?.length || 0)) {
      grid[y][x] = !grid[y][x]
    }
  }

  function reset() {
    gridRef.current = makeGrid(cols, rows, true)
  }

  function clear() {
    gridRef.current = makeGrid(cols, rows, false)
  }

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-kicker">Conway's Game of Life</span>
        <div className="widget-controls">
          <button onClick={() => setRunning((r) => !r)} className="widget-btn">
            {running ? 'Pause' : 'Play'}
          </button>
          <button onClick={reset} className="widget-btn">Random</button>
          <button onClick={clear} className="widget-btn">Clear</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="gol-canvas"
        onClick={handleCanvasClick}
        style={{ cursor: 'crosshair' }}
      />
    </div>
  )
}
