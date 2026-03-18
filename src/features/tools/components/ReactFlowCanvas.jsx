import React from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "@xyflow/react";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import "@xyflow/react/dist/style.css";
import { BackEdge } from "@/features/tools/components/reactflow/FlowchartReactEdge";
import { FLOWCHART_NODE_DIMENSIONS } from "@/features/tools/utils/flowchart";
import { toReactFlowElements } from "@/features/tools/utils/reactFlowAdapter";

const DECISION_NODE_DIMENSIONS = FLOWCHART_NODE_DIMENSIONS.decision;
const TERMINATOR_NODE_DIMENSIONS = FLOWCHART_NODE_DIMENSIONS.terminator;
const PROCESS_NODE_DIMENSIONS = FLOWCHART_NODE_DIMENSIONS.process;
const NOTE_NODE_DIMENSIONS = FLOWCHART_NODE_DIMENSIONS.note;
const SUBFLOW_NODE_DIMENSIONS = FLOWCHART_NODE_DIMENSIONS.subflow;
const GROUP_NODE_DIMENSIONS = FLOWCHART_NODE_DIMENSIONS.group;

const DECISION_NODE_POLYGON_POINTS = `${
  DECISION_NODE_DIMENSIONS.width / 2
},4 ${DECISION_NODE_DIMENSIONS.width - 4},${
  DECISION_NODE_DIMENSIONS.height / 2
} ${DECISION_NODE_DIMENSIONS.width / 2},${
  DECISION_NODE_DIMENSIONS.height - 4
} 4,${DECISION_NODE_DIMENSIONS.height / 2}`;

function getHandlePositions(orientation) {
  if (orientation === "vertical") {
    return {
      target: Position.Top,
      source: Position.Bottom,
    };
  }

  return {
    target: Position.Left,
    source: Position.Right,
  };
}

const DecisionNode = React.memo(function DecisionNode({ data }) {
  const handles = getHandlePositions(data.orientation);

  return (
    <div
      className="group relative flex items-center justify-center"
      style={{
        width: DECISION_NODE_DIMENSIONS.width,
        height: DECISION_NODE_DIMENSIONS.height,
      }}
    >
      <svg
        width={DECISION_NODE_DIMENSIONS.width}
        height={DECISION_NODE_DIMENSIONS.height}
        viewBox={`0 0 ${DECISION_NODE_DIMENSIONS.width} ${DECISION_NODE_DIMENSIONS.height}`}
        className="absolute inset-0 pointer-events-none"
      >
        <polygon
          points={DECISION_NODE_POLYGON_POINTS}
          fill="#fef08a"
          stroke="#eab308"
          strokeWidth="2"
          className="transition-[filter] duration-200 group-hover:brightness-95"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))" }}
        />
      </svg>
      <span className="relative z-10 max-w-[120px] break-words text-center text-[11px] leading-tight font-medium text-slate-800 pointer-events-none">
        {data.label}
      </span>
      <Handle
        type="target"
        position={handles.target}
        className="!bg-yellow-500 !border-yellow-600 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={handles.source}
        className="!bg-yellow-500 !border-yellow-600 !w-2 !h-2"
      />
    </div>
  );
});

const TerminatorNode = React.memo(function TerminatorNode({ data }) {
  const handles = getHandlePositions(data.orientation);

  return (
    <div
      className="group flex items-center justify-center rounded-full border-2 border-purple-500 bg-purple-50 transition-[filter] duration-200 hover:brightness-95"
      style={{
        width: TERMINATOR_NODE_DIMENSIONS.width,
        height: TERMINATOR_NODE_DIMENSIONS.height,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))",
      }}
    >
      <span className="max-w-[110px] break-words text-center text-[12px] leading-tight font-medium text-slate-800 pointer-events-none px-1">
        {data.label}
      </span>
      <Handle
        type="target"
        position={handles.target}
        className="!bg-purple-500 !border-purple-600 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={handles.source}
        className="!bg-purple-500 !border-purple-600 !w-2 !h-2"
      />
    </div>
  );
});

const ProcessNode = React.memo(function ProcessNode({ data }) {
  const handles = getHandlePositions(data.orientation);

  return (
    <div
      className="group flex items-center justify-center rounded-md border-2 border-sky-400 bg-sky-50 transition-[filter] duration-200 hover:brightness-95"
      style={{
        width: PROCESS_NODE_DIMENSIONS.width,
        height: PROCESS_NODE_DIMENSIONS.height,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))",
      }}
    >
      <span className="max-w-[110px] break-words text-center text-[12px] leading-tight font-medium text-slate-800 pointer-events-none px-1">
        {data.label}
      </span>
      <Handle
        type="target"
        position={handles.target}
        className="!bg-sky-400 !border-sky-500 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={handles.source}
        className="!bg-sky-400 !border-sky-500 !w-2 !h-2"
      />
    </div>
  );
});

