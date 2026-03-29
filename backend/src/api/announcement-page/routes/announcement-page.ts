/**
 * announcement-page router
 *
 * API shape:
 * - Routes: GET /api/announcement-page, PUT /api/announcement-page
 * - Query params: populate, fields, filters, sort
 * - Response: { data: { id, attributes }, meta }
 *
 * Permissions: public access is toggled in CI via auth: false for read endpoints.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::announcement-page.announcement-page', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
