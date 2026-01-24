import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log('Open this URL in your browser to view the menu');
});
