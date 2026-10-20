/* ============================================================================
   Visual dials.

   Every knob that changes how the scene *feels* lives here, so you can taste-
   test the look without reading a shader. Values are live on save (Vite HMR).
   ========================================================================== */

export const visuals = {
  /** Particle brightness. 0.4 = subtle haze, 0.9 = dense glowing nebula. */
  opacity: 0.78,

  /**
   * Base point size. Larger = chunkier and more "bokeh", but the shapes' cut-out
   * details (windows, wheel hubs, letter counters) start to fill in above ~1.2.
   */
  size: 1.0,

  /** Bloom strength on the hot particle cores. */
  bloom: 0.9,

  /**
   * Only pixels brighter than this bloom. Lower = more of the frame glows
   * (dreamier, hazier) at the cost of the silhouette blowing out to white.
   */
  bloomThreshold: 0.36,

  /** Lens fringing. Keep tiny — past ~0.001 it reads as a dirty screen. */
  aberration: 0.0004,

  /** Aurora backdrop brightness behind the particles. */
  backdrop: 0.32,

  /**
   * How far right the cloud sits on landscape viewports, in world units.
   * 0 centres it behind the copy; ~4 parks it beside the text column.
   */
  offsetX: 3.9,

  /**
   * Vertical lift, in world units. Positive raises the cloud clear of the
   * headline so the two don't fight for the same band of the screen.
   */
  offsetY: 1.5,

  /**
   * Portrait (phone) viewports: the cloud is lifted into the top of the screen,
   * clear of the hero copy, and scaled down to fit the narrow width.
   */
  mobileOffsetY: 3.45,
  mobileScale: 0.62,

  /**
   * Darkening layer between canvas and copy, 0–1. This is the single control
   * for the readability-vs-spectacle trade: lower it for a louder background,
   * raise it if text starts to struggle.
   */
  scrim: 0.82,

} as const
