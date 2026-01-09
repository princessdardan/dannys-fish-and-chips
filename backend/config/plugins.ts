export default ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST'),
        port: env.int('SMTP_PORT', 587),
        secure: false, // true for port 465, false for other ports
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
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
          params: {
            Bucket: env('S3_BUCKET'),
          },
        },
      },
    },
  },
});