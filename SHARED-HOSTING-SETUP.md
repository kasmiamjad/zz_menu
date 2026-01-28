# Shared Hosting Setup Guide

## Important Limitations

⚠️ **Shared hosting has restrictions:**
- ❌ Cannot install Puppeteer (needs Chrome/Chromium)
- ❌ Limited Node.js support
- ❌ No PM2 or process managers
- ❌ Limited cron job access
- ❌ Cannot run background processes

## Solutions

### Option 1: Use VPS Instead (Recommended)

**Cheap VPS providers:**
- DigitalOcean: $4-6/month
- Vultr: $2.50-6/month
- Linode: $5/month
- Hetzner: €4/month
- AWS Lightsail: $3.50/month

**Why VPS is better:**
- ✅ Full control
- ✅ Can install Puppeteer
- ✅ Can run cron jobs
- ✅ Better performance

---

### Option 2: Hybrid Approach (Scraper on VPS, Website on Shared)

**Setup:**
1. Run scraper on VPS (generates menu-data.json)
2. Upload menu-data.json to shared hosting
3. Host the website on shared hosting

**Steps:**

#### On VPS:
```bash
# Install and run scraper
./install-vps.sh
npm run scrape

# Upload to shared hosting via FTP/SFTP
scp menu-data.json user@shared-host:/path/to/public_html/
```

#### On Shared Hosting:
Upload these files only:
- index.html
- script.js
- style.css
- menu-data.json

No Node.js needed! Just static files.

---

### Option 3: Serverless Scraping (Advanced)

Use cloud functions to run the scraper:

**AWS Lambda / Vercel / Netlify Functions:**
- Run scraper as serverless function
- Triggered by cron (CloudWatch Events)
- Save JSON to S3 or CDN
- Website fetches from CDN

---

## Shared Hosting Setup (Static Files Only)

If you just want to host the website (not run scraper):

### Step 1: Prepare Files

On your local machine:
```bash
# Run scraper locally
npm run scrape

# This creates menu-data.json
```

### Step 2: Upload to Shared Hosting

**Via cPanel File Manager:**
1. Login to cPanel
2. Go to **File Manager**
3. Navigate to `public_html` (or your domain folder)
4. Upload these files:
   - index.html
   - script.js
   - style.css
   - menu-data.json

**Via FTP (FileZilla):**
1. Connect to your shared hosting
2. Navigate to `public_html`
3. Upload the 4 files above

### Step 3: Access Your Site

Visit: `http://yourdomain.com`

---

## Updating Menu Data

Since scraper can't run on shared hosting, you need to:

### Manual Update:
1. Run scraper on your computer: `npm run scrape`
2. Upload new `menu-data.json` to shared hosting
3. Website automatically shows new data

### Automated Update (Hybrid):
1. Run scraper on VPS with cron
2. Auto-upload to shared hosting via FTP

**Create upload script:**

```bash
# upload-to-shared.sh
#!/bin/bash

# Run scraper
npm run scrape

# Upload via FTP
lftp -u username,password ftp.yourhost.com <<EOF
cd public_html
put menu-data.json
bye
EOF

echo "Menu data uploaded to shared hosting"
```

Add to cron on VPS:
```cron
0 2 * * * /path/to/upload-to-shared.sh
```

---

## Shared Hosting with Node.js Support

Some shared hosts support Node.js (Hostinger, A2 Hosting, etc.)

### Check if Node.js is Available:

**Via SSH (if available):**
```bash
node -v
npm -v
```

**Via cPanel:**
Look for "Node.js" or "Setup Node.js App" in cPanel

### If Node.js is Available:

#### Step 1: Upload All Files

Upload entire project via FTP or Git

#### Step 2: Install Dependencies

**Via SSH:**
```bash
cd /home/username/public_html
npm install
```

**Via cPanel Terminal:**
Same commands as above

#### Step 3: Run Server

**Problem:** Shared hosting usually doesn't allow long-running processes

**Solution:** Use cPanel's Node.js app manager:
1. Go to cPanel → **Setup Node.js App**
2. Create new application
3. Set entry point: `server.js`
4. Set port (usually assigned by host)
5. Start application

