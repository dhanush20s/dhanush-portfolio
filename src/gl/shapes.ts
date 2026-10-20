import * as THREE from 'three'

import { sampleMask, type MaskDraw } from './sampler'

/**
 * Target shapes for the particle field — one per section. The simulation blends
 * between consecutive entries as you scroll.
 *
 *   0 atom       Hero     — the React / React Native mark
 *   1 code       About    — the </> mark
 *   2 network    Work     — services, APIs and databases wired together
 *   3 growth     Path     — rising bars and an arrow
 *   4 plane      Contact  — paper plane
 *
 * Each filler writes xyz into an RGBA Float32Array. The `w` channel is left
 * alone: the position texture reuses it as a per-particle seed.
 */

const TAU = Math.PI * 2

type Filler = (arr: Float32Array, count: number) => void

/** Rounded-rect path helper, in the 100-unit drawing space. */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/* -------------------------------------------------------------------------- */
/* 0. React atom — nucleus and three orbits, solid 3D                          */
/* -------------------------------------------------------------------------- */

/**
 * The React / React Native mark: three ellipses 60° apart around a nucleus.
 * Each ring is also tilted a little in depth, so when the cloud sways the
 * orbits slide past one another instead of lying flat like a sticker.
 */
const atom: Filler = (arr, count) => {
  const A = 3.6 // orbit semi-major axis
  const B = 1.38 // semi-minor axis

  for (let i = 0; i < count; i++) {
    const i4 = i * 4

    if (Math.random() < 0.14) {
      // Nucleus: a dense ball.
      const u = Math.random()
      const v = Math.random()
      const th = TAU * u
      const ph = Math.acos(2 * v - 1)
      const r = 0.55 * Math.cbrt(Math.random())
      arr[i4] = r * Math.sin(ph) * Math.cos(th)
      arr[i4 + 1] = r * Math.sin(ph) * Math.sin(th)
      arr[i4 + 2] = r * Math.cos(ph)
      continue
    }

    const ring = (Math.random() * 3) | 0
    const t = Math.random() * TAU
    const rot = (ring * Math.PI) / 3

    // Point on the ellipse, with a thin radial scatter so the orbit has body.
    const scatter = 1 + (Math.random() - 0.5) * 0.1
    const ex = A * Math.cos(t) * scatter
    const ey = B * Math.sin(t) * scatter

    arr[i4] = ex * Math.cos(rot) - ey * Math.sin(rot)
    arr[i4 + 1] = ex * Math.sin(rot) + ey * Math.cos(rot)
    // Depth: each orbit leans a different way, plus a little thickness.
    arr[i4 + 2] = Math.sin(t + ring * 2.1) * 0.7 + (Math.random() - 0.5) * 0.18
  }
}

/* -------------------------------------------------------------------------- */
/* 1. Code brackets  </>                                                       */
/* -------------------------------------------------------------------------- */

const drawCode: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = 7

  // <
  ctx.beginPath()
  ctx.moveTo(31, 26)
  ctx.lineTo(9, 50)
  ctx.lineTo(31, 74)
  ctx.stroke()

  // >
  ctx.beginPath()
  ctx.moveTo(69, 26)
  ctx.lineTo(91, 50)
  ctx.lineTo(69, 74)
  ctx.stroke()

  // /
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(57, 20)
  ctx.lineTo(43, 80)
  ctx.stroke()

  ctx.restore()
}

const code: Filler = (arr, count) => {
  sampleMask(arr, count, drawCode, { scale: 10.5, depth: 0.7 })
}

/* -------------------------------------------------------------------------- */
/* 2. Service network — solid 3D                                               */
/* -------------------------------------------------------------------------- */

/** Small deterministic PRNG so the graph layout is identical on every load. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A hub with satellite nodes joined by edges: app → API → database, drawn as a
 * graph. Nodes are denser blobs, edges are thin filaments, so it reads as
 * structure rather than a random cloud.
 */
