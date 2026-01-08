/**
 * vercel-webhook router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/vercel-webhook/trigger',
      handler: 'vercel-webhook.triggerDeploy',
      config: {
        auth: false, // Set to true if you want to require authentication
      },
    },
    {
      method: 'GET',
      path: '/vercel-webhook/test-rate-limit',
      handler: 'vercel-webhook.testRateLimit',
      config: {
        auth: false,
      },
    },
  ],
};
