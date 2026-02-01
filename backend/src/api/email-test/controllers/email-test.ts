/**
 * Email test controller
 *
 * API shape:
 * - Route: POST /api/email-test
 * - Body: { to: string }
 * - Response: { message, recipient, timestamp } on success
 *
 * Permissions: controlled in Admin Roles & Permissions.
 */

export default {
  async send(ctx) {
    try {
      // Get recipient email from request body, or use a default
      const { to } = ctx.request.body;

      if (!to) {
        ctx.badRequest('Please provide a "to" email address in the request body');
        return;
      }

      // Send test email using the email plugin
      await strapi.plugins['email'].services.email.send({
        to: to,
        from: 'info@dannysfishandchips.ca',
        subject: 'Test Email from Danny\'s Fish and Chips - API Test',
        text: 'This is a plain text test email sent via the Strapi API endpoint.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2e6da4; border-bottom: 3px solid #2e6da4; padding-bottom: 10px;">
              🐟 Email Test Successful!
            </h1>
            <p style="font-size: 16px; line-height: 1.6;">
              This is a test email from your Strapi email provider configuration.
            </p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Configuration Details:</h3>
              <ul style="list-style: none; padding-left: 0;">
                <li><strong>Provider:</strong> Nodemailer</li>
                <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not configured'}</li>
                <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 'Not configured'}</li>
                <li><strong>From:</strong> info@dannysfishandchips.ca</li>
              </ul>
            </div>
            <p style="color: #28a745; font-weight: bold; font-size: 18px;">
              ✓ If you're receiving this email, your email provider is configured correctly!
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              Sent from Danny's Fish and Chips<br>
              Powered by Strapi
            </p>
          </div>
        `,
      });

      ctx.send({
        message: 'Test email sent successfully!',
        recipient: to,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      strapi.log.error('Email sending failed:', error);

      // Provide helpful error information
      let errorMessage = 'Failed to send email';
      let hints = [];

      if (error.message.includes('SMTP')) {
        hints.push('Check your SMTP credentials in .env file');
        hints.push('Verify SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD');
        hints.push('Ensure your SMTP server allows connections from this IP');
        hints.push('Check if your email provider requires app-specific passwords');
      }

      ctx.badRequest(errorMessage, {
        error: error.message,
        hints: hints.length > 0 ? hints : undefined,
      });
    }
  },
};
