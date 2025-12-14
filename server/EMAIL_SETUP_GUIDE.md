# Email Setup Guide for OTP Verification

## 📧 Which Email Will Send Authentication Emails?

The authentication emails will be sent **from the email address you configure** in your environment variables. The email format will be:

```
"Spentee" <your-email@gmail.com>
```

Where:
- **Display Name**: Set by `APP_NAME` (defaults to "Spentee")
- **Email Address**: Set by `EMAIL_FROM` or `EMAIL_USER`

---

## 🚀 Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password

1. Go to [Google Account → App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "Spentee Server" as the name
5. Click **Generate**
6. **Copy the 16-character password** (you'll need this)

### Step 3: Configure Environment Variables

#### For Local Development:

Create or edit `server/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com
APP_NAME=Spentee
```

**Important**: 
- Use your **actual Gmail address** for `EMAIL_USER` and `EMAIL_FROM`
- Use the **16-character app password** (not your regular Gmail password) for `EMAIL_PASSWORD`

#### For Production (Render.com):

1. Go to your Render dashboard
2. Select your **Web Service** (the server)
3. Go to **Environment** tab
4. Click **Add Environment Variable** for each:

```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-16-character-app-password
EMAIL_FROM = your-email@gmail.com
APP_NAME = Spentee
```

5. Click **Save Changes**
6. Your service will automatically redeploy

---

## 📮 Other Email Providers

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

### Yahoo Mail

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

**Note**: Yahoo also requires app passwords (similar to Gmail)

### Custom SMTP Server

```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@domain.com
```

---

## ✅ Testing Your Email Configuration

1. **Start your server**:
   ```bash
   cd server
   npm start
   ```

2. **Try registering a new user** in your app

3. **Check the server console**:
   - ✅ If configured correctly: `OTP email sent: <message-id>`
   - ⚠️ If not configured: `Email service not configured. OTP: 123456`

4. **Check the user's email inbox** for the OTP email

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to Git (it should be in `.gitignore`)
2. **Use App Passwords** instead of your main email password
3. **Rotate passwords** periodically
4. **Use environment variables** in production (not hardcoded values)

---

## 🐛 Troubleshooting

### "Email service not configured"
- Check that all environment variables are set
- Restart your server after adding environment variables
- For Render: Make sure you saved the environment variables and the service redeployed

### "Invalid login" or "Authentication failed"
- For Gmail: Make sure you're using an **App Password**, not your regular password
- Check that 2-Step Verification is enabled
- Verify the email address is correct

### "Connection timeout"
- Check your firewall/network settings
- Verify the SMTP host and port are correct
- Some networks block SMTP ports (587, 465)

### Emails going to spam
- This is normal for new email addresses
- Consider using a dedicated email service (SendGrid, Mailgun) for production
- Add SPF/DKIM records to your domain (if using custom domain)

---

## 🎯 Production Recommendations

For production apps, consider using dedicated email services:

### SendGrid (Recommended)
- Free tier: 100 emails/day
- Better deliverability
- Analytics and tracking
- Easy to set up

### Mailgun
- Free tier: 5,000 emails/month
- Great for transactional emails
- Good documentation

### Amazon SES
- Very cheap ($0.10 per 1,000 emails)
- Requires AWS account
- More setup required

---

## 📝 Example .env File

```env
# Database
MONGODB_URI=your-mongodb-connection-string

# Session
SESSION_SECRET=your-session-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
APP_NAME=Spentee

# Admin (optional)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 💡 Tips

1. **Use a dedicated email** for sending (e.g., `noreply@yourdomain.com`)
2. **Set a professional display name** via `APP_NAME`
3. **Test in development** before deploying to production
4. **Monitor email delivery** in production
5. **Keep app passwords secure** - treat them like regular passwords

