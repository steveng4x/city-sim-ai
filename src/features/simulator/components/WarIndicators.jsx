import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mapW, mapH } from "@/features/simulator";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function WarIndicators({
  warEventSnapshots,
  currentEpoch,
  heightMap,
  seaLevel,
  viewMode,
}) {
  const meshRef = useRef();
  const waveMeshRef = useRef();

  // Track ongoing animations independently of the epoch
  const activeEventsRef = useRef([]);

  // When epoch changes, we read explicit simulated events and animate them
  useEffect(() => {
    if (
      viewMode !== "city" ||
      currentEpoch === 0 ||
      !warEventSnapshots ||
      !warEventSnapshots[currentEpoch]
    ) {
      return;
    }

    const currentEvents = warEventSnapshots[currentEpoch];
    if (!currentEvents || currentEvents.length === 0) return;

    const newVisuals = [];

    for (const evt of currentEvents) {
      const { x, y, type } = evt;
      const i = y * mapW + x;
      const elev = heightMap[i];
      let zPos = elev <= seaLevel ? seaLevel * 10 : elev * 10;

      // Set strictly elevated z-index rendering above everything
      const zOff = zPos / 2 + 5.0;

      // Map engine event type to UI visual profile
      if (type === "CRITICAL_PUSH") {
        newVisuals.push({
          x: x - mapW / 2,
          y: y - mapH / 2,
          z: zOff,
          startTime: null,
          uiScale: 3.5, // Much punchier, highly visible shockwave
          uiDuration: 0.9, // Slightly longer to be readable
          type: "critical",
        });
      } else if (type === "PROVINCE_FALL") {
        newVisuals.push({
          x: x - mapW / 2,
          y: y - mapH / 2,
          z: zOff,
          startTime: null,
          uiScale: 15.0, // Massive screen-filling shockwave
          uiDuration: 2.0, // Long slow burn
          type: "province",
        });
      }
    }

    if (newVisuals.length > 0) {
      activeEventsRef.current.push(...newVisuals);
    }
  }, [warEventSnapshots, currentEpoch, viewMode, heightMap, seaLevel]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Assign startTime to any new events smoothly linking into useFrame local clock
    activeEventsRef.current.forEach((evt) => {
      if (evt.startTime === null) evt.startTime = time;
    });

    // Filter out expired visuals based on their distinct duration profiles
    activeEventsRef.current = activeEventsRef.current.filter((evt) => {
      return time - evt.startTime <= evt.uiDuration;
    });

    const hasBoxes = !!meshRef.current;
    const hasWaves = !!waveMeshRef.current;

    const maxInstances = 3000;
    let renderCount = 0;

    // Base colors
    const criticalR = 1.0,
      criticalG = 0.8,
      criticalB = 0.2; // Bright electric yellow-orange for crits
    const provR = 1.0,
      provG = 0.1,
      provB = 0.1; // Deep red for provincial collapse

    activeEventsRef.current.forEach((evt) => {
      if (renderCount >= maxInstances) return;

      const elapsed = time - evt.startTime;
      const waveProgress = Math.min(elapsed / evt.uiDuration, 1.0);

      // Pulse effect for the core blocks
      const pulse = (Math.sin(time * 15) + 1) / 2;

      const scaleBase = 1.0 + pulse * 1.5 + evt.uiScale * 0.1;
      const heightScale = 1.0 + pulse * 0.5;

      // Easing out the wave progress for explosion shockwave
      const easeOut = 1 - Math.pow(1 - waveProgress, 2); // Sharper ease out
      const maxRadius = evt.uiScale * 1.5;
      const waveScale = Math.max(easeOut * maxRadius, 0.001);

      const waveOpacity = Math.max(1.0 - waveProgress, 0);

      // Update core block
      if (hasBoxes) {
        tempObject.position.set(evt.x, evt.z - 2.0, evt.y);
        tempObject.scale.set(scaleBase, heightScale, scaleBase);
        tempObject.rotation.set(0, 0, 0);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(renderCount, tempObject.matrix);
      }

      // Update expanding wave
      if (hasWaves) {
        // Lay flat on ground, rendered distinctly OVER buildings
        tempObject.position.set(evt.x, evt.z, evt.y);
        tempObject.scale.set(waveScale, waveScale, waveScale);
        // Rotate RingGeometry to lie flat on the map plane (XZ)
        tempObject.rotation.set(-Math.PI / 2, 0, 0);
        tempObject.updateMatrix();
        waveMeshRef.current.setMatrixAt(renderCount, tempObject.matrix);

        // Color shifting based on event tier
        let rDef = evt.type === "critical" ? criticalR : provR;
        let gDef = evt.type === "critical" ? criticalG : provG;
        let bDef = evt.type === "critical" ? criticalB : provB;

        tempColor.setRGB(
          rDef * waveOpacity,
          gDef * waveOpacity,
          bDef * waveOpacity,
        );
        waveMeshRef.current.setColorAt(renderCount, tempColor);
      }

      renderCount++;
    });

    // Hide remaining unused instances safely
    for (let idx = renderCount; idx < maxInstances; idx++) {
      tempObject.scale.set(0, 0, 0);
      tempObject.updateMatrix();
      if (hasBoxes) meshRef.current.setMatrixAt(idx, tempObject.matrix);
      if (hasWaves) waveMeshRef.current.setMatrixAt(idx, tempObject.matrix);
    }

    if (hasBoxes) meshRef.current.instanceMatrix.needsUpdate = true;
    if (hasWaves) {
      waveMeshRef.current.instanceMatrix.needsUpdate = true;
      if (waveMeshRef.current.instanceColor) {
        waveMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Central Pulsing Block */}
      <instancedMesh ref={meshRef} args={[null, null, 3000]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.8}
          depthTest={false}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Expanding Shockwave Ring */}
      <instancedMesh ref={waveMeshRef} args={[null, null, 3000]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshBasicMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthTest={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}
