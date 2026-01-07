import { test, expect } from '@playwright/test';

test.describe('Menu Page', () => {
  test('should navigate to menu page', async ({ page }) => {
    await page.goto('/');

    // Find and click menu link
    await page.click('a[href="/menu"], a[href*="menu"]');
    await expect(page).toHaveURL(/.*menu/);
  });

  test('should load menu page directly', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // Verify we're on the menu page
    await expect(page).toHaveURL(/.*menu/);
  });

  test('should display menu items', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // Check that main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
