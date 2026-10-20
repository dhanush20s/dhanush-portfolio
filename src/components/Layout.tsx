import { lazy, Suspense, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { Cursor } from './Cursor'
import { Nav } from './Nav'
import { SceneBoundary } from './SceneBoundary'
import { ScrollRail } from './ScrollRail'
import { initPointer } from '../lib/pointer'
import { initScroll } from '../lib/scroll'
import { webglSupported } from '../lib/webgl'
import { scene } from '../lib/store'
import { person } from '../data/content'
import { visuals } from '../data/visuals'

// Three.js and the shaders are the bulk of the bundle. Loading them lazily lets
// the text paint first; the scene fades in once its chunk arrives.
const Scene = lazy(() => import('../gl/Scene').then((m) => ({ default: m.Scene })))

const HAS_WEBGL = webglSupported()

/** Static stand-in for the scene: no WebGL, or the scene failed to start. */
function SceneFallback() {
  return <div className="canvas-fallback" aria-hidden="true" />
}

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {

  // Mount the WebGL scene once the page has painted and the browser is idle, so
  // text and layout appear first instead of waiting on shader setup.
  const [sceneReady, setSceneReady] = useState(false)
  useEffect(() => {
    const start = () => setSceneReady(true)
    // Safari still lacks requestIdleCallback, so it is typed as optional.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (w.requestIdleCallback && w.cancelIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 1200 })
      return () => w.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(start, 400)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    document.title = person.pageTitle
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', person.pageDescription)
  }, [])

  useEffect(() => {
    const teardownScroll = initScroll()
    const teardownPointer = initPointer()
    return () => {
      teardownScroll()
      teardownPointer()
    }
  }, [])

  // The particle field fades in on load (scene.intro 0 -> 1) instead of behind
  // an intro screen.
  useEffect(() => {
    const tween = scene.reducedMotion
      ? gsap.set(scene, { intro: 1 })
      : gsap.to(scene, { intro: 1, duration: 2.4, ease: 'power2.out' })
    ScrollTrigger.refresh()
    return () => {
      tween.kill()
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      {HAS_WEBGL && sceneReady ? (
        <SceneBoundary fallback={<SceneFallback />}>
          <Suspense fallback={<SceneFallback />}>
            <Scene />
          </Suspense>
        </SceneBoundary>
      ) : (
        <SceneFallback />
      )}
      <div
        className="scrim"
        aria-hidden="true"
        style={{ ['--s' as string]: visuals.scrim }}
      />

      <div className="overlay-scan" aria-hidden="true" />
      <div className="overlay-grain" aria-hidden="true" />

      <Cursor />
      <Nav />
      <ScrollRail />

      {children}
    </>
  )
}