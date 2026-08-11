import { person, socials } from '../data/content'
import { Magnetic } from '../components/Magnetic'
import { FadeIn, TextReveal } from '../components/Reveal'

export function Contact() {
  return (
    <section className="section contact shell" id="contact" data-stage="4">
      <span className="eyebrow">Contact</span>

      <h2 className="contact__lead">
        <TextReveal text="Let us build" as="span" stagger={0.06} />{' '}
        <em>
          <TextReveal text="something" as="span" stagger={0.06} delay={0.1} />
        </em>{' '}
        <TextReveal text="loud." as="span" stagger={0.06} delay={0.2} />
      </h2>

      <FadeIn delay={0.25}>
        <Magnetic strength={16}>
          <a className="contact__mail" href={`mailto:${person.email}`} data-cursor="Write">
            <span>{person.email}</span>
            <svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path
                d="M3 12L12 3M12 3H5.5M12 3V9.5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Magnetic>
      </FadeIn>

      <FadeIn className="contact__socials" stagger={0.08} y={22}>
        {socials.map((social) => (
          <a
            className="contact__social"
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            data-cursor="Open"
          >
            {social.label}
          </a>
        ))}
      </FadeIn>
    </section>
  )
}
