import * as THREE from 'three'

import {
  loadImage,
  sampleImage,
  sampleImageMask,
  sampleMask,
  textDraw,
  type MaskDraw,
} from './sampler'
import { visuals } from '../data/visuals'

/**
 * Target shapes for the particle field — one per section. The simulation blends
 * between consecutive entries as you scroll.
 *
 * Each filler writes xyz into an RGBA Float32Array. The `w` channel is left
 * alone: the position texture reuses it as a per-particle seed.
 */

const TAU = Math.PI * 2

type Filler = (arr: Float32Array, count: number) => void

/* -------------------------------------------------------------------------- */
/* 1. Car — side elevation                                                     */
/* -------------------------------------------------------------------------- */

/**
 * BMW-style coupé profile, facing left.
 *
 * Drawn with canvas path commands rather than an SVG `d` string: the wheel
 * arches and punched-out glass are far easier to get right with `arc()` and
 * `destination-out` than with path arc flags.
 *
 * The cues that make it read as this car rather than a generic hatchback are
 * the long dash-to-axle bonnet, the low fast roofline peaking behind centre,
 * and the Hofmeister kink — the forward notch in the trailing edge of the rear
 * side window. Lose the kink and it stops being recognisable.
 */
const drawCar: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)
  // Drawn in a box 100 units long, roof at y≈0 and ground at y=26.5. Those
  // proportions are taken off the reference photo: a GT4 coupé is very nearly
  // 3.8 times longer than it is tall. Shifted down so the whole car, wing
  // included, sits centred in the square canvas.
  ctx.translate(0, 36)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  const AXLE = 18.3
  const FRONT = 17.9
  const REAR = 79
  const TYRE = 8.2
  // Must clear the tyre but stay *below* the fender crown, or the punch cuts
  // straight through the top of the bodywork and severs the nose and tail.
  const ARCH = 9.0

  // --- Rear wing ----------------------------------------------------------
  // Twin-pedestal wing standing proud of the roofline. Along with the splitter
  // and the side skirt, this is what separates a GT4 from a road coupé.
  ctx.beginPath()
  ctx.moveTo(85.5, 0.2)
  ctx.lineTo(100, -1.4)
  ctx.lineTo(100, 1.2)
  ctx.lineTo(85.5, 2.6)
  ctx.closePath()
  ctx.fill()

  ctx.beginPath()
  ctx.rect(88.5, 2.0, 2.4, 9.0)
  ctx.rect(95.0, 1.4, 2.4, 9.4)
  ctx.fill()

  // --- Body ---------------------------------------------------------------
  ctx.beginPath()
  ctx.moveTo(1.2, 21.8) // bumper, bottom front corner
  ctx.lineTo(0.6, 14.6) // nose — blunt and low, not a wedge
  ctx.bezierCurveTo(1.6, 11.6, 5.0, 9.6, 10.5, 8.8) // up onto the front fender
  ctx.bezierCurveTo(15.0, 8.2, 21.0, 8.2, 24.5, 8.8) // fender crown over the wheel
  ctx.bezierCurveTo(31.0, 9.3, 37.0, 9.2, 42.5, 8.9) // bonnet, near flat
  ctx.bezierCurveTo(45.0, 5.8, 47.0, 2.1, 50.5, 1.0) // A-pillar, hard rake
  ctx.lineTo(66.0, 0.8) // roof
  ctx.bezierCurveTo(72.0, 1.5, 76.0, 4.6, 79.5, 7.9) // fastback over the rear arch
  ctx.bezierCurveTo(84.0, 8.4, 89.0, 9.4, 93.5, 10.0) // short decklid
  ctx.bezierCurveTo(97.0, 10.4, 99.4, 11.4, 99.4, 13.4)
  ctx.lineTo(99.2, 20.0) // rear valance, near vertical
  ctx.lineTo(88.0, 21.0)
  ctx.lineTo(27.0, 21.0) // sill
  ctx.lineTo(2.4, 22.0)
  ctx.closePath()
  ctx.fill()

  // --- Wheel arches -------------------------------------------------------
  // Punch the openings, then drop the tyres in slightly smaller. The gap
  // between the two is what reads as an arch — an arch *line* instead just
  // left the wheels looking stuck on.
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(FRONT, AXLE, ARCH, 0, TAU)
  ctx.arc(REAR, AXLE, ARCH, 0, TAU)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  ctx.beginPath()
  ctx.arc(FRONT, AXLE, TYRE, 0, TAU)
  ctx.arc(REAR, AXLE, TYRE, 0, TAU)
  ctx.fill()

  // --- Side skirt and front splitter --------------------------------------
  // Drawn after the arch punch, since both overlap it and would otherwise be
  // partly erased.
  ctx.beginPath()
  ctx.rect(27, 20.6, 44, 1.9)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(0, 22.6)
  ctx.lineTo(19, 22.6)
  ctx.lineTo(16.5, 24.4)
  ctx.lineTo(0, 24.4)
  ctx.closePath()
  ctx.fill()

  // --- Cut-outs -----------------------------------------------------------
  // Interior structure matters more than outline: a solid silhouette reads as
  // an unrecognisable blob once it's made of particles. Everything below is
  // negative space that gives the eye edges to follow.
  ctx.globalCompositeOperation = 'destination-out'

  // Hollow the tyres into rings.
  ctx.beginPath()
  ctx.arc(FRONT, AXLE, 5.4, 0, TAU)
  ctx.arc(REAR, AXLE, 5.4, 0, TAU)
  ctx.fill()

  // Front side glass, inset from the pillars.
  ctx.beginPath()
  ctx.moveTo(44.0, 8.4)
  ctx.lineTo(50.8, 2.4)
  ctx.lineTo(57.0, 2.2)
  ctx.lineTo(57.0, 8.4)
  ctx.closePath()
  ctx.fill()

  // Rear side glass. The forward lean on its trailing edge is the Hofmeister
  // kink — lose it and the profile stops being recognisable.
  ctx.beginPath()
  ctx.moveTo(59.5, 2.2)
  ctx.lineTo(70.0, 2.7)
  ctx.lineTo(74.0, 5.4)
  ctx.lineTo(68.5, 8.4)
  ctx.lineTo(59.5, 8.4)
  ctx.closePath()
  ctx.fill()

  // Headlight — a swept wedge on the nose, punched so it reads as a bright
  // lamp rather than more bodywork.
  ctx.beginPath()
  ctx.moveTo(2.6, 13.9)
  ctx.lineTo(11.5, 12.9)
  ctx.lineTo(12.6, 15.2)
  ctx.lineTo(3.4, 16.4)
  ctx.closePath()
  ctx.fill()

  // Tail light
  ctx.beginPath()
  ctx.moveTo(91.5, 12.4)
  ctx.lineTo(98.6, 13.4)
  ctx.lineTo(98.4, 16.0)
  ctx.lineTo(91.8, 15.2)
  ctx.closePath()
  ctx.fill()

  // Badge recess on the front wing — punched now, roundel goes back in below.
  ctx.beginPath()
  ctx.arc(31.5, 14.6, 2.4, 0, TAU)
  ctx.fill()

  // Door shut line and the flank crease.
  ctx.lineWidth = 0.6
  ctx.beginPath()
  ctx.moveTo(58.2, 9.4)
  ctx.lineTo(58.2, 20.2)
  ctx.stroke()

  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(13, 16.6)
  ctx.lineTo(93, 15.2)
  ctx.stroke()

  ctx.globalCompositeOperation = 'source-over'

  // LED bar drawn back into the punched headlight so it isn't just a hole.
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(3.8, 15.2)
  ctx.lineTo(11.6, 14.0)
  ctx.stroke()

  // --- Wheel centres ------------------------------------------------------
  // Spokes and a centre-cap roundel inside the hollowed tyre, so it reads as a
  // rim rather than a doughnut.
  for (const cx of [FRONT, REAR]) {
    ctx.lineWidth = 0.55
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU
      ctx.moveTo(cx + Math.cos(a) * 2.0, AXLE + Math.sin(a) * 2.0)
      ctx.lineTo(cx + Math.cos(a) * 5.1, AXLE + Math.sin(a) * 5.1)
    }
    ctx.stroke()

    drawRoundel(ctx, cx, AXLE, 1.9)
  }

  // Wing badge, sitting in the recess punched out above.
  drawRoundel(ctx, 31.5, 14.6, 2.0)

  ctx.restore()
}

