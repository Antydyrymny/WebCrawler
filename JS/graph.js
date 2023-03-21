import { crawlWebsite } from './main.js';

export function createGraph(data) {
    // Select SVG container
    const svg = d3.select('svg');

    // Add zoom
    svg.call(
        d3
            .zoom()
            .on('zoom', function (event) {
                svg.selectAll('g').attr('transform', event.transform);
            })
            .scaleExtent([0.3, 7])
    );
    const width = parseInt(getComputedStyle(document.querySelector('svg')).width);
    const height = parseInt(getComputedStyle(document.querySelector('svg')).height);

    // Define the color scale for the groups
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Define the simulation with forces
    const simulation = d3
        .forceSimulation(data.nodes)
        .force(
            'link',
            d3
                .forceLink(data.links)
                .id((d) => d.id)
                .distance((d) => {
                    const groupToDistance = {
                        1: 40,
                        2: 65,
                        3: 85,
                        4: 105,
                    };
                    return groupToDistance[d.target.distanceGroup] || 125;
                })
                .strength((link) => 0.5)
        )
        .force('charge', d3.forceManyBody().distanceMax(220).strength(-30))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
            'x',
            d3.forceX().strength((d) => {
                const groupToStrength = {
                    0: 0.002,
                    1: 0.004,
                    2: 0.002,
                    3: -0.004,
                };
                return groupToStrength[d.group] || groupToStrength[0];
            })
        )
        .force(
            'y',
            d3.forceY().strength((d) => {
                const groupToStrength = {
                    0: -0.004,
                    1: -0.002,
                    2: 0.004,
                    3: -0.002,
                };
                return groupToStrength[d.group] || groupToStrength[0];
            })
        );

    // Define tooltip
    const tooltip = d3
        .select('.graph')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden');

    // Define the arrowhead marker
    const arrowhead = svg
        .append('svg:defs')
        .append('svg:marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('refX', 9.4)
        .attr('refY', 2.5)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .attr('d', 'M 0 0 L 5 2.5 L 0 5')
        .attr('fill', '#999');

    // Variable to prevent loading twice
    let currentlyLoading = new Set();

    updateGraph();

    // Define the function to update links and nodes
    function updateGraph() {
        // Draw the links with arrowheads
        // Style links with two-way connection
        let linkGroup = svg.select('g.links');
        if (linkGroup.empty()) linkGroup = svg.append('g').attr('class', 'links');
        const links = linkGroup
            .selectAll('line')
            .data(data.links, (d) => `${d.source.id}-${d.target.id}`)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-width', (d) => d.strength)
            .attr('marker-end', 'url(#arrowhead)')
            .each(function (d) {
                const link = d3.select(this);
                const reverseLink = data.links.find(
                    (l) => l.source === d.target && l.target === d.source
                );
                if (reverseLink) {
                    link.attr('stroke', 'blue').attr('marker-end', '');
                }
            });

        // Draw the nodes
        // Add drag, crawling new nodes on click and tooltips
        let nodeGroup = svg.select('g.nodes');
        if (nodeGroup.empty()) nodeGroup = svg.append('g').attr('class', 'nodes');
        const nodes = nodeGroup
            .selectAll('circle')
            .data(data.nodes, (d) => d.id)
            .enter()
            .append('circle')
            .attr('r', 5)
            .attr('fill', (d) => colorScale(d.group))
            .call(
                d3
                    .drag()
                    .on('start', dragStarted)
                    .on('drag', dragged)
                    .on('end', dragEnded)
            )
            .on('pointerover', tooltipPointerover)
            .on('pointermove', tooltipPointermove)
            .on('pointerleave', tooltipPointerleave)
            .on('click', update);
    }

    // Define the crawling for new nodes on click function
    async function update(event, d) {
        // Check if alredy loading this site
        if (currentlyLoading.has(d.id)) return;
        currentlyLoading.add(d.id);

        // Get new nodes and links data
        const settings = {
            url: d.id,
            maxNodeCount: 6,
            baseGroup: d.group,
        };
        const newData = await crawlWebsite(settings);
        newData.nodes.shift();

        // Update data
        data.nodes.push(...newData.nodes);
        data.links.push(...newData.links);

        // Update the simulation
        simulation.stop();
        simulation.nodes(data.nodes);
        updateGraph();

        // Restart the simulation
        simulation.alpha(1).restart();
        currentlyLoading.delete(d.id);
    }
    // Define tooltip pointer event functions
    function tooltipPointerover(event, d) {
        const content = new URL(d.id);
        tooltip
            .html(`${content.origin}${content.pathname}`)
            .style('visibility', 'visible')
            .style('top', event.clientY + 15 + 'px')
            .style('left', event.clientX + 15 + 'px');
        d3.select(this).style('stroke', 'black');
    }
    function tooltipPointermove(event, d) {
        tooltip
            .style('top', event.clientY + 15 + 'px')
            .style('left', event.clientX + 15 + 'px');
    }
    function tooltipPointerleave() {
        tooltip.style('visibility', 'hidden');
        d3.select(this).style('stroke', 'none');
    }

    // Define the drag functions
    function dragStarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
        tooltipPointermove(event, d);
    }
    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Update the positions of the nodes and links on every tick of the simulation
    simulation.on('tick', () => {
        // Select the link and node groups
        const linkGroup = svg.select('g.links');
        const nodeGroup = svg.select('g.nodes');

        // Update the position of the links
        linkGroup
            .selectAll('line')
            .attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

        // Update the position of the nodes
        nodeGroup
            .selectAll('circle')
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y);
    });
}
