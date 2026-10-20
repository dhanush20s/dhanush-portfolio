/**
 * End-to-end checks, run in real Chrome against a built site.
 *
 *   npm run build && npx vite preview --port 4173      (in another terminal)
 *   node tools/e2e.mjs [url] [outDir]
 *
 * CHROME_PATH overrides the browser. Exits non-zero if anything fails.
 */
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const URL = process.argv[2] ?? 'http://localhost:4173'
const OUT = process.argv[3] ?? path.join(process.cwd(), 'e2e-shots')
const EXE = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const EMAIL = 'dhanush8939s@gmail.com'
const SECTIONS = ['index', 'about', 'stack', 'work', 'path', 'contact']

mkdirSync(OUT, { recursive: true })

const SOFTWARE_GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
const results = []

function record(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`)
}

async function check(name, fn) {
  try {
    const detail = await fn()
    record(name, true, typeof detail === 'string' ? detail : '')
  } catch (e) {
    record(name, false, String(e.message ?? e).split('\n')[0])
  }
}

function expect(cond, msg) {
  if (!cond) throw new Error(msg)
}

/** Opens a page and records anything that would be a real bug in production. */
async function open(browser, { width, height, mobile = false, reducedMotion, route = '/' }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: mobile,
    isMobile: mobile,
    reducedMotion,
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await ctx.newPage()
  const problems = []
  page.on('pageerror', (e) => problems.push('pageerror: ' + e))
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 160))
  })
  page.on('requestfailed', (r) => problems.push('request failed: ' + r.url()))
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`HTTP ${r.status()}: ${r.url()}`)
  })
  await page.goto(URL + route, { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  return { ctx, page, problems }
}

const browser = await chromium.launch({ executablePath: EXE, args: SOFTWARE_GL })

/* ---- 1. Responsive matrix ------------------------------------------------ */

const VIEWPORTS = [
  ['320x640 small phone', 320, 640, true],
  ['360x740 android', 360, 740, true],
  ['390x844 iphone', 390, 844, true],
  ['768x1024 tablet', 768, 1024, true],
  ['1024x768 small laptop', 1024, 768, false],
  ['1440x900 laptop', 1440, 900, false],
  ['1920x1080 desktop', 1920, 1080, false],
]

for (const [label, w, h, mobile] of VIEWPORTS) {
  await check(`layout @ ${label}`, async () => {
    const { ctx, page, problems } = await open(browser, { width: w, height: h, mobile })
    const info = await page.evaluate((ids) => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      missing: ids.filter((id) => !document.getElementById(id)),
      h1: document.querySelector('.hero__name')?.textContent?.trim(),
      ctaVisible: !!document.querySelector('.hero__cta--primary'),
    }), SECTIONS)
    await page.screenshot({ path: path.join(OUT, `hero-${w}x${h}.png`) })
    await ctx.close()
    expect(info.overflow <= 0, `horizontal overflow of ${info.overflow}px`)
    expect(info.missing.length === 0, `missing sections: ${info.missing}`)
    expect(info.h1 === 'Dhanush' || info.h1?.toUpperCase().includes('DHANUSH'), `hero name was "${info.h1}"`)
    expect(info.ctaVisible, 'hero CTA missing')
    expect(problems.length === 0, problems.slice(0, 3).join(' | '))
  })
}

/* ---- 2. Desktop interactions --------------------------------------------- */

{
  const { ctx, page, problems } = await open(browser, { width: 1440, height: 900 })

  await check('nav links scroll to their sections', async () => {
    for (const [label, id] of [['About', 'about'], ['Stack', 'stack'], ['Work', 'work'], ['Path', 'path'], ['Contact', 'contact']]) {
      await page.locator('.nav__links button', { hasText: label }).first().click()
      await page.waitForTimeout(3200)
      const top = await page.evaluate((i) => document.getElementById(i).getBoundingClientRect().top, id)
      expect(top > -120 && top < 260, `${label}: section top at ${Math.round(top)}px`)
    }
  })

  await check('work filters show the right counts and cards', async () => {
    await page.evaluate(() => document.getElementById('work').scrollIntoView())
    await page.waitForTimeout(1500)
    const tabs = await page.locator('.wfilter__tab').allInnerTexts()
    expect(tabs.length === 3, `expected 3 tabs, got ${tabs.length}`)
    const expected = [6, 2, 4]
    for (let i = 0; i < 3; i++) {
      await page.locator('.wfilter__tab').nth(i).click()
      await page.waitForTimeout(700)
      const n = await page.locator('.wcard').count()
      expect(n === expected[i], `tab ${i}: ${n} cards, expected ${expected[i]}`)
      // CSS uppercases these labels, so compare case-insensitively.
      const label = (await page.locator('.wfilter__count').innerText()).toLowerCase()
      expect(label.includes(`${expected[i]} of 6`), `count label "${label}"`)
    }
  })

  await check('client project cards link to the live sites', async () => {
    await page.locator('.wfilter__tab').nth(1).click()
    await page.waitForTimeout(500)
    const hrefs = await page.locator('a.wcard').evaluateAll((els) =>
      els.map((e) => ({ href: e.href, rel: e.rel, target: e.target })))
    expect(hrefs.length === 2, `expected 2 linked cards, got ${hrefs.length}`)
    for (const h of hrefs) {
      expect(h.href.startsWith('https://'), `bad href ${h.href}`)
      expect(h.target === '_blank' && h.rel.includes('noreferrer'), `unsafe external link ${h.href}`)
    }
    return hrefs.map((h) => h.href).join(', ')
  })

  await check('capabilities tabs, cards and arrows stay in sync', async () => {
    await page.evaluate(() => document.getElementById('stack').scrollIntoView())
    await page.waitForTimeout(1500)
    const active = () => page.evaluate(() => [...document.querySelectorAll('.cap')].findIndex((c) => c.classList.contains('is-active')))
    expect((await active()) === 0, 'card 0 should start active')
    await page.locator('.cap__tab').nth(2).click()
    expect((await active()) === 2, 'tab 3 should activate card 3')
    await page.locator('.cap__nav button').nth(1).click()
    expect((await active()) === 3, 'next arrow should go to card 4')
    await page.locator('.cap__nav button').nth(1).click()
    expect((await active()) === 0, 'next arrow should wrap to card 1')
    await page.locator('.cap__nav button').nth(0).click()
    expect((await active()) === 3, 'previous arrow should wrap to card 4')
    await page.locator('.cap').nth(1).click()
    expect((await active()) === 1, 'clicking a card should activate it')
  })

  await check('contact: email, phone, copy button and resume', async () => {
    await page.evaluate(() => document.getElementById('contact').scrollIntoView())
    await page.waitForTimeout(2500)
    const mail = await page.locator('a.ccard__btn--primary').getAttribute('href')
    expect(mail === `mailto:${EMAIL}`, `mailto was ${mail}`)
    const tel = await page.locator('a[href^="tel:"]').first().getAttribute('href')
    expect(tel === 'tel:+919123503662', `tel was ${tel}`)
    await page.locator('button.ccard__btn').click()
    await page.waitForTimeout(400)
    expect((await page.locator('button.ccard__btn').innerText()).toLowerCase().includes('copied'), 'copy button did not confirm')
    expect((await page.evaluate(() => navigator.clipboard.readText())) === EMAIL, 'clipboard did not get the email')
    const res = await page.request.get(URL + '/Dhanush_Kumar_RN.pdf')
    expect(res.status() === 200, `resume HTTP ${res.status()}`)
    expect((res.headers()['content-type'] ?? '').includes('pdf'), `resume type ${res.headers()['content-type']}`)
    const socials = await page.locator('.ccard__link[target="_blank"]').evaluateAll((els) => els.map((e) => e.href))
    expect(socials.some((s) => s.includes('github.com/dhanush20s')), 'GitHub link missing')
    expect(socials.some((s) => s.includes('linkedin.com/in/')), 'LinkedIn link missing')
  })

  await check('no console errors or failed requests during desktop run', async () => {
    expect(problems.length === 0, problems.slice(0, 3).join(' | '))
  })

  await ctx.close()
}

/* ---- 3. Keyboard and accessibility --------------------------------------- */

await check('keyboard: skip link first, focus rings visible, skip works', async () => {
  const { ctx, page } = await open(browser, { width: 1440, height: 900 })
  await page.keyboard.press('Tab')
  const first = await page.evaluate(() => document.activeElement?.className ?? '')
  expect(String(first).includes('skip-link'), `first tab stop was "${first}"`)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(300)
  expect((await page.evaluate(() => location.hash)) === '#content', 'skip link did not jump to #content')
  const bad = []
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab')
    const r = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      return { tag: el.tagName + '.' + el.className, outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 }
    })
    if (r && !r.outline) bad.push(r.tag)
  }
  await ctx.close()
  expect(bad.length === 0, `no focus ring on: ${bad.join(', ')}`)
})

await check('page has one h1, labelled landmarks, and alt-less images are decorative', async () => {
  const { ctx, page } = await open(browser, { width: 1440, height: 900 })
  const info = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    nav: document.querySelectorAll('nav').length,
    lang: document.documentElement.lang,
    imgNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content?.length ?? 0,
    ld: !!document.querySelector('script[type="application/ld+json"]'),
  }))
  await ctx.close()
  expect(info.h1 === 1, `${info.h1} h1 elements`)
  expect(info.main === 1 && info.nav >= 1, `main=${info.main} nav=${info.nav}`)
  expect(info.lang === 'en', `lang="${info.lang}"`)
  expect(info.imgNoAlt === 0, `${info.imgNoAlt} images without alt`)
  expect(info.title.includes('Dhanush') && info.desc > 60, `title/description weak: "${info.title}"`)
  expect(info.ld, 'JSON-LD missing')
})

/* ---- 4. Robustness ------------------------------------------------------- */

await check('reduced motion: content is visible immediately', async () => {
  const { ctx, page, problems } = await open(browser, { width: 1440, height: 900, reducedMotion: 'reduce' })
  const op = await page.evaluate(() => Number(getComputedStyle(document.querySelector('.hero__name .reveal-char')).opacity))
  await ctx.close()
  expect(op === 1, `hero name opacity ${op}`)
  expect(problems.length === 0, problems.slice(0, 2).join(' | '))
})

{
  // A browser with no WebGL at all: the content must still work.
  const noGl = await chromium.launch({ executablePath: EXE, args: ['--disable-3d-apis', '--disable-gpu'] })
  await check('no WebGL: static fallback shown, content intact, no crashes', async () => {
    const { ctx, page, problems } = await open(noGl, { width: 1440, height: 900 })
    const info = await page.evaluate(() => ({
      fallback: !!document.querySelector('.canvas-fallback'),
      canvas: !!document.querySelector('canvas'),
      h1: document.querySelector('.hero__name')?.textContent?.trim(),
    }))
    await ctx.close()
    expect(info.fallback, 'fallback background missing')
    expect(!info.canvas, 'canvas mounted even though WebGL is off')
    expect(!!info.h1, 'hero did not render')
    expect(problems.length === 0, problems.slice(0, 2).join(' | '))
  })
  await noGl.close()
}

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) {
  console.log('Failures:')
  for (const f of failed) console.log(` - ${f.name}: ${f.detail}`)
  process.exit(1)
}
