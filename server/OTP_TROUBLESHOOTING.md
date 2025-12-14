# OTP Email Troubleshooting Guide

If you're not receiving OTP emails, follow these steps:

## 🔍 Step 1: Check Server Logs

**The OTP is always logged to the server console**, even if email fails. Check your server logs for:

```
⚠️  ============================================
⚠️  EMAIL NOT SENT - OTP FOR DEVELOPMENT:
⚠️  Email: your-email@example.com
⚠️  OTP: 123456
⚠️  ============================================
```

**If you see this**, the OTP is in the logs - you can use it to verify your account!

## 🔧 Step 2: Check SendGrid Configuration

### Check Environment Variables

Make sure these are set in your `.env` file (local) or Render environment variables (production):

```env
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
```

### Verify SendGrid Setup

1. **Check API Key**:
   - Go to SendGrid Dashboard → Settings → API Keys
   - Verify your API key exists and is active
   - Make sure it starts with `SG.`

2. **Check Sender Verification**:
   - Go to SendGrid Dashboard → Settings → Sender Authentication
   - Verify your sender email is verified (green checkmark)
   - The email must match `SENDGRID_FROM_EMAIL` exactly

## 🐛 Common Issues

### Issue 1: "SendGrid not configured"

**Symptoms**: Server logs show "SENDGRID NOT CONFIGURED"

**Solution**:
1. Add `SENDGRID_API_KEY` to environment variables
2. Add `SENDGRID_FROM_EMAIL` to environment variables
3. Restart your server

### Issue 2: "The from address does not match a verified Sender Identity"

**Symptoms**: SendGrid error in server logs

**Solution**:
1. Go to SendGrid → Settings → Sender Authentication
2. Verify the sender email (click "Verify a Single Sender")
3. Make sure `SENDGRID_FROM_EMAIL` matches the verified email exactly
4. Wait a few minutes after verification

### Issue 3: "Unauthorized" or "Invalid API Key"

**Symptoms**: SendGrid returns 401 error

**Solution**:
1. Verify API key is correct (starts with `SG.`)
2. Check for extra spaces in the API key
3. Regenerate API key if needed
4. Make sure API key has "Mail Send" permission

### Issue 4: Email sent but not received

**Symptoms**: Server logs show "✅ OTP email sent" but no email

**Solution**:
1. Check **spam/junk folder**
2. Check SendGrid **Activity** tab to see if email was sent
3. Verify recipient email address is correct
4. Check if you've hit the 100 emails/day limit (free tier)

### Issue 5: "Daily sending quota exceeded"

**Symptoms**: SendGrid error about quota

**Solution**:
- You've sent 100 emails today (free tier limit)
- Wait until tomorrow (resets at midnight UTC)
- Or upgrade to a paid SendGrid plan

## 🚀 Quick Fix: Use OTP from Server Logs

**For immediate testing**, you can use the OTP from server logs:

1. Check your server console/logs
2. Look for the OTP code (6 digits)
3. Enter it in the mobile app

The OTP is always logged when email fails, so you can still test the verification flow!

## 📋 Checklist

- [ ] `SENDGRID_API_KEY` is set in environment variables
- [ ] `SENDGRID_FROM_EMAIL` is set in environment variables
- [ ] API key is valid and active in SendGrid
- [ ] Sender email is verified in SendGrid
- [ ] `SENDGRID_FROM_EMAIL` matches verified sender email exactly
- [ ] Server has been restarted after adding environment variables
- [ ] Checked spam/junk folder
- [ ] Checked SendGrid Activity tab
- [ ] Not exceeded 100 emails/day limit

## 🔍 Debug Steps

1. **Check server logs** for OTP code
2. **Check SendGrid dashboard** → Activity tab
3. **Verify environment variables** are set correctly
4. **Test API key** manually:
   ```bash
   curl -X POST https://api.sendgrid.com/v3/mail/send \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"your-verified@email.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test email"}]}'
   ```

## 💡 Development Mode

If you're in development and don't want to set up SendGrid:

1. The OTP will be logged to server console
2. Use the OTP from logs to verify your account
3. This allows you to test the full flow without email setup

## 📞 Still Having Issues?

1. Check server logs for detailed error messages
2. Check SendGrid dashboard for email activity
3. Verify all environment variables are set correctly
4. Make sure you've restarted the server after configuration changes

