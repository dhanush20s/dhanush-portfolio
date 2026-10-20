# Dhanush — Portfolio

Personal portfolio: a scroll-driven WebGL particle scene (React atom → `</>` → service network → growth → paper plane) behind sections for About, Stack, Work, Path and Contact.

**Stack:** Vite · React 18 · TypeScript · Three.js / React Three Fiber · GLSL (GPGPU particles) · GSAP · Lenis

## Run

```bash
npm install
npm run dev      # http://localhost:5273
npm run build    # type-check + production build
```

## Where to edit

| What | File |
| --- | --- |
| Name, headline, projects, skills, experience, links | `src/data/content.ts` |
| Particle brightness, bloom, scrim, cloud position | `src/data/visuals.ts` |
| Particle shapes (one per section) | `src/gl/shapes.ts` |
| Particle colours | `src/gl/shaders/particles.glsl.ts` |
| Resume PDF | `public/Dhanush_Kumar_RN.pdf` |

## Test

```bash
npm run build
npx vite preview --port 4173        # terminal 1
npm run test:e2e                    # terminal 2 (needs Chrome; set CHROME_PATH if not default)
```

The suite ([tools/e2e.mjs](tools/e2e.mjs)) checks 7 viewport sizes (320px to 1920px) for overflow and console errors, navigation, project filters, capability cards, contact actions (email, phone, copy, resume), keyboard access, reduced motion and the no-WebGL fallback.

Deploys to Vercel (`vercel.json`).
