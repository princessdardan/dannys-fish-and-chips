import { test, expect } from '@playwright/test';

test.describe('Contact Us Page', () => {
  test('should load contact page', async ({ page }) => {
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/.*contact-us/);
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });

    // Verify main content is visible (use .first() since layout has nested main tags)
    const main = page.locator('main').first();
    await expect(main).toBeVisible({ timeout: 10000 });
  });

  test('should have accessible contact form if present', async ({ page }) => {
    await page.goto('/contact-us', { waitUntil: 'domcontentloaded' });

    // Check if form exists
    const form = page.locator('form');
    const formCount = await form.count();

    if (formCount > 0) {
      // If form exists, verify it's visible
      await expect(form.first()).toBeVisible();
    }
  });
});
