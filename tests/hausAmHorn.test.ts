// Spec: specs/063-haus-am-horn.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { HAUS_AM_HORN as H } from '../src/houses/haus-am-horn/definition';
import { GRID } from '../src/houses/haus-am-horn/model/hausAmHorn';
import { CLERESTORY, CORE, CORE_DOORS, HOUSE, LIVING, NICHE_OPENING, OPENINGS, PARTITIONS, Y } from '../src/houses/haus-am-horn/model/layout';
import { floorColor, roomAt } from '../src/houses/haus-am-horn/model/house';
import { TERRAIN } from '../src/houses/haus-am-horn/model/site';
import { P, PHASES } from '../src/houses/haus-am-horn/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/haus-am-horn/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/haus-am-horn/model/${f}`, 'utf8');
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

describe('063: the Haus am Horn', () => {
  it('A1: the footprint fits OSM\'s way 35984274 (IoU ≥ 0.75); 12.70 m square', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(HOUSE[2] - HOUSE[0] - 12.7 * M)).toBeLessThanOrEqual(1);
    expect(HOUSE[2] - HOUSE[0]).toBe(HOUSE[3] - HOUSE[1]);
  });

  it('A2: the living room 6 × 6 m, central, 4.14 m high; the ring lower, the middle block above its roof', () => {
    expect(Math.abs(LIVING[2] - LIVING[0] - 6 * M)).toBeLessThanOrEqual(1);
    expect(LIVING[2] - LIVING[0]).toBe(LIVING[3] - LIVING[1]);
    expect(LIVING[0] - HOUSE[0]).toBe(HOUSE[2] - LIVING[2]);
    expect(LIVING[1] - HOUSE[1]).toBe(HOUSE[3] - LIVING[3]);
    expect(Math.abs(Y.CEILING * PLATE - 4.14 * M)).toBeLessThanOrEqual(0.5);
    expect(Y.RING_CEILING).toBeLessThan(Y.CEILING);
    expect(Y.ROOF).toBeGreaterThan(Y.RING_ROOF);
    expect(at(21, Y.CEILING - 2, 21)).toBeUndefined(); // open up to its ceiling
    expect(at(21, Y.CEILING, 21)?.phase).toBe(P.ROOF);
    expect(at(5, Y.RING_CEILING, 5)?.phase).toBe(P.ROOF);
  });

  it('A3: the clerestory on the far front\'s and the street\'s sides only', () => {
    const y = Y.RING_ROOF + 3, mid = (CLERESTORY[0] + CLERESTORY[1]) >> 1;
    expect(at(CORE[2] - 1, y, mid + 1)?.kind).toBe('glass');
    expect(at(mid + 1, y, CORE[3] - 1)?.kind).toBe('glass');
    expect(at(CORE[0], y, mid + 1)?.kind).toBe('brick');
    expect(at(mid + 1, y, CORE[1])?.kind).toBe('brick');
  });

  it('A4: each front\'s documented openings', () => {
    expect(OPENINGS.north.windows.length).toBe(3);
    expect(OPENINGS.east.windows.length).toBe(2);
    expect(OPENINGS.south.windows.length).toBe(3);
    expect(OPENINGS.west.windows.length).toBe(3);
    const y = Y.SILL + 4;
    const glassRuns = (cell: (u: number) => [number, number]) => {
      let runs = 0, inRun = false;
      for (let u = 0; u < 42; u++) { const [x, z] = cell(u), b = at(x, y, z), w = !!b && b.phase === P.ENVELOPE && b.kind !== 'brick'; if (w && !inRun) runs++; inRun = w; }
      return runs;
    };
    expect(glassRuns((u) => [0, u])).toBe(3);
    expect(glassRuns((u) => [u, 0])).toBe(2);
    expect(glassRuns((u) => [41, u])).toBe(3);
    expect(glassRuns((u) => [u, 41])).toBe(3);
    // the doors: the front door and the children's room's garden door
    expect(at(0, 5, OPENINGS.north.door[0] + 1)?.phase).toBe(P.ENVELOPE);
    expect(at(OPENINGS.east.door[0] + 1, 5, 0)?.phase).toBe(P.ENVELOPE);
  });

  it('A5: thirteen rooms; the dining room\'s floor chequered in red, blue and white', () => {
    const rooms = new Map<string, number>();
    for (let z = 1; z < 41; z++) for (let x = 1; x < 41; x++) rooms.set(roomAt(x, z), (rooms.get(roomAt(x, z)) ?? 0) + 1);
    expect(rooms.size).toBe(13);
    for (const [name, area] of rooms) expect(area, name).toBeGreaterThan(10);
    const dining = new Set<number>();
    for (let z = 1; z < 10; z++) for (let x = 13; x < 22; x++) dining.add(floorColor(x, z));
    expect(dining.size).toBe(3);
    expect(at(15, -1, 5)?.color).toBe(floorColor(15, 5));
  });

  it('A6: the niche open to the living room; a doorway on each of the living room\'s other three sides', () => {
    for (let x = NICHE_OPENING[0]; x < NICHE_OPENING[2]; x++) expect(at(x, 8, NICHE_OPENING[1]), `niche ${x}`).toBeUndefined();
    expect(CORE_DOORS.length).toBe(4);
    for (const d of CORE_DOORS) expect(at(d[0], 8, d[1]), `door ${d}`).toBeUndefined();
    expect(PARTITIONS.length).toBe(12);
  });

  shared({ inv: 'A7', marks: 'A9', edges: 'A10', spikes: 'A11' }, 110, 150, 10);

  it('A10: the ground falls toward the street', () => {
    expect(hm.at(21, TERRAIN.z1 - 2) * PLATE).toBeLessThan(-10);
    expect(hm.at(21, TERRAIN.z0 + 2) * PLATE).toBeGreaterThan(3);
  });

  it('A12: the home card is live, with the real piece count and its credits', async () => {
    const c = await card('haus-am-horn');
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toContain('the Klassik Stiftung Weimar');
    expect(c.wikidata).toBe('Q525226');
  });
});
