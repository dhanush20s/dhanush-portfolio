import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const SHARD_COUNT = 28

type Shard = {
  id: number
  clipPath: string
  originX: number
  originY: number
}

function generateShards(W: number, H: number): Shard[] {
  const shards: Shard[] = []

  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < SHARD_COUNT * 2; i++) {
    pts.push({ x: Math.random() * W, y: Math.random() * H })
  }

  for (let i = 0; i < SHARD_COUNT; i++) {
    const a = pts[i * 2]
    const b = pts[i * 2 + 1]
    const c = {
      x: (a.x + b.x) / 2 + (Math.random() - 0.5) * W * 0.3,
      y: (a.y + b.y) / 2 + (Math.random() - 0.5) * H * 0.3,
    }

    shards.push({
      id: i,
      clipPath: `polygon(${a.x}px ${a.y}px, ${b.x}px ${b.y}px, ${c.x}px ${c.y}px)`,
      originX: (a.x + b.x + c.x) / 3,
      originY: (a.y + b.y + c.y) / 3,
    })
  }

  return shards
}

type GlassShatterProps = {
  src: string
  caption: string
  onClose: () => void
}

export default function GlassShatter({ src, caption, onClose }: GlassShatterProps) {
  const overlay = useRef<HTMLDivElement>(null)
  const shardsWrap = useRef<HTMLDivElement>(null)
  const fullImage = useRef<HTMLDivElement>(null)
  const [shards] = useState(() => generateShards(400, 300))
  const animating = useRef(false)

  const animateOut = useCallback(() => {
    if (animating.current) return
    animating.current = true

    const els = shardsWrap.current?.querySelectorAll('.shard')
    if (!els) return

    gsap.to(els, {
      x: (i) => (Math.random() - 0.5) * window.innerWidth * 1.8,
      y: (i) => (Math.random() - 0.5) * window.innerHeight * 1.8,
      rotation: (i) => (Math.random() - 0.5) * 720,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.in',
      stagger: 0.012,
      onComplete: () => {
        if (fullImage.current) {
          gsap.fromTo(fullImage.current,
            { opacity: 0, scale: 0.92 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
          )
        }
      },
    })
  }, [])

  const animateIn = useCallback(() => {
    if (fullImage.current) {
      gsap.to(fullImage.current, {
        opacity: 0,
        scale: 1.08,
        duration: 0.35,
        ease: 'power2.in',
      })
    }

    const els = shardsWrap.current?.querySelectorAll('.shard')
    if (!els) {
      onClose()
      return
    }

    gsap.to(els, {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.01,
      onComplete: onClose,
    })
  }, [onClose])

  useEffect(() => {
    const timer = setTimeout(animateOut, 80)
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') animateIn()
    }
    window.addEventListener('keydown', keyHandler)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', keyHandler)
    }
  }, [animateOut, animateIn])

  return (
    <div className="shatter-overlay" ref={overlay} onClick={animateIn}>
      {/* Shards layer */}
      <div className="shards-wrap" ref={shardsWrap}>
        {shards.map((shard) => (
          <div
            key={shard.id}
            className="shard"
            style={{
              clipPath: shard.clipPath,
              backgroundImage: `url(${src})`,
              backgroundSize: '400px 300px',
              backgroundPosition: '0 0',
              transformOrigin: `${shard.originX}px ${shard.originY}px`,
            }}
          />
        ))}
      </div>

      {/* Full image */}
      <div className="shatter-full" ref={fullImage}>
        <img src={src} alt={caption} />
        <span className="shatter-caption">{caption}</span>
      </div>

      <button className="shatter-close" onClick={(e) => { e.stopPropagation(); animateIn() }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}