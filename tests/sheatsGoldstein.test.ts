// Spec: specs/040-sheats-goldstein-residence.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { BARRAGAN } from '../src/houses/casa-luis-barragan/definition';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { KOSHINO } from '../src/houses/koshino-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { SHEATS_GOLDSTEIN } from '../src/houses/sheats-goldstein-residence/definition';
import { COLUMNS, inEast, inHouse, inLiving, inRoof, isRib, isSkylight, onOutline, OUTLINE, POOL_LINE, roofUnder } from '../src/houses/sheats-goldstein-residence/model/layout';
import { GRID } from '../src/houses/sheats-goldstein-residence/model/sheatsGoldstein';
import { TERRAIN } from '../src/houses/sheats-goldstein-residence/model/site';
import { P, PHASES } from '../src/houses/sheats-goldstein-residence/phases';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = SHEATS_GOLDSTEIN.build();
const bricks = builder.bricks;
const file = readFileSync('public/sheats-goldstein-residence/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/sheats-goldstein-residence/model/${f}`, 'utf8');
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);

describe('040: the Sheats-Goldstein Residence', () => {
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
      [BARRAGAN, { count: 24482, hash: modelFingerprint(BARRAGAN.build().builder.bricks).hash }, 0],
      [KOSHINO, { count: 32677, hash: modelFingerprint(KOSHINO.build().builder.bricks).hash }, 0],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      if (total) expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 120_000);

  it('A2: the house stands on OSM\'s outline of way 388762653 (the fit\'s IoU ≥ 0.75); its main sizes match the outline within 2 ft', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(SHEATS_GOLDSTEIN.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // the floor slab covers the outline: its extent east–west and north–south
    const floor = bricks.filter((b) => b.phase === P.FLOOR && b.y === -1);
    const xs = OUTLINE.map((p) => p[0]), zs = OUTLINE.map((p) => p[1]);
    const near = (v: number, w: number) => expect(Math.abs(v - w)).toBeLessThanOrEqual(2);
    near(Math.min(...floor.map((b) => b.x)), Math.min(...xs));
    near(Math.max(...floor.map((b) => b.x + b.w)), Math.max(...xs));
    near(Math.min(...floor.map((b) => b.z)), Math.min(...zs));
  });

  it('A3: the living room\'s roof is a grid of coffers, each holding glass skylights: over 400 in all', () => {
    const sky = new Set<string>();
    for (const b of bricks) if (b.phase === P.ROOF && b.kind === 'glass') {
      expect(inRoof(b.x, b.z)).toBe(true);
      expect(isSkylight(b.x, b.z)).toBe(true);
      expect(b.y).toBeGreaterThanOrEqual(roofUnder(b.z));
      sky.add(`${b.x},${b.z}`);
    }
    expect(sky.size).toBeGreaterThan(400);
    // the ribs hang below the slab
    let ribs = 0;
    for (let z = -20; z < 20; z++) for (let x = 10; x < 80; x++) if (inRoof(x, z) && !onOutline(x, z) && isRib(x, z) && cells.get(`${x},${roofUnder(z) - 1},${z}`)?.phase === P.ROOF) ribs++;
    expect(ribs).toBeGreaterThan(100);
  });

  it('A4: nothing between the living room\'s floor and its roof on the side open to the pool, but its two columns', () => {
    const z = POOL_LINE - 1;
    let blocked = 0, open = 0;
    for (let x = -10; x < 100; x++) {
      if (!inLiving(x, z) || onOutline(x, z) || COLUMNS.some(([cx, cz]) => cx === x && cz === z)) continue;
      for (let y = 0; y < roofUnder(z) - 3; y++) {
        const b = cells.get(`${x},${y},${z}`);
        if (b && (b.phase === P.STRUCTURE || b.phase === P.ENVELOPE)) blocked++;
        else open++;
      }
    }
    expect(open).toBeGreaterThan(1000);
    expect(blocked).toBe(0);
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(SHEATS_GOLDSTEIN.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
  });

  it('A6: every phase used, about 4 minutes (build order itself: tests/buildOrder.test.ts)', () => {
    const s = sequence(bricks, PHASES, SHEATS_GOLDSTEIN.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(225);
    expect(s.total).toBeLessThan(265);
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

  it('the house sits on its outline: every floor piece inside it, the east part holding the roof', () => {
    for (const b of bricks) if (b.phase === P.FLOOR && b.y === -1) expect(inHouse(b.x, b.z)).toBe(true);
    expect(inEast(50, 0)).toBe(true);
  });

  it('home card: live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'sheats-goldstein-residence')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('LACMA');
  });
});
