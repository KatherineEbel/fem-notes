import { test, expect } from '../playwright'

test('directed to login after successful email/password signup', async ({
  page,
  userPass,
  userEmail,
}) => {
  await page.goto('/')

  await page.getByRole('link', { name: /get started/i }).click()
  await expect(page).toHaveURL('/signup')

  await page.getByRole('textbox', { name: /email/i }).fill(userEmail)
  await page.getByRole('textbox', { name: /password/i }).fill(userPass)
  await page.getByRole('button', { name: /sign up/i }).click()
  await page.waitForURL('/login')
})
