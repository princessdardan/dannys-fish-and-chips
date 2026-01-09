/**
 * about-us router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::about-us.about-us', {
  config: {
    find: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
    findOne: {
      auth: process.env.CI === 'true' ? false : undefined,
    },
  },
});
