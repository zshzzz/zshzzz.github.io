import { useCallback, useEffect, useRef, useState } from 'react'
import { hotspots, kineticLines, profile } from '../siteData'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isCoarsePointer() {
  return window.matchMedia('(pointer: coarse)').matches
}

export default function KineticHero() {
  const stageRef = useRef<HTMLElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const [cursorOn, setCursorOn] = useState(false)
  const [cursorBig, setCursorBig] = useState(false)
  const enabledRef = useRef(true)

  useEffect(() => {
    enabledRef.current = !prefersReducedMotion() && !isCoarsePointer()
    setCursorOn(enabledRef.current)
  }, [])

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!enabledRef.current) return
    const stage = stageRef.current
    const cursor = cursorRef.current
    const lines = linesRef.current
    if (!stage || !cursor || !lines) return

    const rect = stage.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`

    const nx = (x / rect.width - 0.5) * 2
    const ny = (y / rect.height - 0.5) * 2
    const children = lines.children
    for (let i = 0; i < children.length; i++) {
      const line = children[i] as HTMLElement
      const dir = i % 2 === 0 ? 1 : -1
      line.style.setProperty('--shift', `${nx * 36 * dir + ny * 8}px`)
    }
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      className={`kinetic-hero ${cursorOn ? 'has-cursor' : ''}`}
      id="installation"
      ref={stageRef}
      onMouseMove={onMove}
      onMouseLeave={() => {
        if (linesRef.current) {
          ;[...linesRef.current.children].forEach((el) => {
            ;(el as HTMLElement).style.setProperty('--shift', '0px')
          })
        }
      }}
      aria-label="Kinetic installation"
    >
      {cursorOn && (
        <div
          ref={cursorRef}
          className={`kinetic-cursor ${cursorBig ? 'big' : ''}`}
          aria-hidden="true"
        />
      )}

      <div className="kinetic-top">
        <span className="kinetic-brand">{profile.name}</span>
        <span className="kinetic-loc">{profile.location}</span>
      </div>

      <div className="kinetic-lines" ref={linesRef} aria-hidden="true">
        {kineticLines.map((line) => (
          <div
            key={line.text}
            className={`kinetic-line ${line.outline ? 'outline' : ''}`}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="kinetic-overlay">
        <p className="kinetic-kicker">{profile.eyebrow}</p>
        <p className="kinetic-lede">{profile.manifesto}</p>
      </div>

      <div className="kinetic-hotspots">
        {hotspots.map((h, i) => (
          <button
            key={h.targetId}
            type="button"
            className={`kinetic-hot kinetic-hot-${i}`}
            onClick={() => scrollTo(h.targetId)}
            onMouseEnter={() => setCursorBig(true)}
            onMouseLeave={() => setCursorBig(false)}
            onFocus={() => setCursorBig(true)}
            onBlur={() => setCursorBig(false)}
          >
            <span className="kinetic-hot-index">0{i + 1}</span>
            <span className="kinetic-hot-label">{h.label}</span>
          </button>
        ))}
      </div>

      <div className="kinetic-scroll-hint" aria-hidden="true">
        <span>Scroll</span>
        <span className="kinetic-scroll-line" />
      </div>
    </section>
  )
}
