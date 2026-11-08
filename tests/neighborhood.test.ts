// Spec: specs/003-real-neighborhood.md (A1–A4, A6; A5 is covered by tests/phaseOrder.test.ts)
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { groundHeight, parseNeighborhood, sampleGrid } from '../src/scene/neighborhoodData';
import { TERRAIN } from '../src/model/site';

const file = readFileSync('public/neighborhood.bin');
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
    expect(groundHeight(n, TERRAIN.x1 + 0.5, 0)).toBeCloseTo(sampleGrid(n.near, TERRAIN.x1 + 0.5, 0), 3);
    expect(groundHeight(n, 0, TERRAIN.z0 - 0.5)).toBeCloseTo(sampleGrid(n.near, 0, TERRAIN.z0 - 0.5), 3);
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
    const files = readdirSync('src', { recursive: true }).filter((f: string | Buffer) => String(f).endsWith('.ts'));
    for (const f of files) {
      const src = readFileSync(`src/${f}`, 'utf8');
      expect(src).not.toMatch(/overpass|openstreetmap\.org\/api|amazonaws|googleapis|maps\.google/i);
    }
  });
});
