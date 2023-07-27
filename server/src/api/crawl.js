import express from 'express';
import { crawler } from '../js/crawler.js';
import { interpretData } from '../js/interpreter.js';

const router = express.Router();

// Handle post requests parsing request.body from JSON
export default router.post('/', async (req, res) => {
    const { url, maxNodeCount, baseGroup, explored, addedNodes, groups } = req.body;
    try {
        // Crawl the website
        const { treeRoot, exploredUpdated } = await crawler({
            url,
            explored,
            maxNodeCount,
        });
        // Format the tree of links
        const { graphData, addedNodesUpdated, groupsUpdated } = interpretData({
            treeRoot,
            groups,
            baseGroup,
            addedNodes,
        });
        res.status(200).json({
            graphData,
            exploredUpdated,
            addedNodesUpdated,
            groupsUpdated,
        });
    } catch (error) {
        res.status(500).json(error);
    }
});
