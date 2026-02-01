/**
 * announcement router
 *
 * API shape:
 * - Routes: GET /api/announcement, PUT /api/announcement, DELETE /api/announcement
 * - Response: { data: { id, attributes }, meta }
 *
 * Permissions: controlled in Admin Roles & Permissions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::announcement.announcement');
