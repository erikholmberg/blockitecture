// Spec: specs/062-unity-temple.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { UNITY_TEMPLE as H } from '../src/houses/unity-temple/definition';
import { GRID } from '../src/houses/unity-temple/model/temple';
import { ALCOVE_E, ALCOVE_N, ALCOVE_W, AXIS, DOORS, FOYER, HALL, inRoof, PIERS, SQUARE, TEMPLE, TERRACE_W, TOWERS, Y } from '../src/houses/unity-temple/model/layout';
import { AMBER, COLUMN_AT, ORNAMENT } from '../src/houses/unity-temple/model/house';
import { TERRAIN } from '../src/houses/unity-temple/model/site';
import { P, PHASES } from '../src/houses/unity-temple/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/unity-temple/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/unity-temple/model/${f}`, 'utf8');
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
const house = bricks.filter((b) => b.phase !== P.SITE && b.phase !== P.LANDSCAPE);

describe('062: Unity Temple', () => {
  it('A1: the footprint fits OSM\'s way 25885395 (IoU ≥ 0.75); 142 ft long, 91′-6″ wide', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(HALL[2] - ALCOVE_N.x - 142)).toBeLessThanOrEqual(1);
    const zs = house.filter((b) => b.phase === P.STRUCTURE && b.x >= HALL[0]).flatMap((b) => [b.z, b.z + b.d]);
    expect(Math.abs(Math.max(...zs) - Math.min(...zs) - ft(91, 6))).toBeLessThanOrEqual(1);
  });

  it('A2: the temple: 64 ft across four towers; alcove walls 38 ft long, proud of the towers, blank on Lake Street', () => {
    expect(TEMPLE[2] - TEMPLE[0]).toBe(64);
    expect(TEMPLE[3] - TEMPLE[1]).toBe(64);
    expect(TOWERS.length).toBe(4);
    for (const t of TOWERS) { expect(Math.abs(t[2] - t[0] - ft(11, 8))).toBeLessThanOrEqual(0.5); expect(at(t[0], Y.TOWER - 3, t[1])?.phase).toBe(P.STRUCTURE); }
    expect(ALCOVE_N.z1 - ALCOVE_N.z0).toBe(38);
    expect(ALCOVE_E.x1 - ALCOVE_E.x0).toBe(38);
    expect(ALCOVE_N.x).toBeLessThan(TEMPLE[0]);
    expect(ALCOVE_E.z).toBeLessThan(TEMPLE[1]);
    expect(ALCOVE_W.z).toBeGreaterThanOrEqual(TEMPLE[3]);
    for (let z = ALCOVE_N.z0; z < ALCOVE_N.z1; z++) for (let y = 0; y < Y.SILL; y += 3) expect(at(ALCOVE_N.x, y, z)?.kind, `north wall ${z},${y}`).toBe('brick');
  });

  it('A3: the clerestory: six columns a side with glass between, from the sill to the roof; ornament on their upper parts', () => {
    expect(COLUMN_AT.length).toBe(12); // six columns, two studs each
    const sides: [(u: number) => [number, number], string][] = [
      [(u) => [ALCOVE_N.x, ALCOVE_N.z0 + u], 'north'], [(u) => [ALCOVE_E.x0 + u, ALCOVE_E.z], 'east'], [(u) => [ALCOVE_W.x0 + u, ALCOVE_W.z], 'west'],
    ];
    for (const [cell, name] of sides) {
      let columns = 0, glass = 0;
      for (let u = 0; u < 38; u++) {
        const [x, z] = cell(u), lo = at(x, Y.SILL + 2, z), hi = at(x, Y.CEILING - 2, z);
        expect(lo?.phase, `${name} ${u}`).toBe(P.ENVELOPE);
        if (lo?.kind === 'glass') { glass++; expect(hi?.kind).toBe('glass'); } else { columns++; expect(ORNAMENT, `${name} ${u}`).toContain(hi?.color); expect(ORNAMENT).not.toContain(lo?.color); }
      }
      expect(columns).toBe(12);
      expect(glass).toBe(26);
    }
  });

  it('A4: a cross of roof slabs past the walls; 25 amber skylights, five by five, under its middle', () => {
    expect(inRoof(ALCOVE_N.x - 4, AXIS)).toBe(true);
    expect(inRoof(30, ALCOVE_E.z - 4)).toBe(true);
    expect(inRoof(-3, 10)).toBe(false); // the cross's corners are open
    expect(at(ALCOVE_N.x - 4, Y.CEILING + 1, AXIS)?.phase).toBe(P.ROOF);
    const lights = bricks.filter((b) => b.kind === 'light' && b.color === AMBER && b.y === Y.CEILING + 3 && b.x >= SQUARE[0] && b.x < SQUARE[2]);
    const seen = new Set<string>();
    for (const b of lights) seen.add(`${Math.floor((b.x - SQUARE[0]) / 6)},${Math.floor((b.z - SQUARE[1]) / 6)}`);
    expect(seen.size).toBe(25);
  });

  it('A5: four piers from the floor to the roof; two tiers of galleries on the north, east and west, none on the south', () => {
    expect(PIERS.length).toBe(4);
    for (const p of PIERS) for (const y of [Y.AUDITORIUM + 1, Y.CEILING - 2]) expect(at(p[0], y, p[1])?.phase).toBe(P.STRUCTURE);
    for (const g of [Y.GALLERY1, Y.GALLERY2]) {
      expect(at(8, g - 1, AXIS)?.kind, 'north').toBe('plate');
      expect(at(33, g - 1, 20)?.kind, 'east').toBe('plate');
      expect(at(33, g - 1, 70)?.kind, 'west').toBe('plate');
      expect(at(60, g - 1, AXIS)?.kind, 'south').not.toBe('plate');
    }
  });

  it('A6: the foyer between the two blocks; a bank of doors each side, hidden behind a terrace wall taller than a person', () => {
    expect(FOYER[0]).toBe(TEMPLE[2]);
    expect(FOYER[2]).toBe(HALL[0]);
    expect(Math.abs(FOYER[2] - FOYER[0] - ft(24, 10))).toBeLessThanOrEqual(0.5);
    expect(Math.abs(FOYER[3] - FOYER[1] - ft(27, 4))).toBeLessThanOrEqual(1);
    for (const z of [FOYER[1], FOYER[3] - 1]) expect(at(DOORS.x0 + 4, Y.FOYER + 5, z)?.phase).toBe(P.ENVELOPE);
    expect(at(78, Y.BULKHEAD - 2, TERRACE_W[3] - 1)?.phase).toBe(P.STRUCTURE);
    expect((Y.BULKHEAD - Y.FOYER) * PLATE).toBeGreaterThanOrEqual(4.5); // above the terrace
    expect(Y.BULKHEAD * PLATE).toBeGreaterThanOrEqual(8); // above the pavement
  });

  it('A7: symmetrical about its long axis', () => {
    const key = (x: number, y: number, z: number, b: { kind: string; phase: number }) => `${x},${y},${z},${b.kind},${b.phase}`;
    const all = new Set<string>();
    for (const b of house) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) all.add(key(x, y, z, b));
    let missing = 0;
    for (const b of house) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++)
      if (!all.has(key(x, y, 2 * AXIS - 1 - z, b))) missing++;
    expect(missing / all.size).toBeLessThan(0.02); // but for the pulpit's furniture and a few colours
  });

  shared({ inv: 'A8', marks: 'A10', edges: 'A11', spikes: 'A12' }, 135, 175, 8);

  it('A13: the home card is live, with the real piece count and its credits; the numbers say "temple"', async () => {
    const c = await card('unity-temple');
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toContain('the Frank Lloyd Wright Trust');
    expect(c.wikidata).toBe('Q1680814');
    expect(H.text.noun).toBe('temple');
  });
});
