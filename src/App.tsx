import './styles/themes.css'
import './styles/theme-switcher.css'
import './styles/clock.css'
import './styles/vinyl.css'
import './styles/terminal.css'
import './styles/widgets.css'
import './App.css'

import ParticleCanvas from './components/ParticleCanvas'
import ThemeSwitcher from './components/ThemeSwitcher'
import Typewriter from './components/Typewriter'
import Clock from './components/Clock'
import VinylPlayer from './components/VinylPlayer'
import Terminal from './components/Terminal'
import GameOfLife from './components/GameOfLife'
import PixelClock from './components/PixelClock'
import Snake from './components/Snake'
import { contactLinks, profile, typewriterPhrases } from './siteData'

function App() {
  const year = new Date().getFullYear()

  return (
    <>
      <ParticleCanvas />

      <div className="page-shell">
        <header className="topbar">
          <a className="brand" href="#hero">
            <span className="brand-mark" aria-hidden="true">//</span>
            <span>{profile.name}</span>
          </a>
          <nav className="topnav" aria-label="Primary">
            <a href="#terminal">终端</a>
            <a href="#playground">游乐场</a>
            <a href="#contact">联系</a>
          </nav>
          <ThemeSwitcher />
        </header>

        <main>
          {/* Hero */}
          <section className="hero-panel" id="hero">
            <div className="hero-copy">
              <p className="eyebrow">{profile.eyebrow}</p>
              <h1>
                <Typewriter phrases={typewriterPhrases} />
              </h1>
              <p className="hero-text">{profile.summary}</p>
              <div className="hero-actions">
                <a className="primary-action" href={profile.primaryLink}>
                  GitHub 主页
                </a>
                <a className="secondary-action" href={profile.secondaryLink}>
                  探索游乐场
                </a>
              </div>
            </div>

            <aside className="hero-stack" aria-label="Live info">
              <Clock />
              <VinylPlayer />
            </aside>
          </section>

          {/* Terminal */}
          <section className="section-block terminal-section" id="terminal">
            <div className="section-heading">
              <p className="section-kicker">终端</p>
              <h2>输入点什么，看看会发生什么。</h2>
            </div>
            <Terminal />
          </section>

          {/* Playground */}
          <section className="section-block" id="playground">
            <div className="section-heading">
              <p className="section-kicker">游乐场</p>
              <h2>交互实验与无用之美。</h2>
            </div>
            <div className="playground-grid">
              <GameOfLife />
              <PixelClock />
            </div>
            <div className="playground-full">
              <Snake />
            </div>
          </section>

          {/* Contact */}
          <section className="contact-panel" id="contact">
            <div>
              <p className="section-kicker">联系</p>
              <h2>在互联网上找到我。</h2>
            </div>
            <div className="contact-links">
              {contactLinks.map((link) => (
                <a href={link.href} key={link.label} target="_blank" rel="noreferrer">
                  <span>{link.label}</span>
                  <strong>{link.value}</strong>
                </a>
              ))}
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <p>{profile.footerNote}</p>
          <span>{year}</span>
        </footer>
      </div>
    </>
  )
}

export default App
