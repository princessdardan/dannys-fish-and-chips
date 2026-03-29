/**
 * announcement-page controller
 *
 * Uses Strapi's core controller with no overrides.
 * Permissions are managed in the Admin Roles & Permissions panel.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::announcement-page.announcement-page');
