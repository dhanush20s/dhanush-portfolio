import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import { scene } from '../lib/store'

/**
 * Infinite marquee. Two identical tracks translate leftward; when the first has
 * moved its own width, the modulo wrap puts it back with no visible seam.
 * Speed is nudged by scroll velocity so the band feels attached to the page.
 */
export function Marquee({ items, speed = 60 }: { items: string[]; speed?: number }) {
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return

    const track = el.querySelector<HTMLElement>('.marquee__track')
    if (!track) return

    let offset = 0
    let lastScroll = scene.scroll

    const tick = () => {
      const width = track.offsetWidth
      if (!width) return

      const dt = gsap.ticker.deltaRatio() / 60
      const scrollDelta = scene.scroll - lastScroll
      lastScroll = scene.scroll

      // Base drift plus a kick proportional to how fast the page is moving.
      const boost = scene.reducedMotion ? 0 : scrollDelta * 9000
      offset = (offset + speed * dt + boost) % width

      el.style.setProperty('--shift', `${-offset}px`)
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [speed])

  const row = (key: string) => (
    <div className="marquee__track" key={key} style={{ transform: 'translateX(var(--shift, 0px))' }}>
      {items.map((item, i) => (
        <span className="marquee__item" key={`${key}-${i}`}>
          {item}
        </span>
      ))}
    </div>
  )

  return (
    <div className="marquee" ref={wrap} aria-hidden="true">
      {row('a')}
      {row('b')}
    </div>
  )
}
