// Spec: specs/035-casa-luis-barragan.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { BARRAGAN } from '../src/houses/casa-luis-barragan/definition';
import { GRID } from '../src/houses/casa-luis-barragan/model/barraganHouse';
import { ORANGE, PINK, TERRACE_WHITE } from '../src/houses/casa-luis-barragan/model/house';
import { STAIR_TREADS, treadTop } from '../src/houses/casa-luis-barragan/model/interior';
import { GARDEN, HOUSE, LIBRARY, TERRACE, Y } from '../src/houses/casa-luis-barragan/model/layout';
import { TERRAIN } from '../src/houses/casa-luis-barragan/model/site';
import { P, PHASES } from '../src/houses/casa-luis-barragan/phases';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = BARRAGAN.build();
const bricks = builder.bricks;
const file = readFileSync('public/casa-luis-barragan/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/casa-luis-barragan/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);

describe('035: Casa Luis Barragán', () => {
  it('A1: the other houses\' models, piece counts and timelines are unchanged', () => {
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
      [SCHRODER, { count: 10668, hash: '501f28e6' }, 182.7],
      [FARNSWORTH, { count: 13052, hash: 'ca43acd9' }, 180.7],
      [ENNIS, { count: 31820, hash: '0b6ef15e' }, 240.7],
      [MALAPARTE, { count: 59758, hash: 'c84ca868' }, 180.7],
      [KAUFMANN, { count: 20326, hash: '7d7eade4' }, 184.7],
      [LOVELL, { count: 23428, hash: '9515e85a' }, 240.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 60_000);

  it('A2: the footprint fits OSM\'s way 199693850 (IoU ≥ 0.75); the dimensions match the 1:200 plans (±1 ft)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(BARRAGAN.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // read off the plans at their scale bar: the house 31.1 × 16.2 m, the garden 22.3 × 24.1 m; the first floor 2.9 m up and the
    // roof 6.0 m (the cross section, p. 71)
    const near = (v: number, metres: number) => expect(Math.abs(v - metres * M)).toBeLessThanOrEqual(1);
    near(HOUSE[2] - HOUSE[0], 31.1);
    near(HOUSE[3] - HOUSE[1], 16.2);
    near(GARDEN[2] - GARDEN[0], 22.3);
    near(GARDEN[3] - GARDEN[1], 24.1);
    near(Y.FIRST * PLATE, 2.9);
    near(Y.ROOF * PLATE, 6.0);
  });

  it('A3: the roof terrace: walls of pink, orange and white, all above eye level, nothing over it', () => {
    const [tx0, tz0, tx1, tz1] = TERRACE;
    const colours = new Set<number>();
    for (const b of bricks) if (b.phase === P.ROOF && b.y >= Y.ROOF && b.x >= tx0 && b.x < tx1 && b.z >= tz0 && b.z < tz1) colours.add(b.color);
    for (const c of [PINK, ORANGE, TERRACE_WHITE]) expect(colours.has(c)).toBe(true);
    // every wall stands higher than eye level (6 ft) above the terrace
    for (const [x, z] of [[tx0, (tz0 + tz1) >> 1], [tx1 - 1, (tz0 + tz1) >> 1], [(tx0 + tx1) >> 1, tz0], [(tx0 + tx1) >> 1, tz1 - 1]]) {
      let top = Y.ROOF;
      while (cells.has(`${x},${top},${z}`)) top++;
      expect((top - Y.ROOF) * PLATE, `${x},${z}`).toBeGreaterThan(6);
    }
    // open to the sky: nothing stands over the terrace's floor inside its walls
    for (let z = tz0 + 1; z < tz1 - 1; z++) for (let x = tx0 + 1; x < tx1 - 1; x++) for (let y = Y.ROOF; y < Y.TOWER + 4; y++) expect(cells.has(`${x},${y},${z}`)).toBe(false);
  });

  it('A4: the library stair: timber treads fixed only to the wall, each higher than the last, nothing under them', () => {
    const wallX = LIBRARY[0];
    let last = -Infinity;
    STAIR_TREADS.forEach((r, i) => {
      const top = treadTop(i);
      expect(top).toBeGreaterThan(last);
      last = top;
      expect(r[0]).toBe(wallX + 1);
      for (let z = r[1]; z < r[3]; z++) {
        // fixed to the wall: the wall stands beside the tread
        expect(cells.has(`${wallX},${top - 1},${z}`)).toBe(true);
        // nothing under it, down to the floor
        for (let x = r[0]; x < r[2]; x++) for (let y = Y.GROUND; y < top - 1; y++) expect(cells.has(`${x},${y},${z}`), `${x},${y},${z}`).toBe(false);
      }
    });
    expect(last).toBe(Y.FIRST);
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(BARRAGAN.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume); // no cell is claimed twice
  });

  it('A6: every phase used, about 3 minutes (build order itself: tests/buildOrder.test.ts)', () => {
    const s = sequence(bricks, PHASES, BARRAGAN.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(165);
    expect(s.total).toBeLessThan(200);
  });

  it('A7: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A8: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A9: the terrain has no spikes (spec 010b)', () => {
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

  it('home card: live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'casa-luis-barragan')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('the Barragan Foundation');
    expect(card.sources?.some((s) => /WHC 1136/.test(s))).toBe(true);
  });
});
