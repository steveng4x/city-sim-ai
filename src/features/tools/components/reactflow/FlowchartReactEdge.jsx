import React from "react";
import { BaseEdge, getSmoothStepPath } from "@xyflow/react";

export const BackEdge = React.memo(function BackEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style = {},
  markerEnd,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}) {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const normalX = distance > 0 ? -dy / distance : 0;
  const normalY = distance > 0 ? dx / distance : 1;
  const curveDirection = sourceY > targetY ? 1 : -1;
  const curveDepth = Math.max(92, Math.min(220, distance * 0.34 + 60));
  const controlX =
    (sourceX + targetX) / 2 + normalX * curveDepth * curveDirection;
  const controlY =
    (sourceY + targetY) / 2 + normalY * curveDepth * curveDirection;

  const edgePath = `M${sourceX},${sourceY} Q${controlX},${controlY} ${targetX},${targetY}`;

  const labelX = (sourceX + 2 * controlX + targetX) / 4;
  const labelY = (sourceY + 2 * controlY + targetY) / 4;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: "#cbd5e1",
          strokeWidth: 2,
          strokeDasharray: "6 3",
          ...style,
        }}
        markerEnd={markerEnd}
      />
      {label ? (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-String(label).length * 3.5 - (labelBgPadding?.[0] ?? 6)}
            y={-8 - (labelBgPadding?.[1] ?? 4)}
            width={String(label).length * 7 + (labelBgPadding?.[0] ?? 6) * 2}
            height={16 + (labelBgPadding?.[1] ?? 4) * 2}
            rx={labelBgBorderRadius ?? 4}
            style={{
              fill: "#ffffff",
              fillOpacity: 0.92,
              ...labelBgStyle,
            }}
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fill: "#475569",
              fontSize: 12,
              fontWeight: 600,
              ...labelStyle,
            }}
          >
            {label}
          </text>
        </g>
      ) : null}
    </>
  );
});
