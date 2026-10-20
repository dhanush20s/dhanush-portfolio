import { useCallback, useEffect, useRef, useState } from 'react'

import { person, socials } from '../data/content'
import { Magnetic } from '../components/Magnetic'
import { FadeIn, TextReveal } from '../components/Reveal'

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M3 12L12 3M12 3H5.5M12 3V9.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(person.email)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked (insecure origin, permissions). Fall back to
      // opening the mail client, which is the same intent.
      window.location.href = `mailto:${person.email}`
    }
  }, [])

  return (
    <section className="section contact shell" id="contact" data-stage="4">
      <span className="eyebrow">Contact</span>

      <h2 className="contact__lead">
        <TextReveal text="Let’s build" as="span" stagger={0.06} />{' '}
        <em>
          <TextReveal text="something" as="span" stagger={0.06} delay={0.1} />
        </em>{' '}
        <TextReveal text="great." as="span" stagger={0.06} delay={0.2} />
      </h2>

      <FadeIn delay={0.2} y={36}>
        <div className="ccard">
          <div className="ccard__top">
            <span className="ccard__status">
              <i aria-hidden="true" />
              {person.status}
            </span>
            <span className="ccard__tz">Timezone: {person.timezone}</span>
          </div>

          <p className="ccard__text">{person.contactPitch}</p>

          <div className="ccard__actions">
            <Magnetic strength={12}>
              <a className="ccard__btn ccard__btn--primary" href={`mailto:${person.email}`} data-cursor="Write">
                Send an email <Arrow />
              </a>
            </Magnetic>

            <button className="ccard__btn" onClick={copyEmail} data-cursor="Copy">
              {copied ? 'Copied ✓' : `Copy: ${person.email}`}
            </button>

            <a className="ccard__btn" href={person.phoneHref} data-cursor="Call">
              Call: {person.phone}
            </a>
          </div>

          <div className="ccard__links">
            <span className="ccard__links-label">Find me online //</span>
            <div>
              {socials.map((social) => (
                <a
                  className="ccard__link"
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Open"
                >
                  {social.label} <Arrow />
                </a>
              ))}
              <a className="ccard__link" href={person.resumeUrl} download data-cursor="Download">
                Resume <Arrow />
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
