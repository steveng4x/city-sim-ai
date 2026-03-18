/**
 * Procedural fantasy city name generator.
 * Deterministic — same tileIndex always produces the same name.
 */

const PREFIXES = [
  "Ar",
  "El",
  "Kha",
  "Mor",
  "Val",
  "Zar",
  "Tho",
  "Ren",
  "Sol",
  "Ven",
  "Dra",
  "Lor",
  "Nir",
  "Gal",
  "Ori",
  "Kal",
  "Ash",
  "Bel",
  "Cor",
  "Dur",
  "Fal",
  "Gor",
  "Hel",
  "Ith",
  "Jor",
  "Kel",
  "Lun",
  "Mar",
  "Nev",
  "Pal",
  "Qua",
  "Sar",
  "Tar",
  "Uru",
  "Vos",
  "Wyr",
  "Xan",
  "Yor",
  "Zen",
  "Ald",
];

const MIDDLES = [
  "an",
  "en",
  "or",
  "un",
  "al",
  "il",
  "ar",
  "ir",
  "on",
  "el",
  "at",
  "is",
  "as",
  "os",
  "ur",
  "eth",
  "oth",
  "ith",
  "ael",
  "iel",
  "dor",
  "mir",
  "nar",
  "ven",
  "gon",
  "dan",
  "rin",
  "zan",
  "ber",
  "ton",
];

const SUFFIXES = [
  "dor",
  "heim",
  "vale",
  "gate",
  "hold",
  "stead",
  "mark",
  "haven",
  "fell",
  "mund",
  "grad",
  "burg",
  "ton",
  "dale",
  "ford",
  "wick",
  "mere",
  "port",
  "rock",
  "keep",
  "thal",
  "gard",
  "rim",
  "peak",
  "shire",
  "den",
  "lyn",
  "mor",
  "sha",
  "ra",
];

/**
 * Generate a fantasy city name from a tile index (deterministic).
 * @param {number} tileIndex
 * @returns {string}
 */
export function generateCityName(tileIndex) {
  // Simple hash to scatter index across arrays
  const h1 = ((tileIndex * 2654435761) >>> 0) % PREFIXES.length;
  const h2 = ((tileIndex * 2246822519) >>> 0) % MIDDLES.length;
  const h3 = ((tileIndex * 3266489917) >>> 0) % SUFFIXES.length;

  // 50% chance to include a middle syllable (based on index parity)
  const useMiddle = ((tileIndex * 1597334677) >>> 0) % 3 !== 0;

  if (useMiddle) {
    return PREFIXES[h1] + MIDDLES[h2] + SUFFIXES[h3];
  }
  return PREFIXES[h1] + SUFFIXES[h3];
}
