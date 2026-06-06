import { expect, test } from '@playwright/test';

test.describe('Forms', () => {
  test('contact form submits successfully', async ({ page }) => {
    const capturedPayloads: unknown[] = [];

    await page.route('/api/contact', async (route) => {
      const request = route.request();
      if (request.method() !== 'POST') {
        await route.continue();
        return;
      }

      capturedPayloads.push(JSON.parse(request.postData() || '{}'));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Thanks — your message has been sent.',
        }),
      });
    });

    await page.goto('/contact-us');

    await page.fill('#contact-name', 'Test User');
    await page.fill('#contact-email', 'test@example.com');
    await page.fill('#contact-subject', 'Test Subject');
    await page.fill(
      '#contact-message',
      'This is a test message with sufficient length.'
    );

    await page.locator('form').filter({ has: page.locator('#contact-name') }).locator('button[type="submit"]').click();

    await expect.poll(() => capturedPayloads.length).toBe(1);
    expect(capturedPayloads[0]).toMatchObject({
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with sufficient length.',
      source: 'contact-page',
      website: '',
    });
    await expect(page.getByText(/thank you for contacting us/i)).toBeVisible();
  });

  test('mailing list form submits successfully', async ({ page }) => {
    const capturedPayloads: unknown[] = [];

    await page.route('/api/subscribe', async (route) => {
      const request = route.request();
      if (request.method() !== 'POST') {
        await route.continue();
        return;
      }

      capturedPayloads.push(JSON.parse(request.postData() || '{}'));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Thanks — you’re subscribed.',
        }),
      });
    });

    await page.goto('/');

    const emailInput = page.locator('#mailing-list-email').first();
    await emailInput.scrollIntoViewIfNeeded();
    await emailInput.fill('subscriber@example.com');

    const form = page.locator('form').filter({ has: page.locator('#mailing-list-email') }).first();
    await form.locator('button[type="submit"]').click();

    await expect.poll(() => capturedPayloads.length).toBe(1);
    expect(capturedPayloads[0]).toMatchObject({
      email: 'subscriber@example.com',
      source: 'footer',
      website: '',
    });
    await expect(page.getByText(/thank you for subscribing/i)).toBeVisible();
  });

  test('contact form shows validation errors', async ({ page }) => {
    await page.goto('/contact-us');

    await page.evaluate(() => {
      const input = document.querySelector('#contact-name');
      const form = input?.closest('form');
      form?.setAttribute('novalidate', '');
    });
    await page.locator('form').filter({ has: page.locator('#contact-name') }).locator('button[type="submit"]').click();

    await expect(page.getByText(/please enter your name/i)).toBeVisible();
  });
});
