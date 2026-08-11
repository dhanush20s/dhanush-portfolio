# Aether — portfolio

React + Three.js portfolio with a GPU particle field that morphs between shapes
as you scroll.

```bash
npm install
npm run dev      # http://localhost:5273
npm run build
```

## The two files you'll actually edit

| File | What's in it |
|------|--------------|
| `src/data/content.ts` | Every word on the site — name, projects, experience, links. |
| `src/data/visuals.ts` | Every knob on the look — brightness, bloom, shape choice, scrim. |

Nothing else needs touching to make the site yours.

## How the particle field works

124k particles live in two floating-point textures (position + velocity) and are
stepped entirely on the GPU via `GPUComputationRenderer`. Each particle is a
spring pulled toward its slot in the current shape, with a curl-noise field
layered on top so the cloud keeps breathing once it settles.

```
src/gl/
  Scene.tsx          Canvas, camera, post-processing stack
  ParticleField.tsx  GPGPU setup + per-frame uniforms
  Backdrop.tsx       Full-screen aurora
  shapes.ts          The four morph targets
  sampler.ts         Turns canvas drawings / glyphs / photos into targets
  shaders/           GLSL, as template strings (no bundler plugin needed)
```

Scroll position maps to a fractional "stage" index (`src/lib/scroll.ts`). The
simulation blends between shape N and N+1. The mapping has a deliberate plateau
so each section rests on its own shape instead of sitting permanently mid-morph.

### The shapes

| Stage | Section | Shape |
|-------|---------|-------|
| 0 | Hero | Car, side elevation |
| 1 | About | Framed portrait (or your photo) |
| 2 | Work | Layered mountain landscape |
| 3 | Contact | Heart |

Three of the four are flat, which is why the cloud sways rather than spins — a
continuous yaw would turn them edge-on and erase them.

### Matching a real photo exactly

`sampler.ts` turns any drawing, glyph, or image into particle targets, so you
are not limited to the hand-drawn paths in `shapes.ts`. The hand-drawn car is
only a stand-in — to match a specific car, sample the photograph.

Drop the image into `public/` and point at it:

```ts
carImage: '/car.jpg',
carImageMode: 'photo',
```

No image editor needed. `photo` mode floods inward from the border to remove
the background, then weights particles by **edge strength and brightness**
inside the subject — so panel gaps, glass, wheel spokes and badges survive
instead of collapsing into a flat blob. The subject's bounding box is fitted to
the shape's scale automatically, so a photo with a lot of empty wall still
fills the frame.

Modes:

| Mode | Use for |
|------|---------|
| `photo` | A real photograph. Background removal + edge/tone weighting. |
| `subject` | Same removal, flat filled silhouette. |
| `alpha` | A cut-out PNG with transparency. |
| `dark` / `light` | Flat-colour artwork on a contrasting ground. |

If the background isn't fully removed, or the car is being eaten, adjust
`carImageTolerance` (default 34). Check the result directly:

```bash
node tools/make-test-photo.mjs          # builds public/test-car.png to try against
MSYS_NO_PATHCONV=1 SUBJECT=/car.jpg MODE=photo node tools/shoot.mjs
# -> shots/subject.png, rendered as density so you can see the weighting
```

`MSYS_NO_PATHCONV=1` matters on Git Bash — it otherwise rewrites `/car.jpg`
into a Windows path before Node ever sees it.

The same applies to `portraitImage` for a real headshot. Tight crop, high
contrast, plain background — busy photos turn to mush at particle resolution.

## Debugging the simulation

In dev, two helpers hang off `window`:

- `__probe()` — reads live particle positions back off the GPU and prints an
  ASCII occupancy grid plus a bounding box. This is the only reliable way to
  tell a formed silhouette from a converged-looking blob.
- `__snap(mode, shapeIndex)` — `mode 1` teleports particles onto their target;
  `mode 2` writes the sampled target into the velocity buffer so a readback
  shows exactly what the GPU thinks the target is. `shapeIndex` pins one shape.

`tools/shoot.mjs` drives all of this headlessly and captures a screenshot per
section:

```bash
node tools/shoot.mjs                                  # screenshots into ./shots
SNAP=2 SHAPE=0 node tools/shoot.mjs                   # inspect shape 0's target
SETTLE=20000 node tools/shoot.mjs                     # longer settle per section
```

It runs Chromium on SwiftShader, which renders at a few frames per second. The
simulation is stepped per frame, not per wall-clock second, so shapes take
*much* longer to form there than in a real browser — budget 15–20s of settle
per shot. On a GPU it's about a second.

## Performance

Quality tier is picked once from viewport, pointer type, and core count
(`src/lib/store.ts`), and drives particle count and DPR cap. `prefers-reduced-
motion` disables post-processing, the custom cursor, smooth scrolling, and the
idle animation.
