import React from "react";
import * as d3 from "d3";
import { computeFlowchartLayout } from "@/features/tools/utils/flowchart";

const LAYER_SPACING = 220;

function getNodeRenderPosition(node, timeMs = 0) {
  if (node.isDragging) {
    return { x: node.x, y: node.y };
  }

  const floatSeed = node.floatSeed ?? 0;
  const anchorX = node.x;
  const anchorY = node.y;
  const floatSpeed = 0.0008 + (floatSeed % 7) * 0.00004;
  const floatPhase = floatSeed * 0.73;
  const driftPhase = floatSeed * 1.13;

  return {
    x: anchorX + Math.sin(timeMs * floatSpeed + floatPhase) * 4,
    y: anchorY + Math.cos(timeMs * (floatSpeed * 1.15) + driftPhase) * 7,
  };
}

function createMarker(svg) {
  svg
    .append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-0 -5 10 10")
    .attr("refX", 0)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("xoverflow", "visible")
    .append("path")
    .attr("d", "M 0,-5 L 10 ,0 L 0,5")
    .attr("fill", "#94a3b8")
    .style("stroke", "none");
}

function getInitialTransform(width, height, maxDepth) {
  const initialScale = Math.min(
    1,
    Math.max(0.3, (width - 100) / ((maxDepth || 1) * LAYER_SPACING)),
  );

  return d3.zoomIdentity.translate(80, height / 2).scale(initialScale);
}

function getLinkGeometry(
  sourceNode,
  targetNode,
  sourcePosition,
  targetPosition,
) {
  const dx = targetPosition.x - sourcePosition.x;
  const dy = targetPosition.y - sourcePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    const point = `M${sourcePosition.x},${sourcePosition.y}`;
    return {
      visiblePathD: point,
      labelPathD: point,
    };
  }

  const targetRadius = targetNode.type === "decision" ? 50 : 65;
  const ratio = targetRadius / distance;
  const targetX = targetPosition.x - dx * ratio;
  const targetY = targetPosition.y - dy * ratio;
  const isBackEdge = targetNode.depth <= sourceNode.depth;

  if (!isBackEdge) {
    const linePath = `M${sourcePosition.x},${sourcePosition.y} L${targetX},${targetY}`;
    return {
      visiblePathD: linePath,
      labelPathD: linePath,
    };
  }

  const normalX = -dy / distance;
  const normalY = dx / distance;
  const curveDirection = sourcePosition.y > targetPosition.y ? 1 : -1;
  const depthSpan = Math.max(1, sourceNode.depth - targetNode.depth + 1);
  const sidewaysBias = Math.min(140, depthSpan * 22);
  const verticalBias = Math.min(90, Math.abs(dy) * 0.18);
  const curveDepth = Math.max(
    92,
    Math.min(220, distance * 0.34 + sidewaysBias + verticalBias),
  );
  const controlX =
    (sourcePosition.x + targetX) / 2 + normalX * curveDepth * curveDirection;
  const controlY =
    (sourcePosition.y + targetY) / 2 + normalY * curveDepth * curveDirection;

  return {
    visiblePathD: `M${sourcePosition.x},${sourcePosition.y} Q${controlX},${controlY} ${targetX},${targetY}`,
    labelPathD: `M${targetX},${targetY} Q${controlX},${controlY} ${sourcePosition.x},${sourcePosition.y}`,
  };
}

