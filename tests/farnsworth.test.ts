// Spec: specs/022-farnsworth-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { parseNeighborhood, sampleGrid, waterAreaAt, waterAreaLevels } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { EAMES } from '../src/houses/eames-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { GRID } from '../src/houses/farnsworth-house/model/farnsworthHouse';
import { TRAVERTINE, WHITE } from '../src/houses/farnsworth-house/model/house';
import { COLUMN_X, COLUMN_Z, HOUSE, PORCH, STEPS_LOWER, STEPS_UPPER, TERRACE, TERRACE_COLUMNS, Y } from '../src/houses/farnsworth-house/model/layout';
import { TERRAIN } from '../src/houses/farnsworth-house/model/site';
import { WATER_AREAS } from '../src/houses/farnsworth-house/model/water';
import { P, PHASES } from '../src/houses/farnsworth-house/phases';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = FARNSWORTH.build();
const bricks = builder.bricks;
const file = readFileSync('public/farnsworth-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const HOUSE_PHASES = [P.FOUNDATION, P.FLOOR, P.STRUCTURE, P.ENVELOPE, P.ROOF];
const ft = (plates: number) => plates * PLATE;
const src = (f: string) => readFileSync(`src/houses/farnsworth-house/model/${f}`, 'utf8');

describe('022: the Farnsworth House', () => {
  it('A1: the other houses\' models, piece counts and timelines are unchanged', () => {
    // pinned after spec 019 (05a8a46), before spec 022's engine change
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
      [SCHRODER, { count: 10668, hash: '501f28e6' }, 182.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  });

  it('A2: water areas are opt-in, and sit at the river\'s level along OSM\'s outlines', () => {
    for (const h of [STAHL, EAMES, FALLINGWATER, SCHRODER]) expect(h.scenery?.waterAreas).toBeUndefined();
    const fox = WATER_AREAS.filter((a) => a.kind === 'river');
    expect(fox.length).toBeGreaterThan(0);
    // a square pond: inside it the level, outside and in its hole null; the grid helper agrees
    const pond = { name: '', kind: 'pond', level: -7, rings: [[[0, 0], [100, 0], [100, 100], [0, 100]], [[40, 40], [60, 40], [60, 60], [40, 60]]] as [number, number][][] };
    expect(waterAreaAt([pond], 20, 20)).toBe(-7);
    expect(waterAreaAt([pond], 50, 50)).toBeNull();
    expect(waterAreaAt([pond], 150, 20)).toBeNull();
    const lv = waterAreaLevels({ x0: 0, z0: 0, step: 20, nx: 8, nz: 8, h: new Int16Array(64) } as never, [pond]);
    expect(lv[1 * 8 + 1]).toBe(-7);
    expect(Number.isNaN(lv[2 * 8 + 2])).toBe(true); // (40, 40): on the hole's corner → in the hole
    expect(Number.isNaN(lv[7 * 8 + 7])).toBe(true);
    // the Fox River by the house (any river area within 300 ft) is below the floor and the meadow
    const nearby = fox.filter((a) => a.rings[0].some(([x, z]) => Math.hypot(x - 68, z - 22) < 300));
    expect(nearby.length).toBeGreaterThan(0);
    for (const a of nearby) expect(a.level).toBeLessThan(-4);
  });

  it('A3: dimensions from HABS IL-1105 (±1 ft)', () => {
    expect(Math.abs(HOUSE[2] - HOUSE[0] - (77 + 3.5 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(HOUSE[3] - HOUSE[1] - (28 + 8 / 12))).toBeLessThanOrEqual(1);
    for (let i = 1; i < COLUMN_X.length; i++) expect(COLUMN_X[i] - COLUMN_X[i - 1]).toBe(22);
    expect(Math.abs(COLUMN_X[0] + 0.5 - HOUSE[0] - (5 + 7.875 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(HOUSE[2] - COLUMN_X[3] - 0.5 - (5 + 7.875 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(ft(Y.FLOOR - Y.TERRACE) - (2 + 4 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(ft(Y.CEILING - Y.TERRACE) - (11 + 9 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(ft(Y.CORNICE - Y.TERRACE) - (13 + 6 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(TERRACE[2] - TERRACE[0] - (55 + 3 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(TERRACE[3] - TERRACE[1] - 22)).toBeLessThanOrEqual(1);
    expect(PORCH[2] - PORCH[0]).toBeGreaterThan(18); // the open porch at the west end
  });

  it('A4: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(FARNSWORTH.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    const seen = new Set<number>();
    let overlaps = 0;
    for (const b of bricks)
      for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
        const k = ((y - GRID.y0) * GRID.nz + (z - GRID.z0)) * GRID.nx + (x - GRID.x0);
        if (seen.has(k)) overlaps++; else seen.add(k);
      }
    expect(overlaps).toBe(0);
  });

  it('A5: every phase used, about 3 minutes; the meadow wave stacks bottom-up', () => {
    const s = sequence(bricks, PHASES, FARNSWORTH.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(165);
    expect(s.total).toBeLessThan(200);
    const cells = new Map<number, number[]>();
    bricks.forEach((b, i) => {
      if (b.phase !== P.SITE) return;
      for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) { const k = x * 4096 + z; (cells.get(k) ?? cells.set(k, []).get(k)!).push(i); }
    });
    let bad = 0;
    for (const list of cells.values()) {
      list.sort((a, c) => bricks[a].y - bricks[c].y);
      for (let j = 1; j < list.length; j++) if (s.start[list[j]] < s.start[list[j - 1]]) { bad++; break; }
    }
    expect(bad).toBe(0);
  });

  it('A6: the house floats: nothing under the floor slab but the steps and the columns', () => {
    const cols = new Set([...COLUMN_X.flatMap((x) => COLUMN_Z.map((z) => `${x},${z}`)), ...TERRACE_COLUMNS.map(([x, z]) => `${x},${z}`)]);
    const under = bricks.filter((b) => HOUSE_PHASES.includes(b.phase) && b.y + b.h <= Y.FLOOR_UNDER
      && b.x < HOUSE[2] && b.x + b.w > HOUSE[0] && b.z < HOUSE[3] && b.z + b.d > HOUSE[1]
      && !(b.x >= STEPS_UPPER[0] && b.x < STEPS_UPPER[2] && b.z >= STEPS_UPPER[1])
      && !(b.w === 1 && b.d === 1 && cols.has(`${b.x},${b.z}`))
      && !(b.phase === P.FOUNDATION));
    expect(under.map((b) => `${b.kind} ${b.x},${b.y},${b.z}`)).toEqual([]);
    void STEPS_LOWER;
  });

  it('A7: the steel is all one white; the floors and terraces travertine; the core primavera, the wardrobe teak', () => {
    const steel = bricks.filter((b) => b.phase === P.STRUCTURE && b.w === 1 && b.d === 1 && b.y + b.h === Y.CORNICE);
    expect(steel.length).toBeGreaterThanOrEqual(8);
    for (const b of steel) expect(b.color).toBe(WHITE);
    const floorTop = bricks.filter((b) => b.y === Y.FLOOR - 1 && b.kind === 'tile' && b.x > HOUSE[0] && b.x < HOUSE[2] - 1 && b.z > HOUSE[1] && b.z < HOUSE[3] - 1);
    expect(floorTop.length).toBeGreaterThan(0);
    for (const b of floorTop) expect(TRAVERTINE).toContain(b.color);
    expect(src('interior.ts')).toMatch(/PRIMAVERA = 0xd8b67a/);
    expect(src('interior.ts')).toMatch(/TEAK = 0x8a5a33/);
  });

  it('A8: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A9: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A10: placed from OSM (IoU ≥ 0.8), within 10° of the HABS north arrow (18°)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.8);
    expect(FARNSWORTH.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(n.anchor.rotationDeg - 18)).toBeLessThanOrEqual(10);
  });

  it('home card: live, with the real piece count, its credits and the no-affiliation line', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'farnsworth-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toEqual(['the National Trust for Historic Preservation', 'the Farnsworth House']);
    expect(card.sources?.some((s) => /HABS IL-1105/.test(s))).toBe(true);
  });
});
