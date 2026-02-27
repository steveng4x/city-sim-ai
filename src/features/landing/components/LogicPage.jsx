import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MagicBentoProvider, MagicCard } from "./MagicBento";

const COLORS = {
  bg: "#020617", // slate-950
  panel: "rgba(15, 23, 42, 0.6)", // slate-900/60
  border: "#1e293b", // slate-800
  borderBright: "#334155", // slate-700
  accent: "#6366f1", // indigo-500
  accentDim: "rgba(99, 102, 241, 0.2)", // indigo-500/20
  green: "#22c55e", // green-500 / but let's map loosely to cyan-400 for theme
  greenDim: "rgba(34, 197, 94, 0.2)",
  orange: "#f59e0b", // amber-500
  orangeDim: "rgba(245, 158, 11, 0.2)",
  purple: "#8b5cf6", // violet-500
  purpleDim: "rgba(139, 92, 246, 0.2)",
  red: "#f43f5e", // rose-500 / matching landing a bit more closely
  redDim: "rgba(244, 63, 94, 0.2)",
  text: "#e2e8f0", // slate-200
  textDim: "#94a3b8", // slate-400
  textBright: "#ffffff", // white
  yellow: "#fbbf24", // amber-400
  yellowDim: "rgba(251, 191, 36, 0.2)",
};

const style = {
  fontMono:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  fontDisplay:
    "ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
};

