// Spec: specs/019-rietveld-schroder-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { lowlandColor } from '../src/engine/scene/neighborhood';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { EAMES } from '../src/houses/eames-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { BLACK, BLUE, GREY, GREY_DARK, GREY_LIGHT, RED, WHITE, YELLOW } from '../src/houses/rietveld-schroder-house/model/house';
import { D, PARTY_NEIGHBOUR, W } from '../src/houses/rietveld-schroder-house/model/layout';
import { GRID } from '../src/houses/rietveld-schroder-house/model/schroderHouse';
import { neighbourCells, TERRAIN } from '../src/houses/rietveld-schroder-house/model/site';
import { LOT_BUILDINGS } from '../src/houses/rietveld-schroder-house/model/lotTerrain';
import { P, PHASES } from '../src/houses/rietveld-schroder-house/phases';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = SCHRODER.build();
const bricks = builder.bricks;
const file = readFileSync('public/rietveld-schroder-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const HOUSE = [P.FOUNDATION, P.FLOOR, P.STRUCTURE, P.ENVELOPE, P.ROOF];
const src = (f: string) => readFileSync(`src/houses/rietveld-schroder-house/model/${f}`, 'utf8');

describe('019: the Rietveld Schröder House', () => {
  it('A1: the other houses\' models, piece counts and timelines are unchanged', () => {
    // pinned at 3840593 (after spec 017), before spec 019's engine change
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b)).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  });

  it('A2: lowland colours are opt-in, green on most ground', () => {
    expect(SCHRODER.scenery?.lowlands).toBe(true);
    for (const h of [STAHL, EAMES, FALLINGWATER]) expect(h.scenery?.lowlands).toBeFalsy();
    let green = 0, total = 0;
    for (let x = -3000; x < 3000; x += 37) for (let z = -3000; z < 3000; z += 41) {
      const c = lowlandColor(x, z), r = c >> 16, g = (c >> 8) & 255, b = c & 255;
      total++; if (g > r && g > b) green++;
    }
    expect(green / total).toBeGreaterThan(0.6);
  });

  it('A3: the footprint matches OSM (7.6 × 10 m) within a foot, and the fit is ≥ 0.8', () => {
    expect(Math.abs(W - 7.64 / 0.3048)).toBeLessThanOrEqual(1);
    expect(Math.abs(D - 9.95 / 0.3048)).toBeLessThanOrEqual(1);
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.8);
  });

  it('A4: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(SCHRODER.build().builder.bricks)).toEqual(modelFingerprint(bricks));
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

  it('A5: every phase used, about 3 minutes; the street wave stacks bottom-up', () => {
    // (the build-order rules themselves run for this house in tests/buildOrder.test.ts)
    const s = sequence(bricks, PHASES, SCHRODER.center);
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

  it('A6: De Stijl\'s palette: white and greys, black, and red, blue and yellow; nothing else painted on the house', () => {
    const used = new Set(bricks.filter((b) => HOUSE.includes(b.phase)).map((b) => b.color));
    for (const c of [WHITE, BLACK, RED, BLUE, YELLOW]) expect(used.has(c)).toBe(true);
    const materials = [0xdff1f5 /* glass */, 0xb9b4a8 /* concrete */, 0x9a7a55 /* wooden floors */, 0xd9d6cf /* the party wall */, 0xfff0c8 /* lamps */];
    const allowed = [WHITE, GREY_LIGHT, GREY, GREY_DARK, BLACK, RED, BLUE, YELLOW, ...materials];
    expect([...used].filter((c) => !allowed.includes(c)).map((c) => c.toString(16))).toEqual([]);
  });

  it('A7: it shares its west wall with the end of the row', () => {
    const { owner, w } = neighbourCells();
    const party = LOT_BUILDINGS.findIndex((b) => b.id === PARTY_NEIGHBOUR);
    expect(party).toBeGreaterThanOrEqual(0);
    // along the house's whole depth, the neighbour's cells touch the house's party wall (x = 0) from x = −1
    for (let z = 0; z < D - 1; z++) expect(owner[(z - TERRAIN.z0) * w + (-1 - TERRAIN.x0)]).toBe(party);
    expect(bricks.some((b) => b.phase === P.STRUCTURE && b.x === 0 && b.w === 1)).toBe(true);
  });

  it('A8: everything is marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts'])
      expect(src(f)).toMatch(/\[(documented|assumed)/);
    const interior = src('interior.ts');
    expect((interior.match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(interior).toMatch(/Red and Blue chair/);
    expect(interior).toMatch(/hanging lamp/);
  });

  it('A9: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A10: placed from OSM, the rotation within 5° of the footprint\'s axis (bearing 29.5°)', () => {
    expect(SCHRODER.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(n.anchor.rotationDeg - -29.5)).toBeLessThanOrEqual(5);
  });

  it('home card: live, with the real piece count and the no-affiliation credit', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'rietveld-schroder-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(SCHRODER.text.disclaimer).toMatch(/Centraal Museum.*Rietveld Schröderhuis.*Cassina/);
  });
});
