import type { Core } from '@strapi/strapi';

/**
 * Configure public read permissions for all content types in CI/test environments.
 *
 * Permission notes:
 * - Enables public role actions: find, findOne for specified APIs.
 * - Used to unblock E2E/CI without manual role setup.
 */
async function configurePublicPermissions(strapi: Core.Strapi) {
  const contentTypes = [
    'api::about-us.about-us',
    'api::contact-us.contact-us',
    'api::food-and-drink-menu.food-and-drink-menu',
    'api::gallery.gallery',
    'api::global.global',
    'api::home-page.home-page',
    'api::hours-and-location.hours-and-location',
    'api::main-menu.main-menu',
    'api::special.special',
  ];

  // Get the public role
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    throw new Error('Public role not found');
  }

  // Enable find permissions for each content type
  for (const contentType of contentTypes) {
    const [, apiName] = contentType.split('::');
    const [controllerName] = apiName.split('.');

    // Get all permissions for this content type
    const findPermission = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({
        where: {
          role: publicRole.id,
          action: `${contentType}.find`,
        },
      });

    const findOnePermission = await strapi
      .query('plugin::users-permissions.permission')
      .findOne({
        where: {
          role: publicRole.id,
          action: `${contentType}.findOne`,
        },
      });

    // Update find permission if it exists
    if (findPermission) {
      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: findPermission.id },
        data: { enabled: true },
      });
    }

    // Update findOne permission if it exists
    if (findOnePermission) {
      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: findOnePermission.id },
        data: { enabled: true },
      });
    }

    if (findPermission || findOnePermission) {
      console.log(`Enabled public access for ${controllerName}`);
    } else {
      console.log(`No permissions found for ${controllerName}`);
    }
  }
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // API shape:
    // - Route: GET /_health
    // - Response: { status: 'ok' }
    // - Auth: public (auth disabled)
    strapi.server.routes([
      {
        method: 'GET',
        path: '/_health',
        handler: (ctx) => {
          ctx.body = { status: 'ok' };
        },
        config: {
          auth: false,
        },
      },
    ]);
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Auto-configure public permissions in CI/test environments
    if (process.env.CI === 'true' || process.env.NODE_ENV === 'test') {
      console.log('CI environment detected - configuring public permissions');

      try {
        await configurePublicPermissions(strapi);
        console.log('Public permissions configured successfully');
      } catch (error) {
        console.error('Failed to configure public permissions:', error);
      }
    }

    // Fix S3 URLs for Supabase compatibility using lifecycle hooks.
    // The upload file URL is corrected when the provider returns a bare path
    // (e.g. "https://bucket/file") that should be resolved against S3_BASE_URL.
    strapi.db.lifecycles.subscribe({
      models: ['plugin::upload.file'],
      async beforeCreate(event: any) {
        const { data } = event.params;

        // Fix URLs that match the pattern: https://<bucket-name>/<filename>
        // so uploads resolve to the public base URL for the media bucket.
        if (data.url && data.url.match(/^https?:\/\/[^\/]+\/[^\/]+$/)) {
          const baseUrl = process.env.S3_BASE_URL;
          const bucket = process.env.S3_BUCKET;

          // Extract the filename from the malformed URL
          const match = data.url.match(/^https?:\/\/[^\/]+\/(.+)$/);
          if (match && baseUrl && bucket) {
            const filename = match[1];
            // Reconstruct the proper URL
            const fixedUrl = `${baseUrl}/${filename}`;
            console.log(`[Upload Fix] Malformed URL detected: ${data.url}`);
            console.log(`[Upload Fix] Fixed to: ${fixedUrl}`);
            data.url = fixedUrl;
          }
        }
      },
    });
  },
};
