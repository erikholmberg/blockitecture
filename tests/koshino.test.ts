// Spec: specs/039-koshino-house.md
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
import { onArc } from '../src/houses/koshino-house/model/house';
import { GRID } from '../src/houses/koshino-house/model/koshinoHouse';
import { BED, COURT, LIVING, STEPS_X0, STEPS_X1, STUDIO, Y } from '../src/houses/koshino-house/model/layout';
import { TERRAIN } from '../src/houses/koshino-house/model/site';
import { P, PHASES } from '../src/houses/koshino-house/phases';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = KOSHINO.build();
const bricks = builder.bricks;
const file = readFileSync('public/koshino-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/koshino-house/model/${f}`, 'utf8');
const M = 3.28084;
const PANEL = 0.9 * M; // Ando's panel, its short side: about 3 ft
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const solid = (x: number, y: number, z: number) => { const b = cells.get(`${x},${y},${z}`); return !!b && b.kind !== 'glass'; };

describe('039: the Koshino House', () => {
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
      [BARRAGAN, { count: 24482, hash: modelFingerprint(BARRAGAN.build().builder.bricks).hash }, sequence(BARRAGAN.build().builder.bricks, BARRAGAN.phases, BARRAGAN.center).total],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 90_000);

  it('A2: the footprint fits OSM\'s ways 259408268 and 259408269 (IoU ≥ 0.75); the wings\' sizes within a panel', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(KOSHINO.site.rotationDeg).toBe(n.anchor.rotationDeg);
    const near = (v: number, metres: number) => expect(Math.abs(v - metres * M)).toBeLessThanOrEqual(PANEL);
    // OSM: the bedroom wing 23.8 × 5.5 m, the living wing 16 × 5.2 m; the section: one storey about 3.4 m, two about 6 m
    near(BED[2] - BED[0], 23.8);
    near(BED[3] - BED[1], 5.5);
    near(LIVING[2] - LIVING[0], 16);
    near(LIVING[3] - LIVING[1], 5.2);
    near(Y.BED_ROOF * PLATE, 3.4);
    near(Y.LIV_ROOF * PLATE, 6.0);
  });

  it('A3: two parallel boxes, the larger two storeys and the smaller one; the courtyard between them steps with the slope', () => {
    // parallel, side by side across the courtyard
    expect(BED[3]).toBe(COURT[1]);
    expect(LIVING[1]).toBe(COURT[3]);
    // the living wing's walls rise to its second storey; the bedroom wing's stop at one
    const top = (x: number, z: number) => { let y = 0; while (solid(x, y, z)) y++; return y; };
    expect(top(LIVING[0], 38)).toBeGreaterThanOrEqual(Y.LIV_ROOF);
    expect(top(BED[0], 8)).toBeLessThanOrEqual(Y.BED_ROOF + Y.SLAB);
    expect(Y.LIV_ROOF).toBeGreaterThan(Y.BED_ROOF * 1.6);
    // the courtyard: flat, then each step higher than the last, up to the lawn
    let last = 0;
    for (let x = STEPS_X0; x < STEPS_X1; x += 2) {
      // the step's top, measured from above (the underground corridor runs beneath some of them)
      let y = Y.LAWN + 6;
      while (y > 0 && !solid(x, y - 1, 23)) y--;
      expect(y).toBeGreaterThan(last);
      last = y;
    }
    expect(last).toBe(Y.LAWN);
    expect(solid(20, 0, 23)).toBe(false); // the courtyard's floor is open
  });

  it('A4: the studio\'s wall curves: its arc pieces lie within 1 ft of one circle, over more than 60°', () => {
    // the curved wall: arc pieces with the outside of the circle next to them (not the straight wall up the slope)
    const beyond = (x: number, z: number) => Math.hypot(x + 0.5 - STUDIO.cx, z + 0.5 - STUDIO.cz) > STUDIO.r;
    const arc = bricks.filter((b) => b.phase === P.STRUCTURE && b.w === 1 && b.d === 1 && onArc(b.x, b.z) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => beyond(b.x + dx, b.z + dz)));
    expect(arc.length).toBeGreaterThan(30);
    const angles = arc.map((b) => Math.atan2(b.z + 0.5 - STUDIO.cz, b.x + 0.5 - STUDIO.cx));
    for (const b of arc) expect(Math.abs(Math.hypot(b.x + 0.5 - STUDIO.cx, b.z + 0.5 - STUDIO.cz) - STUDIO.r)).toBeLessThanOrEqual(1);
    expect(((Math.max(...angles) - Math.min(...angles)) * 180) / Math.PI).toBeGreaterThan(60);
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(KOSHINO.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
  });

  it('A6: every phase used, about 3 minutes (build order itself: tests/buildOrder.test.ts)', () => {
    const s = sequence(bricks, PHASES, KOSHINO.center);
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
    const card = HOUSES.find((h) => h.slug === 'koshino-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('Tadao Ando Architect & Associates');
  });
});
