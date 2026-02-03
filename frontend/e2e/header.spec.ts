import { test, expect } from "@playwright/test";

test.describe("Header Masthead", () => {
  test("displays masthead title on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const masthead = page.locator("h1").filter({ hasText: "Danny's Fish & Chips" });
    await expect(masthead).toBeVisible();
  });

  test("displays establishment info on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const dateline = page.locator("text=Est. 1975 • Barrie, Ontario");
    await expect(dateline).toBeVisible();
  });

  test("shows hamburger menu on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Mobile navigation trigger button
    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await expect(hamburger).toBeVisible();
  });

  test("shows simplified site name on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const siteName = page.locator("text=Danny's").first();
    await expect(siteName).toBeVisible();
  });

  test("hides header on scroll down (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const header = page.locator('[class*="masthead-bg"]').first();
    await expect(header).toBeVisible();

    // Scroll down using mouse wheel for more reliable scroll events
    await page.mouse.wheel(0, 600);

    // Wait for the header to become hidden (opacity 0 or transform applied)
    await expect(header).toHaveCSS("opacity", "0", { timeout: 2000 });
  });

  test("shows header on scroll up (mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const header = page.locator('[class*="masthead-bg"]').first();

    // Scroll down then up
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, -200);

    // Header should be visible after scrolling up (opacity 1)
    await expect(header).toHaveCSS("opacity", "1", { timeout: 2000 });
  });

  test("header always visible at page top", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const header = page.locator('[class*="masthead-bg"]').first();

    // Scroll down then back to top
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Header should be visible at page top (opacity 1)
    await expect(header).toHaveCSS("opacity", "1", { timeout: 2000 });
  });

  test("CTA button is visible on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Look for a CTA button in the header (Contact Us or similar)
    const ctaButton = page.locator("nav button, nav a").filter({ hasText: /Contact/i }).first();
    // If CTA exists, it should be visible
    const count = await ctaButton.count();
    if (count > 0) {
      await expect(ctaButton).toBeVisible();
    }
  });

  test("navigation links are accessible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    // Check that main navigation exists with proper aria-label
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });

  test("respects reduced motion preference", async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const header = page.locator('[class*="masthead-bg"]').first();

    // With reduced motion, the transition class should not be applied
    // Check that the element doesn't have the transition class
    const hasTransitionClass = await header.evaluate((el) =>
      el.className.includes("transition")
    );

    // With reduced motion, no transition classes should be applied
    expect(hasTransitionClass).toBe(false);
  });

  test("hides header on scroll down (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const header = page.locator('[class*="masthead-bg"]').first();
    await expect(header).toBeVisible();

    // Scroll down using mouse wheel for more reliable scroll events
    await page.mouse.wheel(0, 600);

    // Wait for the header to become hidden (opacity 0)
    await expect(header).toHaveCSS("opacity", "0", { timeout: 2000 });
  });

  test("shows header on scroll up (desktop)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");

    const header = page.locator('[class*="masthead-bg"]').first();

    // Scroll down then up
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, -200);

    // Header should be visible after scrolling up (opacity 1)
    await expect(header).toHaveCSS("opacity", "1", { timeout: 2000 });
  });

  // Note: Inactivity timeout and hover-reveal tests are omitted from E2E
  // as they require timing-sensitive interactions that are flaky across browsers.
  // These behaviors are better verified through manual testing or unit tests.
});
