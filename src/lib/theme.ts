/** Kinetic mono exhibition — fixed palette, optional ink accent only. */
export type Theme = 'default' | 'ink'

export const THEMES: { id: Theme; label: string; color: string; desc: string }[] = [
  { id: 'default', label: 'Void', color: '#ffffff', desc: '纯黑展览' },
  { id: 'ink', label: 'Ink', color: '#c8ff5a', desc: '一点酸性点缀' },
]

export const THEME_IDS = THEMES.map((t) => t.id)

export function getActiveTheme(): Theme {
  const t = document.documentElement.getAttribute('data-theme')
  if (t === 'ink') return 'ink'
  return 'default'
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'default') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
  localStorage.setItem('theme', theme)
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
}

export function readStoredTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'ink' || stored === 'default') return stored
  // Migrate away from old multi-color themes
  return 'default'
}
