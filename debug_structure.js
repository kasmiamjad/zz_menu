import puppeteer from 'puppeteer';

const URL = 'https://hub.saaed.app/catalogue/265/297';

async function debugScraper() {
    console.log('Launching browser for debug...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    try {
        console.log('Navigating to menu page...');
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Waiting for menu items...');
        await page.waitForSelector('button, [role="tab"]', { timeout: 10000 });

        console.log('Clicking All...');
        await page.evaluate(() => {
            const allButton = Array.from(document.querySelectorAll('button')).find(btn =>
                btn.textContent.trim() === 'All'
            );
            if (allButton) allButton.click();
        });

        console.log('Scrolling...');
        await page.evaluate(async () => {
            window.scrollBy(0, 500);
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.scrollBy(0, 500);
            await new Promise(resolve => setTimeout(resolve, 1000));
        });

        console.log('Extracting card structures by searching for "SAR"...');

        const debugInfo = await page.evaluate(() => {
            const results = [];
            const allElements = document.querySelectorAll('*');
            let count = 0;

            for (const el of allElements) {
                if (count >= 3) break;

                const text = el.textContent || '';
                if (el.children.length === 0 && text.includes('SAR')) {
                    let card = el.parentElement;

                    let structure = [];
                    let current = el;
                    for (let i = 0; i < 5; i++) {
                        if (!current) break;
                        structure.push({
                            level: i,
                            tagName: current.tagName,
                            className: current.className,
                            innerText: current.innerText || '',
                            innerHTML: (current.innerHTML || '').substring(0, 1000)
                        });
                        current = current.parentElement;
                        if (current.tagName === 'BODY') break;
                    }

                    results.push({
                        foundVia: 'SAR text match',
                        priceText: text,
                        hierarchy: structure
                    });
                    count++;
                }
            }

            return results;
        });

        console.log('Debug Info for first few cards:');
        console.log(JSON.stringify(debugInfo, null, 2));

    } catch (error) {
        console.error('Error debugging:', error);
    } finally {
        await browser.close();
    }
}

debugScraper();
