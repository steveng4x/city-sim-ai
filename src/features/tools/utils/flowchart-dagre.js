import dagre from "dagre";

const FLOWCHART_LAYOUT_DIRECTIONS_VERTICAL = "vertical";

export const FLOWCHART_NODE_DIMENSIONS = {
  decision: { width: 174, height: 100 },
  terminator: { width: 130, height: 50 },
  process: { width: 130, height: 50 },
  note: { width: 160, height: 60 },
  subflow: { width: 150, height: 60 },
  group: { width: 170, height: 70 },
};

function getFlowchartNodeDimensions(type) {
  return FLOWCHART_NODE_DIMENSIONS[type] || FLOWCHART_NODE_DIMENSIONS.process;
}

const DIRECTION_MAP = {
  [FLOWCHART_LAYOUT_DIRECTIONS_VERTICAL]: "TB",
  horizontal: "LR", // assuming horizontal is 'horizontal'
};

export function computeFlowchartLayoutWithDagre(nodes, links, options = {}) {
  const direction = DIRECTION_MAP[options.direction] ?? "LR";

  if (!DIRECTION_MAP[options.direction]) {
    console.warn(
      `[computeFlowchartLayout] Unknown direction "${options.direction}", defaulting to LR`,
    );
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction,
    nodesep: direction === "TB" ? 80 : 50,
    ranksep: direction === "TB" ? 100 : 80,
    marginx: 20,
    marginy: 20,
    edgesep: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    const { width, height } = getFlowchartNodeDimensions(node.type);
    // Explicit width/height last — never let stale layout coords override dimensions
    g.setNode(node.id, { ...node, width, height });
  });

  links.forEach((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    if (
      g.hasNode(sourceId) &&
      g.hasNode(targetId) &&
      sourceId !== targetId // guard self-loops
    ) {
      g.setEdge(sourceId, targetId, {
        weight: link.weight ?? 1,
        label: link.label ?? "",
        minlen: link.minlen ?? 1,
      });
    }
  });

  dagre.layout(g);

  let maxDepth = 0;

  const layoutNodes = nodes.map((n) => {
    const dagreNode = g.node(n.id);

    if (!dagreNode) {
      console.warn(
        `[computeFlowchartLayout] Node "${n.id}" missing after layout`,
      );
      return n;
    }

    const { width, height } = getFlowchartNodeDimensions(n.type);

    // Trailing edge of the node, not its center
    const depth =
      direction === "TB" ? dagreNode.y + height / 2 : dagreNode.x + width / 2;

    maxDepth = Math.max(maxDepth, depth);

    return {
      ...n,
      x: dagreNode.x,
      y: dagreNode.y,
      depth,
    };
  });

  return {
    nodes: layoutNodes,
    maxDepth,
    direction: options.direction,
  };
}
