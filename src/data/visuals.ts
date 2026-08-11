/* ============================================================================
   Visual dials.

   Every knob that changes how the scene *feels* lives here, so you can taste-
   test the look without reading a shader. Values are live on save (Vite HMR).
   ========================================================================== */

export const visuals = {
  /** Particle brightness. 0.4 = subtle haze, 0.9 = dense glowing nebula. */
  opacity: 0.6,

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
  backdrop: 0.26,

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
   * Darkening layer between canvas and copy, 0–1. This is the single control
   * for the readability-vs-spectacle trade: lower it for a louder background,
   * raise it if text starts to struggle.
   */
  scrim: 0.82,

  /* -- Particle shapes ----------------------------------------------------- */

  /**
   * Third shape (the Work section): a layered mountain landscape, or a word
   * spelled out in particles.
   */
  thirdShape: 'mountains' as 'mountains' | 'word',

  /**
   * Only used when `thirdShape` is 'word'. Short words read best — long ones
   * get too thin to hold their counters at this scale.
   */
  wordShape: 'KINDNESS',

  /**
   * Optional artwork for the car shape. This is the way to match a specific
   * car exactly — the hand-drawn path is only a stand-in.
   *
   * Put the file in /public and point at it (e.g. '/car.png'). A background-
   * removed PNG with `carImageMode: 'alpha'` gives a pixel-exact silhouette;
   * a plain photo will sample its background too.
   */
  carImage: null as string | null,

  /**
   * How `carImage` is read:
   *   'photo'   — auto-removes the background, then weights particles by edge
   *               strength and brightness. Keeps panel lines, glass, arches and
   *               wheels. This is the one to use for a real photograph.
   *   'subject' — same background removal, but a flat filled silhouette.
   *   'alpha'   — keeps opaque pixels. Use for a cut-out PNG.
   *   'dark' / 'light' — threshold a flat-colour silhouette.
   */
  carImageMode: 'photo' as 'photo' | 'subject' | 'alpha' | 'dark' | 'light',

  /**
   * Background-removal sensitivity for 'subject' mode. Higher eats more of the
   * image (good for a busy or shaded background, risks eating the subject);
   * lower is more cautious and can leave background fringes behind.
   */
  carImageTolerance: 34,

  /**
   * Optional photo for the portrait shape. Drop a file in /public and point at
   * it (e.g. '/me.jpg'), and the particles will reproduce its tones instead of
   * the generic framed bust. High-contrast, tightly-cropped headshots on a
   * plain background work far better than busy full-body photos.
   */
  portraitImage: null as string | null,

  /**
   * Optional image for the photography section shape. Drop a camera body
   * silhouette or lens icon in /public and point at it here.
   */
  photographyImage: null as string | null,
} as const
