import { about, marquee, skills } from '../data/content'
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
          <span className="section__index">01 / 04</span>
        </header>

        <div className="about__grid">
          <FadeIn className="about__body" stagger={0.12}>
            {about.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </FadeIn>

          <FadeIn>
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
          </FadeIn>
        </div>

        <FadeIn className="skills" stagger={0.08}>
          {skills.map((group) => (
            <div className="skills__group" key={group.group}>
              <div className="skills__name">{group.group}</div>
              <ul className="skills__list">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </FadeIn>
      </section>

      <Marquee items={marquee} />
    </>
  )
}
