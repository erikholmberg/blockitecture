// Spec: specs/061-trellick-tower.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { TRELLICK as H } from '../src/houses/trellick-tower/definition';
import { GRID } from '../src/houses/trellick-tower/model/tower';
import { BALCONY_Z, BAY, BLOCK_B, BLOCK_B_LEVELS, BOILER, BRIDGE, CORRIDORS, CROSSWALLS, LEVELS, levelY, SLAB, STOREY, TOP, TOWER, TOWER_TOP } from '../src/houses/trellick-tower/model/layout';
import { CEDAR } from '../src/houses/trellick-tower/model/house';
import { TERRAIN } from '../src/houses/trellick-tower/model/site';
import { P, PHASES } from '../src/houses/trellick-tower/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/trellick-tower/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/trellick-tower/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

/** the checks every house shares: invariants, sourcing marks, the lot's edges, no terrain spikes */
function shared(ids: { inv: string; marks: string; edges: string; spikes: string }, minTotal: number, maxTotal: number, interiorMarks: number) {
  it(`${ids.inv}: deterministic, inside its grid, no overlaps; every phase used; the build's length`, () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(minTotal);
    expect(s.total).toBeLessThan(maxTotal);
  }, 120_000);
  it(`${ids.marks}: everything marked with its source; enough marks in the interior`, () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(interiorMarks);
  });
  it(`${ids.edges}: the lot meets the real ground at its edges`, () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });
  it(`${ids.spikes}: the terrain has no spikes (spec 010b)`, () => {
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
}
async function card(slug: string) {
  const { HOUSES } = await import('../src/houses');
  return HOUSES.find((h) => h.slug === slug)!;
}

const ft = (feet: number, inches = 0) => feet + inches / 12;

describe('061: Trellick Tower', () => {
  it('A1: the outlines fit OSM\'s three ways (IoU ≥ 0.75); the slab 143′-9½″ long', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(SLAB[2] - SLAB[0] - ft(143, 9.5))).toBeLessThanOrEqual(1);
  });

  it('A2: 32 levels to within 3 ft of 283′-9″; crosswalls at 23 ft; a floor at every level', () => {
    expect(LEVELS).toBe(32);
    expect(Math.abs(TOP * PLATE - ft(283, 9))).toBeLessThanOrEqual(3);
    for (let i = 1; i < 6; i++) expect(CROSSWALLS[i] - CROSSWALLS[i - 1]).toBe(BAY);
    expect(BAY).toBe(23);
    for (const x of CROSSWALLS) for (const l of [0, 10, 31]) expect(at(x, levelY(l) + 5, 20)?.phase, `crosswall ${x} level ${l}`).toBe(P.STRUCTURE);
    for (let l = 1; l < LEVELS; l++) expect(at(30, levelY(l), 20)?.kind, `floor ${l}`).toBe('plate');
  });

  it('A3: the service tower apart from the slab, taller, joined by ten bridges a storey high at every third floor', () => {
    const gap = SLAB[0] - TOWER[2];
    expect(gap).toBeGreaterThanOrEqual(22);
    expect(gap).toBeLessThanOrEqual(28);
    expect(TOWER_TOP).toBeGreaterThan(TOP);
    expect(CORRIDORS).toEqual([3, 6, 9, 12, 15, 18, 21, 24, 27, 30]);
    const mid = Math.round((BRIDGE[0] + BRIDGE[2]) / 2);
    for (let l = 1; l < LEVELS; l++) {
      const floor = at(mid, levelY(l), BRIDGE[1] + 3), roof = at(mid, levelY(l) + STOREY - 1, BRIDGE[1] + 3);
      expect(!!floor && !!roof, `bridge at level ${l}`).toBe(CORRIDORS.includes(l));
    }
    expect(at(mid, 5, BRIDGE[1] + 3)).toBeUndefined(); // open air between the tower and the slab below the first bridge
  });

  it('A4: the boiler house: glazed, beyond the tower\'s face on the side away from the slab, above the slab\'s roof', () => {
    expect(BOILER.x0).toBeLessThan(TOWER[0]);
    expect(BOILER.y0).toBeGreaterThanOrEqual(TOP);
    const glass = bricks.filter((b) => b.kind === 'glass' && b.x === BOILER.x0 && b.y >= BOILER.y0 && b.y < BOILER.y1);
    expect(glass.length).toBeGreaterThan(10);
    expect(at(BOILER.x0, BOILER.y0 - 5, 2)?.phase).toBe(P.STRUCTURE); // the haunch under it
  });

  it('A5: cedar balcony fronts all along a bay on a corridor floor; only its middle on the floor under', () => {
    const cedarAt = (l: number, x: number) => CEDAR.includes(at(x, levelY(l) + 4, BALCONY_Z)?.color ?? -1);
    for (const x of [2, 8, 14, 20]) expect(cedarAt(12, x), `corridor floor at ${x}`).toBe(true);
    expect(cedarAt(11, 2)).toBe(false);
    expect(cedarAt(11, 20)).toBe(false);
    expect(cedarAt(11, 8)).toBe(true);
    expect(cedarAt(13, 2)).toBe(true); // the floor over the corridor floor
  });

  it('A6: Block B: seven storeys, along the Golborne Road side', () => {
    expect(BLOCK_B_LEVELS).toBe(7);
    expect(BLOCK_B[2]).toBeLessThan(SLAB[0]);
    expect(BLOCK_B[3] - BLOCK_B[1]).toBeGreaterThan(150);
    expect(at(BLOCK_B[0] + 10, levelY(7), BLOCK_B[1] + 50)?.phase).toBe(P.ROOF);
    expect(at(BLOCK_B[0] + 10, levelY(7) + 5, BLOCK_B[1] + 50)).toBeUndefined();
  });

  shared({ inv: 'A7', marks: 'A9', edges: 'A11', spikes: 'A12' }, 160, 200, 5);

  it('A10: no other house sets shadowReach', async () => {
    const { readdirSync, existsSync } = await import('node:fs');
    // spec 072: Habitat 67 sets it too, for 930 ft of complex; spec 076: the Bauhaus Dessau, for 345 ft of school; spec 079: the
    // Salk Institute, for its 360 × 375 ft of wings
    for (const s of readdirSync('src/houses').filter((d) => existsSync(`src/houses/${d}/definition.ts`) && !['trellick-tower', 'habitat-67', 'bauhaus-dessau', 'salk-institute'].includes(d)))
      expect(readFileSync(`src/houses/${s}/definition.ts`, 'utf8'), s).not.toMatch(/shadowReach/);
    expect(H.shadowReach).toBeGreaterThan(120);
  });

  it('A13: the home card is live, with the real piece count and its credits; the numbers say "tower"', async () => {
    const c = await card('trellick-tower');
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toContain('the Royal Borough of Kensington and Chelsea');
    expect(c.wikidata).toBe('Q1571416');
    expect(H.text.noun).toBe('tower');
  });
});
