export const sampleFlowchartData = {
  nodes: [
    { id: "A", label: "Create Design", type: "terminator" },
    { id: "B", label: "Publish Library", type: "process" },
    { id: "C", label: "Open Dev Mode", type: "process" },
    { id: "D", label: "Inspect Design", type: "process" },
    { id: "E", label: "Find Components", type: "process" },
    { id: "F", label: "Init Code Connect", type: "process" },
    { id: "G", label: "Map Components", type: "process" },
    { id: "H", label: "Publish Mappings", type: "process" },
    { id: "I", label: "MCP Exposes Data", type: "decision" },
    { id: "J", label: "Open IDE", type: "process" },
    { id: "K", label: "Prompt Copilot", type: "process" },
    { id: "L", label: "Read Context", type: "decision" },
    { id: "M", label: "Generate Layout", type: "process" },
    { id: "N", label: "Refine Styles", type: "process" },
    { id: "O", label: "Reuse Existing", type: "process" },
    { id: "P", label: "Finalize Screen", type: "terminator" },
  ],
  links: [
    { source: "A", target: "B" },
    { source: "B", target: "C" },
    { source: "C", target: "D" },
    { source: "D", target: "E" },
    { source: "E", target: "F" },
    { source: "F", target: "G" },
    { source: "G", target: "H" },
    { source: "H", target: "I" },
    { source: "I", target: "J" },
    { source: "J", target: "K" },
    { source: "K", target: "L" },
    { source: "L", target: "M" },
    { source: "M", target: "N" },
    { source: "N", target: "O" },
    { source: "O", target: "P" },
  ],
};

export function normalizeFileName(fileName) {
  const trimmed = String(fileName || "").trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.endsWith(".json") ? trimmed : `${trimmed}.json`;
}

export function parseFlowchartJson(jsonText) {
  const parsedData = JSON.parse(jsonText);

  if (!Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.links)) {
    throw new Error("JSON must contain 'nodes' and 'links' arrays.");
  }

  return parsedData;
}

export function getStatusClasses(type) {
  const classes = {
    success: "text-green-700 bg-green-50",
    warning: "text-amber-700 bg-amber-50",
    error: "text-red-700 bg-red-50",
    info: "text-sky-700 bg-sky-50",
  };

  return classes[type] || classes.success;
}

export function getStatusDotClass(type) {
  const classes = {
    success: "bg-green-500",
    warning: "bg-amber-400",
    error: "bg-red-500",
    info: "bg-sky-500",
  };

  return classes[type] || classes.success;
}

function getLinkNodeId(nodeValue) {
  return typeof nodeValue === "object" ? nodeValue.id : nodeValue;
}

function isAncestor(nodeId, possibleAncestorId, parentMap) {
  const seen = new Set();
  let currentId = nodeId;

  while (parentMap.has(currentId) && !seen.has(currentId)) {
    const parentId = parentMap.get(currentId);

    if (parentId === possibleAncestorId) {
      return true;
    }

    seen.add(currentId);
    currentId = parentId;
  }

  return false;
}

