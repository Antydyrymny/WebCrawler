import { createGraph } from './graph.js';
import { crawlDataExample1, graphDataExample1 } from '../exampleGraphs/exampleGraph1.js';
import { crawlDataExample2, graphDataExample2 } from '../exampleGraphs/exampleGraph2.js';
import { crawlDataExample3, graphDataExample3 } from '../exampleGraphs/exampleGraph3.js';

// const route = `http://localhost:3000/api`;
// const route = 'https://graph-crawler-server.onrender.com/api';
const route = 'https://web-crawler-server.vercel.app/api';

const form = document.querySelector('form');
const graph = document.querySelector('.graph');
const svg = graph.querySelector('svg');
const loadingSpinner = graph.querySelector('#spinner');
const example1 = document.querySelector('#galleryItem1');
const example2 = document.querySelector('#galleryItem2');
const example3 = document.querySelector('#galleryItem3');

let crawlData = { explored: {}, addedNodes: {}, groups: [] };

// Display example 1
crawlData = crawlDataExample1;
createGraph({ data: graphDataExample1 });

// Add event listeners to show other examples
example1.addEventListener('click', () => {
    clearGraph();
    crawlData = crawlDataExample1;
    createGraph({ data: graphDataExample1 });
});
example2.addEventListener('click', () => {
    clearGraph();
    crawlData = crawlDataExample2;
    createGraph({ data: graphDataExample2 });
});
example3.addEventListener('click', () => {
    clearGraph();
    crawlData = crawlDataExample3;
    createGraph({ data: graphDataExample3, initialScale: 0.8 });
});

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
    clearGraph();
    // Clear crawlData to handle new request
    crawlData = { explored: {}, addedNodes: {}, groups: [] };
    // Get data from the server
    try {
        const graphData = await crawlWebsite({ url: targetSite });
        // Show svg element with graph
        createGraph({ data: graphData });
    } catch (error) {
        alert(error);
    }
    // Loading spinner will be stoped in crawlWebsite
});

function clearGraph() {
    svg.innerHTML = '';
    const tooltip = graph.querySelector('.tooltip');
    const descriptionTooltip = graph.querySelector('.tooltip-fullLink');
    if (tooltip) tooltip.remove();
    if (descriptionTooltip) descriptionTooltip.remove();
}

async function crawlWebsite({ url, maxNodeCount = 5, baseGroup = 1 }) {
    // Start the loading spinner
    loadingSpinner.classList.add('lds-roller');
    form.query.disabled = true;
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
    } finally {
        // Stop the loading spinner
        loadingSpinner.classList.remove('lds-roller');
        form.query.disabled = false;
    }
}

export { crawlWebsite };
