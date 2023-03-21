export function interpretData({ treeRoot: tree, groups, baseGroup }) {
    const data = {};
    data.nodes = [];
    data.links = [];
    let distanceGroups = [];
    let parsed = new Set();
    recursiveParseTree(tree);

    function recursiveParseTree(tree) {
        const id = getId(tree.url);
        // Base case: already parsed
        if (parsed.has(id)) return;
        parsed.add(id);
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
            });
            return;
        }
        // Main action and recursive case
        data.nodes.push({ id: id, group: +baseGroup, distanceGroup: 1 });
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
    return { graphData: data, groupsUpd: groups };
}

// const data = {
//     nodes: [
//         { id: 'A', group: '1', distanceGroup: 1 },
//         { id: 'B', group: '1', distanceGroup: 1 },
//         { id: 'C', group: '2', distanceGroup: 1 },
//         { id: 'D', group: '2', distanceGroup: 1 },
//     ],
//     links: [
//         { source: 'A', target: 'B', strength: 1 },
//         { source: 'B', target: 'A', strength: 1 },
//         { source: 'B', target: 'C', strength: 1 },
//         { source: 'C', target: 'D', strength: 1 },
//         { source: 'D', target: 'A', strength: 1 },
//     ],
// };
