import { expect, test } from '@playwright/test';

test.describe('form API routes', () => {
  test('contact route rejects invalid payloads', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: '', email: 'not-an-email', message: '', website: '' },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: 'Please check the form and try again.',
    });
  });

  test('contact route treats honeypot submissions as success', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Bot User',
        email: 'bot@example.com',
        message: 'This should not be emailed.',
        website: 'https://spam.example',
      },
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: 'Thanks — your message has been sent.',
    });
  });

  test('subscribe route rejects invalid payloads', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { email: 'not-an-email', website: '' },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      message: 'Please enter a valid email address.',
    });
  });

  test('subscribe route treats honeypot submissions as success', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { email: 'bot@example.com', website: 'https://spam.example' },
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      message: 'Thanks — you’re subscribed.',
    });
  });
});
