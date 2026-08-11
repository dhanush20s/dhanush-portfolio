import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { experience } from '../data/content'
import { FadeIn, TextReveal } from '../components/Reveal'
import { scene } from '../lib/store'

gsap.registerPlugin(ScrollTrigger)

export function Path() {
  const timeline = useRef<HTMLDivElement>(null!)
  const progress = useRef<HTMLDivElement>(null!)

  useLayoutEffect(() => {
    if (scene.reducedMotion) {
      gsap.set(progress.current, { scaleY: 1 })
      return
    }

    const ctx = gsap.context(() => {
      // The vertical line fills as the section passes through the viewport.
      gsap.fromTo(
        progress.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timeline.current,
            start: 'top 72%',
            end: 'bottom 82%',
            scrub: 0.6,
          },
        },
      )
    }, timeline)

    return () => ctx.revert()
  }, [])

  return (
    <section className="section shell" id="path">
      <header className="section__head">
        <div>
          <span className="eyebrow">Path</span>
          <TextReveal text="Where I have been." as="h2" className="section__title" />
        </div>
        <span className="section__index">03 / 04</span>
      </header>

      <div className="timeline" ref={timeline}>
        <div className="timeline__progress" ref={progress} />

        <FadeIn stagger={0.14} y={48}>
          {experience.map((job) => (
            <article className="job" key={job.company + job.period}>
              <div className="job__period">{job.period}</div>
              <div>
                <h3 className="job__company">{job.company}</h3>
                <div className="job__role">{job.role}</div>
                <p className="job__detail">{job.detail}</p>
              </div>
            </article>
          ))}
        </FadeIn>
      </div>
    </section>
  )
}
