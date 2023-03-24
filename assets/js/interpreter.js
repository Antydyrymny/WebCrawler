export function interpretData({ treeRoot: tree, groups, baseGroup, addedNodes }) {
    const data = {};
    data.nodes = [];
    data.links = [];
    let distanceGroups = [];
    // Uncheck the root node because it was already added before
    // but we still need to parse the tree starting from it
    if (addedNodes.has(tree.url.href)) addedNodes.delete(tree.url.href);
    recursiveParseTree(tree);

    return { graphData: data, groupsUpd: groups, addedNodesUpd: addedNodes };

    function recursiveParseTree(tree) {
        const id = getId(tree.url);
        // Base case: already addedNodes
        if (addedNodes.has(id)) return;
        addedNodes.add(id);
        // Base case: outer node
        if (!tree.inner) {
            let curGroup;
            let curDistanceGroup;
            // Groups
            if (groups.includes(tree.url.hostname)) {
                curGroup = +baseGroup + 1 + groups.indexOf(tree.url.hostname);
            } else {
                curGroup = +baseGroup + 1 + groups.length;
                groups.push(tree.url.hostname);
            }
            // Distance Groups
            if (distanceGroups.includes(tree.url.hostname)) {
                curDistanceGroup = 2 + distanceGroups.indexOf(tree.url.hostname);
            } else {
                curDistanceGroup = 2 + groups.length;
                distanceGroups.push(tree.url.hostname);
            }
            data.nodes.push({
                id: id,
                group: curGroup,
                distanceGroup: curDistanceGroup,
                explored: false,
            });
            return;
        }
        // Main action and recursive case
        data.nodes.push({
            id: id,
            group: +baseGroup,
            distanceGroup: 1,
            explored: tree.explored,
        });
        Array.from(tree.connections).forEach(([targetNode, strength]) => {
            data.links.push({
                source: id,
                target: getId(targetNode.url),
                strength: strength,
            });
            recursiveParseTree(targetNode);
        });
    }

    function getId(url) {
        return url.href;
    }
}

// Example data structure
// const data = {
//     nodes: [
//         { id: 'A', group: '1', distanceGroup: 1 },
//         { id: 'B', group: '1', distanceGroup: 1 },
//         { id: 'C', group: '2', distanceGroup: 2 },
//         { id: 'D', group: '3', distanceGroup: 1 },
//     ],
//     links: [
//         { source: 'A', target: 'B', strength: 1 },
//         { source: 'B', target: 'A', strength: 1 },
//         { source: 'B', target: 'C', strength: 2 },
//         { source: 'C', target: 'D', strength: 1 },
//         { source: 'D', target: 'A', strength: 1 },
//     ],
// };
