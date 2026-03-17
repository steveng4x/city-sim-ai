export const sampleFlowchartData = {
  nodes: [
    { id: "A", label: "Create Design", type: "terminator" },
    { id: "B", label: "Publish Library", type: "process" },
    { id: "C", label: "Open Dev Mode", type: "process" },
    { id: "D", label: "Inspect Design", type: "process" },
    { id: "E", label: "Find Components", type: "process" },
    { id: "F", label: "Init Code Connect", type: "subflow" },
    { id: "G", label: "Map Components", type: "process" },
    { id: "H", label: "Publish Mappings", type: "process" },
    { id: "I", label: "MCP Exposes Data", type: "decision" },
    { id: "J", label: "Open IDE", type: "process" },
    { id: "K", label: "Prompt Copilot", type: "process" },
    { id: "L", label: "Read Context", type: "decision" },
    { id: "M", label: "Generate Layout", type: "process" },
    { id: "N", label: "Refine Styles", type: "process" },
    { id: "O", label: "Reuse Existing", type: "group" },
    { id: "P", label: "Finalize Screen", type: "terminator" },
    {
      id: "Q",
      label: "Requires Figma plugin v4+ and a published design library",
      type: "note",
    },
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
    { source: "B", target: "Q", label: "info" },
  ],
};

export const FLOWCHART_LAYOUT_DIRECTIONS = {
  horizontal: "horizontal",
  vertical: "vertical",
};

export const FLOWCHART_MERMAID_DEFAULT_DIRECTION = "LR";

export const FLOWCHART_MERMAID_NODE_SYNTAX = {
  terminator: { open: "([", close: "])" },
  process: { open: "[", close: "]" },
  decision: { open: "{", close: "}" },
  subflow: { open: "[[", close: "]]" },
  group: { open: "((", close: "))" },
  note: { open: "[/", close: "/]" },
};

const FLOWCHART_MERMAID_NODE_PATTERNS = Object.entries(
  FLOWCHART_MERMAID_NODE_SYNTAX,
)
  .map(([type, syntax]) => ({ type, ...syntax }))
  .sort((left, right) => right.open.length - left.open.length);

const FLOWCHART_JSON_FILE_EXTENSION = ".json";
const FLOWCHART_MERMAID_FILE_EXTENSION = ".mmd";

const FLOWCHART_NODE_DIMENSIONS = {
  decision: { width: 174, height: 100 },
  terminator: { width: 130, height: 50 },
  process: { width: 130, height: 50 },
  note: { width: 160, height: 60 },
  subflow: { width: 150, height: 60 },
  group: { width: 170, height: 70 },
};

export function normalizeFlowchartLayoutDirection(direction) {
  return direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical
    ? FLOWCHART_LAYOUT_DIRECTIONS.vertical
    : FLOWCHART_LAYOUT_DIRECTIONS.horizontal;
}

export function normalizeFileName(fileName) {
  const trimmed = String(fileName || "").trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.endsWith(FLOWCHART_JSON_FILE_EXTENSION)
    ? trimmed
    : `${trimmed}${FLOWCHART_JSON_FILE_EXTENSION}`;
}

export function normalizeMermaidFileName(fileName) {
  const trimmed = String(fileName || "").trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.endsWith(FLOWCHART_MERMAID_FILE_EXTENSION)
    ? trimmed
    : `${trimmed}${FLOWCHART_MERMAID_FILE_EXTENSION}`;
}

