import { hierarchy, tree } from "d3-hierarchy";

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

export const FLOWCHART_FORMATTING_LOGIC = {
  current: "current",
  d3Hierarchy: "d3-hierarchy",
};

export const FLOWCHART_DEFAULT_FORMATTING_LOGIC =
  FLOWCHART_FORMATTING_LOGIC.current;

export const FLOWCHART_FORMATTING_LOGIC_OPTIONS = [
  {
    value: FLOWCHART_FORMATTING_LOGIC.current,
    label: "Current Logic",
  },
  {
    value: FLOWCHART_FORMATTING_LOGIC.d3Hierarchy,
    label: "D3 Hierarchy",
  },
];

export const FLOWCHART_MERMAID_DEFAULT_DIRECTION = "LR";
export const FLOWCHART_MERMAID_DIRECTIONS = ["TB", "TD", "BT", "RL", "LR"];
const FLOWCHART_MERMAID_VERTICAL_DIRECTIONS = new Set(["TB", "TD", "BT"]);

export const FLOWCHART_MERMAID_NODE_SYNTAX = {
  terminator: { open: "([", close: "])" },
  process: { open: "[", close: "]" },
  decision: { open: "{", close: "}" },
  subflow: { open: "[[", close: "]]" },
  group: { open: "((", close: "))" },
  note: { open: "[/", close: "/]" },
};

export const FLOWCHART_MERMAID_SHAPE_ALIASES = {
  stadium: "terminator",
  rect: "process",
  rectangle: "process",
  diamond: "decision",
  subproc: "subflow",
  "dbl-circ": "group",
  "double-circle": "group",
};

const FLOWCHART_MERMAID_NODE_PATTERNS = Object.entries(
  FLOWCHART_MERMAID_NODE_SYNTAX,
)
  .map(([type, syntax]) => ({ type, ...syntax }))
  .sort((left, right) => right.open.length - left.open.length);

const FLOWCHART_JSON_FILE_EXTENSION = ".json";
const FLOWCHART_MERMAID_FILE_EXTENSION = ".mmd";

