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
    userData.set(uniqueId, { visited: new Set(), groups: [] });
    res.send(uniqueId);
});
// Handle post requests parsing request.body from JSON
// and saving visited nodes to userData
app.post('/crawl', async (req, res) => {
    console.log(userData);
    const { id, url, maxNodeCount, baseGroup } = req.body;
    const { visited, groups } = userData.get(id);
    // Crawl the website
    const { treeRoot, visitedUpdated } = await crawler({
        url: url,
        visited: visited,
        maxNodeCount: maxNodeCount,
    });
    // Format the tree of links
    const { graphData, groupsUpd } = interpretData({
        treeRoot: treeRoot,
        groups: groups,
        baseGroup: baseGroup,
    });
    userData.set(id, { visited: visitedUpdated, groups: groupsUpd });
    res.send(graphData);
});
// Handle post requests to clear userData on a new graph input
app.post('/clear', (req, res) => {
    const { id } = req.body;
    userData.set(id, { visited: new Set(), groups: [] });
    res.send('Clear successful');
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
