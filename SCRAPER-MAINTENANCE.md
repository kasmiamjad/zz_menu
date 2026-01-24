# Scraper Maintenance Guide

## Will the Scraper Break if the Website Changes?

**YES** - The scraper is dependent on the current HTML structure of the source website. If they change their page structure, the scraper will likely fail or return incorrect data.

---

## Why Scrapers Break

### 1. HTML Structure Changes
```html
<!-- BEFORE (Current) -->
<div>
    <img src="dish.jpg">
    Nalli Nihari (Beef Boneless)
    Beef Nihari
    62.00
    / 1
</div>

<!-- AFTER (If they change) -->
<article class="menu-item">
    <img src="dish.jpg">
    <h3>Nalli Nihari (Beef Boneless)</h3>
    <span class="category">Beef Nihari</span>
    <div class="price">SAR 62.00 / 1</div>
</article>
```
**Impact:** Scraper won't find data because selectors don't match

### 2. Class/ID Changes
```html
<!-- BEFORE -->
<button role="tab">Main Dish</button>

<!-- AFTER -->
<button class="category-btn" data-category="main">Main Dish</button>
```
**Impact:** Category extraction fails

### 3. JavaScript Framework Changes
- They might switch from one framework to another
- Loading patterns might change
- API endpoints might change

### 4. Anti-Scraping Measures
- They might add CAPTCHA
- Rate limiting
- IP blocking
- Bot detection

---

## How to Detect Changes

### 1. Automated Monitoring

I've created a monitoring script that checks if the scraper is working:

**monitor-scraper.js** (see below)

### 2. Manual Indicators

**Signs the scraper is broken:**
- ❌ Empty `menu-data.json` (0 dishes)
- ❌ Only 1-2 dishes when there should be many
- ❌ Missing prices or images
- ❌ Error logs in `logs/scraper-*.log`
- ❌ Scraper takes too long (>5 minutes)

### 3. Log Analysis

Check logs for these patterns:
```bash
# Check recent logs
tail -f logs/scraper-$(date +%Y-%m-%d).log

# Look for errors
grep -i "error\|failed\|timeout" logs/scraper-*.log

# Check if data was saved
grep "Data saved" logs/scraper-*.log
```

---

## How to Fix a Broken Scraper

### Step 1: Identify What Changed

1. **Run the debug script:**
```bash
node scraper-debug.js
```

2. **Check the screenshot:**
```bash
# Opens the saved screenshot
open debug-beef-nihari.png  # Mac
xdg-open debug-beef-nihari.png  # Linux
```

3. **Inspect the console output:**
Look for:
- What text lines were found?
- What HTML structure exists?
- Are elements being detected?

### Step 2: Update Selectors

**Common fixes in `scraper.js`:**

**A. Category Button Selector Changed:**
```javascript
// OLD
const buttons = Array.from(document.querySelectorAll('button'));

// NEW (if they add specific class)
const buttons = Array.from(document.querySelectorAll('button.category-tab'));
```

**B. Dish Card Structure Changed:**
```javascript
// OLD
const allDivs = document.querySelectorAll('div');

// NEW (if they add specific class)
const allDivs = document.querySelectorAll('.dish-card, .menu-item');
```

**C. Text Extraction Changed:**
```javascript
// OLD
const lines = card.innerText.split('\n');

// NEW (if they use specific elements)
const name = card.querySelector('h3')?.textContent;
const category = card.querySelector('.category')?.textContent;
const price = card.querySelector('.price')?.textContent;
```

### Step 3: Test the Fix

```bash
# Test the scraper
npm run scrape

# Check the output
cat menu-data.json | jq '.categories[0].dishes[0]'
```

### Step 4: Deploy

```bash
# On VPS
git pull
pm2 restart menu-scraper-cron
```

---

## Maintenance Checklist

### Weekly
- [ ] Check scraper logs for errors
- [ ] Verify menu-data.json has data
- [ ] Spot-check a few dishes on the website

### Monthly
- [ ] Run monitor script
- [ ] Review log file sizes
- [ ] Check disk space
- [ ] Update dependencies: `npm update`

### When Website Updates
- [ ] Run debug script
- [ ] Compare old vs new HTML structure
- [ ] Update selectors in scraper.js
- [ ] Test thoroughly
- [ ] Deploy to VPS
- [ ] Monitor for 24 hours

---

## Prevention Strategies

### 1. Robust Selectors

**Bad (fragile):**
```javascript
document.querySelector('div > div > div:nth-child(3)')
```

**Good (resilient):**
```javascript
document.querySelector('[data-testid="dish-card"]')
document.querySelector('.dish-item, .menu-item, [class*="dish"]')
```

### 2. Multiple Fallbacks

```javascript
// Try multiple selectors
const name = 
    card.querySelector('h3')?.textContent ||
    card.querySelector('.dish-name')?.textContent ||
    card.querySelector('[class*="name"]')?.textContent ||
    lines[0]; // Fallback to text parsing
```

### 3. Validation

