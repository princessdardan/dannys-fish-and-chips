/**
 * Email Provider Test Script
 *
 * This script tests the email provider configuration by sending a test email.
 *
 * Usage: Run this from your Strapi project root with:
 *   node test-email.js
 */

const Strapi = require('@strapi/strapi');

async function testEmail() {
  console.log('Starting Strapi instance...');

  const appContext = await Strapi().load();
  const app = appContext.start();

  try {
    console.log('\nAttempting to send test email...');

    await strapi.plugins['email'].services.email.send({
      to: 'test@example.com', // CHANGE THIS to your test email address
      from: 'info@dannysfishandchips.ca',
      subject: 'Test Email from Danny\'s Fish and Chips',
      text: 'This is a plain text test email from your Strapi application.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2e6da4;">Email Test Successful!</h1>
          <p>This is a test email from your Strapi email provider configuration.</p>
          <p><strong>Provider:</strong> Nodemailer</p>
          <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not configured'}</p>
          <p><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 'Not configured'}</p>
          <p>If you're receiving this email, your email provider is configured correctly!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Sent from Danny's Fish and Chips</p>
        </div>
      `,
    });

    console.log('\n✓ Email sent successfully!');
    console.log('Check your inbox at the recipient address.');

  } catch (error) {
    console.error('\n✗ Failed to send email:');
    console.error('Error:', error.message);

    if (error.message.includes('SMTP')) {
      console.error('\nPossible issues:');
      console.error('- Check your SMTP credentials in .env file');
      console.error('- Verify SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD');
      console.error('- Ensure your SMTP server allows connections from this IP');
      console.error('- Check if your email provider requires app-specific passwords');
    }
  } finally {
    console.log('\nShutting down...');
    await strapi.destroy();
    process.exit(0);
  }
}

testEmail();
