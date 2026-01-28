#!/bin/bash

# Upload to Shared Hosting Script
# This script runs the scraper and uploads the result to shared hosting via FTP

echo "=========================================="
echo "Upload to Shared Hosting"
echo "=========================================="
echo ""

# Configuration - EDIT THESE VALUES
FTP_HOST="ftp.yourhost.com"
FTP_USER="your-username"
FTP_PASS="your-password"
FTP_PATH="public_html"  # or your domain folder

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Run the scraper
echo "Running scraper..."
npm run scrape

if [ $? -ne 0 ]; then
    echo "❌ Scraper failed!"
    exit 1
fi

echo "✓ Scraper completed"
echo ""

# Check if menu-data.json exists
if [ ! -f "menu-data.json" ]; then
    echo "❌ menu-data.json not found!"
    exit 1
fi

echo "Uploading to shared hosting..."

# Upload via FTP using lftp
lftp -u "$FTP_USER","$FTP_PASS" "$FTP_HOST" <<EOF
cd $FTP_PATH
put menu-data.json
bye
EOF

if [ $? -eq 0 ]; then
    echo "✓ Upload successful!"
    echo ""
    echo "Menu data updated on shared hosting"
else
    echo "❌ Upload failed!"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check FTP credentials"
    echo "2. Verify FTP_PATH is correct"
    echo "3. Test FTP connection manually"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ Complete!"
echo "=========================================="
