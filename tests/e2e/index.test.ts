import { test, expect } from '../playwright'

test('shows heading', async ({ page }) => {
  await page.goto('/')
  const title = page.getByRole('heading', {
    name: /Welcome to Your Notes App/i,
  })
  await expect(title).toBeVisible()
})
