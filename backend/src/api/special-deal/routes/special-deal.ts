/**
 * special-deal router
 *
 * API shape:
 * - Routes: GET /api/special-deals, GET /api/special-deals/:id, POST /api/special-deals, PUT /api/special-deals/:id, DELETE /api/special-deals/:id
 * - Query params: populate, fields, filters, sort, pagination
 * - Response: { data: [{ id, attributes }], meta }
 *
 * Permissions: controlled in Admin Roles & Permissions.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::special-deal.special-deal');
