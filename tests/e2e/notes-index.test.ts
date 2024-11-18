import { test, expect } from '../playwright'

test('unauthenticated users redirected to login page', async ({ page }) => {
  await page.goto('/notes')
  await expect(page).toHaveURL('/login')
})

test('toast message shown when unauthenticated', async ({ page }) => {
  await page.goto('/notes')
  await expect(page).toHaveURL('/login')
  const alert = page.getByRole('alert')

  await expect(alert).toBeVisible()
  await expect(
    alert.locator('div', { hasText: /you must be logged in to view notes./i }),
  ).toBeVisible()
})
