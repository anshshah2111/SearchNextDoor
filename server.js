const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve the front-end file

// The main API endpoint
app.post('/api/search', async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    let browser = null;
    console.log(`Starting search for: "${query}"`);

    try {
        // Launch the invisible browser
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        // 1. Go to the Gutenberg search page
        console.log('Navigating to Project Gutenberg search...');
        await page.goto('https://www.gutenberg.org/ebooks/search/');

        // 2. Fill in the search query and submit
        await page.fill('input[name="query"]', query);
        await page.click('button[type="submit"]');
        await page.waitForNavigation();
        console.log('Search submitted.');

        // 3. Find the first result
        const firstResult = await page.$('li.booklink a');
        if (!firstResult) {
            console.log('No results found.');
            throw new Error(`No results found for "${query}".`);
        }
        
        const bookTitle = await firstResult.textContent();
        console.log(`Found book: ${bookTitle}`);
        await firstResult.click();
        await page.waitForNavigation();

        // 4. Find the "Plain Text UTF-8" download link
        const plainTextLink = await page.locator('a:has-text("Plain Text UTF-8")').first();
        if (await plainTextLink.count() === 0) {
             throw new Error('Plain text version not available for this book.');
        }

        const textFileUrl = await plainTextLink.getAttribute('href');
        console.log('Found plain text link. Fetching content...');
        
        // 5. Go to the text file URL and grab the content
        const fullUrl = new URL(textFileUrl, page.url()).href;
        await page.goto(fullUrl);
        const bookContent = await page.textContent();
        
        // Create a clean filename
        const filename = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;

        // 6. Send the file back to the client
        console.log(`Sending file "${filename}" to client.`);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'text/plain');
        res.send(bookContent);

    } catch (error) {
        console.error('Scraping error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is ready. Open your browser to http://localhost:${PORT}`);
});