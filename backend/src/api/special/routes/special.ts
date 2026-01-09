/**
 * special router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::special.special', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