const car: Filler = (arr, count) => {
  sampleMask(arr, count, drawCar, { scale: 12, depth: 0.55 })
}

/* -------------------------------------------------------------------------- */
/* 2. Portrait — framed bust, or the real photo if one is configured           */
/* -------------------------------------------------------------------------- */

const drawPortrait: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)

  // Frame
  ctx.lineWidth = 2.4
  ctx.beginPath()
  const x = 22
  const y = 10
  const w = 56
  const h = 76
  const r = 6
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
  ctx.stroke()

  // Head
  ctx.beginPath()
  ctx.arc(50, 40, 13, 0, TAU)
  ctx.fill()

  // Shoulders — a clipped ellipse so it stops at the frame's lower edge.
  ctx.save()
  ctx.beginPath()
  ctx.rect(x + 3, 56, w - 6, 27)
  ctx.clip()
  ctx.beginPath()
  ctx.ellipse(50, 92, 25, 34, 0, 0, TAU)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}

const portrait: Filler = (arr, count) => {
  sampleMask(arr, count, drawPortrait, { scale: 11, depth: 0.5 })
}

/* -------------------------------------------------------------------------- */
/* 3. Landscape — layered ridgelines under a low sun                           */
/* -------------------------------------------------------------------------- */

/**
 * The roundel, as a single-colour mask.
 *
 * There's no colour to work with here, so the quartered look has to come from
 * geometry: an outer ring plus two opposing filled quadrants. The other two
 * quadrants are simply left empty, and the eye fills them in.
 */
