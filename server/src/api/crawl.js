import express from 'express';
import { crawler } from '../js/crawler.js';
import { interpretData } from '../js/interpreter.js';
import { userData } from './userData.js';

const router = express.Router();

// Handle post requests parsing request.body from JSON
// and saving explored nodes to userData
export default router.post('/', async (req, res) => {
    const { id, url, maxNodeCount, baseGroup } = req.body;
    const { explored, groups, addedNodes } = userData.get(id);
    try {
        // Crawl the website
        const { treeRoot, exploredUpdated } = await crawler({
            url: url,
            explored: explored,
            maxNodeCount: maxNodeCount,
        });
        // Format the tree of links
        const { graphData, groupsUpd, addedNodesUpd } = interpretData({
            treeRoot: treeRoot,
            groups: groups,
            baseGroup: baseGroup,
            addedNodes: addedNodes,
        });
        userData.set(id, {
            explored: exploredUpdated,
            groups: groupsUpd,
            addedNodes: addedNodesUpd,
        });
        res.send(graphData);
    } catch (error) {
        res.status(500).json(error);
    }
});
