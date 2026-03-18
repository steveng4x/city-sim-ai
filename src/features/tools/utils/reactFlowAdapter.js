import {
  computeFlowchartLayout,
  getFlowchartNodeDimensions,
} from "@/features/tools/utils/flowchart";

const DEFAULT_EDGE_STYLE = { stroke: "#cbd5e1", strokeWidth: 2 };
const DEFAULT_EDGE_LABEL_STYLE = {
  fill: "#475569",
  fontSize: 12,
  fontWeight: 600,
};
const DEFAULT_EDGE_LABEL_BG_STYLE = {
  fill: "#ffffff",
  fillOpacity: 0.92,
};
const DEFAULT_EDGE_MARKER_COLOR = "#94a3b8";

function normalizeBranchLabel(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();
}

function getDecisionEdgePresentation(sourceNode, label) {
  const normalizedLabel = normalizeBranchLabel(label);

  if (sourceNode?.type !== "decision") {
    return {
      style: DEFAULT_EDGE_STYLE,
      labelStyle: DEFAULT_EDGE_LABEL_STYLE,
      labelBgStyle: DEFAULT_EDGE_LABEL_BG_STYLE,
      markerColor: DEFAULT_EDGE_MARKER_COLOR,
    };
  }

  if (normalizedLabel === "yes") {
    return {
      style: { stroke: "#16a34a", strokeWidth: 2.5 },
      labelStyle: {
        fill: "#166534",
        fontSize: 12,
        fontWeight: 700,
      },
      labelBgStyle: {
        fill: "#f0fdf4",
        fillOpacity: 0.98,
      },
      markerColor: "#16a34a",
    };
  }

  if (normalizedLabel === "no") {
    return {
      style: { stroke: "#dc2626", strokeWidth: 2.5 },
      labelStyle: {
        fill: "#991b1b",
        fontSize: 12,
        fontWeight: 700,
      },
      labelBgStyle: {
        fill: "#fef2f2",
        fillOpacity: 0.98,
      },
      markerColor: "#dc2626",
    };
  }

  return {
    style: DEFAULT_EDGE_STYLE,
    labelStyle: DEFAULT_EDGE_LABEL_STYLE,
    labelBgStyle: DEFAULT_EDGE_LABEL_BG_STYLE,
    markerColor: DEFAULT_EDGE_MARKER_COLOR,
  };
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
    {
      direction: options.direction,
      formattingLogic: options.formattingLogic,
    },
  );
  const nodeMap = new Map(layoutNodes.map((n) => [n.id, n]));

  const nodes = layoutNodes.map((node) => {
    const { width, height } = getFlowchartNodeDimensions(node.type);

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
    .map((link, index) => {
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
      const edgePresentation = getDecisionEdgePresentation(
        sourceNode,
        link.label,
      );

      return {
        id: link.id || `edge-${sourceId}-${targetId}-${index}`,
        source: sourceId,
        target: targetId,
        label: link.label || "",
        type: isBackEdge ? "backEdge" : "smoothstep",
        pathOptions: { borderRadius: 0 },
        animated: isBackEdge,
        style: edgePresentation.style,
        labelStyle: edgePresentation.labelStyle,
        labelBgStyle: edgePresentation.labelBgStyle,
        labelBgPadding: [6, 4],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: "arrowclosed",
          color: edgePresentation.markerColor,
          width: 16,
          height: 16,
        },
      };
    })
    .filter(Boolean);

  return { nodes, edges };
}
