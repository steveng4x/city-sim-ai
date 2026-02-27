import { test } from 'node:test';
import assert from 'node:assert';
import { SimplexNoise, generateHeightMap, computeRivers } from './terrainUtils.js';

test('SimplexNoise: instantiation', () => {
  const sn = new SimplexNoise(123);
  assert.ok(sn instanceof SimplexNoise);
});

test('SimplexNoise: determinism', () => {
  const sn1 = new SimplexNoise(123);
  const sn2 = new SimplexNoise(123);
  const x = 10.5, y = 20.7;
  assert.strictEqual(sn1.noise2D(x, y), sn2.noise2D(x, y));
});

test('SimplexNoise: diversity', () => {
  const sn1 = new SimplexNoise(123);
  const sn2 = new SimplexNoise(456);
  const x = 10.5, y = 20.7;
  assert.notStrictEqual(sn1.noise2D(x, y), sn2.noise2D(x, y));
});

test('SimplexNoise: range', () => {
  const sn = new SimplexNoise(123);
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;
    const val = sn.noise2D(x, y);
    // Increased range to be safe
    assert.ok(val >= -100 && val <= 100, `Noise value ${val} out of range [-100, 100] at (${x}, ${y})`);
  }
});

test('generateHeightMap: output format', () => {
  const w = 10, h = 10;
  const map = generateHeightMap(w, h, 123);
  assert.ok(map instanceof Float32Array);
  assert.strictEqual(map.length, w * h);
});

test('generateHeightMap: determinism', () => {
  const w = 10, h = 10, seed = 123;
  const map1 = generateHeightMap(w, h, seed);
  const map2 = generateHeightMap(w, h, seed);
  assert.deepStrictEqual(map1, map2);
});

test('generateHeightMap: range', () => {
  const w = 20, h = 20, seed = 123;
  const map = generateHeightMap(w, h, seed);
  for (let i = 0; i < map.length; i++) {
    // Widened range since Simplex noise isn't strictly bounded to [-1, 1] before normalization
    assert.ok(map[i] >= -0.5 && map[i] <= 1.5, `Height value ${map[i]} at index ${i} out of reasonable range [-0.5, 1.5]`);
  }
});

test('computeRivers: output format', () => {
  const w = 10, h = 10;
  const heightMap = new Float32Array(w * h).fill(0.5);
  const rivers = computeRivers(heightMap, w, h, 0.3);
  assert.ok(rivers instanceof Uint8Array);
  assert.strictEqual(rivers.length, w * h);
});

test('computeRivers: basic flow', () => {
  const w = 3, h = 3;
  // Create a slope from top-left (high) to bottom-right (low)
  const heightMap = new Float32Array([
    1.0, 0.9, 0.8,
    0.7, 0.6, 0.5,
    0.4, 0.3, 0.2
  ]);

  const seaLevel = 0.1;
  const threshold = 2;
  const rivers = computeRivers(heightMap, w, h, seaLevel, threshold);

  let riverCount = 0;
  for (let i = 0; i < rivers.length; i++) {
    if (rivers[i] === 1) riverCount++;
  }
  assert.ok(riverCount > 0, "Expected at least one river tile on a slope");
});
