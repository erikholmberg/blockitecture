// Spec: specs/057-neue-nationalgalerie.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { NEUE_NATIONALGALERIE as H } from '../src/houses/neue-nationalgalerie/definition';
import { GRID } from '../src/houses/neue-nationalgalerie/model/gallery';
import { BAY, COLUMNS, HALL, ROOF, Y } from '../src/houses/neue-nationalgalerie/model/layout';
import { TERRAIN } from '../src/houses/neue-nationalgalerie/model/site';
import { P, PHASES } from '../src/houses/neue-nationalgalerie/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/neue-nationalgalerie/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/neue-nationalgalerie/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

describe('057: the Neue Nationalgalerie', () => {
  it('A1: the roof fits OSM\'s way 25652320 (IoU ≥ 0.75), about 64.8 m square', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs((ROOF[2] - ROOF[0]) / M / 64.8 - 1)).toBeLessThanOrEqual(0.02);
    expect(ROOF[2] - ROOF[0]).toBe(ROOF[3] - ROOF[1]);
  });

  it('A2: the hall two bays in from the roof\'s edge on every side; the girders every bay', () => {
    expect([HALL[0] - ROOF[0], HALL[1] - ROOF[1], ROOF[2] - HALL[2], ROOF[3] - HALL[3]]).toEqual([2 * BAY, 2 * BAY, 2 * BAY, 2 * BAY]);
    for (let x = 0; x < ROOF[2]; x += BAY) expect(at(x, Y.CEILING + 2, 50)?.phase, `girder at x ${x}`).toBe(P.ROOF);
    expect(at(BAY / 2, Y.CEILING + 2, BAY / 2 + 48)).toBeUndefined(); // a coffer
  });

  it('A3: eight cruciform columns, two to a side, none at a corner, from the terrace up into the roof', () => {
    expect(COLUMNS.length).toBe(8);
    const side = (x: number, z: number) => (z < 10 ? 'a' : z > ROOF[3] - 10 ? 'c' : x < 10 ? 'd' : x > ROOF[2] - 10 ? 'b' : '?');
    const count: Record<string, number> = {};
    for (const [x, z] of COLUMNS) count[side(x, z)] = (count[side(x, z)] ?? 0) + 1;
    expect(count).toEqual({ a: 2, b: 2, c: 2, d: 2 });
    for (const [x, z] of COLUMNS) {
      expect(Math.min(x, z, ROOF[2] - x, ROOF[3] - z)).toBeLessThan(10);
      expect(Math.max(Math.min(x, ROOF[2] - x), Math.min(z, ROOF[3] - z))).toBeGreaterThan(40); // not at a corner
      for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) expect(at(x + dx, 30, z + dz)?.color, `column ${x},${z}`).toBe(0x1e1f21);
      expect(at(x + 1, 30, z + 1)).toBeUndefined(); // a cross, not a square
      expect(at(x, Y.ROOF - 2, z)?.phase).toBe(P.STRUCTURE);
    }
  });

  it('A4: the hall is 8.4 m clear, glass between mullions every bay, floor to ceiling', () => {
    expect(Math.abs((Y.CEILING * PLATE) / M - 8.4)).toBeLessThanOrEqual(0.3);
    for (const y of [2, 20, 40, 66]) expect(at(HALL[0] + 6, y, HALL[1])?.kind, `glass at ${y}`).toBe('glass');
    for (let x = HALL[0]; x < HALL[2]; x += BAY) expect(at(x, 40, HALL[1])?.kind, `mullion at ${x}`).toBe('brick');
  });

  it('A5: the roof is 1.8 m deep and about 10 m above the terrace', () => {
    expect(Math.abs(((Y.ROOF - Y.CEILING) * PLATE) / M - 1.8)).toBeLessThanOrEqual(0.3);
    expect(Math.abs((Y.ROOF * PLATE) / M - 10)).toBeLessThanOrEqual(0.5);
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
    expect(s.total).toBeLessThan(175);
  }, 60_000);

  it('A8: everything marked documented or assumed; at least 5 interior marks', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(5);
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

  it('A11: the home card is live, with the real piece count and its credits; the numbers say "gallery"', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'neue-nationalgalerie')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('the Staatliche Museen zu Berlin');
    expect(card.wikidata).toBe('Q130608380');
    expect(H.text.noun).toBe('gallery');
  });
});