function renderFlowchart(containerElement, data, graphRef) {
  if (!containerElement) {
    return;
  }

  graphRef.current.simulation?.stop();
  window.cancelAnimationFrame(graphRef.current.animationFrame ?? 0);
  d3.select(containerElement).selectAll("svg").remove();

  const links = data.links.map((link) => ({ ...link }));
  const { nodes, maxDepth } = computeFlowchartLayout(data.nodes, links);
  const width = containerElement.getBoundingClientRect().width;
  const height = containerElement.getBoundingClientRect().height;
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  let svgGroup;
  const zoomBehavior = d3
    .zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
      svgGroup.attr("transform", event.transform);
      graphRef.current.currentZoom = event.transform;
      graphRef.current.hasInteracted = true;
    });

  const svg = d3
    .select(containerElement)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", [0, 0, width, height])
    .call(zoomBehavior);

  createMarker(svg);
  svgGroup = svg.append("g");

  const initialTransform = getInitialTransform(width, height, maxDepth);
  svg.call(zoomBehavior.transform, initialTransform);

  const linkGroup = svgGroup
    .append("g")
    .selectAll("g")
    .data(links)
    .join("g")
    .attr("class", "link-group");

  const path = linkGroup
    .append("path")
    .attr("class", "link-path")
    .attr("stroke", "#cbd5e1")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("marker-end", "url(#arrowhead)");

  const labelGuidePath = linkGroup
    .append("path")
    .attr("class", "link-label-guide")
    .attr("id", (_, index) => `flowchart-link-label-${index}`)
    .attr("fill", "none")
    .attr("stroke", "none");

  linkGroup
    .append("text")
    .attr("fill", "#475569")
    .style("font-size", "12px")
    .style("font-weight", "600")
    .style("pointer-events", "none")
    .style(
      "text-shadow",
      "1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff",
    )
    .append("textPath")
    .attr("href", (_, index) => `#flowchart-link-label-${index}`)
    .attr("startOffset", "50%")
    .attr("text-anchor", "middle")
    .text((link) => link.label || "");

  const resolveNode = (reference) =>
    typeof reference === "object" ? reference : nodeMap.get(reference);

  const updateGraph = (timeMs = 0) => {
    path.attr("d", (link) => {
      const sourceNode =
        typeof link.source === "object"
          ? link.source
          : nodeMap.get(link.source);
      const targetNode =
        typeof link.target === "object"
          ? link.target
          : nodeMap.get(link.target);

      if (!sourceNode || !targetNode) {
        return "";
      }

      const sourcePosition = getNodeRenderPosition(sourceNode, timeMs);
      const targetPosition = getNodeRenderPosition(targetNode, timeMs);
      return getLinkGeometry(
        sourceNode,
        targetNode,
        sourcePosition,
        targetPosition,
      ).visiblePathD;
    });

    labelGuidePath.attr("d", (link) => {
      const sourceNode = resolveNode(link.source);
      const targetNode = resolveNode(link.target);

      if (!sourceNode || !targetNode) {
        return "";
      }

      const sourcePosition = getNodeRenderPosition(sourceNode, timeMs);
      const targetPosition = getNodeRenderPosition(targetNode, timeMs);

      return getLinkGeometry(
        sourceNode,
        targetNode,
        sourcePosition,
        targetPosition,
      ).labelPathD;
    });

    node.attr("transform", (currentNode) => {
      const position = getNodeRenderPosition(currentNode, timeMs);
      return `translate(${position.x},${position.y})`;
    });
  };

  const animateGraph = (timeMs) => {
    updateGraph(timeMs);
    graphRef.current.animationFrame =
      window.requestAnimationFrame(animateGraph);
  };

  const drag = d3
    .drag()
    .on("start", (event, node) => {
      graphRef.current.hasInteracted = true;
      node.isDragging = true;
      node.fx = node.x;
      node.fy = node.y;
    })
    .on("drag", (event, node) => {
      node.x = event.x;
      node.y = event.y;
      node.fx = event.x;
      node.fy = event.y;
      updateGraph(performance.now());
    })
    .on("end", (_, node) => {
      node.isDragging = false;
      node.fx = node.x;
      node.fy = node.y;
    });

  const node = svgGroup
    .append("g")
    .selectAll("g")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .call(drag)
    .on("dblclick", (_, currentNode) => {
      currentNode.x = currentNode.baseX;
      currentNode.y = currentNode.baseY;
      currentNode.fx = currentNode.baseX;
      currentNode.fy = currentNode.baseY;
      currentNode.isDragging = false;
      updateGraph(performance.now());
    });

  node.each(function appendShape(currentNode) {
    const element = d3.select(this);
    const widthValue = 130;
    const heightValue = 50;

    if (currentNode.type === "decision") {
      element
        .append("polygon")
        .attr("class", "node-shape")
        .attr(
          "points",
          `0,${-heightValue / 1.2} ${widthValue / 1.5},0 0,${heightValue / 1.2} ${-widthValue / 1.5},0`,
        )
        .attr("fill", "#fef08a")
        .attr("stroke", "#eab308")
        .attr("stroke-width", 2);
    } else if (currentNode.type === "terminator") {
      element
        .append("rect")
        .attr("class", "node-shape")
        .attr("width", widthValue)
        .attr("height", heightValue)
        .attr("x", -widthValue / 2)
        .attr("y", -heightValue / 2)
        .attr("rx", heightValue / 2)
        .attr("fill", "#f3e8ff")
        .attr("stroke", "#a855f7")
        .attr("stroke-width", 2);
    } else {
      element
        .append("rect")
        .attr("class", "node-shape")
        .attr("width", widthValue)
        .attr("height", heightValue)
        .attr("x", -widthValue / 2)
        .attr("y", -heightValue / 2)
        .attr("rx", 6)
        .attr("fill", "#e0f2fe")
        .attr("stroke", "#38bdf8")
        .attr("stroke-width", 2);
    }

    element
      .append("text")
      .text(currentNode.label || currentNode.id)
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#1e293b")
      .style("font-size", "13px")
      .style("font-weight", "500")
      .style("pointer-events", "none");
  });

  nodes.forEach((nodeValue, index) => {
    nodeValue.floatSeed = index + 1;
    nodeValue.isDragging = false;
  });

  updateGraph(performance.now());
  graphRef.current.animationFrame = window.requestAnimationFrame(animateGraph);

  graphRef.current.simulation = null;
  graphRef.current.svg = svg;
  graphRef.current.zoomBehavior = zoomBehavior;
  graphRef.current.currentZoom = initialTransform;
  graphRef.current.maxDepth = maxDepth;
  graphRef.current.width = width;
  graphRef.current.height = height;
  graphRef.current.hasInteracted = false;
}

