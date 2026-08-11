/**
 * Turns arbitrary 2D artwork into particle target positions.
 *
 * Anything you can draw on a canvas — a path, a glyph, a photo — gets
 * rasterised to an offscreen mask, and particles are rejection-sampled from the
 * opaque pixels. That's what lets the field form a car or a word instead of
 * only the shapes you can write a parametric equation for.
 */

export type MaskDraw = (ctx: CanvasRenderingContext2D, size: number) => void

const RASTER = 512

function makeCtx(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2D canvas unavailable')
  return ctx
}

/**
 * Collect the indices of every opaque pixel, then draw `count` samples from
 * that pool. Sampling the pool (rather than testing random pixels) keeps the
 * cost independent of how much of the canvas the shape actually covers.
 */
export function sampleMask(
  out: Float32Array,
  count: number,
  draw: MaskDraw,
  opts: { scale: number; depth: number },
): boolean {
  const ctx = makeCtx(RASTER)
  ctx.clearRect(0, 0, RASTER, RASTER)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, RASTER)

  const px = ctx.getImageData(0, 0, RASTER, RASTER).data
  const hits: number[] = []
  for (let p = 0; p < RASTER * RASTER; p++) {
    if (px[p * 4 + 3] > 110) hits.push(p)
  }
  if (hits.length < 32) return false

  for (let i = 0; i < count; i++) {
    const p = hits[(Math.random() * hits.length) | 0]
    // Sub-pixel jitter, or the cloud visibly snaps to the raster grid.
    const x = (p % RASTER) + Math.random()
    const y = ((p / RASTER) | 0) + Math.random()

    const i4 = i * 4
    out[i4] = (x / RASTER - 0.5) * opts.scale
    out[i4 + 1] = -(y / RASTER - 0.5) * opts.scale
    out[i4 + 2] = (Math.random() * 2 - 1) * opts.depth
  }
  return true
}

/**
 * How an image is turned into particle targets.
 *
 * - `tone`  weights by brightness, reproducing the image's values. Best for
 *           photographs and portraits.
 * - `alpha` keeps opaque pixels. Best for a cut-out PNG with a transparent
 *           background — this is the mode that gives an exact silhouette.
 * - `dark`  keeps pixels darker than mid-grey (black artwork on white).
 * - `light` keeps pixels brighter than mid-grey (white artwork on black).
 */
export type ImageSampleMode = 'tone' | 'alpha' | 'dark' | 'light' | 'subject' | 'photo'

/**
 * Flood-fills inward from the image border to find the background, leaving the
 * subject behind. Lets a plain photograph be used directly — no need to cut it
 * out in an image editor first.
 *
 * The comparison is against each pixel's *neighbour* rather than a single seed
 * colour, so a wall that shades from light to dark across the frame is still
 * consumed in one pass. The trade-off is that a soft or low-contrast edge can
 * leak; `tolerance` is the dial for that.
 *
 * Returns a byte per pixel: 1 = background.
 */
function floodBackground(
  px: Uint8ClampedArray,
  W: number,
  H: number,
  tolerance: number,
): Uint8Array {
  const bg = new Uint8Array(W * H)
  const stack: number[] = []

  const seed = (i: number) => {
    if (!bg[i]) {
      bg[i] = 1
      stack.push(i)
    }
  }

  // Every border pixel is assumed to be background.
  for (let x = 0; x < W; x++) {
    seed(x)
    seed((H - 1) * W + x)
  }
  for (let y = 0; y < H; y++) {
    seed(y * W)
    seed(y * W + W - 1)
  }

  const tol2 = tolerance * tolerance

  while (stack.length) {
    const i = stack.pop()!
    const x = i % W
    const y = (i / W) | 0
    const r = px[i * 4]
    const g = px[i * 4 + 1]
    const b = px[i * 4 + 2]

    const visit = (nx: number, ny: number) => {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) return
      const j = ny * W + nx
      if (bg[j]) return
      const dr = px[j * 4] - r
      const dg = px[j * 4 + 1] - g
      const db = px[j * 4 + 2] - b
      if (dr * dr + dg * dg + db * db <= tol2) {
        bg[j] = 1
        stack.push(j)
      }
    }

    visit(x + 1, y)
    visit(x - 1, y)
    visit(x, y + 1)
    visit(x, y - 1)
  }

  return bg
}

