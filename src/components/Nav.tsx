import { useEffect, useState } from 'react'

import { person } from '../data/content'
import { scrollToId } from '../lib/scroll'
import { Magnetic } from './Magnetic'

const SCROLL_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'stack', label: 'Stack' },
  { id: 'work', label: 'Work' },
  { id: 'path', label: 'Path' },
  { id: 'contact', label: 'Contact' },
]

export function Nav() {
  const [active, setActive] = useState<string | null>(null)

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
        onClick={() => scrollToId('index')}
        data-cursor="Top"
        aria-label="Dhanush, back to top"
      >
        <span>{person.wordmark}</span>
      </button>

      <div className="nav__links">
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
      </div>
    </nav>
  )
}
