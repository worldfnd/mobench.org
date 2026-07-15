import { expect, test } from '@playwright/test'

const marketing = 'http://127.0.0.1:3000'
const docs = 'http://127.0.0.1:3001'

test('key marketing states match reviewed visuals', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(marketing, { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot('marketing-light-desktop.png', { fullPage: true, animations: 'disabled' })

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(marketing, { waitUntil: 'networkidle' })
  await page.locator('[data-theme-toggle]').click()
  await expect(page).toHaveScreenshot('marketing-dark-mobile.png', { fullPage: true, animations: 'disabled' })
})

test('key documentation states match reviewed visuals', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(docs, { waitUntil: 'networkidle' })
  await expect(page).toHaveScreenshot('docs-home-desktop.png', { fullPage: true, animations: 'disabled' })

  await page.goto(`${docs}/quickstart/`, { waitUntil: 'networkidle' })
  await page.locator('site-search [data-open-modal]').click()
  await page.locator('.pagefind-ui__search-input').fill('BrowserStack')
  await expect(page.getByRole('dialog').locator('.pagefind-ui__result-link').first()).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveScreenshot('docs-search-desktop.png', { animations: 'disabled' })

  await page.goto(`${docs}/cli/`, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { name: 'Complete command flag index' }).scrollIntoViewIfNeeded()
  await expect(page).toHaveScreenshot('docs-cli-reference-desktop.png', { animations: 'disabled' })

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(`${docs}/quickstart/`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Menu' }).click()
  await expect(page).toHaveScreenshot('docs-mobile-navigation.png', { animations: 'disabled' })
})

test('branded 404 states match reviewed visuals', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${marketing}/visual-missing-page`)
  await expect(page).toHaveScreenshot('marketing-404.png', { animations: 'disabled' })
  await page.goto(`${docs}/visual-missing-page`)
  await expect(page).toHaveScreenshot('docs-404.png', { animations: 'disabled' })
})
