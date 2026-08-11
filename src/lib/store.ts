/**
 * A deliberately tiny mutable store.
 *
 * The render loop reads scroll/pointer state every frame at 60–120Hz. Routing
 * that through React state would re-render the tree on every scroll tick, so
 * instead we keep one mutable object that the DOM layer writes and the WebGL
 * layer reads. Nothing here should ever trigger a React render.
 */

export type SceneState = {
  /** 0..1 across the whole document. */
  scroll: number
  /** Fractional section index, e.g. 1.4 = 40% through section 1. */
  stage: number
  /** When >= 0, overrides the scroll-based stage (used on standalone pages). */
  pinnedStage: number
  /** Normalised pointer, -1..1 on both axes, smoothed. */
  pointer: { x: number; y: number }
  /** False until the pointer has actually moved (touch devices, fresh loads). */
  pointerActive: boolean
  /** Raw pointer target before smoothing. */
  pointerTarget: { x: number; y: number }
  /** Ramps 0 -> 1 once the preloader finishes. */
  intro: number
  /** Spikes to 1 on click, decays. Used for the particle shockwave. */
  burst: number
  /** True when the user asked for less motion. */
  reducedMotion: boolean
  /** Set by the loader once the first frame has rendered. */
  ready: boolean
}

export const scene: SceneState = {
  scroll: 0,
  stage: 0,
  pinnedStage: -1,
  pointer: { x: 0, y: 0 },
  pointerActive: false,
  pointerTarget: { x: 0, y: 0 },
  intro: 0,
  burst: 0,
  reducedMotion: false,
  ready: false,
}

if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  scene.reducedMotion = mq.matches
  mq.addEventListener('change', (e) => {
    scene.reducedMotion = e.matches
  })
}

/** Quality tier, decided once from the device. Drives particle count and DPR. */
export function qualityTier(): 'low' | 'mid' | 'high' {
  if (typeof window === 'undefined') return 'mid'
  const w = window.innerWidth
  const cores = navigator.hardwareConcurrency ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse || w < 768 || cores <= 4) return 'low'
  if (w < 1400 || cores <= 8) return 'mid'
  return 'high'
}

/**
 * Simulation texture edge length — particle count is the square of this.
 * high = 352² ≈ 124k particles.
 */
export const SIM_SIZE = { low: 176, mid: 256, high: 352 } as const
