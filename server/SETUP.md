# Spentee Server Setup Guide

Complete setup guide for the Spentee expense tracking application server.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Email Configuration (SendGrid)](#email-configuration-sendgrid)
4. [Local Development Setup](#local-development-setup)
5. [Production Deployment (Render.com)](#production-deployment-rendercom)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account (or local MongoDB)
- SendGrid account (free tier available)

---

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spentee?retryWrites=true&w=majority

# Session
SESSION_SECRET=your-random-secret-key-here-change-in-production
FORCE_SECURE_COOKIES=true

# SendGrid Email Configuration
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
APP_NAME=Spentee

# Admin User (Optional - for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_EMAIL=admin@example.com
```

**⚠️ Important**: 
- Never commit `.env` file to Git (it's already in `.gitignore`)
- Use strong, random values for `SESSION_SECRET`
- Keep API keys secure

---

## Email Configuration (SendGrid)

Spentee uses SendGrid for sending OTP verification emails. The free tier includes **100 emails per day**.

### Step 1: Create SendGrid Account

1. Go to [SendGrid Sign Up](https://signup.sendgrid.com/)
2. Sign up with your email (free!)
3. Verify your email address

### Step 2: Create API Key

1. In SendGrid dashboard: **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `Spentee OTP Service`
4. Permissions: **Full Access** (or **Restricted Access** with "Mail Send" only)
5. Click **Create & View**
6. **⚠️ Copy the API key immediately** - you won't see it again!

### Step 3: Verify Sender Email

**Option A: Use Personal Email (Quickest - Recommended for Testing)**

1. **Settings** → **Sender Authentication** → **Verify a Single Sender**
2. Fill in:
   - **From Email**: Your personal email (e.g., `yourname@gmail.com`)
   - **From Name**: `Spentee`
   - **Reply To**: Same as From Email
   - **Company Address**: Your address
   - **Website URL**: Your website URL
3. Click **Create**
4. **Check your email** and click the verification link
5. ✅ Once verified, use this email in `SENDGRID_FROM_EMAIL`

**Option B: Use Custom Domain (Professional - For Production)**

1. **Settings** → **Sender Authentication** → **Authenticate Your Domain**
2. Enter your domain (e.g., `spentee.com`)
3. Add the provided DNS records to your domain
4. Wait for verification (24-48 hours)
5. ✅ Once verified, you can use any email on that domain:
   - `noreply@spentee.com`
   - `support@spentee.com`
   - etc.

**⚠️ Note**: You cannot use `noreply@spentee.netlify.app` - Netlify subdomains don't support email.

### Step 4: Add to Environment Variables

```env
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=your-verified-email@example.com
APP_NAME=Spentee
```

---

## Local Development Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create `server/.env` file with all required variables (see [Environment Variables](#environment-variables))

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### 4. Initialize Admin User (Optional)

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/init

# Or using the API directly
POST http://localhost:5000/api/auth/init
```

Or set `ADMIN_PASSWORD` in `.env` and the admin user will be created automatically on server start.

---

## Production Deployment (Render.com)

### 1. Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select the repository and branch

### 2. Configure Build Settings

- **Name**: `spentee-server` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Root Directory**: Leave empty (or set to `server` if your repo structure requires it)

### 3. Add Environment Variables

In Render dashboard → **Environment** tab, add:

```
MONGODB_URI = mongodb+srv://...
SESSION_SECRET = your-random-secret
FORCE_SECURE_COOKIES = true
SENDGRID_API_KEY = SG.your-api-key
SENDGRID_FROM_EMAIL = your-verified-email@example.com
APP_NAME = Spentee
ADMIN_USERNAME = admin
ADMIN_PASSWORD = your-secure-password
ADMIN_EMAIL = admin@example.com
```

### 4. Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy
3. Your API will be available at: `https://your-service.onrender.com`

### 5. Update API URL in Mobile App

Update `mobile/src/config/api.js`:

```javascript
const API_BASE_URL = 'https://your-service.onrender.com/api';
```

---

## Testing

### Test Email Configuration

1. Start your server
2. Try registering a new user in the mobile app
3. Check server console:
   - ✅ Success: `✅ OTP email sent successfully to: user@example.com`
   - ⚠️ Not configured: `⚠️ SendGrid not configured. OTP: 123456`
4. Check user's email inbox for OTP

### Test API Endpoints

```bash
# Health check
curl https://your-service.onrender.com/api/health

# Should return: {"status":"OK","message":"Spentee API is running"}
```

### Test Authentication

```bash
# Register user
curl -X POST https://your-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456",
    "fullName": "Test User"
  }'

# Verify email with OTP
curl -X POST https://your-service.onrender.com/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

---

## Troubleshooting

### Email Issues

**"SendGrid not configured"**
- Check that `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` are set
- Restart server after adding environment variables
- For Render: Ensure environment variables are saved and service redeployed

**"The from address does not match a verified Sender Identity"**
- Verify the sender email in SendGrid dashboard
- Ensure `SENDGRID_FROM_EMAIL` matches verified email exactly
- Wait a few minutes after verification (propagation delay)

**"Unauthorized" or "Invalid API Key"**
- Verify API key is correct (starts with `SG.`)
- Check for extra spaces in API key
- Ensure API key hasn't been deleted or regenerated

**Emails not arriving**
- Check SendGrid **Activity** tab to see if emails were sent
- Check spam/junk folder
- Verify recipient email address
- Check if you've hit the 100 emails/day limit (free tier)

### Database Issues

**"MongoDB connection error"**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- Ensure database user has correct permissions

### Session Issues

**"Not authenticated" errors**
- Check `SESSION_SECRET` is set
- For Render: Ensure `FORCE_SECURE_COOKIES=true` for HTTPS
- Clear browser/app cache and try again

### Deployment Issues

**Build fails on Render**
- Check Node.js version (requires >= 18.0.0)
- Verify `package.json` has correct scripts
- Check build logs in Render dashboard

**API not accessible**
- Verify service is running (not sleeping)
- Check environment variables are set correctly
- Verify CORS settings allow your mobile app origin

---

## SendGrid Free Tier Limits

- **100 emails per day** (perfect for OTP verification)
- Unlimited contacts
- Email API access
- Email analytics

**Note**: If you need more than 100 emails/day, SendGrid paid plans start at $19.95/month for 50,000 emails.

---

## Security Best Practices

1. **Never commit `.env` file** to Git
2. **Use strong, random `SESSION_SECRET`**
3. **Rotate API keys** periodically
4. **Use Restricted Access API keys** in SendGrid (only "Mail Send" permission)
5. **Keep environment variables secure** in production
6. **Use HTTPS** in production (Render provides this automatically)
7. **Set `FORCE_SECURE_COOKIES=true`** for production

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Financial Data
- `GET /api/financial/summary` - Get financial summary
- `GET /api/expenses` - Get expenses
- `GET /api/income` - Get income
- `GET /api/upi` - Get UPI payments
- `GET /api/budgets` - Get budgets
- `GET /api/emis` - Get EMIs
- `GET /api/savings` - Get savings

### Upload
- `POST /api/upload/profile-picture` - Upload profile picture

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review SendGrid documentation: https://docs.sendgrid.com/
3. Check server logs for detailed error messages

---

## Quick Reference

### Required Environment Variables
```env
MONGODB_URI=...
SESSION_SECRET=...
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
```

### Optional Environment Variables
```env
APP_NAME=Spentee
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...
ADMIN_EMAIL=...
FORCE_SECURE_COOKIES=true
```

### Common Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Test health endpoint
curl http://localhost:5000/api/health
```

---

**Last Updated**: 2024
**Version**: 1.0.0

