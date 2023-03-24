import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { userData } from './server';

const router = express.Router();

// Handle get requests, sending unique ID for a user session
export default router.get('/', (req, res) => {
    const uniqueId = uuidv4();
    userData.set(uniqueId, { explored: new Set(), addedNodes: new Set(), groups: [] });
    res.send(uniqueId);
});
