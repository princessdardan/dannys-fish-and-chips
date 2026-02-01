// Global middleware stack for Strapi HTTP requests.
// CSP allows media from Supabase and CORS is configured by env.
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            ...(process.env.SUPABASE_URL ? [process.env.SUPABASE_URL] : []),
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            ...(process.env.SUPABASE_URL ? [process.env.SUPABASE_URL] : []),
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
      headers: '*',
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
