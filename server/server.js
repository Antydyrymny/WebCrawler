import express from 'express';
import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiGetID from './api/getID.js';
import apiCrawl from './api/crawl.js';
import apiClear from './api/clear.js';
import apiDeleteID from './api/deleteID.js';

// Create app
const app = express();

// Middleware to parse JSON and FormData
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Mount the route handlers from the api directory
app.use('/api/getID', apiGetID);
app.use('/api/crawl', apiCrawl);
app.use('/api/clear', apiClear);
app.use('/api/deleteID', apiDeleteID);
app.use('/api/healthz', (_, res) => res.send('working'));

// // Serve static assets
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app.use(express.static(path.join(__dirname, 'public')));

// // Route handler for the URL
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Start the server
dotenv.config();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Export app as a serverless function
export default app;
