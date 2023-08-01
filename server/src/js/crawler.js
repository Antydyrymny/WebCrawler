import { InnerNode, OuterNode } from './siteNodes.js';
import { JSDOM } from 'jsdom';

// Async breadth-first search, building a tree of links with a max number of links
// takes in URL as string
// returns the root InnerNode object with the map of website links
async function crawler({ url: urlString, explored, maxNodeCount }) {
    const urlObj = validateURL({ urlString });
    if (!urlObj) throw new Error('URL is invalid');
    const canonicalURL = await standardizeURL(urlObj);
    if (!canonicalURL) throw new Error('URL is invalid');
    const treeRoot = new InnerNode(canonicalURL);
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
        // Stop condition: already explored or Outer node
        if (currentlyVisiting.url.href in explored || !currentlyVisiting.inner) continue;

        explored[currentlyVisiting.url.href] = true;
        currentlyVisiting.explored = true;

        // Process each site for links
        const containedNodes = await processURL(currentlyVisiting.url);
        containedNodes.forEach((node) => {
            currentlyVisiting.connect(node);
        });
        toVisit.push(...containedNodes);
    }
    return { treeRoot, exploredUpdated: explored };
}

// Return URL object from valid urls, false otherwise
function validateURL({ urlString, base, origin = '', pathname = '' }) {
    if (!urlString) return false;
    // Anchor, about:blank, mailto, tel, javascript executable link
    if (
        urlString.startsWith('#') ||
        urlString.startsWith('about:blank') ||
        urlString.startsWith('mailto') ||
        urlString.startsWith('tel') ||
        urlString.startsWith('javascript')
    ) {
        return false;
    }
    // Absolute link or base
    try {
        return base ? new URL(urlString, base) : new URL(urlString);
    } catch (errRelLink) {
        // Relative link
        try {
            return new URL(urlString, `${origin}${pathname}`);
        } catch (err) {
            // Invalid link
            console.error(err.message, `url: ${urlString}`, `base: ${base}`);
            return false;
        }
    }
}

function validateBase({ base, origin, pathname }) {
    try {
        return new URL(base).href;
    } catch (errRelLink) {
        // Relative base
        try {
            return new URL(base, `${origin}${pathname}`);
        } catch (errInvalidLink) {
            // Invalid base
            return false;
        }
    }
}

// Network requests
async function standardizeURL(urlObj) {
    // Make a head request to get page metadata with the canonical URL
    try {
        const response = await fetch(urlObj, {
            method: 'HEAD',
        });
        return new URL(response.url);
    } catch (error) {
        console.error(error.message);
        return false;
    }
}

async function processURL(urlObj) {
    const origin = urlObj.origin;
    const domain = urlObj.hostname;
    const pathname = urlObj.pathname;
    try {
        const response = await fetch(urlObj);
        if (!response.ok)
            throw new Error(`Request failed with status ${response.status}`);
        const html = await response.text();
        return await parseHTML(html, domain, origin, pathname);
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

// Build DOM of a site, get all URL
async function parseHTML(htmlString, domain, origin, pathname) {
    const innerLinks = [];
    // Create a new JSDOM object
    const dom = new JSDOM(htmlString);
    // Get the root element of the new JSDOM object
    const rootElement = dom.window.document;
    // Check for base tag for correct origin of relative links
    const base = rootElement.querySelector('base');
    let baseLink = null;
    if (base) {
        baseLink = validateBase({ base: base.href, origin, pathname });
    }
    const links = rootElement.querySelectorAll('a');
    // links.forEach((link) => {
    //     if (link.download) return;
    //     const urlObj = validateURL({
    //         urlString: link.href,
    //         base: baseLink ? baseLink : undefined,
    //         origin,
    //         pathname,
    //     });
    //     if (!urlObj) return;
    //     if (urlObj.hostname === domain) {
    //         innerLinks.push(new InnerNode(urlObj));
    //     } else innerLinks.push(new OuterNode(urlObj));
    // });
    for (const link of links) {
        if (link.download) continue;
        const urlObj = validateURL({
            urlString: link.href,
            base: baseLink ? baseLink : undefined,
            origin,
            pathname,
        });
        if (!urlObj) continue;
        const canonicalURL = await standardizeURL(urlObj);
        if (!canonicalURL) continue;
        if (canonicalURL.hostname === domain) {
            innerLinks.push(new InnerNode(canonicalURL));
        } else innerLinks.push(new OuterNode(canonicalURL));
    }
    return innerLinks;
}

export { crawler, validateURL, processURL, parseHTML };