/** Which pixels of an image become particle targets. */
export function imageHits(
  img: HTMLImageElement,
  mode: ImageSampleMode,
  opts: { threshold?: number; tolerance?: number } = {},
): { hits: number[]; size: number } {
  const ctx = makeCtx(RASTER)
  ctx.clearRect(0, 0, RASTER, RASTER)

  // Contain the image in the square without distorting it.
  const ratio = Math.min(RASTER / img.width, RASTER / img.height)
  const w = img.width * ratio
  const h = img.height * ratio
  ctx.drawImage(img, (RASTER - w) / 2, (RASTER - h) / 2, w, h)

  const px = ctx.getImageData(0, 0, RASTER, RASTER).data
  const t = opts.threshold ?? 0.5
  const hits: number[] = []

  const needsBg = mode === 'subject' || mode === 'photo'
  const bg = needsBg ? floodBackground(px, RASTER, RASTER, opts.tolerance ?? 34) : null

  if (mode === 'photo') {
    // Subject silhouette alone is a featureless slab. Weighting each pixel by
    // edge strength *and* brightness reproduces the actual photograph: panel
    // gaps, arches, glass and wheels all get their own particle density, and
    // the outlines stay crisp because edges attract the most.
    const luma = new Float32Array(RASTER * RASTER)
    for (let p = 0; p < RASTER * RASTER; p++) {
      luma[p] =
        (0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2]) / 255
    }

    const at = (x: number, y: number) =>
      luma[Math.min(RASTER - 1, Math.max(0, y)) * RASTER + Math.min(RASTER - 1, Math.max(0, x))]

    for (let y = 0; y < RASTER; y++) {
      for (let x = 0; x < RASTER; x++) {
        const p = y * RASTER + x
        if (bg![p] || px[p * 4 + 3] < 90) continue

        // Sobel
        const gx =
          -at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1) +
          at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)
        const gy =
          -at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1) +
          at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)
        const edge = Math.min(1, Math.hypot(gx, gy) * 0.9)

        const w = Math.round(0.55 + edge * 3.4 + luma[p] * 0.9)
        for (let k = 0; k < w; k++) hits.push(p)
      }
    }
    return { hits, size: RASTER }
  }

  for (let p = 0; p < RASTER * RASTER; p++) {
    if (px[p * 4 + 3] < 90) continue

    if (mode === 'alpha') {
      hits.push(p)
      continue
    }
    if (mode === 'subject') {
      if (!bg![p]) hits.push(p)
      continue
    }

    const luma =
      (0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2]) / 255
    if (mode === 'dark' ? luma < t : luma > t) hits.push(p)
  }

  return { hits, size: RASTER }
}

export function sampleImageMask(
  out: Float32Array,
  count: number,
  img: HTMLImageElement,
  opts: {
    scale: number
    depth: number
    mode: ImageSampleMode
    threshold?: number
    tolerance?: number
  },
): boolean {
  const { hits } = imageHits(img, opts.mode, opts)
  if (hits.length < 64) return false

  // Fit the subject's own bounding box to `scale`, rather than the whole
  // image. A photo is mostly background, so without this the car would end up
  // a fraction of its intended size on screen.
  let minX = RASTER
  let maxX = 0
  let minY = RASTER
  let maxY = 0
  for (const p of hits) {
    const x = p % RASTER
    const y = (p / RASTER) | 0
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const boxW = Math.max(maxX - minX, 1)
  const boxH = Math.max(maxY - minY, 1)
  // One divisor for both axes, so the aspect ratio survives the fit.
  const unit = opts.scale / Math.max(boxW, boxH)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  for (let i = 0; i < count; i++) {
    const p = hits[(Math.random() * hits.length) | 0]
    const x = (p % RASTER) + Math.random()
    const y = ((p / RASTER) | 0) + Math.random()

    const i4 = i * 4
    out[i4] = (x - cx) * unit
    out[i4 + 1] = -(y - cy) * unit
    out[i4 + 2] = (Math.random() * 2 - 1) * opts.depth
  }
  return true
}

/**
 * Tone-weighted sampling for photographs: bright pixels attract more particles
 * than dark ones, so the cloud reproduces the image's values rather than just
 * its outline.
 */
export function sampleImage(
  out: Float32Array,
  count: number,
  img: HTMLImageElement,
  opts: { scale: number; depth: number; gamma?: number },
): boolean {
  const ctx = makeCtx(RASTER)
  ctx.clearRect(0, 0, RASTER, RASTER)

  // Contain the image in the square without distorting it.
  const ratio = Math.min(RASTER / img.width, RASTER / img.height)
  const w = img.width * ratio
  const h = img.height * ratio
  ctx.drawImage(img, (RASTER - w) / 2, (RASTER - h) / 2, w, h)

  const px = ctx.getImageData(0, 0, RASTER, RASTER).data
  const gamma = opts.gamma ?? 0.85

  // Weighted pool: a pixel is entered once per unit of brightness, capped so a
  // blown-out highlight can't swallow the whole budget.
  const pool: number[] = []
  for (let p = 0; p < RASTER * RASTER; p++) {
    const a = px[p * 4 + 3]
    if (a < 40) continue
    const luma = (0.2126 * px[p * 4] + 0.7152 * px[p * 4 + 1] + 0.0722 * px[p * 4 + 2]) / 255
    const weight = Math.round(Math.pow(luma, gamma) * 4)
    for (let k = 0; k < weight; k++) pool.push(p)
  }
  if (pool.length < 64) return false

  for (let i = 0; i < count; i++) {
    const p = pool[(Math.random() * pool.length) | 0]
    const x = (p % RASTER) + Math.random()
    const y = ((p / RASTER) | 0) + Math.random()

    const i4 = i * 4
    out[i4] = (x / RASTER - 0.5) * opts.scale
    out[i4 + 1] = -(y / RASTER - 0.5) * opts.scale
    out[i4 + 2] = (Math.random() * 2 - 1) * opts.depth
  }
  return true
}

/**
 * Draws `text` centred and fitted to the canvas width.
 *
 * `family` must be a font family list only — no size, no weight. The CSS font
 * shorthand this builds is order-sensitive, and an invalid string is silently
 * ignored by the canvas, leaving the default 10px face and a shape a fraction
 * of the intended size.
 */
export function textDraw(
  text: string,
  family = 'sans-serif',
  weight = '700',
  fitRatio = 0.9,
): MaskDraw {
  return (ctx, S) => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Measure once at a reference size, then scale — no search needed since
    // glyph advance is linear in font size.
    const probe = 100
    ctx.font = `${weight} ${probe}px ${family}`
    const measured = ctx.measureText(text).width || 1

    // Also cap by height so a short word doesn't blow up past the canvas.
    const size = Math.min((probe * (S * fitRatio)) / measured, S * 0.46)

    ctx.font = `${weight} ${size}px ${family}`
    ctx.fillText(text, S / 2, S / 2)
  }
}

