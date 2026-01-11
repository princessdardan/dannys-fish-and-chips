import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

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
    // Start backend first
    {
      command: 'cd ../backend && npm run develop',
      url: 'http://localhost:1337/_health',
      timeout: 120 * 1000, // 2 min for backend startup
      reuseExistingServer: !process.env.CI,
    },
    // Then start frontend
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      timeout: 60 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
