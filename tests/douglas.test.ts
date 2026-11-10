// Spec: specs/045-douglas-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isWater, parseNeighborhood, sampleGrid, seaLevelY, waterMask } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
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
import { DOUGLAS } from '../src/houses/douglas-house/definition';
import { GRID } from '../src/houses/douglas-house/model/douglasHouse';
import { BRIDGE, HOUSE, Y } from '../src/houses/douglas-house/model/layout';
import { TERRAIN } from '../src/houses/douglas-house/model/site';
import { P, PHASES } from '../src/houses/douglas-house/phases';
import { VANNA_VENTURI } from '../src/houses/vanna-venturi-house/definition';
import { PAGES } from '../vite.config';
import { SHEATS_GOLDSTEIN } from '../src/houses/sheats-goldstein-residence/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = DOUGLAS.build();
const bricks = builder.bricks;
const file = readFileSync('public/douglas-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/douglas-house/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

describe('045: the Douglas House, in place of the Vanna Venturi House', () => {
  it('A1: the Vanna Venturi House is hidden: not in the registry or the build; its model still builds', async () => {
    const { HOUSES } = await import('../src/houses');
    expect(HOUSES.some((h) => h.slug === 'vanna-venturi-house')).toBe(false);
    expect(Object.keys(PAGES)).not.toContain('vanna-venturi-house');
    expect(VANNA_VENTURI.build().builder.bricks.length).toBe(28994);
  });

  it('A3: the other houses\' models, piece counts and timelines are unchanged', () => {
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
      [ROSE_SEIDLER, { count: 19226, hash: '64a474a1' }, 162.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
    // the sea stays at sea level for the houses that have one
    expect(seaLevelY(true, 30)).toBeCloseTo(-30 / 0.3048, 6);
    expect(seaLevelY(undefined, 30)).toBeNull();
    expect(seaLevelY(false, 30)).toBeNull();
  }, 180_000);

  it('A4: the footprint fits OSM\'s way 1101848958 (IoU ≥ 0.75), about 46 × 31 ft', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(DOUGLAS.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(HOUSE[2] - HOUSE[0] - 13.9 * M)).toBeLessThanOrEqual(2);
    expect(Math.abs(HOUSE[3] - HOUSE[1] - 9.5 * M)).toBeLessThanOrEqual(2);
  });

  it('A5: four floors stepping down the bluff; the bridge from the road\'s side reaches the 4th floor', () => {
    for (const f of [Y.F1, Y.F2, Y.F3, Y.F4]) expect(at(30, f - 1, 5)?.phase, `floor at ${f}`).toBe(P.FLOOR);
    // the bluff: the ground at the road wall stands well above the ground at the lake wall
    expect((hm.at(20, HOUSE[1] - 2) - hm.at(20, HOUSE[3] + 1)) * PLATE).toBeGreaterThan(20);
    // the bridge: its deck at the 4th floor's level, from the house's road wall up the bluff to the ground
    for (let z = BRIDGE.z0 + 2; z < BRIDGE.z1; z++) expect(at(BRIDGE.x0 + 2, Y.F4 - 1, z)?.phase, `bridge at ${z}`).toBe(P.STRUCTURE);
    expect(BRIDGE.z1 - BRIDGE.z0).toBeGreaterThanOrEqual(40);
    expect(hm.at(BRIDGE.x0 + 2, BRIDGE.z0) + 3).toBeGreaterThanOrEqual(Y.F4 - 2);
  });

  it('A6: the lake side\'s glass wall is at least three storeys high', () => {
    const glassAt = (y: number) => at(2, y, HOUSE[3] - 1)?.kind === 'glass';
    const ys: number[] = [];
    for (let y = Y.F1; y < Y.F4; y++) if (glassAt(y)) ys.push(y);
    expect(Math.min(...ys)).toBeLessThanOrEqual(Y.F1 + 1);
    expect((Math.max(...ys) - Math.min(...ys)) * PLATE).toBeGreaterThanOrEqual(3 * 25 * PLATE - 6);
  });

  it('A7: deterministic, inside its grid, no overlaps; every phase used, about 2½ minutes', () => {
    expect(modelFingerprint(DOUGLAS.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, DOUGLAS.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(170);
  });

  it('A9: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A10: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A11: the terrain has no spikes (spec 010b)', () => {
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

  it('A12: the lake is water at its own level, about 176–177 m, beyond the beach and not up the bluff', () => {
    const sea = DOUGLAS.scenery?.sea;
    expect(typeof sea).toBe('object');
    const levelM = (sea as { levelM: number }).levelM;
    expect(levelM).toBeGreaterThan(176);
    expect(levelM).toBeLessThan(177.5);
    const seaY = seaLevelY(sea, n.anchor.lotElevationM)!;
    expect(seaY).toBeCloseTo((levelM - n.anchor.lotElevationM) / 0.3048, 6);
    const mask = waterMask(n.near, seaY);
    // out on the lake, west-south-west of the house, it's water; at the house and the road it isn't
    expect(isWater(n.near, mask, 23, 400)).toBe(true);
    expect(isWater(n.near, mask, 23, 1500)).toBe(true);
    expect(isWater(n.near, mask, 23, 15)).toBe(false);
    expect(isWater(n.near, mask, 23, -100)).toBe(false);
    // the lot ends at the beach's top, above the water
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 10) expect(hm.at(x, TERRAIN.z1 - 1) * PLATE).toBeGreaterThan(seaY);
  });

  it('home card: live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'douglas-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('Meier Partners (formerly Richard Meier & Partners Architects)');
  });
});
