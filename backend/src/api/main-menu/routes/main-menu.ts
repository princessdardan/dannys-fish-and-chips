/**
 * main-menu router
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
