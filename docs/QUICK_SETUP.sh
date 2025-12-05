#!/bin/bash

# Quick setup script for arturmorin.page
# Run this on your Ubuntu/Debian server as root or with sudo

set -e

echo "========================================="
echo "Setting up arturmorin.page with SSL"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Update system
echo -e "${YELLOW}Updating system...${NC}"
apt update && apt upgrade -y

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
apt install nginx -y
systemctl start nginx
systemctl enable nginx

# Install Certbot
echo -e "${YELLOW}Installing Certbot...${NC}"
apt install certbot python3-certbot-nginx -y

# Create site directory
echo -e "${YELLOW}Creating site directory...${NC}"
mkdir -p /var/www/arturmorin.page
chown -R www-data:www-data /var/www/arturmorin.page
chmod -R 755 /var/www/arturmorin.page

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    echo -e "${GREEN}Firewall configured${NC}"
else
    echo -e "${YELLOW}UFW not found, skipping firewall configuration${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Server setup complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Upload your site files to /var/www/arturmorin.page"
echo "2. Configure DNS to point arturmorin.page to this server's IP"
echo "3. Copy nginx.conf to /etc/nginx/sites-available/arturmorin.page"
echo "4. Enable the site: sudo ln -s /etc/nginx/sites-available/arturmorin.page /etc/nginx/sites-enabled/"
echo "5. Test nginx: sudo nginx -t"
echo "6. Reload nginx: sudo systemctl reload nginx"
echo "7. Get SSL certificate: sudo certbot --nginx -d arturmorin.page -d www.arturmorin.page"
echo ""
echo "For detailed instructions, see MIGRATION_GUIDE.md"

