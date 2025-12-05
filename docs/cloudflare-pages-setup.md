# Cloudflare Pages Setup for arturmorin.page

Step-by-step guide to deploy your portfolio to Cloudflare Pages with free SSL.

## Prerequisites
- Your code on GitHub
- Domain: `arturmorin.page`
- Access to your domain registrar's DNS settings

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
cd /Users/arturmorin/Desktop/Code_2
git status
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push
```

## Step 2: Sign Up for Cloudflare Pages

1. Go to https://pages.cloudflare.com
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Cloudflare to access your GitHub account

## Step 3: Create a New Project

1. Click **"Create a project"**
2. Click **"Connect to Git"**
3. Select your repository (e.g., `Artursgg/artur-morin`)
4. Click **"Begin setup"**

## Step 4: Configure Build Settings

Since this is a static site, configure:

- **Project name:** `arturmorin-portfolio` (or any name)
- **Production branch:** `main` (or `master`)
- **Framework preset:** `None` or `Create React App` (doesn't matter for static)
- **Build command:** (leave empty - no build needed)
- **Build output directory:** `portfolio`
  - This tells Cloudflare where your site files are
  - If your HTML files are in the root, use `.` instead

**Important:** Make sure the build output directory matches where your `photography-index.html` and other files are located.

## Step 5: Deploy

1. Click **"Save and Deploy"**
2. Wait for deployment (usually 1-2 minutes)
3. Your site will be live at: `https://your-project-name.pages.dev`

## Step 6: Add Custom Domain

1. In your Cloudflare Pages project, go to **"Custom domains"** tab
2. Click **"Set up a custom domain"**
3. Enter: `arturmorin.page`
4. Click **"Continue"**
5. Cloudflare will show you DNS configuration options

## Step 7: Configure DNS

You have two options:

### Option A: Use Cloudflare Nameservers (Recommended)

1. In Cloudflare dashboard, go to your domain (or add it if not already there)
2. Cloudflare will show you nameservers, e.g.:
   - `alice.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`
3. Go to your domain registrar (where you bought arturmorin.page)
4. Find "Nameservers" or "DNS" settings
5. Replace existing nameservers with Cloudflare's
6. Save and wait 5-30 minutes for propagation

### Option B: Add DNS Records at Your Registrar

If you don't want to change nameservers:

1. In Cloudflare Pages, you'll see DNS records to add
2. At your domain registrar, add:
   - **Type:** CNAME
   - **Name:** @ (or leave blank for root domain)
   - **Value:** Your Cloudflare Pages URL (e.g., `your-project.pages.dev`)
   - **TTL:** 3600

3. For www subdomain:
   - **Type:** CNAME
   - **Name:** www
   - **Value:** Your Cloudflare Pages URL
   - **TTL:** 3600

## Step 8: Wait for SSL

- Cloudflare automatically provisions SSL certificate
- Usually takes 5-60 minutes
- You'll see "Active" status in Cloudflare Pages dashboard
- Check status: Go to Custom domains → SSL/TLS

## Step 9: Verify

1. Visit: `https://arturmorin.page`
2. You should see your portfolio site
3. Check for padlock icon in browser (SSL working!)

## Step 10: Configure Redirects (Optional)

Your `netlify.toml` has redirect rules. For Cloudflare Pages, you can:

### Option A: Use `_redirects` file

Create `portfolio/_redirects`:
```
/ /photography-index.html 200
/home /photography-index.html 200
```

### Option B: Use Cloudflare Workers (Advanced)

Or keep using `netlify.toml` - Cloudflare Pages will ignore it, but you can recreate redirects in Cloudflare dashboard.

## Automatic Deployments

Cloudflare Pages automatically deploys when you push to GitHub:

1. Make changes locally
2. `git push` to GitHub
3. Cloudflare automatically detects changes
4. New deployment starts automatically
5. Usually takes 1-2 minutes

## Custom Headers

Your `netlify.toml` has security headers. For Cloudflare Pages:

1. Go to project Settings → Functions
2. You can add headers via Cloudflare Workers
3. Or use Cloudflare's built-in security features

**Note:** Cloudflare automatically adds many security headers, so you may not need to configure them manually.

## Troubleshooting

### Site not loading
- Check DNS propagation: `dig arturmorin.page`
- Wait longer (can take up to 48 hours, usually 15-30 minutes)
- Verify DNS records are correct

### SSL not working
- Wait longer (SSL provisioning takes 5-60 minutes)
- Check Cloudflare Pages dashboard for SSL status
- Make sure DNS is pointing to Cloudflare

### 404 errors
- Check build output directory setting
- Make sure `photography-index.html` is in the correct folder
- Verify file paths in your HTML files

### Build fails
- Check build output directory
- Make sure the directory exists
- Check Cloudflare Pages build logs

## Cost

**$0.00** - Completely free!
- Unlimited bandwidth
- Unlimited sites
- Free SSL
- Free custom domains
- No credit card required

## Support

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Community: https://community.cloudflare.com/

---

**That's it!** Your site will be live at `https://arturmorin.page` with free SSL! 🎉

