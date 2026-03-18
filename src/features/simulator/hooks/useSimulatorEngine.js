import { useState, useCallback, useEffect, useRef } from "react";
import { generateHeightMap, computeRivers } from "../lib/terrainUtils";
import { computeOneEpoch } from "../lib/epochSimulator";
import { generateCityName } from "../lib/cityNames";
import { fetchOracleLore } from "@/services/oracle";
import {
  mapW,
  mapH,
  maxEpochs,
  BUFFER_THRESHOLD,
  LOOKAHEAD_SIZE,
  MAX_STORED_EPOCHS,
} from "@/features/simulator";

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

  // Mega-city registry: { tileIndex: { name, factionId, x, y, bornEpoch } }
  const [megaCityRegistry, setMegaCityRegistry] = useState({});

  const [lore, setLore] = useState(null);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);

  // Infinite mode state
  const [infiniteMode, setInfiniteMode] = useState(false);
  const [latestComputedEpoch, setLatestComputedEpoch] = useState(maxEpochs);
  const [isComputingAhead, setIsComputingAhead] = useState(false);

  // Refs for lookahead computation (persist across renders without triggering re-render)
  const simStateRef = useRef(null);
  const terrainRef = useRef(null);
  const cancelRef = useRef(false);
  const snapshotsRef = useRef({
    city: [],
    infra: [],
    province: [],
    events: [],
  });

  const executeGeneration = useCallback(
    (overrideSeed, overrideSea, overrideFactions) => {
      const s = overrideSeed !== undefined ? overrideSeed : seed;
      const sl = overrideSea !== undefined ? overrideSea : seaLevel;
      const fCount =
        overrideFactions !== undefined ? overrideFactions : desiredFactions;

      setIsGenerating(true);
      setPlaying(false);
      // Cancel any in-progress lookahead and reset infinite mode
      cancelRef.current = true;
      setInfiniteMode(false);
      setIsComputingAhead(false);
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
        const terrain = {
          heightMap: hMap,
          rivers: rmask,
          suitabilityMap: suitMap,
          resourceMap: resMap,
          seaLevel: sl,
          mapW,
          mapH,
        };
        let simState = {
          city: currentCity,
          infra: currentInfra,
          prov: currentProv,
          registry: pRegistry,
          nextProvinceId,
        };

        for (let ep = 1; ep <= maxEpochs; ep++) {
          if (ep % 20 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          const result = computeOneEpoch(simState, terrain, ep);
          simState = result;

          snaps.push(new Uint8Array(result.city));
          infraSnaps.push(new Uint8Array(result.infra));
          provSnaps.push(new Uint16Array(result.prov));
          eventSnaps.push(result.events);
        }

        pRegistry = simState.registry;

        // Build mega-city registry from events
        const mcRegistry = {};
        for (const epochEvents of eventSnaps) {
          for (const evt of epochEvents) {
            if (evt.type === "MEGACITY_BORN") {
              mcRegistry[evt.tileIndex] = {
                name: generateCityName(evt.tileIndex),
                factionId: evt.factionId,
                x: evt.x,
                y: evt.y,
                tileIndex: evt.tileIndex,
              };
            }
          }
        }

        // Store refs for infinite mode lookahead
        simStateRef.current = simState;
        terrainRef.current = terrain;
        snapshotsRef.current = {
          city: snaps,
          infra: infraSnaps,
          province: provSnaps,
          events: eventSnaps,
        };
        cancelRef.current = false;

        setHeightMap(hMap);
        setRivers(rmask);
        setSuitabilityMap(suitMap);
        setResourceMap(resMap);
        setCitySnapshots(snaps);
        setInfrastructureSnapshots(infraSnaps);
        setProvinceSnapshots(provSnaps);
        setWarEventSnapshots(eventSnaps);
        setProvinceRegistry(pRegistry);
        setMegaCityRegistry(mcRegistry);
        setCurrentEpoch(0);
        setLatestComputedEpoch(maxEpochs);
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

  // Compute additional epochs ahead in the background (non-blocking)
  const computeAhead = useCallback(
    async (count = LOOKAHEAD_SIZE) => {
      if (!simStateRef.current || !terrainRef.current || isComputingAhead)
        return;

      setIsComputingAhead(true);
      cancelRef.current = false;

      const terrain = terrainRef.current;
      let state = simStateRef.current;
      const snaps = snapshotsRef.current;
      const startEpoch = snaps.city.length; // next epoch to compute (0-indexed array length = next ep number)

      for (let i = 0; i < count; i++) {
        if (cancelRef.current) break;

        // Enforce MAX_STORED_EPOCHS
        if (snaps.city.length >= MAX_STORED_EPOCHS) break;

        const ep = startEpoch + i;
        const result = computeOneEpoch(state, terrain, ep);
        state = result;

        snaps.city.push(new Uint8Array(result.city));
        snaps.infra.push(new Uint8Array(result.infra));
        snaps.province.push(new Uint16Array(result.prov));
        snaps.events.push(result.events);

        // Yield to browser every 2 epochs to avoid jank
        if (i % 2 === 1) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      simStateRef.current = state;

      if (!cancelRef.current) {
        // Register any new mega-cities from computed events
        setMegaCityRegistry((prev) => {
          const updated = { ...prev };
          for (let i = 0; i < count; i++) {
            const evtIdx = snaps.events.length - count + i;
            if (evtIdx < 0 || evtIdx >= snaps.events.length) continue;
            for (const evt of snaps.events[evtIdx]) {
              if (evt.type === "MEGACITY_BORN" && !updated[evt.tileIndex]) {
                updated[evt.tileIndex] = {
                  name: generateCityName(evt.tileIndex),
                  factionId: evt.factionId,
                  x: evt.x,
                  y: evt.y,
                  tileIndex: evt.tileIndex,
                };
              }
            }
          }
          return updated;
        });

        // Update React state with new snapshots
        setCitySnapshots([...snaps.city]);
        setInfrastructureSnapshots([...snaps.infra]);
        setProvinceSnapshots([...snaps.province]);
        setWarEventSnapshots([...snaps.events]);
        setProvinceRegistry(state.registry);
        setLatestComputedEpoch(snaps.city.length - 1);
      }

      setIsComputingAhead(false);
    },
    [isComputingAhead],
  );

  // Activate infinite mode — called when user clicks "Continue Simulation"
  const continueSimulation = useCallback(() => {
    setInfiniteMode(true);
    // Immediately start computing ahead
    computeAhead();
  }, [computeAhead]);

  // Lookahead trigger: when approaching the edge of computed epochs
  useEffect(() => {
    if (
      infiniteMode &&
      !isComputingAhead &&
      currentEpoch >= latestComputedEpoch - BUFFER_THRESHOLD
    ) {
      computeAhead();
    }
  }, [
    infiniteMode,
    currentEpoch,
    latestComputedEpoch,
    isComputingAhead,
    computeAhead,
  ]);

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
    megaCityRegistry,
    lore,
    isGeneratingLore,
    executeGeneration,
    dreamWorldWithAI,
    finishGeneration,
    // Infinite mode
    infiniteMode,
    latestComputedEpoch,
    isComputingAhead,
    continueSimulation,
  };
}
