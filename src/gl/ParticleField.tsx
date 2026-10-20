import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'

import { positionFrag, velocityFrag } from './shaders/simulation.glsl'
import { particleFrag, particleVert } from './shaders/particles.glsl'
import {
  buildShapeTextures,
  debugMasks,
  seedPositions,
  shapeFillers,
} from './shapes'
import { maskToDataURL } from './sampler'
import { SIM_SIZE, qualityTier, scene } from '../lib/store'
import { visuals } from '../data/visuals'

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.damp(current, target, lambda, dt)

export function ParticleField() {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.viewport)

  const group = useRef<THREE.Group>(null!)
  const points = useRef<THREE.Points>(null!)

  const tier = useMemo(qualityTier, [])
  const SIZE = SIM_SIZE[tier]
  const COUNT = SIZE * SIZE

  /* ---- GPU simulation ---------------------------------------------------- */

  const sim = useMemo(() => {
    const gpu = new GPUComputationRenderer(SIZE, SIZE, gl)

    // createTexture() always hands back a float RGBA buffer here; three's types
    // just describe the union of every texture format it can produce.
    const pos0 = gpu.createTexture()
    ;(pos0.image.data as unknown as Float32Array).set(seedPositions(SIZE))
    const vel0 = gpu.createTexture() // zero-initialised

    const posVar = gpu.addVariable('texturePosition', positionFrag, pos0)
    const velVar = gpu.addVariable('textureVelocity', velocityFrag, vel0)

    gpu.setVariableDependencies(posVar, [posVar, velVar])
    gpu.setVariableDependencies(velVar, [posVar, velVar])

    posVar.material.uniforms.uStep = { value: 1 }

    const shapes = buildShapeTextures(SIZE)

    Object.assign(velVar.material.uniforms, {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uAgitation: { value: 0 },
      uBurst: { value: 0 },
      uIntro: { value: 0 },
      uSnap: { value: 0 },
      uStep: { value: 1 },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uTargetA: { value: shapes[0] },
      uTargetB: { value: shapes[1] },
    })

    const error = gpu.init()
    if (error) console.error('[ParticleField] GPGPU init failed:', error)

    return { gpu, posVar, velVar, shapes }
  }, [gl, SIZE])

  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__mask = (name: string) =>
        debugMasks[name] ? maskToDataURL(debugMasks[name]) : null

      // Reads live particle positions back off the GPU. The only way to tell a
      // simulation that isn't converging from one that's converging on the
      // wrong target.
      ;(window as unknown as Record<string, unknown>).__snap = (mode = 1, shape = -1) => {
        sim.velVar.material.uniforms.uSnap.value = mode

        // Pin a specific shape so a readback tests one texture rather than
        // whatever blend the current scroll position happens to produce.
        if (shape >= 0) {
          sim.velVar.material.uniforms.uTargetA.value = sim.shapes[shape]
          sim.velVar.material.uniforms.uTargetB.value = sim.shapes[shape]
          pinnedShape.current = shape
        }

        // Long hold: under a software renderer a "frame" can take most of a
        // second, and a short hold gets read back before it has been applied.
        window.setTimeout(() => {
          sim.velVar.material.uniforms.uSnap.value = 0
          pinnedShape.current = -1
        }, 12000)

        // Report the target as JS sees it, so a mismatch with the readback
        // isolates the GPU upload from the sampling code.
        const t = sim.shapes[Math.max(shape, 0)].image.data as unknown as Float32Array
        let minX = Infinity
        let maxX = -Infinity
        let minZ = Infinity
        let maxZ = -Infinity
        for (let i = 0; i < SIZE * SIZE; i++) {
          minX = Math.min(minX, t[i * 4]); maxX = Math.max(maxX, t[i * 4])
          minZ = Math.min(minZ, t[i * 4 + 2]); maxZ = Math.max(maxZ, t[i * 4 + 2])
        }
        return {
          snapSet: sim.velVar.material.uniforms.uSnap.value,
          targetX: [minX, maxX],
          targetZ: [minZ, maxZ],
        }
      }
      ;(window as unknown as Record<string, unknown>).__probe = (which = 'pos') => {
        const rt = sim.gpu.getCurrentRenderTarget(which === 'vel' ? sim.velVar : sim.posVar)
        const buf = new Float32Array(SIZE * SIZE * 4)
        gl.readRenderTargetPixels(rt, 0, 0, SIZE, SIZE, buf)

        // Coarse occupancy grid in the xy plane — an ASCII render of where the
        // particles actually are, which is the only reliable way to tell a
        // formed silhouette from a converged-looking blob.
        const W = 48
        const H = 16
        const X0 = -7
        const X1 = 7
        const Y0 = -4
        const Y1 = 4
        const grid = new Array(W * H).fill(0)

        let minX = Infinity
        let maxX = -Infinity
        let minY = Infinity
        let maxY = -Infinity
        let minZ = Infinity
        let maxZ = -Infinity

        for (let i = 0; i < SIZE * SIZE; i++) {
          const x = buf[i * 4]
          const y = buf[i * 4 + 1]
          const z = buf[i * 4 + 2]
          minX = Math.min(minX, x); maxX = Math.max(maxX, x)
          minY = Math.min(minY, y); maxY = Math.max(maxY, y)
          minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)

          const gx = Math.floor(((x - X0) / (X1 - X0)) * W)
          const gy = Math.floor(((Y1 - y) / (Y1 - Y0)) * H)
          if (gx >= 0 && gx < W && gy >= 0 && gy < H) grid[gy * W + gx]++
        }

        const peak = Math.max(...grid)
        const ramp = ' .:-=+*#%@'
        const rows: string[] = []
        for (let r = 0; r < H; r++) {
          let line = ''
          for (let c = 0; c < W; c++) {
            const v = grid[r * W + c] / (peak || 1)
            line += ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))]
          }
          rows.push(line)
        }

        return {
          stage: Number(scene.stage.toFixed(2)),
          morph: Number(smoothed.current.morph.toFixed(3)),
          bbox: [minX, maxX, minY, maxY, minZ, maxZ].map((v) => Number(v.toFixed(2))),
          rows,
        }
      }
    }
  }, [sim, SIZE, gl])

  /* ---- Render geometry --------------------------------------------------- */

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    const positions = new Float32Array(COUNT * 3) // unused, but three wants it
    const refs = new Float32Array(COUNT * 2)
    const seeds = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      // Sample at texel centres, otherwise bilinear filtering smears
      // neighbouring particles together.
      refs[i * 2] = ((i % SIZE) + 0.5) / SIZE
      refs[i * 2 + 1] = (Math.floor(i / SIZE) + 0.5) / SIZE
      seeds[i] = Math.random()
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aRef', new THREE.BufferAttribute(refs, 2))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 40)

    return geo
  }, [COUNT, SIZE])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVert,
        fragmentShader: particleFrag,
        uniforms: {
          uPos: { value: null },
          uVel: { value: null },
          uSize: { value: visuals.size * (tier === 'low' ? 1.25 : 1) },
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uOpacity: { value: visuals.opacity },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          // Cosine palette: col = A + B*cos(2π(C*t + D)).
          // A is kept well below 0.5 so overlapping additive points climb into
          // colour before they clip to white — a brighter base greys out fast.
          // Tuned to a cyan → blue → violet range, with no warm hues, so the
          // cloud reads as one cool "tech" palette.
          uPalA: { value: new THREE.Vector3(0.22, 0.34, 0.62) },
          uPalB: { value: new THREE.Vector3(0.24, 0.30, 0.38) },
          uPalC: { value: new THREE.Vector3(0.6, 0.6, 0.6) },
          uPalD: { value: new THREE.Vector3(0.62, 0.38, 0.0) },
        },
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
      }),
    [tier],
  )

  /* ---- Frame loop -------------------------------------------------------- */

  const smoothed = useRef({
    morph: 0,
    agitation: 0,
    lastScroll: 0,
    rotX: 0,
    rotY: 0,
    offsetX: 0,
  })
  const pointerWorld = useMemo(() => new THREE.Vector3(), [])
  /** Debug only: -1 follows scroll, >=0 locks the target to one shape. */
  const pinnedShape = useRef(-1)

  useFrame((state, rawDelta) => {
    // Clamp: a backgrounded tab hands us a huge delta on return, which would
    // slam every damped value straight to its target.
    const dt = Math.min(rawDelta, 1 / 30)
    const t = state.clock.elapsedTime
    const s = smoothed.current

    /* shape blend */
    const maxIdx = shapeFillers.length - 1
    const stage = THREE.MathUtils.clamp(scene.stage, 0, maxIdx)
    const a = Math.min(Math.floor(stage), maxIdx)
    const b = Math.min(a + 1, maxIdx)
    const morphTarget = stage - a

    if (pinnedShape.current < 0) {
      sim.velVar.material.uniforms.uTargetA.value = sim.shapes[a]
      sim.velVar.material.uniforms.uTargetB.value = sim.shapes[b]
      s.morph = damp(s.morph, morphTarget, 9, dt)
    }

    /* scroll velocity -> turbulence */
    const scrollVel = Math.abs(scene.scroll - s.lastScroll) / Math.max(dt, 1e-4)
    s.lastScroll = scene.scroll
    const agitationTarget = scene.reducedMotion ? 0 : THREE.MathUtils.clamp(scrollVel * 5, 0, 1)
    s.agitation = damp(s.agitation, agitationTarget, 4, dt)

    /* burst decays exponentially */
    scene.burst *= Math.pow(0.12, dt)
    if (scene.burst < 0.001) scene.burst = 0

    /* group transform — must happen before the pointer is projected into it */
    if (group.current) {
      // Oscillate rather than spin. Three of the four shapes are essentially
      // flat, and a continuous yaw would swing them edge-on and erase them —
      // a slow sway keeps them legible while still feeling alive.
      const idle = scene.reducedMotion ? 0 : Math.sin(t * 0.22) * 0.17
      s.rotY = damp(s.rotY, scene.pointer.x * 0.22, 3, dt)
      s.rotX = damp(s.rotX, -scene.pointer.y * 0.16, 3, dt)
      group.current.rotation.y = idle + s.rotY
      group.current.rotation.x = s.rotX

      // On landscape viewports the cloud sits off to the right so the copy
      // column stays clean and the shape reads as an object next to the text.
      // Portrait has nowhere to put it, so it centres and shrinks instead.
      const wide = viewport.width / viewport.height > 1.15
      s.offsetX = damp(s.offsetX, wide ? visuals.offsetX : 0, 3, dt)
      group.current.position.x = s.offsetX
      group.current.position.y =
        (wide ? visuals.offsetY : visuals.mobileOffsetY) + scene.pointer.y * 0.35
      // On phones the hero atom is shrunk a little more so it clears the copy.
      const heroShrink = 1 - 0.2 * (1 - THREE.MathUtils.clamp(stage, 0, 1))
      group.current.scale.setScalar(wide ? 1 : visuals.mobileScale * heroShrink)
      group.current.updateMatrixWorld(true)
    }

    /* pointer -> the simulation's own local space */
    if (scene.pointerActive) {
      const dist = camera.position.z
      const halfH = Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360) * dist
      const halfW = halfH * (viewport.width / viewport.height || 1.6)
      pointerWorld.set(scene.pointer.x * halfW, scene.pointer.y * halfH, 0)
      // The simulation runs in the group's local space. Feeding it world
      // coordinates put the repulsion point in the wrong place entirely.
      if (group.current) group.current.worldToLocal(pointerWorld)
    } else {
      // Park it far outside the cloud rather than at the origin, which is the
      // one place guaranteed to be inside every shape.
      pointerWorld.set(0, 0, 1e4)
    }

    // Clamped hard on the upper end. This is a semi-implicit spring integrated
    // once per frame, and steps much above 1 push it past its stability margin
    // — the cloud visibly blows outward instead of converging. A slow device
    // therefore settles more slowly rather than exploding.
    const step = THREE.MathUtils.clamp(dt * 60, 0.5, 1.25)
    sim.posVar.material.uniforms.uStep.value = step

    const vu = sim.velVar.material.uniforms
    vu.uStep.value = step
    vu.uTime.value = t
    vu.uMorph.value = s.morph
    vu.uAgitation.value = s.agitation
    vu.uBurst.value = scene.burst
    vu.uIntro.value = scene.intro
    vu.uPointer.value.copy(pointerWorld)

    sim.gpu.compute()

    const mu = material.uniforms
    mu.uPos.value = sim.gpu.getCurrentRenderTarget(sim.posVar).texture
    mu.uVel.value = sim.gpu.getCurrentRenderTarget(sim.velVar).texture
    mu.uTime.value = t
    mu.uIntro.value = scene.intro

  })

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  )
}
