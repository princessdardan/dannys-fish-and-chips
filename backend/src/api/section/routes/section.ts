/**
 * section router
 *
 * API shape:
 * - Routes: GET /api/sections, GET /api/sections/:id, POST /api/sections, PUT /api/sections/:id, DELETE /api/sections/:id
 * - Query params: populate, fields, filters, sort, pagination
 * - Response: { data: [{ id, attributes }], meta }
 *
 * Permissions: controlled in Admin Roles & Permissions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::section.section');
