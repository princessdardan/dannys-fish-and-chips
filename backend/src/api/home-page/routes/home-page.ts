/**
 * home-page router
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
