export class SimplexNoise {
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

export function generateHeightMap(w, h, seed, octaves = 5, persistence = 0.5) {
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

export function computeRivers(heightMap, w, h, seaLevel, threshold = 12) {
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
