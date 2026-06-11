import { defineConfig, devices } from '@playwright/test';

/**
 * Base URL for Playwright tests (overridable via env).
 */
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

/**
 * Playwright test configuration for local dev and CI.
 *
 * Side effects: optionally starts frontend dev server when not in CI.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
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
  ],

  webServer: process.env.CI ? undefined : [
    // Start frontend only
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
