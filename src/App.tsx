import './App.css'
import {
  capabilities,
  contactLinks,
  featuredProjects,
  heroStats,
  processSteps,
  profile,
} from './siteData'

function App() {
  const year = new Date().getFullYear()

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#hero">
          <span className="brand-mark" aria-hidden="true">
            //
          </span>
          <span>{profile.name}</span>
        </a>
        <nav className="topnav" aria-label="Primary">
          <a href="#projects">Projects</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero-panel" id="hero">
          <div className="hero-copy">
            <p className="eyebrow">{profile.eyebrow}</p>
            <h1>
              Build a homepage that feels like a{' '}
              <span>trailer for your work</span>.
            </h1>
            <p className="hero-text">{profile.summary}</p>
            <div className="hero-actions">
              <a className="primary-action" href={profile.primaryLink}>
                View GitHub
              </a>
              <a className="secondary-action" href={profile.secondaryLink}>
                Download Resume
              </a>
            </div>
          </div>

          <aside className="hero-stack" aria-label="Profile snapshot">
            <div className="signal-card">
              <p className="signal-label">Current Signal</p>
              <p className="signal-value">{profile.currentFocus}</p>
            </div>
            <div className="status-card">
              <p>{profile.availability}</p>
              <span>{profile.location}</span>
            </div>
            <div className="hero-grid">
              {heroStats.map((item) => (
                <article className="stat-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="section-block" id="projects">
          <div className="section-heading">
            <p className="section-kicker">Selected Work</p>
            <h2>Three showcase slots designed for your strongest builds.</h2>
          </div>
          <div className="project-grid">
            {featuredProjects.map((project) => (
              <article className={`project-card ${project.tone}`} key={project.title}>
                <div className="project-meta">
                  <span>{project.label}</span>
                  <a href={project.href} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul className="tag-list" aria-label={`${project.title} tech`}>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block capabilities-block" id="capabilities">
          <div className="section-heading">
            <p className="section-kicker">Capabilities</p>
            <h2>Show depth without turning the page into a resume dump.</h2>
          </div>
          <div className="capability-grid">
            {capabilities.map((item) => (
              <article className="capability-card" key={item.title}>
                <p className="capability-index">{item.index}</p>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block process-block">
          <div className="section-heading">
            <p className="section-kicker">Build Narrative</p>
            <h2>One clean story arc from taste to execution.</h2>
          </div>
          <div className="timeline">
            {processSteps.map((step) => (
              <article className="timeline-item" key={step.phase}>
                <span className="timeline-phase">{step.phase}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-panel" id="contact">
          <div>
            <p className="section-kicker">Contact</p>
            <h2>{profile.contactTitle}</h2>
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
  )
}

export default App
