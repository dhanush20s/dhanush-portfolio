import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import { Backdrop } from './Backdrop'
import { ParticleField } from './ParticleField'
import { qualityTier, scene } from '../lib/store'
import { visuals } from '../data/visuals'

export function Scene() {
  const tier = useMemo(qualityTier, [])

  // DPR is the single biggest lever on fill-rate here. Additive particles are
  // pure overdraw, so we cap hard on anything that isn't a desktop GPU.
  const dpr: [number, number] = tier === 'low' ? [1, 1.25] : tier === 'mid' ? [1, 1.6] : [1, 2]

  const aberration = useMemo(
    () => new THREE.Vector2(visuals.aberration * 0.7, visuals.aberration),
    [],
  )

  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{
          antialias: false, // bloom hides the aliasing; AA on additive points is wasted
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 42, near: 0.1, far: 120, position: [0, 0, 16] }}
        onCreated={({ gl }) => {
          gl.setClearColor('#04040a', 1)
          scene.ready = true
        }}
      >
        <Suspense fallback={null}>
          <Backdrop />
          <ParticleField />

          {!scene.reducedMotion && (
            <EffectComposer multisampling={0}>
              <Bloom
                intensity={visuals.bloom * (tier === 'low' ? 0.7 : 1)}
                luminanceThreshold={visuals.bloomThreshold}
                luminanceSmoothing={0.4}
                mipmapBlur
                radius={0.7}
              />
              <ChromaticAberration
                offset={aberration}
                blendFunction={BlendFunction.NORMAL}
                radialModulation={false}
                modulationOffset={0}
              />
              <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.12} />
              <Vignette eskil={false} offset={0.2} darkness={0.9} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