function drawRoundel(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.lineWidth = r * 0.3
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.85, 0, TAU)
  ctx.stroke()

  const q = r * 0.6
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, q, Math.PI, Math.PI * 1.5) // upper-left
  ctx.closePath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, q, 0, Math.PI * 0.5) // lower-right
  ctx.closePath()
  ctx.fill()
}

/** Traces a ridge polyline. `close` drops it to the baseline for a filled mass. */
function ridge(
  ctx: CanvasRenderingContext2D,
  pts: number[][],
  close?: { baseline: number },
) {
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  if (close) {
    ctx.lineTo(pts[pts.length - 1][0], close.baseline)
    ctx.lineTo(pts[0][0], close.baseline)
    ctx.closePath()
  }
}

/**
 * Distant ridges are drawn as strokes and only the nearest as a filled mass.
 * Filling all three would stack into one solid triangle with no depth — the
 * line/mass contrast is what makes the layers separate at a glance.
 */
const drawMountains: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)
  // The composition sits low in its 100-unit box; lift it so the sampled cloud
  // is centred on the origin rather than hanging below it.
  ctx.translate(0, -8)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Sun, sitting behind the peaks
  ctx.beginPath()
  ctx.arc(67, 31, 10, 0, TAU)
  ctx.fill()

  // Back ridge
  ctx.lineWidth = 2.0
  ridge(ctx, [
    [2, 54], [14, 41], [24, 48], [37, 31], [49, 45],
    [59, 37], [72, 50], [86, 35], [98, 51],
  ])
  ctx.stroke()

  // Mid ridge
  ctx.lineWidth = 2.6
  ridge(ctx, [
    [2, 66], [13, 56], [27, 63], [40, 50], [53, 61],
    [67, 53], [80, 64], [91, 57], [98, 66],
  ])
  ctx.stroke()

  // Front mass, filled down to the baseline
  ridge(
    ctx,
    [
      [2, 80], [11, 69], [23, 75], [35, 62], [47, 73],
      [61, 64], [75, 76], [88, 66], [98, 75],
    ],
    // Shallow baseline on purpose: a taller filled mass eats most of the
    // particle budget and starves the ridgelines that carry the depth.
    { baseline: 90 },
  )
  ctx.fill()

  ctx.globalCompositeOperation = 'destination-out'

  // Separation gap under the mid ridge so the filled mass doesn't swallow it.
  ctx.lineWidth = 3.2
  ridge(ctx, [
    [2, 76], [11, 65], [23, 71], [35, 58], [47, 69],
    [61, 60], [75, 72], [88, 62], [98, 71],
  ])
  ctx.stroke()

  // Two horizontal haze bands through the near mass — reads as depth, and
  // stops the largest solid region from becoming a featureless slab.
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(4, 83)
  ctx.lineTo(96, 83)
  ctx.moveTo(12, 87)
  ctx.lineTo(88, 87)
  ctx.stroke()

  ctx.globalCompositeOperation = 'source-over'
  ctx.restore()
}

const mountains: Filler = (arr, count) => {
  sampleMask(arr, count, drawMountains, { scale: 12.5, depth: 0.5 })
}

/** Alternative third shape: the particles spell a word instead. */
const word: Filler = (arr, count) => {
  // Generic family first so this still works before webfonts land; the async
  // refine pass re-samples with the real face once it's ready.
  sampleMask(arr, count, textDraw(visuals.wordShape, 'sans-serif'), {
    scale: 13,
    depth: 0.45,
  })
}

/* -------------------------------------------------------------------------- */
/* 4. Heart — solid 3D, not a flat cut-out                                     */
/* -------------------------------------------------------------------------- */

/**
 * Rejection-sampled from the implicit 2D heart (x² + y² − 1)³ − x²y³ ≤ 0, then
 * inflated along z. Doing this analytically rather than through the rasteriser
 * gives real volume, so the heart still reads when the cloud rotates.
 */
