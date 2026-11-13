// Spec: specs/074-villa-savoye.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { realToModelDir } from '../src/engine/scene/sun';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { VILLA_SAVOYE as H } from '../src/houses/villa-savoye/definition';
import { GRID } from '../src/houses/villa-savoye/model/villaSavoye';
import {
  BAY, CURVE, FLIGHTS, flightTop, GARDEN, HOUSE, inGround, inRect, inSolarium, LANDINGS, LIVING, LODGE, onCurve, onGroundEdge, onScreen,
  PILOTI_X, PILOTI_Z, PILOTIS, SOL_A, SOL_B, TERRACE, WELL, Y,
} from '../src/houses/villa-savoye/model/layout';
import { GREEN, WHITE } from '../src/houses/villa-savoye/model/house';
import { CAR_PATH, GRAVEL, inPark, TERRAIN } from '../src/houses/villa-savoye/model/site';
import { LOT_BUILDINGS } from '../src/houses/villa-savoye/model/lotTerrain';
import { P, PHASES } from '../src/houses/villa-savoye/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/villa-savoye/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/villa-savoye/model/${f}`, 'utf8');
const M = 3.28084;
/** the grid's stretch (spec 074 Q2): 16 studs for a 4.75 m bay */
const K = BAY / (4.75 * M);
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const cellsOf = (b: (typeof bricks)[number]) => {
  const out: [number, number, number][] = [];
  for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) out.push([x, y, z]);
  return out;
};
/** the real compass bearing of a model direction */
const bearingOf = (dx: number, dz: number) => {
  let best = 0, err = Infinity;
  for (let b = 0; b < 360; b += 0.5) {
    const [x, z] = realToModelDir(b, H.site.rotationDeg);
    const e = Math.hypot(x - dx / Math.hypot(dx, dz), z - dz / Math.hypot(dx, dz));
    if (e < err) { err = e; best = b; }
  }
  return best;
};
const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
/** pieces' cell centres all within `tol` ft of one circle round (cx, cz); returns the radius and the arc's span in degrees */
function arcFit(pts: [number, number][], cx: number, cz: number) {
  const ds = pts.map(([x, z]) => Math.hypot(x + 0.5 - cx, z + 0.5 - cz));
  const r = ds.reduce((a, d) => a + d, 0) / ds.length;
  const worst = Math.max(...ds.map((d) => Math.abs(d - r)));
  const angles = pts.map(([x, z]) => (Math.atan2(z + 0.5 - cz, x + 0.5 - cx) * 180) / Math.PI).sort((a, c) => a - c);
  // the span: 360° less the largest gap between neighbouring angles
  let gap = 360 + angles[0] - angles[angles.length - 1];
  for (let i = 1; i < angles.length; i++) gap = Math.max(gap, angles[i] - angles[i - 1]);
  return { r, worst, span: 360 - gap };
}

