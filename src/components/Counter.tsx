import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { scene } from '../lib/store'

gsap.registerPlugin(ScrollTrigger)

/** Counts up to `value` the first time it scrolls into view. */
export function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null!)

  useLayoutEffect(() => {
    const el = ref.current

    if (scene.reducedMotion) {
      el.textContent = `${value}${suffix}`
      return
    }

    const state = { v: 0 }
    const ctx = gsap.context(() => {
      gsap.to(state, {
        v: value,
        duration: 1.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(state.v)}${suffix}`
        },
      })
    })

    return () => ctx.revert()
  }, [value, suffix])

  return <span ref={ref}>0{suffix}</span>
}
