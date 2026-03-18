import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import { mapW, mapH, factionColors } from "@/features/simulator";
import { useThree } from "@react-three/fiber";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function InstancedMap({
  heightMap,
  rivers,
  suitabilityMap,
  resourceMap,
  citySnapshots,
  infrastructureSnapshots,
  provinceSnapshots,
  provinceRegistry,
  currentEpoch,
  viewMode,
  seaLevel,
  finishGeneration,
  showRivers,
  showResources,
  megaCityRegistry,
  onTileHover,
  onTileClick,
}) {
  const meshRef = useRef();
  const borderMeshRef = useRef();
  const beaconMeshRef = useRef();
  const { camera, gl } = useThree();
  const buildTileData = useCallback(
    (instanceId) => {
      if (!heightMap || instanceId === undefined) return null;
      const x = instanceId % mapW;
      const y = Math.floor(instanceId / mapW);
      const elev = heightMap[instanceId];
      const city = citySnapshots?.[currentEpoch];
      const infra = infrastructureSnapshots?.[currentEpoch];
      const prov = provinceSnapshots?.[currentEpoch];
      const suit = suitabilityMap?.[instanceId] ?? 0;
      const resource = resourceMap?.[instanceId] ?? 0;
      const isRiver = !!rivers?.[instanceId];
      const isOcean = elev <= seaLevel;

      let factionId = 0;
      let density = 0;
      let infraType = 0;
      let provinceId = 0;
      let megaCityName = null;

      if (city && city[instanceId] > 0) {
        factionId = Math.floor(city[instanceId] / 10);
        density = city[instanceId] % 10;
      }
      if (infra) infraType = infra[instanceId];
      if (prov) provinceId = prov[instanceId];
      if (megaCityRegistry?.[instanceId]) {
        megaCityName = megaCityRegistry[instanceId].name;
      }

      return {
        tileIndex: instanceId,
        x,
        y,
        elevation: elev,
        suitability: suit,
        isOcean,
        isRiver,
        resource,
        factionId,
        density,
        infraType,
        provinceId,
        megaCityName,
      };
    },
    [
      heightMap,
      citySnapshots,
      infrastructureSnapshots,
      provinceSnapshots,
      suitabilityMap,
      resourceMap,
      rivers,
      seaLevel,
      currentEpoch,
      megaCityRegistry,
    ],
  );

  useEffect(() => {
    if (!meshRef.current || !heightMap) return;

    const city = citySnapshots[currentEpoch];
    const infra = infrastructureSnapshots
      ? infrastructureSnapshots[currentEpoch]
      : null;

    let borderCount = 0;
    let beaconCount = 0;

    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const i = y * mapW + x;
        const elev = heightMap[i];
        let cityDensity = 0;

        // Default position & scale
        let zPos = elev <= seaLevel ? seaLevel * 10 : elev * 10;
        // let scaleY = elev <= seaLevel ? 0.5 : 1;

        // Set Position and Scale
        tempObject.position.set(x - mapW / 2, zPos / 2, y - mapH / 2);
        tempObject.scale.set(1, zPos || 0.1, 1);

        // Adjust scale for cities/walls
        if (viewMode === "city") {
          // let hasCity = false;
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
            // hasCity = true;
            const density = city[i] % 10;
            cityDensity = density;
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
          if (showRivers && rivers && rivers[i]) {
            tempColor.setHex(0x60a5fa);
          }

          // Resource overlay
          if (showResources && resourceMap) {
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

              // Dynamically mix faction color based on density (1-9)
              const baseC = new THREE.Color(colorHex);
              if (density < 5) {
                // Blend with black for low densities
                const factor = (5 - density) * 0.15;
                baseC.lerp(new THREE.Color(0x000000), factor);
              } else if (density > 5) {
                // Blend with white for high densities
                const factor = (density - 5) * 0.15;
                baseC.lerp(new THREE.Color(0xffffff), factor);
              }
              if (density === 9) {
                baseC.multiplyScalar(2.0);
              }
              tempColor.copy(baseC);
            }
          } else if (viewMode === "province") {
            const prov = provinceSnapshots
              ? provinceSnapshots[currentEpoch]
              : null;
            if (prov && prov[i] > 0) {
              const pId = prov[i];
              const meta = provinceRegistry ? provinceRegistry[pId] : null;
              if (meta) {
                const fId = meta.factionId;
                const colorHex =
                  factionColors[(fId - 1) % factionColors.length];
                const baseC = new THREE.Color(colorHex);

                // Apply deterministic lightness jitter based on provinceId
                // We don't hash string, instead we just use some prime number math to scatter the lightness offset
                const jitter = (((pId * 104729) % 100) / 100) * 0.2 - 0.1; // random offset between -0.1 and 0.1

                if (jitter > 0) {
                  baseC.lerp(new THREE.Color(0xffffff), jitter);
                } else if (jitter < 0) {
                  baseC.lerp(new THREE.Color(0x000000), Math.abs(jitter));
                }

                let isBorder = false;
                const neighbors = [
                  { dx: 0, dy: -1, ox: 0, oz: -0.5, sx: 1.05, sz: 0.1 },
                  { dx: 0, dy: 1, ox: 0, oz: 0.5, sx: 1.05, sz: 0.1 },
                  { dx: -1, dy: 0, ox: -0.5, oz: 0, sx: 0.1, sz: 1.05 },
                  { dx: 1, dy: 0, ox: 0.5, oz: 0, sx: 0.1, sz: 1.05 },
                ];

                for (let n of neighbors) {
                  const nx = x + n.dx;
                  const ny = y + n.dy;
                  if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                    const nIdx = ny * mapW + nx;
                    if (prov[nIdx] !== pId && prov[nIdx] > 0) {
                      // Check if neighbor belongs to same faction
                      const nMeta = provinceRegistry[prov[nIdx]];
                      if (nMeta && nMeta.factionId === fId) {
                        isBorder = true;

                        // Add a glowing border instance exactly on the edge
                        if (
                          borderMeshRef.current &&
                          borderCount < mapW * mapH * 4
                        ) {
                          tempObject.position.set(
                            x - mapW / 2 + n.ox,
                            zPos / 2 + zPos / 2 + 0.05,
                            y - mapH / 2 + n.oz,
                          );
                          tempObject.scale.set(n.sx, 0.06, n.sz);
                          tempObject.updateMatrix();
                          borderMeshRef.current.setMatrixAt(
                            borderCount,
                            tempObject.matrix,
                          );

                          // Bright cyan/white neutral glow, less intense than before
                          tempColor.setHex(0x00ffff).multiplyScalar(2.0);
                          borderMeshRef.current.setColorAt(
                            borderCount,
                            tempColor,
                          );
                          borderCount++;
                        }
                      }
                    }
                  }
                }

                if (isBorder) {
                  baseC.lerp(new THREE.Color(0x000000), 0.2); // Slightly darken base tile
                }
                tempColor.copy(baseC);
              }
            }
          }
        }
        meshRef.current.setColorAt(i, tempColor);

        if (
          viewMode === "city" &&
          cityDensity === 9 &&
          beaconMeshRef.current &&
          beaconCount < mapW * mapH
        ) {
          const cityTop = zPos + Math.max(0.5, cityDensity * 0.4);
          const beaconHeight = 12;
          tempObject.position.set(
            x - mapW / 2,
            cityTop + beaconHeight / 2 + 0.1,
            y - mapH / 2,
          );
          tempObject.scale.set(0.16, beaconHeight, 0.16);
          tempObject.updateMatrix();
          beaconMeshRef.current.setMatrixAt(beaconCount, tempObject.matrix);
          tempColor.setHex(0x60a5fa).multiplyScalar(2.5);
          beaconMeshRef.current.setColorAt(beaconCount, tempColor);
          beaconCount++;
        }
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    if (borderMeshRef.current) {
      borderMeshRef.current.count = borderCount;
      borderMeshRef.current.instanceMatrix.needsUpdate = true;
      if (borderMeshRef.current.instanceColor) {
        borderMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    if (beaconMeshRef.current) {
      beaconMeshRef.current.count = beaconCount;
      beaconMeshRef.current.instanceMatrix.needsUpdate = true;
      if (beaconMeshRef.current.instanceColor) {
        beaconMeshRef.current.instanceColor.needsUpdate = true;
      }
    }

    // Explicitly notify the system that the heaviest work has finished
    if (finishGeneration) {
      requestAnimationFrame(() => {
        finishGeneration();
      });
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
    finishGeneration,
    showRivers,
    showResources,
    provinceSnapshots,
    provinceRegistry,
  ]);

  // Hover handler for mega-city tooltips
  const handlePointerMove = useCallback(
    (e) => {
      if (!megaCityRegistry || !onTileHover || !citySnapshots) return;
      e.stopPropagation();
      const instanceId = e.instanceId;
      if (instanceId === undefined) {
        onTileHover(null);
        return;
      }

      const city = citySnapshots[currentEpoch];
      if (!city || city[instanceId] === 0) {
        onTileHover(null);
        return;
      }

      const mcEntry = megaCityRegistry[instanceId];
      if (!mcEntry) {
        onTileHover(null);
        return;
      }

      // Check if this tile is still density 9 at the current epoch
      const density = city[instanceId] % 10;
      if (density < 9) {
        onTileHover(null);
        return;
      }

      // Project 3D position to screen coordinates
      const tileX = (instanceId % mapW) - mapW / 2;
      const tileZ = Math.floor(instanceId / mapW) - mapH / 2;
      const pos = new THREE.Vector3(tileX, 5, tileZ);
      pos.project(camera);

      const canvas = e.target?.domElement || e.nativeEvent?.target;
      const rect = canvas?.getBoundingClientRect?.();
      if (!rect) {
        onTileHover(null);
        return;
      }

      const screenX = ((pos.x + 1) / 2) * rect.width;
      const screenY = ((-pos.y + 1) / 2) * rect.height;

      onTileHover({
        name: mcEntry.name,
        factionId: mcEntry.factionId,
        density,
        screenX,
        screenY,
        tileIndex: instanceId,
      });
    },
    [megaCityRegistry, onTileHover, citySnapshots, currentEpoch, camera],
  );

  const handlePointerLeave = useCallback(() => {
    if (onTileHover) onTileHover(null);
  }, [onTileHover]);

  useEffect(() => {
    if (!onTileClick || !meshRef.current) return;
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const hit = raycaster.intersectObject(meshRef.current, false)[0];
      if (!hit || hit.instanceId === undefined) return;

      const tileData = buildTileData(hit.instanceId);
      if (tileData) onTileClick(tileData);
    };

    canvas.addEventListener("click", handleCanvasClick);
    return () => canvas.removeEventListener("click", handleCanvasClick);
  }, [gl, camera, onTileClick, buildTileData]);

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[null, null, mapW * mapH]}
        castShadow
        receiveShadow
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial />
      </instancedMesh>

      <instancedMesh ref={borderMeshRef} args={[null, null, mapW * mapH]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={beaconMeshRef} args={[null, null, mapW * mapH]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.7} />
      </instancedMesh>
    </group>
  );
}
