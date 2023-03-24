import { InnerNode, OuterNode } from './siteNodes.js';
import { JSDOM } from 'jsdom';

// Async breadth-first search, building a tree of links with a max number of links
// takes in URL as string
// returns the root InnerNode object with the map of website links
async function crawler({ url: urlString, explored, maxNodeCount }) {
    const urlObj = validateURL(urlString);
    if (!urlObj) throw new Error('the URL is invalid');
    const treeRoot = new InnerNode(urlObj);
    const toVisit = [treeRoot];
    let iterationCount = 0;
    // BFS
    while (toVisit.length) {
        // Limit maximum tree levels
        if (
            ++iterationCount === +maxNodeCount ||
            treeRoot.connections.size >= +maxNodeCount
        ) {
            break;
        }
        const currentlyVisiting = toVisit.shift();
        // Base case: already explored or Outer node
        if (explored.has(currentlyVisiting.url.href) || !currentlyVisiting.inner)
            continue;
        explored.add(currentlyVisiting.url.href);
        currentlyVisiting.explored = true;

        // Process each site for links
        const containedNodes = await processUrl(currentlyVisiting.url);
        containedNodes.forEach((node) => {
            currentlyVisiting.connect(node);
        });
        toVisit.push(...containedNodes);
    }
    return { treeRoot: treeRoot, exploredUpdated: explored };
}

// Return URL object from valid urls, false otherwise
function validateURL(urlString, origin = '', protocol = '') {
    // const url = urlString[0] === '/' ? `${origin}${urlString}` : urlString;
    let url = urlString;
    // Relative link
    if (url[0] === '/' && url[1] !== '/') url = `${origin}${urlString}`;
    // Protocol relative link
    else if (url.startsWith('//')) url = `${protocol}${urlString}`;
    // Anchor, about:blank, mailto, tel, javascript executable link,
    else if (
        url.startsWith('#') ||
        url.startsWith('about:blank') ||
        url.startsWith('mailto') ||
        url.startsWith('tel') ||
        url.startsWith('javascript')
    )
        return false;
    try {
        const urlObj = new URL(url);
        return urlObj;
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

// Network requests
async function processUrl(urlObj) {
    const origin = urlObj.origin;
    const domain = urlObj.hostname;
    const protocol = urlObj.protocol;
    try {
        const response = await fetch(urlObj);
        if (!response.ok)
            throw new Error(`Request failed with status ${response.status}`);
        const html = await response.text();
        return parseHTML(html, domain, origin, protocol);
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

// Build DOM of a site, get all URL
function parseHTML(htmlString, domain, origin, protocol) {
    const innerLinks = [];
    // Create a new JSDOM object
    const dom = new JSDOM(htmlString);
    // Get the root element of the new JSDOM object
    const rootElement = dom.window.document;
    // Check for base tag for correct origin of relative links
    const base = rootElement.querySelector('base');
    const links = rootElement.querySelectorAll('a');
    links.forEach((link) => {
        const urlObj = validateURL(link.href, base ? base.href : origin, protocol);
        if (!urlObj) return;
        if (urlObj.hostname === domain) {
            innerLinks.push(new InnerNode(urlObj));
        } else innerLinks.push(new OuterNode(urlObj));
    });
    return innerLinks;
}

export { crawler, validateURL, processUrl, parseHTML };
