// Spec: specs/077-taliesin-west.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { realToModelDir } from '../src/engine/scene/sun';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { TALIESIN_WEST as H } from '../src/houses/taliesin-west/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { GRID } from '../src/houses/taliesin-west/model/taliesinWest';
import {
  BEAMS_X, BREEZEWAY, CHIMNEY, COVE_DOOR, DINING, DINING_COVE, FINS_Z, FOUNDATION_TOP, GARDEN_ROOM, GR_FIREPLACE, GR_MAIN_Z, INDIAN_ROCK, inPool,
  KITCHEN, KIVA, PERGOLA, POOL, QUARTERS, Rect, ROOF_Z, roofTop, STUDIO, Y,
} from '../src/houses/taliesin-west/model/layout';
import { CANVAS, CHEQ_WHITE, CHEROKEE, CONCRETE, GOLD, isMasonry, STONES } from '../src/houses/taliesin-west/model/house';
import { LAWN, lotGround, onProwWall, onTerraceGround, onWalk, TERRAIN } from '../src/houses/taliesin-west/model/site';
import { LOT_BUILDINGS, LOT_SELF } from '../src/houses/taliesin-west/model/lotTerrain';
import { WATER_AREAS } from '../src/houses/taliesin-west/model/water';
import { WATER } from '../src/houses/taliesin-west/model/landscape';
import { P, PHASES } from '../src/houses/taliesin-west/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/taliesin-west/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/taliesin-west/model/${f}`, 'utf8');
type B = (typeof bricks)[number];
const cells = new Map<string, B>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const inR = (x: number, z: number, r: Rect) => x >= r[0] && x < r[2] && z >= r[1] && z < r[3];
const inRs = (x: number, z: number, rs: Rect[]) => rs.some((r) => inR(x, z, r));
/** the real compass bearing of a model direction */
const bearingOf = (dx: number, dz: number) => {
  let best = 0, err = Infinity;
  for (let b = 0; b < 360; b += 0.1) {
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
  for (let z = Math.floor(Math.min(...zs)) - 30; z < Math.max(...zs) + 30; z++)
    for (let x = Math.floor(Math.min(...xs)) - 30; x < Math.max(...xs) + 30; x++) {
      const a = mine(x, z), o = inPoly(x + 0.5, z + 0.5, ring);
      if (a && o) inter++;
      if (a || o) union++;
    }
  return inter / union;
}
const way = (id: number) => LOT_BUILDINGS.find((b) => b.id === id)!.ring;

describe('077: Taliesin West', () => {
  it('A1: the Drafting Studio fits OSM\'s way 1498897839 (IoU ≥ 0.7) on its 124°/304° sides; 108 × 30 ft in twelve even bays', () => {
    expect(iou((x, z) => inR(x, z, STUDIO), LOT_SELF[0])).toBeGreaterThanOrEqual(0.7);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(angleDiff(bearingOf(1, 0), 124.2)).toBeLessThanOrEqual(2);
    expect(angleDiff(bearingOf(-1, 0), 304.2)).toBeLessThanOrEqual(2);
    expect(Math.abs(STUDIO[2] - STUDIO[0] - 108)).toBeLessThanOrEqual(2);
    expect(Math.abs(STUDIO[3] - STUDIO[1] - 30)).toBeLessThanOrEqual(2);
    expect(BEAMS_X.length).toBe(13);
    expect(BEAMS_X[0]).toBe(STUDIO[0]);
    expect(BEAMS_X[12]).toBe(STUDIO[2] - 1);
    const bays = BEAMS_X.slice(1).map((x, i) => x - BEAMS_X[i]);
    expect(bays.length).toBe(12);
    expect(Math.max(...bays) - Math.min(...bays)).toBeLessThanOrEqual(1);
  });

  it('A2: the studio\'s roof falls north-east → south-west at 2 plates every 3 studs, 14 → 7 ft; 13 red beams run on over the pergola at 8.5 ft', () => {
    // the panels' tops across the studio, at a column between beams
    const x = BEAMS_X[3] + 4;
    const tops: number[] = [];
    for (let z = ROOF_Z[0]; z < ROOF_Z[1]; z++) {
      let t = 0;
      for (let y = 60; y > 0; y--) { const b = at(x, y - 1, z); if (b && b.phase === P.ROOF) { t = y; break; } }
      expect(at(x, t - 1, z)?.color, `panel at z ${z}`).toBe(CANVAS);
      tops.push(t);
    }
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeLessThanOrEqual(tops[i - 1]); // falls toward +z, the south-west
    expect(angleDiff(bearingOf(0, 1), 214.2)).toBeLessThanOrEqual(5);
    for (let i = 0; i + 3 < tops.length - 3; i += 3) expect(tops[i] - tops[i + 3]).toBe(2);
    const deg = (Math.atan((2 * PLATE) / 3) * 180) / Math.PI;
    expect(deg).toBeGreaterThanOrEqual(14);
    expect(deg).toBeLessThanOrEqual(16);
    expect(Math.abs(Math.max(...tops) * PLATE - 14)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(Math.min(...tops) * PLATE - 7)).toBeLessThanOrEqual(1);
    // 13 red beams standing proud of the panels, each running on past the north-east eave over the pergola
    const red = [];
    for (let bx = STUDIO[0]; bx < STUDIO[2]; bx++) if (at(bx, roofTop(10), 10)?.color === CHEROKEE) red.push(bx);
    expect(red).toEqual(BEAMS_X);
    for (const bx of BEAMS_X) {
      for (let z = PERGOLA[1]; z < ROOF_Z[0]; z++) expect(at(bx, Y.PERGOLA_TOP - 1, z)?.color, `beam ${bx} at z ${z}`).toBe(CHEROKEE);
      expect(at(bx, Y.PERGOLA_TOP - 1, ROOF_Z[0] - 1)?.phase).toBe(P.STRUCTURE);
    }
    // the pergola's top
    const perg = bricks.filter((b) => b.phase === P.ROOF && b.x >= PERGOLA[0] && b.x < PERGOLA[2] && b.z >= PERGOLA[1] && b.z + b.d <= ROOF_Z[0]);
    expect(perg.length).toBeGreaterThan(50);
    const top = Math.max(...perg.map((b) => b.y + b.h));
    expect(Math.abs(top * PLATE - 8.5)).toBeLessThanOrEqual(0.5);
    expect(Math.max(...bricks.filter((b) => b.z >= PERGOLA[1] && b.z + b.d <= ROOF_Z[0] - 1 && b.x >= PERGOLA[0] && b.x < PERGOLA[2]).map((b) => b.y + b.h))).toBe(top);
  });

  it('A3: desert masonry: four or more stone colours and the concrete on every wall; the base steps in; the chimney 16 ft', () => {
    const walls: [string, Rect[]][] = [
      ['studio', [STUDIO]], ['kitchen', KITCHEN], ['dining', DINING], ['cove', [DINING_COVE]], ['garden', [GARDEN_ROOM]], ['quarters', QUARTERS], ['kiva', KIVA],
      ['indian rock', [INDIAN_ROCK]],
    ];
    for (const [name, rs] of walls) {
      const cols = new Set(bricks.filter((b) => (b.phase === P.STRUCTURE || b.phase === P.FOUNDATION) && inRs(b.x, b.z, rs) && isMasonry(b.color)).map((b) => b.color));
      expect(cols.has(CONCRETE), name).toBe(true);
      expect(STONES.filter((c) => cols.has(c)).length, name).toBeGreaterThanOrEqual(4);
    }
    // the prow's walls too
    const prow = new Set(bricks.filter((b) => b.phase === P.FOUNDATION && onProwWall(b.x, b.z)).map((b) => b.color));
    expect(STONES.filter((c) => prow.has(c)).length).toBeGreaterThanOrEqual(4);
    // the studio's south-west base: the lower course's face at z 30, the upper's a stud in, at 29
    let checked = 0;
    for (let x = 0; x < 90; x += 3) {
      const lowFace = Math.max(...[28, 29, 30, 31].filter((z) => isMasonry(at(x, 1, z)?.color ?? -1)));
      const upFace = Math.max(...[28, 29, 30, 31].filter((z) => isMasonry(at(x, Y.BASE_1 + 1, z)?.color ?? -1)));
      expect(lowFace - upFace, `x ${x}`).toBeGreaterThanOrEqual(1);
      checked++;
    }
    expect(checked).toBeGreaterThan(20);
    const chim = bricks.filter((b) => b.phase === P.STRUCTURE && inR(b.x, b.z, CHIMNEY));
    const top = Math.max(...chim.map((b) => b.y + b.h));
    expect(Math.abs((top - FOUNDATION_TOP) * PLATE - 16)).toBeLessThanOrEqual(0.5);
    expect(top).toBeGreaterThan(roofTop(CHIMNEY[1])); // it stands above the roof
  });

  it('A4: the Garden Room 53.4 × 29.5 ft and the Dining Cove 23.3 × 15.2 ft, joined by a door; 8 → 11 ft roof between seven fins; the fireplace at the south end', () => {
    const [gx0, gz0, gx1, gz1] = GARDEN_ROOM, [dx0, dz0, dx1, dz1] = DINING_COVE;
    expect(Math.abs(gz1 - gz0 - 53.4)).toBeLessThanOrEqual(1);
    expect(Math.abs(gx1 - gx0 - 29.5)).toBeLessThanOrEqual(1);
    expect(Math.abs(dx1 - dx0 - 23.3)).toBeLessThanOrEqual(1);
    expect(Math.abs(dz1 - dz0 - 15.2)).toBeLessThanOrEqual(1);
    // the door: in the Dining Cove's wall, red, the Garden Room's wall open behind it, both rooms clear either side
    const dx = COVE_DOOR[0] + 1;
    expect(dz1).toBe(gz0);
    expect(at(dx, 5, dz1 - 1)?.color).toBe(CHEROKEE);
    expect(at(dx, 5, gz0)).toBeUndefined();
    expect(at(dx, 5, gz0 + 1)).toBeUndefined();
    expect(at(dx, 5, dz1 - 2)).toBeUndefined();
    // the roof: one way, from 8 to 11 ft, between seven red fins
    const z = gz0 + 3;
    const topAt = (x: number) => { for (let y = 60; y > 0; y--) { const b = at(x, y - 1, z); if (b && b.phase === P.ROOF) return y; } return 0; };
    const tops = Array.from({ length: gx1 - gx0 }, (_, i) => topAt(gx0 + i));
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThanOrEqual(tops[i - 1]);
    expect(Math.abs(tops[0] * PLATE - 8)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(tops[tops.length - 1] * PLATE - 11)).toBeLessThanOrEqual(0.5);
    expect(at(gx0 + 5, tops[5] - 1, z)?.color).toBe(CANVAS);
    const fins = new Set<number>();
    for (let fz = gz0; fz < GR_MAIN_Z[1]; fz++) if (at(gx0 + 10, tops[10] + 1, fz)?.color === CHEROKEE) fins.add(fz);
    expect([...fins]).toEqual(FINS_Z);
    expect(fins.size).toBe(7);
    // the fireplace: masonry at the south end
    expect(GR_FIREPLACE[3]).toBeGreaterThan(gz1 - 8);
    expect(isMasonry(at(GR_FIREPLACE[0] + 2, 6, GR_FIREPLACE[1] + 1)?.color ?? -1)).toBe(true);
    // ≥ 85% of the two rooms inside OSM's Garden Room and Dining Cove ways
    const a = way(1498897834), b = way(1498902781);
    let inside = 0, total = 0;
    for (const r of [GARDEN_ROOM, DINING_COVE])
      for (let zz = r[1]; zz < r[3]; zz++) for (let xx = r[0]; xx < r[2]; xx++) {
        total++;
        if (inPoly(xx + 0.5, zz + 0.5, a) || inPoly(xx + 0.5, zz + 0.5, b)) inside++;
      }
    expect(inside / total).toBeGreaterThanOrEqual(0.85);
  });

  it('A5: the pool: a right isosceles triangle, 42-ft legs on the grid, fitting OSM\'s way 1498886748; level water; the lawn level, ending in a point toward the south-west', () => {
    const osm = WATER_AREAS.find((w) => w.name === 'Prow Pool')!;
    expect(osm).toBeDefined();
    expect(iou(inPool, osm.rings[0])).toBeGreaterThanOrEqual(0.7);
    expect(Math.abs(POOL.leg - 42.5)).toBeLessThanOrEqual(2);
    // the legs: along the grid; the hypotenuse: one stud in for each stud along (45°)
    let legX = 0, legZ = 0;
    for (let x = POOL.x1 - 60; x < POOL.x1 + 5; x++) if (inPool(x, POOL.z0)) legX++;
    for (let z = POOL.z0 - 5; z < POOL.z0 + 60; z++) if (inPool(POOL.x1 - 1, z)) legZ++;
    expect(legX).toBe(POOL.leg);
    expect(legZ).toBe(POOL.leg);
    for (let z = POOL.z0; z < POOL.z0 + POOL.leg; z++) {
      let xmin = Infinity;
      for (let x = POOL.x1 - 60; x < POOL.x1; x++) if (inPool(x, z)) { xmin = x; break; }
      expect(xmin).toBe(POOL.x1 - POOL.leg + (z - POOL.z0));
    }
    // the water: every cell of the pool, at one level
    const water = bricks.filter((b) => b.kind === 'water' && inPool(b.x, b.z));
    expect(new Set(water.map((b) => b.y + b.h)).size).toBe(1);
    expect(water[0].color).toBe(WATER);
    for (let z = POOL.z0; z < POOL.z0 + POOL.leg; z += 3) for (let x = POOL.x1 - POOL.leg; x < POOL.x1; x += 3) if (inPool(x, z)) expect(at(x, Y.POOL_WATER - 1, z)?.kind, `${x},${z}`).toBe('water');
    // Sunset Terrace: level lawn, its farthest point toward the south-west
    const lawn: [number, number][] = [];
    for (let z = 30; z < 200; z++) for (let x = -20; x < 220; x++) if (onTerraceGround(x, z) && !onWalk(x, z)) lawn.push([x, z]);
    expect(lawn.length).toBeGreaterThan(5000);
    const turf = lawn.map(([x, z]) => at(x, Y.TERRACE, z));
    for (const t of turf) {
      expect(t?.phase).toBe(P.LANDSCAPE);
      expect(LAWN).toContain(t?.color);
      expect(t!.y + t!.h).toBe(Y.TERRACE + 1);
    }
    expect(new Set(lawn.map(([x, z]) => hm.at(x, z))).size).toBe(1);
    const cx = lawn.reduce((s, p) => s + p[0], 0) / lawn.length, cz = lawn.reduce((s, p) => s + p[1], 0) / lawn.length;
    const tip = lawn.reduce((a, p) => (p[1] > a[1] ? p : a));
    expect(angleDiff(bearingOf(tip[0] - cx, tip[1] - cz), 214)).toBeLessThanOrEqual(45);
    // and it narrows to that point: a few studs wide one stud short of it
    expect(lawn.filter((p) => p[1] === tip[1] - 2).length).toBeLessThanOrEqual(6);
  });

  it('A6: the Kiva fits its OSM way, sunk below the ground outside, under a flat concrete roof; the other core buildings fit theirs', () => {
    expect(iou((x, z) => inRs(x, z, KIVA), way(1498906505))).toBeGreaterThanOrEqual(0.6);
    const floor = bricks.filter((b) => b.phase === P.FLOOR && b.kind === 'plate' && inRs(b.x, b.z, KIVA));
    expect(floor.length).toBeGreaterThan(10);
    const floorTop = Math.max(...floor.map((b) => b.y + b.h));
    expect(floorTop).toBe(Y.KIVA_FLOOR);
    for (const [x, z] of [[KIVA[0][0] - 2, -30], [KIVA[0][2] + 10, -20], [215, KIVA[0][3] + 1], [205, KIVA[0][1] - 2]]) expect(hm.at(x, z), `${x},${z}`).toBeGreaterThan(floorTop);
    const roof = bricks.filter((b) => b.phase === P.ROOF && b.kind === 'brick' && inRs(b.x, b.z, KIVA));
    expect(new Set(roof.map((b) => b.y)).size).toBe(1);
    expect(new Set(roof.map((b) => b.color)).size).toBe(1);
    for (const [id, rs] of [[1498902780, KITCHEN], [1498910891, DINING], [1498902779, BREEZEWAY], [1498902778, QUARTERS]] as const)
      expect(iou((x, z) => inRs(x, z, rs as Rect[]), way(id)), `way ${id}`).toBeGreaterThanOrEqual(0.6);
    // one grid: every outline is whole studs on the model's axes
    for (const r of [STUDIO, GARDEN_ROOM, DINING_COVE, PERGOLA, ...KITCHEN, ...DINING, ...BREEZEWAY, ...QUARTERS, ...KIVA]) for (const v of r) expect(Number.isInteger(v)).toBe(true);
  });

  it('A7: one Cherokee red for the beams, fins, doors and the studio\'s floor; warm-white panels; the gold-and-white chequer', () => {
    const beams = bricks.filter((b) => b.phase === P.STRUCTURE && b.w === 1 && BEAMS_X.includes(b.x) && b.z >= ROOF_Z[0] && b.z < ROOF_Z[1] && b.y >= roofTop(b.z) - 3);
    expect(beams.length).toBeGreaterThan(100);
    for (const b of beams) expect(b.color).toBe(CHEROKEE);
    const fins = bricks.filter((b) => b.phase === P.STRUCTURE && FINS_Z.includes(b.z) && b.d === 1 && b.y >= 17 && b.x >= GARDEN_ROOM[0] - 1 && b.x <= GARDEN_ROOM[2]);
    expect(fins.length).toBeGreaterThan(50);
    for (const b of fins) expect(b.color).toBe(CHEROKEE);
    const doors = bricks.filter((b) => b.phase === P.ENVELOPE && b.kind === 'tile' && b.y < 20 && b.z !== -1);
    expect(doors.length).toBeGreaterThan(10);
    for (const b of doors) expect(b.color).toBe(CHEROKEE);
    const floor = bricks.filter((b) => b.phase === P.FLOOR && b.kind === 'plate' && inR(b.x, b.z, STUDIO) && b.x + b.w <= 79);
    expect(floor.length).toBeGreaterThan(20);
    for (const b of floor) expect(b.color).toBe(CHEROKEE);
    const panels = bricks.filter((b) => b.phase === P.ROOF && b.kind === 'brick' && inR(b.x, b.z, STUDIO) && !BEAMS_X.includes(b.x));
    expect(panels.length).toBeGreaterThan(100);
    for (const b of panels) expect(b.color).toBe(CANVAS);
    const [r, g, bl] = [(CANVAS >> 16) & 255, (CANVAS >> 8) & 255, CANVAS & 255];
    expect(r).toBeGreaterThan(bl); // warm
    expect(Math.min(r, g, bl)).toBeGreaterThan(200); // white
    // the chequer on the north-east front: gold and white squares alternating along it
    const cheq = bricks.filter((b) => b.phase === P.ENVELOPE && b.z === -1 && (b.color === GOLD || b.color === CHEQ_WHITE));
    expect(cheq.filter((b) => b.color === GOLD).length).toBeGreaterThan(20);
    expect(cheq.filter((b) => b.color === CHEQ_WHITE).length).toBeGreaterThan(20);
    const row = Y.FLAT_ROOF + 1;
    expect(at(1, row, -1)?.color).not.toBe(at(3, row, -1)?.color);
    expect(at(1, row, -1)?.color).not.toBe(at(1, row + 2, -1)?.color);
  });

  it('A8: every element marked [documented], [scaled] or [assumed]; ≥ 12 marks inside; the buildings outside HABS -D and -G [assumed]', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect(src('layout.ts')).toMatch(/\[scaled/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(12);
    const layout = src('layout.ts');
    for (const name of ['KITCHEN', 'DINING', 'QUARTERS', 'PASSAGE']) {
      const line = layout.split('\n').findIndex((l) => l.startsWith(`export const ${name}:`));
      expect(line, name).toBeGreaterThan(0);
      expect(layout.split('\n')[line - 1], name).toMatch(/\[assumed/);
    }
  });

  it('A9: the lot meets the real ground at its edges, rising toward the mountains', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    // the north-east edge (−z, toward the mountains) at least 5 ft above the studio's floor; the south-west at least 5 ft below
    expect(angleDiff(bearingOf(0, -1), 34)).toBeLessThanOrEqual(5);
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 5) {
      expect(lotGround(x, TERRAIN.z0), `NE ${x}`).toBeGreaterThanOrEqual(5);
      expect(lotGround(x, TERRAIN.z1 - 1), `SW ${x}`).toBeLessThanOrEqual(-5);
    }
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

  it('A11: the desert scenery; the Kaufmann Desert House\'s is as it was', () => {
    expect(H.scenery?.desert).toBe(true);
    expect(H.scenery?.city).toBe(false);
    expect(H.scenery?.waterAreas).toBeUndefined();
    expect(KAUFMANN.scenery).toEqual({ city: false, desert: true });
  });

  it('A12: deterministic, inside its grid, no overlaps; every phase used; about 3 minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(160);
    expect(s.total).toBeLessThan(200);
  }, 120_000);

  it('A14: the home card is live, with the real piece count, its credits and the disclaimer (Q4)', async () => {
    const { HOUSES } = await import('../src/houses');
    const { PAGES } = await import('../vite.config');
    const { STATS } = await import('../src/houses/stats');
    const card = HOUSES.find((h) => h.slug === 'taliesin-west');
    expect(card?.status).toBe('live');
    expect(card?.pieces).toBe(STATS['taliesin-west'].pieces);
    expect(card?.pieces).toBe(bricks.length);
    expect(card?.wikidata).toBe('Q1208310');
    expect(card?.affiliations).toEqual(['the Frank Lloyd Wright Foundation']);
    expect(card?.sources?.join(' ')).toMatch(/HABS AZ-218-D/);
    expect(card?.sources?.join(' ')).toMatch(/OpenStreetMap/);
    expect(Object.keys(PAGES)).toContain('taliesin-west');
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with the Frank Lloyd Wright Foundation.');
    expect(bricks.length).toBeGreaterThan(10000);
  });
});
