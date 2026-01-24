# System Documentation - Restaurant Menu Scraper

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Data Flow](#data-flow)
5. [Components Details](#components-details)
6. [Scraping Logic](#scraping-logic)
7. [Frontend Design](#frontend-design)
8. [Deployment & Automation](#deployment--automation)
9. [Configuration](#configuration)
10. [Future Enhancements](#future-enhancements)

---

## System Overview

### Purpose
This system scrapes restaurant menu data from `https://hub.saaed.app/catalogue/265/297` and displays it in a modern, mobile-first web interface inspired by Century Cuisine's design.

### Key Features
- ✅ Automated menu scraping using Puppeteer
- ✅ Mobile-first responsive design
- ✅ Category-based navigation with icons
- ✅ Dish detail modal with image gallery
- ✅ Search functionality
- ✅ Sticky category navigation
- ✅ Automated daily updates via cron
- ✅ VPS deployment ready

### Tech Stack
- **Backend:** Node.js, Express.js
- **Scraping:** Puppeteer (headless Chrome)
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Deployment:** PM2, Cron, Linux VPS
- **Data Storage:** JSON file (menu-data.json)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VPS Server                               │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Cron Job   │────────▶│  scraper.js  │                 │
│  │  (Daily 2AM) │         │  (Puppeteer) │                 │
│  └──────────────┘         └──────┬───────┘                 │
│                                   │                          │
│                                   ▼                          │
│                          ┌─────────────────┐                │
│                          │ menu-data.json  │                │
│                          └────────┬────────┘                │
│                                   │                          │
│  ┌──────────────┐                │                          │
│  │   PM2        │                │                          │
│  │  (Process    │         ┌──────▼───────┐                 │
│  │  Manager)    │────────▶│  server.js   │                 │
│  └──────────────┘         │  (Express)   │                 │
│                           └──────┬───────┘                  │
│                                  │                           │
└──────────────────────────────────┼───────────────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   Web Browser   │
                          │  (index.html)   │
                          │  (script.js)    │
                          │  (style.css)    │
                          └─────────────────┘
```

---

## File Structure

```
menu-scraper/
├── scraper.js                  # Main scraping logic
├── scraper-debug.js            # Debug script for testing selectors
├── server.js                   # Express web server
├── index.html                  # Main HTML page
├── script.js                   # Frontend JavaScript
├── style.css                   # Styling
├── menu-data.json              # Scraped data (generated)
├── package.json                # Node dependencies
├── README.md                   # User documentation
├── SYSTEM-DOCUMENTATION.md     # This file (system docs)
│
├── install-vps.sh              # VPS installation script
├── setup-cron.sh               # Cron setup script
├── run-scraper.sh              # Cron execution script (generated)
├── pm2-ecosystem.config.js     # PM2 configuration
│
└── logs/                       # Scraper logs (generated)
    └── scraper-YYYY-MM-DD.log
```

---

## Data Flow

### 1. Scraping Process
```
User/Cron triggers scraper.js
    ↓
Puppeteer launches headless Chrome
    ↓
Navigate to hub.saaed.app/catalogue/265/297
    ↓
Wait for page load (networkidle2)
    ↓
Extract category names from tabs
    ↓
For each category:
    ├─ Click category button
    ├─ Wait 2 seconds for items to load
    ├─ Check for "No items found" message
    ├─ If items exist:
    │   ├─ Scroll to load all items
    │   ├─ Extract dish cards:
    │   │   ├─ Line 0: Dish name
    │   │   ├─ Line 1: Category label
    │   │   ├─ Line 2: Price number
    │   │   ├─ Line 3: Price unit
    │   │   └─ Image URL
    │   └─ Remove duplicates
    └─ Store in array
    ↓
Save to menu-data.json
    ↓
Close browser
```

### 2. Display Process
```
User opens http://localhost:3000
    ↓
server.js serves index.html
    ↓
Browser loads script.js
    ↓
Fetch menu-data.json
    ↓
Parse JSON data
    ↓
Build category tabs with icons
    ↓
Render dishes in list view
    ↓
User interactions:
    ├─ Click category → Filter dishes
    ├─ Type in search → Filter by name
    ├─ Click dish → Open detail modal
    └─ Scroll → Sticky category bar
```

---

## Components Details

### 1. scraper.js

**Purpose:** Scrapes menu data from the source website

**Key Functions:**
- `scrapeMenu()` - Main scraping function
- Launches Puppeteer with headless Chrome
- Iterates through all categories
- Extracts dish information using DOM selectors
- Handles empty categories
- Saves data to JSON

**Important Variables:**
```javascript
const URL = 'https://hub.saaed.app/catalogue/265/297';
const categories = []; // Extracted from page
const menuData = {
    restaurantName: 'Z & Z Restaurant',
    categories: []
};
```

**Selectors Used:**
- Category tabs: `button[role="tab"], button`
- Dish cards: `div` elements with `img` children
- Text extraction: `innerText` split by `\n`

**Data Structure Extracted:**
```javascript
{
    name: "Nalli Nihari (Beef Boneless)",
    category: "Beef Nihari",
    price: "SAR 62.00 / 1",
    image: "https://hub.saaed.app/img/default.png"
}
```

### 2. server.js

**Purpose:** Serves the web application

**Configuration:**
```javascript
const PORT = 3000;
```

**Routes:**
- `GET /` → Serves index.html
- `GET /menu-data.json` → Serves scraped data
- `GET /style.css` → Serves styles
- `GET /script.js` → Serves frontend logic

**Static Files:** Serves all files from project root

### 3. index.html

**Structure:**
```html
<body>
    <div class="hero">                    <!-- Hero image -->
    <div class="logo-section">            <!-- Restaurant logo -->
    <div class="restaurant-info">         <!-- Name & social icons -->
    <div class="tabs-container">          <!-- Category navigation (sticky) -->
    <div class="view-toggle">             <!-- List/Grid toggle -->
    <div class="search-bar">              <!-- Search input -->
    <main id="menu-container">            <!-- Dishes list -->
    <div class="dish-modal">              <!-- Detail modal -->
</body>
```

### 4. script.js

**Key Functions:**

```javascript
loadMenu()                    // Fetches and initializes menu
buildTabs()                   // Creates category buttons
displayMenu(category, query)  // Renders filtered dishes
renderDishItem(dish, cat)     // Creates dish HTML
openDishModal(...)            // Shows dish detail
closeDishModal()              // Hides modal
setupSearch()                 // Debounced search
```

**Global Variables:**
```javascript
let menuData = null;          // Loaded JSON data
let currentCategory = 'all';  // Active filter
const categoryIcons = {...};  // Icon mapping
```

### 5. style.css

**Design System:**
- **Colors:**
  - Background: `#f5f1e8` (beige)
  - Primary: `#667eea` (blue)
  - Dark: `#2a2a2a` (almost black)
  - Text: `#333`, `#666`

- **Layout:**
  - Mobile-first (max-width: 600px)
  - Responsive grid for categories
  - Sticky header at top: 0
  - Z-index layers: modal (1000), sticky (100)

- **Key Classes:**
  - `.hero` - Top image section
  - `.tabs-container` - Sticky category bar
  - `.dish-item` - List item card
  - `.dish-modal` - Full-screen detail view

---

## Scraping Logic

### HTML Structure Analysis

The source website has this structure:
```html
<div>
    <img src="dish-image.jpg">
    <div>
        Nalli Nihari (Beef Boneless)  <!-- Line 0: Dish name -->
        Beef Nihari                    <!-- Line 1: Category -->
        62.00                          <!-- Line 2: Price -->
        / 1                            <!-- Line 3: Unit -->
    </div>
</div>
```

### Extraction Algorithm

```javascript
// 1. Find all divs with images
const allDivs = document.querySelectorAll('div');
allDivs.forEach(card => {
    const img = card.querySelector('img');
    if (!img) return; // Skip if no image
    
    // 2. Get text content
    const lines = card.innerText.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
    
    // 3. Parse structure
    if (lines.length >= 4) {
        dishName = lines[0];
        categoryLabel = lines[1];
        price = `SAR ${lines[2]} ${lines[3]}`;
    }
    
    // 4. Validate and store
    if (dishName && dishName !== 'Options') {
        items.push({ name, category, price, image });
    }
});
```

### Handling Edge Cases

1. **Empty Categories:**
   - Check for "No items found" text
   - Add category with empty dishes array

2. **Missing Images:**
   - Default placeholder: 🍽️ emoji
   - Fallback image handling in frontend

3. **Duplicate Dishes:**
   - Use Set to track seen names
   - Filter duplicates before saving

4. **Price Variations:**
   - Combine lines 2 & 3
   - Add "SAR" prefix
   - Handle missing prices with "-"

---

## Frontend Design

### Design Inspiration
Based on Century Cuisine (century-cuisine.yallaqrcodes.com)

### Key Design Elements

1. **Hero Section:**
   - Full-width food image
   - Overlapping circular logo
   - User icon in top-left

2. **Category Navigation:**
   - Horizontal scrollable row
   - Black circular icons (75px)
   - Active state: blue (#667eea)
   - Sticky positioning

3. **Dish Cards:**
   - Image on left (90px × 90px)
   - Text on right
   - Category badge (blue)
   - Price badge (dark)
   - White background with shadow

4. **Modal:**
   - Full-screen overlay
   - Large image at top
   - Navigation arrows (← →)
   - Close button (✕)
   - Centered content

### Responsive Behavior

**Mobile (< 768px):**
- Single column layout
- Horizontal scroll categories
- Full-width cards
- Touch-optimized spacing

**Desktop (≥ 768px):**
- Max-width: 800px centered
- Categories can wrap
- Larger images (110px)

---

## Deployment & Automation

### VPS Setup Process

1. **Initial Setup:**
```bash
./install-vps.sh
```
This installs:
- Node.js 18.x
- npm packages
- Chromium dependencies
- Tests scraper

2. **Cron Configuration:**
```bash
./setup-cron.sh
```
Creates `run-scraper.sh` with:
- Logging to `logs/scraper-YYYY-MM-DD.log`
- Auto-cleanup of old logs (7 days)
- Error handling

3. **Crontab Entry:**
```cron
0 2 * * * /path/to/project/run-scraper.sh
```

### PM2 Process Management

**Configuration (pm2-ecosystem.config.js):**
```javascript
{
  apps: [
    {
      name: 'menu-scraper-web',
      script: 'server.js',
      instances: 1,
      max_memory_restart: '500M'
    },
    {
      name: 'menu-scraper-cron',
      script: 'scraper.js',
      cron_restart: '0 2 * * *'  // Daily at 2 AM
    }
  ]
}
```

**Commands:**
```bash
pm2 start pm2-ecosystem.config.js  # Start both
pm2 list                            # View status
pm2 logs menu-scraper-web           # View logs
pm2 restart menu-scraper-web        # Restart
pm2 save                            # Save config
pm2 startup                         # Auto-start on boot
```

### Logging System

**Log Format:**
```
=== Scraper started at 2024-01-24 02:00:01 ===
Launching browser...
Navigating to menu page...
Found categories: ['Main Dish', 'Salad', ...]
Processing category: Main Dish
  Found 0 dishes in Main Dish
...
✓ Data saved to menu-data.json
=== Scraper completed successfully at 2024-01-24 02:05:23 ===
```

**Log Rotation:**
- Daily log files: `scraper-YYYY-MM-DD.log`
- Auto-delete after 7 days
- Prevents disk space issues

---

## Configuration

### Environment Variables

Currently hardcoded, but can be moved to `.env`:

```env
# Server
PORT=3000
NODE_ENV=production

# Scraper
SOURCE_URL=https://hub.saaed.app/catalogue/265/297
HEADLESS=true
TIMEOUT=60000

# Cron
SCRAPE_SCHEDULE=0 2 * * *
LOG_RETENTION_DAYS=7
```

### Customization Points

1. **Change Source URL:**
   - Edit `scraper.js` line 4: `const URL = '...'`

2. **Change Port:**
   - Edit `server.js` line 6: `const PORT = 3000`

3. **Change Scrape Schedule:**
   - Edit crontab: `crontab -e`
   - Or PM2 config: `cron_restart` field

4. **Change Category Icons:**
   - Edit `script.js` `categoryIcons` object

5. **Change Colors:**
   - Edit `style.css` color variables

---

## Future Enhancements

### Potential Improvements

1. **Database Integration:**
   - Replace JSON with MongoDB/PostgreSQL
   - Store historical menu data
   - Track price changes over time

2. **Multi-Restaurant Support:**
   - Scrape multiple restaurants
   - Restaurant selection dropdown
   - Comparison features

3. **Advanced Features:**
   - User accounts & favorites
   - Order history
   - Ratings & reviews
   - Nutritional information
   - Allergen filters

4. **Performance:**
   - Image optimization (WebP)
   - Lazy loading
   - Service worker for offline
   - CDN for static assets

5. **Analytics:**
   - Track popular dishes
   - View counts
   - Search analytics
   - User behavior tracking

6. **Notifications:**
   - Email alerts for new dishes
   - Price change notifications
   - Webhook integrations
   - Telegram/WhatsApp bot

7. **Admin Panel:**
   - Manual menu editing
   - Scraper configuration UI
   - Log viewer
   - Analytics dashboard

8. **API:**
   - RESTful API endpoints
   - GraphQL support
   - API authentication
   - Rate limiting

9. **Testing:**
   - Unit tests (Jest)
   - E2E tests (Playwright)
   - Visual regression tests
   - Load testing

10. **Internationalization:**
    - Multi-language support
    - RTL layout for Arabic
    - Currency conversion
    - Localized dates

### Code Improvements

1. **Error Handling:**
   - Better error messages
   - Retry logic for failed scrapes
   - Fallback data
   - Error reporting service

2. **Code Organization:**
   - Split into modules
   - TypeScript conversion
   - ESLint configuration
   - Prettier formatting

3. **Security:**
   - Input sanitization
   - HTTPS enforcement
   - Rate limiting
   - CORS configuration

4. **Monitoring:**
   - Health check endpoint
   - Uptime monitoring
   - Performance metrics
   - Error tracking (Sentry)

---

## Troubleshooting Guide

### Common Issues

**1. Scraper fails to launch:**
```bash
# Install Chromium dependencies
sudo apt-get install -y chromium-browser
```

**2. Port 3000 in use:**
```javascript
// Change in server.js
const PORT = 8080;
```

**3. Cron not running:**
```bash
# Check cron service
sudo service cron status

# Check logs
grep CRON /var/log/syslog
```

**4. Empty menu data:**
- Check scraper logs
- Run debug script: `node scraper-debug.js`
- Verify source URL is accessible

**5. Images not loading:**
- Check CORS settings
- Verify image URLs
- Check network connectivity

---

## Development Workflow

### Local Development

1. **Make changes to code**
2. **Test scraper:**
   ```bash
   npm run scrape
   ```
3. **Test frontend:**
   ```bash
   npm run dev
   ```
4. **Check browser:** http://localhost:3000

### Deployment

1. **Commit changes to Git**
2. **Push to repository**
3. **SSH to VPS:**
   ```bash
   ssh user@your-vps-ip
   ```
4. **Pull changes:**
   ```bash
   cd /path/to/project
   git pull
   ```
5. **Restart services:**
   ```bash
   pm2 restart all
   ```

---

## Contact & Support

For questions or issues:
1. Check logs: `logs/scraper-*.log`
2. Review this documentation
3. Check README.md for user instructions
4. Debug with `scraper-debug.js`

---

**Last Updated:** 2024-01-24  
**Version:** 1.0.0  
**Author:** Menu Scraper System
