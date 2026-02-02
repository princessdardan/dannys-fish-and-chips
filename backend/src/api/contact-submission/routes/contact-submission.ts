/**
 * contact-submission router
 *
 * API shape:
 * - Routes: GET /api/contact-submissions, GET /api/contact-submissions/:id, POST /api/contact-submissions, PUT /api/contact-submissions/:id, DELETE /api/contact-submissions/:id
 * - Query params: populate, fields, filters, sort, pagination
 * - Response: { data: [{ id, attributes }], meta }
 *
 * Permissions: controlled in Admin Roles & Permissions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::contact-submission.contact-submission');
