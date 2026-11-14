// Spec: specs/079-salk-institute.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { realToModelDir, solarPosition } from '../src/engine/scene/sun';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { SALK_INSTITUTE as H } from '../src/houses/salk-institute/definition';
import { EAMES } from '../src/houses/eames-house/definition';
import { LOVELL_BEACH } from '../src/houses/lovell-beach-house/definition';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { GRID } from '../src/houses/salk-institute/model/salk';
import {
  BASIN1, BLOCK, CHANNEL, COURT, FLAT_Z, fold, frontAt, LAB, LIGHT_WELLS, LINKS, OUTER_TOWERS, PLAZA, POINT_Z, Rect, SOURCE, STOREYS, STUDY_FLOORS,
  STUDY_TOWERS, studies, TOWER_BACK, TOWER_WEST, TRUSS_POSTS, TRUSS_X, Y,
} from '../src/houses/salk-institute/model/layout';
import { CONCRETE, GLASS, HOLE, HOLE_AT, HOLE_EVERY, HOLE_ROWS, RED_PAVING, STEEL, TEAK, TRAVERTINE, WALK } from '../src/houses/salk-institute/model/house';
import { inBlock, inStudyTower, lotGround, TERRAIN } from '../src/houses/salk-institute/model/site';
import { LOT_SELF } from '../src/houses/salk-institute/model/lotTerrain';
import { WATER_AREAS } from '../src/houses/salk-institute/model/water';
import { WATER } from '../src/houses/salk-institute/model/landscape';
import { P, PHASES } from '../src/houses/salk-institute/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/salk-institute/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/salk-institute/model/${f}`, 'utf8');
type B = (typeof bricks)[number];
const cells = new Map<string, B>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const inR = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
/** the real compass bearing of a model direction */
const bearingOf = (dx: number, dz: number) => {
  let best = 0, err = Infinity;
  for (let b = 0; b < 360; b += 0.05) {
    const [x, z] = realToModelDir(b, H.site.rotationDeg);
    const e = Math.hypot(x - dx / Math.hypot(dx, dz), z - dz / Math.hypot(dx, dz));
    if (e < err) { err = e; best = b; }
  }
  return best;
};
const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
/** IoU of a set of model cells and an OSM ring, rasterised by cell centres */
function iou(mine: (x: number, z: number) => boolean, ring: [number, number][]) {
  const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
  let inter = 0, union = 0;
  for (let z = Math.floor(Math.min(...zs)) - 20; z < Math.max(...zs) + 20; z++)
    for (let x = Math.floor(Math.min(...xs)) - 20; x < Math.max(...xs) + 20; x++) {
      const a = mine(x, z), o = inPoly(x + 0.5, z + 0.5, ring);
      if (a && o) inter++;
      if (a || o) union++;
    }
  return inter / union;
}
/** OSM's water areas by their extent: the channel (way 60739892) is the long thin one, the big basin (way 60739889) the one across
 * the axis at its west end */
const xSpan = (r: [number, number][]) => Math.max(...r.map((p) => p[0])) - Math.min(...r.map((p) => p[0]));
const OSM_CHANNEL = WATER_AREAS.map((w) => w.rings[0]).find((r) => xSpan(r) > 150)!;
const OSM_BASIN = WATER_AREAS.map((w) => w.rings[0]).find((r) => xSpan(r) < 25 && Math.max(...r.map((p) => p[1])) > 25)!;
/** a wing's plan as OSM traces it: the block, the outer towers, the study towers and the links between them */
const inLink = (x: number, z: number) => LINKS.some(([a, c]) => x >= a && x < c) && fold(z) >= TOWER_BACK && fold(z) < BLOCK[1];
const wing = (x: number, z: number) => inBlock(x, z) || inStudyTower(x, z) || inLink(x, z);
const KAHN = [P.FOUNDATION, P.FLOOR, P.STRUCTURE, P.ENVELOPE, P.ROOF];

