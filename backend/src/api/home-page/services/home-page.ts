/**
 * home-page service
 *
 * Core service only; no custom business logic.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::home-page.home-page');
