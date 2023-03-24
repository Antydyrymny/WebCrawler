import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { crawler } from './crawler.js';
import { interpretData } from './interpreter.js';

// Create app
const app = express();
const userData = new Map();
// Middleware to parse JSON
app.use(express.json());
// Enable CORS
app.use(cors());

// Routes:
// Handle get requests, sending unique ID for a user session
app.get('/getID', (req, res) => {
    const uniqueId = uuidv4();
    userData.set(uniqueId, { explored: new Set(), addedNodes: new Set(), groups: [] });
    res.send(uniqueId);
});
// Handle post requests parsing request.body from JSON
// and saving explored nodes to userData
app.post('/crawl', async (req, res) => {
    const { id, url, maxNodeCount, baseGroup } = req.body;
    const { explored, groups, addedNodes } = userData.get(id);
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
});
// Handle post requests to clear userData on a new graph input
app.post('/clear', (req, res) => {
    const { id } = req.body;
    userData.set(id, { explored: new Set(), addedNodes: new Set(), groups: [] });
    res.send('Clear successful');
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log('Server listening on port 3000');
});
