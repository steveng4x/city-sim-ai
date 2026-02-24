import { useState, useCallback, useEffect } from "react";
import { generateHeightMap, computeRivers } from "../lib/terrainUtils";
import { fetchOracleLore } from "../services/oracle";
import { mapW, mapH, maxEpochs } from "../lib/constants";

export function useSimulatorEngine(animRef, diffRef) {
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
  const [citySnapshots, setCitySnapshots] = useState([]);

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

      // Cancel any in-flight rAF animation so stale diffs don't bleed into the new world
      if (animRef?.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
        if (diffRef) diffRef.current = null;
      }

      // Run async to allow UI render
      setTimeout(() => {
        // 1. Terrain Physics
        const hMap = generateHeightMap(mapW, mapH, s, 5, 0.5);
        const rmask = computeRivers(hMap, mapW, mapH, sl, 10);

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
        // Grid Format: (FactionID * 10) + Density(1-9)
        let currentCity = new Uint8Array(mapW * mapH);
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
        });
        snaps.push(new Uint8Array(currentCity));

        // 4. Cellular Automata History Loop with Urban Clustering Logic
        for (let ep = 1; ep <= maxEpochs; ep++) {
          let nextCity = new Uint8Array(currentCity);

          for (let y = 0; y < mapH; y++) {
            for (let x = 0; x < mapW; x++) {
              let idx = y * mapW + x;
              let val = currentCity[idx];

              if (val > 0) {
                let tId = Math.floor(val / 10);
                let density = val % 10;
                let nSuit = suitMap[idx];

                // --- RULE 1: Carrying Capacity ---
                let maxCap = nSuit < 0.3 ? 2 : nSuit < 0.6 ? 5 : 9;

                // --- RULE 2: Trade Node Requirement ---
                if (density >= 6) {
                  let nearWater = false;
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
                    }
                  }
                  if (!nearWater) maxCap = Math.min(maxCap, 6);
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
                      if (
                        Math.random() < sprawlChance &&
                        nextCity[nIdx] === 0
                      ) {
                        nextCity[nIdx] = tId * 10 + 1; // Start as village
                      }
                    } else if (nVal > 0) {
                      let nTId = Math.floor(nVal / 10);
                      // Border Conflict
                      if (nTId !== tId) {
                        let nDensity = nVal % 10;
                        if (density > nDensity && Math.random() < 0.1) {
                          let degraded = nDensity - 2;
                          nextCity[nIdx] =
                            degraded <= 0 ? 0 : nTId * 10 + degraded;
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
                          nextCity[eIdx] = tId * 10 + 1;
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

                  if (growChance > 0 && nextCity[idx] === val) {
                    nextCity[idx] = tId * 10 + (density + 1);
                  }
                }
              }
            }
          }
          currentCity = nextCity;
          snaps.push(new Uint8Array(currentCity));
        }

        setHeightMap(hMap);
        setRivers(rmask);
        setSuitabilityMap(suitMap);
        setCitySnapshots(snaps);
        setCurrentEpoch(0);
        setIsGenerating(false);
      }, 10);
    },
    [seed, seaLevel, desiredFactions, animRef, diffRef],
  );

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
    citySnapshots,
    lore,
    isGeneratingLore,
    executeGeneration,
    dreamWorldWithAI,
  };
}
