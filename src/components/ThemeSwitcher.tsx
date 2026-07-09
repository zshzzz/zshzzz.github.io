import { useEffect, useState } from 'react'
import {
  applyTheme,
  getActiveTheme,
  readStoredTheme,
  THEMES,
  type Theme,
} from '../lib/theme'

export default function ThemeSwitcher() {
  const [active, setActive] = useState<Theme>(() => readStoredTheme())

  useEffect(() => {
    applyTheme(active)
  }, [active])

  useEffect(() => {
    function onThemeChange(e: Event) {
      const detail = (e as CustomEvent<Theme>).detail
      if (detail) setActive(detail)
      else setActive(getActiveTheme())
    }
    window.addEventListener('themechange', onThemeChange)
    // Sync if theme was set before React mount
    setActive(getActiveTheme())
    return () => window.removeEventListener('themechange', onThemeChange)
  }, [])

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="主题">
      {THEMES.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={active === t.id}
          title={`${t.label} · ${t.desc}`}
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
