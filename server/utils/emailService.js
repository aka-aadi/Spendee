const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email is configured
  const emailHost = process.env.EMAIL_HOST;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  // If email not configured, return null (emails won't be sent)
  if (!emailHost || !emailUser || !emailPassword) {
    console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort) || 587,
    secure: parseInt(emailPort) === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

/**
 * Send OTP email for email verification
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Email service not configured. OTP:', otp);
      return { success: false, message: 'Email service not configured' };
    }

    const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const appName = process.env.APP_NAME || 'Spentee';

    const mailOptions = {
      from: `"${appName}" <${emailFrom}>`,
      to: email,
      subject: 'Verify Your Email - Spentee',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
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

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail
};

