import { computeFlowchartLayout } from "@/features/tools/utils/flowchart";

const NODE_DIMENSIONS = {
  decision: { width: 174, height: 100 },
  terminator: { width: 130, height: 50 },
  process: { width: 130, height: 50 },
  note: { width: 160, height: 60 },
  subflow: { width: 150, height: 60 },
  group: { width: 170, height: 70 },
};

function getNodeDimensions(type) {
  return NODE_DIMENSIONS[type] || NODE_DIMENSIONS.process;
}

export function toReactFlowElements(data, options = {}) {
  if (
    !data ||
    !Array.isArray(data.nodes) ||
    !Array.isArray(data.links) ||
    data.nodes.length === 0
  ) {
    return { nodes: [], edges: [] };
  }

  const links = data.links.map((link) => ({ ...link }));
  const { nodes: layoutNodes, direction } = computeFlowchartLayout(
    data.nodes,
    links,
    options,
  );
  const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

  const nodes = layoutNodes.map((node) => {
    const { width, height } = getNodeDimensions(node.type);

    return {
      id: node.id,
      type:
        node.type === "decision"
          ? "decision"
          : node.type === "terminator"
            ? "terminator"
            : node.type === "note"
              ? "note"
              : node.type === "subflow"
                ? "subflow"
                : node.type === "group"
                  ? "group"
                  : "process",
      position: { x: node.x - width / 2, y: node.y - height / 2 },
      data: {
        label: node.label || node.id,
        orientation: direction,
        baseX: node.x - width / 2,
        baseY: node.y - height / 2,
      },
      width,
      height,
    };
  });

  const edges = links
    .map((link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      const sourceNode = nodeMap.get(sourceId);
      const targetNode = nodeMap.get(targetId);

      if (!sourceNode || !targetNode) {
        return null;
      }

      const isBackEdge = targetNode.depth <= sourceNode.depth;

      return {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        label: link.label || "",
        type: isBackEdge ? "backEdge" : "smoothstep",
        animated: isBackEdge,
        style: { stroke: "#cbd5e1", strokeWidth: 2 },
        labelStyle: {
          fill: "#475569",
          fontSize: 12,
          fontWeight: 600,
        },
        labelBgStyle: {
          fill: "#ffffff",
          fillOpacity: 0.92,
        },
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: "arrowclosed",
          color: "#94a3b8",
          width: 16,
          height: 16,
        },
      };
    })
    .filter(Boolean);

  return { nodes, edges };
}
