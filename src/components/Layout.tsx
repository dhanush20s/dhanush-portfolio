import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { Scene } from '../gl/Scene'
import { Cursor } from './Cursor'
import { Nav } from './Nav'
import { Preloader } from './Preloader'
import { ScrollRail } from './ScrollRail'
import { initPointer } from '../lib/pointer'
import { initScroll } from '../lib/scroll'
import { scene } from '../lib/store'
import { person } from '../data/content'
import { visuals } from '../data/visuals'

type LayoutProps = {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isPortfolio = location.pathname === '/'
  const [loaded, setLoaded] = useState(false)
  const firstLoad = useRef(true)

  useEffect(() => {
    document.title = person.pageTitle
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', person.pageDescription)
  }, [])

  useEffect(() => {
    scene.pinnedStage = isPortfolio ? -1 : 4

    if (isPortfolio) {
      const teardownScroll = initScroll()
      const teardownPointer = initPointer()

      if (firstLoad.current) {
        firstLoad.current = false
      }

      return () => {
        teardownScroll()
        teardownPointer()
      }
    } else {
      const teardownPointer = initPointer()
      return () => {
        scene.pinnedStage = -1
        teardownPointer()
      }
    }
  }, [isPortfolio])

  const onLoaded = useCallback(() => {
    setLoaded(true)
    ScrollTrigger.refresh()
  }, [])

  const showPreloader = !loaded && isPortfolio

  return (
    <>
      <Scene />
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

      {showPreloader && <Preloader onDone={onLoaded} />}
    </>
  )
}