import { test, expect } from '@playwright/test'

async function resetApp(page) {
  // The capstone is a local-first prototype without account authentication.
  await page.goto('http://localhost:5173/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForLoadState('networkidle')
}

test.describe('Responsive behavior', () => {
  const viewports = [
    { name: '320px', width: 320, height: 600 },
    { name: '375px', width: 375, height: 667 },
    { name: '430px', width: 430, height: 932 },
    { name: '768px', width: 768, height: 1024 },
    { name: '1024px', width: 1024, height: 768 },
    { name: '1366px', width: 1366, height: 768 },
    { name: '1920px', width: 1920, height: 1080 }
  ]

  for (const vp of viewports) {
    test(`renders correctly at ${vp.name}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await context.newPage()
      await resetApp(page)
      await page.goto('http://localhost:5173/')
      await page.waitForLoadState('networkidle')

      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      expect(bodyWidth).toBeLessThanOrEqual(vp.width + 5)

      await context.close()
    })
  }

  test('mobile sidebar opens and closes', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await context.newPage()
    await resetApp(page)
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')

    const menuButton = page.locator('button[aria-label="Open navigation"]')
    await expect(menuButton).toBeVisible()

    await menuButton.click()
    await expect(page.locator('.sidebar.sidebar-open')).toBeVisible()

    const closeButton = page.locator('button[aria-label="Close menu"]')
    await closeButton.click()
    await expect(page.locator('.sidebar.sidebar-open')).toHaveCount(0)

    await context.close()
  })

  test('mobile drawer scrim closes sidebar', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await context.newPage()
    await resetApp(page)
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')

    await page.click('button[aria-label="Open navigation"]')
    await expect(page.locator('.mobile-scrim')).toBeVisible()

    await page.click('.mobile-scrim')
    await expect(page.locator('.sidebar.sidebar-open')).toHaveCount(0)

    await context.close()
  })

  test('calendar is usable on mobile', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await context.newPage()
    await resetApp(page)
    await page.goto('http://localhost:5173/calendar')
    await page.waitForLoadState('networkidle')

    const cells = page.locator('.calendar-cell:not(.blank)')
    expect(await cells.count()).toBeGreaterThan(27)

    await page.click('button[aria-label="Next month"]')
    await page.waitForLoadState('networkidle')
    await page.click('button[aria-label="Previous month"]')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.calendar-head h3')).toBeVisible()

    await context.close()
  })

  test('forms fit on mobile screens', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await context.newPage()
    await resetApp(page)
    await page.goto('http://localhost:5173/log')
    await page.waitForLoadState('networkidle')

    const form = page.locator('.log-form')
    await expect(form).toBeVisible()

    await page.fill('input#log-date', '2024-06-15')
    await page.click('.choice-chip:has-text("Good")')
    await page.fill('textarea#notes', 'Mobile test')
    await page.click('button:has-text("Save check-in")')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.history-card')).toBeVisible()

    await context.close()
  })

  test('modals stay within viewport on mobile', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } })
    const page = await context.newPage()
    await resetApp(page)
    await page.goto('http://localhost:5173/calendar')
    await page.waitForLoadState('networkidle')

    await page.click('button:has-text("Add period")')
    await page.fill('input#period-start', '2024-06-01')
    await page.fill('input#period-end', '2024-06-05')
    await page.waitForTimeout(200)

    const modalBox = page.locator('.modal-card')
    await expect(modalBox).toBeVisible()

    const box = await modalBox.boundingBox()
    expect(box).not.toBeNull()
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(375 + 5)

    await page.click('button:has-text("Save period")')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.period-record')).toBeVisible()

    await context.close()
  })
})
