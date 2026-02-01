/**
 * main-menu router
 *
 * API shape:
 * - Routes: GET /api/main-menu, PUT /api/main-menu
 * - Query params: populate, fields, filters, sort
 * - Response: { data: { id, attributes }, meta }
 *
 * Permissions: public access is toggled in CI via auth: false for read endpoints.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::main-menu.main-menu', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
