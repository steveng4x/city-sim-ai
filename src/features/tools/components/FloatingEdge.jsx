import React, { useMemo } from 'react';
import {
  BaseEdge,
  BezierEdge,
  SmoothStepEdge,
  getBezierPath,
  getSmoothStepPath,
  useInternalNode,
} from '@xyflow/react';

// Get intersection on a rectangle
// (rx, ry) is center of rect, (w, h) is width/height
// dx/dy is a directional vector pointing *from* the center of the rect *to* the other point
function getNodeIntersection(rx, ry, w, h, dx, dy) {
  // Guard against divide by zero or overlapping nodes
  if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
    return { x: rx, y: ry };
  }

  // Calculate distances to edges of the rectangle based on the ray direction
  const xRatio = dx !== 0 ? Math.abs((w / 2) / dx) : Infinity;
  const yRatio = dy !== 0 ? Math.abs((h / 2) / dy) : Infinity;

  // We hit the wall that takes the *shortest* distance ratio along the ray
  const minRatio = Math.min(xRatio, yRatio);

  return {
    x: rx + dx * minRatio,
    y: ry + dy * minRatio,
  };
}

export default function FloatingEdge(props) {
  const {
    id,
    source,
    target,
    style,
    label,
    labelStyle,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    markerEnd,
    animated,
  } = props;

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode || !sourceNode.measured || !targetNode.measured) {
    // Fallback if measurement is incomplete; draw a standard edge as a safe default
    return <SmoothStepEdge {...props} />;
  }

  const { width: sw, height: sh } = sourceNode.measured;
  const { width: tw, height: th } = targetNode.measured;
  const { positionAbsolute: sourcePos } = sourceNode.internals;
  const { positionAbsolute: targetPos } = targetNode.internals;

  // Centers of the nodes
  const sx = sourcePos.x + sw / 2;
  const sy = sourcePos.y + sh / 2;
  const tx = targetPos.x + tw / 2;
  const ty = targetPos.y + th / 2;

  // The ray direction from source to target
  const sdx = tx - sx;
  const sdy = ty - sy;

  // The ray direction from target to source
  const tdx = sx - tx;
  const tdy = sy - ty;

  // Get edge intersection point on the source bounding box
  const sourceIntersection = getNodeIntersection(sx, sy, sw, sh, sdx, sdy);

  // Get edge intersection point on the target bounding box
  const targetIntersection = getNodeIntersection(tx, ty, tw, th, tdx, tdy);

  // Determine path routing: Smoothstep or Bezier
  // Flowchart.js defaults usually favor Smoothstep unless configured otherwise.
  // We recreate standard react-flow routing here, giving it our exact intersection start/end points.
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sourceIntersection.x,
    sourceY: sourceIntersection.y,
    // Source position dictates curve direction:
    // If it's entering the top/bottom boundary, angle it vertically. If side, horizontally. 
    sourcePosition:
      Math.abs(sourceIntersection.y - sy) >= (sh / 2) - 1 ? (sdy > 0 ? 'bottom' : 'top') : (sdx > 0 ? 'right' : 'left'),
    targetX: targetIntersection.x,
    targetY: targetIntersection.y,
    targetPosition:
      Math.abs(targetIntersection.y - ty) >= (th / 2) - 1 ? (tdy > 0 ? 'bottom' : 'top') : (tdx > 0 ? 'right' : 'left'),
  });

  // Calculate colors/stroke for markers
  const strokeColor = style?.stroke || "#cbd5e1";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
        interactionWidth={20}
        labelX={labelX}
        labelY={labelY}
        label={label}
        labelStyle={labelStyle}
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        labelBgBorderRadius={labelBgBorderRadius}
        className={animated ? 'react-flow__edge-path animated' : ''}
      />

      {/* RENDER THE DYNAMIC 1-to-1 HANDLES HERE OVER THE PATH */}
      <circle
        cx={sourceIntersection.x}
        cy={sourceIntersection.y}
        r={3}
        fill={strokeColor}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
      
      {/* Target Marker */}
      <circle
        cx={targetIntersection.x}
        cy={targetIntersection.y}
        r={3.5}
        fill={"#ffffff"}
        stroke={strokeColor}
        strokeWidth={2}
      />
    </>
  );
}
