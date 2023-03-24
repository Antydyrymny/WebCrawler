import express from 'express';
import cors from 'cors';
import apiGetID from './getID.js';
import apiCrawl from './crawl.js';
import apiClear from './clear.js';

// Create app
console.log('here');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount the route handlers from the api directory
app.use('/api/getID', apiGetID);
app.use('/api/crawl', apiCrawl);
app.use('/api/clear', apiClear);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Export app as a serverless function
export default app;
