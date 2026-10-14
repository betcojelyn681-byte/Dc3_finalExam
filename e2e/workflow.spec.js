import { test, expect } from '@playwright/test'

async function resetApp(page) {
  // The capstone is a local-first prototype without account authentication.
  await page.goto('http://localhost:5173/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.waitForLoadState('networkidle')
}

test.describe('Bloom — Cycle Care end-to-end', () => {
  test('home page loads and shows dashboard', async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!text.includes('404') && !text.includes('favicon')) errors.push(text)
      }
    })
    page.on('pageerror', err => errors.push(err.message))

    await resetApp(page)
    await expect(page).toHaveTitle(/Bloom/)
    await expect(page.locator('h1')).toContainText(/Good day/i)
    expect(errors).toEqual([])
  })

  test('all routes render without errors', async ({ page }) => {
    await resetApp(page)
    const routes = [
      { path: '/', h1: /Good day/i },
      { path: '/calendar', h1: /My calendar/i },
      { path: '/log', h1: /Daily check-in/i },
      { path: '/insights', h1: /Cycle insights/i },
      { path: '/learn', h1: /knowledge/i },
      { path: '/settings', h1: /Settings/i }
    ]
    for (const route of routes) {
      const response = await page.goto(`http://localhost:5173${route.path}`)
      expect(response?.status()).toBe(200)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('h1')).toContainText(route.h1, { timeout: 5000 })
    }
  })

  test('dashboard navigation via sidebar links', async ({ page }) => {
    await resetApp(page)
    await page.click('button:has-text("My calendar")')
    await page.waitForURL(/.+\/calendar$/)
    await expect(page.locator('h1')).toContainText(/My calendar/i)
    await page.click('button:has-text("Daily log")')
    await page.waitForURL(/.+\/log$/)
    await expect(page.locator('h1')).toContainText(/Daily check-in/i)
  })

  test('unknown routes redirect to dashboard', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/this-does-not-exist')
    await page.waitForLoadState('networkidle')
    await page.waitForURL(/.+\/$/)
    await expect(page.locator('h1')).toContainText(/Good day/i)
  })

  test('period CRUD workflow', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/calendar')
    await page.waitForLoadState('networkidle')

    await page.click('button:has-text("Add period")')
    await page.fill('input#period-start', '2024-06-01')
    await page.fill('input#period-end', '2024-06-05')
    await page.fill('textarea#period-notes', 'Test period')
    await page.click('button:has-text("Save period")')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.period-record')).toContainText(/Jun 1/)
    await expect(page.locator('.period-record')).toContainText(/5 days/)

    const editButtons = page.locator('.period-record .icon-button')
    await editButtons.first().click()
    await page.fill('input#period-start', '2024-06-01')
    await page.fill('input#period-end', '2024-06-07')
    await page.click('button:has-text("Save period")')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.period-record')).toContainText(/7 days/)

    const deleteButtons = page.locator('.period-record .danger-icon')
    await deleteButtons.first().click()
    await page.waitForSelector('.modal-backdrop', { timeout: 5000 })
    await page.click('.modal-backdrop .btn-primary')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.period-record')).toHaveCount(0)
  })

  test('period validation rejects invalid dates', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/calendar')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("Add period")')
    await page.fill('input#period-start', '2024-06-05')
    await page.fill('input#period-end', '2024-06-01')
    await page.click('button:has-text("Save period")')
    await expect(page.locator('.form-error')).toBeVisible()
  })

  test('daily log CRUD workflow', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/log')
    await page.waitForLoadState('networkidle')

    await page.fill('input#log-date', '2024-06-15')
    await page.click('.choice-chip:has-text("Good")')
    await page.selectOption('select#energy', 'High')
    await page.click('label:has-text("Cramps")')
    await page.fill('textarea#notes', 'Testing check-in')
    await page.click('button:has-text("Save check-in")')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.history-card')).toContainText(/Good day/)
    await expect(page.locator('.history-card')).toContainText(/Cramps/)

    const editButtons = page.locator('.history-card .icon-button')
    await editButtons.first().click()
    await page.waitForTimeout(300)
    await page.fill('textarea#notes', 'Updated note')
    await page.click('button:has-text("Save check-in")')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.history-card')).toContainText(/Updated note/)

    await page.click('.choice-chip:has-text("Great")')
    await page.fill('textarea#notes', 'Changed mood')
    await page.click('button:has-text("Save check-in")')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.history-card')).toContainText(/Great day/)

    const deleteButton = page.locator('.history-card .danger-icon')
    await deleteButton.first().click()
    await page.waitForSelector('.modal-backdrop', { timeout: 5000 })
    await page.click('.modal-backdrop .btn-primary')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.history-card')).toHaveCount(0)
  })

  test('log search and mood filter', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/log')
    await page.waitForLoadState('networkidle')

    await page.fill('input#log-date', '2024-06-15')
    await page.click('.choice-chip:has-text("Anxious")')
    await page.fill('textarea#notes', 'Headache today')
    await page.click('button:has-text("Save check-in")')
    await page.waitForLoadState('networkidle')

    await page.fill('input[aria-label="Search check-ins"]', 'Headache')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.history-card')).toHaveCount(1)
    await expect(page.locator('.history-card')).toContainText(/Anxious/)

    await page.fill('input[aria-label="Search check-ins"]', 'zzz-no-match')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.empty-state')).toBeVisible()

    await page.fill('input[aria-label="Search check-ins"]', '')
    await page.selectOption('select[aria-label="Filter by mood"]', 'Great')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.history-card')).toHaveCount(0)
  })

  test('calendar navigation and date selection', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/calendar')
    await page.waitForLoadState('networkidle')

    await page.click('button[aria-label="Next month"]')
    await page.waitForLoadState('networkidle')
    const nextMonthLabel = await page.locator('.calendar-head h3').textContent()
    expect(nextMonthLabel?.trim()).not.toBe('')

    await page.click('button[aria-label="Previous month"]')
    await page.waitForLoadState('networkidle')

    const cells = page.locator('.calendar-cell:not(.blank)')
    expect(await cells.count()).toBeGreaterThan(27)
  })

  test('settings save and persist on reload', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/settings')
    await page.waitForLoadState('networkidle')

    await page.fill('input#profile-name', 'Test User')
    await page.fill('input#cycle-length', '30')
    await page.fill('input#period-length', '4')
    await page.click('button:has-text("Save preferences")')
    await page.waitForLoadState('networkidle')

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input#profile-name')).toHaveValue('Test User')
    await expect(page.locator('input#cycle-length')).toHaveValue('30')

    await page.click('button:has-text("Reset all demo data")')
    await page.waitForSelector('.modal-backdrop', { timeout: 5000 })
    await page.click('.modal-backdrop .btn-primary')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input#profile-name')).toHaveValue('Friend')
    await expect(page.locator('input#cycle-length')).toHaveValue('28')
  })

  test('data export produces a file', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/settings')
    await page.waitForLoadState('networkidle')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export my data")')
    ])
    expect(download.suggestedFilename()).toContain('.json')
  })

  test('insights page shows data summaries', async ({ page }) => {
    await resetApp(page)
    await page.goto('http://localhost:5173/insights')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText(/Cycle insights/i)
  })

  test('learning library search and filter', async ({ page }) => {
    await page.goto('http://localhost:5173/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')

    await page.goto('http://localhost:5173/learn')
    await page.waitForLoadState('networkidle')

    await page.fill('input[aria-label="Search learning articles"]', 'predictions')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.article-card')).toHaveCount(1)

    await page.fill('input[aria-label="Search learning articles"]', 'zzz-no-match')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.empty-state')).toBeVisible()
  })

  test('learning library is accessible without an account', async ({ page }) => {
    await page.goto('http://localhost:5173/learn')
    await expect(page).toHaveURL(/\/learn$/)
    await expect(page.locator('h1')).toContainText(/knowledge/i)
  })

  test('no console errors on any page', async ({ page }) => {
    const errors = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await resetApp(page)
    for (const path of ['/', '/calendar', '/log', '/insights', '/learn', '/settings']) {
      await page.goto(`http://localhost:5173${path}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    }
    expect(errors).toEqual([])
  })
})
