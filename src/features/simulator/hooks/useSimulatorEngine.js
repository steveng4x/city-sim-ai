import { useState, useCallback, useEffect } from "react";
import { generateHeightMap, computeRivers } from "../lib/terrainUtils";
import { fetchOracleLore } from "@/services/oracle";
import { mapW, mapH, maxEpochs } from "@/features/simulator";

export function useSimulatorEngine() {
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000));
  const [seaLevel, setSeaLevel] = useState(0.38);
  const [desiredFactions, setDesiredFactions] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [viewMode, setViewMode] = useState("city");
  const [isGenerating, setIsGenerating] = useState(false);

  const [heightMap, setHeightMap] = useState(null);
  const [rivers, setRivers] = useState(null);
  const [suitabilityMap, setSuitabilityMap] = useState(null);
  const [resourceMap, setResourceMap] = useState(null);
  const [citySnapshots, setCitySnapshots] = useState([]);
  const [infrastructureSnapshots, setInfrastructureSnapshots] = useState([]);
  const [provinceSnapshots, setProvinceSnapshots] = useState([]);
  const [warEventSnapshots, setWarEventSnapshots] = useState([]);
  const [provinceRegistry, setProvinceRegistry] = useState({});

  const [lore, setLore] = useState(null);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);

  const executeGeneration = useCallback(
    (overrideSeed, overrideSea, overrideFactions) => {
      const s = overrideSeed !== undefined ? overrideSeed : seed;
      const sl = overrideSea !== undefined ? overrideSea : seaLevel;
      const fCount =
        overrideFactions !== undefined ? overrideFactions : desiredFactions;

      setIsGenerating(true);
      setPlaying(false);
      console.log("executeGeneration STARTED with", { s, sl, fCount });

      // Run async to allow UI render to paint the "Loading" state
      setTimeout(async () => {
        console.log("Inside setTimeout");
        // Yield an extra frame to ensure Framer Motion animation starts
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => setTimeout(resolve, 10));

        // 1. Terrain Physics
        console.log("Generating heightmap...");
        const hMap = generateHeightMap(mapW, mapH, s, 5, 0.5);
        const rmask = computeRivers(hMap, mapW, mapH, sl, 10);

        // 1b. Resources Map (0: none, 1: Forest, 2: Gold)
        const resMap = new Uint8Array(mapW * mapH);
        for (let idx = 0; idx < mapW * mapH; idx++) {
          if (hMap[idx] <= sl) continue; // No resources in ocean

          // Seed forests in standard land (not too close to sea, not too high)
          if (
            hMap[idx] > sl + 0.05 &&
            hMap[idx] < 0.65 &&
            Math.random() < 0.03
          ) {
            resMap[idx] = 1; // Forest
          }
          // Seed gold near mountains
          if (hMap[idx] > 0.6 && Math.random() < 0.02) {
            resMap[idx] = 2; // Gold
          }
        }

        // 2. Suitability & Carrying Capacity Analysis
        const suitMap = new Float32Array(mapW * mapH);
        const sortedCells = [];

        for (let y = 0; y < mapH; y++) {
          for (let x = 0; x < mapW; x++) {
            const idx = y * mapW + x;
            if (hMap[idx] <= sl) continue; // Ocean

            let score = 0.5;
            // Flatness bonus
            score += (1.0 - Math.abs(hMap[idx] - (sl + 0.1)) * 3) * 0.3;

            // Water adjacency bonus (Rivers are huge for cities)
            let waterBonus = 0;
            let nearWater = false;
            for (let dy = -3; dy <= 3; dy++) {
              for (let dx = -3; dx <= 3; dx++) {
                const nx = x + dx,
                  ny = y + dy;
                if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                  const nIdx = ny * mapW + nx;
                  const dist = Math.abs(dx) + Math.abs(dy);
                  if (rmask[nIdx]) {
                    waterBonus = Math.max(waterBonus, (4 - dist) * 0.25);
                    if (dist <= 1) nearWater = true;
                  } else if (hMap[nIdx] <= sl) {
                    waterBonus = Math.max(waterBonus, (4 - dist) * 0.15);
                    if (dist <= 1) nearWater = true;
                  }
                }
              }
            }
            score += waterBonus;

            // Resource adjacency bonus
            let resourceBonus = 0;
            for (let dy = -2; dy <= 2; dy++) {
              for (let dx = -2; dx <= 2; dx++) {
                const nx = x + dx,
                  ny = y + dy;
                if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                  const nIdx = ny * mapW + nx;
                  const dist = Math.abs(dx) + Math.abs(dy);
                  if (resMap[nIdx] === 1)
                    resourceBonus = Math.max(resourceBonus, (3 - dist) * 0.15); // Forest
                  if (resMap[nIdx] === 2)
                    resourceBonus = Math.max(resourceBonus, (3 - dist) * 0.25); // Gold
                }
              }
            }
            score += resourceBonus;

            score = Math.max(0.01, Math.min(1.0, score));
            suitMap[idx] = score;

            if (score > 0.3) sortedCells.push({ x, y, score });
          }
        }

        // 3. Faction Seeding (Random Scatter Strategy)
        sortedCells.sort((a, b) => b.score - a.score); // Best spots first
        let viableCells = sortedCells.filter((c) => c.score > 0.4);
        if (viableCells.length < fCount) viableCells = sortedCells; // Fallback

        let snaps = [];
        let infraSnaps = []; // Snapshots of Roads and Structures (0: None, 1: Road, 2: Wall)
        let provSnaps = [];
        let eventSnaps = []; // Array of arrays containing distinct events that happen each epoch
        let pRegistry = {}; // provinceId -> { factionId, centerTileIndex, foundedEpoch }
        let nextProvinceId = 1;

        // Grid Format: (FactionID * 10) + Density(1-9)
        let currentCity = new Uint8Array(mapW * mapH);
        let currentInfra = new Uint8Array(mapW * mapH);
        let currentProv = new Uint16Array(mapW * mapH);

        let seeds = [];
        let attempts = 0;
        let minDist = 40; // Keep capitals far apart

        while (seeds.length < fCount && attempts < 3000) {
          let cand =
            viableCells[Math.floor(Math.random() * viableCells.length)];

          if (
            cand &&
            !seeds.some((s) => Math.hypot(cand.x - s.x, cand.y - s.y) < minDist)
          ) {
            seeds.push(cand);
          }
          attempts++;
          if (attempts % 200 === 0 && minDist > 10) minDist -= 5;
        }

        seeds.forEach((s, i) => {
          // Capitals start strong (Level 5 City)
          currentCity[s.y * mapW + s.x] = (i + 1) * 10 + 5;
          // Capital gets a starting wall
          currentInfra[s.y * mapW + s.x] = 2;
        });
        snaps.push(new Uint8Array(currentCity));
        infraSnaps.push(new Uint8Array(currentInfra));
        provSnaps.push(new Uint16Array(currentProv));
        eventSnaps.push([]);

        // 4. Cellular Automata History Loop with Urban Clustering Logic
        console.log("Starting cellular automata loop...");
        for (let ep = 1; ep <= maxEpochs; ep++) {
          // Yield to browser every 20 epochs so the loading spinner stays animated
          if (ep % 20 === 0) {
            console.log("Yielding at epoch", ep);
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          let nextCity = new Uint8Array(currentCity);
          let nextInfra = new Uint8Array(currentInfra);
          let currentEpochEvents = [];

          for (let y = 0; y < mapH; y++) {
            for (let x = 0; x < mapW; x++) {
              let idx = y * mapW + x;
              let val = currentCity[idx];
              let infraVal = currentInfra[idx];

              if (val > 0) {
                let tId = Math.floor(val / 10);
                let density = val % 10;
                let nSuit = suitMap[idx];

                // --- RULE 1: Carrying Capacity ---
                let maxCap = nSuit < 0.3 ? 2 : nSuit < 0.6 ? 5 : 9;

                // --- RULE 2: Trade Node Requirement ---
                if (density >= 6) {
                  let nearWater = false;
                  let nearRoad = false;
                  const nbs = [
                    { dx: 0, dy: 1 },
                    { dx: 0, dy: -1 },
                    { dx: 1, dy: 0 },
                    { dx: -1, dy: 0 },
                  ];
                  for (let n of nbs) {
                    let nx = x + n.dx,
                      ny = y + n.dy;
                    if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                      let nIdx = ny * mapW + nx;
                      if (rmask[nIdx] || hMap[nIdx] <= sl) nearWater = true;
                      if (currentInfra[nIdx] === 1) nearRoad = true;
                    }
                  }
                  // Softened requirement: needs either water OR a road connection to grow huge
                  if (!nearWater && !nearRoad) maxCap = Math.min(maxCap, 6);
                }

                const neighbors = [
                  { dx: 0, dy: -1 },
                  { dx: 0, dy: 1 },
                  { dx: -1, dy: 0 },
                  { dx: 1, dy: 0 },
                  { dx: -1, dy: -1 },
                  { dx: 1, dy: 1 },
                  { dx: -1, dy: 1 },
                  { dx: 1, dy: -1 },
                ];

                // Action: Structure Spawning (Roads & Walls)
                if (density >= 4) {
                  let enemyBorder = false;

                  neighbors.forEach((n) => {
                    let nx = x + n.dx,
                      ny = y + n.dy;
                    if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                      let nIdx = ny * mapW + nx;
                      let nVal = currentCity[nIdx];

                      // Wall logic Check
                      if (nVal > 0 && Math.floor(nVal / 10) !== tId) {
                        enemyBorder = true;
                      }

                      // Road logic: try to build road towards resources or other ally high-density cities
                      if (
                        infraVal === 0 &&
                        hMap[nIdx] > sl &&
                        !rmask[nIdx] &&
                        currentInfra[nIdx] === 0
                      ) {
                        let nSuit = suitMap[nIdx];
                        let nTId = Math.floor(nVal / 10);
                        if (
                          (nVal > 0 && nTId === tId && nVal % 10 >= 3) ||
                          resMap[nIdx] > 0
                        ) {
                          if (Math.random() < 0.15) {
                            nextInfra[nIdx] = 1; // Build road
                          }
                        }
                      }
                    }
                  });

                  // Build wall if on enemy border and don't have one
                  if (enemyBorder && infraVal !== 2 && Math.random() < 0.1) {
                    nextInfra[idx] = 2; // Wall
                  }
                }

                // Action: Sprawl or Combat
                neighbors.forEach((n) => {
                  let nx = x + n.dx,
                    ny = y + n.dy;
                  if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                    let nIdx = ny * mapW + nx;
                    let nVal = currentCity[nIdx];
                    let neighborSuit = suitMap[nIdx];

                    if (nVal === 0 && neighborSuit > 0.1) {
                      // Sprawl Logic
                      let sprawlChance = 0.05 * (neighborSuit * 3);
                      // Extra chance to sprawl along roads
                      if (currentInfra[nIdx] === 1) sprawlChance *= 2;

                      if (
                        Math.random() < sprawlChance &&
                        nextCity[nIdx] === 0
                      ) {
                        nextCity[nIdx] = tId * 10 + 1; // Start as village
                        currentProv[nIdx] = currentProv[idx];
                      }
                    } else if (nVal > 0) {
                      let nTId = Math.floor(nVal / 10);
                      // Border Conflict
                      if (nTId !== tId) {
                        let nDensity = nVal % 10;
                        let defBonus = currentInfra[nIdx] === 2 ? 3 : 0; // Wall defense

                        if (
                          density > nDensity + defBonus &&
                          Math.random() < 0.1
                        ) {
                          let degraded = nDensity - 2;
                          // If taking over a walled city, the wall is destroyed
                          if (degraded <= 0) {
                            // MULTI-TILE CONQUEST: Deep Strike Mechanics
                            // Determine momentum based on attacker's density
                            let momentum = 1;
                            if (density >= 8) momentum = 3;
                            else if (density >= 6) momentum = 2;

                            // CRITICAL PUSH: Small chance for a massive breakthrough!
                            const isCritical = Math.random() < 0.35; // 35% chance
                            if (isCritical) {
                              momentum *= 8;
                              currentEpochEvents.push({
                                type: "CRITICAL_PUSH",
                                x: x + n.dx,
                                y: y + n.dy,
                              });
                            }

                            // Pierce along the attack vector
                            let cx = x + n.dx;
                            let cy = y + n.dy;

                            for (let step = 0; step < momentum; step++) {
                              if (
                                cx >= 0 &&
                                cx < mapW &&
                                cy >= 0 &&
                                cy < mapH
                              ) {
                                let cIdx = cy * mapW + cx;
                                let cVal = currentCity[cIdx];

                                // Only pierce into enemy territory or empty land, stop at water
                                if (
                                  hMap[cIdx] <= sl ||
                                  (cVal > 0 && Math.floor(cVal / 10) === tId)
                                ) {
                                  break; // Momentum halted by water or hitting own territory
                                }

                                // Helper to check and flip province capital or 50% loss
                                const processTileLoss = (
                                  targetIdx,
                                  targetFactionId,
                                ) => {
                                  let triggerFlip = false;
                                  let provinceToFlip = null;

                                  // 1. Check Capital Fall
                                  for (const [pIdStr, meta] of Object.entries(
                                    pRegistry,
                                  )) {
                                    if (
                                      meta.centerTileIndex === targetIdx &&
                                      meta.factionId === targetFactionId
                                    ) {
                                      triggerFlip = true;
                                      provinceToFlip = pIdStr;
                                      break;
                                    }
                                  }

                                  // 2. Check 50% Territory Loss
                                  if (!triggerFlip) {
                                    let pId = currentProv[targetIdx];
                                    if (
                                      pId > 0 &&
                                      pRegistry[pId] &&
                                      pRegistry[pId].factionId ===
                                        targetFactionId
                                    ) {
                                      pRegistry[pId].lostTilesCount =
                                        (pRegistry[pId].lostTilesCount || 0) +
                                        1;
                                      if (
                                        pRegistry[pId].baselineSize > 0 &&
                                        pRegistry[pId].lostTilesCount >=
                                          pRegistry[pId].baselineSize / 2
                                      ) {
                                        triggerFlip = true;
                                        provinceToFlip = pId;
                                      }
                                    }
                                  }

                                  // If province collapses, flip all its existing cities to the attacker
                                  if (triggerFlip && provinceToFlip) {
                                    pRegistry[provinceToFlip].factionId = tId;

                                    // Log the massive global event for the renderer
                                    currentEpochEvents.push({
                                      type: "PROVINCE_FALL",
                                      x: cx,
                                      y: cy,
                                      pId: provinceToFlip,
                                    });

                                    for (let i = 0; i < mapW * mapH; i++) {
                                      if (
                                        currentProv[i] == provinceToFlip &&
                                        nextCity[i] > 0
                                      ) {
                                        if (
                                          Math.floor(nextCity[i] / 10) ===
                                          targetFactionId
                                        ) {
                                          let tileDensity = nextCity[i] % 10;
                                          nextCity[i] = tId * 10 + tileDensity;
                                          nextInfra[i] = 0; // Structures are destroyed during mass surrender/collapse
                                        }
                                      }
                                    }
                                  }
                                };

                                // Attacker claims the tile (Density 1 village) to push the frontline!
                                nextCity[cIdx] = tId * 10 + 1;
                                nextInfra[cIdx] = 0;
                                currentProv[cIdx] = currentProv[idx]; // Keep province view synced

                                // If the tile was occupied by an enemy, check for collapse
                                if (cVal > 0) {
                                  let cTId = Math.floor(cVal / 10);
                                  if (cTId !== tId) processTileLoss(cIdx, cTId);
                                }

                                // Area of Impact (Splash)
                                const splashNeighbors = [
                                  { dx: 0, dy: -1 },
                                  { dx: 0, dy: 1 },
                                  { dx: -1, dy: 0 },
                                  { dx: 1, dy: 0 },
                                  { dx: -1, dy: -1 },
                                  { dx: 1, dy: 1 },
                                  { dx: -1, dy: 1 },
                                  { dx: 1, dy: -1 },
                                ];

                                splashNeighbors.forEach((sn) => {
                                  if (Math.random() < 0.4) {
                                    // 40% splash chance
                                    let sx = cx + sn.dx;
                                    let sy = cy + sn.dy;
                                    if (
                                      sx >= 0 &&
                                      sx < mapW &&
                                      sy >= 0 &&
                                      sy < mapH
                                    ) {
                                      let sIdx = sy * mapW + sx;
                                      let sVal = currentCity[sIdx];
                                      // Only splash enemy or neutral (not water, not own)
                                      if (
                                        hMap[sIdx] > sl &&
                                        (sVal === 0 ||
                                          Math.floor(sVal / 10) !== tId)
                                      ) {
                                        nextCity[sIdx] = tId * 10 + 1;
                                        nextInfra[sIdx] = 0;
                                        currentProv[sIdx] = currentProv[idx]; // Keep province view synced
                                        if (sVal > 0) {
                                          let sTId = Math.floor(sVal / 10);
                                          if (sTId !== tId)
                                            processTileLoss(sIdx, sTId);
                                        }
                                      }
                                    }
                                  }
                                });
                              }
                              // Advance the spearhead
                              cx += n.dx;
                              cy += n.dy;
                            }
                          } else {
                            nextCity[nIdx] = nTId * 10 + degraded;
                          }
                        }
                      }
                    }
                  }
                });

                // Seafaring Expeditions
                if (density >= 3 && Math.random() < 0.01) {
                  let waterNeighbors = neighbors.filter((n) => {
                    let nx = x + n.dx,
                      ny = y + n.dy;
                    return (
                      nx >= 0 &&
                      nx < mapW &&
                      ny >= 0 &&
                      ny < mapH &&
                      hMap[ny * mapW + nx] <= sl
                    );
                  });

                  if (waterNeighbors.length > 0) {
                    let dir =
                      waterNeighbors[
                        Math.floor(Math.random() * waterNeighbors.length)
                      ];
                    let ex = x,
                      ey = y;

                    for (let dist = 1; dist <= 50; dist++) {
                      ex += dir.dx;
                      ey += dir.dy;
                      if (ex < 0 || ex >= mapW || ey < 0 || ey >= mapH) break;
                      let eIdx = ey * mapW + ex;

                      if (hMap[eIdx] > sl && !rmask[eIdx]) {
                        if (
                          suitMap[eIdx] > 0 &&
                          currentCity[eIdx] === 0 &&
                          nextCity[eIdx] === 0
                        ) {
                          // Prevent landing adjacent to an enemy city
                          let safeToLand = true;
                          const landNeighbors = [
                            { dx: 0, dy: -1 },
                            { dx: 0, dy: 1 },
                            { dx: -1, dy: 0 },
                            { dx: 1, dy: 0 },
                            { dx: -1, dy: -1 },
                            { dx: 1, dy: 1 },
                            { dx: -1, dy: 1 },
                            { dx: 1, dy: -1 },
                          ];
                          for (let ln of landNeighbors) {
                            let lnx = ex + ln.dx,
                              lny = ey + ln.dy;
                            if (
                              lnx >= 0 &&
                              lnx < mapW &&
                              lny >= 0 &&
                              lny < mapH
                            ) {
                              let lnIdx = lny * mapW + lnx;
                              let lnVal = currentCity[lnIdx];
                              if (lnVal > 0 && Math.floor(lnVal / 10) !== tId) {
                                safeToLand = false;
                                break;
                              }
                            }
                          }

                          if (safeToLand) {
                            nextCity[eIdx] = tId * 10 + 1;
                            currentProv[eIdx] = currentProv[idx];
                          }
                        }
                        break;
                      }
                    }
                  }
                }

                // Action: Density Upgrade
                if (density < maxCap) {
                  let growChance = 0;

                  // --- RULE 3: Urban Gravity ---
                  let highestNeighborDensity = 0;
                  for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                      if (dx === 0 && dy === 0) continue;
                      let nx = x + dx,
                        ny = y + dy;
                      if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                        let nVal = currentCity[ny * mapW + nx];
                        if (nVal > 0) {
                          highestNeighborDensity = Math.max(
                            highestNeighborDensity,
                            nVal % 10,
                          );
                        }
                      }
                    }
                  }

                  if (density < 3) {
                    if (Math.random() < 0.05) growChance = 1;
                  } else if (density >= 3) {
                    if (highestNeighborDensity <= density) {
                      // --- RULE 4: Agglomeration Effect ---
                      let suburbCount = 0;
                      neighbors.forEach((n) => {
                        let nx = x + n.dx,
                          ny = y + n.dy;
                        if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                          let nVal = currentCity[ny * mapW + nx];
                          if (nVal > 0 && nVal % 10 < 4) suburbCount++;
                        }
                      });

                      if (Math.random() < 0.015 * suburbCount) {
                        growChance = 1;
                      }
                    }
                  }

                  // Quicker upgrades if near roads
                  if (
                    growChance === 0 &&
                    infraVal === 1 &&
                    Math.random() < 0.02
                  ) {
                    growChance = 1;
                  }

                  if (growChance > 0 && nextCity[idx] === val) {
                    nextCity[idx] = tId * 10 + (density + 1);
                  }
                }
              }
            }
          }

          // Province Calculation (Every 5 epochs)
          if (ep % 5 === 0) {
            let nextProv = new Uint16Array(mapW * mapH);
            let activeCenters = [];

            // 1 & 2. Identify centers and assign stable IDs
            for (let i = 0; i < mapW * mapH; i++) {
              if (nextCity[i] > 0) {
                let density = nextCity[i] % 10;
                let factionId = Math.floor(nextCity[i] / 10);

                if (density >= 5) {
                  // Find existing province ID for this center, or mint a new one
                  let pId = null;

                  // Phase 1: Does this exact tile already have a province?
                  for (const [idParam, metadata] of Object.entries(pRegistry)) {
                    if (
                      metadata.centerTileIndex === i &&
                      metadata.factionId === factionId
                    ) {
                      pId = parseInt(idParam);
                      break;
                    }
                  }

                  // Phase 2: If no exact match, should we merge into a nearby big capital?
                  if (pId === null) {
                    let cx = i % mapW;
                    let cy = Math.floor(i / mapW);
                    let foundNearby = false;

                    for (const [idParam, metadata] of Object.entries(
                      pRegistry,
                    )) {
                      if (metadata.factionId === factionId) {
                        let px = metadata.centerTileIndex % mapW;
                        let py = Math.floor(metadata.centerTileIndex / mapW);
                        let dist = Math.abs(cx - px) + Math.abs(cy - py);
                        if (dist <= 20) {
                          // Too close to an existing capital of the same faction, merge!
                          foundNearby = true;
                          break;
                        }
                      }
                    }

                    if (foundNearby) {
                      continue; // Skip adding this to activeCenters, let the nearby capital absorb it
                    }
                  }

                  if (pId === null) {
                    pId = nextProvinceId++;
                    pRegistry[pId] = {
                      id: pId,
                      factionId: factionId,
                      centerTileIndex: i,
                      foundedEpoch: ep,
                    };
                  }

                  activeCenters.push({
                    idx: i,
                    pId: pId,
                    factionId: factionId,
                    dist: 0,
                  });
                }
              }
            }

            // Tie-breaking: Sort queue so smaller IDs are processed first at the same distance
            activeCenters.sort((a, b) => a.pId - b.pId);

            // 3. Multi-source BFS
            let queue = activeCenters.slice();
            let distMap = new Uint16Array(mapW * mapH).fill(65535); // Max distance initially
            let provSizes = {}; // Track territory volume for 50% rule

            // Initialize queue and starting tiles
            queue.forEach((center) => {
              nextProv[center.idx] = center.pId;
              distMap[center.idx] = 0;
              provSizes[center.pId] = 1;
            });

            const bfsNeighbors = [
              { dx: 0, dy: -1 },
              { dx: 0, dy: 1 },
              { dx: -1, dy: 0 },
              { dx: 1, dy: 0 },
            ];

            let head = 0;
            let loopCounter = 0;
            while (head < queue.length) {
              loopCounter++;
              if (loopCounter > 500000) {
                console.error("BFS Infinite Loop Hit! Breaking.");
                break;
              }
              const current = queue[head++];
              const x = current.idx % mapW;
              const y = Math.floor(current.idx / mapW);
              const nDist = current.dist + 1;

              for (let n of bfsNeighbors) {
                const nx = x + n.dx;
                const ny = y + n.dy;

                if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                  const nIdx = ny * mapW + nx;
                  const nCity = nextCity[nIdx];
                  const nFactionId = Math.floor(nCity / 10);

                  // Only expand into valid tiles of the same faction
                  if (nCity > 0 && nFactionId === current.factionId) {
                    if (
                      nDist < distMap[nIdx] ||
                      (nDist === distMap[nIdx] && current.pId < nextProv[nIdx])
                    ) {
                      distMap[nIdx] = nDist;
                      nextProv[nIdx] = current.pId;
                      provSizes[current.pId] =
                        (provSizes[current.pId] || 0) + 1;
                      queue.push({
                        idx: nIdx,
                        pId: current.pId,
                        factionId: current.factionId,
                        dist: nDist,
                      });
                    }
                  }
                }
              }
            }
            currentProv = nextProv;

            // Record province baseline size for 50% capitulation mechanic
            for (const [pId, meta] of Object.entries(pRegistry)) {
              meta.baselineSize = provSizes[pId] || 0;
              meta.lostTilesCount = 0;
            }
          }

          currentCity = nextCity;
          currentInfra = nextInfra;
          snaps.push(new Uint8Array(currentCity));
          infraSnaps.push(new Uint8Array(currentInfra));
          provSnaps.push(new Uint16Array(currentProv)); // Province data will be updated correctly in next steps
          eventSnaps.push(currentEpochEvents);
        }

        setHeightMap(hMap);
        setRivers(rmask);
        setSuitabilityMap(suitMap);
        setResourceMap(resMap);
        setCitySnapshots(snaps);
        setInfrastructureSnapshots(infraSnaps);
        setProvinceSnapshots(provSnaps);
        setWarEventSnapshots(eventSnaps);
        setProvinceRegistry(pRegistry);
        setCurrentEpoch(0);
        console.log("ENGINE GENERATION COMPLETE!", {
          mapW,
          mapH,
          epochs: maxEpochs,
        });
        // Do NOT set isGenerating to false here.
        // InstancedMap will call finishGeneration when it actually renders.
      }, 10);
    },
    [seed, seaLevel, desiredFactions],
  );

  const finishGeneration = useCallback(() => {
    console.log("FINISH GENERATION CALLED FROM RENDERER!");
    setIsGenerating(false);
  }, []);

  // Initial Load
  useEffect(() => {
    executeGeneration();
  }, [executeGeneration]);

  const dreamWorldWithAI = async () => {
    setIsGeneratingLore(true);
    setLore(null);
    try {
      const data = await fetchOracleLore();
      setLore(data);

      const g = data.geography || {};
      const safeNum = (val, fallback) => {
        const num = Number(val);
        return isNaN(num) ? fallback : num;
      };

      const newSea =
        0.2 + (Math.max(1, Math.min(10, safeNum(g.waterAmount, 5))) / 10) * 0.4;
      const newSeed = Math.floor(Math.random() * 10000);

      setSeaLevel(newSea);
      setSeed(newSeed);
      executeGeneration(newSeed, newSea, safeNum(g.factions, 4));
    } catch (e) {
      console.log(
        "AI Dream failed (likely no key or rate limited), using fallback randomness.",
      );
      const rSeed = Math.floor(Math.random() * 10000);
      setSeed(rSeed);
      setLore({
        name: "Unknown Land",
        foundingMyth:
          "The ancient scrolls were lost to time, but the tribes grew nonetheless.",
        culture: "A harsh people born of random mathematical necessity.",
        notableEvent: "The Great API Disconnection.",
        error: "Oracle offline. Generating random world...",
      });
      executeGeneration(rSeed, seaLevel, desiredFactions);
    } finally {
      setIsGeneratingLore(false);
    }
  };

  return {
    seed,
    setSeed,
    seaLevel,
    setSeaLevel,
    desiredFactions,
    setDesiredFactions,
    playing,
    setPlaying,
    currentEpoch,
    setCurrentEpoch,
    viewMode,
    setViewMode,
    isGenerating,
    heightMap,
    rivers,
    suitabilityMap,
    resourceMap,
    citySnapshots,
    infrastructureSnapshots,
    provinceSnapshots,
    warEventSnapshots,
    provinceRegistry,
    lore,
    isGeneratingLore,
    executeGeneration,
    dreamWorldWithAI,
    finishGeneration,
  };
}
