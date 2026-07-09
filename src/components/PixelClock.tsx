import { useEffect, useRef, useState } from 'react'

// 5x7 pixel font: digits, colon, slash
const DIGIT_MAP: Record<string, number[][]> = {
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
  ],
  '2': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  '3': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '4': [
    [0,0,0,1,0],
    [0,0,1,1,0],
    [0,1,0,1,0],
    [1,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
  ],
  '5': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '6': [
    [0,1,1,1,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '7': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  '8': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '9': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
  ],
  ':': [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
  ],
  '/': [
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
  ],
}

function getBeijingTime() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 8 * 3600000)
}

function formatDate(d: Date) {
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${month}/${day}`
}

function PixelRow({ chars, containerWidth }: { chars: string[]; containerWidth: number }) {
  // Calculate cell size to fill container width
  // Each char = 5 cells + 4 gaps (gap = 0.2*cell)
  // Char spacing = 0.6*cell between chars
  // total = n*(5*c + 4*0.2*c) + (n-1)*0.6*c = n*5.8*c + (n-1)*0.6*c
  const n = chars.length
  const cellSize = containerWidth / (n * 5.8 + (n - 1) * 0.6)
  const gap = Math.max(1, Math.round(cellSize * 0.2))
  const charGap = Math.max(2, Math.round(cellSize * 0.6))
  const charWidth = 5 * cellSize + 4 * gap
  const totalHeight = 7 * cellSize + 6 * gap

  let offsetX = 0
  const elements: React.ReactNode[] = []
  chars.forEach((char, ci) => {
    const matrix = DIGIT_MAP[char] || DIGIT_MAP['0']
    matrix.forEach((row, ry) => {
      row.forEach((val, rx) => {
        elements.push(
          <div
            key={`${ci}-${ry}-${rx}`}
            className={`px-cell ${val ? 'px-on' : 'px-off'}`}
            style={{
              left: offsetX + rx * (cellSize + gap),
              top: ry * (cellSize + gap),
              width: cellSize,
              height: cellSize,
            }}
          />
        )
      })
    })
    offsetX += charWidth + charGap
  })

  return (
    <div className="pixel-row" style={{ position: 'relative', width: '100%', height: totalHeight }}>
      {elements}
    </div>
  )
}

export default function PixelClock() {
  const [time, setTime] = useState(getBeijingTime)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(300)

  useEffect(() => {
    const id = setInterval(() => setTime(getBeijingTime()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function resize() {
      setContainerWidth(el!.clientWidth - 44) // subtract padding
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const h = time.getHours().toString().padStart(2, '0')
  const m = time.getMinutes().toString().padStart(2, '0')
  const s = time.getSeconds().toString().padStart(2, '0')
  const dateStr = formatDate(time)

  return (
    <div className="widget-card">
      <div className="widget-header">
        <span className="widget-kicker">像素时钟</span>
        <span className="widget-sub">北京 · UTC+8</span>
      </div>
      <div className="pixel-clock-body" ref={containerRef}>
        <PixelRow chars={dateStr.split('')} containerWidth={containerWidth} />
        <PixelRow chars={`${h}:${m}:${s}`.split('')} containerWidth={containerWidth} />
      </div>
    </div>
  )
}
