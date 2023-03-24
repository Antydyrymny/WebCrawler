import express from 'express';
import { userData } from './server';

const router = express.Router();
// Handle post requests to clear userData on a new graph input
export default router.post('/clear', (req, res) => {
    const { id } = req.body;
    userData.set(id, { explored: new Set(), addedNodes: new Set(), groups: [] });
    res.send('Clear successful');
});
