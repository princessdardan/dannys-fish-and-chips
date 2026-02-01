// API shape:
// - Route: POST /api/email-test
// - Body: { to: string }
// - Response: { message, recipient, timestamp } or { error, hints }
// Permissions: controlled in Admin Roles & Permissions (no auth override here).
export default {
  routes: [
    {
      method: 'POST',
      path: '/email-test',
      handler: 'email-test.send',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
