import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RefreshCw,
  Layers,
  Map as MapIcon,
  Building2,
  BookOpen,
  Sparkles,
  ScrollText,
  Settings2,
  ArrowLeft,
  Zap,
} from "lucide-react";

// ============================================================================
// --- UTILITY: SIMPLEX NOISE & MATH HELPERS ---
// ============================================================================
class SimplexNoise {
  constructor(seed = 0) {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) this.p[i] = i;
    let n = (seed || Math.random()) * 10000;
    for (let i = 255; i > 0; i--) {
      n = (n * 9301 + 49297) % 233280;
      const j = Math.floor((n / 233280) * (i + 1));
      const t = this.p[i];
      this.p[i] = this.p[j];
      this.p[j] = t;
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
  }
  dot(g, x, y) {
    return g[0] * x + g[1] * y;
  }
  noise2D(xin, yin) {
    const grad3 = [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    let n0 = 0,
      n1 = 0,
      n2 = 0;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.perm[ii + this.perm[jj]] % 8;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 8;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 8;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(grad3[gi0], x0, y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(grad3[gi1], x1, y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(grad3[gi2], x2, y2);
    }
    return 70 * (n0 + n1 + n2);
  }
}

function generateHeightMap(w, h, seed, octaves = 5, persistence = 0.5) {
  const sn = new SimplexNoise(seed);
  const map = new Float32Array(w * h);
  const lacunarity = 2.0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let amplitude = 1;
      let frequency = 1 / 64;
      let elevation = 0;
      for (let o = 0; o < octaves; o++) {
        const nx = x * frequency;
        const ny = y * frequency;
        elevation += sn.noise2D(nx, ny) * amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
      }
      elevation = (elevation + 1) / 2;
      map[y * w + x] = elevation;
    }
  }
  return map;
}

function computeRivers(heightMap, w, h, seaLevel, threshold = 12) {
  const flow = new Uint32Array(w * h);
  const rivers = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let idx = y * w + x;
      if (heightMap[idx] <= seaLevel) continue;
      let cx = x,
        cy = y;
      for (let steps = 0; steps < 300; steps++) {
        let bestH = heightMap[cy * w + cx];
        let bx = cx,
          by = cy;
        // Check 8 neighbors for lowest point
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = cx + dx,
              ny = cy + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nh = heightMap[ny * w + nx];
              if (nh < bestH) {
                bestH = nh;
                bx = nx;
                by = ny;
              }
            }
          }
        }
        if (bx === cx && by === cy) break; // Local minima

        const nIdx = by * w + bx;
        flow[nIdx]++;
        if (heightMap[nIdx] <= seaLevel) break; // Hit ocean
        cx = bx;
        cy = by;
      }
    }
  }

  for (let i = 0; i < w * h; i++) {
    if (flow[i] >= threshold) rivers[i] = 1;
  }
  return rivers;
}

