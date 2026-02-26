import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { mapW, mapH, factionColors } from "../lib/constants";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function InstancedMap({
  heightMap,
  rivers,
  suitabilityMap,
  resourceMap,
  citySnapshots,
  infrastructureSnapshots,
  currentEpoch,
  viewMode,
  seaLevel,
}) {
  const meshRef = useRef();

  const densityAlpha = (d) =>
    d >= 7 ? 1.0 : d >= 5 ? 0.95 : d >= 3 ? 0.6 : 0.25;

  useEffect(() => {
    if (!meshRef.current || !heightMap) return;

    const city = citySnapshots[currentEpoch];
    const infra = infrastructureSnapshots
      ? infrastructureSnapshots[currentEpoch]
      : null;

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const i = y * mapW + x;
        const elev = heightMap[i];

        // Default position & scale
        let zPos = elev <= seaLevel ? seaLevel * 10 : elev * 10;
        let scaleY = elev <= seaLevel ? 0.5 : 1;

        // Set Position and Scale
        tempObject.position.set(x - mapW / 2, zPos / 2, y - mapH / 2);
        tempObject.scale.set(1, zPos || 0.1, 1);

        // Adjust scale for cities/walls
        if (viewMode === "city") {
          let hasCity = false;
          // Apply infrastructure height
          if (infra && infra[i] === 1) {
            tempObject.scale.set(1, zPos + 0.3, 1);
            tempObject.position.set(
              x - mapW / 2,
              (zPos + 0.3) / 2,
              y - mapH / 2,
            );
          } else if (infra && infra[i] === 2) {
            tempObject.scale.set(1, zPos + 2.0, 1);
            tempObject.position.set(
              x - mapW / 2,
              (zPos + 2.0) / 2,
              y - mapH / 2,
            );
          }

          if (city && city[i] > 0) {
            hasCity = true;
            const density = city[i] % 10;
            // Height based on density
            const cityHeight = Math.max(0.5, density * 0.4);
            tempObject.scale.set(1, zPos + cityHeight, 1);
            tempObject.position.set(
              x - mapW / 2,
              (zPos + cityHeight) / 2,
              y - mapH / 2,
            );
          }
        }

        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);

        // Determine Color
        if (viewMode === "heatmap") {
          if (elev <= seaLevel) {
            tempColor.setHex(0x0f172a);
          } else {
            const s = suitabilityMap ? suitabilityMap[i] : 0;
            const r = Math.floor(s * 255);
            tempColor.setRGB(r / 255, (r * 0.8) / 255, 50 / 255);
          }
        } else {
          // Terrain base color
          if (elev <= seaLevel) tempColor.setHex(0x1e3a8a);
          else if (elev <= seaLevel + 0.02) tempColor.setHex(0x3b82f6);
          else if (elev <= seaLevel + 0.05) tempColor.setHex(0xfde047);
          else if (elev > 0.85) tempColor.setHex(0xf1f5f9);
          else if (elev > 0.7) tempColor.setHex(0x64748b);
          else tempColor.setHex(0x166534);

          // Rivers overlay
          if (rivers && rivers[i]) {
            tempColor.setHex(0x60a5fa);
          }

          // Resource overlay
          if (resourceMap) {
            if (resourceMap[i] === 1) tempColor.setHex(0x064e3b); // Forest
            if (resourceMap[i] === 2) tempColor.setHex(0xeab308); // Gold
          }

          // City & Infra overlay
          if (viewMode === "city") {
            // Apply road color
            if (infra && infra[i] === 1) {
              tempColor.setHex(0xd6d3d1); // Lighter stone for roads
            }
            // Apply wall color
            if (infra && infra[i] === 2 && (!city || city[i] === 0)) {
              tempColor.setHex(0x0f172a); // Darker slate for walls
            }

            if (city && city[i] > 0) {
              const tId = Math.floor(city[i] / 10);
              const density = city[i] % 10;
              const colorHex = factionColors[(tId - 1) % factionColors.length];

              // We mix the faction color with white if it's high density
              const baseC = new THREE.Color(colorHex);
              if (density >= 7) {
                baseC.lerp(new THREE.Color(0xffffff), 0.4);
              }
              tempColor.copy(baseC);
            }
          }
        }
        meshRef.current.setColorAt(i, tempColor);
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [
    heightMap,
    rivers,
    suitabilityMap,
    resourceMap,
    citySnapshots,
    infrastructureSnapshots,
    currentEpoch,
    viewMode,
    seaLevel,
  ]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, mapW * mapH]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}
