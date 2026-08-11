import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { scene } from '../lib/store'
import { startScroll, stopScroll } from '../lib/scroll'

/**
 * Entry sequence. Counts up, wipes away, and ramps `scene.intro` so the
 * particle field materialises in step with the DOM rather than after it.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null!)
  const fill = useRef<HTMLDivElement>(null!)
  const wipe = useRef<HTMLDivElement>(null!)
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    stopScroll()
    window.scrollTo(0, 0)

    const counter = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        setGone(true)
        startScroll()
        onDone()
      },
    })

    const fast = scene.reducedMotion

    tl.to(counter, {
      v: 100,
      duration: fast ? 0.3 : 1.9,
      ease: 'power2.inOut',
      onUpdate: () => setPct(Math.round(counter.v)),
    })
      .fromTo(
        fill.current,
        { xPercent: -100 },
        { xPercent: 0, duration: fast ? 0.3 : 1.9, ease: 'power2.inOut' },
        0,
      )
      // Particles start their collapse while the counter is still running, so
      // the reveal lands on an already-forming cloud instead of an empty stage.
      .to(scene, { intro: 1, duration: fast ? 0.3 : 2.4, ease: 'power2.out' }, 0.45)
      .to(root.current, { opacity: 0, duration: 0.5, ease: 'power2.in' }, '>-0.1')
      .fromTo(
        wipe.current,
        { scaleY: 1 },
        { scaleY: 0, duration: fast ? 0.2 : 1.0, ease: 'expo.inOut', transformOrigin: 'top' },
        '<0.1',
      )

    return () => {
      tl.kill()
      startScroll()
    }
  }, [onDone])

  if (gone) return null

  return (
    <>
      <div className="preloader" ref={root}>
        <div className="preloader__inner">
          <div className="preloader__row">
            <span>Initialising</span>
            <span>WebGL / GPGPU</span>
          </div>
          <div className="preloader__count">{String(pct).padStart(3, '0')}</div>
          <div className="preloader__bar">
            <div className="preloader__fill" ref={fill} style={{ inset: 0 }} />
          </div>
        </div>
      </div>
      <div className="preloader__wipe" ref={wipe} />
    </>
  )
}
