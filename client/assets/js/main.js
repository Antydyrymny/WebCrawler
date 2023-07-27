import { createGraph } from './graph.js';
import { initialData } from './initialData.js';

// const route = `http://localhost:3000/api`;
// const route = 'https://graph-crawler-server.onrender.com/api';
const route = 'https://web-crawler-server.vercel.app/api';

const form = document.querySelector('form');
const graph = document.querySelector('.graph');
const svg = graph.querySelector('svg');
const loadingSpinner = graph.querySelector('#spinner');

let crawlData = { explored: {}, addedNodes: {}, groups: [] };

// After page is loaded
// createGraph(initialData);

// On form submit:
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    // Start the loading spinner
    loadingSpinner.classList.add('lds-roller');
    form.query.disabled = true;
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
    // Clear crawlData to handle new request
    crawlData = { explored: {}, addedNodes: {}, groups: [] };
    // Get data from the server
    try {
        const graphData = await crawlWebsite({ url: targetSite });
        // Show svg element with graph
        createGraph(graphData);
    } catch (error) {
        alert(error);
    } finally {
        // Stop the loading spinner
        loadingSpinner.classList.remove('lds-roller');
        form.query.disabled = false;
    }
});

async function crawlWebsite({ url, maxNodeCount = 5, baseGroup = 1 }) {
    try {
        // Run crawler on the server
        const response = await fetch(`${route}/crawl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: `${url}`,
                maxNodeCount: `${maxNodeCount}`,
                baseGroup: `${baseGroup}`,
                explored: crawlData.explored,
                addedNodes: crawlData.addedNodes,
                groups: crawlData.groups,
            }),
        });
        // Get the data of links and updated crawlData from server
        const { graphData, exploredUpdated, addedNodesUpdated, groupsUpdated } =
            await response.json();
        crawlData = {
            explored: exploredUpdated,
            addedNodes: addedNodesUpdated,
            groups: groupsUpdated,
        };
        return graphData;
    } catch (error) {
        throw new Error(error.message);
    }
}

export { crawlWebsite };
