// Spec: specs/056-lovell-beach-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isWater, parseNeighborhood, sampleGrid, seaLevelY, waterMask } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { LOVELL_BEACH as H } from '../src/houses/lovell-beach-house/definition';
import { GRID } from '../src/houses/lovell-beach-house/model/beachHouse';
import { BAND, DEPTH, FRAMES, KITCHEN_STAIR, LENGTH, LIVING_STAIR, POSTS, SOUTH_WALL_X, STAIR_Z, Y } from '../src/houses/lovell-beach-house/model/layout';
import { TERRAIN } from '../src/houses/lovell-beach-house/model/site';
import { P, PHASES } from '../src/houses/lovell-beach-house/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/lovell-beach-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/lovell-beach-house/model/${f}`, 'utf8');
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const ft = (feet: number, inches = 0) => feet + inches / 12;

describe('056: the Lovell Beach House', () => {
  it('A1: the footprint fits OSM\'s way 1070767462 (IoU ≥ 0.75), 58′-8″ × 33′-2″', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(LENGTH - ft(58, 8))).toBeLessThanOrEqual(2);
    expect(Math.abs(DEPTH - ft(33, 2))).toBeLessThanOrEqual(2);
  });

  it('A2: five frames 12 ft apart, three posts each from the ground to the roof, a beam under the living floor', () => {
    expect(FRAMES.length).toBe(5);
    for (let i = 1; i < FRAMES.length; i++) expect(FRAMES[i] - FRAMES[i - 1]).toBe(12);
    for (const x of FRAMES) {
      for (const [z0] of POSTS) for (const y of [1, Y.F1 + 5, Y.CEILING + 2]) expect(at(x, y, z0)?.phase, `post ${x},${z0} at ${y}`).toBe(P.STRUCTURE);
      expect(at(x, Y.F1_BEAM, 8)?.phase, `beam at ${x}`).toBe(P.STRUCTURE);
    }
  });

  it('A3: the living floor at +10 ft, the bedrooms at about +16′-6″; the band 5 ft or more past the west posts', () => {
    expect(Y.F1 * PLATE).toBeCloseTo(10, 6);
    expect(Math.abs(Y.F2 * PLATE - ft(16, 6))).toBeLessThanOrEqual(0.5);
    expect(at(30, Y.F1 - 1, 8)?.phase).toBe(P.FLOOR);
    expect(at(30, Y.F2 - 1, 24)?.phase).toBe(P.STRUCTURE);
    expect(BAND[3] - POSTS[2][1]).toBeGreaterThanOrEqual(5);
    expect(at(30, Y.F2 - 1, DEPTH - 1)).toBeDefined();
  });

  it('A4: the living room\'s south wall is glass from the living floor to the ceiling', () => {
    const glassAt = (y: number) => [5, 8, 11].some((z) => at(SOUTH_WALL_X, y, z)?.kind === 'glass');
    const ys: number[] = [];
    for (let y = Y.F1; y < Y.CEILING; y++) if (glassAt(y)) ys.push(y);
    expect(Math.min(...ys)).toBeLessThanOrEqual(Y.F1 + 2);
    expect(Math.max(...ys)).toBeGreaterThanOrEqual(Y.CEILING - 3);
  });

  it('A5: two outside stairs from the platform to the living floor, one north and one south, at different slopes', () => {
    const z = STAIR_Z[0] + 2;
    const topAt = (x: number) => { for (let y = Y.F1; y > 0; y--) if (at(x, y - 1, z)?.phase === P.STRUCTURE) return y; return 0; };
    expect(topAt(KITCHEN_STAIR.x1)).toBeGreaterThanOrEqual(Y.F1 - 2);
    expect(topAt(KITCHEN_STAIR.x0)).toBeLessThan(10);
    expect(topAt(LIVING_STAIR.x1)).toBeGreaterThanOrEqual(Y.F1 - 2);
    expect(topAt(LIVING_STAIR.x0)).toBeLessThan(10);
    const slope = (a: number, b: number) => Math.abs((topAt(b) - topAt(a)) / (b - a));
    expect(slope(KITCHEN_STAIR.x0, KITCHEN_STAIR.x1)).toBeGreaterThan(slope(LIVING_STAIR.x0, LIVING_STAIR.x1) * 1.2);
  });

  it('A6: deterministic, inside its grid, no overlaps; every phase used, about 2½ minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(170);
  });

  it('A8: everything marked documented or assumed; at least 8 interior marks', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A9: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A10: the terrain has no spikes (spec 010b)', () => {
    for (const [g, limit] of [[n.near, 150], [n.far, 500]] as const) {
      let worst = 0;
      for (let j = 1; j < g.nz - 1; j++)
        for (let i = 1; i < g.nx - 1; i++) {
          const nb: number[] = [];
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (di || dj) nb.push(g.h[(j + dj) * g.nx + i + di]);
          nb.sort((a, c) => a - c);
          worst = Math.max(worst, Math.abs(g.h[j * g.nx + i] - (nb[3] + nb[4]) / 2));
        }
      expect(worst).toBeLessThanOrEqual(limit + 0.5);
    }
  });

  it('A11: the ocean is water at sea level beyond the beach; the beach and the lot are not', () => {
    expect(H.scenery?.sea).toBe(true);
    const seaY = seaLevelY(true, n.anchor.lotElevationM)!;
    const mask = waterMask(n.near, seaY);
    expect(isWater(n.near, mask, 1500, 16)).toBe(true);
    expect(isWater(n.near, mask, 3000, 16)).toBe(true);
    expect(isWater(n.near, mask, 30, 16)).toBe(false);
    expect(isWater(n.near, mask, 400, 16)).toBe(false);
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z += 10) expect(hm.at(TERRAIN.x1 - 1, z) * PLATE).toBeGreaterThan(seaY);
  });

  it('A12: the home card is live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'lovell-beach-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain("the house's owners");
    expect(card.wikidata).toBe('Q746490');
  });
});
