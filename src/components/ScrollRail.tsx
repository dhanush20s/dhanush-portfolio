import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import { scene } from '../lib/store'

/** Thumb height as a percentage of the track. */
const THUMB_PCT = 18

/**
 * Right-hand progress rail. Writes to the DOM imperatively from the ticker —
 * a scroll indicator that re-renders React on every frame would be absurd.
 */
export function ScrollRail() {
  const thumb = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let lastShown = -1

    const tick = () => {
      const p = Math.min(Math.max(scene.scroll, 0), 1)

      // Fixed-height thumb sliding down the remaining track.
      if (thumb.current) {
        thumb.current.style.top = `${p * (100 - THUMB_PCT)}%`
      }

      const shown = Math.round(p * 100)
      if (pct.current && shown !== lastShown) {
        pct.current.textContent = String(shown).padStart(3, '0')
        lastShown = shown
      }
    }

    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  return (
    <div className="rail" aria-hidden="true">
      <div className="rail__track">
        <div className="rail__thumb" ref={thumb} style={{ height: `${THUMB_PCT}%` }} />
      </div>
      <span className="rail__pct" ref={pct}>
        000
      </span>
    </div>
  )
}
