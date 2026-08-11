import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { person } from '../data/content'
import { FadeIn, TextReveal } from '../components/Reveal'
import { scene } from '../lib/store'

/** Cycles the role words with a masked vertical slide. */
function RoleCycler({ roles }: { roles: string[] }) {
  const [i, setI] = useState(0)
  const el = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (roles.length < 2) return

    const id = window.setInterval(() => {
      if (scene.reducedMotion) {
        setI((v) => (v + 1) % roles.length)
        return
      }

      gsap.to(el.current, {
        yPercent: -100,
        opacity: 0,
        duration: 0.45,
        ease: 'power3.in',
        onComplete: () => {
          setI((v) => (v + 1) % roles.length)
          gsap.fromTo(
            el.current,
            { yPercent: 100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' },
          )
        },
      })
    }, 2600)

    return () => window.clearInterval(id)
  }, [roles.length])

  return (
    <span className="hero__roles">
      <span className="hero__role" ref={el}>
        {roles[i]}
      </span>
    </span>
  )
}

/**
 * The preloader owns the first ~2.4s. Hero animations are offset past it so the
 * reveal lands the moment the wipe clears, not underneath it.
 */
const AFTER_PRELOADER = 2.3

export function Hero() {
  const accent = person.nameAccent.trim()

  return (
    <section className="section hero shell" id="index" data-stage="0">
      <div className="hero__tag">
        <TextReveal
          text={person.tag}
          className="eyebrow"
          immediate
          delay={AFTER_PRELOADER}
          stagger={0.02}
        />
      </div>

      <h1 className="hero__name">
        <TextReveal
          text={person.name}
          as="span"
          immediate
          delay={AFTER_PRELOADER + 0.12}
          stagger={0.05}
        />
        {accent && (
          <>
            {' '}
            <em>
              <TextReveal
                text={accent}
                as="span"
                immediate
                delay={AFTER_PRELOADER + 0.22}
                stagger={0.05}
              />
            </em>
          </>
        )}
      </h1>

      <FadeIn className="hero__foot" delay={AFTER_PRELOADER + 0.45} y={26}>
        <div>
          <p className="hero__headline">{person.headline}</p>
          <div className="hero__scroll">
            <span>Scroll</span>
            <span />
          </div>
        </div>

        <div className="hero__meta">
          <span>
            <RoleCycler roles={person.roles} />
          </span>
          <span>{person.location}</span>
          <span>{person.availability}</span>
        </div>
      </FadeIn>
    </section>
  )
}
