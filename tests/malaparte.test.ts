// Spec: specs/031-casa-malaparte.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { FLAG, FRAME, GLASS, RED, SLAB, TERRACOTTA, WHITE } from '../src/houses/casa-malaparte/model/house';
import { HOUSE, STAIR, STAIR_W, STAIR_X, Y } from '../src/houses/casa-malaparte/model/layout';
import { GRID } from '../src/houses/casa-malaparte/model/malaparteHouse';
import { coastAt, TERRAIN } from '../src/houses/casa-malaparte/model/site';
import { P, PHASES } from '../src/houses/casa-malaparte/phases';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = MALAPARTE.build();
const bricks = builder.bricks;
const file = readFileSync('public/casa-malaparte/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const M = 3.28084; // ft per metre
const src = (f: string) => readFileSync(`src/houses/casa-malaparte/model/${f}`, 'utf8');

describe('031: Casa Malaparte', () => {
  it('A1: the other six houses\' models, piece counts and timelines are unchanged', () => {
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
      [SCHRODER, { count: 10668, hash: '501f28e6' }, 182.7],
      [FARNSWORTH, { count: 13052, hash: 'ca43acd9' }, 180.7],
      [ENNIS, { count: 31820, hash: '0b6ef15e' }, 240.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  });

  it('A2: the footprint fits OSM\'s (IoU ≥ 0.75); the house and stair dimensions within ±2 ft of those recorded', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(MALAPARTE.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // layout.ts records the house as 34 × 9 m, the stair 20 m long, 2.8 m wide at its foot and 9 m at the top
    const near = (v: number, metres: number) => expect(Math.abs(v - metres * M)).toBeLessThanOrEqual(2);
    near(HOUSE[2] - HOUSE[0], 34);
    near(HOUSE[3] - HOUSE[1], 9);
    near(STAIR_X[1] - STAIR_X[0], 20);
    near(STAIR_W[0], 2.8);
    near(STAIR_W[1], 9);
    // and the built stair spans it: from the land to the house's end wall
    expect(STAIR[0].x0).toBe(STAIR_X[0]);
    expect(STAIR[STAIR.length - 1].x1).toBe(HOUSE[0]);
    expect(STAIR[STAIR.length - 1].top).toBe(Y.ROOF);
  });

  it('A3: an inverted pyramid: each step wider than the one below, from the foot to the roof', () => {
    // read off the model: the terracotta treads on the stair, by height
    const treads = new Map<number, { z0: number; z1: number }>();
    for (const b of bricks)
      if (b.phase === P.ROOF && b.kind === 'tile' && b.x < HOUSE[0]) {
        const t = treads.get(b.y) ?? { z0: Infinity, z1: -Infinity };
        treads.set(b.y, { z0: Math.min(t.z0, b.z), z1: Math.max(t.z1, b.z + b.d) });
      }
    const widths = [...treads.entries()].sort((a, c) => a[0] - c[0]).map(([, t]) => t.z1 - t.z0);
    expect(widths.length).toBe(STAIR.length);
    for (let i = 1; i < widths.length; i++) expect(widths[i], `step ${i}`).toBeGreaterThan(widths[i - 1]);
    expect(Math.abs(widths[0] - 2.8 * M)).toBeLessThanOrEqual(2);
    expect(Math.abs(widths[widths.length - 1] - 9 * M)).toBeLessThanOrEqual(2);
  });

  it('A4: walls and stair Pompeian red, the roof wall white; no other paint on the house', () => {
    const allowed = new Set([...RED, WHITE, ...TERRACOTTA, ...FLAG, FRAME, GLASS, SLAB]);
    const others = new Set<string>();
    for (const b of bricks) {
      if (b.phase === P.SITE || b.phase === P.INTERIOR || b.phase === P.LANDSCAPE || b.kind === 'light' || b.kind === 'lamp') continue;
      if (!allowed.has(b.color)) others.add(`${b.phase} ${b.kind} #${b.color.toString(16)}`);
    }
    expect([...others]).toEqual([]);
    // the walls standing above the roof terrace are all white; the outer walls all red
    const wall = bricks.filter((b) => b.phase === P.ROOF && b.y >= Y.ROOF && b.kind === 'brick');
    expect(wall.length).toBeGreaterThan(0);
    expect(wall.every((b) => b.color === WHITE)).toBe(true);
    const outer = bricks.filter((b) => b.phase === P.STRUCTURE && b.kind === 'brick' && (b.z === HOUSE[1] || b.z + b.d === HOUSE[3]));
    expect(outer.length).toBeGreaterThan(0);
    expect(outer.every((b) => RED.includes(b.color))).toBe(true);
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(MALAPARTE.build().builder.bricks)).toEqual(modelFingerprint(bricks));
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

  it('A6: every phase used, about 3 minutes (build order itself: tests/buildOrder.test.ts)', () => {
    const s = sequence(bricks, PHASES, MALAPARTE.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(165);
    expect(s.total).toBeLessThan(200);
  });

  it('A7: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A8: on land the lot meets the real ground at its edges; the sea is at true sea level around the promontory', () => {
    // the terrain tiles read sea level over the headland (spec 031 notes), so only edges where the real ground stands
    // clear of the sea are matched; at sea the lot's floor is under the water
    const sea = -n.anchor.lotElevationM * M;
    expect(Math.abs(Y.SEA * PLATE - sea)).toBeLessThanOrEqual(1);
    const misses: string[] = [];
    let checked = 0;
    const check = (x: number, z: number) => {
      const real = sampleGrid(n.near, x, z);
      if (coastAt(x, z) <= 0 || real <= sea + 6) return;
      checked++;
      if (Math.abs(hm.at(x, z) * PLATE - real) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`);
    };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(checked).toBeGreaterThan(0);
    expect(misses).toEqual([]);
    // around the promontory, every cell at sea is under the waterline
    let wet = 0, dry = 0;
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z += 2) for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 2)
      if (coastAt(x, z) < -2) { if (hm.at(x, z) < Y.SEA) wet++; else dry++; }
    expect(wet).toBeGreaterThan(0);
    expect(dry).toBe(0);
  });

  it('A9: the terrain has no spikes (spec 010b)', () => {
    const seaY = -n.anchor.lotElevationM * M;
    for (const [g, limit] of [[n.near, 150], [n.far, 500]] as const) {
      let worst = 0;
      for (let j = 1; j < g.nz - 1; j++)
        for (let i = 1; i < g.nx - 1; i++) {
          if (g.h[j * g.nx + i] < seaY - 0.5) continue;
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
    const card = HOUSES.find((h) => h.slug === 'casa-malaparte')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toEqual(['the Fondazione Giorgio Ronchi']);
    expect(card.sources?.some((s) => /Wikimedia Commons/.test(s))).toBe(true);
  });
});
