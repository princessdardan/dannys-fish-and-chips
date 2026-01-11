import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    // Title uses & instead of "and": "Danny's Fish & Chips | Barrie, ON | Since 1975"
    // Use flexible regex to handle apostrophe and ampersand variants
    await expect(page).toHaveTitle(/Danny.?s Fish.{1,7}Chips/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Check if main content is visible (use .first() since layout has nested main tags)
    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for common navigation links (use specific selector to avoid multiple matches)
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });
});
