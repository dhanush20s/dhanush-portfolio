import gsap from 'gsap'

import { scene } from './store'

/**
 * Pointer tracking, smoothed once in a single ticker so every consumer (the
 * particle sim, the backdrop, the cursor) reads the same value on a frame.
 */
export function initPointer(): () => void {
  const onMove = (e: PointerEvent) => {
    scene.pointerActive = true
    scene.pointerTarget.x = (e.clientX / window.innerWidth) * 2 - 1
    scene.pointerTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }

  const onLeave = () => {
    // Not just re-centring: a "pointer" parked at the centre would sit inside
    // the particle cloud and repel it from within.
    scene.pointerActive = false
    scene.pointerTarget.x = 0
    scene.pointerTarget.y = 0
  }

  const onDown = () => {
    scene.burst = 1
  }

  const tick = () => {
    // Frame-rate independent exponential smoothing.
    const k = 1 - Math.pow(0.001, gsap.ticker.deltaRatio() / 60)
    scene.pointer.x += (scene.pointerTarget.x - scene.pointer.x) * k
    scene.pointer.y += (scene.pointerTarget.y - scene.pointer.y) * k
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerleave', onLeave)
  gsap.ticker.add(tick)

  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerleave', onLeave)
    gsap.ticker.remove(tick)
  }
}
