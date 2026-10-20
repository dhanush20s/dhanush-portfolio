import { about, marquee } from '../data/content'
import { Counter } from '../components/Counter'
import { Marquee } from '../components/Marquee'
import { FadeIn, TextReveal } from '../components/Reveal'

export function About() {
  return (
    <>
      <section className="section shell" id="about" data-stage="1">
        <header className="section__head">
          <div>
            <span className="eyebrow">{about.eyebrow}</span>
            <TextReveal text={about.title} as="h2" className="section__title" />
          </div>
          <span className="section__index">01 / 05</span>
        </header>

        <div className="about__grid">
          <FadeIn className="about__body" stagger={0.12}>
            {about.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </FadeIn>

          <FadeIn className="about__side" stagger={0.14} y={32}>
            <div className="stats">
              {about.stats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat__value">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="stat__label">{stat.label}</div>
                </div>
              ))}
            </div>

            <dl className="now">
              {about.now.map((row) => (
                <div className="now__row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>

        <FadeIn className="pillars" stagger={0.12} y={40}>
          {about.pillars.map((pillar, i) => (
            <article className="pillar" key={pillar.title}>
              <span className="pillar__no">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="pillar__title">{pillar.title}</h3>
              <p className="pillar__text">{pillar.text}</p>
            </article>
          ))}
        </FadeIn>
      </section>

      <Marquee items={marquee} />
    </>
  )
}
