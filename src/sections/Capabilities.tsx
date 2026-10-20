import { useCallback, useEffect, useRef, useState } from 'react'

import { capabilities, type Capability } from '../data/content'
import { FadeIn, TextReveal } from '../components/Reveal'

const ICONS: Record<Capability['icon'], JSX.Element> = {
  mobile: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="4" width="18" height="6.5" rx="2" />
      <rect x="3" y="13.5" width="18" height="6.5" rx="2" />
      <path d="M7 7.25h.01M7 16.75h.01" />
    </>
  ),
  cloud: (
    <>
      <ellipse cx="12" cy="6" rx="7.5" ry="3" />
      <path d="M4.5 6v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3V6" />
      <path d="M4.5 12v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
}

function Icon({ name }: { name: Capability['icon'] }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d={dir === 'right' ? 'M2.5 7.5h10M8.5 3.5l4 4-4 4' : 'M12.5 7.5h-10M6.5 3.5l-4 4 4 4'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Capabilities() {
  const [active, setActive] = useState(0)
  const track = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  /** Brings a card to the centre of the track (a no-op when all four fit). */
  const reveal = useCallback((i: number) => {
    const el = track.current
    const card = el?.children[i] as HTMLElement | undefined
    if (!el || !card || el.scrollWidth <= el.clientWidth + 2) return
    // Scroll the track itself, not the page — scrollIntoView would also move
    // the window vertically.
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [])

  const go = useCallback(
    (i: number) => {
      const next = (i + capabilities.length) % capabilities.length
      setActive(next)
      reveal(next)
    },
    [reveal],
  )

  // When the track scrolls (touch swipe), the card nearest the centre is active.
  useEffect(() => {
    const el = track.current
    if (!el) return

    const onScroll = () => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        if (el.scrollWidth <= el.clientWidth + 2) return
        const mid = el.scrollLeft + el.clientWidth / 2
        let best = 0
        let bestD = Infinity
        Array.from(el.children).forEach((c, i) => {
          const card = c as HTMLElement
          const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid)
          if (d < bestD) {
            bestD = d
            best = i
          }
        })
        setActive(best)
      })
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  return (
    <section className="section shell" id="stack">
      <header className="section__head">
        <div>
          <span className="eyebrow">Capabilities</span>
          <TextReveal text="Interfaces, systems & core stack." as="h2" className="section__title" />
        </div>
        <span className="section__index">02 / 05</span>
      </header>

      <div className="cap__bar">
        <div className="cap__tabs" role="tablist" aria-label="Capability areas">
          {capabilities.map((c, i) => (
            <button
              key={c.title}
              role="tab"
              aria-selected={active === i}
              className={`cap__tab ${active === i ? 'is-active' : ''}`}
              style={{ ['--hue' as string]: c.hue }}
              onClick={() => go(i)}
              data-cursor="Open"
            >
              <span className="cap__tab-no">{String(i + 1).padStart(2, '0')}</span>
              {c.title}
            </button>
          ))}
        </div>

        <div className="cap__nav">
          <button onClick={() => go(active - 1)} aria-label="Previous" data-cursor="Prev">
            <Arrow dir="left" />
          </button>
          <button onClick={() => go(active + 1)} aria-label="Next" data-cursor="Next">
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <FadeIn y={48}>
        <div className="cap__track" ref={track}>
          {capabilities.map((c, i) => (
            <article
              key={c.title}
              className={`cap ${active === i ? 'is-active' : ''}`}
              style={{ ['--hue' as string]: c.hue }}
              onPointerMove={onMove}
              onClick={() => go(i)}
            >
              <div className="cap__top">
                <span className="cap__no">{String(i + 1).padStart(2, '0')}</span>
                <span className="cap__tagline">
                  {c.tagline.map((w) => (
                    <span key={w}>{w}</span>
                  ))}
                </span>
              </div>

              <span className="cap__icon">
                <Icon name={c.icon} />
              </span>

              <h3 className="cap__title">{c.title}</h3>
              <p className="cap__blurb">{c.blurb}</p>

              <ul className="cap__list">
                {c.items.map((item, k) => (
                  <li key={item} style={{ ['--i' as string]: k }}>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="cap__foot">
                <span>{c.items.length} technologies</span>
                <span className="cap__go" aria-hidden="true">
                  <Arrow dir="right" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </FadeIn>
    </section>
  )
}
