/**
 * Turns canvas artwork into particle target positions.
 *
 * Anything you can draw on a canvas — a path, a glyph — gets rasterised to an
 * offscreen mask, and particles are rejection-sampled from the opaque pixels.
 * That's what lets the field form a code bracket or a paper plane instead of
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
 * Debug: renders a mask to a PNG data URL, black-backed so the cut-outs are
 * visible. Authoring a silhouette blind is miserable — this is how you check
 * that a detail actually punched through.
 */
export function maskToDataURL(draw: MaskDraw): string {
  const ctx = makeCtx(RASTER)
  ctx.clearRect(0, 0, RASTER, RASTER)
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#fff'
  draw(ctx, RASTER)

  // Paint the background in behind the finished mask, so any destination-out
  // punches above don't erase it too.
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, RASTER, RASTER)
  ctx.globalCompositeOperation = 'source-over'

  return ctx.canvas.toDataURL('image/png')
}
