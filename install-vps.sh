#!/bin/bash

# VPS Installation Script
# Run this script on your VPS to set up the menu scraper

echo "=========================================="
echo "VPS Setup for Menu Scraper"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Installing Node.js..."
    
    # Install Node.js (Ubuntu/Debian)
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo "✓ Node.js installed"
else
    echo "✓ Node.js is already installed ($(node -v))"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
else
    echo "✓ npm is installed ($(npm -v))"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Install Chromium dependencies for Puppeteer
echo ""
echo "Installing Chromium dependencies..."
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

echo "✓ Chromium dependencies installed"

# Test the scraper
echo ""
echo "Testing the scraper..."
npm run scrape

if [ $? -eq 0 ]; then
    echo "✓ Scraper test successful!"
else
    echo "⚠ Scraper test failed, but continuing setup..."
fi

# Setup cron job
echo ""
echo "Setting up automated scraping..."
bash setup-cron.sh

echo ""
echo "=========================================="
echo "✓ VPS Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit your crontab: crontab -e"
echo "2. Add the cron job line shown above"
echo "3. Start the web server: npm run dev"
echo ""
echo "To run the server in background:"
echo "  nohup npm run dev > server.log 2>&1 &"
echo ""
echo "Or use PM2 for better process management:"
echo "  npm install -g pm2"
echo "  pm2 start server.js --name menu-app"
echo "  pm2 startup"
echo "  pm2 save"
echo ""
