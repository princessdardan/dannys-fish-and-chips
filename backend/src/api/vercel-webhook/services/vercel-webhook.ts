/**
 * vercel-webhook service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::vercel-webhook.vercel-webhook');
