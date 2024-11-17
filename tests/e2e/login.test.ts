import { expect, test } from '../playwright'

test('directed to notes page after successful email/password login', async ({
  page,
  signup,
  userEmail,
  userPass,
}) => {
  await signup()
  await page.goto('/login')

  await page.getByRole('textbox', { name: /email/i }).fill(userEmail)
  await page.getByRole('textbox', { name: /password/i }).fill(userPass)
  await page.getByRole('button', { name: /login/i }).click()
  await page.waitForURL('/notes')
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible()
})
