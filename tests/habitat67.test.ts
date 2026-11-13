// Spec: specs/072-habitat-67.md
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { HABITAT_67 as H } from '../src/houses/habitat-67/definition';
import { GRID } from '../src/houses/habitat-67/model/habitat';
import {
  BASE_TOP, BOX_L, BOX_W, BOXES, CORE_TOP, CORES, floorOf, inRect, LEVEL, LEVELS, levelY, Rect, STREET_LEVELS, STREETS, TOP,
} from '../src/houses/habitat-67/model/layout';
import { coveredAt, piers, PLEXI } from '../src/houses/habitat-67/model/house';
import { PLANTER, PLANTERS } from '../src/houses/habitat-67/model/landscape';
import { LOT_SELF } from '../src/houses/habitat-67/model/lotTerrain';
import { inBase, TERRAIN } from '../src/houses/habitat-67/model/site';
import { WATER_AREAS } from '../src/houses/habitat-67/model/water';
import { WATER_AREAS as FARNSWORTH_WATER } from '../src/houses/farnsworth-house/model/water';
import { P, PHASES } from '../src/houses/habitat-67/phases';
import { fnv1a, modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/habitat-67/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/habitat-67/model/${f}`, 'utf8');
/** the phase (+1) of whatever fills a cell, 0 for nothing (the builder's own occupancy) */
const phaseAt = (x: number, y: number, z: number) => builder.occAt(x, y, z) - 1;
const ring = LOT_SELF[0];
const PIERS = STREET_LEVELS.filter((u) => u > 0).map((u) => [u, piers(u)] as const);

describe('072: Habitat 67', () => {
  it('A1: the footprint fits OSM\'s way 440195613 (IoU ≥ 0.70); 284 m long along its axis', () => {
    let inter = 0, union = 0, x0 = Infinity, x1 = -Infinity;
    for (let z = -5; z < 305; z++)
      for (let x = -5; x < 940; x++) {
        const mine = inBase(x, z) || BOXES.some((b) => inRect(x, z, b.r));
        const osm = inPoly(x + 0.5, z + 0.5, ring);
        if (mine && osm) inter++;
        if (mine || osm) union++;
        if (mine) { x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); }
      }
    expect(inter / union).toBeGreaterThanOrEqual(0.7);
    expect(Math.abs(x1 - x0 - 284 / 0.3048)).toBeLessThanOrEqual(10);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
  }, 120_000);

  it('A2: 354 boxes, each 38 × 18 studs and 25 plates, along or across the axis, at a whole level over the base', () => {
    expect(BOXES.length).toBe(354);
    expect([BOX_L, BOX_W, LEVEL]).toEqual([38, 18, 25]);
    for (const b of BOXES) {
      const w = b.r[2] - b.r[0], d = b.r[3] - b.r[1];
      expect([w, d].sort((a, c) => a - c), `box ${b.i}`).toEqual([18, 38]);
      expect(b.o === 'x' ? w : d).toBe(38);
      expect(Number.isInteger(b.l) && b.l >= 0 && b.l < LEVELS).toBe(true);
      // the box itself is there: its floor at its level, its walls up to its roof
      expect(phaseAt(b.r[0] + 1, levelY(b.l), b.r[1] + 1), `floor of box ${b.i}`).toBe(P.STRUCTURE);
      expect(phaseAt(b.r[0], levelY(b.l) + 23, b.r[1]), `corner of box ${b.i}`).toBe(P.STRUCTURE);
      expect(phaseAt(b.r[0], levelY(b.l) + 24, b.r[1]), `roof edge of box ${b.i}`).toBe(P.STRUCTURE);
    }
    // no two boxes share space
    for (const a of BOXES) for (const b of BOXES) if (a.i < b.i && a.l === b.l) expect(inRect(a.r[0], a.r[1], b.r) && inRect(a.r[2] - 1, a.r[3] - 1, b.r) ? 1 : 0).toBe(0);
  }, 60_000);

  it('A3: at most 12 levels, the top exactly 12 × 25 plates over the base; three separate peaks on the avenue side, each ≥ level 10', () => {
    expect(Math.max(...BOXES.map((b) => b.l))).toBe(LEVELS - 1);
    expect(LEVELS).toBe(12);
    expect(TOP - BASE_TOP).toBe(12 * 25);
    const top = Math.max(...bricks.filter((b) => b.phase === P.STRUCTURE).map((b) => b.y + b.h));
    expect(top).toBe(TOP);
    // the avenue's side: boxes west of the spine's street
    const profile = Array.from({ length: 940 }, (_, x) => Math.max(-1, ...BOXES.filter((b) => b.r[1] + b.r[3] < 2 * 118 && x >= b.r[0] && x < b.r[2]).map((b) => b.l)));
    const peaks: [number, number][] = [];
    let x = 0;
    while (x < profile.length) {
      if (profile[x] >= 10) { const s = x; while (x < profile.length && profile[x] >= 9) x++; peaks.push([s, x]); } else x++;
    }
    expect(peaks.length).toBe(3);
    for (let i = 1; i < peaks.length; i++) expect(Math.min(...profile.slice(peaks[i - 1][1], peaks[i][0]))).toBeLessThanOrEqual(8);
  }, 60_000);

  it('A4: no box hangs free; every box inside the lot', () => {
    const holds = (l: number): Rect[] => [
      ...(l < 0 ? [] : BOXES.filter((b) => b.l === l).map((b) => b.r)),
      ...(STREET_LEVELS.includes(l) ? STREETS : []),
      ...CORES,
    ];
    for (const b of BOXES) {
      let held = false;
      for (let z = b.r[1]; z < b.r[3] && !held; z++)
        for (let x = b.r[0]; x < b.r[2] && !held; x++)
          held = b.l === 0 ? inBase(x, z) : holds(b.l - 1).some((r) => inRect(x, z, r));
      expect(held, `box ${b.i} at level ${b.l}`).toBe(true);
      // and in the model: something under its floor
      expect(b.r[0] >= TERRAIN.x0 && b.r[1] >= TERRAIN.z0 && b.r[2] <= TERRAIN.x1 && b.r[3] <= TERRAIN.z1).toBe(true);
    }
    for (const b of BOXES.filter((q) => q.l === 0)) expect(phaseAt(b.r[0] + 2, BASE_TOP - 1, b.r[1] + 2)).toBe(P.FOUNDATION);
  }, 60_000);

  it('A5: three cores to the highest street; streets every fourth floor, on the 6th and 10th; each ≥ 80% of the length; cores meet them', () => {
    expect(CORES.length).toBe(3);
    const floors = STREET_LEVELS.map(floorOf);
    expect(floors).toContain(6);
    expect(floors).toContain(10);
    for (let i = 1; i < floors.length; i++) expect(floors[i] - floors[i - 1]).toBe(4);
    const highest = Math.max(...STREET_LEVELS);
    expect(CORE_TOP).toBeGreaterThanOrEqual(levelY(highest + 1));
    const length = Math.max(...BOXES.map((b) => b.r[2])) - Math.min(...BOXES.map((b) => b.r[0]));
    for (const l of STREET_LEVELS) {
      const y = levelY(l);
      const xs = new Set<number>();
      for (const r of STREETS.filter((q) => q[2] - q[0] > q[3] - q[1])) for (let x = r[0] + 1; x < r[2] - 1; x++) {
        const z = r[1] + 2;
        // the street's deck is there all along, and its walking space is clear
        expect(phaseAt(x, y, z), `street ${l} deck at ${x},${z}`).toBe(l === 0 ? P.FLOOR : P.STRUCTURE);
        // (but for the piers carrying the street above)
        const pier = PIERS.filter(([u]) => u > l).some(([, ps]) => ps.some((q) => x >= q.x && x < q.x + 2 && z + 3 >= q.z && z + 3 < q.z + 2));
        if (!pier) expect(phaseAt(x, y + 5, z + 3), `street ${l} open at ${x},${z + 3}`).toBe(-1);
        xs.add(x);
      }
      expect(xs.size / length).toBeGreaterThanOrEqual(0.8);
      for (const c of CORES) {
        const s = STREETS.find((r) => r[3] === c[1] && r[0] < c[0] && r[2] > c[2]);
        expect(s, `core ${c} beside a street`).toBeTruthy();
        // a doorway from the core onto the street at this level
        const mid = Math.floor((c[0] + c[2]) / 2);
        expect(phaseAt(mid, y + 8, c[1])).toBe(-1);
        expect(phaseAt(c[0], y + 8, c[1])).toBe(P.STRUCTURE);
      }
    }
  }, 60_000);

  it('A6: every box with half its roof open has a terrace with a guardrail; at least 146 boxes have a planter', () => {
    for (const b of BOXES) {
      let open = 0;
      for (let z = b.r[1]; z < b.r[3]; z++) for (let x = b.r[0]; x < b.r[2]; x++) if (!coveredAt(b, x, z)) open++;
      if (open * 2 < BOX_L * BOX_W) continue;
      const y = levelY(b.l + 1);
      const rail = bricks.some((q) => q.kind === 'glass' && q.color === PLEXI && q.y === y && q.phase === P.ENVELOPE && inRect(q.x, q.z, b.r));
      expect(rail, `guardrail on box ${b.i}`).toBe(true);
    }
    let planted = 0;
    BOXES.forEach((b, i) => {
      const s = PLANTERS[i];
      if (s && bricks.some((q) => q.color === PLANTER && q.phase === P.LANDSCAPE && q.x === s[0] && q.z === s[1] && q.y === levelY(b.l + 1) + 1)) planted++;
    });
    expect(planted).toBeGreaterThanOrEqual(146);
  }, 60_000);

  it('A7: deterministic, inside its grid, no overlaps; every phase used; about 3 minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    const seen = new Uint8Array(GRID.nx * GRID.nz * GRID.ny);
    let overlaps = 0;
    for (const b of bricks)
      for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
        const i = ((y - GRID.y0) * GRID.nz + (z - GRID.z0)) * GRID.nx + (x - GRID.x0);
        if (seen[i]) overlaps++;
        seen[i] = 1;
      }
    expect(overlaps).toBe(0);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(160);
    expect(s.total).toBeLessThan(200);
  }, 120_000);

  it('A9: everything marked with its source; enough marks in the interior', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(5);
  }, 60_000);

  it('A10: the budget: ≤ 50,000 pieces, ≤ 30,000 in the building; the grid ≤ 80 MB', () => {
    expect(bricks.length).toBeLessThanOrEqual(50_000);
    const building = bricks.filter((b) => b.phase >= P.FOUNDATION && b.phase <= P.ROOF).length;
    expect(building).toBeLessThanOrEqual(30_000);
    expect((GRID.nx * GRID.nz * GRID.ny) / 2).toBeLessThanOrEqual(80 * 1024 * 1024);
    expect(builder.occ.byteLength).toBeLessThanOrEqual(80 * 1024 * 1024);
  }, 60_000);

  it('A11: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  }, 60_000);

  it('A12: the terrain has no spikes (spec 010b)', () => {
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
  }, 60_000);

  it('A13: the St. Lawrence within 60 ft of the east face, below the base\'s floor; no other house\'s water changes', () => {
    expect(H.scenery?.waterAreas).toBe(WATER_AREAS);
    const wet = (x: number, z: number) => WATER_AREAS.some((a) => a.kind === 'river' && inPoly(x, z, a.rings[0]) && !a.rings.slice(1).some((h) => inPoly(x, z, h)));
    const river = WATER_AREAS.filter((a) => a.kind === 'river');
    expect(river.length).toBeGreaterThan(0);
    for (const a of river) expect(a.level).toBeLessThan(0);
    // the river runs all along the east side, and comes within 60 ft of the building's east face
    let nearest = Infinity;
    for (let x = 5; x < 930; x += 10) {
      const east = Math.max(...BOXES.filter((b) => x >= b.r[0] && x < b.r[2]).map((b) => b.r[3]));
      let found = false;
      for (let d = 0; d <= 300 && !found; d += 2) if (wet(x, east + d)) { nearest = Math.min(nearest, d); found = true; }
      expect(found, `river east of x ${x}`).toBe(true);
    }
    expect(nearest).toBeLessThanOrEqual(60);
    // the Farnsworth House's water areas are as they were (spec 022); the Glass House (spec 073) has its own
    expect(fnv1a(JSON.stringify(FARNSWORTH_WATER))).toBe('7276801b');
    const others = readdirSync('src/houses').filter((d) => existsSync(`src/houses/${d}/definition.ts`) && !['habitat-67', 'farnsworth-house', 'glass-house'].includes(d));
    for (const s of others) expect(readFileSync(`src/houses/${s}/definition.ts`, 'utf8'), s).not.toMatch(/waterAreas/);
  }, 60_000);

  it('A14: the home card is live, with the real piece count and its credits; the numbers say "complex"', async () => {
    const { HOUSES } = await import('../src/houses');
    const c = HOUSES.find((h) => h.slug === 'habitat-67')!;
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toEqual(['Habitat 67', 'Safdie Architects']);
    expect(c.wikidata).toBe('Q1032248');
    expect(c.sources?.join(' ')).toMatch(/OpenStreetMap/);
    expect(H.text.noun).toBe('complex');
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with Habitat 67 or Safdie Architects.');
  }, 60_000);
});
