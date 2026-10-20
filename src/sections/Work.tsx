import { useCallback, useEffect, useState } from 'react'

import { projects, type Project } from '../data/content'
import { FadeIn, TextReveal } from '../components/Reveal'

type Filter = 'all' | Project['category']

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All projects' },
  { id: 'independent', label: 'Independent · live' },
  { id: 'professional', label: 'Professional' },
]

const KIND_LABEL: Record<Project['category'], string> = {
  independent: 'Production system',
  professional: 'Enterprise app',
}

function countFor(filter: Filter) {
  return filter === 'all' ? projects.length : projects.filter((p) => p.category === filter).length
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  // Feeding the pointer position into CSS custom properties lets the radial
  // glow follow the cursor without a single React render per mousemove.
  const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  // Projects without a public link (client apps) render as a plain card.
  const hasLink = project.href.startsWith('http')
  const Card = (hasLink ? 'a' : 'article') as 'a'

  return (
    <Card
      className={`wcard ${hasLink ? 'is-link' : ''}`}
      href={hasLink ? project.href : undefined}
      onPointerMove={onMove}
      style={{ ['--hue' as string]: project.hue, ['--i' as string]: index }}
      data-cursor={hasLink ? 'Visit' : undefined}
      target={hasLink ? '_blank' : undefined}
      rel={hasLink ? 'noreferrer' : undefined}
    >
      <div className="wcard__meta">
        <span>
          <b>{String(index + 1).padStart(2, '0')}</b> {KIND_LABEL[project.category]}
        </span>
        <span>{project.year}</span>
      </div>

      <div className="wcard__body">
        <div>
          <h3 className="wcard__title">{project.title}</h3>
          <p className="wcard__role">{project.role}</p>
        </div>

        <div>
          <p className="wcard__blurb">{project.blurb}</p>
          <div className="wcard__stack">
            {project.stack.map((tech) => (
              <span className="wcard__chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="wcard__foot">
        <span className={hasLink ? 'wcard__live' : ''}>
          {hasLink ? 'Launch live site' : 'Delivered at RapidData Technologies'}
        </span>
        {hasLink && (
          <span className="wcard__arrow" aria-hidden="true">
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
        )}
      </div>
    </Card>
  )
}

export function Work() {
  const [filter, setFilter] = useState<Filter>('all')
  const shown = projects.filter((p) => filter === 'all' || p.category === filter)

  // Filtering changes the page height. Scroll triggers and the particle stage
  // anchors are measured once, so without a re-measure the sections below
  // (Path, Contact) would reveal at their old, now-wrong positions.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
    return () => cancelAnimationFrame(id)
  }, [filter])

  return (
    <section className="section shell" id="work" data-stage="2">
      <header className="section__head">
        <div>
          <span className="eyebrow">Selected work</span>
          <TextReveal text="Products I have built & shipped." as="h2" className="section__title" />
        </div>
        <span className="section__index">03 / 05</span>
      </header>

      <div className="wfilter">
        <div className="wfilter__tabs" role="tablist" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              className={`wfilter__tab ${filter === f.id ? 'is-active' : ''}`}
              onClick={() => setFilter(f.id)}
              data-cursor="Filter"
            >
              {f.label}
              <span>{countFor(f.id)}</span>
            </button>
          ))}
        </div>
        <span className="wfilter__count">
          <i aria-hidden="true" />
          Showing {shown.length} of {projects.length} projects
        </span>
      </div>

      <FadeIn y={48}>
        {/* Keyed by filter so the cards replay their rise on every switch. */}
        <div className="wlist" key={filter}>
          {shown.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </FadeIn>
    </section>
  )
}
