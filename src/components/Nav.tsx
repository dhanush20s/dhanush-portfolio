import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { person } from '../data/content'
import { scrollToId } from '../lib/scroll'
import { Magnetic } from './Magnetic'

const SCROLL_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'path', label: 'Path' },
  { id: 'contact', label: 'Contact' },
]

export function Nav() {
  const [active, setActive] = useState<string | null>(null)
  const location = useLocation()
  const isPhotography = location.pathname === '/photography'

  useEffect(() => {
    const targets = SCROLL_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (!targets.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <nav className="nav">
      <button
        className="nav__mark"
        onClick={() => (isPhotography ? null : scrollToId('index'))}
        data-cursor="Top"
        aria-label="Back to top"
      >
        {/* <span className="nav__pulse" /> */}
        <span>{person.wordmark}</span>
      </button>

      <div className="nav__links">
        {isPhotography ? (
          <>
            <Magnetic strength={10}>
              <Link className="nav__link" to="/" data-cursor="Home">
                Portfolio
              </Link>
            </Magnetic>
            <Magnetic strength={10}>
              <span className="nav__link is-active">Way of Life</span>
            </Magnetic>
          </>
        ) : (
          <>
            {SCROLL_LINKS.map((link) => (
              <Magnetic key={link.id} strength={10}>
                <button
                  className={`nav__link ${active === link.id ? 'is-active' : ''}`}
                  onClick={() => scrollToId(link.id)}
                  data-cursor={link.label}
                >
                  {link.label}
                </button>
              </Magnetic>
            ))}
            <Magnetic strength={10}>
              <Link className="nav__link" to="/photography" data-cursor="View">
                Way of Life
              </Link>
            </Magnetic>
          </>
        )}
      </div>
    </nav>
  )
}