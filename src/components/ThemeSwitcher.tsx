import { useEffect, useState } from 'react'

type Theme = 'default' | 'cyberpunk' | 'retro'

const themes: { id: Theme; label: string; color: string }[] = [
  { id: 'default', label: '默认', color: '#ffd166' },
  { id: 'cyberpunk', label: '赛博朋克', color: '#ff2d7b' },
  { id: 'retro', label: '复古', color: '#e8a838' },
]

export default function ThemeSwitcher() {
  const [active, setActive] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'default'
  })

  useEffect(() => {
    const root = document.documentElement
    if (active === 'default') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', active)
    }
    localStorage.setItem('theme', active)
  }, [active])

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="主题">
      {themes.map((t) => (
        <button
          key={t.id}
          role="radio"
          aria-checked={active === t.id}
          title={t.label}
          className={`theme-dot ${active === t.id ? 'active' : ''}`}
          style={{ '--dot-color': t.color } as React.CSSProperties}
          onClick={() => setActive(t.id)}
        >
          <span className="theme-dot-label">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
