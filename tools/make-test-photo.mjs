/**
 * Builds a synthetic "photograph" for testing background removal: the car
 * silhouette over a shaded, noisy concrete-ish wall with a ground shadow.
 *
 * The point is to exercise `subject` mode against something that behaves like a
 * real photo — an uneven background, a soft shadow, no alpha channel — without
 * needing the real image on disk.
 *
 *   node tools/make-test-photo.mjs
 */
import { chromium } from 'playwright-core'
import { readFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MASK = path.join(ROOT, 'shots', 'mask-car.png')
const OUT = path.join(ROOT, 'public', 'test-car.png')
const EXE =
  process.env.CHROME_PATH ??
  path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1228/chrome-win64/chrome.exe')

mkdirSync(path.join(ROOT, 'public'), { recursive: true })

const maskDataUrl = `data:image/png;base64,${readFileSync(MASK).toString('base64')}`

const browser = await chromium.launch({ executablePath: EXE })
const page = await browser.newPage({ viewport: { width: 916, height: 565 } })

await page.setContent(`
<body style="margin:0">
<canvas id="c" width="916" height="565"></canvas>
<script>
const c = document.getElementById('c')
const x = c.getContext('2d')

// Uneven concrete wall: vertical gradient plus blotches, so the flood fill has
// to cope with a background that is nowhere near a single flat colour.
const g = x.createLinearGradient(0, 0, 0, 565)
g.addColorStop(0, '#8d8d8f'); g.addColorStop(0.6, '#7a7a7c'); g.addColorStop(1, '#9a9a99')
x.fillStyle = g; x.fillRect(0, 0, 916, 565)

for (let i = 0; i < 260; i++) {
  x.globalAlpha = 0.05 + Math.random() * 0.06
  x.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#4c4c4e'
  x.beginPath()
  x.ellipse(Math.random()*916, Math.random()*565, 20+Math.random()*90, 12+Math.random()*50, Math.random()*3, 0, 6.283)
  x.fill()
}
x.globalAlpha = 1

const img = new Image()
img.onload = () => {
  // Ground shadow under the car.
  x.globalAlpha = 0.45
  x.fillStyle = '#3a3a3c'
  x.beginPath()
  x.ellipse(458, 468, 330, 26, 0, 0, 6.283)
  x.fill()
  x.globalAlpha = 1

  // The car itself, white-on-black mask drawn as a bright body.
  const t = document.createElement('canvas')
  t.width = 512; t.height = 512
  const tx = t.getContext('2d')
  tx.drawImage(img, 0, 0)
  const d = tx.getImageData(0, 0, 512, 512)
  for (let i = 0; i < 512 * 512; i++) {
    const lum = d.data[i*4]
    d.data[i*4+3] = lum > 110 ? 255 : 0
    d.data[i*4] = 246; d.data[i*4+1] = 247; d.data[i*4+2] = 250
  }
  tx.putImageData(d, 0, 0)

  x.drawImage(t, 60, 110, 800, 350)
  document.title = 'ready'
}
img.src = '${maskDataUrl}'
</script>
</body>`)

await page.waitForFunction(() => document.title === 'ready')
await page.locator('#c').screenshot({ path: OUT })
console.log('wrote', OUT)
await browser.close()
