import puppeteer from 'puppeteer';
import fs from 'fs/promises';

const URL = 'https://hub.saaed.app/catalogue/265/297';

async function debugScraper() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to menu page...');
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    await page.waitForSelector('button[role="tab"], button', { timeout: 10000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Click "Beef Nihari" category to see those items
    console.log('Clicking Beef Nihari category...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const beefButton = buttons.find(btn => btn.textContent.includes('Beef Nihari'));
      if (beefButton) beefButton.click();
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Debug: Get the exact text structure
    const cardData = await page.evaluate(() => {
      const allDivs = document.querySelectorAll('div');
      const results = [];
      
      for (const card of allDivs) {
        const img = card.querySelector('img');
        if (!img) continue;
        
        const textContent = card.innerText || '';
        if (!textContent) continue;
        
        const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) continue;
        
        results.push({
          allLines: lines,
          innerHTML: card.innerHTML.substring(0, 300)
        });
        
        if (results.length >= 2) break;
      }
      
      return results;
    });
    
    console.log('\n=== CARD TEXT STRUCTURE ===\n');
    cardData.forEach((card, idx) => {
      console.log(`\nCard ${idx + 1}:`);
      console.log('All text lines:');
      card.allLines.forEach((line, i) => {
        console.log(`  Line ${i}: "${line}"`);
      });
      console.log('\nHTML snippet:', card.innerHTML.substring(0, 200));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugScraper().catch(console.error);
