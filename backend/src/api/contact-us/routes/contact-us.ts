/**
 * contact-us router
 *
 * API shape:
 * - Routes: GET /api/contact-us, PUT /api/contact-us
 * - Query params: populate, fields, filters, sort
 * - Response: { data: { id, attributes }, meta }
 *
 * Permissions: public access is toggled in CI via auth: false for read endpoints.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::contact-us.contact-us', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
