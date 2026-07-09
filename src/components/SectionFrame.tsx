import { useReveal } from '../hooks/useReveal'

interface SectionFrameProps {
  id: string
  index: string
  label: string
  title: string
  children: React.ReactNode
  className?: string
}

export default function SectionFrame({
  id,
  index,
  label,
  title,
  children,
  className = '',
}: SectionFrameProps) {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      id={id}
      ref={ref}
      className={`section-frame reveal ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <header className="section-frame-head">
        <div className="section-frame-meta">
          <span className="section-frame-index">{index}</span>
          <span className="section-frame-label">{label}</span>
        </div>
        <h2 id={`${id}-title`} className="section-frame-title">
          {title}
        </h2>
      </header>
      <div className="section-frame-body">{children}</div>
    </section>
  )
}
