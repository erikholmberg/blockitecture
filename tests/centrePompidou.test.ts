// Spec: specs/080-centre-pompidou.md
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Brick } from '../src/engine/catalog';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { CENTRE_POMPIDOU as H } from '../src/houses/centre-pompidou/definition';
import { B_BOX, inside as inBrancusiCell } from '../src/houses/centre-pompidou/model/brancusi';
import { GRID } from '../src/houses/centre-pompidou/model/centrePompidou';
import { ESCALATOR, GLASS, PANEL, SERVICE, TUBE, WHITE } from '../src/houses/centre-pompidou/model/house';
import {
  BAY, COL, COL_E, COL_W, COL_Y0, COL_Y1, CROSS_TIERS, FLIGHTS, FOOTPRINT, FORUM_H, FRAMES, frameX, GLASS_Z, LENGTH, levelY,
  PANEL_Z, ROOF_Y, SLAB, STOREY, TIE_E, TIE_W, TRUSS_D, TRUSS_Y, TRUSS_Z, trussBottom, TUBE_Z, WIDTH,
} from '../src/houses/centre-pompidou/model/layout';
import { STACK_H } from '../src/houses/centre-pompidou/model/landscape';
import { LOT_PARTS, LOT_SELF } from '../src/houses/centre-pompidou/model/lotTerrain';
import { BRANCUSI, FOUNTAIN, PIAZZA, SETT, STACKS, TERRAIN } from '../src/houses/centre-pompidou/model/site';
import { WATER_AREAS } from '../src/houses/centre-pompidou/model/water';
import { P, PHASES } from '../src/houses/centre-pompidou/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/centre-pompidou/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/centre-pompidou/model/${f}`, 'utf8');
/** the phase of whatever fills a cell, −1 for nothing (the builder's own occupancy) */
const phaseAt = (x: number, y: number, z: number) => builder.occAt(x, y, z) - 1;
const PL = 0.4, FT = 0.3048;
/** the pieces covering one cell column, by phase */
const at = (x: number, z: number, phase?: number) =>
  bricks.filter((b) => (phase === undefined || b.phase === phase) && x >= b.x && x < b.x + b.w && z >= b.z && z < b.z + b.d);
const covers = (list: Brick[], y0: number, y1: number) => {
  for (let y = y0; y < y1; y++) if (!list.some((b) => y >= b.y && y < b.y + b.h)) return false;
  return true;
};