function Tag({ children, color = COLORS.accent, bg }) {
  return (
    <span
      style={{
        fontFamily: style.fontMono,
        fontSize: "10px",
        padding: "2px 7px",
        borderRadius: "3px",
        color,
        background: bg || color + "22",
        border: `1px solid ${color}44`,
        letterSpacing: "0.08em",
        fontWeight: 700,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: style.fontMono,
        fontSize: "9px",
        color: COLORS.textDim,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <div
        style={{ width: "20px", height: "1px", background: COLORS.border }}
      />
      {children}
      <div style={{ flex: 1, height: "1px", background: COLORS.border }} />
    </div>
  );
}

function Card({
  title,
  tag,
  tagColor,
  tagBg,
  children,
  accent = COLORS.accent,
  glow = false,
}) {
  return (
    <MagicCard
      glowColor={accent}
      enableStars={true}
      enableTilt={false}
      enableBorderGlow={true}
      particleCount={8}
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderTop: `2px solid ${accent}`,
        borderRadius: "16px",
        padding: "24px",
        backdropFilter: "blur(4px)",
        boxShadow: glow ? `0 0 20px ${accent}18` : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontFamily: style.fontMono,
            fontSize: "11px",
            color: COLORS.textBright,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </span>
        {tag && (
          <Tag color={tagColor || accent} bg={tagBg}>
            {tag}
          </Tag>
        )}
      </div>
      {children}
    </MagicCard>
  );
}

function Row({ label, value, color = COLORS.text }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "6px",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontFamily: style.fontMono,
          fontSize: "10px",
          color: COLORS.textDim,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: style.fontMono,
          fontSize: "10px",
          color,
          textAlign: "right",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Arrow({ label, color = COLORS.textDim }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        margin: "4px 0",
      }}
    >
      <div style={{ width: "1px", height: "16px", background: color + "66" }} />
      <svg width="8" height="6" viewBox="0 0 8 6">
        <path d="M4 6L0 0h8z" fill={color + "88"} />
      </svg>
      {label && (
        <span
          style={{
            fontFamily: style.fontMono,
            fontSize: "9px",
            color: COLORS.textDim,
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function HArrow({ color = COLORS.textDim }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "0 4px",
      }}
    >
      <div style={{ width: "16px", height: "1px", background: color + "66" }} />
      <svg width="6" height="8" viewBox="0 0 6 8">
        <path d="M6 4L0 0v8z" fill={color + "88"} />
      </svg>
    </div>
  );
}

function StepBadge({ n, color }) {
  return (
    <div
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: color + "22",
        border: `1px solid ${color}66`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: style.fontMono,
        fontSize: "10px",
        color,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {n}
    </div>
  );
}

function BFSStep({ n, title, detail, color }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <StepBadge n={n} color={color} />
      <div>
        <div
          style={{
            fontFamily: style.fontMono,
            fontSize: "11px",
            color: COLORS.textBright,
            marginBottom: "2px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: style.fontMono,
            fontSize: "10px",
            color: COLORS.textDim,
            lineHeight: 1.6,
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

function TileGrid() {
  const size = 9;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, []);

  // Province A center at (4,4), Province B center at (1,1)
  const centerA = [4, 4];
  const centerB = [1, 1];

  const phase = tick % 5;

  const dist = (r, c, cr, cc) => Math.abs(r - cr) + Math.abs(c - cc);

  const getTileState = (r, c) => {
    const dA = dist(r, c, centerA[0], centerA[1]);
    const dB = dist(r, c, centerB[0], centerB[1]);

    if (r === centerA[0] && c === centerA[1]) return { type: "centerA", d: 0 };
    if (r === centerB[0] && c === centerB[1]) return { type: "centerB", d: 0 };

    const maxReach = phase + 1;
    const claimedA = dA <= maxReach;
    const claimedB = dB <= maxReach;

    if (claimedA && claimedB)
      return dA <= dB ? { type: "A", d: dA } : { type: "B", d: dB };
    if (claimedA) return { type: "A", d: dA };
    if (claimedB) return { type: "B", d: dB };
    return { type: "empty", d: 99 };
  };

  const isBorder = (r, c, state) => {
    if (
      state.type === "empty" ||
      state.type === "centerA" ||
      state.type === "centerB"
    )
      return false;
    const neighbors = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    return neighbors.some(([nr, nc]) => {
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) return false;
      const ns = getTileState(nr, nc);
      return (ns.type === "A" || ns.type === "B") && ns.type !== state.type;
    });
  };

  return (
    <div style={{ display: "inline-block" }}>
      {Array.from({ length: size }).map((_, r) => (
        <div key={r} style={{ display: "flex" }}>
          {Array.from({ length: size }).map((_, c) => {
            const state = getTileState(r, c);
            const border = isBorder(r, c, state);

            let bg = COLORS.bg;
            let borderColor = COLORS.border;

            if (state.type === "centerA") {
              bg = COLORS.accent;
              borderColor = COLORS.accent;
            } else if (state.type === "centerB") {
              bg = COLORS.green;
              borderColor = COLORS.green;
            } else if (state.type === "A") {
              bg = COLORS.accentDim;
              borderColor = border ? COLORS.bg : COLORS.border;
            } else if (state.type === "B") {
              bg = COLORS.greenDim;
              borderColor = border ? COLORS.bg : COLORS.border;
            }

            return (
              <div
                key={c}
                style={{
                  width: "16px",
                  height: "16px",
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  outline: border ? `1px solid ${COLORS.bg}` : "none",
                  transition: "background 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {(state.type === "centerA" || state.type === "centerB") && (
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "#fff",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{ width: "8px", height: "8px", background: COLORS.accent }}
          />
          <span
            style={{
              fontFamily: style.fontMono,
              fontSize: "9px",
              color: COLORS.textDim,
            }}
          >
            Province A
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <div
            style={{ width: "8px", height: "8px", background: COLORS.green }}
          />
          <span
            style={{
              fontFamily: style.fontMono,
              fontSize: "9px",
              color: COLORS.textDim,
            }}
          >
            Province B
          </span>
        </div>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";

export default function ProvinceSystemDiagram() {
  const navigate = useNavigate();
  // Cascading Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        background: COLORS.bg,
        minHeight: "100vh",
        padding: "32px 24px",
        fontFamily: style.fontMono,
        color: COLORS.text,
      }}
    >
      <MagicBentoProvider
        spotlightColor={COLORS.accent}
        className="w-full h-full"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          style={{ maxWidth: "960px", margin: "0 auto 32px" }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              marginBottom: "24px",
              background: COLORS.panel,
              color: COLORS.textBright,
              border: `1px solid ${COLORS.border}`,
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: style.fontMono,
              fontSize: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            &larr; Back to Landing
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "14px",
              marginBottom: "6px",
            }}
          >
            <h1
              style={{
                fontFamily: style.fontDisplay,
                fontSize: "28px",
                color: COLORS.textBright,
                margin: 0,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Province Generation System
            </h1>
            <Tag color={COLORS.yellow}>Architecture Overview</Tag>
          </div>
          <p
            style={{
              fontFamily: style.fontDisplay,
              fontSize: "14px",
              color: COLORS.textDim,
              margin: 0,
              letterSpacing: "0.01em",
              lineHeight: 1.6,
            }}
          >
            World Generation Simulator · Dynamic Administrative Divisions ·
            Multi-Source BFS + Voronoi Hybrid
          </p>
        </motion.div>

        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Row 1: Data Flow */}
          <motion.div variants={itemVariants}>
            <SectionLabel>01 · Data Layer</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
              }}
            >
              <Card
                title="citySnapshots"
                tag="existing"
                tagColor={COLORS.textDim}
                accent={COLORS.textDim}
              >
                <Row label="type" value="Uint8Array[]" />
                <Row
                  label="cell value"
                  value="factionId * 10 + density"
                  color={COLORS.yellow}
                />
                <Row label="per epoch" value="1 array snapshot" />
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    background: "#ffffff06",
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: COLORS.textDim,
                      marginBottom: "4px",
                    }}
                  >
                    Decode
                  </div>
                  <div style={{ fontSize: "10px", color: COLORS.text }}>
                    factionId ={" "}
                    <span style={{ color: COLORS.yellow }}>val / 10 | 0</span>
                  </div>
                  <div style={{ fontSize: "10px", color: COLORS.text }}>
                    density ={" "}
                    <span style={{ color: COLORS.yellow }}>val % 10</span>
                  </div>
                </div>
              </Card>

              <Card
                title="provinceSnapshots"
                tag="new"
                tagColor={COLORS.green}
                accent={COLORS.green}
                glow
              >
                <Row label="type" value="Uint16Array[]" color={COLORS.green} />
                <Row
                  label="cell value"
                  value="provinceId (0 = frontier)"
                  color={COLORS.green}
                />
                <Row label="per epoch" value="1 array snapshot" />
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    background: COLORS.greenDim,
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.green}33`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: COLORS.textDim,
                      marginBottom: "4px",
                    }}
                  >
                    Why Uint16?
                  </div>
                  <div style={{ fontSize: "10px", color: COLORS.text }}>
                    Uint8 caps at <span style={{ color: COLORS.red }}>255</span>
                  </div>
                  <div style={{ fontSize: "10px", color: COLORS.text }}>
                    Uint16 allows{" "}
                    <span style={{ color: COLORS.green }}>65,535</span> IDs
                  </div>
                </div>
              </Card>

              <Card
                title="provinceRegistry"
                tag="new"
                tagColor={COLORS.purple}
                accent={COLORS.purple}
                glow
              >
                <Row
                  label="type"
                  value="Map&lt;id, metadata&gt;"
                  color={COLORS.purple}
                />
                <Row label="key" value="provinceId" />
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px",
                    background: COLORS.purpleDim,
                    borderRadius: "4px",
                    border: `1px solid ${COLORS.purple}33`,
                    fontSize: "10px",
                    lineHeight: 1.8,
                    color: COLORS.text,
                  }}
                >
                  <span style={{ color: COLORS.purple }}>id</span>: number
                  <br />
                  <span style={{ color: COLORS.purple }}>factionId</span>:
                  number
                  <br />
                  <span style={{ color: COLORS.purple }}>centerTileIndex</span>:
                  number
                  <br />
                  <span style={{ color: COLORS.purple }}>foundedEpoch</span>:
                  number
                  <br />
                  <span style={{ color: COLORS.textDim }}>coreTileIndices</span>
                  : Set (opt)
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Row 2: BFS Algorithm */}
          <motion.div variants={itemVariants}>
            <SectionLabel>
              02 · Calculation Algorithm · every N epochs (dirty-flag gated)
            </SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Card
                title="Multi-Source BFS"
                tag="Approach B"
                tagColor={COLORS.accent}
                accent={COLORS.accent}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <BFSStep
                    n="1"
                    color={COLORS.accent}
                    title="Identify Centers"
                    detail={`Scan map for tiles where density >= 5\nwithin current faction territories`}
                  />
                  <BFSStep
                    n="2"
                    color={COLORS.yellow}
                    title="Assign Stable IDs"
                    detail={`Check if centerTileIndex exists in registry\n→ Reuse ID  |  → Mint new ID + foundedEpoch`}
                  />
                  <BFSStep
                    n="3"
                    color={COLORS.green}
                    title="Sort & Initialize Queue"
                    detail={`Sort centers by provinceId (deterministic tie-breaking)\nSeed queue: [{ tileIdx, provinceId, dist:0 }]`}
                  />
                  <BFSStep
                    n="4"
                    color={COLORS.purple}
                    title="BFS Expansion"
                    detail={`Expand 1 tile/step. Claim tile if:\n• Same faction  • density > 0  • Not already claimed at shorter dist`}
                  />
                  <BFSStep
                    n="5"
                    color={COLORS.orange}
                    title="Unclaimed = Frontier"
                    detail={`Tiles BFS never reaches stay at 0\nFrontier: density too low or no reachable center`}
                  />
                </div>
              </Card>

              <Card
                title="BFS Voronoi Expansion (live)"
                tag="animated"
                tagColor={COLORS.textDim}
                accent={COLORS.borderBright}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <TileGrid />
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 10px",
                        background: COLORS.accentDim,
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.accent}44`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: COLORS.textDim,
                          marginBottom: "3px",
                        }}
                      >
                        Voronoi override rule
                      </div>
                      <div style={{ fontSize: "10px", color: COLORS.text }}>
                        Tile contiguous to A but{" "}
                        <span style={{ color: COLORS.accent }}>
                          closer to B
                        </span>{" "}
                        → belongs to B
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "8px 10px",
                        background: COLORS.greenDim,
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.green}44`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          color: COLORS.textDim,
                          marginBottom: "3px",
                        }}
                      >
                        Tie-breaker
                      </div>
                      <div style={{ fontSize: "10px", color: COLORS.text }}>
                        Equal distance →{" "}
                        <span style={{ color: COLORS.green }}>
                          lower provinceId wins
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Row 3: Dirty Flag */}
          <motion.div variants={itemVariants}>
            <SectionLabel>03 · Dirty Flag Gate</SectionLabel>
            <Card
              title="When to Recalculate"
              tag="performance"
              tagColor={COLORS.orange}
              accent={COLORS.orange}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                {[
                  {
                    trigger: "Tile faction ownership changed",
                    color: COLORS.red,
                  },
                  {
                    trigger: "Tile crossed density >= 5 threshold",
                    color: COLORS.green,
                  },
                  {
                    trigger: "Province center tile was lost",
                    color: COLORS.orange,
                  },
                  {
                    trigger: "None of the above → skip",
                    color: COLORS.textDim,
                  },
                ].map(({ trigger, color }) => (
                  <div
                    key={trigger}
                    style={{
                      padding: "10px",
                      background: color + "11",
                      border: `1px solid ${color}33`,
                      borderRadius: "4px",
                      fontSize: "10px",
                      color,
                      lineHeight: 1.6,
                    }}
                  >
                    {trigger}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Row 4: Rendering */}
          <motion.div variants={itemVariants}>
            <SectionLabel>
              04 · Rendering Pipeline · InstancedMap.jsx
            </SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Card
                title="Shader Data Passing"
                tag="GPU"
                tagColor={COLORS.purple}
                accent={COLORS.purple}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Row
                    label="input"
                    value="provinceSnapshots[epoch] Uint16Array"
                    color={COLORS.purple}
                  />
                  <Row
                    label="pack as"
                    value="RG8 texture (hi/lo byte split)"
                    color={COLORS.purple}
                  />
                  <Row label="fallback" value="OES_texture_integer extension" />
                  <Row label="pass as" value="uniform DataTexture" />
                  <div
                    style={{
                      padding: "8px",
                      background: "#ffffff06",
                      borderRadius: "4px",
                      border: `1px solid ${COLORS.border}`,
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: COLORS.textDim,
                        marginBottom: "6px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      DECODE IN SHADER
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: COLORS.yellow,
                        lineHeight: 1.8,
                      }}
                    >
                      vec2 rg = texture2D(uProvince, uv).rg;
                      <br />
                      float id = rg.r * 255.0 * 256.0 + rg.g * 255.0;
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                title="Visual Hierarchy"
                tag="3 layers"
                tagColor={COLORS.accent}
                accent={COLORS.accent}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "3px",
                        height: "40px",
                        background: COLORS.accent,
                        borderRadius: "2px",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: COLORS.textBright,
                          marginBottom: "2px",
                        }}
                      >
                        ① Faction Color
                      </div>
                      <div style={{ fontSize: "10px", color: COLORS.textDim }}>
                        Primary identity signal. Dominant. Non-negotiable.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "3px",
                        height: "40px",
                        background: COLORS.orange,
                        borderRadius: "2px",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: COLORS.textBright,
                          marginBottom: "2px",
                        }}
                      >
                        ② Province Borders
                      </div>
                      <div style={{ fontSize: "10px", color: COLORS.textDim }}>
                        Dark edge when neighbor provinceId ≠ own. Shader
                        neighbor sample.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "3px",
                        height: "40px",
                        background: COLORS.purple,
                        borderRadius: "2px",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: COLORS.textBright,
                          marginBottom: "2px",
                        }}
                      >
                        ③ Lightness Variation
                      </div>
                      <div style={{ fontSize: "10px", color: COLORS.textDim }}>
                        ±8% deterministic hash. Texture, not identity.
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: COLORS.yellow,
                          marginTop: "4px",
                        }}
                      >
                        (id * 2654435761 % 256) / 256 * 0.16 − 0.08
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Row 5: Build Order */}
          <motion.div variants={itemVariants}>
            <SectionLabel>05 · Implementation Sequence</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {[
                {
                  n: "01",
                  title: "BFS Logic Only",
                  detail:
                    "useSimulatorEngine.js · validate provinceSnapshots output in console before touching renderer",
                  color: COLORS.green,
                },
                {
                  n: "02",
                  title: "Flat Province Colors",
                  detail:
                    "Wire Uint16Array → DataTexture → shader. Confirm pipeline with solid per-province color.",
                  color: COLORS.accent,
                },
                {
                  n: "03",
                  title: "Border Edge Detection",
                  detail:
                    "Add neighbor provinceId sampling in shader. Darken edge on mismatch.",
                  color: COLORS.orange,
                },
                {
                  n: "04",
                  title: "Lightness Hash",
                  detail:
                    "Purely cosmetic pass. Add last so it never obscures a data bug above.",
                  color: COLORS.purple,
                },
              ].map(({ n, title, detail, color }, i) => (
                <div
                  key={n}
                  style={{
                    padding: "16px",
                    background: COLORS.panel,
                    borderRight: i < 3 ? `1px solid ${COLORS.border}` : "none",
                    borderTop: `3px solid ${color}`,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      fontSize: "22px",
                      color: color + "22",
                      fontFamily: style.fontDisplay,
                      position: "absolute",
                      top: "10px",
                      right: "12px",
                    }}
                  >
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: COLORS.textBright,
                      marginBottom: "8px",
                      fontWeight: 700,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: COLORS.textDim,
                      lineHeight: 1.7,
                    }}
                  >
                    {detail}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              paddingTop: "16px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                color: COLORS.textDim,
                letterSpacing: "0.1em",
              }}
            >
              PROVINCE SYSTEM · DESIGN LOCKED
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Tag color={COLORS.green}>BFS confirmed</Tag>
              <Tag color={COLORS.purple}>ID stability locked</Tag>
              <Tag color={COLORS.orange}>Voronoi override locked</Tag>
            </div>
          </motion.div>
        </div>
      </MagicBentoProvider>
    </motion.div>
  );
}
