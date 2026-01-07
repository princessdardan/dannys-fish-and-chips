import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Danny's Fish and Chips/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check if main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation links
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