const heart: Filler = (arr, count) => {
  const SCALE = 3.1

  for (let i = 0; i < count; i++) {
    let x = 0
    let y = 0

    // Bounded retry: the accept region covers ~30% of the box, so this
    // essentially always succeeds well inside the cap.
    for (let attempt = 0; attempt < 64; attempt++) {
      const cx = (Math.random() * 2 - 1) * 1.35
      const cy = (Math.random() * 2 - 1) * 1.35
      const s = cx * cx + cy * cy - 1
      if (s * s * s - cx * cx * cy * cy * cy <= 0) {
        x = cx
        y = cy
        break
      }
    }

    // Inflate: thickest at the centre, tapering to nothing at the outline.
    const falloff = Math.sqrt(Math.max(0, 1 - (x * x + y * y) / 1.9))
    const z = (Math.random() * 2 - 1) * 1.5 * falloff

    const i4 = i * 4
    arr[i4] = x * SCALE
    // The implicit curve's mass sits above the origin; offset so the rendered
    // heart is vertically centred on the group.
    arr[i4 + 1] = (y - 0.12) * SCALE
    arr[i4 + 2] = z
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Camera aperture — for the photography section                            */
/* -------------------------------------------------------------------------- */

const drawAperture: MaskDraw = (ctx, S) => {
  const k = S / 100
  ctx.save()
  ctx.scale(k, k)
  ctx.translate(50, 50)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  // Outer body ring
  ctx.lineWidth = 3.5
  ctx.beginPath()
  ctx.arc(0, 0, 42, 0, TAU)
  ctx.stroke()

  // Inner ring
  ctx.lineWidth = 2.0
  ctx.beginPath()
  ctx.arc(0, 0, 30, 0, TAU)
  ctx.stroke()

  // Six-blade diaphragm
  ctx.lineWidth = 2.8
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU - Math.PI / 2
    const aNext = ((i + 1) / 6) * TAU - Math.PI / 2
    const r = 28
    const x1 = Math.cos(a) * r
    const y1 = Math.sin(a) * r
    const x2 = Math.cos(aNext) * r
    const y2 = Math.sin(aNext) * r
    const mid = (a + aNext) / 2
    const tipR = 11
    const tx = Math.cos(mid) * tipR
    const ty = Math.sin(mid) * tipR

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(tx, ty)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  // Centre circle (lens reflection)
  ctx.beginPath()
  ctx.arc(0, 0, 5, 0, TAU)
  ctx.fill()

  ctx.restore()
}

const aperture: Filler = (arr, count) => {
  sampleMask(arr, count, drawAperture, { scale: 11, depth: 0.5 })
}

/* -------------------------------------------------------------------------- */

/** Debug: the canvas-drawn masks, keyed by name. See `maskToDataURL`. */
export const debugMasks: Record<string, MaskDraw> = {
  car: drawCar,
  portrait: drawPortrait,
  mountains: drawMountains,
  aperture: drawAperture,
}

export const shapeFillers: Filler[] = [
  car,
  portrait,
  visuals.thirdShape === 'word' ? word : mountains,
  heart,
  aperture,
]

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
 * Second pass for anything that isn't available synchronously: the real webfont
 * for the word, and the portrait photo if one is configured. Rewrites the
 * affected textures in place so the running simulation just picks them up.
 */
export async function refineShapeTextures(
  textures: THREE.DataTexture[],
  size: number,
): Promise<void> {
  const count = size * size

  // Word — re-sample once the display face is actually loaded.
  if (visuals.thirdShape === 'word') {
    try {
      await document.fonts.ready
      const data = textures[2].image.data as unknown as Float32Array
      const ok = sampleMask(
        data,
        count,
        textDraw(visuals.wordShape, "'Space Grotesk', sans-serif"),
        { scale: 13, depth: 0.45 },
      )
      if (ok) textures[2].needsUpdate = true
    } catch {
      /* keep the fallback glyphs */
    }
  }

  // Car — an exact silhouette from artwork beats any hand-drawn path.
  if (visuals.carImage) {
    const img = await loadImage(visuals.carImage)
    if (img) {
      const data = textures[0].image.data as unknown as Float32Array
      const ok = sampleImageMask(data, count, img, {
        scale: 13,
        depth: 0.55,
        mode: visuals.carImageMode,
        tolerance: visuals.carImageTolerance,
      })
      if (ok) textures[0].needsUpdate = true
    }
  }

  // Portrait — only if the user pointed us at an image.
  if (visuals.portraitImage) {
    const img = await loadImage(visuals.portraitImage)
    if (img) {
      const data = textures[1].image.data as unknown as Float32Array
      const ok = sampleImage(data, count, img, { scale: 11, depth: 0.5 })
      if (ok) textures[1].needsUpdate = true
    }
  }

  // Photography — optional image for the aperture shape.
  if (visuals.photographyImage) {
    const img = await loadImage(visuals.photographyImage)
    if (img) {
      const data = textures[4].image.data as unknown as Float32Array
      const ok = sampleImage(data, count, img, { scale: 11, depth: 0.5 })
      if (ok) textures[4].needsUpdate = true
    }
  }
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
