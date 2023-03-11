import { InnerNode, OuterNode } from './siteNodes.js';
import { JSDOM } from 'jsdom';

export { crawler, validateURL, processUrl, parseHTML };

crawler('https://javascript.info/');

async function crawler(urlString) {
    const urlObj = validateURL(urlString);
    if (!urlObj) return;

    const treeRoot = new InnerNode(urlObj);
    const visited = new Set();
    const toVisit = [treeRoot];
    while (toVisit.length) {
        const currentlyVisiting = toVisit.shift();
        if (visited.has(currentlyVisiting.url.href) || !currentlyVisiting.inner) continue;
        visited.add(currentlyVisiting.url.href);
        const containedNodes = await processUrl(currentlyVisiting.url);
        containedNodes.forEach((node) => {
            currentlyVisiting.connect(node);
        });
    }
    console.table(treeRoot.connections);
    return treeRoot;
}

function validateURL(urlString, origin) {
    const url = urlString[0] === '/' ? `${origin}${urlString}` : urlString;
    try {
        const urlObj = new URL(url);
        return urlObj;
    } catch (error) {
        console.error('the URL is invalid');
        return false;
    }
}

async function processUrl(url) {
    const origin = url.origin;
    const domain = url.hostname;
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`Request failed with status ${response.status}`);
        const html = await response.text();
        return parseHTML(html, domain, origin);
    } catch (error) {
        console.error(error.message);
        return [];
    }
}

function parseHTML(htmlString, domain, origin) {
    const innerLinks = [];
    const dom = new JSDOM(htmlString);
    const links = dom.window.document.querySelectorAll('a');
    links.forEach((link) => {
        const urlObj = validateURL(link.href, origin);
        if (!urlObj) return;
        if (urlObj.hostname === domain) {
            innerLinks.push(new InnerNode(urlObj));
        } else innerLinks.push(new OuterNode(urlObj));
    });
    return innerLinks;
}