const network: Filler = (arr, count) => {
  const rand = mulberry32(7)
  const nodes: THREE.Vector3[] = [new THREE.Vector3(0, 0, 0)]

  // Fibonacci-ish spread inside an ellipsoid keeps the nodes evenly separated.
  const N = 15
  for (let i = 1; i <= N; i++) {
    const phi = Math.acos(1 - (2 * i) / (N + 1))
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    const r = 0.75 + rand() * 0.25
    nodes.push(
      new THREE.Vector3(
        Math.cos(theta) * Math.sin(phi) * 3.9 * r,
        Math.cos(phi) * 2.9 * r,
        Math.sin(theta) * Math.sin(phi) * 1.6 * r,
      ),
    )
  }

  // Every satellite links to the hub or its nearest neighbour.
  const edges: [number, number][] = []
  for (let i = 1; i < nodes.length; i++) {
    if (i % 3 === 1) edges.push([0, i])
    let best = -1
    let bestD = Infinity
    for (let j = 1; j < nodes.length; j++) {
      if (j === i) continue
      const d = nodes[i].distanceToSquared(nodes[j])
      if (d < bestD) {
        bestD = d
        best = j
      }
    }
    if (best >= 0) edges.push([i, best])
    // A second, farther link gives the loops that make it a mesh.
    let second = -1
    let secondD = Infinity
    for (let j = 1; j < nodes.length; j++) {
      if (j === i || j === best) continue
      const d = nodes[i].distanceToSquared(nodes[j])
      if (d < secondD) {
        secondD = d
        second = j
      }
    }
    if (second >= 0 && i % 2 === 0) edges.push([i, second])
  }

  for (let i = 0; i < count; i++) {
    const i4 = i * 4
    const roll = Math.random()

    if (roll < 0.38) {
      // Node blob — the hub is bigger and denser.
      const n = Math.random() < 0.22 ? 0 : 1 + ((Math.random() * N) | 0)
      const radius = n === 0 ? 0.62 : 0.3
      const u = Math.random()
      const v = Math.random()
      const th = TAU * u
      const ph = Math.acos(2 * v - 1)
      const rr = radius * Math.cbrt(Math.random())
      arr[i4] = nodes[n].x + rr * Math.sin(ph) * Math.cos(th)
      arr[i4 + 1] = nodes[n].y + rr * Math.sin(ph) * Math.sin(th)
      arr[i4 + 2] = nodes[n].z + rr * Math.cos(ph)
    } else {
      const [a, b] = edges[(Math.random() * edges.length) | 0]
      const t = Math.random()
      const jitter = 0.05
      arr[i4] = THREE.MathUtils.lerp(nodes[a].x, nodes[b].x, t) + (Math.random() - 0.5) * jitter
      arr[i4 + 1] = THREE.MathUtils.lerp(nodes[a].y, nodes[b].y, t) + (Math.random() - 0.5) * jitter
      arr[i4 + 2] = THREE.MathUtils.lerp(nodes[a].z, nodes[b].z, t) + (Math.random() - 0.5) * jitter
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Growth — rising bars with an arrow                                       */
/* -------------------------------------------------------------------------- */

const drawGrowth: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Bars.
  const heights = [16, 28, 40, 53, 66]
  const w = 12
  const gap = 5
  const x0 = 50 - (heights.length * w + (heights.length - 1) * gap) / 2
  heights.forEach((h, i) => {
    roundRect(ctx, x0 + i * (w + gap), 88 - h, w, h, 2.2)
    ctx.fill()
  })

  // Baseline.
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.moveTo(6, 91)
  ctx.lineTo(94, 91)
  ctx.stroke()

  // Trend arrow above the bars.
  ctx.lineWidth = 3.4
  ctx.beginPath()
  ctx.moveTo(10, 52)
  ctx.lineTo(35, 36)
  ctx.lineTo(52, 43)
  ctx.lineTo(86, 12)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(70, 12)
  ctx.lineTo(87, 11)
  ctx.lineTo(86, 28)
  ctx.stroke()

  ctx.restore()
}

const growth: Filler = (arr, count) => {
  sampleMask(arr, count, drawGrowth, { scale: 10, depth: 0.55 })
}

/* -------------------------------------------------------------------------- */
/* 4. Paper plane                                                              */
/* -------------------------------------------------------------------------- */

const drawPlane: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = 3.2

  const tip = [92, 14]
  const wing = [8, 46]
  const fold = [38, 60]
  const tail = [47, 90]

  // Upper wing.
  ctx.beginPath()
  ctx.moveTo(tip[0], tip[1])
  ctx.lineTo(wing[0], wing[1])
  ctx.lineTo(fold[0], fold[1])
  ctx.closePath()
  ctx.stroke()

  // Lower wing.
  ctx.beginPath()
  ctx.moveTo(tip[0], tip[1])
  ctx.lineTo(fold[0], fold[1])
  ctx.lineTo(tail[0], tail[1])
  ctx.closePath()
  ctx.stroke()

  // Solid underside keel for density.
  ctx.beginPath()
  ctx.moveTo(fold[0], fold[1])
  ctx.lineTo(tail[0], tail[1])
  ctx.lineTo(54, 68)
  ctx.closePath()
  ctx.fill()

  // Motion trail.
  ctx.lineWidth = 2.2
  ctx.setLineDash([2, 5])
  ctx.beginPath()
  ctx.moveTo(8, 78)
  ctx.quadraticCurveTo(22, 70, 34, 72)
  ctx.stroke()

  ctx.restore()
}

const plane: Filler = (arr, count) => {
  sampleMask(arr, count, drawPlane, { scale: 8.8, depth: 0.55 })
}

/* -------------------------------------------------------------------------- */

/** Debug: the canvas-drawn masks, keyed by name. See `maskToDataURL`. */
export const debugMasks: Record<string, MaskDraw> = {
  code: drawCode,
  growth: drawGrowth,
  plane: drawPlane,
}

export const shapeFillers: Filler[] = [atom, code, network, growth, plane]

export function buildShapeTextures(size: number): THREE.DataTexture[] {
  const count = size * size

  return shapeFillers.map((fill) => {
    const data = new Float32Array(count * 4)
    fill(data, count)

    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)

    // Nearest is not optional here. Neighbouring texels hold completely
    // unrelated target positions, so any interpolation hands a particle the
    // average of four random points on the shape — which pulls the whole cloud
    // toward its centroid and destroys the silhouette.
    tex.magFilter = THREE.NearestFilter
    tex.minFilter = THREE.NearestFilter
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.generateMipmaps = false
    tex.needsUpdate = true

    return tex
  })
}

/**
 * Initial state: a wide, sparse sphere outside the first shape, so the intro
 * reads as the cloud collapsing inward. `w` carries the per-particle seed the
 * whole simulation keys off.
 */
export function seedPositions(size: number): Float32Array {
  const count = size * size
  const data = new Float32Array(count * 4)

  for (let i = 0; i < count; i++) {
    const a = Math.random() * TAU
    const b = Math.acos(2 * Math.random() - 1)
    const r = 9 + Math.random() * 8

    const i4 = i * 4
    data[i4] = r * Math.sin(b) * Math.cos(a)
    data[i4 + 1] = r * Math.sin(b) * Math.sin(a)
    data[i4 + 2] = r * Math.cos(b)
    data[i4 + 3] = Math.random()
  }

  return data
}
