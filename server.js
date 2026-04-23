import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeMenu } from './scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint to trigger scraping
app.post('/api/scrape', async (req, res) => {
    try {
        console.log('Scrape requested via API');
        const data = await scrapeMenu();
        res.json({ success: true, message: 'Menu updated successfully', categories: data.categories.length });
    } catch (error) {
        console.error('Scrape error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log('Open this URL in your browser to view the menu');
});