function getAverageOrder(values, orderMap) {
  const orders = values
    .map((value) => orderMap.get(value))
    .filter((value) => Number.isFinite(value));

  if (orders.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return orders.reduce((sum, value) => sum + value, 0) / orders.length;
}

export function computeFlowchartLayout(nodes, links) {
  const graphNodes = nodes.map((node, index) => ({
    ...node,
    depth: 0,
    originalIndex: index,
  }));
  const nodeMap = new Map(graphNodes.map((node) => [node.id, node]));
  const outgoing = new Map(graphNodes.map((node) => [node.id, []]));
  const incoming = new Map(graphNodes.map((node) => [node.id, []]));
  const indegrees = new Map(graphNodes.map((node) => [node.id, 0]));
  const parentMap = new Map();
  const visited = new Set();

  const linkPairs = links
    .map((link) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);

      if (
        !nodeMap.has(sourceId) ||
        !nodeMap.has(targetId) ||
        sourceId === targetId
      ) {
        return null;
      }

      return { sourceId, targetId };
    })
    .filter(Boolean);

  linkPairs.forEach(({ sourceId, targetId }) => {
    outgoing.get(sourceId).push(targetId);
    incoming.get(targetId).push(sourceId);
    indegrees.set(targetId, (indegrees.get(targetId) || 0) + 1);
  });

  const roots = graphNodes.filter(
    (node) => (indegrees.get(node.id) || 0) === 0,
  );
  const queue = [];
  const queued = new Set();

  const enqueue = (nodeId) => {
    if (!nodeMap.has(nodeId) || queued.has(nodeId)) {
      return;
    }

    queue.push(nodeId);
    queued.add(nodeId);
  };

  if (roots.length > 0) {
    roots.forEach((rootNode) => {
      rootNode.depth = 0;
      enqueue(rootNode.id);
    });
  } else if (graphNodes.length > 0) {
    graphNodes[0].depth = 0;
    enqueue(graphNodes[0].id);
  }

  while (queue.length > 0) {
    const currentId = queue.shift();
    queued.delete(currentId);
    visited.add(currentId);

    const currentNode = nodeMap.get(currentId);

    outgoing.get(currentId).forEach((targetId) => {
      const targetNode = nodeMap.get(targetId);

      if (!targetNode || isAncestor(currentId, targetId, parentMap)) {
        return;
      }

      const nextDepth = currentNode.depth + 1;
      const currentParentId = parentMap.get(targetId);
      const currentParentDepth = currentParentId
        ? (nodeMap.get(currentParentId)?.depth ?? -1)
        : -1;

      if (nextDepth >= targetNode.depth) {
        targetNode.depth = nextDepth;

        if (currentNode.depth >= currentParentDepth) {
          parentMap.set(targetId, currentId);
        }

        enqueue(targetId);
      }
    });
  }

  let fallbackDepth = graphNodes.reduce(
    (currentMaxDepth, node) => Math.max(currentMaxDepth, node.depth),
    0,
  );

  graphNodes.forEach((node) => {
    if (visited.has(node.id)) {
      return;
    }

    fallbackDepth += 1;
    node.depth = fallbackDepth;
    enqueue(node.id);

    while (queue.length > 0) {
      const currentId = queue.shift();
      queued.delete(currentId);
      visited.add(currentId);

      const currentNode = nodeMap.get(currentId);

      outgoing.get(currentId).forEach((targetId) => {
        const targetNode = nodeMap.get(targetId);

        if (!targetNode || isAncestor(currentId, targetId, parentMap)) {
          return;
        }

        const nextDepth = currentNode.depth + 1;

        if (nextDepth >= targetNode.depth) {
          targetNode.depth = nextDepth;
          parentMap.set(targetId, currentId);
          enqueue(targetId);
        }
      });
    }
  });

  const layerSpacingX = 220;
  const nodeSpacingY = 120;
  const maxDepth = graphNodes.reduce(
    (currentMaxDepth, node) => Math.max(currentMaxDepth, node.depth),
    0,
  );
  const layers = new Map();
  const orderMap = new Map();

  graphNodes.forEach((node) => {
    if (!layers.has(node.depth)) {
      layers.set(node.depth, []);
    }

    layers.get(node.depth).push(node);
  });

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const layerNodes = layers.get(depth) || [];

    layerNodes.sort((leftNode, rightNode) => {
      const leftOrder = getAverageOrder(
        incoming
          .get(leftNode.id)
          .filter(
            (sourceId) => (nodeMap.get(sourceId)?.depth ?? depth) < depth,
          ),
        orderMap,
      );
      const rightOrder = getAverageOrder(
        incoming
          .get(rightNode.id)
          .filter(
            (sourceId) => (nodeMap.get(sourceId)?.depth ?? depth) < depth,
          ),
        orderMap,
      );

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return leftNode.originalIndex - rightNode.originalIndex;
    });

    const totalHeight = (layerNodes.length - 1) * nodeSpacingY;

    layerNodes.forEach((node, index) => {
      orderMap.set(node.id, index);
      node.x = node.depth * layerSpacingX;
      node.y = index * nodeSpacingY - totalHeight / 2;
      node.baseX = node.x;
      node.baseY = node.y;
      node.fx = node.x;
      node.fy = node.y;
    });
  }

  return {
    nodes: graphNodes,
    maxDepth,
    layerSpacingX,
  };
}

export function computeFlowchartDepths(nodes, links) {
  const { nodes: layoutNodes, maxDepth } = computeFlowchartLayout(nodes, links);

  return {
    nodes: layoutNodes.map((node) => {
      const sanitizedNode = { ...node };

      delete sanitizedNode.baseX;
      delete sanitizedNode.baseY;
      delete sanitizedNode.fx;
      delete sanitizedNode.fy;
      delete sanitizedNode.x;
      delete sanitizedNode.y;

      return sanitizedNode;
    }),
    maxDepth,
  };
}
