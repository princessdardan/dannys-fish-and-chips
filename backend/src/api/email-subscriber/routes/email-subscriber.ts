/**
 * email-subscriber router
 *
 * API shape:
 * - Routes: GET /api/email-subscribers, GET /api/email-subscribers/:id, POST /api/email-subscribers, PUT /api/email-subscribers/:id, DELETE /api/email-subscribers/:id
 * - Query params: populate, fields, filters, sort, pagination
 * - Response: { data: [{ id, attributes }], meta }
 *
 * Permissions: controlled in Admin Roles & Permissions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::email-subscriber.email-subscriber');
