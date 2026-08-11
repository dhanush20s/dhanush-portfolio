import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import { scene } from '../lib/store'

/**
 * Custom cursor: a hard dot that tracks 1:1 and a ring that lags behind.
 * `mix-blend-mode: difference` means it stays legible over any background
 * without us tracking what's underneath.
 *
 * Anything with `data-cursor="<label>"` swells the ring and prints that label.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (scene.reducedMotion) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    document.body.classList.add('has-custom-cursor')

    const dotX = gsap.quickTo(dot.current!, 'x', { duration: 0.08, ease: 'none' })
    const dotY = gsap.quickTo(dot.current!, 'y', { duration: 0.08, ease: 'none' })
    const ringX = gsap.quickTo(ring.current!, 'x', { duration: 0.5, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring.current!, 'y', { duration: 0.5, ease: 'power3.out' })

    // Both elements start hidden at the origin; showing them before the first
    // real pointer event parks a stray dot in the top-left corner.
    let live = false

    const onMove = (e: PointerEvent) => {
      if (!live) {
        live = true
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY })
        gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.4 })
      }
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e: PointerEvent) => {
      const hit = (e.target as HTMLElement | null)?.closest?.('[data-cursor]')
      setLabel(hit ? (hit as HTMLElement).dataset.cursor || '' : null)
    }

    const onDown = () => gsap.to(ring.current, { scale: 0.72, duration: 0.2 })
    const onUp = () => gsap.to(ring.current, { scale: 1, duration: 0.4, ease: 'back.out(2)' })

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      document.body.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={dot} aria-hidden="true">
        <div className="cursor__dot" />
      </div>
      <div className={`cursor ${label !== null ? 'is-hot' : ''}`} ref={ring} aria-hidden="true">
        <div className="cursor__ring" />
        <div className="cursor__label">{label}</div>
      </div>
    </>
  )
}
