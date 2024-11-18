import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const PORT = process.env.PORT ?? '5174'
const CI = process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 15 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  // workers: 1,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },

  projects: CI
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },

        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },

        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],
})

/* Test against mobile viewports. */
// {
//   name: 'Mobile Chrome',
//   use: { ...devices['Pixel 5'] },
// },

/* Test against branded browsers. */
// {
//   name: 'Microsoft Edge',
//   use: { ...devices['Desktop Edge'], channel: 'msedge' },
// },
// {
//   name: 'Google Chrome',
//   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
// },
