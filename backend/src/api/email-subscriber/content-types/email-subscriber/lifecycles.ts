/**
 * Lifecycle hooks for email-subscriber
 *
 * Sends notification emails after a new subscriber is created
 */

const ADMIN_EMAIL = 'info@dannysfishandchips.ca';
const FROM_EMAIL = 'info@dannysfishandchips.ca';

export default {
  async afterCreate(event) {
    const { result } = event;

    const subscriberEmail = result.email;
    const subscribedAt = result.subscribedAt
      ? new Date(result.subscribedAt).toLocaleString('en-CA', {
          dateStyle: 'full',
          timeStyle: 'short',
        })
      : new Date().toLocaleString('en-CA', {
          dateStyle: 'full',
          timeStyle: 'short',
        });
    const source = result.source || 'website';

    // Send notification email to administrator
    try {
      await strapi.plugins['email'].services.email.send({
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: 'New Mailing List Subscriber - Danny\'s Fish and Chips',
        text: `New subscriber: ${subscriberEmail}\nSubscribed at: ${subscribedAt}\nSource: ${source}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #c41e3a; border-bottom: 3px solid #c41e3a; padding-bottom: 10px;">
              📧 New Mailing List Subscriber
            </h1>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Subscriber Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                  <td style="padding: 8px 0;">${subscriberEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Subscribed At:</td>
                  <td style="padding: 8px 0;">${subscribedAt}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Source:</td>
                  <td style="padding: 8px 0;">${source}</td>
                </tr>
              </table>
            </div>
            <p style="color: #666; font-size: 14px;">
              You can manage subscribers in the <a href="${process.env.STRAPI_ADMIN_URL || 'http://localhost:1337'}/admin/content-manager/collection-types/api::email-subscriber.email-subscriber">Strapi Admin Panel</a>.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Danny's Fish and Chips - Mailing List System
            </p>
          </div>
        `,
      });
      strapi.log.info(`Admin notification sent for new subscriber: ${subscriberEmail}`);
    } catch (error) {
      strapi.log.error('Failed to send admin notification email:', error);
    }

    // Send confirmation email to subscriber
    try {
      await strapi.plugins['email'].services.email.send({
        to: subscriberEmail,
        from: FROM_EMAIL,
        subject: 'Welcome to Danny\'s Fish and Chips Mailing List!',
        text: `Thank you for subscribing to the Danny's Fish and Chips mailing list! You'll be the first to know about our specials, events, and news.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #c41e3a; border-bottom: 3px solid #c41e3a; padding-bottom: 10px;">
              🐟 Welcome to Danny's Fish and Chips!
            </h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for joining our mailing list!
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              You'll be the first to know about:
            </p>
            <ul style="font-size: 16px; line-height: 1.8; color: #333;">
              <li>🍟 Weekly specials and promotions</li>
              <li>🎉 Upcoming events</li>
              <li>📰 Restaurant news and updates</li>
            </ul>
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;">
                <strong>Your subscription details:</strong><br>
                Email: ${subscriberEmail}<br>
                Subscribed: ${subscribedAt}
              </p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We look forward to seeing you soon!
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Danny's Fish and Chips<br>
              <a href="https://dannysfishandchips.ca" style="color: #c41e3a;">dannysfishandchips.ca</a>
            </p>
          </div>
        `,
      });
      strapi.log.info(`Confirmation email sent to subscriber: ${subscriberEmail}`);
    } catch (error) {
      strapi.log.error('Failed to send subscriber confirmation email:', error);
    }
  },
};
