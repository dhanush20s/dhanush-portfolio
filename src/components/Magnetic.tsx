import { ReactElement, cloneElement, useEffect, useRef } from 'react'
import gsap from 'gsap'

import { scene } from '../lib/store'

type Props = {
  children: ReactElement
  /** How far the element is allowed to chase the cursor, in px. */
  strength?: number
}

/**
 * Magnetic hover: the element drifts toward the cursor while it's inside, then
 * springs back on leave. Disabled for coarse pointers and reduced motion.
 */
export function Magnetic({ children, strength = 22 }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (scene.reducedMotion) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const quickX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const quickY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      quickX(gsap.utils.clamp(-1, 1, dx) * strength)
      quickY(gsap.utils.clamp(-1, 1, dy) * strength)
    }

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)

    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(el)
    }
  }, [strength])

  return cloneElement(children, { ref })
}
