import { createGraph } from './graph.js';

const form = document.querySelector('form');
const svg = document.querySelector('svg');

// Request the unique ID from the server to handle post requests
let userID = localStorage.getItem('userID');
if (userID === null) {
    try {
        const response = await fetch('http://localhost:3000/getID');
        userID = await response.text();
        localStorage.setItem('userID', userID);
    } catch (error) {
        alert(`Failed to get user ID from the server, error: ${error.message}`);
    }
}

// On form submit:
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    // Parse site to crawl
    const input = form.query.value;
    let targetSite;
    try {
        targetSite = new URL(input).href;
    } catch (e) {
        targetSite = 'https://www.' + input;
    }
    form.query.value = '';
    // Clear svg
    svg.innerHTML = '';
    const tooltip = document.querySelector('.graph div.tooltip');
    if (tooltip) tooltip.remove();
    // Clear userData on the server to handle new request
    try {
        const response = await fetch('http://localhost:3000/clear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userID,
            }),
        });
        if ((await response.text()) !== 'Clear successful')
            throw new Error('Clear operation failed on the server');
    } catch (error) {
        console.error(error.message);
    }
    // Get data from the server
    const graphData = await crawlWebsite({ url: targetSite });
    // Show svg element with graph
    createGraph(graphData);
});

async function crawlWebsite({ url, maxNodeCount = 5, baseGroup = 1 }) {
    try {
        // Run crawler on the server
        const response = await fetch('http://localhost:3000/crawl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userID,
                url: `${url}`,
                maxNodeCount: `${maxNodeCount}`,
                baseGroup: `${baseGroup}`,
            }),
        });
        // Get the data of links from server
        return await response.json();
    } catch (error) {
        alert(error.message);
    }
}

export { crawlWebsite };