function updateGraphSize(containerElement, graphRef) {
  const previousWidth = graphRef.current.width;
  const previousHeight = graphRef.current.height;
  const { svg, zoomBehavior, maxDepth, hasInteracted, currentZoom } =
    graphRef.current;

  if (!containerElement || !svg || !zoomBehavior) {
    return;
  }

  const width = containerElement.getBoundingClientRect().width;
  const height = containerElement.getBoundingClientRect().height;

  svg.attr("viewBox", [0, 0, width, height]);
  graphRef.current.width = width;
  graphRef.current.height = height;

  if (!hasInteracted) {
    const nextTransform = getInitialTransform(width, height, maxDepth);
    svg.call(zoomBehavior.transform, nextTransform);
    graphRef.current.currentZoom = nextTransform;
    return;
  }

  const scaleX = previousWidth > 0 ? width / previousWidth : 1;
  const scaleY = previousHeight > 0 ? height / previousHeight : 1;
  const nextTransform = d3.zoomIdentity
    .translate(currentZoom.x * scaleX, currentZoom.y * scaleY)
    .scale(currentZoom.k);

  svg.call(zoomBehavior.transform, nextTransform);
  graphRef.current.currentZoom = nextTransform;
}

function resetFlowchartView(containerElement, graphRef) {
  if (
    !containerElement ||
    !graphRef.current.svg ||
    !graphRef.current.zoomBehavior
  ) {
    return;
  }

  const width = containerElement.getBoundingClientRect().width;
  const height = containerElement.getBoundingClientRect().height;
  const nextTransform = getInitialTransform(
    width,
    height,
    graphRef.current.maxDepth,
  );

  graphRef.current.svg
    .transition()
    .duration(750)
    .call(graphRef.current.zoomBehavior.transform, nextTransform);

  graphRef.current.currentZoom = nextTransform;
  graphRef.current.hasInteracted = false;
}

export function useD3Graph(data) {
  const containerRef = React.useRef(null);
  const graphRef = React.useRef({
    simulation: null,
    animationFrame: null,
    svg: null,
    zoomBehavior: null,
    currentZoom: d3.zoomIdentity,
    hasInteracted: false,
    maxDepth: 0,
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const containerElement = containerRef.current;
    const graphState = graphRef.current;
    renderFlowchart(containerElement, data, graphRef);

    return () => {
      graphState.simulation?.stop();
      window.cancelAnimationFrame(graphState.animationFrame ?? 0);

      if (containerElement) {
        d3.select(containerElement).selectAll("svg").remove();
      }
    };
  }, [data]);

  React.useEffect(() => {
    const containerElement = containerRef.current;

    if (!containerElement) {
      return undefined;
    }

    let timeoutId = null;
    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        updateGraphSize(containerElement, graphRef);
      }, 200);
    });

    resizeObserver.observe(containerElement);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const resetView = React.useCallback(() => {
    resetFlowchartView(containerRef.current, graphRef);
  }, []);

  return {
    containerRef,
    resetView,
  };
}
