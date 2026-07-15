import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const marketing = 'http://127.0.0.1:3000'
const docs = 'http://127.0.0.1:3001'
const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 1000 },
]

test('marketing remains usable at every acceptance viewport', async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    const response = await page.goto(marketing, { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Rust benchmarks')
    await expect(page.getByRole('link', { name: /Build your first runner/ })).toBeVisible()
    await expect(page.getByRole('table', { name: /Capabilities/ })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
    if (viewport.width <= 1024) {
      const menuButton = page.locator('.mobile-menu > summary')
      await expect(menuButton).toBeVisible()
      const box = await menuButton.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
      await menuButton.click()
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
    } else {
      await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
    }
  }
})

test('docs expose search, navigation, outline, and source-backed Markdown', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: docs })
  for (const viewport of [viewports[0], viewports[1], viewports[4]]) {
    await page.setViewportSize(viewport)
    const response = await page.goto(`${docs}/quickstart/`, { waitUntil: 'networkidle' })
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: 'Quickstart', level: 1 })).toBeVisible()
    await expect(page.locator('site-search [data-open-modal]')).toBeVisible()
    if (viewport.width < 800) {
      await expect(page.locator('mobile-starlight-toc summary')).toBeVisible()
      const menuButton = page.getByRole('button', { name: 'Menu' })
      await expect(menuButton).toBeVisible()
      const box = await menuButton.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
      await menuButton.click()
      await expect(page.locator('body')).toHaveAttribute('data-mobile-menu-expanded', '')
      await menuButton.click()
    } else {
      await expect(page.getByRole('navigation', { name: 'On this page' })).toBeVisible()
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  }

  await page.setViewportSize(viewports[4])
  await page.goto(`${docs}/quickstart/`)
  await page.getByRole('button', { name: 'Copy Markdown' }).click()
  await expect(page.getByRole('status')).toContainText('Markdown copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('# 1. Register a benchmark')
  const markdown = await page.request.get(`${docs}/quickstart.md`)
  expect(markdown.status()).toBe(200)
  expect(markdown.headers()['content-type']).toContain('text/markdown')
  expect(await markdown.text()).toContain('mobench run')

  await page.goto(`${docs}/cli/`, { waitUntil: 'networkidle' })
  const cliOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(cliOverflow).toBeLessThanOrEqual(1)
  const flagTable = page.getByRole('table').last()
  const [tableBox, mainBox] = await Promise.all([flagTable.boundingBox(), page.locator('.main-pane').boundingBox()])
  expect(tableBox?.width).toBeLessThanOrEqual(mainBox?.width ?? Number.POSITIVE_INFINITY)
})

test('docs search opens with keyboard access and returns task results', async ({ page }) => {
  await page.goto(`${docs}/quickstart/`, { waitUntil: 'networkidle' })
  const trigger = page.locator('site-search [data-open-modal]')
  await trigger.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const search = dialog.locator('.pagefind-ui__search-input')
  await search.fill('BrowserStack')
  await expect(dialog.getByText(/BrowserStack device runs/i).first()).toBeVisible()
  await search.press('ArrowDown')
  await expect(dialog.locator('.pagefind-ui__result-link').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('theme, hash navigation, and copy failure remain usable', async ({ page }) => {
  await page.goto(marketing)
  const initialTheme = await page.locator('html').getAttribute('data-theme')
  await page.locator('[data-theme-toggle]').first().click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', initialTheme === 'dark' ? 'light' : 'dark')
  await page.goto(`${marketing}/#workflow`)
  await expect(page.locator('#workflow')).toBeInViewport()

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('clipboard unavailable') } },
    })
  })
  await page.goto(`${docs}/quickstart/`)
  await page.getByRole('button', { name: 'Copy Markdown' }).click()
  await expect(page.getByRole('status')).toContainText('Copy failed')
})

test('critical pages pass serious and critical axe checks', async ({ page }) => {
  for (const [url, viewport] of [
    [marketing, viewports[0]],
    [marketing, viewports[4]],
    [`${docs}/quickstart/`, viewports[0]],
    [`${docs}/quickstart/`, viewports[4]],
  ] as const) {
    await page.setViewportSize(viewport)
    await page.goto(url, { waitUntil: 'networkidle' })
    const results = await new AxeBuilder({ page }).analyze()
    const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    expect(serious, serious.map((item) => `${item.id}: ${item.help}`).join('\n')).toEqual([])
  }
})

test('complete content and branded errors work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: viewports[0] })
  const page = await context.newPage()
  let response = await page.goto(marketing)
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  response = await page.goto(`${docs}/quickstart/`)
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Quickstart' })).toBeVisible()
  response = await page.goto(`${docs}/route-that-does-not-exist`)
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: /outside the current manifest/i })).toBeVisible()
  response = await page.goto(`${marketing}/route-that-does-not-exist`)
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: /did not finish the run/i })).toBeVisible()
  await context.close()
})
