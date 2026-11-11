// Spec: specs/060-sonneveld-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { SONNEVELD as H } from '../src/houses/sonneveld-house/definition';
import { GRID } from '../src/houses/sonneveld-house/model/sonneveld';
import { BALCONY, BLOCK, COLUMNS_X, COLUMNS_Z, GARAGE, RECESS, SETBACK, SPIRAL, TOWER, Y } from '../src/houses/sonneveld-house/model/layout';
import { STEEL } from '../src/houses/sonneveld-house/model/house';
import { TERRAIN } from '../src/houses/sonneveld-house/model/site';
import { P, PHASES } from '../src/houses/sonneveld-house/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/sonneveld-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/sonneveld-house/model/${f}`, 'utf8');
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

describe('060: the Sonneveld House', () => {
  it('A1: the footprint fits OSM\'s way 255337548 (IoU ≥ 0.75); 9.85 m deep, 16.30 m along the north side', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(BLOCK[3] - BLOCK[1] - 9.85 * M)).toBeLessThanOrEqual(2);
    expect(Math.abs(GARAGE[3] - BLOCK[1] - 16.3 * M)).toBeLessThanOrEqual(2);
  });

  it('A2: twelve steel columns from the ground to the roof slab; floors at about 3.15, 6.65 and 10.0 m', () => {
    expect(COLUMNS_X.length * COLUMNS_Z.length).toBe(12);
    for (const x of COLUMNS_X) for (const z of COLUMNS_Z) for (const y of [1, Y.F1 + 3, Y.F2 + 3, Y.ROOF - 4]) expect(at(x, y, z === 0 && y > Y.F1 ? 1 : z)?.phase, `column ${x},${z} at ${y}`).toBe(P.STRUCTURE);
    for (const [y, m] of [[Y.F1, 3.15], [Y.F2, 6.65], [Y.ROOF, 10.0]]) expect(Math.abs(y * PLATE - m * M)).toBeLessThanOrEqual(1);
    for (const y of [Y.F1, Y.F2]) expect(at(25, y - 1, 8)?.phase).toBe(P.STRUCTURE);
    expect(at(25, Y.ROOF - 1, 8)?.phase).toBe(P.ROOF);
  });

  it('A3: the street front: a set-back ground floor, one ribbon of glass on the first floor, four windows on the second', () => {
    expect(at(25, 6, 0)).toBeUndefined(); // open under the overhang
    expect(at(25, 6, SETBACK)?.phase).toBe(P.ENVELOPE);
    // runs of window (glass and its steel) along the front at a height
    const glassRuns = (y: number) => {
      const runs: number[] = []; let run = 0;
      for (let x = BLOCK[0]; x <= BLOCK[2]; x++) {
        const c = at(x, y, 0), w = !!c && c.phase === P.ENVELOPE && (c.kind === 'glass' || c.color === STEEL);
        if (w) run++; else if (run) { runs.push(run); run = 0; }
      }
      return runs;
    };
    const ribbon = glassRuns(Y.F1 + 12).filter((r) => r > 3);
    expect(ribbon.length).toBe(1);
    expect(ribbon[0]).toBeGreaterThanOrEqual(48);
    expect(glassRuns(Y.F2 + 13).filter((r) => r > 2).length).toBe(4);
  });

  it('A4: the south-east corner cut away for a balcony on both upper floors, with solid parapets; the spiral stair by the lower', () => {
    for (const f of [Y.F1, Y.F2]) {
      expect(at(8, f + 12, 24)).toBeUndefined(); // open air in the recess
      expect(at(8, f - 1, 24)?.phase).toBe(P.STRUCTURE); // its floor
      expect(at(BALCONY[0], f + 4, 24)?.kind).toBe('brick'); // the parapet
      expect(at(RECESS[2], f + 10, 24)?.phase).toBe(P.ENVELOPE); // the glass wall behind
    }
    expect(at(SPIRAL.cx, 10, SPIRAL.cz)?.kind).toBe('round');
    expect(SPIRAL.cx).toBeLessThan(BLOCK[0] + 1);
  });

  it('A5: the roof is a terrace: a balustrade all round, a stair tower and a chimney above it', () => {
    for (const [x, z] of [[10, 0], [BLOCK[2] - 1, 28], [10, BLOCK[3] - 1], [0, 10]]) expect(at(x, Y.RAIL - 1, z)?.phase, `rail at ${x},${z}`).toBe(P.ROOF);
    expect(at(TOWER[0], Y.TOWER - 6, TOWER[1] + 1)?.phase).toBe(P.ROOF);
    expect(Y.CHIMNEY).toBeGreaterThan(Y.TOWER);
    expect(at(20, Y.ROOF + 6, 12)).toBeUndefined(); // open terrace
  });

  shared({ inv: 'A6', marks: 'A8', edges: 'A9', spikes: 'A10' }, 135, 170, 8);

  it('A8: the interior uses red, blue and yellow', () => {
    const colours = new Set(bricks.filter((b) => b.phase === P.INTERIOR).map((b) => b.color));
    for (const c of [0xd4452c, 0x5b82c9, 0xf0c53a]) expect(colours.has(c), c.toString(16)).toBe(true);
  });

  it('A11: the home card is live, with the real piece count and its credits', async () => {
    const c = await card('sonneveld-house');
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toContain('the Nieuwe Instituut');
    expect(c.wikidata).toBe('Q2193739');
  });
});
