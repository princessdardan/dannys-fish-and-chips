/**
 * home-page router
 *
 * API shape:
 * - Routes: GET /api/home-page, PUT /api/home-page
 * - Query params: populate, fields, filters, sort
 * - Response: { data: { id, attributes }, meta }
 *
 * Permissions: public access is toggled in CI via auth: false for read endpoints.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::home-page.home-page', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
