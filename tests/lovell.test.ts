// Spec: specs/034-lovell-health-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { STEEL } from '../src/houses/lovell-health-house/model/house';
import { BALCONY, BALCONY_N, GUEST, LIVING, THIRD, UNIT, Y } from '../src/houses/lovell-health-house/model/layout';
import { GRID } from '../src/houses/lovell-health-house/model/lovellHouse';
import { TERRAIN } from '../src/houses/lovell-health-house/model/site';
import { P, PHASES } from '../src/houses/lovell-health-house/phases';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = LOVELL.build();
const bricks = builder.bricks;
const file = readFileSync('public/lovell-health-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/lovell-health-house/model/${f}`, 'utf8');
const ft = (plates: number) => plates * PLATE;

describe('034: the Lovell Health House', () => {
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
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 60_000);

  it('A2: the footprint fits OSM\'s (IoU ≥ 0.75); the levels and main dimensions match HABS CA-1936 (±1 ft)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(LOVELL.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // y = 0 is the living room floor, elev. 781′-5″; HABS sheet 8: the third floor 792′, the parapet 804′, the pool's walk 769′
    expect(n.anchor.lotElevationM / 0.3048).toBeCloseTo(781 + 5 / 12, 1);
    for (const [plates, elev] of [[Y.THIRD, 792], [Y.PARAPET, 804], [Y.POOL, 769]] as const)
      expect(Math.abs(ft(plates) - (elev - (781 + 5 / 12)))).toBeLessThanOrEqual(1);
    // the plans, read at 1/8″ = 1′ (sheets 4–5): the third floor 56 × 36 ft, the guest wing 32 ft deep, the living floor 46 ft
    // wide; all on the 5′-1½″ unit within a foot
    const near = (v: number, want: number) => expect(Math.abs(v - want)).toBeLessThanOrEqual(1);
    near(THIRD[2] - THIRD[0], 56);
    near(THIRD[3] - THIRD[1], 36);
    near(GUEST[2] - GUEST[0], 32);
    near(LIVING[2] - LIVING[0], 46);
    for (const v of [THIRD[2] - THIRD[0], THIRD[3] - THIRD[1], LIVING[2] - LIVING[0]]) {
      const units = v / UNIT;
      expect(Math.abs(units - Math.round(units)) * UNIT).toBeLessThanOrEqual(1);
    }
  });

  it('A3: the balconies hang from the roof: steel rods from each one up to the roof frame, built with the roof', () => {
    for (const r of [BALCONY, BALCONY_N]) {
      const rods = bricks.filter((b) => b.kind === 'bar' && b.color === STEEL && b.x >= r[0] && b.x < r[2] && b.z >= r[1] && b.z < r[3]);
      const tops = new Map<string, number>();
      for (const rod of rods) {
        expect(rod.phase).toBe(P.ROOF);
        tops.set(`${rod.x},${rod.z}`, Math.max(tops.get(`${rod.x},${rod.z}`) ?? -Infinity, rod.y + rod.h));
      }
      expect(tops.size).toBeGreaterThan(3);
      for (const t of tops.values()) expect(t).toBe(Y.CEILING_THIRD); // each rod runs up to the roof's underside
      // the balcony itself goes in with the roof, after the roof slab above it
      const deck = bricks.map((b, i) => [b, i] as const).filter(([b]) => b.y === Y.THIRD - 3 && b.x >= r[0] && b.x < r[2] && b.z >= r[1] && b.z < r[3] && b.phase === P.ROOF);
      expect(deck.length).toBeGreaterThan(0);
    }
  });

  it('A4: the frame comes first: every column of a storey starts before the walls and windows beside it', () => {
    const s = sequence(bricks, PHASES, LOVELL.center);
    const frameEnd = Math.max(...bricks.map((b, i) => (b.phase === P.STRUCTURE ? s.start[i] : -Infinity)));
    const wallStart = Math.min(...bricks.map((b, i) => (b.phase === P.ENVELOPE ? s.start[i] : Infinity)));
    expect(frameEnd).toBeLessThan(wallStart);
    expect(bricks.some((b) => b.phase === P.STRUCTURE && b.color === STEEL)).toBe(true);
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(LOVELL.build().builder.bricks)).toEqual(modelFingerprint(bricks));
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

  it('A6: every phase used, about 4 minutes (build order itself: tests/buildOrder.test.ts)', () => {
    const s = sequence(bricks, PHASES, LOVELL.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(220);
    expect(s.total).toBeLessThan(250);
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
    const card = HOUSES.find((h) => h.slug === 'lovell-health-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toEqual(['the owners of the Lovell House', 'the Neutra estate']);
    expect(card.sources?.some((s) => /HABS CA-1936/.test(s))).toBe(true);
  });
});
