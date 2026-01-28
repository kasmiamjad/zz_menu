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
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
      
      // Scroll multiple times to load all items in this category
      console.log(`  Scrolling to load all items...`);
      
      // First, try to find and scroll the main content container
      await page.evaluate(async () => {
        // Find scrollable containers
        const scrollableContainers = Array.from(document.querySelectorAll('*')).filter(el => {
          return el.scrollHeight > el.clientHeight && 
                 el.clientHeight > 100 && 
                 getComputedStyle(el).overflow !== 'hidden';
        });
        
        console.log('Found scrollable containers:', scrollableContainers.length);
        
        // Scroll each container
        for (const container of scrollableContainers) {
          console.log('Scrolling container:', container.tagName, container.className);
          for (let i = 0; i < 10; i++) {
            container.scrollTop = container.scrollHeight;
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        // Also scroll the window
        for (let i = 0; i < 10; i++) {
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      });
      
      // Wait for any lazy-loaded content
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Extract dishes from this category
      const dishes = await page.evaluate(() => {
        const items = [];
        
        // The dishes are in a grid layout
        // Each dish card is a direct child of the grid container
        // Look for article tags or divs that are direct children of a grid/flex container
        
        // Try to find dish cards by looking for elements with specific structure
        const potentialCards = document.querySelectorAll('article, div[class*="card"], div[class*="item"], div[class*="product"]');
        
        console.log('Potential cards found:', potentialCards.length);
        
        if (potentialCards.length === 0) {
          // Fallback: look for any div with an image and text
          const allElements = document.querySelectorAll('*');
          
          allElements.forEach(el => {
            // Check if this element has an image as direct child
            const directImg = Array.from(el.children).find(child => child.tagName === 'IMG');
            if (!directImg) return;
            
            // Get text from this element only (not nested)
            const text = el.innerText || '';
            const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 0);
            
            if (lines.length < 2) return;
            
            // Check if this looks like a dish card (has name, category, price pattern)
            const hasPrice = lines.some(line => line.match(/\d+\.?\d*\s*\/\s*\d+/) || line.match(/^\d+\.?\d+$/));
            
            if (!hasPrice) return;
            
            let dishName = lines[0];
            let categoryLabel = lines[1];
            let price = '';
            
            // Find price in lines
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].match(/\d/) && (lines[i].includes('/') || i === lines.length - 1)) {
                if (i > 0 && lines[i - 1].match(/^\d+\.?\d+$/)) {
                  price = `SAR ${lines[i - 1]} ${lines[i]}`;
                } else {
                  price = lines[i];
                }
                break;
              }
            }
            
            const image = directImg.src || '';
            
            // Validate
            if (dishName && 
                dishName.length > 2 && 
                !dishName.includes('Z & Z') &&
                !dishName.includes('Search') &&
                !dishName.includes('Language')) {
              
              items.push({ 
                name: dishName, 
                category: categoryLabel, 
                price, 
                image 
              });
            }
          });
        } else {
          // Use the found cards
          potentialCards.forEach(card => {
            const img = card.querySelector('img');
            if (!img) return;
            
            const text = card.innerText || '';
            const lines = text.split('\n').map(l => l.trim()).filter(l => l && l.length > 0);
            
            if (lines.length < 2) return;
            
            let dishName = lines[0];
            let categoryLabel = lines[1];
            let price = '';
            
            // Parse price
            if (lines.length >= 4 && lines[2].match(/^\d+\.?\d+$/)) {
              price = `SAR ${lines[2]} ${lines[3]}`;
            } else if (lines.length >= 3) {
              price = lines[2];
            }
            
            const image = img.src || '';
            
            if (dishName && dishName.length > 2) {
              items.push({ 
                name: dishName, 
                category: categoryLabel, 
                price, 
                image 
              });
            }
          });
        }
        
        console.log('Items before dedup:', items.length);
        
        // Remove duplicates
        const unique = [];
        const seen = new Set();
        items.forEach(item => {
          const key = item.name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
            if (unique.length <= 3) {
              console.log(`  - ${item.name}: ${item.price}`);
            }
          }
        });
        
        console.log('Items after dedup:', unique.length);
        
        return unique;
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
