/**
 * gallery service
 *
 * Core service only; no custom business logic.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::gallery.gallery');
