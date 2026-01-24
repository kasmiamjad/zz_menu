# Restaurant Menu Scraper

Scrapes menu data from hub.saaed.app and displays it with custom styling.

## Setup

1. Install dependencies:
```bash
npm install
```

## Usage

### Step 1: Scrape the Menu
```bash
npm run scrape
```
This will open a browser, scrape the menu data, and save it to `menu-data.json`.

### Step 2: View the Menu
```bash
npm run dev
```
Then open http://localhost:3000 in your browser.

## VPS Deployment & Automation

### Quick Setup on VPS

1. Upload all files to your VPS
2. Run the installation script:
```bash
chmod +x install-vps.sh
./install-vps.sh
```

3. The script will:
   - Install Node.js (if needed)
   - Install dependencies
   - Install Chromium dependencies for Puppeteer
   - Test the scraper
   - Set up cron job automation

### Manual Cron Setup

If you prefer manual setup:

1. Make the setup script executable:
```bash
chmod +x setup-cron.sh
./setup-cron.sh
```

2. Edit your crontab:
```bash
crontab -e
```

3. Add one of these lines:

**Daily at 2 AM:**
```
0 2 * * * /path/to/your/project/run-scraper.sh
```

**Every 6 hours:**
```
0 */6 * * * /path/to/your/project/run-scraper.sh
```

**Twice daily (2 AM and 2 PM):**
```
0 2,14 * * * /path/to/your/project/run-scraper.sh
```

### Using PM2 (Recommended for Production)

PM2 is a production process manager that keeps your app running:

1. Install PM2:
```bash
npm install -g pm2
```

2. Start the web server:
```bash
pm2 start server.js --name menu-app
```

3. Set up the scraper to run daily:
```bash
pm2 start pm2-ecosystem.config.js
```

4. Make PM2 start on system boot:
```bash
pm2 startup
pm2 save
```

5. Useful PM2 commands:
```bash
pm2 list              # List all processes
pm2 logs menu-app     # View logs
pm2 restart menu-app  # Restart the app
pm2 stop menu-app     # Stop the app
pm2 delete menu-app   # Remove the app
```

### Running Server in Background (Alternative)

If you don't want to use PM2:

```bash
nohup npm run dev > server.log 2>&1 &
```

To stop it:
```bash
ps aux | grep node
kill <process_id>
```

## Logs

Scraper logs are saved to `logs/scraper-YYYY-MM-DD.log`

Logs older than 7 days are automatically deleted.

## Files

- `scraper.js` - Puppeteer script to scrape menu data
- `menu-data.json` - Scraped menu data (generated)
- `index.html` - Menu display page
- `style.css` - Custom styling
- `script.js` - Loads and displays menu data
- `server.js` - Simple Express server
- `setup-cron.sh` - Automated cron setup script
- `install-vps.sh` - VPS installation script
- `run-scraper.sh` - Script executed by cron (generated)
- `pm2-ecosystem.config.js` - PM2 configuration

## Troubleshooting

### Puppeteer fails on VPS

If Puppeteer fails to launch Chrome, install dependencies:
```bash
sudo apt-get install -y chromium-browser
```

Or use the bundled Chromium:
```bash
npm install puppeteer --unsafe-perm=true
```

### Cron job not running

Check cron logs:
```bash
grep CRON /var/log/syslog
```

Check scraper logs:
```bash
cat logs/scraper-*.log
```

### Port 3000 already in use

Change the port in `server.js`:
```javascript
const PORT = 8080; // Change to any available port
```

## Notes

The scraper uses Puppeteer to handle JavaScript-rendered content. You may need to adjust the selectors in `scraper.js` based on the actual HTML structure of the page.