export const FLOWCHART_NODE_DIMENSIONS = {
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

export function normalizeFlowchartFormattingLogic(formattingLogic) {
  return String(formattingLogic || "").trim().toLowerCase() ===
    FLOWCHART_FORMATTING_LOGIC.d3Hierarchy
    ? FLOWCHART_FORMATTING_LOGIC.d3Hierarchy
    : FLOWCHART_FORMATTING_LOGIC.current;
}

export function getLayoutDirectionFromMermaidDirection(direction) {
  const normalized = String(direction || "")
    .trim()
    .toUpperCase();

  if (FLOWCHART_MERMAID_VERTICAL_DIRECTIONS.has(normalized)) {
    return FLOWCHART_LAYOUT_DIRECTIONS.vertical;
  }

  return FLOWCHART_LAYOUT_DIRECTIONS.horizontal;
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

  if (/^(\[|\{)/.test(trimmed)) {
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
  const trimmed = String(direction || "")
    .trim()
    .toUpperCase();

  if (!trimmed) {
    return FLOWCHART_MERMAID_DEFAULT_DIRECTION;
  }

  if (FLOWCHART_MERMAID_DIRECTIONS.includes(trimmed)) {
    return trimmed;
  }

  throw new Error(
    `Unsupported Mermaid direction '${direction}'. Use one of: ${FLOWCHART_MERMAID_DIRECTIONS.join(", ")}.`,
  );
}

function normalizeMermaidLabelText(label) {
  return String(label || "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripQuotedMermaidLabel(labelText) {
  const trimmed = normalizeMermaidLabelText(labelText);

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed
      .slice(1, -1)
      .replace(/\\(["'])/g, "$1")
      .trim();
  }

  return trimmed;
}

function shouldQuoteMermaidLabel(labelText) {
  return ["[", "]", "{", "}", "(", ")", "|"].some((token) =>
    labelText.includes(token),
  );
}

function formatMermaidLabel(label) {
  const normalizedLabel = normalizeMermaidLabelText(label);

  if (!normalizedLabel) {
    return "";
  }

  if (!shouldQuoteMermaidLabel(normalizedLabel)) {
    return normalizedLabel;
  }

  return `"${normalizedLabel.replace(/"/g, '\\"')}"`;
}

function parseMermaidAliasProperties(aliasBody) {
  const properties = {};
  const propertyPattern =
    /([A-Za-z][A-Za-z0-9_-]*)\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^,]+)(?:,|$)/g;

  let match;
  while ((match = propertyPattern.exec(aliasBody)) !== null) {
    const [, rawKey, rawValue] = match;
    properties[rawKey.trim().toLowerCase()] = stripQuotedMermaidLabel(rawValue);
  }

  return properties;
}

function parseMermaidAliasNode(id, remainderText, existingNode) {
  const aliasMatch = remainderText.match(/^@\{\s*(.*?)\s*\}$/);

  if (!aliasMatch) {
    return null;
  }

  const aliasProperties = parseMermaidAliasProperties(aliasMatch[1]);
  const aliasShape = String(aliasProperties.shape || "")
    .trim()
    .toLowerCase();
  const mappedType = FLOWCHART_MERMAID_SHAPE_ALIASES[aliasShape];

  if (!mappedType) {
    throw new Error(
      `Unsupported Mermaid alias shape '${aliasProperties.shape || ""}'. Use one of: ${Object.keys(FLOWCHART_MERMAID_SHAPE_ALIASES).join(", ")}.`,
    );
  }

  return {
    id,
    label: aliasProperties.label || existingNode?.label || id,
    type: mappedType,
  };
}

function assertMermaidNodeId(nodeId) {
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(nodeId)) {
    throw new Error(
      `Unsupported Mermaid node id '${nodeId}'. Start with a letter, then use only letters, numbers, underscores, or dashes, for example STEP_1 or retry-loop.`,
    );
  }
}

function parseMermaidNodeToken(token, nodesById) {
  const trimmed = String(token || "").trim();

  if (!trimmed) {
    throw new Error("Encountered an empty Mermaid node token.");
  }

  if (trimmed === "end") {
    throw new Error(
      "Lowercase 'end' is not allowed here. Use a different id or label such as END, Done, or Finish.",
    );
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

  const aliasNode = parseMermaidAliasNode(id, remainderText, existingNode);

  if (aliasNode) {
    nodesById.set(id, aliasNode);
    return aliasNode;
  }

  const matchedPattern = FLOWCHART_MERMAID_NODE_PATTERNS.find(
    ({ open, close }) =>
      remainderText.startsWith(open) && remainderText.endsWith(close),
  );

  if (!matchedPattern) {
    if (remainderText.startsWith("@{")) {
      throw new Error(
        `Unsupported Mermaid node shape in '${trimmed}'. Use one of the supported canonical forms such as A[Step], B{Decision}, or C([Start]), or a supported alias shape such as stadium, rect, diamond, subproc, or dbl-circ.`,
      );
    }

    throw new Error(
      `Unsupported Mermaid node shape in '${trimmed}'. Use one of the supported forms: [label], {label}, ([label]), [[label]], ((label)), or [/label/].`,
    );
  }

  const innerLabel = remainderText.slice(
    matchedPattern.open.length,
    remainderText.length - matchedPattern.close.length,
  );
  const nextNode = {
    id,
    label: stripQuotedMermaidLabel(innerLabel) || id,
    type: matchedPattern.type,
  };

  nodesById.set(id, nextNode);
  return nextNode;
}

function parseMermaidEdgeLine(line, nodesById) {
  if ((line.match(/-->/g) || []).length > 1) {
    throw new Error(
      `Chained Mermaid edges are not supported in '${line}'. Split them into one edge per line, for example A --> B and B --> C.`,
    );
  }

  if (/---(?!>)/.test(line)) {
    throw new Error(
      `Unsupported Mermaid edge syntax in '${line}'. Use only plain directed edges like A --> B, A -->|Yes| B, or A -- Yes --> B.`,
    );
  }

  const labeledMatch = line.match(/^(.*?)-->\|(.*?)\|(.*)$/);

  if (labeledMatch) {
    const [, sourceToken, label, targetToken] = labeledMatch;
    const sourceNode = parseMermaidNodeToken(sourceToken, nodesById);
    const targetNode = parseMermaidNodeToken(targetToken, nodesById);

    return {
      link: {
        source: sourceNode.id,
        target: targetNode.id,
        ...(stripQuotedMermaidLabel(label)
          ? { label: stripQuotedMermaidLabel(label) }
          : {}),
      },
    };
  }

  const alternateLabeledMatch = line.match(/^(.*?)--\s*(.+?)\s*-->(.*)$/);

  if (alternateLabeledMatch) {
    const [, sourceToken, label, targetToken] = alternateLabeledMatch;
    const normalizedLabel = stripQuotedMermaidLabel(label);

    if (!normalizedLabel) {
      throw new Error(
        `Malformed labeled edge in '${line}'. Use A -->|Label| B or A -- Label --> B.`,
      );
    }

    const sourceNode = parseMermaidNodeToken(sourceToken, nodesById);
    const targetNode = parseMermaidNodeToken(targetToken, nodesById);

    return {
      link: {
        source: sourceNode.id,
        target: targetNode.id,
        label: normalizedLabel,
      },
    };
  }

  const unlabeledMatch = line.match(/^(.*?)-->(.*)$/);

  if (!unlabeledMatch) {
    if (line.includes("|")) {
      throw new Error(
        `Malformed labeled edge in '${line}'. Use the form A -->|Label| B.`,
      );
    }

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
      "Mermaid must start with a header like 'flowchart LR' or 'graph LR'.",
    );
  }

  const direction = normalizeMermaidDirection(headerMatch[2]);

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
    direction,
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
  const label = formatMermaidLabel(node.label || node.id) || node.id;

  assertMermaidNodeId(node.id);

  return `${node.id}${syntax.open}${label}${syntax.close}`;
}

export function serializeFlowchartToMermaid(flowchartData, options = {}) {
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
  const nodeLines = flowchartData.nodes.map(
    (node) => `    ${stringifyMermaidNode(node)}`,
  );
  const edgeLines = flowchartData.links.map((link) => {
    assertMermaidNodeId(link.source);
    assertMermaidNodeId(link.target);

    return link.label
      ? `    ${link.source} -->|${formatMermaidLabel(link.label)}| ${link.target}`
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

function normalizeLinkLabel(label) {
  return String(label || "")
    .trim()
    .toLowerCase();
}

function isNoteLink(linkPair, targetNode) {
  return normalizeLinkLabel(linkPair.label) === "note" || targetNode?.type === "note";
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

function getPreferredParentOrder(parentIds, orderMap, nodeMap) {
  const parentMeta = parentIds
    .map((parentId) => ({
      parentId,
      order: orderMap.get(parentId),
      depth: nodeMap?.get(parentId)?.depth ?? Number.POSITIVE_INFINITY,
    }))
    .filter((entry) => Number.isFinite(entry.order));

  if (parentMeta.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  if (parentMeta.length === 1) {
    return parentMeta[0].order;
  }

  if (parentMeta.length === 2) {
    const [leftParent, rightParent] = parentMeta.sort(
      (left, right) => left.depth - right.depth,
    );

    if (leftParent.depth !== rightParent.depth) {
      return leftParent.order;
    }
  }

  const parentOrders = parentMeta.map((entry) => entry.order);

  return parentOrders.reduce((sum, value) => sum + value, 0) / parentOrders.length;
}

function snapLayoutOrder(order) {
  if (!Number.isFinite(order)) {
    return order;
  }

  if (order < 0) {
    return Math.ceil(order - 0.5);
  }

  return Math.floor(order + 0.5);
}

function getMinEdgeOrder(nodeId, incomingEdgeOrderMap) {
  return Math.min(
    ...(incomingEdgeOrderMap.get(nodeId) || [Number.POSITIVE_INFINITY]),
  );
}

function getDistanceToMergeTarget(
  startNodeId,
  forwardOutgoing,
  forwardIncomingCountMap,
) {
  const queue = [{ nodeId: startNodeId, distance: 0 }];
  const visited = new Set([startNodeId]);

  while (queue.length > 0) {
    const { nodeId, distance } = queue.shift();

    if (distance > 0 && (forwardIncomingCountMap.get(nodeId) || 0) > 1) {
      return distance;
    }

    (forwardOutgoing.get(nodeId) || []).forEach((childId) => {
      if (visited.has(childId)) {
        return;
      }

      visited.add(childId);
      queue.push({ nodeId: childId, distance: distance + 1 });
    });
  }

  return Number.POSITIVE_INFINITY;
}

export function getFlowchartNodeDimensions(type) {
  return FLOWCHART_NODE_DIMENSIONS[type] || FLOWCHART_NODE_DIMENSIONS.process;
}

function getLayoutSpacing(nodes, direction) {
  const maxNodeWidth = nodes.reduce(
    (currentMax, node) =>
      Math.max(currentMax, getFlowchartNodeDimensions(node.type).width),
    0,
  );
  const maxNodeHeight = nodes.reduce(
    (currentMax, node) =>
      Math.max(currentMax, getFlowchartNodeDimensions(node.type).height),
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

function computeFlowchartLayoutWithCurrentEngine(nodes, links, options = {}) {
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
    .map((link, index) => {
      const sourceId = getLinkNodeId(link.source);
      const targetId = getLinkNodeId(link.target);

      if (
        !nodeMap.has(sourceId) ||
        !nodeMap.has(targetId) ||
        sourceId === targetId
      ) {
        return null;
      }

      return {
        sourceId,
        targetId,
        index,
        label: String(link.label || ""),
      };
    })
    .filter(Boolean);

  const structuralLinkPairs = [];
  const noteLinkPairs = [];

  linkPairs.forEach((linkPair) => {
    const targetNode = nodeMap.get(linkPair.targetId);

    if (isNoteLink(linkPair, targetNode)) {
      noteLinkPairs.push(linkPair);
      return;
    }

    structuralLinkPairs.push(linkPair);
  });

  structuralLinkPairs.forEach(({ sourceId, targetId }) => {
    outgoing.get(sourceId).push(targetId);
    incoming.get(targetId).push(sourceId);
    indegrees.set(targetId, (indegrees.get(targetId) || 0) + 1);
  });

  const noteIncomingCounts = new Map(graphNodes.map((node) => [node.id, 0]));
  noteLinkPairs.forEach(({ targetId }) => {
    noteIncomingCounts.set(targetId, (noteIncomingCounts.get(targetId) || 0) + 1);
  });

  const anchoredNoteNodeIds = new Set(
    graphNodes
      .filter(
        (node) =>
          node.type === "note" &&
          (noteIncomingCounts.get(node.id) || 0) > 0 &&
          (incoming.get(node.id)?.length || 0) === 0 &&
          (outgoing.get(node.id)?.length || 0) === 0,
      )
      .map((node) => node.id),
  );

  const roots = graphNodes.filter(
    (node) =>
      !anchoredNoteNodeIds.has(node.id) && (indegrees.get(node.id) || 0) === 0,
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
  } else {
    const fallbackRoot = graphNodes.find(
      (node) => !anchoredNoteNodeIds.has(node.id),
    );

    if (fallbackRoot) {
      fallbackRoot.depth = 0;
      enqueue(fallbackRoot.id);
    }
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
    if (visited.has(node.id) || anchoredNoteNodeIds.has(node.id)) {
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

  const layoutNodes = graphNodes.filter(
    (node) => !anchoredNoteNodeIds.has(node.id),
  );
  const { layerSpacing: layerSpacingX, siblingSpacing: nodeSpacingY } =
    getLayoutSpacing(layoutNodes.length ? layoutNodes : graphNodes, direction);
  const maxDepth = layoutNodes.reduce(
    (currentMaxDepth, node) => Math.max(currentMaxDepth, node.depth),
    0,
  );
  const layers = new Map();
  const orderMap = new Map();
  const forwardOutgoing = new Map(layoutNodes.map((node) => [node.id, []]));
  const branchBiasMap = new Map();
  const incomingEdgeOrderMap = new Map(layoutNodes.map((node) => [node.id, []]));
  const forwardIncomingCountMap = new Map(
    layoutNodes.map((node) => [node.id, 0]),
  );
  const parentHasAnchoredNote = new Set(
    noteLinkPairs
      .filter(({ targetId }) => anchoredNoteNodeIds.has(targetId))
      .map(({ sourceId }) => sourceId),
  );

  layoutNodes.forEach((node) => {
    if (!layers.has(node.depth)) {
      layers.set(node.depth, []);
    }

    layers.get(node.depth).push(node);
  });

  structuralLinkPairs.forEach(({ sourceId, targetId, index }) => {
    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (
      !sourceNode ||
      !targetNode ||
      !forwardOutgoing.has(sourceId) ||
      !forwardOutgoing.has(targetId) ||
      targetNode.depth <= sourceNode.depth
    ) {
      return;
    }

    forwardOutgoing.get(sourceId).push(targetId);
    incomingEdgeOrderMap.get(targetId).push(index);
    forwardIncomingCountMap.set(
      targetId,
      (forwardIncomingCountMap.get(targetId) || 0) + 1,
    );
  });

  forwardOutgoing.forEach((childIds, parentId) => {
    const uniqueChildIds = [...new Set(childIds)];

    if (uniqueChildIds.length === 0) {
      return;
    }

    const preferredByEdgeOrder = [...uniqueChildIds].sort(
      (leftChildId, rightChildId) => {
        const leftOrder = getMinEdgeOrder(leftChildId, incomingEdgeOrderMap);
        const rightOrder = getMinEdgeOrder(rightChildId, incomingEdgeOrderMap);

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return (
          (nodeMap.get(leftChildId)?.originalIndex ?? 0) -
          (nodeMap.get(rightChildId)?.originalIndex ?? 0)
        );
      },
    );
    const mergeTargetChildren = preferredByEdgeOrder.filter(
      (childId) => (forwardIncomingCountMap.get(childId) || 0) > 1,
    );
    const primaryChildId =
      mergeTargetChildren.length > 0
        ? mergeTargetChildren[0]
        : preferredByEdgeOrder
            .map((childId) => ({
              childId,
              distanceToMerge: getDistanceToMergeTarget(
                childId,
                forwardOutgoing,
                forwardIncomingCountMap,
              ),
              edgeOrder: getMinEdgeOrder(childId, incomingEdgeOrderMap),
              originalIndex: nodeMap.get(childId)?.originalIndex ?? 0,
            }))
            .sort((leftChild, rightChild) => {
              if (leftChild.distanceToMerge !== rightChild.distanceToMerge) {
                return leftChild.distanceToMerge - rightChild.distanceToMerge;
              }

              if (leftChild.edgeOrder !== rightChild.edgeOrder) {
                return leftChild.edgeOrder - rightChild.edgeOrder;
              }

              return leftChild.originalIndex - rightChild.originalIndex;
            })[0]?.childId;

    if (primaryChildId) {
      branchBiasMap.set(primaryChildId, 0);
    }

    const nonPrimaryChildren = preferredByEdgeOrder.filter(
      (childId) => childId !== primaryChildId,
    );
    const firstBranchSign = parentHasAnchoredNote.has(parentId) ? -1 : 1;

    nonPrimaryChildren.forEach((childId, index) => {
      const step = Math.floor(index / 2) + 1;
      const sign = index % 2 === 0 ? firstBranchSign : -firstBranchSign;

      branchBiasMap.set(childId, sign * step);
    });
  });

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const layerNodes = layers.get(depth) || [];

    layerNodes.sort((leftNode, rightNode) => {
      const leftIncoming = incoming
        .get(leftNode.id)
        .filter((sourceId) => (nodeMap.get(sourceId)?.depth ?? depth) < depth);
      const rightIncoming = incoming
        .get(rightNode.id)
        .filter((sourceId) => (nodeMap.get(sourceId)?.depth ?? depth) < depth);
      const leftPreferredOrder = getPreferredParentOrder(
        leftIncoming,
        orderMap,
        nodeMap,
      );
      const rightPreferredOrder = getPreferredParentOrder(
        rightIncoming,
        orderMap,
        nodeMap,
      );

      if (leftPreferredOrder !== rightPreferredOrder) {
        return leftPreferredOrder - rightPreferredOrder;
      }

      const leftBias = branchBiasMap.get(leftNode.id) ?? 0;
      const rightBias = branchBiasMap.get(rightNode.id) ?? 0;

      if (leftBias !== rightBias) {
        return leftBias - rightBias;
      }

      const leftIncomingEdgeOrder = Math.min(
        ...(incomingEdgeOrderMap.get(leftNode.id) || [Number.POSITIVE_INFINITY]),
      );
      const rightIncomingEdgeOrder = Math.min(
        ...(incomingEdgeOrderMap.get(rightNode.id) || [Number.POSITIVE_INFINITY]),
      );

      if (leftIncomingEdgeOrder !== rightIncomingEdgeOrder) {
        return leftIncomingEdgeOrder - rightIncomingEdgeOrder;
      }

      const leftContinuesForward =
        (forwardOutgoing.get(leftNode.id) || []).length > 0;
      const rightContinuesForward =
        (forwardOutgoing.get(rightNode.id) || []).length > 0;

      if (leftContinuesForward !== rightContinuesForward) {
        return leftContinuesForward ? -1 : 1;
      }

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

    let previousAssignedOrder = Number.NEGATIVE_INFINITY;

    layerNodes.forEach((node, index) => {
      const preferredParentOrder = getPreferredParentOrder(
        incoming
          .get(node.id)
          .filter(
            (sourceId) => (nodeMap.get(sourceId)?.depth ?? depth) < depth,
          ),
        orderMap,
        nodeMap,
      );
      const desiredOrder = Number.isFinite(preferredParentOrder)
        ? preferredParentOrder + (branchBiasMap.get(node.id) ?? 0)
        : previousAssignedOrder === Number.NEGATIVE_INFINITY
          ? index
          : previousAssignedOrder + 1;
      const snappedDesiredOrder = Number.isFinite(desiredOrder)
        ? snapLayoutOrder(desiredOrder)
        : desiredOrder;
      const nextOrder = Number.isFinite(snappedDesiredOrder)
        ? Math.max(snappedDesiredOrder, previousAssignedOrder + 1)
        : index;

      previousAssignedOrder = nextOrder;
      orderMap.set(node.id, nextOrder);

      if (direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical) {
        node.x = nextOrder * nodeSpacingY;
        node.y = node.depth * layerSpacingX;
      } else {
        node.x = node.depth * layerSpacingX;
        node.y = nextOrder * nodeSpacingY;
      }

      node.baseX = node.x;
      node.baseY = node.y;
      node.fx = node.x;
      node.fy = node.y;
    });
  }

  const noteOffsetBySource = new Map();
  const noteOffsetStep = Math.max(nodeSpacingY, 124);
  const noteLaneCollisionThreshold = Math.max(8, noteOffsetStep * 0.45);

  noteLinkPairs.forEach(({ sourceId, targetId }) => {
    if (!anchoredNoteNodeIds.has(targetId)) {
      return;
    }

    const sourceNode = nodeMap.get(sourceId);
    const noteNode = nodeMap.get(targetId);

    if (!sourceNode || !noteNode) {
      return;
    }

    let nextOffsetIndex = noteOffsetBySource.get(sourceId) || 0;
    let candidateX = sourceNode.x;
    let candidateY = sourceNode.y;

    while (true) {
      if (direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical) {
        candidateX = sourceNode.x + (nextOffsetIndex + 1) * noteOffsetStep;
        candidateY = sourceNode.y;
      } else {
        candidateX = sourceNode.x;
        candidateY = sourceNode.y + (nextOffsetIndex + 1) * noteOffsetStep;
      }

      const hasCollision = graphNodes.some((node) => {
        if (node.id === targetId) {
          return false;
        }

        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
          return false;
        }

        return (
          Math.abs(node.x - candidateX) <= 1 &&
          Math.abs(node.y - candidateY) < noteLaneCollisionThreshold
        );
      });

      if (!hasCollision) {
        break;
      }

      nextOffsetIndex += 1;
    }

    noteOffsetBySource.set(sourceId, nextOffsetIndex + 1);
    noteNode.x = candidateX;
    noteNode.y = candidateY;
    noteNode.depth = sourceNode.depth + 0.25 + nextOffsetIndex * 0.01;
    noteNode.baseX = noteNode.x;
    noteNode.baseY = noteNode.y;
    noteNode.fx = noteNode.x;
    noteNode.fy = noteNode.y;
  });

  return {
    nodes: graphNodes,
    maxDepth,
    direction,
    layerSpacingX,
  };
}

function computeFlowchartLayoutWithD3Hierarchy(nodes, links, options = {}) {
  const baseLayout = computeFlowchartLayoutWithCurrentEngine(nodes, links, options);
  const direction = normalizeFlowchartLayoutDirection(options.direction);
  const layoutNodes = baseLayout.nodes.map((node) => ({ ...node }));
  const nodeMap = new Map(layoutNodes.map((node) => [node.id, node]));
  const structuralNodes = layoutNodes.filter((node) => node.type !== "note");

  if (structuralNodes.length <= 1) {
    return {
      ...baseLayout,
      nodes: layoutNodes,
    };
  }

  const structuralNodeIds = new Set(structuralNodes.map((node) => node.id));
  const incomingByTarget = new Map(
    structuralNodes.map((node) => [node.id, []]),
  );
  const edgeOrderByPair = new Map();
  const oldCrossAxisByNodeId = new Map(
    layoutNodes.map((node) => [
      node.id,
      direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical ? node.x : node.y,
    ]),
  );

  links.forEach((link, index) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);

    if (
      !structuralNodeIds.has(sourceId) ||
      !structuralNodeIds.has(targetId) ||
      sourceId === targetId
    ) {
      return;
    }

    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (!sourceNode || !targetNode || targetNode.depth <= sourceNode.depth) {
      return;
    }

    incomingByTarget.get(targetId).push({
      sourceId,
      index,
      sourceDepth: sourceNode.depth,
      sourceOrder: sourceNode.originalIndex ?? 0,
    });

    const edgeKey = `${sourceId}::${targetId}`;
    const previousEdgeIndex = edgeOrderByPair.get(edgeKey);

    if (!Number.isFinite(previousEdgeIndex) || index < previousEdgeIndex) {
      edgeOrderByPair.set(edgeKey, index);
    }
  });

  const parentByChild = new Map();

  incomingByTarget.forEach((entries, targetId) => {
    if (entries.length === 0) {
      return;
    }

    const [selectedParent] = entries.sort((leftParent, rightParent) => {
      if (leftParent.sourceDepth !== rightParent.sourceDepth) {
        return rightParent.sourceDepth - leftParent.sourceDepth;
      }

      if (leftParent.index !== rightParent.index) {
        return leftParent.index - rightParent.index;
      }

      return leftParent.sourceOrder - rightParent.sourceOrder;
    });

    parentByChild.set(targetId, selectedParent.sourceId);
  });

  const childrenByParent = new Map(
    structuralNodes.map((node) => [node.id, []]),
  );
  parentByChild.forEach((parentId, childId) => {
    childrenByParent.get(parentId).push(childId);
  });

  childrenByParent.forEach((children, parentId) => {
    children.sort((leftChildId, rightChildId) => {
      const leftEdgeOrder =
        edgeOrderByPair.get(`${parentId}::${leftChildId}`) ??
        Number.POSITIVE_INFINITY;
      const rightEdgeOrder =
        edgeOrderByPair.get(`${parentId}::${rightChildId}`) ??
        Number.POSITIVE_INFINITY;

      if (leftEdgeOrder !== rightEdgeOrder) {
        return leftEdgeOrder - rightEdgeOrder;
      }

      return (
        (nodeMap.get(leftChildId)?.originalIndex ?? 0) -
        (nodeMap.get(rightChildId)?.originalIndex ?? 0)
      );
    });
  });

  const rootNodes = structuralNodes
    .filter((node) => !parentByChild.has(node.id))
    .sort(
      (leftNode, rightNode) =>
        leftNode.depth - rightNode.depth ||
        (leftNode.originalIndex ?? 0) - (rightNode.originalIndex ?? 0),
    );

  const visited = new Set();
  const buildHierarchyNode = (nodeId) => {
    if (visited.has(nodeId)) {
      return null;
    }

    visited.add(nodeId);

    return {
      id: nodeId,
      children: (childrenByParent.get(nodeId) || [])
        .map((childId) => buildHierarchyNode(childId))
        .filter(Boolean),
    };
  };

  const hierarchyRootChildren = rootNodes
    .map((node) => buildHierarchyNode(node.id))
    .filter(Boolean);

  structuralNodes.forEach((node) => {
    if (visited.has(node.id)) {
      return;
    }

    const detachedHierarchyNode = buildHierarchyNode(node.id);

    if (detachedHierarchyNode) {
      hierarchyRootChildren.push(detachedHierarchyNode);
    }
  });

  const hierarchyRoot = hierarchy({
    id: "__FLOWCHART_ROOT__",
    children: hierarchyRootChildren,
  });
  const { layerSpacing, siblingSpacing } = getLayoutSpacing(
    structuralNodes,
    direction,
  );

  tree()
    .nodeSize([siblingSpacing, layerSpacing])
    .separation((leftNode, rightNode) =>
      leftNode.parent === rightNode.parent ? 1 : 1.3,
    )(hierarchyRoot);

  const d3CrossAxisByNodeId = new Map();
  hierarchyRoot.descendants().forEach((hierarchyNode) => {
    if (hierarchyNode.data.id === "__FLOWCHART_ROOT__") {
      return;
    }

    d3CrossAxisByNodeId.set(hierarchyNode.data.id, hierarchyNode.x);
  });

  const newCrossAxisByNodeId = new Map();

  structuralNodes.forEach((node) => {
    const d3CrossAxis = d3CrossAxisByNodeId.get(node.id);

    if (!Number.isFinite(d3CrossAxis)) {
      return;
    }

    if (direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical) {
      node.x = d3CrossAxis;
    } else {
      node.y = d3CrossAxis;
    }

    node.baseX = node.x;
    node.baseY = node.y;
    node.fx = node.x;
    node.fy = node.y;
    newCrossAxisByNodeId.set(node.id, d3CrossAxis);
  });

  const noteSourceByTarget = new Map();

  links.forEach((link) => {
    const sourceId = getLinkNodeId(link.source);
    const targetId = getLinkNodeId(link.target);
    const targetNode = nodeMap.get(targetId);

    if (!targetNode || targetNode.type !== "note" || noteSourceByTarget.has(targetId)) {
      return;
    }

    noteSourceByTarget.set(targetId, sourceId);
  });

  layoutNodes.forEach((node) => {
    if (node.type !== "note") {
      return;
    }

    const sourceId = noteSourceByTarget.get(node.id);
    const previousSourceCrossAxis = oldCrossAxisByNodeId.get(sourceId);
    const nextSourceCrossAxis = newCrossAxisByNodeId.get(sourceId);

    if (
      !Number.isFinite(previousSourceCrossAxis) ||
      !Number.isFinite(nextSourceCrossAxis)
    ) {
      return;
    }

    const sourceCrossAxisShift = nextSourceCrossAxis - previousSourceCrossAxis;

    if (direction === FLOWCHART_LAYOUT_DIRECTIONS.vertical) {
      node.x += sourceCrossAxisShift;
    } else {
      node.y += sourceCrossAxisShift;
    }

    node.baseX = node.x;
    node.baseY = node.y;
    node.fx = node.x;
    node.fy = node.y;
  });

  return {
    ...baseLayout,
    nodes: layoutNodes,
  };
}

export function computeFlowchartLayout(nodes, links, options = {}) {
  const formattingLogic = normalizeFlowchartFormattingLogic(
    options.formattingLogic || options.layoutEngine,
  );

  if (formattingLogic === FLOWCHART_FORMATTING_LOGIC.d3Hierarchy) {
    return computeFlowchartLayoutWithD3Hierarchy(nodes, links, options);
  }

  return computeFlowchartLayoutWithCurrentEngine(nodes, links, options);
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
