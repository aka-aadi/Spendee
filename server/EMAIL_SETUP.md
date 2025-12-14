# Email Configuration for OTP Verification

To enable email OTP verification, you need to configure email settings in your `.env` file.

## Required Environment Variables

Add these to your `server/.env` file:

```env
# Email Configuration (for OTP verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
APP_NAME=Spentee
```

## Gmail Setup (Recommended)

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `EMAIL_PASSWORD`

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

### Custom SMTP
Use your email provider's SMTP settings.

## Development Mode

If email is not configured, the OTP will be logged to the console for testing purposes.

## Production

For production, use a dedicated email service like:
- **SendGrid** (recommended)
- **Mailgun**
- **Amazon SES**
- **Postmark**

Update `server/utils/emailService.js` to use your preferred service's API.

