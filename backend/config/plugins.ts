// Plugin configuration for email delivery and S3-compatible uploads.
// Provider secrets and endpoints are managed via environment variables.
export default ({ env }) => ({
  email: {
    config: {
      provider: 'strapi-provider-email-resend',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'),
      },
      settings: {
        defaultFrom: 'info@dannysfishandchips.ca',
        defaultReplyTo: 'info@dannysfishandchips.ca',
      },
    },
  },
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: env('S3_BASE_URL'),
        s3Options: {
          endpoint: env('S3_ENDPOINT'),
          region: env('S3_REGION'),
          credentials: {
            accessKeyId: env('S3_ACCESS_KEY_ID'),
            secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
          },
          forcePathStyle: env.bool('S3_FORCE_PATH_STYLE', true),
        },
        params: {
          Bucket: env('S3_BUCKET'),
          ACL: 'public-read',
        },
      },
    },
  },
});