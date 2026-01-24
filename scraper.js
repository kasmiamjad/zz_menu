import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const URL = 'https://hub.saaed.app/catalogue/265/297';

async function scrapeMenu() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to menu page...');
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for the menu items to load
    console.log('Waiting for menu items to load...');
    await page.waitForSelector('button, [role="tab"]', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Getting category tabs...');
    
    // Get all category tabs
    const categories = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button[role="tab"], button'));
      return tabs
        .map(tab => tab.textContent.trim())
        .filter(text => text && text !== 'All' && text.length > 2);
    });
    
    console.log('Found categories:', categories);
    
    const menuData = {
      restaurantName: '',
      categories: []
    };
    
    // Get restaurant name
    menuData.restaurantName = await page.evaluate(() => {
      const nameEl = document.querySelector('h1, h2, [class*="restaurant"]');
      return nameEl ? nameEl.textContent.trim() : 'Z & Z Restaurant';
    });
    
    console.log('Restaurant name:', menuData.restaurantName);
    
    // Click "All" to see all items
    console.log('Clicking "All" tab to load all items...');
    await page.evaluate(() => {
      const allButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.trim() === 'All'
      );
      if (allButton) allButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scroll to load all items
    console.log('Scrolling to load all items...');
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract all dishes by clicking each category
    console.log('Extracting dishes from each category...');
    
    for (const categoryName of categories) {
      console.log(`\nProcessing category: ${categoryName}`);
      
      // Click the category button
      await page.evaluate((catName) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const categoryButton = buttons.find(btn => btn.textContent.trim() === catName);
        if (categoryButton) {
          categoryButton.click();
        }
      }, categoryName);
      
      // Wait for items to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if "No items found" message appears
      const hasNoItems = await page.evaluate(() => {
        const noItemsText = document.body.innerText;
        return noItemsText.includes('No items found') || noItemsText.includes('no items found');
      });
      
      if (hasNoItems) {
        console.log(`  ⚠ No items found in ${categoryName}`);
        // Still add the category but with empty dishes array
        menuData.categories.push({
          categoryName,
          dishes: []
        });
        continue;
      }
      
      // Scroll to load all items in this category
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract dishes from this category
      const dishes = await page.evaluate(() => {
        const items = [];
        
        // Look for dish cards - they have images and are in a grid/flex layout
        const allDivs = document.querySelectorAll('div');
        
        allDivs.forEach(card => {
          // Must have an image to be a dish card
          const img = card.querySelector('img');
          if (!img) return;
          
          // Get direct text content (not from children)
          const textContent = card.innerText || '';
          if (!textContent) return;
          
          // Split into lines
          const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length < 2) return;
          
          let dishName = '';
          let categoryLabel = '';
          let price = '';
          
          // Based on debug output, the structure is:
          // Line 0: Dish name (e.g., "Nalli Nihari (Beef Boneless)")
          // Line 1: Category (e.g., "Beef Nihari")
          // Line 2: Price number (e.g., "62.00")
          // Line 3: Price unit (e.g., "/ 1")
          
          if (lines.length >= 4) {
            dishName = lines[0];
            categoryLabel = lines[1];
            // Combine price lines - add SAR symbol
            price = `SAR ${lines[2]} ${lines[3]}`;
          } else if (lines.length === 3) {
            dishName = lines[0];
            categoryLabel = lines[1];
            price = lines[2];
          } else if (lines.length === 2) {
            dishName = lines[0];
            categoryLabel = lines[1];
          } else {
            dishName = lines[0];
          }
          
          const image = img.src || '';
          
          // Validate: dish name should be meaningful
          if (dishName && 
              dishName.length > 3 && 
              dishName !== 'Options' && 
              !dishName.includes('Language') &&
              !dishName.includes('No items found')) {
            items.push({ 
              name: dishName, 
              category: categoryLabel, 
              price, 
              image 
            });
          }
        });
        
        // Remove duplicates based on name
        const uniqueItems = [];
        const seen = new Set();
        items.forEach(item => {
          if (!seen.has(item.name)) {
            seen.add(item.name);
            uniqueItems.push(item);
          }
        });
        
        return uniqueItems;
      });
      
      console.log(`  Found ${dishes.length} dishes in ${categoryName}`);
      
      if (dishes.length > 0) {
        menuData.categories.push({
          categoryName,
          dishes
        });
      }
    }
    
    console.log('Menu data extracted successfully!');
    console.log(`Total categories: ${menuData.categories.length}`);
    menuData.categories.forEach(cat => {
      console.log(`  - ${cat.categoryName}: ${cat.dishes.length} dishes`);
    });
    
    // Save to JSON file
    await fs.writeFile('menu-data.json', JSON.stringify(menuData, null, 2));
    console.log('\n✓ Data saved to menu-data.json');
    
    // Take a screenshot
    await page.screenshot({ path: 'menu-screenshot.png', fullPage: true });
    console.log('✓ Screenshot saved to menu-screenshot.png');
    
    return menuData;
    
  } catch (error) {
    console.error('Error scraping menu:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

scrapeMenu().catch(console.error);
