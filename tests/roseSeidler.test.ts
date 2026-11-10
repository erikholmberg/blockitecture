// Spec: specs/043-rose-seidler-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { solarNoon, solarPosition } from '../src/engine/scene/sun';
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
import { ROSE_SEIDLER } from '../src/houses/rose-seidler-house/definition';
import { BLACK, BLUE, RED, YELLOW } from '../src/houses/rose-seidler-house/model/house';
import { DECK, GARDEN, HOUSE, inRect, LANDING, MURAL, RAMP, rampTop, Y } from '../src/houses/rose-seidler-house/model/layout';
import { GRID } from '../src/houses/rose-seidler-house/model/roseSeidlerHouse';
import { TERRAIN } from '../src/houses/rose-seidler-house/model/site';
import { P, PHASES } from '../src/houses/rose-seidler-house/phases';
import { SHEATS_GOLDSTEIN } from '../src/houses/sheats-goldstein-residence/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = ROSE_SEIDLER.build();
const bricks = builder.bricks;
const file = readFileSync('public/rose-seidler-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/rose-seidler-house/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

describe('043: the Rose Seidler House', () => {
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
      [BARRAGAN, { count: 24482, hash: '15217303' }, 180.7],
      [KOSHINO, { count: 32677, hash: '84917a56' }, 186.7],
      [SHEATS_GOLDSTEIN, { count: 56669, hash: 'cce5d76f' }, 252.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 180_000);

  it('A2: south of the equator, the noon sun stands in the northern half of the sky, all year', () => {
    const { lat, lon } = ROSE_SEIDLER.site;
    expect(lat).toBeLessThan(0);
    for (const day of ['2026-03-20', '2026-06-21', '2026-09-22', '2026-12-21']) {
      const { azimuth, elevation } = solarPosition(solarNoon(day, lon), lat, lon);
      expect(elevation, day).toBeGreaterThan(0);
      // north is 0°: the northern half is within 90° of it
      expect(Math.min(azimuth, 360 - azimuth), day).toBeLessThan(90);
    }
  });

  it('A3: the footprint fits OSM\'s way 570787191 (IoU ≥ 0.75), about 49 × 41 ft', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(ROSE_SEIDLER.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // OSM: about 15 × 12.6 m
    expect(Math.abs(HOUSE[2] - HOUSE[0] - 15 * M)).toBeLessThanOrEqual(2);
    expect(Math.abs(HOUSE[3] - HOUSE[1] - 12.6 * M)).toBeLessThanOrEqual(2);
  });

  it('A4: a square with an open deck inside it, open to the sky; a ramp from the deck down to the ground', () => {
    // the deck lies inside the square, on its edge, and nothing covers it
    expect(DECK[0]).toBeGreaterThan(HOUSE[0]);
    expect(DECK[2]).toBeLessThan(HOUSE[2]);
    expect(DECK[3]).toBe(HOUSE[3]);
    for (let z = DECK[1]; z < DECK[3]; z++)
      for (let x = DECK[0]; x < DECK[2]; x++) {
        expect(at(x, Y.FLOOR - 1, z), `deck floor ${x},${z}`).toBeDefined();
        for (let y = Y.ROOF; y < Y.ROOF_TOP + 4; y++) expect(at(x, y, z), `over the deck ${x},${y},${z}`).toBeUndefined();
      }
    // the house around it is roofed
    expect(at(5, Y.ROOF, 5)?.phase).toBe(P.ROOF);
    // the ramp: the landing at the deck's level, then down a plate at a time to the garden's ground
    expect(LANDING[1]).toBe(DECK[3]);
    expect(at(LANDING[0] + 1, Y.FLOOR - 1, LANDING[1] + 1)).toBeDefined();
    let last = rampTop(RAMP.x1 - 1);
    for (let x = RAMP.x1 - 1; x >= RAMP.x0; x--) {
      const t = rampTop(x);
      expect(t).toBeLessThanOrEqual(last);
      expect(last - t).toBeLessThanOrEqual(1);
      last = t;
      if (t > hm.at(x, RAMP.z0)) expect(at(x, t - 1, RAMP.z0 + 1)?.phase, `ramp at ${x}`).toBe(P.STRUCTURE);
    }
    expect(rampTop(RAMP.x1 - 1)).toBeGreaterThanOrEqual(Y.FLOOR - 1);
    expect(rampTop(RAMP.x0)).toBe(hm.at(RAMP.x0, RAMP.z0));
    expect(inRect(RAMP.x0, RAMP.z0, GARDEN)).toBe(true);
  });

  it('A5: the mural carries red, yellow, blue and black', () => {
    const mural = bricks.filter((b) => b.x === MURAL.x && b.z >= MURAL.z0 && b.z < MURAL.z1 && b.y >= MURAL.y0 && b.y < MURAL.y1 && b.phase === P.ENVELOPE);
    const colours = new Set(mural.map((b) => b.color));
    for (const c of [RED, YELLOW, BLUE, BLACK]) expect(colours.has(c), c.toString(16)).toBe(true);
  });

  it('A6: deterministic, inside its grid, no overlaps; every phase used, about 2½ minutes', () => {
    expect(modelFingerprint(ROSE_SEIDLER.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, ROSE_SEIDLER.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(170);
  });

  it('A8: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A9: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A10: the terrain has no spikes (spec 010b)', () => {
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
    const card = HOUSES.find((h) => h.slug === 'rose-seidler-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('Museums of History NSW');
  });
});
