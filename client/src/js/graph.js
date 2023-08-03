import { crawlWebsite } from './main.js';

export function createGraph({
    data,
    nodeSize = 5,
    linkColor = '#999',
    linkHightlightColor = 'black',
    bidirectionalLinkColor = '#0442AA',
    biLinkHightlightColor = '#055DF2',
    initialScale = 1.5,
}) {
    // Select SVG container
    const svg = d3.select('svg');
    // Get dimensions
    const width = parseInt(getComputedStyle(document.querySelector('svg')).width);
    const height = parseInt(getComputedStyle(document.querySelector('svg')).height);
    const containerCenterX = width / 2;
    const containerCenterY = height / 2;

    const zoomBehavior = d3.zoom().on('zoom', function (event) {
        svg.selectAll('g').attr('transform', event.transform);
    });
    const zoomedCenterX = containerCenterX * initialScale;
    const zoomedCenterY = containerCenterY * initialScale;

    // Enable zoom and panning
    svg.call(
        d3
            .zoom()
            .on('zoom', function (event) {
                svg.selectAll('g').attr('transform', event.transform);
            })
            .scaleExtent([0.5, 6])
    );

    // Create the initial zoom and transform
    const initialTransform = d3.zoomIdentity
        .translate(containerCenterX - zoomedCenterX, containerCenterY - zoomedCenterY)
        .scale(initialScale);

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
        .force('center', d3.forceCenter(containerCenterX, containerCenterY))
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

    // Define the color scale for the groups
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    // Define tooltip
    const tooltip = d3
        .select('.graph')
        .append('div')
        .attr('class', 'tooltip')
        .style('visibility', 'hidden');
    // Define bottom bar full site link
    const tooltipFullLink = document.createElement('span');
    document.querySelector('.svg-wrapper').append(tooltipFullLink);
    tooltipFullLink.classList.add('tooltip-fullLink');
    tooltipFullLink.style.opacity = 0;
    tooltipFullLink.textContent = 'placeholder';
    const descrHeight = document.querySelector('.tooltip-fullLink').offsetHeight;
    tooltipFullLink.style.top = height - descrHeight + 'px';
    // Variable to store the timer for removing the tooltip
    let delayRemoveTooltip = null;
    // Variables to track hovering and dragging
    let hovering = false;
    let dragging = false;
    // Create the arrowhead markers
    createArrowhead();
    createArrowhead(linkHightlightColor);

    const scrollbarWidth = getScrollbarWidth();

    function createArrowhead(color = linkColor) {
        const namePostfix = color === linkColor ? '' : color;
        const arrowhead = svg
            .append('svg:defs')
            .append('svg:marker')
            .attr('id', `arrowhead${namePostfix}`)
            .attr('markerWidth', 5)
            .attr('markerHeight', 5)
            .attr('refX', 9.4)
            .attr('refY', 2.5)
            .attr('orient', 'auto')
            .attr('markerUnits', 'userSpaceOnUse')
            .append('path')
            .attr('d', 'M 0 0 L 5 2.5 L 0 5')
            .attr('fill', color);
    }

    // Variable to prevent loading twice
    let currentlyLoading = new Set();

    // Create graph
    updateGraphVisuals();

    // Call initial zoom
    svg.call(zoomBehavior.transform, initialTransform);

    // Define the function to update links and nodes
    function updateGraphVisuals() {
        // Draw the links with arrowheads
        // Style links with two-way connection
        let linkGroup = svg.select('g.links');
        if (linkGroup.empty()) linkGroup = svg.append('g').attr('class', 'links');
        const links = linkGroup
            .selectAll('line')
            .data(data.links, (d) => `${d.source.id}-${d.target.id}`)
            .enter()
            .append('line')
            .attr('stroke', linkColor)
            .attr('stroke-width', (d) => 'd.strength')
            .each(function (d) {
                const link = d3.select(this);
                const reverseLink = data.links.find(
                    (l) => l.source.id === d.target.id && l.target.id === d.source.id
                );
                if (reverseLink) {
                    d.bidirectional = true;
                    reverseLink.bidirectional = true;
                    link.attr('stroke', bidirectionalLinkColor).attr('marker-end', '');
                } else {
                    link.attr('marker-end', 'url(#arrowhead)');
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
            .attr('class', 'nodes')
            .attr('r', nodeSize)
            .attr('stroke', 'black')
            .attr('stroke-width', '1px')
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
        if (currentlyLoading.has(d.id) || d.explored) {
            restartSimulation(0.5);
            return;
        }
        currentlyLoading.add(d.id);
        d.explored = true;
        const clickMe = tooltip.select('.tooltip-clickme');
        clickMe.remove();
        // Get new nodes and links data
        const settings = {
            url: d.id,
            maxNodeCount: 6,
            baseGroup: d.group,
        };

        try {
            let newData = await crawlWebsite(settings);
            // Remove root node from the data
            newData.nodes.shift();
            // Update data
            data.nodes.push(...newData.nodes);
            data.links.push(...newData.links);
            // Update the simulation
            simulation.stop();
            simulation.nodes(data.nodes);
            updateGraphVisuals();
        } catch (error) {
            if (error.message === 'Unable to fetch URL') restartSimulation(0.5);
            else console.log(error);
        } finally {
            console.log(data);
            restartSimulation();
        }

        function restartSimulation(alpha = 1) {
            simulation.alpha(alpha).restart();
            currentlyLoading.delete(d.id);
        }
    }

    // Define tooltip pointer event functions
    // On hover function
    function tooltipPointerover(event, d) {
        if (hovering) return;
        const pointerOverFunction = () => {
            // Manage previous hovering on nodes and tooltip
            hovering = true;
            tooltipStayOn();
            tooltipLeave();
            const content = new URL(d.id);
            const clickMe =
                d.explored === true
                    ? ''
                    : `</br><span class="tooltip-clickme">click to to crawl!</span>`;
            // Style tooltip
            tooltip
                .html(
                    `<a href="${d.id}">${content.origin}${content.pathname}${
                        content.origin.length + content.pathname.length ===
                        content.href.length
                            ? ''
                            : '...'
                    }</a>${clickMe}`
                )
                .style('visibility', 'visible')
                .style('top', event.clientY + 15 + 'px')
                .style('left', event.clientX + 15 + 'px');
            tooltipFullLink.textContent =
                d.id.length < 75 ? d.id : d.id.slice(0, 75) + '...';
            tooltipFullLink.style.opacity = 1;
            // Style nodes
            d3.select(this).attr('r', nodeSize + 4.2);
            // Style related links
            const linksConnected = svg
                .selectAll('line')
                .filter((l) => l.target === d || l.source === d)
                .attr('stroke', (l) =>
                    l.bidirectional === true ? biLinkHightlightColor : linkHightlightColor
                )
                .attr('marker-end', (l) =>
                    l.bidirectional ? '' : `url(#arrowhead${linkHightlightColor})`
                );
            svg.selectAll('circle')
                .filter((c) =>
                    linksConnected.filter((l) => l.target === c || l.source === c).empty()
                )
                .style('filter', 'brightness(50%)')
                .style('filter', 'contrast(50%)');
        };
        const pointerLeaveFunction = () => {
            clearTimeout(hoverDelay);
            d3.select(this).on('pointerout', null);
        };
        // Wrap hover event in a timer
        const hoverDelay = setTimeout(pointerOverFunction, 100);
        // Cancel event if pointer left before delay
        d3.select(this).on('pointerout', pointerLeaveFunction);
    }

    // On move function
    function tooltipPointermove(event, d) {
        tooltip
            .style('top', event.clientY + 15 + 'px')
            .style('left', event.clientX + 15 + 'px');
    }

    // On pointer leave function
    function tooltipPointerleave(event, d, binding) {
        // Check if still dragging
        if (dragging) return;
        // Check if not hovering a node
        if (!hovering) return;
        hovering = false;
        // Add tooltip hover functionality and remove styling from it
        delayRemoveTooltip = setTimeout(() => {
            tooltip.html('').style('visibility', 'hidden');
            tooltipFullLink.style.opacity = 0;
        }, 600);
        tooltip.on('pointerover', tooltipStayOn);
        tooltip.on('pointerleave', tooltipLeave);
        // Remove styles from bottom tooltip, nodes and links
        d3.select(binding ? binding : this).attr('r', nodeSize);
        const linksConnected = svg
            .selectAll('line')
            .filter((l) => l.target.id === d.id || l.source.id === d.id)
            .attr('stroke', (l) => (l.bidirectional ? bidirectionalLinkColor : linkColor))
            .attr('marker-end', (l) => (l.bidirectional ? '' : `url(#arrowhead)`));
        svg.selectAll('circle')
            .style('filter', 'brightness(100%)')
            .style('filter', 'contrast(100%)');
    }
    // On pointer entering the tooltip
    function tooltipStayOn() {
        clearTimeout(delayRemoveTooltip);
        delayRemoveTooltip = null;
    }
    // On pointer leaving the tooltip
    function tooltipLeave() {
        tooltip.on('pointerover', null);
        tooltip.on('pointerleave', null);
        tooltip.html('').style('visibility', 'hidden');
        tooltipFullLink.style.opacity = 0;
    }

    // Define the drag functions
    function dragStarted(event, d) {
        dragging = true;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragEnded(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        dragging = false;
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

function getScrollbarWidth() {
    const div = document.createElement('div');
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.overflow = 'scroll';
    div.style.position = 'absolute';
    div.style.top = '-1000px';

    document.body.appendChild(div);
    const scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);

    return scrollbarWidth;
}
