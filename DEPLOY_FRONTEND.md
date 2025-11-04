# 🚀 Deploy Frontend Web App to Netlify

## Quick Deploy Guide

### Option 1: Drag & Drop (Easiest)

1. **Build the project:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag and drop the `client/build` folder onto Netlify
   - Wait for deployment (1-2 minutes)

3. **Add Environment Variable:**
   - Go to Site settings → Environment variables
   - Click "Add variable"
   - Key: `REACT_APP_API_URL`
   - Value: `https://spendee-qkf8.onrender.com/api`
   - Click "Save"
   - Go to Deploys tab → Trigger deploy → Deploy site

**Done!** Your site is live at `https://your-site-name.netlify.app`

---

### Option 2: GitHub Integration (Recommended for Updates)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select your repository: `aka-aadi/Spendee`
   - Configure build settings:
     - **Base directory:** `client`
     - **Build command:** `npm install && npm run build`
     - **Publish directory:** `client/build`
   - Click "Deploy site"

3. **Add Environment Variable:**
   - Site settings → Environment variables
   - Add: `REACT_APP_API_URL` = `https://spendee-qkf8.onrender.com/api`
   - Trigger a new deploy

**Auto-deploy:** Every push to `main` branch will automatically deploy!

---

### Option 3: Using Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd client
   npm run build
   netlify deploy --prod --dir=build
   ```

4. **Add environment variable:**
   ```bash
   netlify env:set REACT_APP_API_URL https://spendee-qkf8.onrender.com/api
   ```

---

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Netlify provides free SSL automatically!

---

## Troubleshooting

### Build fails
- Check Node version (should be 18+)
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### API calls failing
- Verify `REACT_APP_API_URL` is set correctly
- Check server is running and accessible
- Check browser console for errors

### Routing not working
- Verify `netlify.toml` exists in `client/` folder
- Check `_redirects` file exists in `client/public/` folder

---

## Need Help?

Check the main [README.md](../README.md) for more details.
