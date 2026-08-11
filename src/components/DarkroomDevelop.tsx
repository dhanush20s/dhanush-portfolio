import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

type DarkroomProps = { src: string; caption: string; onClose: () => void }

type Particle = {
  x: number
  y: number
  tx: number
  ty: number
  ox: number
  oy: number
  color: string
  size: number
  delay: number
}

const PARTICLE_COUNT = 4200

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutExpo(t: number) {
  if (t === 0 || t === 1) return t
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2
}

export default function DarkroomDevelop({ src, caption, onClose }: DarkroomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const raf = useRef(0)
  const startTime = useRef(0)
  const particles = useRef<Particle[]>([])
  const targetRect = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const [revealed, setRevealed] = useState(false)
  const [closing, setClosing] = useState(false)

  const animateClose = useCallback(() => {
    if (closing) return
    setClosing(true)
    cancelAnimationFrame(raf.current)

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: onClose })
    tl.to([captionRef.current, closeRef.current], { autoAlpha: 0, y: -10, duration: 0.18 }, 0)
      .to(wrapRef.current, {
        scale: 0.62,
        rotation: -8,
        filter: 'blur(18px) brightness(1.85) saturate(0)',
        clipPath: 'circle(8% at 50% 50%)',
        duration: 0.42,
      }, 0.02)
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.34 }, 0.16)
  }, [closing, onClose])

  useEffect(() => {
    document.body.classList.add('has-darkroom-open')
    return () => {
      document.body.classList.remove('has-darkroom-open')
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let imageReady = false
    let sourceImage: HTMLImageElement | null = null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (!sourceImage) return

      const maxW = Math.min(window.innerWidth * 0.84, 1180)
      const maxH = window.innerHeight * 0.78
      const aspect = sourceImage.naturalWidth / sourceImage.naturalHeight
      let w = maxW
      let h = w / aspect

      if (h > maxH) {
        h = maxH
        w = h * aspect
      }

      targetRect.current = {
        x: (window.innerWidth - w) / 2,
        y: (window.innerHeight - h) / 2,
        w,
        h,
      }
    }

    const buildParticles = (image: HTMLImageElement) => {
      sourceImage = image
      resize()

      const rect = targetRect.current
      const sampleW = 140
      const sampleH = Math.max(80, Math.round(sampleW / (image.naturalWidth / image.naturalHeight)))
      const sample = document.createElement('canvas')
      const sampleCtx = sample.getContext('2d')!
      sample.width = sampleW
      sample.height = sampleH
      sampleCtx.drawImage(image, 0, 0, sampleW, sampleH)

      const data = sampleCtx.getImageData(0, 0, sampleW, sampleH).data
      const candidates: Particle[] = []
      const step = Math.max(1, Math.floor(Math.sqrt((sampleW * sampleH) / PARTICLE_COUNT)))

      for (let y = 0; y < sampleH; y += step) {
        for (let x = 0; x < sampleW; x += step) {
          const i = (y * sampleW + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          const brightness = (r + g + b) / 3

          if (a < 12 || (brightness < 10 && Math.random() > 0.38)) continue

          const tx = rect.x + (x / sampleW) * rect.w
          const ty = rect.y + (y / sampleH) * rect.h
          const angle = Math.atan2(ty - (rect.y + rect.h / 2), tx - (rect.x + rect.w / 2))
          const distance = Math.min(window.innerWidth, window.innerHeight) * (0.1 + Math.random() * 0.28)
          const orbit = angle + (Math.random() - 0.5) * Math.PI * 1.15

          candidates.push({
            x: tx + Math.cos(orbit) * distance,
            y: ty + Math.sin(orbit) * distance,
            tx,
            ty,
            ox: (Math.random() - 0.5) * 46,
            oy: (Math.random() - 0.5) * 46,
            color: `rgb(${r} ${g} ${b})`,
            size: clamp(0.75 + (brightness / 255) * 1.55 + Math.random() * 0.8, 0.8, 2.7),
            delay: Math.random() * 0.34,
          })
        }
      }

      particles.current = candidates
        .sort(() => Math.random() - 0.5)
        .slice(0, PARTICLE_COUNT)
      imageReady = true
    }

    const image = new Image()
    image.onload = () => buildParticles(image)
    image.src = src

    resize()
    window.addEventListener('resize', resize)

    const loop = (t: number) => {
      if (!startTime.current) startTime.current = t
      const elapsed = (t - startTime.current) / 1000
      const settle = clamp(elapsed / 2.35, 0, 1)
      const imageFade = clamp((settle - 0.96) / 0.04, 0, 1)
      const particleFade = 1 - clamp((settle - 0.9) / 0.1, 0, 1)

      if (wrapRef.current) {
        wrapRef.current.style.setProperty('--develop', `${settle}`)
        wrapRef.current.style.setProperty('--image-opacity', `${easeOutCubic(imageFade)}`)
      }

      if (imgRef.current) {
        const blur = (1 - imageFade) * 10
        imgRef.current.style.filter = `blur(${blur}px) brightness(${0.78 + imageFade * 0.22}) saturate(${1.35 - imageFade * 0.35})`
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.globalCompositeOperation = 'lighter'

      const spin = elapsed * 1.2

      if (imageReady) {
        for (const p of particles.current) {
          const local = clamp((settle - p.delay) / (1 - p.delay), 0, 1)
          const eased = easeInOutExpo(local)
          const swirl = (1 - eased) * 74
          const angle = spin + p.delay * 18
          const x = p.x + (p.tx - p.x) * eased + Math.cos(angle) * swirl + p.ox * (1 - eased)
          const y = p.y + (p.ty - p.y) * eased + Math.sin(angle) * swirl + p.oy * (1 - eased)
          const alpha = clamp((0.22 + local * 0.92) * particleFade, 0, 1)

          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.arc(x, y, p.size * (1.25 - eased * 0.25), 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      if (settle > 0.98 && !revealed) setRevealed(true)
      raf.current = requestAnimationFrame(loop)
    }

    raf.current = requestAnimationFrame(loop)

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') animateClose()
    }

    window.addEventListener('keydown', escHandler)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', escHandler)
    }
  }, [animateClose, revealed, src])

  return createPortal(
    <div
      className={`darkroom-overlay ${revealed ? 'is-revealed' : ''}`}
      ref={overlayRef}
      onClick={animateClose}
    >
      <canvas ref={canvasRef} className="darkroom-canvas" />

      <div className="darkroom-print-wrap" ref={wrapRef}>
        <span className="darkroom-focus-ring" />
        <img src={src} alt="" aria-hidden="true" className="darkroom-prism darkroom-prism--cyan" />
        <img src={src} alt="" aria-hidden="true" className="darkroom-prism darkroom-prism--magenta" />
        <img ref={imgRef} src={src} alt={caption} className={`darkroom-image ${revealed ? 'is-revealed' : ''}`} />
      </div>

      <span ref={captionRef} className="darkroom-caption">{caption}</span>
      <button
        ref={closeRef}
        className="darkroom-close"
        onClick={(e) => { e.stopPropagation(); animateClose() }}
        aria-label="Close photo"
        data-cursor="Close"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>,
    document.body,
  )
}