export function detectFlowchartFormat(sourceText) {
  const trimmed = String(sourceText || "").trim();

  if (!trimmed) {
    return "unknown";
  }

  if (/^(flowchart|graph)\b/i.test(trimmed)) {
    return "mermaid";
  }

  if (/^[\[{]/.test(trimmed)) {
    return "json";
  }

  return "unknown";
}

export function parseFlowchartJson(jsonText) {
  const parsedData = JSON.parse(jsonText);

  if (!Array.isArray(parsedData.nodes) || !Array.isArray(parsedData.links)) {
    throw new Error("JSON must contain 'nodes' and 'links' arrays.");
  }

  return parsedData;
}

function splitMermaidLines(mermaidText) {
  return String(mermaidText || "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("%%"));
}

function normalizeMermaidDirection(direction) {
  const trimmed = String(direction || "").trim().toUpperCase();

  return trimmed || FLOWCHART_MERMAID_DEFAULT_DIRECTION;
}

function normalizeMermaidLabel(label) {
  return String(label || "")
    .replace(/\s+/g, " ")
    .replace(/[\[\]{}]/g, "")
    .trim();
}

function assertMermaidNodeId(nodeId) {
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(nodeId)) {
    throw new Error(
      `Unsupported Mermaid node id '${nodeId}'. Use letters, numbers, underscores, or dashes.`,
    );
  }
}

function stripQuotedLabel(labelText) {
  const trimmed = String(labelText || "").trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function parseMermaidNodeToken(token, nodesById) {
  const trimmed = String(token || "").trim();

  if (!trimmed) {
    throw new Error("Encountered an empty Mermaid node token.");
  }

  const idMatch = trimmed.match(/^([A-Za-z][A-Za-z0-9_-]*)(.*)$/);

  if (!idMatch) {
    throw new Error(`Invalid Mermaid node token '${trimmed}'.`);
  }

  const [, id, remainder] = idMatch;
  const remainderText = remainder.trim();
  const existingNode = nodesById.get(id);

  if (!remainderText) {
    if (existingNode) {
      return existingNode;
    }

    const fallbackNode = { id, label: id, type: "process" };
    nodesById.set(id, fallbackNode);
    return fallbackNode;
  }

  const matchedPattern = FLOWCHART_MERMAID_NODE_PATTERNS.find(
    ({ open, close }) =>
      remainderText.startsWith(open) && remainderText.endsWith(close),
  );

  if (!matchedPattern) {
    throw new Error(`Unsupported Mermaid node shape in '${trimmed}'.`);
  }

  const innerLabel = remainderText.slice(
    matchedPattern.open.length,
    remainderText.length - matchedPattern.close.length,
  );
  const nextNode = {
    id,
    label: stripQuotedLabel(innerLabel) || id,
    type: matchedPattern.type,
  };

  nodesById.set(id, nextNode);
  return nextNode;
}

function parseMermaidEdgeLine(line, nodesById) {
  const labeledMatch = line.match(/^(.*?)-->\|(.*?)\|(.*)$/);

  if (labeledMatch) {
    const [, sourceToken, label, targetToken] = labeledMatch;
    const sourceNode = parseMermaidNodeToken(sourceToken, nodesById);
    const targetNode = parseMermaidNodeToken(targetToken, nodesById);

    return {
      link: {
        source: sourceNode.id,
        target: targetNode.id,
        ...(label.trim() ? { label: label.trim() } : {}),
      },
    };
  }

  const unlabeledMatch = line.match(/^(.*?)-->(.*)$/);

  if (!unlabeledMatch) {
    throw new Error(`Unsupported Mermaid edge syntax in '${line}'.`);
  }

  const [, sourceToken, targetToken] = unlabeledMatch;
  const sourceNode = parseMermaidNodeToken(sourceToken, nodesById);
  const targetNode = parseMermaidNodeToken(targetToken, nodesById);

  return {
    link: {
      source: sourceNode.id,
      target: targetNode.id,
    },
  };
}

export function parseMermaidToFlowchartData(mermaidText) {
  const lines = splitMermaidLines(mermaidText);

  if (lines.length === 0) {
    throw new Error("Mermaid text is empty.");
  }

  const header = lines.shift();
  const headerMatch = header.match(/^(flowchart|graph)\s+([A-Za-z]+)$/i);

  if (!headerMatch) {
    throw new Error(
      "Mermaid must start with 'flowchart <direction>' or 'graph <direction>'.",
    );
  }

  const nodesById = new Map();
  const links = [];

  lines.forEach((line, index) => {
    try {
      if (line.includes("-->")) {
        const { link } = parseMermaidEdgeLine(line, nodesById);
        links.push(link);
        return;
      }

      parseMermaidNodeToken(line, nodesById);
    } catch (error) {
      throw new Error(`Line ${index + 2}: ${error.message}`);
    }
  });

  const nodes = Array.from(nodesById.values());

  if (nodes.length === 0) {
    throw new Error("Mermaid must define at least one node.");
  }

  return {
    direction: normalizeMermaidDirection(headerMatch[2]),
    data: {
      nodes,
      links,
    },
  };
}

function stringifyMermaidNode(node) {
  const syntax =
    FLOWCHART_MERMAID_NODE_SYNTAX[node.type] ||
    FLOWCHART_MERMAID_NODE_SYNTAX.process;
  const label = normalizeMermaidLabel(node.label || node.id) || node.id;

  assertMermaidNodeId(node.id);

  return `${node.id}${syntax.open}${label}${syntax.close}`;
}

export function serializeFlowchartToMermaid(
  flowchartData,
  options = {},
) {
  if (
    !flowchartData ||
    !Array.isArray(flowchartData.nodes) ||
    !Array.isArray(flowchartData.links)
  ) {
    throw new Error("Flowchart data must contain 'nodes' and 'links' arrays.");
  }

  const direction = normalizeMermaidDirection(
    options.direction || FLOWCHART_MERMAID_DEFAULT_DIRECTION,
  );
  const nodeLines = flowchartData.nodes.map((node) =>
    `    ${stringifyMermaidNode(node)}`,
  );
  const edgeLines = flowchartData.links.map((link) => {
    assertMermaidNodeId(link.source);
    assertMermaidNodeId(link.target);

    return link.label
      ? `    ${link.source} -->|${normalizeMermaidLabel(link.label)}| ${link.target}`
      : `    ${link.source} --> ${link.target}`;
  });

  return [
    `flowchart ${direction}`,
    ...nodeLines,
    ...(edgeLines.length ? [""] : []),
    ...edgeLines,
  ].join("\n");
}

export function parseFlowchartSource(sourceText) {
  const format = detectFlowchartFormat(sourceText);

  if (format === "json") {
    return {
      format,
      data: parseFlowchartJson(sourceText),
    };
  }

  if (format === "mermaid") {
    const parsedMermaid = parseMermaidToFlowchartData(sourceText);
    return {
      format,
      ...parsedMermaid,
    };
  }

  throw new Error("Unsupported flowchart format. Use Mermaid or JSON.");
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

function getNodeDimensions(type) {
  return FLOWCHART_NODE_DIMENSIONS[type] || FLOWCHART_NODE_DIMENSIONS.process;
}

function getLayoutSpacing(nodes, direction) {
  const maxNodeWidth = nodes.reduce(
    (currentMax, node) =>
      Math.max(currentMax, getNodeDimensions(node.type).width),
    0,
  );
  const maxNodeHeight = nodes.reduce(
    (currentMax, node) =>
      Math.max(currentMax, getNodeDimensions(node.type).height),
    0,
  );

  if (direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical) {
    return {
      layerSpacing: Math.max(220, maxNodeHeight + 120),
      siblingSpacing: Math.max(210, maxNodeWidth + 48),
    };
  }

  return {
    layerSpacing: Math.max(220, maxNodeWidth + 90),
    siblingSpacing: Math.max(120, maxNodeHeight + 24),
  };
}

export function computeFlowchartLayout(nodes, links, options = {}) {
  const direction = normalizeFlowchartLayoutDirection(options.direction);
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

  const { layerSpacing: layerSpacingX, siblingSpacing: nodeSpacingY } =
    getLayoutSpacing(graphNodes, direction);
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

      if (direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical) {
        node.x = index * nodeSpacingY - totalHeight / 2;
        node.y = node.depth * layerSpacingX;
      } else {
        node.x = node.depth * layerSpacingX;
        node.y = index * nodeSpacingY - totalHeight / 2;
      }

      node.baseX = node.x;
      node.baseY = node.y;
      node.fx = node.x;
      node.fy = node.y;
    });
  }

  return {
    nodes: graphNodes,
    maxDepth,
    direction,
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
