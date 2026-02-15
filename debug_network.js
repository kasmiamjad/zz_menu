import puppeteer from 'puppeteer';

const URL = 'https://hub.saaed.app/catalogue/265/297';

async function debugScraper() {
    console.log('Launching browser for network debug...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    // Log all requests
    page.on('request', request => {
        if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
            console.log('Request:', request.url());
        }
    });

    page.on('response', async response => {
        const url = response.url();
        if ((response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') && url.includes('api')) {
            console.log('API Response from:', url);
            try {
                const json = await response.json();
                // Log first item if array or structure
                console.log('API Data Preview:', JSON.stringify(json).substring(0, 500));
            } catch (e) {
                console.log('Could not parse JSON');
            }
        }
    });

    try {
        console.log('Navigating to menu page...');
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
        console.error('Error debugging:', error);
    } finally {
        await browser.close();
    }
}

debugScraper();