/**
 * Debug: renders a mask to a PNG data URL, black-backed so the cut-outs are
 * visible. Authoring a silhouette blind is miserable — this is how you check
 * that a wheel arch or a badge actually punched through.
 */
export function maskToDataURL(draw: MaskDraw): string {
  const ctx = makeCtx(RASTER)
  ctx.clearRect(0, 0, RASTER, RASTER)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, RASTER)

  // Paint the background in behind the finished mask, so the destination-out
  // punches above don't erase it too.
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, RASTER, RASTER)
  ctx.globalCompositeOperation = 'source-over'

  return ctx.canvas.toDataURL('image/png')
}

/**
 * Debug: renders the extracted hit mask for an image as a PNG data URL. This is
 * how you tune `tolerance` — you can see the leak or the fringe directly
 * instead of guessing from the particle cloud.
 */
export async function subjectPreview(
  src: string,
  mode: ImageSampleMode,
  tolerance: number,
): Promise<string | null> {
  const img = await loadImage(src)
  if (!img) return null

  const { hits, size } = imageHits(img, mode, { tolerance })

  // Hits are a weighted pool — a pixel appears once per unit of weight — so
  // count occurrences and render density, not just coverage. Otherwise every
  // mode looks like a flat silhouette and there's nothing to tune against.
  const density = new Uint16Array(size * size)
  let peak = 1
  for (const p of hits) {
    density[p]++
    if (density[p] > peak) peak = density[p]
  }

  const ctx = makeCtx(size)
  const frame = ctx.createImageData(size, size)
  for (let p = 0; p < size * size; p++) {
    const v = density[p] ? Math.round(60 + (density[p] / peak) * 195) : 0
    frame.data[p * 4] = v
    frame.data[p * 4 + 1] = v
    frame.data[p * 4 + 2] = v
    frame.data[p * 4 + 3] = 255
  }
  ctx.putImageData(frame, 0, 0)

  return ctx.canvas.toDataURL('image/png')
}

/** Loads an image for `sampleImage`. Resolves to null if it can't be used. */
export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()

    // Sampling reads pixels back, which taints the canvas without CORS — but
    // only cross-origin sources need the attribute, and setting it regardless
    // can fail an otherwise fine same-origin load.
    const sameOrigin =
      src.startsWith('data:') ||
      src.startsWith('blob:') ||
      src.startsWith('/') ||
      src.startsWith(window.location.origin)
    if (!sameOrigin) img.crossOrigin = 'anonymous'

    img.onload = () => resolve(img)
    img.onerror = () => {
      console.warn('[sampler] could not load image:', src)
      resolve(null)
    }
    img.src = src
  })
}
