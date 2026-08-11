import { ElementType, ReactNode, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { scene } from '../lib/store'

gsap.registerPlugin(ScrollTrigger)

type TextRevealProps = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  /** Play immediately instead of waiting for the element to scroll into view. */
  immediate?: boolean
}

/**
 * Word-level masked rise.
 *
 * We split on words rather than lines deliberately: real line splitting needs
 * layout measurement and breaks on font swap or resize, whereas each word
 * carrying its own overflow mask survives any reflow.
 */
export function TextReveal({
  text,
  as: Tag = 'div',
  className,
  delay = 0,
  stagger = 0.035,
  immediate = false,
}: TextRevealProps) {
  const root = useRef<HTMLElement>(null!)

  useLayoutEffect(() => {
    const words = root.current?.querySelectorAll('.reveal-char')
    if (!words?.length) return

    if (scene.reducedMotion) {
      gsap.set(words, { yPercent: 0, opacity: 1 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 118, opacity: 0, rotate: 2 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.05,
          ease: 'expo.out',
          stagger,
          delay,
          scrollTrigger: immediate
            ? undefined
            : { trigger: root.current, start: 'top 88%', once: true },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [text, delay, stagger, immediate])

  const words = text.split(' ')

  return (
    <Tag ref={root as never} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="reveal-line"
          style={{ display: 'inline-block', verticalAlign: 'top' }}
        >
          <span className="reveal-char">{word}</span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

type FadeInProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  /** Stagger direct children instead of moving the wrapper as one block. */
  stagger?: number
}

export function FadeIn({ children, className, delay = 0, y = 40, stagger }: FadeInProps) {
  const root = useRef<HTMLDivElement>(null!)

  useLayoutEffect(() => {
    if (scene.reducedMotion) return

    const ctx = gsap.context(() => {
      const targets = stagger ? Array.from(root.current.children) : root.current
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'expo.out',
          delay,
          stagger: stagger ?? 0,
          scrollTrigger: { trigger: root.current, start: 'top 90%', once: true },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [delay, y, stagger])

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  )
}