// ============================================================================
// --- COMPONENT: LANDING PAGE ---
// ============================================================================
function LandingPage({ onLaunchSimulator }) {
  const features = [
    {
      title: "Expanded Density Scale",
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      desc: "Cities now evolve from rural villages (Lv 1) to sprawling suburbs (Lv 3-4) and dense megacities (Lv 9).",
    },
    {
      title: "Urban Gravity",
      icon: <Building2 className="w-5 h-5 text-purple-400" />,
      desc: "The 'Highlander' rule: New cities suppress the growth of immediate neighbors, forcing organic spacing.",
    },
    {
      title: "Agglomeration",
      icon: <Layers className="w-5 h-5 text-green-400" />,
      desc: "Rich get richer: Core cities grow exponentially faster when surrounded and fed by rural suburbs.",
    },
    {
      title: "Trade Nodes",
      icon: <MapIcon className="w-5 h-5 text-blue-400" />,
      desc: "Megacities (Lv 7+) only form at strategic locations adjacent to rivers or oceans, mimicking historical trade routes.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
            CitySim<span className="text-indigo-400">.AI</span>
          </div>
          <button
            onClick={onLaunchSimulator}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Play size={16} fill="currentColor" /> Launch Simulation
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-8">
            v2.5 • Urban Clustering Engine Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Procedural History <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Written in Code
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A physics-based civilization simulator. Watch as tribes settle
            fertile lands, form distinct urban clusters, wage border wars, and
            evolve into trade empires based on realistic geographical
            constraints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-slate-800/50 border border-slate-700 p-5 rounded-xl hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2 font-bold text-white">
                  {f.icon} {f.title}
                </div>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Background FX */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/50 to-slate-900 pointer-events-none"></div>
      </main>
    </div>
  );
}

// ============================================================================
// --- COMPONENT: SIMULATOR ENGINE ---
// ============================================================================
function SimulatorApp({ onBackToDocs }) {
  const canvasRef = useRef(null);
  const miniRef = useRef(null);

  // -- Constants & State --
  const mapW = 160;
  const mapH = 100;
  const tileSize = 6;
  const maxEpochs = 80;
  const factionColors = useMemo(
    () => ["#ef4444", "#3b82f6", "#10b981", "#a855f7", "#f59e0b"],
    [],
  );

  // UI State
  const [seed, setSeed] = useState(Math.floor(Math.random() * 10000));
  const [seaLevel, setSeaLevel] = useState(0.38);
  const [desiredFactions, setDesiredFactions] = useState(4);
  const [playing, setPlaying] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [viewMode, setViewMode] = useState("city");
  const [isGenerating, setIsGenerating] = useState(false);

  // Data State
  const [heightMap, setHeightMap] = useState(null);
  const [rivers, setRivers] = useState(null);
  const [suitabilityMap, setSuitabilityMap] = useState(null);
  const [citySnapshots, setCitySnapshots] = useState([]);

  // AI Lore
  const [lore, setLore] = useState(null);
  const [isGeneratingLore, setIsGeneratingLore] = useState(false);

  // --- CORE ENGINE: EXECUTE GENERATION ---
  const executeGeneration = useCallback(
    (overrideSeed, overrideSea, overrideFactions) => {
      const s = overrideSeed !== undefined ? overrideSeed : seed;
      const sl = overrideSea !== undefined ? overrideSea : seaLevel;
      const fCount =
        overrideFactions !== undefined ? overrideFactions : desiredFactions;

      setIsGenerating(true);
      setPlaying(false);

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
          // ISSUE #1 FIX: Pick completely randomly from all viable (good) cells,
          // rather than restricting to just the top 50, to ensure spread across the whole map.
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
                // Suitability dictates max possible density
                let maxCap = nSuit < 0.3 ? 2 : nSuit < 0.6 ? 5 : 9;

                // --- RULE 2: Trade Node Requirement ---
                // To grow beyond Level 6, MUST be adjacent to water
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

                // Neighborhood analysis for sprawling and combat
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
                      // Sprawl Logic: Rural expansion into empty tiles
                      let sprawlChance = 0.05 * (neighborSuit * 3);
                      if (
                        Math.random() < sprawlChance &&
                        nextCity[nIdx] === 0
                      ) {
                        nextCity[nIdx] = tId * 10 + 1; // Start as village (Lv 1)
                      }
                    } else if (nVal > 0) {
                      let nTId = Math.floor(nVal / 10);
                      // Border Conflict
                      if (nTId !== tId) {
                        // Higher density wins
                        let nDensity = nVal % 10;
                        if (density > nDensity && Math.random() < 0.1) {
                          // Crush enemy: downgrade them
                          let degraded = nDensity - 2;
                          nextCity[nIdx] =
                            degraded <= 0 ? 0 : nTId * 10 + degraded;
                        }
                      }
                    }
                  }
                });

                // ISSUE #2 FIX: Seafaring Expeditions (Naval Colonization)
                if (density >= 3 && Math.random() < 0.01) {
                  // Lowered requirement to Suburb, increased chance
                  // Find ONLY neighbors that are water to ensure we sail out to sea
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
                    // Cast off in the direction of the water
                    let dir =
                      waterNeighbors[
                        Math.floor(Math.random() * waterNeighbors.length)
                      ];
                    let ex = x,
                      ey = y;

                    for (let dist = 1; dist <= 50; dist++) {
                      // Extended distance so they cross oceans
                      ex += dir.dx;
                      ey += dir.dy;
                      if (ex < 0 || ex >= mapW || ey < 0 || ey >= mapH) break; // Off map
                      let eIdx = ey * mapW + ex;

                      // Check if we hit land
                      if (hMap[eIdx] > sl && !rmask[eIdx]) {
                        // If the land is suitable and empty, establish colony!
                        if (
                          suitMap[eIdx] > 0 &&
                          currentCity[eIdx] === 0 &&
                          nextCity[eIdx] === 0
                        ) {
                          nextCity[eIdx] = tId * 10 + 1; // Beachhead established
                        }
                        break; // Stop sailing once land is hit
                      }
                    }
                  }
                }

                // Action: Density Upgrade (Vertical Growth)
                if (density < maxCap) {
                  let growChance = 0;

                  // --- RULE 3: Urban Gravity (The Highlander Rule) ---
                  // Find the highest density in a 2-tile radius
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
                    // Rural areas grow randomly up to suburb based on land quality
                    if (Math.random() < 0.05) growChance = 1;
                  } else if (density >= 3) {
                    // To grow from a Suburb into a City (or higher), you must not be
                    // suppressed by an even bigger city nearby.
                    if (highestNeighborDensity <= density) {
                      // --- RULE 4: Agglomeration Effect ---
                      // Grow faster if surrounded by rural/suburb tiles feeding the core
                      let suburbCount = 0;
                      neighbors.forEach((n) => {
                        let nx = x + n.dx,
                          ny = y + n.dy;
                        if (nx >= 0 && nx < mapW && ny >= 0 && ny < mapH) {
                          let nVal = currentCity[ny * mapW + nx];
                          if (nVal > 0 && nVal % 10 < 4) suburbCount++;
                        }
                      });

                      // Exponentially higher chance to grow if heavily supported
                      if (Math.random() < 0.015 * suburbCount) {
                        growChance = 1;
                      }
                    }
                  }

                  // Apply vertical growth
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

        // Finalize state
        setHeightMap(hMap);
        setRivers(rmask);
        setSuitabilityMap(suitMap);
        setCitySnapshots(snaps);
        setCurrentEpoch(0);
        setIsGenerating(false);
      }, 10);
    },
    [seed, seaLevel, desiredFactions],
  );

  // Initial Load
  useEffect(() => {
    executeGeneration();
  }, [executeGeneration]);

  // --- AI INTEGRATION ---
  const dreamWorldWithAI = async () => {
    setIsGeneratingLore(true);
    setLore(null);
    try {
      const apiKey = ""; // Provide a valid key

      const prompt = `You are a fantasy historian. Create lore for a procedural world.
      Respond strictly in JSON: { "name": "string", "foundingMyth": "string", "culture": "string", "notableEvent": "string", "geography": { "waterAmount": 1-10, "roughness": 1-10, "factions": 2-5 } }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      if (!response.ok) throw new Error("API Error");
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      const data = JSON.parse(
        text
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim(),
      );
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
        "AI Dream failed (likely no key), using fallback randomness.",
      );
      const rSeed = Math.floor(Math.random() * 10000);
      setSeed(rSeed);
      // Fallback Lore Object so UI still displays properly
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

  // --- RENDERERS ---
  const hexToRgba = (hex, a) => {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const drawMain = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs || !heightMap) return;
    const ctx = cvs.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = mapW * tileSize;
    const height = mapH * tileSize;
    cvs.width = width * dpr;
    cvs.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Terrain
    for (let y = 0; y < mapH; y++) {
      for (let x = 0; x < mapW; x++) {
        const i = y * mapW + x;
        const elev = heightMap[i];

        if (viewMode === "heatmap") {
          if (elev <= seaLevel) ctx.fillStyle = "#0f172a";
          else {
            const s = suitabilityMap ? suitabilityMap[i] : 0;
            const r = Math.floor(s * 255);
            ctx.fillStyle = `rgb(${r}, ${Math.floor(r * 0.8)}, 50)`;
          }
        } else {
          if (elev <= seaLevel) ctx.fillStyle = "#1e3a8a";
          else if (elev <= seaLevel + 0.02) ctx.fillStyle = "#3b82f6";
          else if (elev <= seaLevel + 0.05) ctx.fillStyle = "#fde047";
          else if (elev > 0.85) ctx.fillStyle = "#f1f5f9";
          else if (elev > 0.7) ctx.fillStyle = "#64748b";
          else ctx.fillStyle = "#166534";
        }
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // 2. Draw Rivers
    if (rivers && viewMode !== "heatmap") {
      ctx.fillStyle = "#60a5fa";
      for (let i = 0; i < rivers.length; i++) {
        if (rivers[i]) {
          const x = i % mapW;
          const y = Math.floor(i / mapW);
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    // 3. Draw Cities (The New Logic Visualizer)
    // ISSUE #3 FIX: Only render CA Blocks if specifically in "City" viewMode. Hides in Terrain view.
    if (viewMode === "city" && citySnapshots[currentEpoch]) {
      const city = citySnapshots[currentEpoch];

      // Darken terrain for pop to stand out
      ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < city.length; i++) {
        const val = city[i];
        if (val > 0) {
          const x = i % mapW;
          const y = Math.floor(i / mapW);

          const tId = Math.floor(val / 10);
          const density = val % 10;
          const color = factionColors[(tId - 1) % factionColors.length];

          // Density Visualization Scale
          let alpha = 0.25; // Rural (1-2)
          if (density >= 3) alpha = 0.6; // Suburb (3-4)
          if (density >= 5) alpha = 0.95; // City (5-6)
          if (density >= 7) alpha = 1.0; // Megacity (7-9)

          ctx.fillStyle = hexToRgba(color, alpha);
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

          // Render Core for Megacities
          if (density >= 7) {
            ctx.fillStyle = "#ffffff";
            const center = tileSize / 2;
            const size = density === 9 ? 4 : 2; // Size 4 for absolute max, 2 for normal megacity
            ctx.fillRect(
              x * tileSize + center - size / 2,
              y * tileSize + center - size / 2,
              size,
              size,
            );
          }
        }
      }
    }
  }, [
    heightMap,
    rivers,
    citySnapshots,
    currentEpoch,
    viewMode,
    seaLevel,
    suitabilityMap,
    factionColors,
  ]);

  // Handle Minimap
  const drawMini = useCallback(() => {
    const cvs = miniRef.current;
    if (!cvs || !heightMap) return;
    const ctx = cvs.getContext("2d");
    cvs.width = mapW;
    cvs.height = mapH;
    const imgData = ctx.createImageData(mapW, mapH);
    const city = citySnapshots[currentEpoch];

    for (let i = 0; i < heightMap.length; i++) {
      const idx = i * 4;
      // ISSUE #3 FIX: Hide factions on minimap unless in 'city' mode
      if (viewMode === "city" && city && city[i] > 0) {
        const tId = Math.floor(city[i] / 10);
        const c = factionColors[(tId - 1) % factionColors.length];
        const rgb = parseInt(c.slice(1), 16);
        imgData.data[idx] = (rgb >> 16) & 255;
        imgData.data[idx + 1] = (rgb >> 8) & 255;
        imgData.data[idx + 2] = rgb & 255;
        imgData.data[idx + 3] = 255;
      } else if (heightMap[i] <= seaLevel) {
        imgData.data[idx] = 30;
        imgData.data[idx + 1] = 58;
        imgData.data[idx + 2] = 138;
        imgData.data[idx + 3] = 255;
      } else {
        imgData.data[idx] = 40;
        imgData.data[idx + 1] = 100;
        imgData.data[idx + 2] = 60;
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }, [
    heightMap,
    citySnapshots,
    currentEpoch,
    seaLevel,
    factionColors,
    viewMode,
  ]);

  // Loops
  useEffect(() => {
    drawMain();
    drawMini();
  }, [drawMain, drawMini]);

  useEffect(() => {
    let interval;
    if (playing && currentEpoch < maxEpochs) {
      interval = setInterval(
        () =>
          setCurrentEpoch((prev) =>
            prev >= maxEpochs ? (setPlaying(false), maxEpochs) : prev + 1,
          ),
        100,
      );
    } else if (currentEpoch >= maxEpochs) setPlaying(false);
    return () => clearInterval(interval);
  }, [playing, currentEpoch]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToDocs}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="text-indigo-500 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">
              CitySim Engine{" "}
              <span className="text-slate-600 text-sm font-normal ml-2">
                v2.5 Clustering
              </span>
            </h1>
          </div>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg">
          {["terrain", "heatmap", "city"].map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${viewMode === m ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR CONTROLS */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto z-10">
          {/* AI Section */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 p-4 rounded-xl border border-indigo-500/20 shadow-sm">
            <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles size={14} /> Oracle
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ask the AI to dream a world history and geography.
            </p>
            <button
              onClick={dreamWorldWithAI}
              disabled={isGenerating || isGeneratingLore}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isGeneratingLore ? (
                <RefreshCw className="animate-spin w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}{" "}
              Dream World
            </button>
          </div>

          {/* ISSUE #4 FIX: Restored full display for all requested lore fields */}
          {lore && !isGeneratingLore && (
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-700 pb-2">
                <ScrollText size={16} />
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  World Archives
                </h2>
              </div>
              <h3 className="text-lg font-black text-indigo-300 leading-tight">
                {lore.name || "Unknown Land"}
              </h3>

              {lore.foundingMyth && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Founding Myth
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{lore.foundingMyth}"
                  </p>
                </div>
              )}
              {lore.culture && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Culture
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lore.culture}
                  </p>
                </div>
              )}
              {lore.notableEvent && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Notable Event
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lore.notableEvent}
                  </p>
                </div>
              )}
              {lore.error && (
                <div className="text-red-400 text-xs mt-2 border-t border-red-900/50 pt-2">
                  {lore.error}
                </div>
              )}
            </div>
          )}

          <hr className="border-slate-800" />

          {/* Manual Controls */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Settings2 size={14} /> Parameters
              </h2>
              {isGenerating && (
                <RefreshCw size={14} className="animate-spin text-indigo-400" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Sea Level</span>{" "}
                <span className="text-white">
                  {Math.round(seaLevel * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.6"
                step="0.01"
                value={seaLevel}
                onChange={(e) => setSeaLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Factions</span>{" "}
                <span className="text-white">{desiredFactions}</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={desiredFactions}
                onChange={(e) => setDesiredFactions(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  executeGeneration(seed, seaLevel, desiredFactions)
                }
                disabled={isGenerating}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300"
              >
                Rebuild
              </button>
              <button
                onClick={() => {
                  const ns = Math.floor(Math.random() * 10000);
                  setSeed(ns);
                  executeGeneration(ns, seaLevel, desiredFactions);
                }}
                disabled={isGenerating}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300"
              >
                Reroll
              </button>
            </div>
          </div>

          <div className="mt-auto bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-widest mb-3">
              Density Legend
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-indigo-500/25"></div>{" "}
              <span className="text-slate-400">Rural (1-2)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-indigo-500/60"></div>{" "}
              <span className="text-slate-400">Suburb (3-4)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-indigo-500"></div>{" "}
              <span className="text-slate-400">City (5-6)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded bg-indigo-500 flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>{" "}
              <span className="text-slate-400">Megacity (7-9)</span>
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS AREA */}
        <main className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
          <div className="flex-1 relative flex items-center justify-center p-8">
            <div className="relative shadow-2xl shadow-black rounded-lg overflow-hidden border border-slate-800 bg-black">
              <canvas
                ref={canvasRef}
                className="block cursor-crosshair"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  aspectRatio: `${mapW}/${mapH}`,
                }}
              />

              {/* Info Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                  <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                  <div className="text-indigo-200 font-medium animate-pulse">
                    Simulating History...
                  </div>
                </div>
              )}

              {/* Minimap */}
              <div className="absolute bottom-4 right-4 border border-slate-600/50 rounded shadow-lg overflow-hidden hidden lg:block hover:scale-110 transition-transform origin-bottom-right">
                <canvas
                  ref={miniRef}
                  className="block w-40 h-auto bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* TIMELINE PLAYER */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 shrink-0 z-20">
            <div className="max-w-4xl mx-auto flex items-center gap-6">
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    setPlaying(false);
                    setCurrentEpoch(0);
                  }}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={() => setPlaying(!playing)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 transition-all"
                >
                  {playing ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setPlaying(false);
                    setCurrentEpoch(maxEpochs);
                  }}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <SkipForward size={20} />
                </button>
              </div>

              <div className="flex-1 relative group">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Year 0</span>
                  <span className="text-indigo-400">Epoch {currentEpoch}</span>
                  <span>Year {maxEpochs * 10}</span>
                </div>
                <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-100 ease-linear"
                    style={{ width: `${(currentEpoch / maxEpochs) * 100}%` }}
                  ></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxEpochs}
                  value={currentEpoch}
                  onChange={(e) => {
                    setPlaying(false);
                    setCurrentEpoch(Number(e.target.value));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// --- MAIN ENTRY ---
// ============================================================================
export default function App() {
  const [view, setView] = useState("landing");
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
        .chart-container { position: relative; width: 100%; max-width: 600px; margin-left: auto; margin-right: auto; height: 300px; max-height: 400px; }
        @media (min-width: 768px) { .chart-container { height: 350px; } }
      `}</style>
      {view === "landing" ? (
        <LandingPage onLaunchSimulator={() => setView("sim")} />
      ) : (
        <SimulatorApp onBackToDocs={() => setView("landing")} />
      )}
    </>
  );
}
