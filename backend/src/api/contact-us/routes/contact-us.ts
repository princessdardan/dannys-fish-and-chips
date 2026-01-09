/**
 * contact-us router
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
