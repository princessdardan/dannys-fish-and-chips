// Runtime server host/port and application keys.
// Transfer is enabled for Strapi data transfers between environments.
export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  transfer: {
    remote: {
      enabled: true,
    },
  },
});
