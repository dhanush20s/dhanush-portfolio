import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { scene } from './store'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

/** Section tops, cached — recomputed on resize rather than on every scroll tick. */
let anchors: number[] = []

function measure() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'))
  anchors = els
    .sort((a, b) => Number(a.dataset.stage) - Number(b.dataset.stage))
    .map((el) => el.getBoundingClientRect().top + window.scrollY)
}

/** Hermite smoothstep with a dead zone below `e0` and above `e1`. */
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/**
 * Maps absolute scroll position onto a fractional "stage" index. The particle
 * field consumes this directly to pick which two shapes to blend.
 *
 * The raw fraction between section tops is remapped through a smoothstep with
 * flat ends on purpose: a linear ramp means a section is *never* showing its
 * own shape cleanly — you'd land on the hero already a third of the way into
 * the next one. The plateau holds each shape while its section is on screen and
 * spends the transition on the gap between them.
 */
function computeStage(y: number): number {
  if (anchors.length < 2) return 0

  // Aim below the viewport top so a section counts as "current" while it
  // actually fills the screen, not the instant its top edge crosses.
  const probe = y + window.innerHeight * 0.4

  const last = anchors.length - 1
  if (probe <= anchors[0]) return 0
  if (probe >= anchors[last]) return last

  for (let i = 0; i < last; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (probe >= a && probe < b) {
      const f = (probe - a) / Math.max(b - a, 1)
      return i + smoothstep(0.45, 0.94, f)
    }
  }
  return last
}

export function initScroll(): () => void {
  measure()

  const onResize = () => {
    measure()
    ScrollTrigger.refresh()
  }

  const publish = (y: number, limit: number) => {
    scene.scroll = limit > 0 ? y / limit : 0
    scene.stage = computeStage(y)
  }

  if (scene.reducedMotion) {
    // No inertia: read native scroll straight through.
    const onScroll = () =>
      publish(window.scrollY, document.body.scrollHeight - window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }

  lenis = new Lenis({
    lerp: 0.085,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
    smoothWheel: true,
  })

  lenis.on('scroll', (e: { scroll: number; limit: number }) => {
    publish(e.scroll, e.limit)
    ScrollTrigger.update()
  })

  // Drive Lenis from GSAP's ticker so both share one rAF and never fight.
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  window.addEventListener('resize', onResize)
  // Fonts and images shift layout after first paint; re-measure once settled.
  const settle = window.setTimeout(onResize, 900)

  return () => {
    gsap.ticker.remove(tick)
    window.removeEventListener('resize', onResize)
    window.clearTimeout(settle)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return

  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export function stopScroll() {
  lenis?.stop()
}

export function startScroll() {
  lenis?.start()
}