describe('080: the Centre Pompidou', () => {
  it('A1: the footprint fits OSM\'s way 55503397 (IoU ≥ 0.8), long sides within 1° of 19.8°; 546 studs long, 60 m wide', () => {
    let inter = 0, union = 0;
    for (let z = -30; z < WIDTH + 30; z++)
      for (let x = -30; x < LENGTH + 30; x++) {
        const mine = x >= FOOTPRINT[0] && x < FOOTPRINT[2] && z >= FOOTPRINT[1] && z < FOOTPRINT[3];
        const osm = inPoly(x + 0.5, z + 0.5, LOT_SELF[0]);
        if (mine && osm) inter++;
        if (mine || osm) union++;
      }
    expect(inter / union).toBeGreaterThanOrEqual(0.8);
    // the model's long axis is real 19.8°, and OSM's longest edge (the west front) lies along it within 1°
    expect(90 - H.site.rotationDeg).toBeCloseTo(19.8, 5);
    expect(n.anchor.rotationDeg).toBe(H.site.rotationDeg);
    const ring = LOT_SELF[0];
    let best = 0, angle = 0;
    ring.forEach((p, i) => {
      const q = ring[(i + 1) % ring.length], len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (len > best) { best = len; angle = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI; }
    });
    expect(Math.min(Math.abs(angle), 180 - Math.abs(angle))).toBeLessThanOrEqual(1);
    // 13 bays: 546 studs between the end frames (166.4 m), within 2 ft; tie line to tie line 60 m within 3 ft
    expect(frameX(FRAMES - 1) - frameX(0)).toBe(546);
    expect(Math.abs(546 - 166.4 / FT)).toBeLessThanOrEqual(2);
    expect(Math.abs(WIDTH - 60 / FT)).toBeLessThanOrEqual(3);
  });

  it('A2: 14 frames 42 apart, columns 157 apart; 28 columns of 3 × 3, unbroken to above the roof; 168 gerberettes of 26 studs', () => {
    expect([FRAMES, BAY, COL]).toEqual([14, 42, 3]);
    expect(COL_E + COL / 2 - (COL_W + COL / 2)).toBe(157);
    let columns = 0;
    for (let i = 0; i < FRAMES; i++)
      for (const z0 of [COL_W, COL_E]) {
        const x0 = frameX(i) - 1;
        // every cell of the column's section, footing to top, is white steel of the cage
        for (const [dx, dz] of [[0, 0], [1, 1], [2, 2]]) {
          const list = at(x0 + dx, z0 + dz, P.STRUCTURE);
          expect(covers(list, COL_Y0, COL_Y1), `column ${i} ${z0}`).toBe(true);
          expect(list.every((b) => b.color === WHITE)).toBe(true);
        }
        expect(phaseAt(x0 + 1, COL_Y0 - 1, z0 + 1), 'its footing').toBe(P.FOUNDATION);
        expect(phaseAt(x0 + 1, COL_Y1, z0 + 1)).toBe(-1);
        columns++;
      }
    expect(columns).toBe(28);
    expect(COL_Y1).toBeGreaterThan(ROOF_Y);
    expect(Math.abs((COL_Y1 - COL_Y0) * PL * FT - 49)).toBeLessThan(0.5);
    // the gerberettes: one on each column at each truss level, reaching from the tie line across the column to the floor's edge
    let gerberettes = 0;
    for (let t = 0; t < TRUSS_Y.length; t++)
      for (let i = 0; i < FRAMES; i++)
        for (const west of [true, false]) {
          const y = TRUSS_Y[t] - SLAB - 1, x = frameX(i);
          const zs = west ? [TIE_W, TRUSS_Z[0]] : [TRUSS_Z[1], TIE_E + 1];
          for (let z = zs[0]; z < zs[1]; z++) expect(phaseAt(x, y, z), `gerberette ${t} ${i} ${west} at z ${z}`).toBe(P.STRUCTURE);
          expect(Math.abs(zs[1] - zs[0] - 26)).toBeLessThanOrEqual(1);
          // past its column on the outside
          expect(west ? zs[0] < COL_W : zs[1] > COL_E + COL).toBe(true);
          gerberettes++;
        }
    expect(gerberettes).toBe(168);
  }, 60_000);

  it('A3: six levels of 14 trusses between the gerberettes, 20 plates deep; the Forum 82, storeys 57, the roof 45.5 m (±1 m)', () => {
    let trusses = 0;
    for (let t = 0; t < TRUSS_Y.length; t++)
      for (let i = 0; i < FRAMES; i++) {
        const x = frameX(i), y = trussBottom(t);
        for (let z = TRUSS_Z[0]; z < TRUSS_Z[1]; z++) {
          expect(phaseAt(x, y, z), `bottom chord ${t} ${i} ${z}`).toBe(P.STRUCTURE);
          expect(phaseAt(x, y + TRUSS_D - 1, z), `top chord ${t} ${i} ${z}`).toBe(P.STRUCTURE);
        }
        // its ends bear on the gerberettes' inner arms
        expect(phaseAt(x, y + TRUSS_D - 1, TRUSS_Z[0] - 1)).toBe(P.STRUCTURE);
        expect(phaseAt(x, y + TRUSS_D - 1, TRUSS_Z[1])).toBe(P.STRUCTURE);
        // open between its diagonals somewhere (a lattice, not a solid beam)
        let open = 0;
        for (let z = TRUSS_Z[0] + 1; z < TRUSS_Z[1] - 1; z++) if (phaseAt(x, y + 10, z) === -1) open++;
        expect(open).toBeGreaterThan((TRUSS_Z[1] - TRUSS_Z[0]) / 2);
        trusses++;
      }
    expect(trusses).toBe(84);
    expect(Math.abs(TRUSS_D - 20)).toBeLessThanOrEqual(2);
    expect(FORUM_H).toBe(82);
    expect(STOREY).toBe(57);
    for (let t = 1; t < TRUSS_Y.length; t++) expect(TRUSS_Y[t] - TRUSS_Y[t - 1]).toBe(57);
    expect(TRUSS_Y[0]).toBe(82);
    expect(Math.abs(ROOF_Y * PL * FT - 45.5)).toBeLessThanOrEqual(1);
  }, 60_000);

  it('A4: ties at the gerberettes\' tips on both fronts; two-storey crosses in every bay; every steel piece the one white', () => {
    for (let i = 0; i < FRAMES; i++)
      for (const z of [TIE_W, TIE_E]) expect(covers(at(frameX(i), z, P.STRUCTURE), 2, TRUSS_Y[5] - SLAB), `tie ${i} ${z}`).toBe(true);
    const twoStorey = CROSS_TIERS.filter(([a, b]) => b - a === 2);
    expect(twoStorey.length).toBeGreaterThan(0);
    for (let i = 0; i + 1 < FRAMES; i++)
      for (const z of [TIE_W, TIE_E])
        for (const [ta, tb] of twoStorey) {
          const ya = TRUSS_Y[ta] - SLAB - 4, yb = TRUSS_Y[tb] - SLAB - 4, xa = frameX(i) + 1, xb = frameX(i + 1) - 1;
          // both arms: from each bottom corner to the opposite top corner
          expect(phaseAt(xa, ya, z), `cross ${i} ${z} ${ta}`).toBe(P.STRUCTURE);
          expect(phaseAt(xb, ya, z)).toBe(P.STRUCTURE);
          expect(phaseAt(xa, yb - 1, z)).toBe(P.STRUCTURE);
          expect(phaseAt(xb, yb - 1, z)).toBe(P.STRUCTURE);
          const mid = Math.round((ya + yb) / 2), xm = Math.round((xa + xb) / 2);
          let hit = false;
          for (let dx = -2; dx <= 2; dx++) if (phaseAt(xm + dx, mid, z) === P.STRUCTURE) hit = true;
          expect(hit).toBe(true);
          expect(phaseAt(xa, mid, z)).toBe(-1);
        }
    // the cage: everything in the frames' planes (but the floors) and in the two tie planes is white
    const frameXs = new Set(Array.from({ length: FRAMES }, (_, i) => frameX(i)));
    const cage = bricks.filter((b) => b.phase === P.STRUCTURE && b.kind !== 'plate' && ((b.w === 1 && frameXs.has(b.x)) || (b.d === 1 && (b.z === TIE_W || b.z === TIE_E)) || (b.w === COL && b.d === COL)));
    expect(cage.length).toBeGreaterThan(5000);
    expect(new Set(cage.map((b) => b.color))).toEqual(new Set([WHITE]));
  }, 60_000);

  it('A5: the east front\'s services in exactly four colours, ≥ 20 pieces each, outside the panels and inside the tie line', () => {
    const east = bricks.filter((b) => b.phase === P.ENVELOPE && b.z > PANEL_Z && b.z + b.d <= TIE_E && b.x >= 0 && b.x + b.w <= LENGTH);
    const colours = new Map<number, number>();
    for (const b of east) if (b.color !== WHITE && b.color !== PANEL) colours.set(b.color, (colours.get(b.color) ?? 0) + 1);
    expect(new Set(colours.keys())).toEqual(new Set(Object.values(SERVICE)));
    for (const [c, k] of colours) expect(k, c.toString(16)).toBeGreaterThanOrEqual(20);
    // the blue is a blue, the green a green, the yellow a yellow, the red a red
    const rgb = (c: number) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    const [bl, gr, ye, re] = [SERVICE.air, SERVICE.water, SERVICE.power, SERVICE.lift].map(rgb);
    expect(bl[2] > bl[0] && bl[2] > bl[1]).toBe(true);
    expect(gr[1] > gr[0] && gr[1] > gr[2]).toBe(true);
    expect(ye[0] > 200 && ye[1] > 180 && ye[2] < 80).toBe(true);
    expect(re[0] > 180 && re[1] < 60 && re[2] < 60).toBe(true);
    // the services stand out from the panels and in from the tie line, and only on the east
    for (const b of bricks.filter((q) => Object.values(SERVICE).includes(q.color) && q.phase === P.ENVELOPE)) {
      expect(b.z).toBeGreaterThan(PANEL_Z);
      expect(b.z + b.d).toBeLessThanOrEqual(TIE_E);
    }
    // opaque panels on the east, clear glass on the west
    const panels = bricks.filter((b) => b.phase === P.ENVELOPE && b.z === PANEL_Z && b.d === 1 && b.color === PANEL);
    const glass = bricks.filter((b) => b.phase === P.ENVELOPE && b.z === GLASS_Z && b.d === 1 && b.color === GLASS);
    expect(panels.length).toBeGreaterThan(200);
    expect(glass.length).toBeGreaterThan(200);
    expect(panels.every((b) => b.kind !== 'glass')).toBe(true);
    expect(glass.every((b) => b.kind === 'glass')).toBe(true);
  }, 60_000);

  it('A6: the Chenille: a glazed tube outside the west glass, Forum to level 6, in five or more flights, every piece on the cage', () => {
    const tube = bricks.filter((b) => b.phase === P.ENVELOPE && (b.color === TUBE || b.color === ESCALATOR || (b.z >= TUBE_Z[0] && b.z + b.d <= TUBE_Z[1] && b.x >= 0)));
    expect(tube.length).toBeGreaterThan(300);
    for (const b of tube) expect(b.z + b.d).toBeLessThanOrEqual(GLASS_Z - COL);
    expect(tube.some((b) => b.kind === 'glass')).toBe(true);
    // the flights: from the Forum's floor to level 6, each rising a storey or more, stepping up along the front one way
    expect(FLIGHTS.length).toBeGreaterThanOrEqual(5);
    expect(FLIGHTS[0].from).toBe(0);
    expect(FLIGHTS[FLIGHTS.length - 1].to).toBe(6);
    for (let k = 0; k < FLIGHTS.length; k++) {
      const f = FLIGHTS[k];
      expect(levelY(f.to) - levelY(f.from)).toBeGreaterThanOrEqual(STOREY);
      if (k > 0) {
        expect(f.from).toBe(FLIGHTS[k - 1].to);
        expect(f.xLow).toBeLessThan(FLIGHTS[k - 1].xHigh);
      }
      // the flight is there: its escalator low at its low end and high at its high end
      const steps = bricks.filter((b) => b.color === ESCALATOR && b.phase === P.ENVELOPE && b.x >= f.xHigh && b.x <= f.xLow);
      expect(steps.length).toBeGreaterThanOrEqual(15);
      const lo = steps.reduce((a, b) => (b.x > a.x ? b : a)), hi = steps.reduce((a, b) => (b.x < a.x ? b : a));
      expect(hi.y + hi.h - (lo.y + lo.h)).toBeGreaterThanOrEqual(STOREY - 6);
    }
    // every piece of the tube is held: joined, piece to piece, to the cage or the Forum's floor
    const idx = new Map<number, number>();
    const key = (x: number, y: number, z: number) => ((y - GRID.y0) * GRID.nz + (z - GRID.z0)) * GRID.nx + (x - GRID.x0);
    tube.forEach((b, i) => { for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) idx.set(key(x, y, z), i); });
    const neighbours = (b: Brick, f: (x: number, y: number, z: number) => void) => {
      for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) { f(x, b.y - 1, z); f(x, b.y + b.h, z); }
      for (let y = b.y; y < b.y + b.h; y++) {
        for (let z = b.z; z < b.z + b.d; z++) { f(b.x - 1, y, z); f(b.x + b.w, y, z); }
        for (let x = b.x; x < b.x + b.w; x++) { f(x, y, b.z - 1); f(x, y, b.z + b.d); }
      }
    };
    const held = new Uint8Array(tube.length), queue: number[] = [];
    tube.forEach((b, i) => neighbours(b, (x, y, z) => {
      const p = phaseAt(x, y, z);
      if (!held[i] && !idx.has(key(x, y, z)) && (p === P.STRUCTURE || p === P.FLOOR)) { held[i] = 1; queue.push(i); }
    }));
    expect(queue.length).toBeGreaterThan(0);
    while (queue.length) {
      const i = queue.pop()!;
      neighbours(tube[i], (x, y, z) => { const j = idx.get(key(x, y, z)); if (j !== undefined && !held[j]) { held[j] = 1; queue.push(j); } });
    }
    const loose = tube.filter((_, i) => !held[i]).map((b) => `${b.x},${b.y},${b.z}`);
    expect(loose).toEqual([]);
  }, 60_000);

  it('A7: everything marked with its source, ≥ 12 marks in the interior; the levels and the Chenille assumed or scaled', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts', 'brancusi.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(12);
    const layout = src('layout.ts');
    const before = (name: string) => layout.slice(Math.max(0, layout.indexOf(name) - 700), layout.indexOf(name));
    expect(before('export const FORUM_H')).toMatch(/\[assumed/);
    expect(before('export const FORUM_H')).not.toMatch(/levels[^.]*\[documented\]/);
    expect(before('export const TUBE_Z')).toMatch(/\[scaled/);
    expect(before('export const TUBE_Z')).not.toMatch(/\[documented\]/);
  });

  it('A8: the piazza fits OSM\'s way (IoU ≥ 0.75 in the lot) and falls to the building, 3.2 m (±2 plates); seven stacks at their places, 7 m high', () => {
    const W = TERRAIN.x1 - TERRAIN.x0, D = TERRAIN.z1 - TERRAIN.z0;
    const sett = new Uint8Array(W * D);
    for (const b of bricks) {
      if (!SETT.includes(b.color)) continue;
      for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) if (x >= TERRAIN.x0 && x < TERRAIN.x1 && z >= TERRAIN.z0 && z < TERRAIN.z1) sett[(z - TERRAIN.z0) * W + x - TERRAIN.x0] = 1;
    }
    let inter = 0, union = 0;
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++)
      for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) {
        const mine = sett[(z - TERRAIN.z0) * W + x - TERRAIN.x0] === 1, osm = inPoly(x + 0.5, z + 0.5, PIAZZA);
        if (mine && osm) inter++;
        if (mine || osm) union++;
      }
    expect(inter / union).toBeGreaterThanOrEqual(0.75);
    // its slope: the setts' level along the west edge (the 20 ft by rue Saint-Martin) against the foot of the west front
    const level = (z0: number, z1: number) => {
      const ys: number[] = [];
      for (const b of bricks) if (SETT.includes(b.color) && b.phase === P.LANDSCAPE && b.z >= z0 && b.z < z1 && b.x > 100 && b.x < 450) ys.push(b.y + b.h);
      ys.sort((a, c) => a - c);
      return ys[ys.length >> 1];
    };
    const zWest = Math.min(...PIAZZA.filter(([x]) => x > 100 && x < 450).map(([, z]) => z));
    const west = level(Math.ceil(zWest), Math.ceil(zWest) + 20), foot = level(-20, 0);
    expect(Math.abs(west - foot - Math.round(3.2 / FT / PL))).toBeLessThanOrEqual(2);
    expect(Math.abs(foot)).toBeLessThanOrEqual(2);
    // and it falls all the way: each 40 ft band toward the building no higher than the one before
    let prev = Infinity;
    for (let z = Math.ceil(zWest); z + 40 <= 0; z += 40) { const l = level(z, z + 40); expect(l).toBeLessThanOrEqual(prev + 1); prev = l; }
    // the stacks
    expect(STACKS.length).toBe(7);
    for (const s of STACKS) {
      const stem = bricks.find((b) => b.phase === P.LANDSCAPE && b.w === 4 && b.d === 4 && b.h > 20 && Math.abs(b.x + 2 - s.x) < 3 && Math.abs(b.z + 2 - s.z) < 3);
      expect(stem, `stack ${s.id}`).toBeTruthy();
      expect(Math.hypot(stem!.x + 2 - s.x, stem!.z + 2 - s.z)).toBeLessThanOrEqual(3);
      const top = Math.max(...at(stem!.x + 1, stem!.z + 1, P.LANDSCAPE).filter((b) => b.kind !== 'tile').map((b) => b.y + b.h));
      expect(Math.abs(top - (stem!.y + 1) - Math.round(7 / FT / PL))).toBeLessThanOrEqual(2);
      expect(STACK_H).toBe(Math.round(7 / FT / PL));
    }
  }, 60_000);

  it('A9: the Atelier Brancusi fits OSM\'s way 55503399 (IoU ≥ 0.7)', () => {
    expect(LOT_PARTS.find((p) => p.id === 55503399)?.tags.building).toBeTruthy();
    let inter = 0, union = 0;
    for (let z = B_BOX[1] - 10; z < B_BOX[3] + 10; z++)
      for (let x = B_BOX[0] - 10; x < B_BOX[2] + 10; x++) {
        const mine = inBrancusiCell(x, z) && at(x, z).some((b) => b.phase === P.ROOF || b.phase === P.ENVELOPE);
        const osm = inPoly(x + 0.5, z + 0.5, BRANCUSI);
        if (mine && osm) inter++;
        if (mine || osm) union++;
      }
    expect(inter / union).toBeGreaterThanOrEqual(0.7);
  }, 60_000);

  it('A10: the lot meets the real ground at its edges; near the lot no ground above IGN\'s level + 10 ft; no spikes', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PL - sampleGrid(n.near, x, z)) > 3 * PL + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    // IGN reads 32.8–36.0 m round the lot (spec 080, Research); the AWS tiles read 41–60 m there. y = 0 is IGN's 32.8 m.
    const highest = (36.0 - 32.8) / FT;
    const g = n.near;
    let worst = -Infinity, count = 0;
    for (let j = 0; j < g.nz; j++)
      for (let i = 0; i < g.nx; i++) {
        const x = g.x0 + i * g.step, z = g.z0 + j * g.step;
        if (x < TERRAIN.x0 - 300 || x > TERRAIN.x1 + 300 || z < TERRAIN.z0 - 300 || z > TERRAIN.z1 + 300) continue;
        worst = Math.max(worst, g.h[j * g.nx + i] - highest);
        count++;
      }
    expect(count).toBeGreaterThan(1000);
    expect(worst).toBeLessThanOrEqual(10);
    for (const [grid, limit] of [[n.near, 150], [n.far, 500]] as const) {
      let spike = 0;
      for (let j = 1; j < grid.nz - 1; j++)
        for (let i = 1; i < grid.nx - 1; i++) {
          const nb: number[] = [];
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (di || dj) nb.push(grid.h[(j + dj) * grid.nx + i + di]);
          nb.sort((a, c) => a - c);
          spike = Math.max(spike, Math.abs(grid.h[j * grid.nx + i] - (nb[3] + nb[4]) / 2));
        }
      expect(spike).toBeLessThanOrEqual(limit + 0.5);
    }
    expect(n.attribution.join(' ')).toMatch(/IGN/);
  }, 60_000);

  const cached = existsSync('scripts/.cache/haus-am-horn-buildings-1200.json') && existsSync('scripts/.cache/haus-am-horn-roads-1200.json');
  it('A11: lowlands and the Stravinsky Fountain\'s basin as water south of the lot; other houses unchanged', () => {
    expect(H.scenery?.lowlands).toBe(true);
    expect(H.scenery?.waterAreas).toBe(WATER_AREAS);
    const fx = FOUNTAIN.reduce((a, p) => a + p[0], 0) / FOUNTAIN.length, fz = FOUNTAIN.reduce((a, p) => a + p[1], 0) / FOUNTAIN.length;
    expect(fx).toBeLessThan(TERRAIN.x0);
    const basin = WATER_AREAS.find((a) => inPoly(fx, fz, a.rings[0]));
    expect(basin, 'the basin').toBeTruthy();
    expect(basin!.kind).toBe('basin');
    // no other house's definition sets water areas but those that did before
    const others = readdirSync('src/houses').filter((d) => existsSync(`src/houses/${d}/definition.ts`) && !['centre-pompidou', 'habitat-67', 'farnsworth-house', 'glass-house'].includes(d));
    for (const s of others) expect(readFileSync(`src/houses/${s}/definition.ts`, 'utf8'), s).not.toMatch(/waterAreas/);
    // the IGN ground is this house's opt-in alone
    for (const f of readdirSync('scripts/houses').filter((q) => q !== 'centre-pompidou.mjs')) expect(readFileSync(`scripts/houses/${f}`, 'utf8'), f).not.toMatch(/\bign\b/);
  });
  it.skipIf(!cached)('A11: regenerating the Haus am Horn gives byte-identical neighborhood.bin and lotTerrain.ts', () => {
    const files = ['public/haus-am-horn/neighborhood.bin', 'src/houses/haus-am-horn/model/lotTerrain.ts'];
    const before = files.map((f) => readFileSync(f));
    execFileSync('node', ['scripts/fetch-neighborhood.mjs', 'haus-am-horn'], { stdio: 'ignore' });
    files.forEach((f, i) => expect(readFileSync(f).equals(before[i]), f).toBe(true));
  }, 120_000);

  it('A12: the budget: ≤ 50,000 pieces, ≤ 30,000 in the building; the grid ≤ 80 MB', () => {
    expect(bricks.length).toBeLessThanOrEqual(50_000);
    const building = bricks.filter((b) => b.phase >= P.FOUNDATION && b.phase <= P.ROOF).length;
    expect(building).toBeLessThanOrEqual(30_000);
    expect((GRID.nx * GRID.nz * GRID.ny) / 2).toBeLessThanOrEqual(80 * 1024 * 1024);
    expect(builder.occ.byteLength).toBeLessThanOrEqual(80 * 1024 * 1024);
  });

  it('A13: deterministic, inside its grid, no overlaps; every phase used; about 3 minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    const seen = new Uint8Array(GRID.nx * GRID.nz * GRID.ny);
    let overlaps = 0;
    for (const b of bricks)
      for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
        const i = ((y - GRID.y0) * GRID.nz + (z - GRID.z0)) * GRID.nx + (x - GRID.x0);
        if (seen[i]) overlaps++;
        seen[i] = 1;
      }
    expect(overlaps).toBe(0);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(160);
    expect(s.total).toBeLessThan(200);
  }, 120_000);

  it('A14: tests/buildOrder.test.ts covers it', () => {
    expect(readFileSync('tests/buildOrder.test.ts', 'utf8')).toMatch(/[[ ]CENTRE_POMPIDOU[,\]]/);
  });

  it('A15: the home card is live, with the real piece count, its credits and the disclaimer; the numbers say "centre"', async () => {
    const { HOUSES } = await import('../src/houses');
    const c = HOUSES.find((h) => h.slug === 'centre-pompidou')!;
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.wikidata).toBe('Q178065');
    expect(c.affiliations).toEqual(['the Centre Pompidou']);
    expect(c.sources?.join(' ')).toMatch(/OpenStreetMap/);
    expect(c.sources?.join(' ')).toMatch(/IGN/);
    expect(c.sources?.join(' ')).toMatch(/ACR0000721/);
    expect(H.text.noun).toBe('centre');
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with the Centre Pompidou.');
  });
});