```javascript
// Validate extracted data
if (!dishName || dishName.length < 3) {
    console.warn('Invalid dish name:', dishName);
    return;
}

if (dishes.length === 0) {
    console.error('No dishes found! Website might have changed.');
}
```

### 4. Error Notifications

Add email/webhook notifications when scraper fails:
```javascript
if (menuData.categories.every(cat => cat.dishes.length === 0)) {
    // Send alert email
    sendAlert('Scraper returned no dishes!');
}
```

---

## Alternative Approaches

### 1. API Scraping (Better)

If the website has an API, use that instead:
```javascript
// Instead of scraping HTML
const response = await fetch('https://api.example.com/menu');
const data = await response.json();
```

**Advantages:**
- More stable
- Faster
- Less likely to break
- No need for Puppeteer

**How to find API:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Load the menu page
4. Look for XHR/Fetch requests
5. Find JSON responses with menu data

### 2. Official Partnership

Contact the restaurant/platform:
- Request official API access
- Get data feed
- Avoid scraping altogether

### 3. RSS/Data Feeds

Some platforms offer:
- RSS feeds
- XML exports
- CSV downloads
- Webhooks

---

## Emergency Recovery

### If Scraper Completely Breaks

**Option 1: Use Last Known Good Data**
```bash
# Keep backup of working data
cp menu-data.json menu-data.backup.json

# Restore if needed
cp menu-data.backup.json menu-data.json
```

**Option 2: Manual Data Entry**
Create a simple admin panel to manually add dishes

**Option 3: Temporary Shutdown**
Display maintenance message:
```javascript
// In script.js
if (!menuData || menuData.categories.length === 0) {
    document.getElementById('menu-container').innerHTML = `
        <div class="maintenance">
            <h2>Menu Temporarily Unavailable</h2>
            <p>We're updating our menu. Please check back soon!</p>
        </div>
    `;
}
```

---

## Version Control Best Practices

### Track Changes

```bash
# Before making changes
git add scraper.js
git commit -m "Working scraper - before website update"

# After fixing
git add scraper.js
git commit -m "Fix: Updated selectors for new website structure"
```

### Document Changes

In commit messages, note:
- What changed on the website
- What you updated in the scraper
- How you tested it

Example:
```
Fix: Updated dish card selectors

Website changed from plain divs to article.menu-item elements.
Updated selectors to match new structure.
Tested with 10+ categories, all dishes extracted correctly.
```

---

## Monitoring Script

Create `monitor-scraper.js` to automatically check health:

```javascript
import fs from 'fs/promises';

async function checkScraperHealth() {
    try {
        // Read menu data
        const data = await fs.readFile('menu-data.json', 'utf-8');
        const menu = JSON.parse(data);
        
        // Count total dishes
        const totalDishes = menu.categories.reduce(
            (sum, cat) => sum + cat.dishes.length, 
            0
        );
        
        // Health checks
        const checks = {
            hasData: menu.categories.length > 0,
            hasDishes: totalDishes > 0,
            hasEnoughDishes: totalDishes > 5,
            hasRestaurantName: menu.restaurantName?.length > 0,
            allCategoriesValid: menu.categories.every(
                cat => cat.categoryName && Array.isArray(cat.dishes)
            )
        };
        
        // Report
        console.log('=== Scraper Health Check ===');
        console.log(`Categories: ${menu.categories.length}`);
        console.log(`Total Dishes: ${totalDishes}`);
        console.log(`Restaurant: ${menu.restaurantName}`);
        console.log('');
        console.log('Health Checks:');
        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`  ${passed ? '✓' : '✗'} ${check}`);
        });
        
        // Overall status
        const allPassed = Object.values(checks).every(v => v);
        console.log('');
        console.log(`Status: ${allPassed ? '✓ HEALTHY' : '✗ NEEDS ATTENTION'}`);
        
        return allPassed;
        
    } catch (error) {
        console.error('✗ CRITICAL: Cannot read menu data');
        console.error(error.message);
        return false;
    }
}

checkScraperHealth();
```

Add to cron to run after scraping:
```cron
0 2 * * * /path/to/run-scraper.sh && node /path/to/monitor-scraper.js
```

---

## Summary

### Key Points

1. ✅ **Scrapers ARE fragile** - They break when websites change
2. ✅ **Monitor regularly** - Check logs and data quality
3. ✅ **Use debug tools** - `scraper-debug.js` helps identify issues
4. ✅ **Keep backups** - Save working versions of data and code
5. ✅ **Document changes** - Use git commits to track fixes
6. ✅ **Consider alternatives** - APIs are more stable than scraping

### When to Update

**Immediate (Critical):**
- Scraper returns 0 dishes
- All categories empty
- Errors in logs

**Soon (Important):**
- Missing some dishes
- Incorrect prices
- Broken images

**Eventually (Minor):**
- Formatting issues
- Extra whitespace
- Minor data inconsistencies

---

**Remember:** Web scraping is inherently fragile. Always have a backup plan and monitor your scraper regularly!
