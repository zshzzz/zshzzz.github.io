import './styles/themes.css'
import './styles/kinetic.css'
import './styles/clock.css'
import './styles/vinyl.css'
import './styles/terminal.css'
import './styles/widgets.css'
import './App.css'

import KineticHero from './components/KineticHero'
import SectionFrame from './components/SectionFrame'
import Terminal from './components/Terminal'
import VinylPlayer from './components/VinylPlayer'
import Clock from './components/Clock'
import GameOfLife from './components/GameOfLife'
import Snake from './components/Snake'
import { applyTheme, getActiveTheme } from './lib/theme'
import { contactLinks, exhibits, profile, sections } from './siteData'
import { useEffect } from 'react'

function App() {
  const year = new Date().getFullYear()

  // Force exhibition mono palette (migrate old colorful themes)
  useEffect(() => {
    const t = getActiveTheme()
    applyTheme(t === 'ink' ? 'ink' : 'default')
  }, [])

  return (
    <div className="exhibit-root">
      <a className="skip-link" href="#note">
        Skip to content
      </a>

      <nav className="corner-nav" aria-label="Chapters">
        <a href="#installation">{profile.name}</a>
        <div className="corner-links">
          <a href="#apparatus">Terminal</a>
          <a href="#music">Sound</a>
          <a href="#exhibits">Play</a>
          <a href="#signal">Contact</a>
        </div>
        <button
          type="button"
          className="accent-toggle"
          title="Toggle ink accent"
          aria-label="Toggle ink accent"
          onClick={() => applyTheme(getActiveTheme() === 'ink' ? 'default' : 'ink')}
        >
          ·
        </button>
      </nav>

      <KineticHero />

      <main className="exhibit-main">
        <SectionFrame
          id="note"
          index={sections.note.index}
          label={sections.note.label}
          title={sections.note.title}
        >
          <div className="note-grid">
            <p className="note-body">{profile.summary}</p>
            <div className="note-aside">
              <span>{profile.location}</span>
              <span className="note-status">
                <i className="note-dot" aria-hidden="true" />
                {profile.status}
              </span>
              <a className="note-link" href={profile.primaryLink} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            </div>
          </div>
        </SectionFrame>

        <SectionFrame
          id="apparatus"
          index={sections.apparatus.index}
          label={sections.apparatus.label}
          title={sections.apparatus.title}
        >
          <p className="section-blurb">
            输入 help。这不是装饰性的假终端——命令是真的。
          </p>
          <Terminal />
        </SectionFrame>

        <SectionFrame
          id="music"
          index={sections.music.index}
          label={sections.music.label}
          title={sections.music.title}
        >
          <div className="music-stage">
            <div className="music-copy">
              <p className="section-blurb">
                WebAudio 合成的房间底噪。点唱片开始；右上角「·」可切换一点酸性点缀。
              </p>
              <Clock />
            </div>
            <VinylPlayer />
          </div>
        </SectionFrame>

        <SectionFrame
          id="exhibits"
          index={sections.exhibits.index}
          label={sections.exhibits.label}
          title={sections.exhibits.title}
        >
          <div className="exhibits-grid">
            <article className="exhibit-slot">
              <header className="exhibit-meta">
                <span className="exhibit-index">{exhibits[0].index}</span>
                <div>
                  <h3>{exhibits[0].title}</h3>
                  <p>{exhibits[0].blurb}</p>
                </div>
              </header>
              <GameOfLife />
            </article>
            <article className="exhibit-slot">
              <header className="exhibit-meta">
                <span className="exhibit-index">{exhibits[1].index}</span>
                <div>
                  <h3>{exhibits[1].title}</h3>
                  <p>{exhibits[1].blurb}</p>
                </div>
              </header>
              <Snake />
            </article>
          </div>
        </SectionFrame>

        <SectionFrame
          id="signal"
          index={sections.signal.index}
          label={sections.signal.label}
          title={sections.signal.title}
        >
          <div className="signal-list">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="signal-row"
              >
                <span>{link.label}</span>
                <strong>{link.value}</strong>
              </a>
            ))}
          </div>
        </SectionFrame>
      </main>

      <footer className="exhibit-footer">
        <p>{profile.footerNote}</p>
        <span>
          © {year} {profile.name}
        </span>
      </footer>
    </div>
  )
}

export default App
