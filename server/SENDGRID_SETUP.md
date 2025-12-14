# SendGrid Email Setup Guide (Free Tier)

SendGrid is a free email service perfect for Firebase projects. The free tier includes **100 emails per day** - perfect for OTP verification!

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create SendGrid Account

1. Go to [SendGrid Sign Up](https://signup.sendgrid.com/)
2. Sign up with your email (it's free!)
3. Verify your email address

### Step 2: Create API Key

1. Once logged in, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `Spentee OTP Service`
4. Select **Full Access** (or **Restricted Access** with only "Mail Send" permission)
5. Click **Create & View**
6. **⚠️ IMPORTANT: Copy the API key immediately** - you won't be able to see it again!

### Step 3: Verify Sender Identity

**Important**: You cannot use `noreply@spentee.netlify.app` because Netlify subdomains don't support email. See `CUSTOM_EMAIL_SETUP.md` for options.

**Option A: Use Your Personal Email (Quickest)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - **From Email**: Your personal email (e.g., `yourname@gmail.com`)
   - **From Name**: `Spentee` (or your app name)
   - **Reply To**: Same as From Email
   - **Company Address**: Your address
   - **Website URL**: Your website (or `https://github.com/yourusername/spentee`)
4. Click **Create**
5. **Check your email** and click the verification link
6. ✅ Once verified, you can send emails!
7. Emails will appear as: **"Spentee" <yourname@gmail.com>**

**Option B: Use Custom Domain (Professional)**
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain** (not "Verify a Single Sender")
3. Enter your custom domain (e.g., `spentee.com`)
4. Add DNS records to your domain provider
5. Wait for verification (24-48 hours)
6. ✅ Once verified, you can use `noreply@spentee.com` or any email on that domain!

**See `CUSTOM_EMAIL_SETUP.md` for detailed instructions on setting up custom domain emails.**

### Step 4: Configure Environment Variables

#### For Local Development:

Create or edit `server/.env` file:

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
APP_NAME=Spentee
```

**⚠️ Note**: `noreply@spentee.netlify.app` won't work - Netlify subdomains don't support email.  
**Options**:
- Use your personal email (quickest)
- Get a custom domain and set up `noreply@yourdomain.com`  
See `CUSTOM_EMAIL_SETUP.md` for detailed instructions.

**Important**: 
- Use the **API Key** you copied in Step 2
- Use the **verified email** from Step 3

#### For Production (Render.com):

1. Go to your Render dashboard
2. Select your **Web Service**
3. Go to **Environment** tab
4. Add these environment variables:

```
SENDGRID_API_KEY = SG.your-api-key-here
SENDGRID_FROM_EMAIL = your-verified-email@example.com
APP_NAME = Spentee
```

5. Click **Save Changes**
6. Your service will automatically redeploy

---

## ✅ Testing

1. **Start your server**:
   ```bash
   cd server
   npm install  # Install @sendgrid/mail package
   npm start
   ```

2. **Try registering a new user** in your app

3. **Check the server console**:
   - ✅ If configured correctly: `✅ OTP email sent successfully to: user@example.com`
   - ⚠️ If not configured: `⚠️ SendGrid not configured. OTP: 123456`

4. **Check the user's email inbox** for the OTP email

---

## 📊 SendGrid Free Tier Limits

- **100 emails per day** (perfect for OTP verification!)
- **Unlimited contacts**
- **Email API access**
- **Email analytics**

**Note**: If you need more than 100 emails/day, SendGrid has affordable paid plans starting at $19.95/month for 50,000 emails.

---

## 🔒 Security Best Practices

1. **Never commit API keys** to Git (`.env` should be in `.gitignore`)
2. **Use environment variables** in production
3. **Rotate API keys** periodically
4. **Use Restricted Access** API keys with only "Mail Send" permission (more secure)

---

## 🐛 Troubleshooting

### "SendGrid not configured"
- Check that `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set
- Restart your server after adding environment variables
- For Render: Make sure you saved the environment variables and the service redeployed

### "The from address does not match a verified Sender Identity"
- Make sure you verified the sender email in SendGrid dashboard
- Check that `SENDGRID_FROM_EMAIL` matches the verified email exactly
- Wait a few minutes after verification (it can take time to propagate)

### "Unauthorized" or "Invalid API Key"
- Verify the API key is correct (starts with `SG.`)
- Make sure there are no extra spaces in the API key
- Check that the API key hasn't been deleted or regenerated

### Emails not arriving
- Check SendGrid **Activity** tab to see if emails were sent
- Check spam/junk folder
- Verify the recipient email address is correct
- Check if you've hit the 100 emails/day limit

### "Daily sending quota exceeded"
- You've sent 100 emails today (free tier limit)
- Wait until tomorrow or upgrade to a paid plan
- Check SendGrid dashboard → **Activity** to see your usage

---

## 📈 Monitoring

SendGrid provides great analytics:

1. Go to **Activity** tab in SendGrid dashboard
2. See:
   - Emails sent
   - Delivery rate
   - Open rate (if enabled)
   - Bounce rate
   - Spam reports

---

## 🎯 Why SendGrid?

✅ **Free tier** (100 emails/day)  
✅ **Easy setup** (5 minutes)  
✅ **Reliable delivery** (better than SMTP)  
✅ **Analytics** included  
✅ **No SMTP configuration** needed  
✅ **Perfect for Firebase projects**  
✅ **Scalable** (easy to upgrade)  

---

## 💡 Tips

1. **Use a dedicated email** for sending (e.g., `noreply@yourdomain.com`)
2. **Monitor your usage** in SendGrid dashboard
3. **Set up email alerts** if you approach the daily limit
4. **Verify your domain** (optional) for better deliverability
5. **Keep API keys secure** - treat them like passwords

---

## 🔄 Migration from SMTP

If you were using SMTP before:

1. Remove these from `.env`:
   ```env
   EMAIL_HOST=...
   EMAIL_PORT=...
   EMAIL_USER=...
   EMAIL_PASSWORD=...
   ```

2. Add these instead:
   ```env
   SENDGRID_API_KEY=SG.your-api-key
   SENDGRID_FROM_EMAIL=your-verified-email@example.com
   ```

3. Restart your server

That's it! No code changes needed - the email service automatically uses SendGrid now.

---

## 📚 Additional Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SendGrid Node.js SDK](https://github.com/sendgrid/sendgrid-nodejs)
- [SendGrid Pricing](https://sendgrid.com/pricing/)

