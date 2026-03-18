export const mapW = 160;
export const mapH = 100;
export const tileSize = 6;
export const maxEpochs = 80;

// Infinite mode constants
export const BUFFER_THRESHOLD = 5;
export const LOOKAHEAD_SIZE = 20;
export const MAX_STORED_EPOCHS = 2000;

// Mega-city constants
export const MEGACITY_DENSITY = 9;
export const MEGACITY_CAP_DIVISOR = 300; // 1 mega-city per 300 tiles owned

export const factionColors = [
  "#ff6b6b", // Coral red — contrasts with green terrain, distinct from gold
  "#e040fb", // Magenta/pink — contrasts with all greens and blues
  "#ffea00", // Bright yellow — pops against dark green and blue ocean
  "#ff3d00", // Deep orange-red — distinct from terrain grays and greens
  "#ea80fc", // Light purple — contrasts with green/brown terrain tones
];

export const accentMap = {
  cyan: "group-hover:border-cyan-500/60 group-hover:shadow-cyan-500/10",
  indigo: "group-hover:border-indigo-500/60 group-hover:shadow-indigo-500/10",
  violet: "group-hover:border-violet-500/60 group-hover:shadow-violet-500/10",
  blue: "group-hover:border-blue-500/60 group-hover:shadow-blue-500/10",
  fuchsia:
    "group-hover:border-fuchsia-500/60 group-hover:shadow-fuchsia-500/10",
  amber: "group-hover:border-amber-500/60 group-hover:shadow-amber-500/10",
};
