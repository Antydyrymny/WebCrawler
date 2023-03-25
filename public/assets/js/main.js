import { createGraph } from './graph.js';
import { initialData } from './initialData.js';

// const route = `https://graph-crawler.vercel.app/api/`;
// const route = `http://localhost:3000/api`;
const route = 'graph-crawler-server.vercel.app/api';

const form = document.querySelector('form');
const graph = document.querySelector('.graph');
const svg = graph.querySelector('svg');
const loadingSpinner = graph.querySelector('#spinner');
// Request the unique ID from the server to handle post requests
let userID = localStorage.getItem('userID');
userID = null;
console.log(userID);
if (userID === null) {
    try {
        const response = await fetch(`${route}/getID`);
        userID = await response.text();
        localStorage.setItem('userID', userID);
        console.log(userID);
    } catch (error) {
        alert(`Failed to get user ID from the server, error: ${error.message}`);
    }
}
console.log(userID);
// After page is loaded
// createGraph(initialData);
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
    const tooltip = graph.querySelector('.tooltip');
    const descriptionTooltip = graph.querySelector('.tooltip-fullLink');
    if (tooltip) tooltip.remove();
    if (descriptionTooltip) descriptionTooltip.remove();
    // Clear userData on the server to handle new request
    try {
        const response = await fetch(`${route}/clear`, {
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
    // Start the loading spinner
    loadingSpinner.classList.add('lds-roller');
    try {
        // Run crawler on the server
        const response = await fetch(`${route}/crawl`, {
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
        const graphData = await response.json();
        // Stop the loading spinner
        loadingSpinner.classList.remove('lds-roller');
        return graphData;
    } catch (error) {
        loadingSpinner.classList.remove('lds-roller');
        alert(error.message);
    }
}

export { crawlWebsite };