const NoteNode = React.memo(function NoteNode({ data }) {
  return (
    <div
      className="group flex items-start justify-start rounded-sm border border-amber-400 bg-amber-50 transition-[filter] duration-200 hover:brightness-95"
      style={{
        width: NOTE_NODE_DIMENSIONS.width,
        minHeight: NOTE_NODE_DIMENSIONS.height,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.08))",
        borderLeft: "4px solid #f59e0b",
      }}
    >
      <span className="break-words text-left text-[11px] leading-snug font-normal text-slate-700 pointer-events-none px-2.5 py-2">
        {data.label}
      </span>
    </div>
  );
});

const SubflowNode = React.memo(function SubflowNode({ data }) {
  const handles = getHandlePositions(data.orientation);

  return (
    <div
      className="group flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-50/60 transition-[filter] duration-200 hover:brightness-95"
      style={{
        width: SUBFLOW_NODE_DIMENSIONS.width,
        height: SUBFLOW_NODE_DIMENSIONS.height,
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.07))",
      }}
    >
      <div className="flex flex-col items-center gap-0.5 pointer-events-none px-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-indigo-400">
          subflow
        </span>
        <span className="max-w-[130px] break-words text-center text-[12px] leading-tight font-medium text-slate-800">
          {data.label}
        </span>
      </div>
      <Handle
        type="target"
        position={handles.target}
        className="!bg-indigo-400 !border-indigo-500 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={handles.source}
        className="!bg-indigo-400 !border-indigo-500 !w-2 !h-2"
      />
    </div>
  );
});

const GroupNode = React.memo(function GroupNode({ data }) {
  const handles = getHandlePositions(data.orientation);

  return (
    <div
      className="group flex items-center justify-center rounded-xl border-2 border-slate-400 bg-slate-100/50 transition-[filter] duration-200 hover:brightness-95"
      style={{
        width: GROUP_NODE_DIMENSIONS.width,
        height: GROUP_NODE_DIMENSIONS.height,
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.06))",
      }}
    >
      <div className="flex flex-col items-center gap-0.5 pointer-events-none px-2">
        <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          group
        </span>
        <span className="max-w-[150px] break-words text-center text-[12px] leading-tight font-medium text-slate-700">
          {data.label}
        </span>
      </div>
      <Handle
        type="target"
        position={handles.target}
        className="!bg-slate-400 !border-slate-500 !w-2 !h-2"
      />
      <Handle
        type="source"
        position={handles.source}
        className="!bg-slate-400 !border-slate-500 !w-2 !h-2"
      />
    </div>
  );
});

const nodeTypes = {
  decision: DecisionNode,
  terminator: TerminatorNode,
  process: ProcessNode,
  note: NoteNode,
  subflow: SubflowNode,
  group: GroupNode,
};

const edgeTypes = {
  backEdge: BackEdge,
};

const FORCE_LINK_DISTANCE = 185;
const FORCE_CHARGE_STRENGTH = -760;
const FORCE_COLLIDE_PADDING = 26;
const FORCE_AXIS_STRENGTH = 0.05;
const FORCE_COLLIDE_STRENGTH = 0.9;
const FORCE_LINK_STRENGTH = 0.14;

function resolveNodeSize(node) {
  const width =
    Number(node.width) > 0
      ? node.width
      : Number(node.style?.width) > 0
        ? Number(node.style.width)
        : FLOWCHART_NODE_DIMENSIONS.process.width;
  const height =
    Number(node.height) > 0
      ? node.height
      : Number(node.style?.height) > 0
        ? Number(node.style.height)
        : FLOWCHART_NODE_DIMENSIONS.process.height;

  return { width, height };
}

function nodeColor(node) {
  switch (node.type) {
    case "decision":
      return "#fef08a";
    case "terminator":
      return "#f3e8ff";
    case "note":
      return "#fef3c7";
    case "subflow":
      return "#e0e7ff";
    case "group":
      return "#e2e8f0";
    default:
      return "#e0f2fe";
  }
}

