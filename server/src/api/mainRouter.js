import express from 'express';
import apiGetID from './getID.js';
import apiCrawl from './crawl.js';
import apiClear from './clear.js';
import apiDeleteID from './deleteID.js';

const router = express.Router();

// Mount the route handlers
router.use('/api/getID', apiGetID);
router.use('/api/crawl', apiCrawl);
router.use('/api/clear', apiClear);
router.use('/api/deleteID', apiDeleteID);
router.use('/api/healthz', (_, res) => res.send('working'));

export default router;
