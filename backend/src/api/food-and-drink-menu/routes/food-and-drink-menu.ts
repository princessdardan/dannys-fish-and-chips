/**
 * food-and-drink-menu router
 *
 * API shape:
 * - Routes: GET /api/food-and-drink-menu, PUT /api/food-and-drink-menu
 * - Query params: populate, fields, filters, sort
 * - Response: { data: { id, attributes }, meta }
 *
 * Permissions: public access is toggled in CI via auth: false for read endpoints.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::food-and-drink-menu.food-and-drink-menu', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
