import { faker } from '@faker-js/faker'

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
  await expect(page.getByRole('heading', { name: /all notes/i })).toBeVisible()
})

test('validation errors are displayed', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByText(/email is required./i)).toBeVisible()
  await expect(page.getByText(/password is required./i)).toBeVisible()
})

test('validation errors with invalid values', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('textbox', { name: /email/i }).fill('invalid-email')
  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByText(/please provide a valid email./i)).toBeVisible()
})

test('error shown if log in with invalid credentials', async ({
  page,
  signup,
}) => {
  await signup()
  await page.goto('/login')

  await page
    .getByRole('textbox', { name: /email/i })
    .fill(faker.internet.email())
  await page
    .getByRole('textbox', { name: /password/i })
    .fill(faker.internet.password({ length: 8 }))
  await page.getByRole('button', { name: /login/i }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(
    alert.locator('div', {
      hasText:
        /Check your credentials or log in with your third-party provider./i,
    }),
  ).toBeVisible()
})

test('validation errors are displayed', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByText(/email is required./i)).toBeVisible()
  await expect(page.getByText(/password is required./i)).toBeVisible()
})

test('validation errors with invalid values', async ({ page }) => {
  await page.goto('/login')

  await page.getByRole('textbox', { name: /email/i }).fill('invalid-email')
  await page.getByRole('button', { name: /login/i }).click()
  await expect(page.getByText(/please provide a valid email./i)).toBeVisible()
})

test('error shown if log in with invalid credentials', async ({
  page,
  signup,
}) => {
  await signup()
  await page.goto('/login')

  await page
    .getByRole('textbox', { name: /email/i })
    .fill(faker.internet.email())
  await page
    .getByRole('textbox', { name: /password/i })
    .fill(faker.internet.password({ length: 8 }))
  await page.getByRole('button', { name: /login/i }).click()
  const alert = page.getByRole('alert')
  await expect(alert).toBeVisible()
  await expect(
    alert.locator('div', {
      hasText:
        /Check your credentials or log in with your third-party provider./i,
    }),
  ).toBeVisible()
})
