# Migration Guide: Netlify to Self-Hosted (arturmorin.page)

This guide will help you migrate your portfolio site from Netlify to your own server with Let's Encrypt SSL.

## Prerequisites

1. **A VPS/Server** (Ubuntu/Debian recommended)
   - Examples: DigitalOcean, Linode, Vultr, AWS EC2, etc.
   - Minimum: 1GB RAM, 1 CPU core
   - Ubuntu 20.04+ or Debian 11+

2. **Domain DNS Access**
   - Access to your domain registrar's DNS settings
   - Domain: `arturmorin.page`

3. **SSH Access** to your server

## Step 1: Server Setup

### Connect to your server
```bash
ssh root@your-server-ip
```

### Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 2: Configure DNS

Before getting SSL, configure your DNS records:

**At your domain registrar (where you bought arturmorin.page):**

1. Add an **A record**:
   - **Type:** A
   - **Name:** @ (or leave blank for root domain)
   - **Value:** Your server's IP address
   - **TTL:** 3600 (or default)

2. Add a **CNAME record** for www (optional):
   - **Type:** CNAME
   - **Name:** www
   - **Value:** arturmorin.page
   - **TTL:** 3600

**Wait for DNS propagation** (can take 5 minutes to 48 hours, usually 15-30 minutes)

Verify DNS:
```bash
dig arturmorin.page
# or
nslookup arturmorin.page
```

## Step 3: Upload Site Files

### Option A: Using SCP (from your local machine)
```bash
# From your local machine (in the Code_2 directory)
scp -r portfolio/* root@your-server-ip:/var/www/arturmorin.page/
```

### Option B: Using Git (on server)
```bash
# On your server
sudo mkdir -p /var/www/arturmorin.page
cd /var/www/arturmorin.page
sudo git clone https://github.com/Artursgg/artur-morin.git .
# Or copy files manually
```

### Set proper permissions
```bash
sudo chown -R www-data:www-data /var/www/arturmorin.page
sudo chmod -R 755 /var/www/arturmorin.page
```

## Step 4: Install Certbot (Let's Encrypt)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y
```

## Step 5: Configure Nginx

### Copy the nginx configuration
```bash
# Copy the nginx.conf from this repo to your server
sudo nano /etc/nginx/sites-available/arturmorin.page
# Paste the contents of nginx.conf from this repository
```

### Update the root path in the config
Make sure the `root` directive points to your site directory:
```nginx
root /var/www/arturmorin.page;
```

### Enable the site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/arturmorin.page /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

## Step 6: Get SSL Certificate

**Important:** Make sure:
- DNS is pointing to your server (check with `dig arturmorin.page`)
- Port 80 is open in your firewall
- Nginx is running

### Request certificate
```bash
sudo certbot --nginx -d arturmorin.page -d www.arturmorin.page
```

Certbot will:
1. Verify domain ownership
2. Obtain SSL certificate from Let's Encrypt
3. Automatically configure Nginx with SSL
4. Set up auto-renewal

### Test auto-renewal
```bash
sudo certbot renew --dry-run
```

## Step 7: Verify Everything Works

1. **Check HTTP redirect:**
   - Visit: `http://arturmorin.page`
   - Should redirect to `https://arturmorin.page`

2. **Check HTTPS:**
   - Visit: `https://arturmorin.page`
   - Should show padlock icon in browser

3. **Test SSL:**
   - Visit: https://www.ssllabs.com/ssltest/analyze.html?d=arturmorin.page

## Step 8: Firewall Configuration

If you have a firewall, allow HTTP and HTTPS:

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Or manually:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
```

## Step 9: Set Up Auto-Renewal

Certbot automatically sets up a cron job, but verify:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Or check crontab
sudo crontab -l
```

Certificates auto-renew 30 days before expiration.

## Troubleshooting

### SSL certificate fails
- **DNS not propagated:** Wait longer, check with `dig arturmorin.page`
- **Port 80 blocked:** Open port 80 in firewall
- **Nginx not running:** `sudo systemctl status nginx`

### Site not loading
- **Check Nginx:** `sudo systemctl status nginx`
- **Check logs:** `sudo tail -f /var/log/nginx/error.log`
- **Check permissions:** `ls -la /var/www/arturmorin.page`

### 404 errors
- **Check root path:** Verify `root` in nginx config matches actual directory
- **Check file permissions:** `sudo chown -R www-data:www-data /var/www/arturmorin.page`

### Certificate renewal fails
```bash
# Manually renew
sudo certbot renew

# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## Maintenance

### Update site files
```bash
# Option 1: SCP from local
scp -r portfolio/* root@your-server-ip:/var/www/arturmorin.page/

# Option 2: Git pull (if using git)
cd /var/www/arturmorin.page
sudo git pull
sudo chown -R www-data:www-data /var/www/arturmorin.page
```

### Check certificate expiration
```bash
sudo certbot certificates
```

### Renew certificate manually
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Alternative: Apache Configuration

If you prefer Apache over Nginx, I can provide an Apache configuration file. Let me know!

## Cost Comparison

- **Netlify:** Free tier limited, then paid
- **Self-hosted:** 
  - VPS: ~$5-10/month (DigitalOcean, Linode, Vultr)
  - Domain: ~$10-15/year
  - SSL: Free (Let's Encrypt)
  - **Total:** ~$5-10/month

## Next Steps

1. Set up automated backups
2. Configure monitoring (optional)
3. Set up CI/CD for automatic deployments (optional)

---

**Need help?** Check the logs:
- Nginx error log: `/var/log/nginx/arturmorin.page.error.log`
- Certbot log: `/var/log/letsencrypt/letsencrypt.log`

