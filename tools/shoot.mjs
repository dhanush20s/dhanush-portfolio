/**
 * Screenshot rig.
 *
 * Drives the dev server in a real (headed-GPU-ish) Chromium so WebGL actually
 * renders, waits out the preloader, then captures each section.
 *
 *   node tools/shoot.mjs [url] [outDir]
 */
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const URL = process.argv[2] ?? 'http://localhost:5273'
const OUT = process.argv[3] ?? path.join(process.cwd(), 'shots')
const EXE =
  process.env.CHROME_PATH ??
  path.join(
    process.env.LOCALAPPDATA ?? '',
    'ms-playwright/chromium-1228/chrome-win64/chrome.exe',
  )

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  executablePath: EXE,
  args: [
    // SwiftShader gives us a real GL implementation without a physical GPU,
    // which is what makes headless WebGL captures possible at all.
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-lcd-text',
  ],
})

const page = await browser.newPage({
  viewport: { width: 1600, height: 940 },
  deviceScaleFactor: 1,
})

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text())
  if (m.text().startsWith('[shape')) errors.push(m.text())
})
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto(URL, { waitUntil: 'networkidle' })

// Preloader runs ~2.4s, then the hero reveal lands.
await page.waitForTimeout(5200)

// Dump the hand-drawn silhouettes so they can be inspected directly.
for (const name of ['car', 'portrait', 'mountains']) {
  const url = await page.evaluate((n) => window.__mask?.(n), name)
  if (url) {
    writeFileSync(path.join(OUT, `mask-${name}.png`), Buffer.from(url.split(',')[1], 'base64'))
  }
}

// Dump the extracted subject mask for an image, for tuning the tolerance.
if (process.env.SUBJECT) {
  const url = await page.evaluate(
    async ([src, tol, mode]) => {
      if (typeof window.__subject !== 'function') return 'ERR:no-hook'
      try {
        return (await window.__subject(src, mode, tol)) ?? 'ERR:null'
      } catch (e) {
        return 'ERR:' + String(e)
      }
    },
    [process.env.SUBJECT, Number(process.env.TOL ?? 34), process.env.MODE ?? 'photo'],
  )
  if (url?.startsWith('ERR:')) console.log('subject', url)
  else if (url) {
    writeFileSync(path.join(OUT, 'subject.png'), Buffer.from(url.split(',')[1], 'base64'))
    console.log('wrote subject.png')
  } else {
    console.log('subject extraction returned nothing')
  }
}

const shots = [
  ['01-hero', 'index'],
  ['02-about', 'about'],
  ['03-work', 'work'],
  ['04-path', 'path'],
  ['05-contact', 'contact'],
]

for (const [name, id] of shots) {
  await page.evaluate((target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, id)
  // Let Lenis settle and the shape morph catch up. Generous because the
  // software renderer here runs at a handful of fps and the simulation is
  // stepped per frame, not per wall-clock second.
  await page.waitForTimeout(Number(process.env.SETTLE ?? 2600))
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })
}

await page.evaluate((id) => {
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}, process.env.PROBE_ID ?? 'index')
await page.waitForTimeout(Number(process.env.PROBE_SETTLE ?? process.env.SETTLE ?? 2600))
const mode = process.env.SNAP ? Number(process.env.SNAP) : 0
if (mode) {
  const shape = Number(process.env.SHAPE ?? -1)
  console.log(
    'snap',
    JSON.stringify(await page.evaluate(([m, s]) => window.__snap?.(m, s), [mode, shape])),
  )
  await page.waitForTimeout(Number(process.env.SNAP_WAIT ?? 6000))
}
const probe = await page.evaluate(
  (m) => window.__probe?.(m > 1.5 ? 'vel' : 'pos'),
  mode,
)
if (probe) {
  console.log('stage', probe.stage, 'morph', probe.morph, 'bbox', probe.bbox.join(' '))
  probe.rows.forEach((r) => console.log('|' + r + '|'))
}

const diag = await page.evaluate(() => {
  const c = document.querySelector('canvas')
  return {
    canvas: c ? [c.width, c.height] : null,
    preloaderGone: !document.querySelector('.preloader'),
    docHeight: document.body.scrollHeight,
  }
})

console.log(JSON.stringify({ diag, errors }, null, 2))
await browser.close()
