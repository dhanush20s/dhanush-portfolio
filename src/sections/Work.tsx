import { useCallback } from 'react'

import { projects, type Project } from '../data/content'
import { FadeIn, TextReveal } from '../components/Reveal'

function ProjectRow({ project, index }: { project: Project; index: number }) {
  // Feeding the pointer position into CSS custom properties lets the radial
  // glow follow the cursor without a single React render per mousemove.
  const onMove = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  return (
    <a
      className="project"
      href={project.href}
      onPointerMove={onMove}
      style={{ ['--hue' as string]: project.hue }}
      data-cursor="View"
      target={project.href.startsWith('http') ? '_blank' : undefined}
      rel={project.href.startsWith('http') ? 'noreferrer' : undefined}
    >
      <span className="project__index">{String(index + 1).padStart(2, '0')}</span>

      <div>
        <h3 className="project__title">{project.title}</h3>
        <div className="project__sub">
          <span>{project.year}</span>
          <span>·</span>
          <span>{project.role}</span>
        </div>
      </div>

      <div>
        <p className="project__blurb">{project.blurb}</p>
        <div className="project__stack">
          {project.stack.map((tech) => (
            <span className="project__chip" key={tech}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      <span className="project__arrow" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d="M3 12L12 3M12 3H5.5M12 3V9.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  )
}

export function Work() {
  return (
    <section className="section shell" id="work" data-stage="2">
      <header className="section__head">
        <div>
          <span className="eyebrow">Selected work</span>
          <TextReveal text="Things I have shipped." as="h2" className="section__title" />
        </div>
        <span className="section__index">02 / 04</span>
      </header>

      <FadeIn className="work__list" stagger={0.1} y={56}>
        {projects.map((project, i) => (
          <ProjectRow key={project.title} project={project} index={i} />
        ))}
      </FadeIn>
    </section>
  )
}