describe('079: the Salk Institute', () => {
  it('A1: the two lab wings fit OSM\'s ways 31844744 and 31839360 (IoU ≥ 0.75) on their 90.5°/270.5° sides; 362 × 150 and 363 × 147 ft; mirror images', () => {
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    const north = LOT_SELF.find((r) => r[0][1] > 0)!, south = LOT_SELF.find((r) => r[0][1] < 0)!;
    expect(iou((x, z) => z >= 0 && wing(x, z), north)).toBeGreaterThanOrEqual(0.75);
    expect(iou((x, z) => z < 0 && wing(x, z), south)).toBeGreaterThanOrEqual(0.75);
    expect(angleDiff(bearingOf(1, 0), 270.5)).toBeLessThanOrEqual(2);
    expect(angleDiff(bearingOf(-1, 0), 90.5)).toBeLessThanOrEqual(2);
    // each wing's extent
    const ext = (s: number) => {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let z = -200; z < 200; z++) for (let x = -5; x < 370; x++) if (Math.sign(z + 0.5) === s && wing(x, z)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x + 1); z0 = Math.min(z0, z); z1 = Math.max(z1, z + 1); }
      return [x1 - x0, z1 - z0];
    };
    const [ln, dn] = ext(1), [ls, ds] = ext(-1);
    expect(Math.abs(ln - 362)).toBeLessThanOrEqual(3);
    expect(Math.abs(dn - 150)).toBeLessThanOrEqual(3);
    expect(Math.abs(ls - 363)).toBeLessThanOrEqual(3);
    expect(Math.abs(ds - 147)).toBeLessThanOrEqual(3);
    // mirror images about the channel's line: the plan, and every built cell of the Kahn buildings
    for (let z = 0; z < 200; z++) for (let x = -5; x < 370; x++) expect(wing(x, z), `${x},${z}`).toBe(wing(x, -1 - z));
    let checked = 0;
    for (const b of bricks) {
      if (!KAHN.includes(b.phase) || b.z < 0 || !wing(b.x, b.z)) continue;
      const m = at(b.x, b.y, -1 - b.z);
      expect(m?.color, `${b.x},${b.y},${b.z}`).toBe(b.color);
      checked++;
    }
    expect(checked).toBeGreaterThan(5000);
  }, 120_000);

  it('A2: five study towers to a wing, four 40 ft and one 20 ft, 60 ft apart and 21 ft clear of the block; 36 studies with 45° bays and a face looking west', () => {
    expect(STUDY_TOWERS.length).toBe(5);
    const widths = STUDY_TOWERS.map((r) => r[2] - r[0]);
    expect(widths).toEqual([20, 40, 40, 40, 40]);
    expect(STUDY_TOWERS[0][0]).toBe(Math.min(...STUDY_TOWERS.map((r) => r[0]))); // the narrow one at the east end
    for (let i = 1; i < TOWER_WEST.length; i++) expect(Math.abs(TOWER_WEST[i] - TOWER_WEST[i - 1] - 60)).toBeLessThanOrEqual(2);
    expect(Math.abs(BLOCK[1] - TOWER_BACK - 21)).toBeLessThanOrEqual(2);
    // both wings: the towers stand on both sides of the plaza
    for (const r of STUDY_TOWERS) { expect(inStudyTower(r[0] + 1, 60)).toBe(true); expect(inStudyTower(r[0] + 1, -61)).toBe(true); }
    // nothing in the light court above the plaza but the bridges (their slabs and railings)
    const court: string[] = [];
    for (const b of bricks) {
      if (b.y < 0 || b.phase === P.SITE || b.phase === P.LANDSCAPE) continue;
      if (fold(b.z) < TOWER_BACK || fold(b.z) >= BLOCK[1] || b.x < COURT[0] || b.x >= COURT[2]) continue;
      if (inLink(b.x, b.z) && (b.color === CONCRETE || b.color === STEEL) && STUDY_FLOORS.some((t) => b.y >= t - Y.SLAB && b.y < t + 8)) continue;
      court.push(`${b.x},${b.y},${b.z}`);
    }
    expect(court).toEqual([]);
    // 36 studies: each with its teak window wall on both its 45° wall and its west face
    const all = studies();
    expect(all.length * 2).toBe(36);
    for (const st of all)
      for (const s of [1, -1]) {
        const zz = (z: number) => (s > 0 ? z : -1 - z);
        const y = st.y + 2;
        for (let u = 12; u < 20; u++) {
          expect(frontAt(u)).toBe(FLAT_Z - (u - 11)); // one stud in for one stud along
          expect(at(st.x0 + u, y, zz(frontAt(u)))?.color, `study ${st.x0} u ${u}`).toBe(TEAK);
        }
        for (let z = POINT_Z + 1; z < FLAT_Z; z++) {
          expect(at(st.x0 + 19, y, zz(z))?.phase).toBe(P.ENVELOPE);
          expect(at(st.x0 + 20, y, zz(z)), `west face ${st.x0} ${z}`).toBeUndefined(); // open to the west
        }
      }
    expect(angleDiff(bearingOf(1, 0), 270)).toBeLessThanOrEqual(3); // that face's outward normal (+x) is toward the sea
  });

  it('A3: six storeys, lab and service from the bottom, three below the plaza; Vierendeel trusses 9 ft deep with openings; the labs clear 65 × 245 ft', () => {
    expect(STOREYS.map((s) => s.kind)).toEqual(['lab', 'service', 'lab', 'service', 'lab', 'service']);
    expect(STOREYS.filter((s) => s.y1 <= Y.PLAZA).length).toBe(3);
    for (let i = 1; i < STOREYS.length; i++) expect(STOREYS[i].y0).toBe(STOREYS[i - 1].y1);
    for (const s of STOREYS.filter((st) => st.kind === 'service'))
      for (const tx of TRUSS_X)
        for (const sz of [1, -1]) {
          const z = (v: number) => (sz > 0 ? v : -1 - v);
          // a post: solid from the service floor to the floor above
          let depth = 0;
          for (let y = s.y0; y < s.y1; y++) if (at(tx, y, z(TRUSS_POSTS[4]))?.color === CONCRETE) depth++; else break;
          expect(Math.abs(Math.min(depth, Y.TRUSS) * PLATE - 9)).toBeLessThanOrEqual(0.4);
          expect(depth).toBeGreaterThanOrEqual(Y.TRUSS);
          // the openings: 6 ft at the centre, 5 ft at the ends
          const opening = (zc: number) => { let h = 0; for (let y = s.y0; y < s.y0 + Y.TRUSS; y++) if (!at(tx, y, z(zc))) h++; return h * PLATE; };
          expect(Math.abs(opening(123) - 6)).toBeLessThanOrEqual(0.4);
          expect(Math.abs(opening(93) - 5)).toBeLessThanOrEqual(0.4);
        }
    expect(LAB[2] - LAB[0]).toBeGreaterThanOrEqual(245 - 2);
    expect(LAB[3] - LAB[1]).toBeGreaterThanOrEqual(65 - 2);
    for (const s of STOREYS.filter((st) => st.kind === 'lab')) {
      const inside = bricks.filter((b) => b.phase !== P.INTERIOR && b.y + b.h > s.y0 && b.y < s.y1 && b.x + b.w > LAB[0] && b.x < LAB[2]
        && (inR(b.x, b.z, LAB) || inR(b.x, -1 - b.z, LAB) || inR(b.x + b.w - 1, b.z + b.d - 1, LAB) || inR(b.x + b.w - 1, -1 - (b.z + b.d - 1), LAB)));
      expect(inside.map((b) => `${b.x},${b.y},${b.z}`)).toEqual([]);
    }
  });

  it('A4: the plaza level and bare; 77 ft between the points, 94 between the flat faces; the channel 206 ft on 270.1°; the basin and the spill', () => {
    const trav = bricks.filter((b) => b.color === TRAVERTINE && b.kind === 'tile' && b.x >= PLAZA[0] && b.x + b.w <= 309);
    expect(trav.length).toBeGreaterThan(50);
    expect(new Set(trav.map((b) => b.y + b.h))).toEqual(new Set([Y.PLAZA]));
    // nothing planted on it: the landscape there is water only
    const planted = bricks.filter((b) => b.phase === P.LANDSCAPE && b.kind !== 'water' && b.kind !== 'falls' && b.x >= PLAZA[0] && b.x < 322 && Math.abs(b.z + 0.5) < FLAT_Z);
    expect(planted.length).toBe(0);
    // the open widths, between the wings' study towers
    let pn = Infinity, ps = -Infinity, fn = Infinity, fs = -Infinity;
    for (let x = PLAZA[0]; x < 322; x++) for (let z = -60; z < 60; z++) if (inStudyTower(x, z)) {
      if (z >= 0) pn = Math.min(pn, z); else ps = Math.max(ps, z + 1);
    }
    for (const r of STUDY_TOWERS) for (let z = -60; z < 60; z++) if (inStudyTower(r[0] + 3, z)) { if (z >= 0) fn = Math.min(fn, z); else fs = Math.max(fs, z + 1); }
    expect(Math.abs(pn - ps - 77)).toBeLessThanOrEqual(2);
    expect(Math.abs(fn - fs - 94)).toBeLessThanOrEqual(2);
    // the channel: a straight line of water 1–2 studs wide and 206 ft long, from its source at the east end
    const water = bricks.filter((b) => b.kind === 'water' && inR(b.x, b.z, CHANNEL));
    const zs = new Set<number>(), xs: number[] = [];
    for (const b of water) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) { zs.add(z); xs.push(x); }
    expect(zs.size).toBeGreaterThanOrEqual(1);
    expect(zs.size).toBeLessThanOrEqual(2);
    expect(Math.abs(Math.max(...xs) + 1 - Math.min(...xs) - 206)).toBeLessThanOrEqual(3);
    for (let x = CHANNEL[0]; x < CHANNEL[2]; x += 5) for (const z of zs) expect(at(x, Y.CHANNEL_WATER - 1, z)?.kind, `${x},${z}`).toBe('water');
    expect(angleDiff(bearingOf(1, 0), 270.1)).toBeLessThanOrEqual(1);
    const osm = OSM_CHANNEL;
    expect(Math.abs(Math.max(...osm.map((p) => p[0])) - Math.min(...osm.map((p) => p[0])) - 206)).toBeLessThanOrEqual(5);
    expect(at(SOURCE[0], Y.CHANNEL_WATER - 1, SOURCE[1])?.kind).toBe('water');
    expect(SOURCE[2]).toBe(CHANNEL[0]); // the source at its east end (−x)
    // the basin: fits OSM's way 60739889, a little below the plaza, spilling to lower water
    expect(iou((x, z) => inR(x, z, BASIN1), OSM_BASIN)).toBeGreaterThanOrEqual(0.6);
    expect(at(BASIN1[0] + 5, Y.BASIN1_WATER - 1, 10)?.kind).toBe('water');
    expect(Y.BASIN2_WATER).toBeLessThan(Y.BASIN1_WATER);
    expect(Y.LANDING).toBeLessThan(Y.BASIN2_WATER);
    expect(bricks.filter((b) => b.kind === 'falls').length).toBeGreaterThanOrEqual(2);
    expect(bricks.find((b) => b.kind === 'water')!.color).toBe(WATER);
  });

  it('A5: at sunset on the March 2026 equinox the sun sets down the channel (within 2°)', () => {
    // the March equinox, 2026-03-20; the evening moment the engine's sun crosses the horizon
    const day = Date.UTC(2026, 2, 20);
    let a = day + 20 * 3600e3, b = day + 30 * 3600e3; // local afternoon to after dark (UTC−7)
    const el = (t: number) => solarPosition(new Date(t), H.site.lat, H.site.lon).elevation;
    expect(el(a)).toBeGreaterThan(0);
    expect(el(b)).toBeLessThan(0);
    for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (el(m) > 0) a = m; else b = m; }
    const sun = solarPosition(new Date(a), H.site.lat, H.site.lon);
    const [dx, dz] = realToModelDir(sun.azimuth, H.site.rotationDeg);
    const deg = (Math.acos(dx / Math.hypot(dx, dz)) * 180) / Math.PI; // the channel runs along +x, toward the sea
    expect(deg).toBeLessThanOrEqual(2);
  });

  it('A6: light wells on both outer sides of each wing, about 38 × 25 ft, down to the lowest lab floor, with glass on the lab side', () => {
    expect(LIGHT_WELLS.length).toBeGreaterThanOrEqual(4);
    for (const w of LIGHT_WELLS) {
      expect(Math.abs(w[2] - w[0] - 38)).toBeLessThanOrEqual(3);
      expect(Math.abs(w[3] - w[1] - 25)).toBeLessThanOrEqual(3);
      expect(w[1]).toBe(BLOCK[3]); // against the block's outer face
      for (const s of [1, -1]) {
        const z = (v: number) => (s > 0 ? v : -1 - v);
        const cx = (w[0] + w[2]) >> 1;
        // the floor: red paving at the lowest lab floor, and open above it
        expect(at(cx, Y.LOWEST - 1, z(w[1] + 3))?.color).toBe(RED_PAVING);
        expect(hm.at(cx, z(w[1] + 3))).toBe(Y.LOWEST);
        expect(at(cx, Y.LOWEST + 10, z(w[1] + 3))).toBeUndefined();
        // the lab's glass on its side, on each lab floor below the plaza
        for (const st of STOREYS.filter((q) => q.kind === 'lab' && q.y1 <= 0)) expect(at(cx, st.y0 + 10, z(BLOCK[3] - 1))?.color).toBe(GLASS);
      }
    }
    // between the outer towers, on both wings
    for (const t of OUTER_TOWERS) expect(LIGHT_WELLS.some((w) => w[0] === t[2] || w[2] === t[0])).toBe(true);
  });

  it('A7: one warm grey concrete with lead-grey tie holes on a regular grid; one teak; one cream travertine; no other wall colour', () => {
    const kahn = bricks.filter((b) => (b.phase === P.FOUNDATION || b.phase === P.STRUCTURE || b.phase === P.ROOF) && (inBlock(b.x, b.z) || inStudyTower(b.x, b.z) || b.kind === 'brick'));
    const cols = new Set(kahn.filter((b) => b.color !== TRAVERTINE && b.color !== WALK).map((b) => b.color));
    // the roofs' finish is the only other colour, on the roofs
    for (const c of cols) expect([CONCRETE, HOLE, 0x9f9890]).toContain(c);
    const [r, , bl] = [(CONCRETE >> 16) & 255, (CONCRETE >> 8) & 255, CONCRETE & 255];
    expect(r).toBeGreaterThan(bl); // warm
    // the holes: on the hole rows, every 8 studs along their wall
    const holes = bricks.filter((b) => b.color === HOLE);
    expect(holes.length).toBeGreaterThan(500);
    for (const h of holes) {
      expect(h.w * h.d * h.h).toBe(1);
      expect(HOLE_ROWS).toContain(h.y);
      const ok = ((h.x % HOLE_EVERY) + HOLE_EVERY) % HOLE_EVERY === HOLE_AT || fold(h.z) % HOLE_EVERY === HOLE_AT;
      expect(ok, `${h.x},${h.y},${h.z}`).toBe(true);
    }
    // on the walls of the plaza, the light wells and the outside
    expect(holes.some((h) => h.y < 0 && LIGHT_WELLS.some((w) => inR(h.x, fold(h.z), [w[0] - 1, w[1], w[2] + 1, w[3] + 1])))).toBe(true);
    expect(holes.some((h) => h.y > 0 && inStudyTower(h.x, h.z))).toBe(true);
    // the teak: one colour; the envelope's colours: glass, teak and steel only
    expect(new Set(bricks.filter((b) => b.phase === P.ENVELOPE).map((b) => b.color))).toEqual(new Set([GLASS, TEAK, STEEL]));
    // the travertine: one cream, warm and light
    const trav = new Set(bricks.filter((b) => b.phase === P.STRUCTURE && !inBlock(b.x, b.z) && !inStudyTower(b.x, b.z) && b.color !== CONCRETE && b.color !== HOLE && b.color !== WALK).map((b) => b.color));
    expect(trav).toEqual(new Set([TRAVERTINE]));
    expect((TRAVERTINE >> 16) & 255).toBeGreaterThan(200);
  });

  it('A8: every element marked [documented], [scaled] or [assumed]; ≥ 10 marks inside; every height but the trusses and the storeys [assumed] or [scaled]', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(10);
    const layout = src('layout.ts');
    const yBlock = layout.slice(layout.indexOf('export const Y = {'), layout.indexOf('};', layout.indexOf('export const Y = {')));
    const lines = yBlock.split('\n').slice(1).filter((l) => /^\s+[A-Z_0-9]+:/.test(l));
    expect(lines.length).toBeGreaterThan(10);
    for (const l of lines) {
      expect(l, l).toMatch(/\[(documented|scaled|assumed)/);
      const key = l.trim().split(':')[0];
      if (/\[documented/.test(l)) expect(['TRUSS', 'CHORD', 'END_CHORD'], key).toContain(key);
    }
  });

  it('A9: the lot meets the real ground at its edges; the plaza is level; the lot\'s west edge at least 10 ft below it', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    // the plaza: one level under its travertine
    const levels = new Set<number>();
    for (let x = PLAZA[0] + 2; x < 280; x += 3) for (const z of [-30, -10, 10, 30]) if (!inR(x, z, CHANNEL)) levels.add(hm.at(x, z));
    expect([...levels]).toEqual([Y.PLAZA - 1]);
    // the west edge, along the plaza's view out (between the wings' outer faces)
    for (let z = -150; z <= 150; z += 5) expect(hm.at(TERRAIN.x1 - 1, z) * PLATE, `z ${z}`).toBeLessThanOrEqual(-10);
    expect(lotGround(TERRAIN.x1 - 1, 0)).toBeLessThanOrEqual(-10);
  });

  it('A10: the sea at true sea level about 370 ft below the plaza, its shore 2,200–2,700 ft west along the axis, with a bed under it', () => {
    const seaY = -n.anchor.lotElevationM / 0.3048;
    expect(Math.abs(seaY + 370)).toBeLessThanOrEqual(10);
    const cx = (PLAZA[0] + PLAZA[2]) / 2;
    let shore = NaN;
    for (let x = cx; x < cx + 4000; x += 10) if (sampleGrid(n.near, x, 0) < seaY - 10) { shore = x - cx; break; }
    expect(shore).toBeGreaterThanOrEqual(2200);
    expect(shore).toBeLessThanOrEqual(2700);
    // beyond it, the bed lies under the water (spec 011: the engine draws water where the ground is well below the sea)
    for (let x = cx + shore + 100; x < cx + 4000; x += 100) expect(sampleGrid(n.near, x, 0)).toBeLessThanOrEqual(seaY - 15);
    for (let x = 6000; x < 20000; x += 1000) expect(sampleGrid(n.far, x, 0)).toBeLessThanOrEqual(seaY - 15);
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

  it('A12: the sea and the chaparral; the other coastal houses\' scenery is as it was', () => {
    expect(H.scenery?.sea).toBe(true);
    expect(H.scenery?.chaparral).toBe(true);
    expect(LOVELL_BEACH.scenery).toEqual({ sea: true, desert: true });
    expect(MALAPARTE.scenery).toEqual({ sea: true, chaparral: true, city: false });
    expect(EAMES.scenery?.sea).toBe(true);
    expect(EAMES.scenery?.flatsBelow).toBe(-60);
  });

  it('A13: deterministic, inside its grid, no overlaps; every phase used; about 3½ minutes; ≤ 35,000 pieces in the building and ≤ 55,000 in all', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    const s = sequence(bricks, PHASES, H.center);
    expect(s.total).toBeGreaterThan(195);
    expect(s.total).toBeLessThan(230);
    const building = bricks.filter((b) => b.phase >= P.FOUNDATION && b.phase <= P.ROOF);
    expect(building.length).toBeLessThanOrEqual(35000);
    expect(bricks.length).toBeLessThanOrEqual(55000);
  }, 120_000);

  it('A14: tests/buildOrder.test.ts covers it; its phases are in role order', () => {
    const order = readFileSync('tests/buildOrder.test.ts', 'utf8');
    expect(order).toMatch(/import \{ SALK_INSTITUTE \} from '\.\.\/src\/houses\/salk-institute\/definition'/);
    expect(order.slice(order.indexOf('const DEFINITIONS'))).toMatch(/SALK_INSTITUTE/);
    expect(PHASES.map((p) => p.role)).toEqual(['site', 'foundation', 'floor', 'structure', 'interior', 'envelope', 'roof', 'landscape']);
  });

  it('A15: the home card is live, with the real piece count, its credits and the disclaimer (Q5); the numbers say "institute"', async () => {
    const { HOUSES } = await import('../src/houses');
    const { PAGES } = await import('../vite.config');
    const { STATS } = await import('../src/houses/stats');
    const card = HOUSES.find((h) => h.slug === 'salk-institute');
    expect(card?.status).toBe('live');
    expect(card?.pieces).toBe(STATS['salk-institute'].pieces);
    expect(card?.pieces).toBe(bricks.length);
    expect(card?.wikidata).toBe('Q128635401');
    expect(card?.affiliations).toEqual(['the Salk Institute for Biological Studies']);
    expect(card?.sources?.join(' ')).toMatch(/OpenStreetMap/);
    expect(card?.sources?.join(' ')).toMatch(/salk\.edu/);
    expect(card?.sources?.join(' ')).toMatch(/Docomomo/);
    expect(Object.keys(PAGES)).toContain('salk-institute');
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with the Salk Institute for Biological Studies.');
    expect(H.text.noun).toBe('institute');
  });
});
