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

## Files

- `scraper.js` - Puppeteer script to scrape menu data
- `menu-data.json` - Scraped menu data (generated)
- `index.html` - Menu display page
- `style.css` - Custom styling
- `script.js` - Loads and displays menu data
- `server.js` - Simple Express server

## Notes

The scraper uses Puppeteer to handle JavaScript-rendered content. You may need to adjust the selectors in `scraper.js` based on the actual HTML structure of the page.
