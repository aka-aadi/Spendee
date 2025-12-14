# Improve Email Deliverability (Avoid Spam Folder)

If your OTP emails are going to spam, follow these steps to improve deliverability:

## 🎯 Quick Fixes (Immediate)

### 1. Verify Domain in SendGrid (Best Solution)

**Why**: Domain verification is more trusted than single sender verification.

**Steps**:
1. Go to SendGrid Dashboard → **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain** (not "Verify a Single Sender")
3. Enter your domain (e.g., `spentee.com` or your custom domain)
4. Select your DNS provider
5. Add the provided DNS records (CNAME, SPF, DKIM) to your domain
6. Wait for verification (24-48 hours)
7. Once verified, use `noreply@yourdomain.com` as `SENDGRID_FROM_EMAIL`

**Result**: Emails from verified domains have much better deliverability!

### 2. Use a Professional Email Address

Instead of personal Gmail, use:
- `noreply@yourdomain.com` (if you have a domain)
- A dedicated email service email

### 3. Warm Up Your SendGrid Account

**New SendGrid accounts** can have lower deliverability initially:

1. Send a few test emails to yourself first
2. Mark them as "Not Spam" if they go to spam
3. SendGrid learns your sending patterns over time
4. Deliverability improves after consistent sending

## 🔧 Advanced Solutions

### Option A: Domain Authentication (Recommended)

1. **Get a custom domain** (if you don't have one):
   - Free: [Freenom](https://www.freenom.com/) (.tk, .ml domains)
   - Paid: Namecheap, GoDaddy ($10-15/year)

2. **Set up domain in SendGrid**:
   - Settings → Sender Authentication → Authenticate Your Domain
   - Add DNS records to your domain
   - Wait for verification

3. **Update environment variable**:
   ```env
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Option B: Improve Email Content

Update the email template to be more professional and less "spammy":

- Use proper HTML structure
- Include unsubscribe link (required by law in some regions)
- Avoid spam trigger words
- Use proper headers

### Option C: Use SendGrid's Dedicated IP (Paid)

For production apps with high volume:
- SendGrid paid plans offer dedicated IP addresses
- Better deliverability and reputation
- Costs more but ensures inbox delivery

## 📋 Immediate Actions

### For Your Current Setup:

1. **Mark emails as "Not Spam"**:
   - Go to spam folder
   - Open the email
   - Mark as "Not Spam" / "Not Junk"
   - This trains Gmail to deliver future emails to inbox

2. **Add sender to contacts**:
   - Add `noreply@spentee.com` (or your sender email) to contacts
   - Future emails will go to inbox

3. **Check SendGrid Activity**:
   - Go to SendGrid Dashboard → Activity
   - See if emails are being delivered
   - Check bounce/spam reports

## 🎯 Best Practices

1. **Use domain authentication** (not single sender)
2. **Consistent sending patterns** (don't send bursts)
3. **Professional email address** (noreply@yourdomain.com)
4. **Proper email content** (no spam triggers)
5. **Warm up account** (send gradually at first)

## ⚡ Quick Test

After making changes:

1. Send a test OTP email
2. Check inbox (not spam)
3. If still in spam, mark as "Not Spam"
4. Future emails should improve

## 📊 Monitor Deliverability

Check SendGrid Dashboard → Activity:
- **Delivered**: Emails successfully sent
- **Bounced**: Invalid email addresses
- **Spam Reports**: Users marking as spam
- **Opens**: Users opening emails (good sign!)

## 💡 Why Emails Go to Spam

Common reasons:
- ❌ New SendGrid account (low reputation)
- ❌ Single sender verification (less trusted)
- ❌ Generic email address (personal Gmail)
- ❌ No domain authentication
- ❌ Spam trigger words in content
- ❌ High bounce rate

## ✅ Solution Priority

1. **Immediate**: Mark as "Not Spam" + Add to contacts
2. **Short-term**: Verify domain in SendGrid
3. **Long-term**: Use dedicated IP (if high volume)

---

**Note**: Domain authentication is the most effective way to improve deliverability. If you have a custom domain, set it up in SendGrid!