#### Step 4: Setup Cron for Scraper

**Via cPanel → Cron Jobs:**
```bash
0 2 * * * cd /home/username/public_html && node scraper.js
```

**Problem:** Puppeteer won't work without Chrome!

---

## Puppeteer on Shared Hosting (Usually Impossible)

Puppeteer needs:
- Chrome/Chromium browser
- Root access to install dependencies
- Sufficient memory (512MB+)

**Most shared hosting doesn't allow this.**

### Alternative: Use Puppeteer Cloud Service

**Services that run Puppeteer for you:**
1. **Browserless.io** - $50-200/month
2. **ScrapingBee** - $49-249/month
3. **Apify** - $49+/month

**Update scraper.js to use cloud service:**
```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.connect({
    browserWSEndpoint: 'wss://chrome.browserless.io?token=YOUR_TOKEN'
});
```

---

## Recommended Setup for Shared Hosting Users

### Best Approach:

```
┌─────────────────┐
│   Your Computer │  ← Run scraper manually
│   or VPS        │  ← Or use cheap VPS
└────────┬────────┘
         │
         │ Upload menu-data.json
         ▼
┌─────────────────┐
│ Shared Hosting  │  ← Host website only
│ (Static Files)  │  ← No Node.js needed
└─────────────────┘
```

**Steps:**
1. Run scraper on your computer or VPS
2. Upload `menu-data.json` to shared hosting
3. Host website (HTML/CSS/JS) on shared hosting
4. Update menu data daily/weekly as needed

---

## Cost Comparison

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Shared Hosting Only** | $3-10/month | Cheap, easy | Can't run scraper |
| **VPS Only** | $4-6/month | Full control | Need to manage server |
| **Shared + Manual Update** | $3-10/month | Cheap | Manual work |
| **VPS + Shared** | $7-16/month | Best of both | More expensive |
| **Serverless** | $0-50/month | Scalable | Complex setup |

---

## Quick Decision Guide

**Choose Shared Hosting if:**
- ✅ You can run scraper on your computer
- ✅ You can manually update menu data
- ✅ You already have shared hosting
- ✅ Budget is very tight

**Choose VPS if:**
- ✅ You want full automation
- ✅ You need daily/hourly updates
- ✅ You want to learn server management
- ✅ You can spend $5/month

**Choose Hybrid if:**
- ✅ You have both already
- ✅ You want automation + cheap hosting
- ✅ You want to separate concerns

---

## Example: Hostinger Shared Hosting

### Upload Files:
1. Login to hPanel
2. Go to **File Manager**
3. Navigate to `public_html`
4. Upload: `index.html`, `script.js`, `style.css`, `menu-data.json`

### Access:
Visit: `http://yourdomain.com`

### Update Menu:
1. Run `npm run scrape` on your computer
2. Upload new `menu-data.json` via File Manager
3. Done!

---

## Troubleshooting

### "Cannot find module" error
- Shared hosting doesn't have Node.js
- Use static files only (no server.js)

### "Permission denied"
- Check file permissions (644 for files, 755 for folders)
- Use cPanel File Manager to set permissions

### Website shows "Loading..."
- Check if `menu-data.json` exists
- Check browser console for errors (F12)
- Verify JSON is valid: https://jsonlint.com

### Scraper fails on shared hosting
- **Expected!** Puppeteer doesn't work on shared hosting
- Run scraper elsewhere (computer/VPS)
- Upload only the JSON file

---

## Summary

**For Shared Hosting:**
1. ❌ Don't try to run scraper on shared hosting
2. ✅ Run scraper on your computer or VPS
3. ✅ Upload only static files + menu-data.json
4. ✅ Update menu data manually or via automated upload

**For Full Automation:**
1. ✅ Use VPS ($4-6/month)
2. ✅ Follow VPS setup guide (install-vps.sh)
3. ✅ Set up cron jobs
4. ✅ Everything runs automatically

---

Need help? Check:
- README.md - General setup
- SYSTEM-DOCUMENTATION.md - How it works
- SCRAPER-MAINTENANCE.md - Troubleshooting
