# Free Hosting Options for arturmorin.page

Since you have a **static website**, you can use these **completely free** hosting services. All of them provide **automatic SSL certificates** (HTTPS) for free!

## 🏆 Best Options (Recommended)

### 1. **Cloudflare Pages** ⭐ RECOMMENDED
- ✅ **100% Free** - Unlimited bandwidth, unlimited sites
- ✅ **Automatic SSL** - HTTPS included
- ✅ **Fast CDN** - Global edge network
- ✅ **Custom domains** - Free SSL for arturmorin.page
- ✅ **Git integration** - Auto-deploy from GitHub
- ✅ **No credit card required**

**Setup:**
1. Go to https://pages.cloudflare.com
2. Sign up with GitHub
3. Connect your repository
4. Add custom domain: `arturmorin.page`
5. Configure DNS (Cloudflare will show you exactly what to do)
6. SSL is automatic!

---

### 2. **Vercel**
- ✅ **Free tier** - Generous limits
- ✅ **Automatic SSL** - HTTPS included
- ✅ **Fast global CDN**
- ✅ **Custom domains** - Free
- ✅ **Git integration**

**Setup:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import your repository
4. Add custom domain: `arturmorin.page`
5. Configure DNS
6. SSL is automatic!

---

### 3. **GitHub Pages**
- ✅ **100% Free** - For public repositories
- ✅ **Automatic SSL** - HTTPS included
- ✅ **Custom domains** - Free
- ✅ **Simple setup**

**Setup:**
1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select source branch (usually `main`)
4. Add custom domain: `arturmorin.page`
5. Configure DNS (GitHub will show you what to add)
6. SSL is automatic!

**Note:** GitHub Pages requires your repo to be public (or you need GitHub Pro for private repos).

---

### 4. **Render**
- ✅ **Free tier** - Static sites
- ✅ **Automatic SSL** - HTTPS included
- ✅ **Custom domains** - Free
- ✅ **Git integration**

**Setup:**
1. Go to https://render.com
2. Sign up with GitHub
3. Create new Static Site
4. Connect repository
5. Add custom domain: `arturmorin.page`
6. SSL is automatic!

---

## 📊 Comparison

| Service | Free Tier | SSL | Custom Domain | Bandwidth | Best For |
|---------|-----------|-----|---------------|-----------|----------|
| **Cloudflare Pages** | ✅ Unlimited | ✅ Auto | ✅ Free | ✅ Unlimited | Best overall |
| **Vercel** | ✅ Generous | ✅ Auto | ✅ Free | ✅ Generous | Developers |
| **GitHub Pages** | ✅ Free | ✅ Auto | ✅ Free | ⚠️ Limited | Simple sites |
| **Render** | ✅ Free | ✅ Auto | ✅ Free | ✅ Generous | All projects |

---

## 🚀 Quick Setup: Cloudflare Pages (Recommended)

### Step 1: Push to GitHub
```bash
# Make sure your code is on GitHub
cd /Users/arturmorin/Desktop/Code_2
git add .
git commit -m "Prepare for Cloudflare Pages"
git push
```

### Step 2: Sign up for Cloudflare Pages
1. Go to https://pages.cloudflare.com
2. Click "Sign up" (use GitHub to sign in)
3. Click "Create a project"
4. Select "Connect to Git"
5. Choose your repository: `artur-morin` (or whatever it's called)
6. Configure build:
   - **Framework preset:** None
   - **Build command:** (leave empty - static site)
   - **Build output directory:** `portfolio`
   - **Root directory:** `/` (or leave default)

### Step 3: Add Custom Domain
1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `arturmorin.page`
4. Cloudflare will show you DNS records to add

### Step 4: Configure DNS
At your domain registrar (where you bought arturmorin.page):

**Option A: Use Cloudflare Nameservers (Recommended)**
1. In Cloudflare, go to your domain
2. Cloudflare will show you nameservers (e.g., `alice.ns.cloudflare.com`)
3. At your domain registrar, change nameservers to Cloudflare's
4. Wait 5-30 minutes for propagation

**Option B: Add DNS Records**
1. Add a **CNAME record**:
   - **Type:** CNAME
   - **Name:** @ (or leave blank)
   - **Value:** Your Cloudflare Pages URL (shown in dashboard)
   - **Proxy:** ON (orange cloud)

2. For www:
   - **Type:** CNAME
   - **Name:** www
   - **Value:** Your Cloudflare Pages URL
   - **Proxy:** ON

### Step 5: SSL is Automatic!
- Cloudflare automatically provisions SSL certificate
- Usually takes 5-60 minutes
- You'll see "Active" status when ready
- Your site will be available at `https://arturmorin.page`

---

## 🚀 Quick Setup: Vercel

### Step 1: Sign up
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `portfolio`
   - **Build Command:** (leave empty)
   - **Output Directory:** `.` (current directory)

### Step 3: Add Domain
1. Go to project Settings → Domains
2. Add: `arturmorin.page`
3. Vercel will show DNS records to add

### Step 4: Configure DNS
At your domain registrar:
- Add the DNS records Vercel shows you
- Usually a CNAME or A record

### Step 5: SSL is Automatic!
- Vercel automatically provisions SSL
- Takes 5-60 minutes
- Site available at `https://arturmorin.page`

---

## 🚀 Quick Setup: GitHub Pages

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` / `root`
5. Folder: `/portfolio` (or `/` if your site is in root)
6. Click Save

### Step 3: Add Custom Domain
1. In Pages settings, add custom domain: `arturmorin.page`
2. GitHub will show you DNS records

### Step 4: Configure DNS
At your domain registrar:
- Add the DNS records GitHub shows you
- Usually:
  - **Type:** A records (4 IP addresses)
  - **OR** CNAME to `username.github.io`

### Step 5: SSL is Automatic!
- GitHub automatically enables HTTPS
- Takes a few minutes
- Site available at `https://arturmorin.page`

---

## 🎯 My Recommendation

**Use Cloudflare Pages** because:
- ✅ Completely free, no limits
- ✅ Fastest CDN (global network)
- ✅ Automatic SSL
- ✅ Easy custom domain setup
- ✅ No credit card needed
- ✅ Great for static sites

---

## ❓ FAQ

**Q: Do I need a credit card?**  
A: No! All these services are free for static sites.

**Q: Is SSL really free?**  
A: Yes! All these services provide free SSL certificates automatically.

**Q: What if I exceed free limits?**  
A: For static sites, you're unlikely to hit limits. Cloudflare Pages has unlimited bandwidth.

**Q: Can I use my custom domain?**  
A: Yes! All services support custom domains with free SSL.

**Q: Which is easiest?**  
A: Cloudflare Pages or Vercel - both are very simple and have great documentation.

---

## 📝 Next Steps

1. **Choose a service** (I recommend Cloudflare Pages)
2. **Push your code to GitHub** (if not already there)
3. **Sign up and connect your repository**
4. **Add custom domain: arturmorin.page**
5. **Configure DNS** (the service will show you exactly what to do)
6. **Wait for SSL** (automatic, usually 5-60 minutes)
7. **Done!** Your site is live at https://arturmorin.page

No server needed! No payments! Everything is free! 🎉