describe('074: the Villa Savoye', () => {
  it('A1: the box fits OSM\'s way 38327851 (IoU ≥ 0.75); 19 × 21.5 m on the 16-stud grid', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(HOUSE[2] - HOUSE[0] - 21.5 * M * K)).toBeLessThanOrEqual(2);
    expect(Math.abs(HOUSE[3] - HOUSE[1] - 19 * M * K)).toBeLessThanOrEqual(2);
  });

  it('A2: 25 round pilotis on a 5 × 5 grid, flush with the long façades, set back from the short ones, ground to first floor', () => {
    expect(PILOTIS.length).toBe(25);
    for (const xs of [PILOTI_X, PILOTI_Z]) for (let i = 1; i < 5; i++) expect(xs[i] - xs[i - 1]).toBe(BAY);
    expect(PILOTI_Z[0]).toBe(HOUSE[1]);
    expect(PILOTI_Z[4]).toBe(HOUSE[3] - 1);
    // the short façades overhang the end rows by 1.25 m (column centre to façade)
    expect(Math.abs(PILOTI_X[0] + 0.5 - HOUSE[0] - 1.25 * M)).toBeLessThanOrEqual(1);
    expect(Math.abs(HOUSE[2] - PILOTI_X[4] - 0.5 - 1.25 * M)).toBeLessThanOrEqual(1);
    for (const [x, z] of PILOTIS) {
      for (let y = 0; y < Y.SLAB; y++) {
        const b = at(x, y, z);
        expect(b?.kind, `${x},${y},${z}`).toBe('round');
        expect(b?.phase).toBe(P.STRUCTURE);
        expect(b?.color).toBe(WHITE);
      }
      expect(at(x, Y.SLAB, z)?.phase).toBe(P.STRUCTURE); // the slab sits on it
      expect(at(x, -1, z)).toBeDefined();
    }
  });

  it('A3: the ground floor\'s glass at the north-west end curves: one arc of ≥ 150°, radius 4.75 m', () => {
    const glass = bricks.filter((b) => b.phase === P.ENVELOPE && b.kind === 'glass' && b.y < Y.SLAB && b.x + b.w <= CURVE.cx);
    expect(glass.length).toBeGreaterThan(20);
    const pts = glass.flatMap((b) => cellsOf(b).map(([x, , z]) => [x, z] as [number, number]));
    const fit = arcFit(pts, CURVE.cx, CURVE.cz);
    expect(fit.worst).toBeLessThanOrEqual(1);
    expect(fit.span).toBeGreaterThanOrEqual(150);
    expect(Math.abs(fit.r - 4.75 * M)).toBeLessThanOrEqual(1.5);
    // and the curve is glass all round: every cell of it is glass or its frame
    for (let z = 16; z < 49; z++) for (let x = 0; x < 33; x++) if (onCurve(x, z)) expect(at(x, 10, z)?.phase, `${x},${z}`).toBe(P.ENVELOPE);
  });

  it('A4: a car drives round the house without reversing: the path under the box is clear, on gravel', () => {
    const gravel = new Set(GRAVEL);
    const blocked: string[] = [], bare: string[] = [];
    for (const [x0, z0, x1, z1] of CAR_PATH) {
      expect(Math.min(x1 - x0, z1 - z0)).toBeGreaterThanOrEqual(2.5 * M);
      for (let z = z0; z < z1; z++)
        for (let x = x0; x < x1; x++) {
          for (let y = 0; y < Y.SLAB; y++) if (at(x, y, z)) blocked.push(`${x},${y},${z}`);
          if (!gravel.has(at(x, -1, z)?.color ?? -1)) bare.push(`${x},${z}`);
        }
    }
    expect(blocked.slice(0, 10)).toEqual([]);
    expect(bare.slice(0, 10)).toEqual([]);
    // from the south-east end, down one long side under the box, round the north-west end, back along the other
    const [ne, nw, sw] = CAR_PATH;
    expect(ne[2]).toBeGreaterThan(HOUSE[2]);
    expect(sw[2]).toBeGreaterThan(HOUSE[2]);
    expect(ne[3]).toBeLessThanOrEqual(16);
    expect(sw[1]).toBeGreaterThan(48);
    expect(nw[0]).toBeGreaterThan(PILOTI_X[0]);
    expect(nw[2]).toBeLessThanOrEqual(PILOTI_X[1]);
    expect(nw[1]).toBeLessThan(ne[3]);
    expect(nw[3]).toBeGreaterThan(sw[1]);
  });

  it('A5: the enclosed ground floor is 190 m² and dark green; the box\'s walls and the pilotis white', () => {
    let area = 0;
    for (let z = 0; z < 65; z++) for (let x = 0; x < 73; x++) if (inGround(x, z)) area++;
    expect(Math.abs(area / (M * M) / 190 - 1)).toBeLessThanOrEqual(0.15);
    const walls = bricks.filter((b) => b.phase === P.ENVELOPE && b.kind === 'brick' && b.y < Y.SLAB && b.z >= 16 && b.z <= 48 && b.x <= 72 && onGroundEdge(b.x, b.z));
    expect(walls.length).toBeGreaterThan(50);
    for (const b of walls) expect(b.color).toBe(GREEN);
    const box = bricks.filter((b) => b.phase === P.ENVELOPE && b.kind === 'brick' && b.y >= Y.FIRST && (b.x === 0 || b.z === 0 || b.x + b.w === 73 || b.z + b.d === 65) && b.x >= 0 && b.x < 73 && b.z >= 0 && b.z < 65);
    expect(box.length).toBeGreaterThan(100);
    for (const b of box) expect(b.color).toBe(WHITE);
  });

  it('A6: the ribbon window: one band on each façade, glazed before the rooms, open before the terrace, with the two baby piloti', () => {
    const faces: [string, (u: number) => [number, number], number][] = [
      ['north-west', (u) => [0, u], 65], ['south-east', (u) => [72, u], 65], ['north-east', (u) => [u, 0], 73], ['south-west', (u) => [u, 64], 73],
    ];
    let babies = 0, open = 0;
    for (const [name, cell, len] of faces) {
      for (let u = 0; u < len; u++) {
        const [x, z] = cell(u);
        // a wall under the sill and over the head, all the way along
        expect(at(x, Y.SILL - 1, z)?.color, `${name} ${u} sill`).toBe(WHITE);
        expect(at(x, Y.HEAD, z)?.color, `${name} ${u} head`).toBe(WHITE);
        for (let y = Y.SILL; y < Y.HEAD; y++) {
          const b = at(x, y, z);
          const terrace = inRect(x - (x === 72 ? 1 : 0), z - (z === 64 ? 1 : 0), TERRACE) && (x === 72 || z === 64);
          if (!b) { expect(terrace, `${name} ${u},${y} open`).toBe(true); open++; continue; }
          expect(b.phase, `${name} ${u},${y}`).toBe(P.ENVELOPE);
          if (b.kind === 'round') { expect(terrace).toBe(true); if (y === Y.SILL) babies++; continue; }
          expect(terrace, `${name} ${u},${y} glazed before the terrace`).toBe(false);
          expect(['glass', 'plate']).toContain(b.kind);
        }
      }
    }
    expect(babies).toBe(2);
    expect(open).toBeGreaterThan(400);
  });

  it('A7: the solarium\'s top 9.40 m above the lawn; the first floor and the roof at the assumed levels', () => {
    const screens = bricks.filter((b) => b.phase === P.ROOF && cellsOf(b).some(([x, , z]) => onScreen(x, z) !== null));
    const top = Math.max(...screens.map((b) => b.y + b.h));
    expect(Math.abs(top * PLATE - (hm.at(-10, 32) * PLATE + 0) - 9.4 * M)).toBeLessThanOrEqual(1);
    expect(hm.at(-10, 32)).toBe(0);
    expect(Math.abs(Y.FIRST * PLATE - 3.2 * M)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(Y.ROOF * PLATE - 6.4 * M)).toBeLessThanOrEqual(0.5);
    expect(at(10, Y.FIRST - 1, 10)?.phase).toBe(P.STRUCTURE);
    expect(at(10, Y.FIRST, 10)).toBeUndefined();
    expect(at(10, Y.ROOF - 1, 30)?.phase).toBe(P.ROOF);
  });

  it('A8: the ramp: two flights to the first floor, two to the roof, one plate per step, meeting each floor with no gap', () => {
    expect(FLIGHTS.length).toBe(4);
    const ends = [0, LANDINGS[0], Y.FIRST, LANDINGS[1], Y.ROOF];
    FLIGHTS.forEach((f, i) => {
      expect(f.from).toBe(ends[i]);
      expect(f.to).toBe(ends[i + 1]);
      const xs = Array.from({ length: f.x1 - f.x0 }, (_, k) => (f.dir === 1 ? f.x0 + k : f.x1 - 1 - k));
      let prev = f.from;
      for (const x of xs) {
        const t = flightTop(f, x);
        expect(t - prev, `flight ${i} at ${x}`).toBeLessThanOrEqual(1);
        expect(t).toBeGreaterThanOrEqual(prev);
        for (let z = f.z[0]; z < f.z[1]; z++) expect(at(x, t - 1, z)?.kind, `flight ${i} ${x},${z}`).toBe('plate');
        prev = t;
      }
      expect(prev).toBe(f.to);
      // the step before the first and after the last: the floor or a landing, level with it
      const before = f.dir === 1 ? f.x0 - 1 : f.x1, after = f.dir === 1 ? f.x1 : f.x0 - 1;
      for (let z = f.z[0]; z < f.z[1]; z++) {
        if (i > 0) expect(at(before, f.from - 1, z), `flight ${i} start`).toBeDefined();
        expect(at(after, f.to - 1, z), `flight ${i} end ${after},${z}`).toBeDefined();
        expect(at(after, f.to, z), `flight ${i} end clear`).toBeUndefined();
      }
    });
    // inside the hall, from its floor
    expect(at(FLIGHTS[0].x0, -1, FLIGHTS[0].z[0])?.phase).toBe(P.FLOOR);
    expect(inGround(FLIGHTS[0].x0, FLIGHTS[0].z[0])).toBe(true);
  });

  it('A9: the living room 84 m² on the north-west, the terrace open to the sky on the south; the roof garden and the solarium', () => {
    const m2 = (ft2: number) => ft2 / (M * M);
    expect(Math.abs(m2((LIVING[2] - LIVING[0]) * (LIVING[3] - LIVING[1])) / 84 - 1)).toBeLessThanOrEqual(0.15);
    expect(LIVING[0]).toBe(HOUSE[0] + 1); // along the north-west front
    expect(angleDiff(bearingOf(-1, 0), 315)).toBeLessThanOrEqual(30);
    const tc = [(TERRACE[0] + TERRACE[2]) / 2 - 36.5, (TERRACE[1] + TERRACE[3]) / 2 - 32.5] as const;
    expect(angleDiff(bearingOf(tc[0], tc[1]), 180)).toBeLessThanOrEqual(45);
    for (let z = TERRACE[1]; z < TERRACE[3]; z++)
      for (let x = TERRACE[0]; x < TERRACE[2]; x++) {
        expect(at(x, Y.FIRST - 1, z), `${x},${z} floor`).toBeDefined();
        for (let y = Y.FIRST; y < 90; y++) expect(at(x, y, z), `${x},${y},${z}`).toBeUndefined();
      }
    let garden = 0, sol = 0;
    for (let z = 1; z < 64; z++)
      for (let x = 1; x < 72; x++) {
        if (inSolarium(x, z)) sol++;
        else if (inRect(x, z, GARDEN) && !inRect(x, z, WELL)) garden++;
      }
    expect(Math.abs(m2(garden) / 110 - 1)).toBeLessThanOrEqual(0.2);
    expect(Math.abs(m2(sol) / 70 - 1)).toBeLessThanOrEqual(0.2);
  });

  it('A10: the solarium\'s screens curve; one rectangular opening facing toward the Seine', () => {
    const screen = bricks.filter((b) => b.phase === P.ROOF && b.y >= Y.ROOF && cellsOf(b).some(([x, , z]) => onScreen(x, z) !== null));
    for (const [arc, c] of [['A', SOL_A], ['B', SOL_B]] as const) {
      const pts = screen.filter((b) => cellsOf(b).some(([x, , z]) => onScreen(x, z) === arc)).flatMap((b) => cellsOf(b).map(([x, , z]) => [x, z] as [number, number]));
      expect(pts.length, arc).toBeGreaterThan(20);
      const fit = arcFit(pts, c.cx, c.cz);
      expect(fit.worst, arc).toBeLessThanOrEqual(1);
      expect(fit.span, arc).toBeGreaterThanOrEqual(60);
    }
    // the openings: screen cells left empty between the parapet and the top
    const holes: [number, number, number][] = [];
    for (let z = 0; z < 40; z++) for (let x = 0; x < 22; x++) if (onScreen(x, z)) for (let y = Y.PARAPET; y < Y.SOLARIUM; y++) if (!at(x, y, z)) holes.push([x, y, z]);
    expect(holes.length).toBeGreaterThan(0);
    const xs = new Set(holes.map((h) => h[0]));
    expect([...xs]).toEqual([0]);
    const ys = holes.map((h) => h[1]), zs = holes.map((h) => h[2]);
    const w = Math.max(...zs) - Math.min(...zs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1;
    expect(holes.length).toBe(w * h); // one rectangle
    const b = bearingOf(-1, 0); // the x = 0 wall faces −x
    expect(angleDiff(b, 0)).toBeLessThanOrEqual(45);
  });

  it('A11: the lodge: 7.0 × 4.1 m at OSM\'s way 410063805; one long window on its south front, three blind walls', () => {
    expect(Math.abs(LODGE[2] - LODGE[0] - 7.0 * M)).toBeLessThanOrEqual(1);
    expect(Math.abs(LODGE[3] - LODGE[1] - 4.1 * M)).toBeLessThanOrEqual(1);
    const osm = LOT_BUILDINGS.find((b) => b.id === 410063805)!;
    const cx = osm.ring.reduce((a, p) => a + p[0], 0) / osm.ring.length, cz = osm.ring.reduce((a, p) => a + p[1], 0) / osm.ring.length;
    expect(Math.hypot((LODGE[0] + LODGE[2]) / 2 - cx, (LODGE[1] + LODGE[3]) / 2 - cz)).toBeLessThanOrEqual(2 * M);
    const glassOn = (pred: (x: number, z: number) => boolean) =>
      bricks.filter((b) => b.kind === 'glass' && inRect(b.x, b.z, LODGE) && pred(b.x, b.z)).length;
    const south = LODGE[3] - 1;
    expect(angleDiff(bearingOf(0, 1), 180)).toBeLessThanOrEqual(60);
    expect(glassOn((_x, z) => z === south)).toBeGreaterThan(0);
    expect(glassOn((x, z) => z === LODGE[1] || x === LODGE[0] || x === LODGE[2] - 1)).toBe(0);
    for (let x = LODGE[0]; x < LODGE[2]; x++) expect(at(x, 10, LODGE[1])?.kind).toBe('brick');
    for (let z = LODGE[1]; z < LODGE[3]; z++) { expect(at(LODGE[0], 10, z)?.kind).toBe('brick'); expect(at(LODGE[2] - 1, 10, z)?.kind).toBe('brick'); }
    // the window: one run, most of the front's length
    let run = 0;
    for (let x = LODGE[0]; x < LODGE[2]; x++) if (at(x, 10, south)?.phase === P.ENVELOPE) run++;
    expect(run).toBeGreaterThanOrEqual((LODGE[2] - LODGE[0]) / 2);
  });

  it('A12: deterministic, inside its grid, no overlaps; every phase used; about 2½ minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(170);
  }, 120_000);

  it('A14: everything marked with its source; at least 10 marks in the interior', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(10);
  });

  it('A15: the lot meets the real ground at its edges; the park\'s lawn is level', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    let lo = Infinity, hi = -Infinity;
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z += 2)
      for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 2) if (inPark(x, z)) { lo = Math.min(lo, hm.at(x, z)); hi = Math.max(hi, hm.at(x, z)); }
    expect((hi - lo) * PLATE).toBeLessThanOrEqual(2);
  });

  it('A16: the terrain has no spikes (spec 010b)', () => {
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

  it('A17: the home card is live, with the real piece count, its credits and the disclaimer (Q1, changed: live)', async () => {
    const { HOUSES } = await import('../src/houses');
    const { PAGES } = await import('../vite.config');
    const { STATS } = await import('../src/houses/stats');
    const card = HOUSES.find((h) => h.slug === 'villa-savoye');
    expect(card?.status).toBe('live');
    expect(card?.pieces).toBe(STATS['villa-savoye'].pieces);
    expect(card?.sources?.length).toBeGreaterThan(0);
    expect(Object.keys(PAGES)).toContain('villa-savoye');
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with the Centre des monuments nationaux or the Fondation Le Corbusier.');
    expect(bricks.length).toBeGreaterThan(10000);
  });

  it('views start in the open: not inside a neighbouring building (as tests/viewsClear.test.ts)', () => {
    const b = n.buildings;
    const inside: string[] = [];
    for (const [name, v] of Object.entries(H.views)) {
      const p = v.view.pos;
      for (let i = 0; i < b.count; i++) {
        if (p.y > b.top[i] + 15) continue;
        const ring: [number, number][] = [];
        for (let k = b.start[i]; k < b.start[i + 1]; k++) ring.push([b.xz[k * 2], b.xz[k * 2 + 1]]);
        if (inPoly(p.x, p.z, ring)) inside.push(name);
      }
    }
    expect(inside).toEqual([]);
  });
});