function ReactFlowContent(
  {
    data,
    nodeCount,
    linkCount,
    isFullscreen,
    orientation,
    formattingLogic,
    isForceLayoutEnabled,
  },
  ref,
) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const simulationRef = React.useRef(null);
  const simulationNodesRef = React.useRef(new Map());
  const nodesRef = React.useRef([]);
  const edgesRef = React.useRef([]);
  const isForceLayoutEnabledRef = React.useRef(isForceLayoutEnabled);

  const stopForceSimulation = React.useCallback(() => {
    simulationRef.current?.on("tick", null);
    simulationRef.current?.stop();
    simulationRef.current = null;
    simulationNodesRef.current = new Map();
  }, []);

  const runForceSimulation = React.useCallback(
    (initialNodes, initialEdges) => {
      stopForceSimulation();

      if (!Array.isArray(initialNodes) || initialNodes.length === 0) {
        return;
      }

      const simulationNodes = initialNodes.map((node) => {
        const { width, height } = resolveNodeSize(node);

        return {
          id: node.id,
          width,
          height,
          x: node.position.x + width / 2,
          y: node.position.y + height / 2,
        };
      });
      const simulationNodesById = new Map(
        simulationNodes.map((simulationNode) => [simulationNode.id, simulationNode]),
      );
      simulationNodesRef.current = simulationNodesById;

      const linkForce = forceLink(
        (initialEdges || [])
          .map((edge) => ({
            source: edge.source,
            target: edge.target,
          }))
          .filter(
            (edge) =>
              simulationNodesById.has(edge.source) &&
              simulationNodesById.has(edge.target),
          ),
      )
        .id((node) => node.id)
        .distance(FORCE_LINK_DISTANCE)
        .strength(FORCE_LINK_STRENGTH);

      const centerX =
        simulationNodes.reduce((total, node) => total + node.x, 0) /
        simulationNodes.length;
      const centerY =
        simulationNodes.reduce((total, node) => total + node.y, 0) /
        simulationNodes.length;

      const axisForce =
        orientation === "vertical"
          ? forceX(centerX).strength(FORCE_AXIS_STRENGTH)
          : forceY(centerY).strength(FORCE_AXIS_STRENGTH);

      const simulation = forceSimulation(simulationNodes)
        .force("charge", forceManyBody().strength(FORCE_CHARGE_STRENGTH))
        .force("link", linkForce)
        .force(
          "collision",
          forceCollide()
            .radius(
              (node) =>
                Math.max(node.width, node.height) / 2 + FORCE_COLLIDE_PADDING,
            )
            .strength(FORCE_COLLIDE_STRENGTH),
        )
        .force("center", forceCenter(centerX, centerY))
        .force("axis", axisForce)
        .alpha(1)
        .alphaDecay(0.03)
        .alphaMin(0.015);

      simulation.on("tick", () => {
        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            const simulationNode = simulationNodesById.get(node.id);

            if (!simulationNode) {
              return node;
            }

            const { width, height } = resolveNodeSize(node);

            return {
              ...node,
              position: {
                x: simulationNode.x - width / 2,
                y: simulationNode.y - height / 2,
              },
            };
          }),
        );
      });

      simulationRef.current = simulation;
    },
    [orientation, setNodes, stopForceSimulation],
  );

  React.useImperativeHandle(
    ref,
    () => ({
      resetView: () => fitView({ padding: 0.15, duration: 750 }),
    }),
    [fitView],
  );

  React.useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  React.useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  React.useEffect(() => {
    isForceLayoutEnabledRef.current = isForceLayoutEnabled;
  }, [isForceLayoutEnabled]);

  React.useEffect(() => {
    const { nodes: rfNodes, edges: rfEdges } = toReactFlowElements(data, {
      direction: orientation,
      formattingLogic,
    });
    nodesRef.current = rfNodes;
    edgesRef.current = rfEdges;
    setNodes(rfNodes);
    setEdges(rfEdges);

    if (isForceLayoutEnabledRef.current) {
      runForceSimulation(rfNodes, rfEdges);
    } else {
      stopForceSimulation();
    }

    requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 400 });
    });
  }, [
    data,
    fitView,
    formattingLogic,
    orientation,
    runForceSimulation,
    setEdges,
    setNodes,
    stopForceSimulation,
  ]);

  React.useEffect(() => {
    if (isForceLayoutEnabled) {
      runForceSimulation(nodesRef.current, edgesRef.current);
      return;
    }

    stopForceSimulation();
  }, [isForceLayoutEnabled, runForceSimulation, stopForceSimulation]);

  React.useEffect(() => () => stopForceSimulation(), [stopForceSimulation]);

  const onNodeDragStart = React.useCallback(
    (_event, node) => {
      if (!isForceLayoutEnabled) {
        return;
      }

      const simulationNode = simulationNodesRef.current.get(node.id);
      if (!simulationNode) {
        return;
      }

      const { width, height } = resolveNodeSize(node);
      simulationNode.fx = node.position.x + width / 2;
      simulationNode.fy = node.position.y + height / 2;
    },
    [isForceLayoutEnabled],
  );

  const onNodeDrag = React.useCallback(
    (_event, node) => {
      if (!isForceLayoutEnabled) {
        return;
      }

      const simulationNode = simulationNodesRef.current.get(node.id);
      if (!simulationNode) {
        return;
      }

      const { width, height } = resolveNodeSize(node);
      simulationNode.fx = node.position.x + width / 2;
      simulationNode.fy = node.position.y + height / 2;
    },
    [isForceLayoutEnabled],
  );

  const onNodeDragStop = React.useCallback(
    (_event, node) => {
      if (!isForceLayoutEnabled) {
        return;
      }

      const simulationNode = simulationNodesRef.current.get(node.id);
      if (!simulationNode) {
        return;
      }

      const { width, height } = resolveNodeSize(node);
      simulationNode.x = node.position.x + width / 2;
      simulationNode.y = node.position.y + height / 2;
      simulationNode.fx = null;
      simulationNode.fy = null;
      simulationRef.current?.alpha(0.35).restart();
    },
    [isForceLayoutEnabled],
  );

  const onNodeDoubleClick = React.useCallback(
    (_event, node) => {
      if (node.data.baseX != null && node.data.baseY != null) {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, position: { x: n.data.baseX, y: n.data.baseY } }
              : n,
          ),
        );

        if (isForceLayoutEnabled) {
          const simulationNode = simulationNodesRef.current.get(node.id);

          if (simulationNode) {
            const { width, height } = resolveNodeSize(node);
            simulationNode.x = node.data.baseX + width / 2;
            simulationNode.y = node.data.baseY + height / 2;
            simulationRef.current?.alpha(0.3).restart();
          }
        }
      }
    },
    [isForceLayoutEnabled, setNodes],
  );

  return (
    <section
      data-testid="flowchart-canvas"
      className={`relative overflow-hidden rounded-[28px] border border-slate-800 bg-white shadow-[0_24px_80px_rgba(2,6,23,0.38)] ${isFullscreen ? "h-full min-h-0" : "min-h-[560px]"}`}
    >
      {isFullscreen ? (
        <div className="pointer-events-none absolute left-4 bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Focused Canvas
          </p>
          <p className="mt-1 max-w-[240px] leading-5">
            Editor is hidden by default in fullscreen so the graph can use the
            full workspace. Reopen it from the overlay controls when needed.
          </p>
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Canvas Overview
        </p>
        <p className="mt-1 leading-5">
          Powered by <strong>React Flow</strong> — interactive graph
          visualization.
        </p>
        {isForceLayoutEnabled ? (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
            Force simulation active
          </p>
        ) : null}
        <div className="mt-2 flex items-baseline gap-4">
          <p>
            <span className="text-lg font-semibold text-slate-900">
              {nodeCount}
            </span>{" "}
            nodes
          </p>
          <p>
            <span className="text-lg font-semibold text-slate-900">
              {linkCount}
            </span>{" "}
            links
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 right-14 z-10 space-y-1 rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 text-xs text-slate-600 shadow-md backdrop-blur">
        {isFullscreen ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Fullscreen Mode
          </p>
        ) : null}
        <p>
          <strong>Scroll</strong> to zoom. <strong>Drag background</strong> to
          pan.
        </p>
        <p>
          <strong>Drag nodes</strong> to reposition them.{" "}
          <strong>Double-click node</strong> to reset position.
        </p>
      </div>

      <div
        className="h-full w-full"
        style={{ minHeight: isFullscreen ? "100%" : 560 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.1}
          maxZoom={4}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { stroke: "#cbd5e1", strokeWidth: 2 },
          }}
        >
          <Background color="#e2e8f0" gap={20} size={1} />
          <Controls
            position="bottom-right"
            showInteractive={false}
            className="!rounded-xl !border-slate-200 !bg-white/95 !shadow-lg !backdrop-blur [&>button]:!border-slate-200 [&>button]:!bg-white [&>button:hover]:!bg-slate-50"
          />
          <MiniMap
            position="bottom-left"
            nodeColor={nodeColor}
            maskColor="rgba(241,245,249,0.7)"
            className="!rounded-xl !border-slate-200 !bg-white/95 !shadow-lg !backdrop-blur"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </section>
  );
}

const ReactFlowContentRef = React.forwardRef(ReactFlowContent);

export const ReactFlowCanvas = React.forwardRef(function ReactFlowCanvas(
  {
    data,
    nodeCount,
    linkCount,
    isFullscreen = false,
    orientation = "horizontal",
    formattingLogic = "current",
    isForceLayoutEnabled = false,
  },
  ref,
) {
  return (
    <ReactFlowProvider>
      <ReactFlowContentRef
        ref={ref}
        data={data}
        nodeCount={nodeCount}
        linkCount={linkCount}
        isFullscreen={isFullscreen}
        orientation={orientation}
        formattingLogic={formattingLogic}
        isForceLayoutEnabled={isForceLayoutEnabled}
      />
    </ReactFlowProvider>
  );
});
