import { expect, test } from '@playwright/test'

test('Test root error boundary caught', async ({ page }) => {
  const pageUrl = '/does-not-exist'
  const res = await page.goto(pageUrl)

  expect(res?.status()).toBe(404)
  await expect(page.getByText(/404 - Page Not Found/i)).toBeVisible()
})
