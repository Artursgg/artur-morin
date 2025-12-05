# SSL Setup for arturmorin.page (Self-Hosted)

## Overview
This guide is for setting up SSL with Let's Encrypt on your own server. If you're using Netlify, see the Netlify dashboard for automatic SSL setup.

## Quick Setup (Recommended)

### On Your Server (Ubuntu/Debian):

1. **Install Certbot:**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Configure DNS First:**
   - Point `arturmorin.page` to your server's IP address (A record)
   - Wait for DNS propagation (check with `dig arturmorin.page`)

3. **Get SSL Certificate:**
   ```bash
   sudo certbot --nginx -d arturmorin.page -d www.arturmorin.page
   ```

4. **Certbot will:**
   - Automatically obtain certificate from Let's Encrypt
   - Configure Nginx with SSL
   - Set up auto-renewal

5. **Test Auto-Renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

## Manual Setup

### Prerequisites
- Nginx installed and configured
- DNS pointing to your server
- Port 80 and 443 open in firewall

### Step-by-Step

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get Certificate:**
   ```bash
   sudo certbot certonly --nginx -d arturmorin.page -d www.arturmorin.page
   ```

3. **Certbot will ask:**
   - Email address (for renewal notices)
   - Agree to terms of service
   - Share email with EFF (optional)

4. **Certificates are saved to:**
   - Certificate: `/etc/letsencrypt/live/arturmorin.page/fullchain.pem`
   - Private Key: `/etc/letsencrypt/live/arturmorin.page/privkey.pem`

5. **Update Nginx Config:**
   The `nginx.conf` file in this repository already includes SSL configuration.
   Certbot can also auto-configure if you run:
   ```bash
   sudo certbot --nginx -d arturmorin.page -d www.arturmorin.page
   ```

## Auto-Renewal

Certbot automatically sets up renewal. Verify:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

Certificates auto-renew 30 days before expiration.

## Verify SSL

1. **Visit your site:** `https://arturmorin.page`
2. **Check SSL rating:** https://www.ssllabs.com/ssltest/analyze.html?d=arturmorin.page
3. **Check certificate:**
   ```bash
   sudo certbot certificates
   ```

## Troubleshooting

### Certificate fails to obtain
- **DNS not propagated:** Wait and check with `dig arturmorin.page`
- **Port 80 blocked:** Open port 80: `sudo ufw allow 80/tcp`
- **Nginx not running:** `sudo systemctl start nginx`

### Certificate renewal fails
```bash
# Check logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Manual renewal
sudo certbot renew
sudo systemctl reload nginx
```

### Check certificate expiration
```bash
sudo certbot certificates
```

## Notes
- Let's Encrypt certificates are **free**
- Certificates expire every **90 days** (auto-renewed)
- Rate limit: **50 certificates per domain per week**
- Requires valid DNS pointing to your server

