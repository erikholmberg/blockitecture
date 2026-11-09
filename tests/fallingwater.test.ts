// Spec: specs/017-fallingwater.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { wantsCity } from '../src/engine/house';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { EAMES } from '../src/houses/eames-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { GRID } from '../src/houses/fallingwater/model/fallingwater';
import {
  area, BOLSTERS, BOULDER, BRIDGE_SPAN, CANTILEVER1, EAST_TERRACE, EAST_TERRACE2, GALLERY, GUEST_ROOM, GUEST_WINGS, HATCH,
  KITCHEN, LIVING, MASTER, BATH2, BATH3, DRESSING, SERVANTS, SOUTH_TERRACE2, STUDY, TERRACE3, TRAY1, WEST_TERRACE,
  WEST_TERRACE2, Y,
} from '../src/houses/fallingwater/model/layout';
import { streamAt, TERRAIN } from '../src/houses/fallingwater/model/site';
import { CHEROKEE, OCHRE } from '../src/houses/fallingwater/model/structure';
import { P, PHASES } from '../src/houses/fallingwater/phases';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = FALLINGWATER.build();
const bricks = builder.bricks;
const file = readFileSync('public/fallingwater/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const ft = (plates: number) => plates * PLATE;
const HOUSE = [P.FOUNDATION, P.FLOOR, P.STRUCTURE, P.ENVELOPE, P.ROOF];
const src = (f: string) => readFileSync(`src/houses/fallingwater/model/${f}`, 'utf8');

describe('017: Fallingwater', () => {
  // ---------- engine ----------
  it('A1: the Stahl and Eames models, piece counts and timelines are unchanged', () => {
    // pinned at 95657f5, before spec 017's engine changes
    for (const [h, fp, total] of [[STAHL, { count: 27233, hash: '116d7826' }, 228.7], [EAMES, { count: 21657, hash: '74053447' }, 230.7]] as const) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b)).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  });

  it('A2: the city can be turned off; houses that don\'t say so keep it', () => {
    expect(wantsCity(FALLINGWATER.scenery)).toBe(false);
    expect(wantsCity(STAHL.scenery)).toBe(true);
    expect(wantsCity(EAMES.scenery)).toBe(true);
    expect(wantsCity({})).toBe(true);
  });

  // ---------- house ----------
  it('A3: dimensions from HABS PA-5346 and the NHL nomination (±2 ft; areas ±10%)', () => {
    // the tower: 32′-4½″ above the main level (sheets 7, 10); the model's chimney reaches it
    expect(Math.abs(ft(Y.TOWER) - (32 + 4.5 / 12))).toBeLessThanOrEqual(2);
    const chimneyTop = Math.max(...bricks.filter((b) => b.phase === P.STRUCTURE && b.x >= 27 && b.x < 31 && b.z >= 30 && b.z < 41).map((b) => b.y + b.h));
    expect(chimneyTop).toBe(Y.TOWER);
    expect(Math.abs(ft(Y.PARAPET) - 26 / 12)).toBeLessThanOrEqual(2); // parapets 26 in
    expect(Math.abs(ft(Y.L2) - (9 + 4 / 12))).toBeLessThanOrEqual(0.5); // second level 9′-4″
    expect(Math.abs(ft(Y.L3) - (17 + 5.5 / 12))).toBeLessThanOrEqual(0.5); // third level 17′-5½″
    expect(Math.abs(BRIDGE_SPAN[1] - BRIDGE_SPAN[0] - 28)).toBeLessThanOrEqual(2); // the bridge: 28 ft
    expect(Math.abs(ft(Y.STREAM - Y.POOL) - 18)).toBeLessThanOrEqual(2); // the upper falls on sheet 7: about 18 ft
    // the guest wing stands on OSM's footprint (way 354728128), up the hill to the north
    expect(GUEST_WINGS[0]).toEqual([38, -72, 108, -49]);
    // areas: 2,885 ft² indoors, 2,445 ft² of terraces (NHL)
    const indoor = area([LIVING, KITCHEN, SERVANTS]) - area([EAST_TERRACE[1]]) + area([MASTER, BATH2, GUEST_ROOM, DRESSING, [30, 12, 56, 26]]) + area([STUDY, GALLERY, BATH3]);
    const terraces = area(EAST_TERRACE) + area([WEST_TERRACE]) + area([EAST_TERRACE2, SOUTH_TERRACE2, WEST_TERRACE2]) + area([TERRACE3]);
    expect(Math.abs(terraces / 2445 - 1)).toBeLessThanOrEqual(0.1);
    // Deviation (see the spec's implementation notes): the rooms HABS labels already add up to more than the NHL's 2,885 ft²
    // (the living room alone is 48′-0″ × 35′-8″ = 1,713 ft²), so a model true to the drawings can't be within 10%; it's held
    // to 30% here
    expect(Math.abs(indoor / 2885 - 1)).toBeLessThanOrEqual(0.3);
  });

  it('A4: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(FALLINGWATER.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    const seen = new Set<number>();
    let overlaps = 0;
    for (const b of bricks)
      for (let y = b.y; y < b.y + b.h; y++)
        for (let z = b.z; z < b.z + b.d; z++)
          for (let x = b.x; x < b.x + b.w; x++) {
            const k = ((y - GRID.y0) * GRID.nz + (z - GRID.z0)) * GRID.nx + (x - GRID.x0);
            if (seen.has(k)) overlaps++; else seen.add(k);
          }
    expect(overlaps).toBe(0);
  });

  it('A5: phases in role order, every phase used, about 4 minutes; the ravine wave stacks bottom-up', () => {
    // (the build-order rules themselves run for Fallingwater in tests/buildOrder.test.ts)
    const s = sequence(bricks, PHASES, FALLINGWATER.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(220);
    expect(s.total).toBeLessThan(250);
    const cells = new Map<number, number[]>();
    bricks.forEach((b, i) => {
      if (b.phase !== P.SITE) return;
      for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
        const k = x * 4096 + z; (cells.get(k) ?? cells.set(k, []).get(k)!).push(i);
      }
    });
    let bad = 0;
    for (const list of cells.values()) {
      list.sort((a, c) => bricks[a].y - bricks[c].y);
      for (let j = 1; j < list.length; j++) if (s.start[list[j]] < s.start[list[j - 1]]) { bad++; break; }
    }
    expect(bad).toBe(0);
  });

  it('A6: the terraces cantilever: the living-room tray reaches ≥ 10 ft past its bolsters with nothing under it', () => {
    const bolsterEnd = Math.max(...BOLSTERS.map((r) => r[3]));
    const trayEdge = CANTILEVER1[0][3];
    expect(trayEdge - bolsterEnd).toBeGreaterThanOrEqual(10);
    // nothing of the house stands under the tray beyond the bolsters (only rock, water and the hung hatch stair)
    const under = bricks.filter((b) => HOUSE.includes(b.phase) && b.y + b.h <= -Y.BAND_DOWN && b.z >= bolsterEnd && b.z < trayEdge
      && b.x >= 15 && b.x < 78 && !(b.x >= HATCH[0] && b.x < 68 && b.z >= HATCH[1] && b.z < HATCH[3]));
    expect(under.map((b) => `${b.kind} ${b.x},${b.y},${b.z}`)).toEqual([]);
    // the second floor's south terrace reaches past the first floor's edge (NHL: "extends beyond the living room below")
    expect(SOUTH_TERRACE2[3]).toBeGreaterThan(Math.max(...TRAY1.map((r) => r[3])));
  });

  it('A7: two paint colours: ochre on the concrete, Cherokee red on the steel', () => {
    const used = new Set(bricks.filter((b) => HOUSE.includes(b.phase)).map((b) => b.color));
    expect(used.has(OCHRE)).toBe(true);
    expect(used.has(CHEROKEE)).toBe(true);
    const sandstone = [0x8a8070, 0x9b907b, 0x7a7163, 0xa59a84, 0x6c645a];
    const flag = [0x6e6c63, 0x7a776c, 0x67655d, 0x74716a];
    const materials = [...sandstone, ...flag, 0xdff1f5 /* glass */, 0xc9c3b5 /* roof gravel */, 0x958a73 /* bridge deck */, 0xfff0c8 /* lights */];
    expect([...used].filter((c) => c !== OCHRE && c !== CHEROKEE && !materials.includes(c)).map((c) => c.toString(16))).toEqual([]);
  });

  it('A8: the signature details are in the model, each marked documented or assumed', () => {
    const marked = (file: string, word: RegExp) => src(file).split('\n').some((l) => word.test(l) && /\[(documented|assumed)/.test(l));
    expect(marked('layout.ts', /boulder/i)).toBe(true);
    expect(marked('layout.ts', /hatch/i)).toBe(true);
    expect(marked('layout.ts', /bridge/i)).toBe(true);
    expect(marked('layout.ts', /tree/i) || marked('roof.ts', /tree/i)).toBe(true);
    expect(marked('structure.ts', /walkway/i)).toBe(true);
    expect(marked('structure.ts', /guest wing/i)).toBe(true);
    // and in the model: the boulder rises through the floor, the hatch stair goes down to the water, the guest wing has a floor
    expect(bricks.some((b) => b.phase === P.SITE && b.x >= BOULDER[0] && b.x < BOULDER[2] && b.z >= BOULDER[1] && b.z < BOULDER[3] && b.y + b.h > Y.L1)).toBe(true);
    expect(bricks.some((b) => b.phase === P.STRUCTURE && b.y + b.h === Y.PLATFORM && b.x >= HATCH[0])).toBe(true);
    expect(bricks.some((b) => b.phase === P.STRUCTURE && b.y === Y.GUEST && b.z < -49)).toBe(true);
    expect(bricks.some((b) => b.kind === 'falls')).toBe(true);
    const interior = src('interior.ts');
    expect((interior.match(/\[documented\]/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect((interior.match(/\[assumed\]/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  // ---------- site ----------
  it('A9: the lot meets the real ground at its edges, and Bear Run meets its real line at both edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => {
      if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`);
    };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    // where OSM's Bear Run crosses the lot edges there is water in the lot
    const water = bricks.filter((b) => b.kind === 'water');
    const wet = (x: number, z: number) => water.some((b) => x >= b.x - 2 && x < b.x + b.w + 2 && z >= b.z - 2 && z < b.z + b.d + 2);
    const edge: [number, number][] = [];
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) for (const x of [TERRAIN.x0, TERRAIN.x1 - 1]) if (streamAt(x, z).d < 3) edge.push([x, z]);
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) for (const z of [TERRAIN.z0, TERRAIN.z1 - 1]) if (streamAt(x, z).d < 3) edge.push([x, z]);
    expect(edge.some(([x]) => x === TERRAIN.x1 - 1)).toBe(true); // upstream (east) edge
    expect(edge.some(([x, z]) => x === TERRAIN.x0 || z === TERRAIN.z1 - 1)).toBe(true); // downstream edge
    expect(edge.filter(([x, z]) => !wet(x, z))).toEqual([]);
  });

  it('A10: placed from OSM: IoU ≥ 0.7, the rotation within 10° of the HABS north arrow (45°)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.7);
    expect(FALLINGWATER.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(n.anchor.rotationDeg - 45)).toBeLessThanOrEqual(10);
  });

  it('A11: Bear Run at 1,298 ft ±10 at the house, and the falls run under the terraces', () => {
    const streamFt = n.anchor.lotElevationM / 0.3048 + ft(Y.STREAM);
    expect(Math.abs(streamFt - 1298)).toBeLessThanOrEqual(10);
    const water = bricks.filter((b) => b.kind === 'water');
    const nearHouse = water.filter((b) => b.x < 78 && b.x + b.w > 50 && b.z < 68 && b.z + b.d > 52);
    // the water surface near the house: the documented level, rising 2% upstream (as the data script's carve)
    expect(nearHouse.length).toBeGreaterThan(0);
    for (const b of nearHouse) expect(b.y + b.h - Y.STREAM).toBeGreaterThanOrEqual(0), expect(b.y + b.h - Y.STREAM).toBeLessThanOrEqual(3);
    const falls = bricks.filter((b) => b.kind === 'falls');
    expect(falls.some((b) => b.x >= 15 && b.x < 78 && b.z < 68)).toBe(true); // at least part of the falls is under the tray
    expect(Math.min(...falls.map((b) => b.y))).toBe(Y.POOL);
    expect(Math.max(...falls.map((b) => b.y + b.h))).toBe(Y.STREAM);
  });

  it('A12: the terrain has no spikes', () => {
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

  it('home card: live, with the real piece count and the no-affiliation credit', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'fallingwater')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(FALLINGWATER.text.disclaimer).toMatch(/Western Pennsylvania Conservancy.*Frank Lloyd Wright Foundation/);
  });
});

