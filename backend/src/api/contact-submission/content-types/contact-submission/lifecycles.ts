/**
 * Lifecycle hooks for contact-submission.
 *
 * afterCreate sends:
 * - Admin notification with submission details.
 * - Submitter confirmation email.
 *
 * Permissions note: this runs server-side on create, regardless of API auth.
 */

const ADMIN_EMAIL = 'info@dannysfishandchips.ca';
const FROM_EMAIL = 'info@dannysfishandchips.ca';

export default {
  async afterCreate(event) {
    const { result } = event;

    const name = result.name;
    const email = result.email;
    const subject = result.subject || '(No subject)';
    const message = result.message;
    const submittedAt = result.submittedAt
      ? new Date(result.submittedAt).toLocaleString('en-CA', {
          dateStyle: 'full',
          timeStyle: 'short',
        })
      : new Date().toLocaleString('en-CA', {
          dateStyle: 'full',
          timeStyle: 'short',
        });
    const source = result.source || 'contact-page';

    // Send notification email to administrator
    try {
      await strapi.plugins['email'].services.email.send({
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: 'New Contact Form Submission - Danny\'s Fish and Chips',
        text: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}\n\nSubmitted at: ${submittedAt}\nSource: ${source}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #c41e3a; border-bottom: 3px solid #c41e3a; padding-bottom: 10px;">
              📬 New Contact Form Submission
            </h1>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Contact Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666; width: 140px;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #c41e3a;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td>
                  <td style="padding: 8px 0;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Submitted At:</td>
                  <td style="padding: 8px 0;">${submittedAt}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #666;">Source:</td>
                  <td style="padding: 8px 0;">${source}</td>
                </tr>
              </table>
            </div>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Message:</h3>
              <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              You can view this submission in the <a href="${process.env.STRAPI_ADMIN_URL || 'http://localhost:1337'}/admin/content-manager/collection-types/api::contact-submission.contact-submission" style="color: #c41e3a;">Strapi Admin Panel</a>.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Danny's Fish and Chips - Contact Form System
            </p>
          </div>
        `,
      });
      strapi.log.info(`Admin notification sent for contact submission from: ${email}`);
    } catch (error) {
      strapi.log.error('Failed to send admin notification email:', error);
    }

    // Send confirmation email to submitter
    try {
      await strapi.plugins['email'].services.email.send({
        to: email,
        from: FROM_EMAIL,
        subject: 'We received your message - Danny\'s Fish and Chips',
        text: `Hi ${name},\n\nThank you for contacting Danny's Fish and Chips! We've received your message and will get back to you within 24-48 hours.\n\nYour submission details:\nSubject: ${subject}\nReceived: ${submittedAt}\n\nWe look forward to connecting with you soon!\n\nBest regards,\nThe team at Danny's Fish and Chips`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #c41e3a; border-bottom: 3px solid #c41e3a; padding-bottom: 10px;">
              🐟 Thank You for Contacting Us!
            </h1>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Hi ${name},
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Thank you for reaching out to Danny's Fish and Chips! We've received your message and will get back to you within <strong>24-48 hours</strong>.
            </p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #c41e3a;">
              <p style="margin: 0; color: #333;">
                <strong>Your submission details:</strong><br>
                Subject: ${subject}<br>
                Received: ${submittedAt}
              </p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              We look forward to connecting with you soon!
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Best regards,<br>
              <strong>The team at Danny's Fish and Chips</strong>
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              Danny's Fish and Chips<br>
              <a href="https://dannysfishandchips.ca" style="color: #c41e3a;">dannysfishandchips.ca</a>
            </p>
          </div>
        `,
      });
      strapi.log.info(`Confirmation email sent to: ${email}`);
    } catch (error) {
      strapi.log.error('Failed to send confirmation email:', error);
    }
  },
};
