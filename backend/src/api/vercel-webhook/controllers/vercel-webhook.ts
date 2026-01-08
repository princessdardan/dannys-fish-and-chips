/**
 * vercel-webhook controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::vercel-webhook.vercel-webhook', ({ strapi }) => ({
  async triggerDeploy(ctx) {
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

    if (!deployHookUrl) {
      return ctx.badRequest('VERCEL_DEPLOY_HOOK_URL is not configured');
    }

    try {
      const response = await fetch(deployHookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      // Check for rate limit error
      if (response.status === 429) {
        return ctx.send({
          success: false,
          error: {
            code: 'rate_limited',
            message: 'Rate limit exceeded for Vercel deploy hook',
            status: 429,
            data: data
          }
        }, 429);
      }

      if (!response.ok) {
        return ctx.send({
          success: false,
          error: {
            code: response.status,
            message: data.error?.message || 'Failed to trigger deployment',
            data: data
          }
        }, response.status);
      }

      return ctx.send({
        success: true,
        message: 'Deployment triggered successfully',
        data: data
      });

    } catch (error) {
      strapi.log.error('Vercel webhook error:', error);
      return ctx.internalServerError('Failed to trigger Vercel deployment');
    }
  },

  async testRateLimit(ctx) {
    // Simulates a rate limit error for testing
    return ctx.send({
      success: false,
      error: {
        code: 'rate_limited',
        name: 'RATE_LIMITED',
        message: 'Test simulation: Rate limit exceeded',
        status: 429,
        details: {
          limit: 100,
          remaining: 0,
          reset: Date.now() + 3600000 // 1 hour from now
        }
      }
    }, 429);
  }
}));
