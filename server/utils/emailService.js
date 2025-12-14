const sgMail = require('@sendgrid/mail');

// Configure SendGrid
const isSendGridConfigured = process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL;

if (isSendGridConfigured) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send OTP email for email verification using SendGrid
 */
const sendOTPEmail = async (email, otp) => {
  try {
    if (!isSendGridConfigured) {
      console.warn('\n⚠️  ============================================');
      console.warn('⚠️  SENDGRID NOT CONFIGURED');
      console.warn('⚠️  Missing environment variables:');
      if (!process.env.SENDGRID_API_KEY) console.warn('⚠️    - SENDGRID_API_KEY');
      if (!process.env.SENDGRID_FROM_EMAIL) console.warn('⚠️    - SENDGRID_FROM_EMAIL');
      console.warn('⚠️  OTP for', email, ':', otp);
      console.warn('⚠️  ============================================\n');
      return { success: false, message: 'Email service not configured. Check server logs for OTP.' };
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    const appName = process.env.APP_NAME || 'Spentee';
    const fromName = process.env.APP_NAME || 'Spentee';

    const msg = {
      to: email,
      from: {
        email: fromEmail,
        name: fromName
      },
      replyTo: fromEmail, // Add reply-to for better deliverability
      subject: 'Verify Your Email - Spentee',
      // Add headers to improve deliverability
      headers: {
        'X-Entity-Ref-ID': `otp-${Date.now()}`, // Unique identifier
        'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`, // Unsubscribe option
      },
      // Add categories for better tracking
      categories: ['otp-verification'],
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${appName}</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! Please use the following OTP (One-Time Password) to verify your email address:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p>This OTP will expire in 10 minutes. If you didn't create an account, please ignore this email.</p>
              
              <p>Best regards,<br>The ${appName} Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your Email Address - ${appName}
        
        Thank you for signing up! Please use the following OTP to verify your email address:
        
        ${otp}
        
        This OTP will expire in 10 minutes. If you didn't create an account, please ignore this email.
        
        Best regards,
        The ${appName} Team
      `
    };

    await sgMail.send(msg);
    console.log('✅ OTP email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('\n❌ ============================================');
    console.error('❌ ERROR SENDING OTP EMAIL');
    console.error('❌ Email:', email);
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('❌ SendGrid Status:', error.response.statusCode);
      console.error('❌ SendGrid Error:', JSON.stringify(error.response.body, null, 2));
      
      // Common error messages
      if (error.response.body?.errors) {
        error.response.body.errors.forEach(err => {
          console.error('❌   -', err.message);
        });
      }
    }
    console.error('❌ ============================================\n');
    return { success: false, error: error.message, details: error.response?.body };
  }
};

module.exports = {
  sendOTPEmail
};
