import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';
import cors from 'cors';
import apiGetID from './api/getID.js';
import apiCrawl from './api/crawl.js';
import apiClear from './api/clear.js';

// Create app
console.log('on the server');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount the route handlers from the api directory
app.use('/api/getID', apiGetID);
app.use('/api/crawl', apiCrawl);
app.use('/api/clear', apiClear);

// // Serve static assets
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app.use(express.static(path.join(__dirname, 'public')));

// // Route handler for the URL
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Export app as a serverless function
export default app;
