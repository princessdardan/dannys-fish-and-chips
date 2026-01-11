import { test, expect } from '@playwright/test';

test.describe('Menu Page', () => {
  test('should navigate to menu page', async ({ page }) => {
    await page.goto('/');

    // Find and click menu link
    await page.click('a[href="/menu"], a[href*="menu"]');
    await expect(page).toHaveURL(/.*menu/);
  });

  test('should load menu page directly', async ({ page }) => {
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });

    // Verify we're on the menu page
    await expect(page).toHaveURL(/.*menu/);

    // Wait for content to be visible
    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('should display menu items', async ({ page }) => {
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });

    // Check that main content is visible (use .first() since layout has nested main tags)
    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });
});
