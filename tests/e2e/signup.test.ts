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

test('validation errors are displayed when fields empty', async ({ page }) => {
  await page.goto('/signup')

  await page.getByRole('button', { name: /sign up/i }).click()
  await expect(page.getByText(/email is required./i)).toBeVisible()
  await expect(page.getByText(/password is required./i)).toBeVisible()
})

test('validation errors with invalid values', async ({ page }) => {
  await page.goto('/signup')

  await page.getByRole('textbox', { name: /email/i }).fill('invalid-email')
  await page.getByRole('textbox', { name: /password/i }).fill('notgood')
  await page.getByRole('button', { name: /sign up/i }).click()
  await expect(page.getByText(/please provide a valid email./i)).toBeVisible()
  await expect(
    page.getByText(/password of at least 8 characters is required./i),
  ).toBeVisible()
})

test('error if duplicate email used', async ({
  page,
  signup,
  userPass,
  userEmail,
}) => {
  await signup()
  await page.goto('/signup')
  await page.getByRole('textbox', { name: /email/i }).fill(userEmail)
  await page.getByRole('textbox', { name: /password/i }).fill(userPass)
  await page.getByRole('button', { name: /sign up/i }).click()

  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(
    alert.locator('div', {
      hasText: /unable to authenticate./i,
    }),
  ).toBeVisible()
})
