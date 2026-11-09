// Spec: specs/004-real-lot-terrain.md (A1–A4, A6)
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildStahlHouse } from '../src/houses/stahl-house/model/stahlHouse';
import { TERRAIN } from '../src/houses/stahl-house/model/site';
import { DRIVE, inRect, inPool, PLATEAU } from '../src/houses/stahl-house/model/layout';
import { LOT_GROUND } from '../src/houses/stahl-house/model/lotTerrain';
import { PLATE } from '../src/engine/catalog';
import { P } from '../src/houses/stahl-house/phases';
import { groundHeight, lotDistance, parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { houseFingerprint } from './fingerprint';
import { STAHL } from '../src/houses/stahl-house/definition';

const file = readFileSync('public/stahl-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const { builder, heightmap: hm } = buildStahlHouse();
const real = (x: number, z: number) => sampleGrid(n.near, x, z);
const topFt = (x: number, z: number) => hm.at(x, z) * PLATE;

/** every cell on the outer ring of the lot */
const boundary: [number, number][] = [];
for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) boundary.push([x, TERRAIN.z0], [x, TERRAIN.z1 - 1]);
for (let z = TERRAIN.z0 + 1; z < TERRAIN.z1 - 1; z++) boundary.push([TERRAIN.x0, z], [TERRAIN.x1 - 1, z]);

describe('004: brick hillside from the real terrain', () => {
  it('A6: the baked lot ground is exactly the near grid of neighborhood.bin', () => {
    const g = n.near;
    const i0 = (LOT_GROUND.x0 - g.x0) / g.step, j0 = (LOT_GROUND.z0 - g.z0) / g.step;
    expect(Number.isInteger(i0) && Number.isInteger(j0)).toBe(true);
    expect(LOT_GROUND.h.length).toBe(LOT_GROUND.nx * LOT_GROUND.nz);
    for (let j = 0; j < LOT_GROUND.nz; j++)
      for (let i = 0; i < LOT_GROUND.nx; i++)
        expect(LOT_GROUND.h[j * LOT_GROUND.nx + i] / 4).toBe(g.h[(j0 + j) * g.nx + i0 + i]);
    // and it covers the lot with margin
    expect(LOT_GROUND.x0).toBeLessThanOrEqual(TERRAIN.x0 - 20);
    expect(LOT_GROUND.x0 + (LOT_GROUND.nx - 1) * LOT_GROUND.step).toBeGreaterThanOrEqual(TERRAIN.x1 + 20);
  });

  it('A1: along the lot boundary the bricks meet the real ground within one brick', () => {
    const misses = boundary.filter(([x, z]) => !inRect(x, z, DRIVE) && Math.abs(topFt(x, z) - real(x, z)) > 3 * PLATE + 1e-6);
    expect(misses).toEqual([]);
  });

  it('A1: the driveway reaches the lot edge at the real ground', () => {
    const z = (DRIVE[1] + DRIVE[3]) >> 1;
    expect(Math.abs(topFt(TERRAIN.x0, z) - real(TERRAIN.x0, z))).toBeLessThanOrEqual(3 * PLATE);
    const paving = builder.bricks.filter((b) => b.phase === P.FLOOR && b.x === TERRAIN.x0 && b.z <= z && z < b.z + b.d);
    expect(paving.length).toBeGreaterThan(0);
  });

  it('A2: the house pad stays level at y = 0 and the house is unchanged', () => {
    for (let x = PLATEAU[0] + 10; x < PLATEAU[2] - 10; x += 3)
      for (let z = PLATEAU[1] + 10; z < PLATEAU[3] - 10; z += 3) if (!inPool(x, z)) expect(hm.at(x, z)).toBe(0);
    expect(houseFingerprint(builder.bricks)).toEqual({ count: 3613, hash: 'b6c7272d' }); // spec 012 (was 3,603 / e781fb43)
  });

  it('A3: no holes: every lot cell has a brick at its surface, and every step between neighbors is walled', () => {
    const holes: string[] = [];
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++)
      for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) {
        const top = hm.at(x, z);
        if (!builder.occAt(x, top - 1, z)) holes.push(`surface ${x},${z}`);
        for (const [dx, dz] of [[1, 0], [0, 1]]) {
          const nx = x + dx, nz = z + dz;
          if (nx >= TERRAIN.x1 || nz >= TERRAIN.z1) continue;
          const other = hm.at(nx, nz);
          const [hx, hz, lo, hi] = top > other ? [x, z, other, top] : [nx, nz, top, other];
          for (let y = lo; y < hi; y++) if (!builder.occAt(hx, y, hz)) { holes.push(`side ${hx},${y},${hz}`); break; }
        }
        if (holes.length > 10) break;
      }
    expect(holes).toEqual([]);
  });

  it('A4: the terrain mesh is the real ground outside the lot and hides under the bricks inside', () => {
    for (const [x, z] of [[-150, 0], [200, 50], [30, -200], [30, 220]]) {
      expect(lotDistance(STAHL.lot, x, z)).toBeGreaterThan(0);
      expect(groundHeight(n, STAHL.lot, x, z)).toBeCloseTo(real(x, z), 3);
    }
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 7)
      for (let z = TERRAIN.z0; z < TERRAIN.z1; z += 7) expect(groundHeight(n, STAHL.lot, x, z)).toBeLessThan(topFt(x, z) - 1);
  });
});
