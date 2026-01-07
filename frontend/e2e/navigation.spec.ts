import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Hours and Location', path: '/hours-and-location' },
    { name: 'Contact Us', path: '/contact-us' },
    { name: 'Special', path: '/special' },
  ];

  for (const { name, path } of pages) {
    test(`should load ${name} page`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      // Verify page loaded successfully
      await expect(page).toHaveURL(new RegExp(path));

      // Check that main content exists
      const main = page.locator('main');
      await expect(main).toBeVisible();
    });
  }

  test('should navigate between pages using navigation links', async ({ page }) => {
    await page.goto('/');

    // Try to navigate to menu
    const menuLink = page.locator('a[href="/menu"], a[href*="menu"]').first();
    if (await menuLink.isVisible()) {
      await menuLink.click();
      await expect(page).toHaveURL(/.*menu/);
    }
  });
});
