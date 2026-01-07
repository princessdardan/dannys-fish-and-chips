import { test, expect } from '@playwright/test';

test.describe('Contact Us Page', () => {
  test('should load contact page', async ({ page }) => {
    await page.goto('/contact-us');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/.*contact-us/);
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/contact-us');
    await page.waitForLoadState('networkidle');

    // Verify main content is visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have accessible contact form if present', async ({ page }) => {
    await page.goto('/contact-us');
    await page.waitForLoadState('networkidle');

    // Check if form exists
    const form = page.locator('form');
    const formCount = await form.count();

    if (formCount > 0) {
      // If form exists, verify it's visible
      await expect(form.first()).toBeVisible();
    }
  });
});
