import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { backdropFrag, backdropVert } from './shaders/backdrop.glsl'
import { scene } from '../lib/store'
import { visuals } from '../data/visuals'

/**
 * Fullscreen aurora behind the particles.
 *
 * The vertex shader writes clip space directly and the material has depth
 * testing off, so this is really a fullscreen pass wearing a mesh costume —
 * it needs no camera relationship at all.
 */
export function Backdrop() {
  const size = useThree((s) => s.size)

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: backdropVert,
        fragmentShader: backdropFrag,
        uniforms: {
          uTime: { value: 0 },
          uStage: { value: 0 },
          uIntro: { value: 0 },
          uAurora: { value: visuals.backdrop },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uPointer: { value: new THREE.Vector2(0, 0) },
        },
        depthTest: false,
        depthWrite: false,
      }),
    [],
  )

  const stage = useRef(0)

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30)
    const u = material.uniforms

    stage.current = THREE.MathUtils.damp(stage.current, scene.stage, 4, dt)

    u.uTime.value = state.clock.elapsedTime
    u.uStage.value = stage.current
    u.uIntro.value = scene.intro
    u.uResolution.value.set(size.width, size.height)
    u.uPointer.value.set(scene.pointer.x, scene.pointer.y)
  })

  return (
    <mesh material={material} renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}
