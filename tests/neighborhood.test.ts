// Spec: specs/003-real-neighborhood.md (A1–A4, A6; A5 is covered by tests/phaseOrder.test.ts)
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { groundHeight, parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { TERRAIN } from '../src/houses/stahl-house/model/site';
import { STAHL } from '../src/houses/stahl-house/definition';

const file = readFileSync('public/stahl-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const RADIUS_FT = 1200 / 0.3048;
const HOUSE = { x: n.anchor.offsetX, z: n.anchor.offsetZ };

describe('003: real neighborhood data', () => {
  it('A1: real buildings within 1.2 km, each with a footprint, base and top', () => {
    const b = n.buildings;
    expect(b.count).toBeGreaterThan(3000);
    for (let i = 0; i < b.count; i++) {
      expect(b.start[i + 1] - b.start[i]).toBeGreaterThanOrEqual(3);
      expect(b.top[i]).toBeGreaterThan(b.base[i]);
      let cx = 0, cz = 0;
      const k = b.start[i + 1] - b.start[i];
      for (let p = b.start[i]; p < b.start[i + 1]; p++) { cx += b.xz[p * 2] / k; cz += b.xz[p * 2 + 1] / k; }
      expect(Math.hypot(cx - HOUSE.x, cz - HOUSE.z)).toBeLessThanOrEqual(RADIUS_FT + 1);
    }
    expect(n.roads.count).toBeGreaterThan(100);
    expect(n.attribution.join(' ')).toContain('OpenStreetMap contributors');
  });

  it('A2: the real house outline is fitted onto the model (rotated 180°, IoU ≥ 0.8)', () => {
    expect(n.anchor.rotationDeg).toBe(180);
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.8);
    // the fitted house centre lands on the model house (roof spans x −2…77, z −36…57)
    expect(HOUSE.x).toBeGreaterThan(-2);
    expect(HOUSE.x).toBeLessThan(77);
    expect(HOUSE.z).toBeGreaterThan(-36);
    expect(HOUSE.z).toBeLessThan(57);
  });

  it('A3: terrain is level with the lot at the house, drops to the basin and rises to the ridge', () => {
    expect(Math.abs(sampleGrid(n.near, 32, 12))).toBeLessThan(2);
    // real south (the LA basin) is model −z after the 180° rotation
    expect(sampleGrid(n.near, 32, 12 - 3000)).toBeLessThan(-350);
    expect(n.near.h.reduce((m, v) => Math.max(m, v), -Infinity)).toBeGreaterThan(200);
    // outside the lot the ground is the real ground (spec 004-A4 removed the blend to the old −48 ft lot edge)
    expect(groundHeight(n, STAHL.lot, TERRAIN.x1 + 0.5, 0)).toBeCloseTo(sampleGrid(n.near, TERRAIN.x1 + 0.5, 0), 3);
    expect(groundHeight(n, STAHL.lot, 0, TERRAIN.z0 - 0.5)).toBeCloseTo(sampleGrid(n.near, 0, TERRAIN.z0 - 0.5), 3);
  });

  it('A3: decoded terrain is continuous (no decoding glitches)', () => {
    const g = n.near;
    let worst = 0;
    for (let j = 0; j < g.nz; j++)
      for (let i = 1; i < g.nx; i++) worst = Math.max(worst, Math.abs(g.h[j * g.nx + i] - g.h[j * g.nx + i - 1]));
    expect(worst).toBeLessThan(g.step * 3); // < ~72° slope everywhere
  });

  it('A4: no backdrop building intersects the brick lot', () => {
    const b = n.buildings;
    for (let i = 0; i < b.count; i++) {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let p = b.start[i]; p < b.start[i + 1]; p++) {
        x0 = Math.min(x0, b.xz[p * 2]); x1 = Math.max(x1, b.xz[p * 2]);
        z0 = Math.min(z0, b.xz[p * 2 + 1]); z1 = Math.max(z1, b.xz[p * 2 + 1]);
      }
      const overlaps = x1 > TERRAIN.x0 && x0 < TERRAIN.x1 && z1 > TERRAIN.z0 && z0 < TERRAIN.z1;
      expect(overlaps).toBe(false);
    }
  });

  it('A6: the site never calls map services at runtime', () => {
    const files = readdirSync('src', { recursive: true }).filter((f: string | Buffer) => /\.(ts|tsx|css)$/.test(String(f)));
    for (const f of files) {
      const src = readFileSync(`src/${f}`, 'utf8');
      // no map services, and (spec 007-A4) no font CDN: Inter is self-hosted via @fontsource-variable
      expect(src).not.toMatch(/overpass|openstreetmap\.org\/api|amazonaws|googleapis|gstatic|maps\.google|fonts\.bunny|use\.typekit/i);
    }
  });
});

// Spec: specs/011-sea-flicker.md (A1)
import { ABOVE_SEA, DEEP, isWater, seaMeshHeight, UNDER_SEA, waterMask } from '../src/engine/scene/neighborhoodData';
describe('011: no z-fighting between the sea and the shore', () => {
  const sea = -152.3;
  it('A1: open water is below sea level and connected to deep water; an enclosed dip on land is not', () => {
    // 6 × 3 grid: deep sea on the left, a shelf, a beach, and an enclosed dip below sea level on the right
    const row = [sea - 40, sea - 2, sea + 1, sea + 4, sea - 3, sea + 4];
    const g = { x0: 0, z0: 0, step: 20, nx: 6, nz: 3, h: Float32Array.from([...row, ...row, ...row]) };
    const m = waterMask(g, sea);
    expect([0, 1, 2, 3, 4, 5].map((i) => m[6 + i])).toEqual([1, 1, 0, 0, 0, 0]);
    expect(isWater(g, m, 20, 20)).toBe(true); // the shallow shelf, connected to the deep sea
    expect(isWater(g, m, 80, 20)).toBe(false); // the dip by the road
    expect(isWater(g, m, -100, 0)).toBe(false); // outside the grid
    expect(DEEP).toBeGreaterThan(0);
  });

  it('A1: water drops well below the sea, land stays clear above it; higher up and without a sea, unchanged', () => {
    expect(UNDER_SEA).toBeGreaterThanOrEqual(30);
    expect(ABOVE_SEA).toBeGreaterThanOrEqual(3);
    for (const y of [sea - 0.1, sea - 10, sea - 29]) expect(seaMeshHeight(y, sea, true)).toBeLessThanOrEqual(sea - UNDER_SEA);
    expect(seaMeshHeight(sea - 80, sea, true)).toBe(sea - 80);
    for (const y of [sea - 3, sea, sea + 2.9]) expect(seaMeshHeight(y, sea, false)).toBe(sea + ABOVE_SEA); // incl. enclosed dips
    for (const y of [sea + ABOVE_SEA, sea + 6, 0, 120]) expect(seaMeshHeight(y, sea, false)).toBe(y);
    for (const y of [-500, -152.4, 0, 30]) for (const w of [true, false]) expect(seaMeshHeight(y, null, w)).toBe(y);
  });
});
