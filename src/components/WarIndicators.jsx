import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { mapW, mapH } from "../lib/constants";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function WarIndicators({
  citySnapshots,
  currentEpoch,
  heightMap,
  seaLevel,
  viewMode,
}) {
  const meshRef = useRef();
  const waveMeshRef = useRef();

  // Track ongoing animations independently of the epoch
  const activeEventsRef = useRef([]);

  // When epoch changes, we detect conquered tiles and add them to activeEventsRef
  useEffect(() => {
    if (
      viewMode !== "city" ||
      currentEpoch === 0 ||
      !citySnapshots ||
      !citySnapshots[currentEpoch] ||
      !citySnapshots[currentEpoch - 1]
    ) {
      return;
    }

    const current = citySnapshots[currentEpoch];
    const prev = citySnapshots[currentEpoch - 1];

    const newEvents = [];

    for (let i = 0; i < current.length; i++) {
      let isConquered = false;
      if (current[i] > 0 && prev[i] > 0) {
        const currentFaction = Math.floor(current[i] / 10);
        const prevFaction = Math.floor(prev[i] / 10);
        if (currentFaction !== prevFaction) {
          isConquered = true;
        }
      } else if (prev[i] > 0 && current[i] === 0) {
        isConquered = true;
      }

      if (isConquered) {
        const x = i % mapW;
        const y = Math.floor(i / mapW);
        const elev = heightMap[i];
        let zPos = elev <= seaLevel ? seaLevel * 10 : elev * 10;

        // Set strictly elevated z-index rendering above everything
        const zOff = zPos / 2 + 5.0;

        newEvents.push({
          i,
          x: x - mapW / 2,
          y: y - mapH / 2,
          z: zOff,
          startTime: null,
        });
      }
    }

    if (newEvents.length > 0) {
      activeEventsRef.current.push(...newEvents);
    }
  }, [citySnapshots, currentEpoch, viewMode, heightMap, seaLevel]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Assign startTime to any new events smoothly linking into useFrame local clock
    activeEventsRef.current.forEach((evt) => {
      if (evt.startTime === null) evt.startTime = time;
    });

    const waveDuration = 1.5; // 1.5 seconds lifespan

    // Filter out expired events
    activeEventsRef.current = activeEventsRef.current.filter((evt) => {
      return time - evt.startTime <= waveDuration;
    });

    const hasBoxes = !!meshRef.current;
    const hasWaves = !!waveMeshRef.current;

    const maxInstances = 3000;
    let renderCount = 0;

    // Use a base red color that will fade to black (which is invisible in additive blending)
    const baseR = 1.0;
    const baseG = 0.2;
    const baseB = 0.2;

    activeEventsRef.current.forEach((evt) => {
      if (renderCount >= maxInstances) return;

      const elapsed = time - evt.startTime;
      const waveProgress = Math.min(elapsed / waveDuration, 1.0);

      // Pulse effect for the core blocks
      const pulse = (Math.sin(time * 15) + 1) / 2;
      const scaleBase = 1.0 + pulse * 1.5;

      // Easing out the wave progress for explosion shockwave
      const easeOut = 1 - Math.pow(1 - waveProgress, 3);
      const maxRadius = 10.0; // expand past 7 blocks easily
      const waveScale = Math.max(easeOut * maxRadius, 0.001);

      const waveOpacity = Math.max(1.0 - waveProgress, 0);

      // Update core block
      if (hasBoxes) {
        tempObject.position.set(evt.x, evt.z - 2.0, evt.y);
        tempObject.scale.set(scaleBase, scaleBase, scaleBase);
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

        // Lower the RGB dynamically to fade it out visually before the lifecycle ends
        tempColor.setRGB(
          baseR * waveOpacity,
          baseG * waveOpacity,
          baseB * waveOpacity,
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
