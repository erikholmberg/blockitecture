/**
 * The Ennis House itself (spec 025): the podium's retaining walls of textile blocks, the floors, the walls of each mass
 * rising course by course in plain and patterned bands, the art-glass windows, the wrought-iron gates, and the roofs with
 * their teak ceilings. Layout and sourcing: layout.ts.
 */
import { C } from '@/engine/catalog';
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { COURT, GATES, inRect, MASSES, MODULE, MODULE_H, Rect, Y } from './layout';
import { groundPlates, inHouse, inPodium } from './site';

/**
 * The textile blocks [documented: 16-in blocks of concrete made with the site's decomposed granite, many patterned]:
 * on the 4-ft, three-block repeat, bands of patterned blocks (a darker inset tone) alternate with plain ones (Q3).
 */
const PLAIN = [0xb9a582, 0xb3a07e, 0xbeaa88];
const PATTERNED = [0x947c58];
export function textile(x: number, y: number, z: number): number {
  const u = x + z;
  const bu = Math.floor((u * 3) / MODULE), bv = Math.floor((y * 3) / MODULE_H);
  const band = Math.floor(y / MODULE_H) % 2 === 1;
  if (band && (bu + bv) % 2 === 0) return PATTERNED[0];
  // plain blocks vary a little from one 4-ft module to the next, not block to block, so walls pack into long pieces
  return PLAIN[Math.floor(hash2(Math.floor(u / (MODULE * 3)), Math.floor(y / (MODULE_H * 2))) * PLAIN.length)];
}
const MARBLE = [0xe8e4dc, 0xe1ddd3];
const TEAK = 0x8a5a33;
const GLASS = 0xdff1f5;
const LEADING = 0x3b3a34;

/** the window openings: tall art-glass windows along the south and north walls [assumed: the HABS elevation shows their rhythm] */
export const WINDOWS: { r: Rect; y0: number; y1: number }[] = [];
for (let x = 42; x < 116; x += 6) WINDOWS.push({ r: [x, 67, x + 2, 68], y0: Y.SILL, y1: Y.HEAD }); // the living room tier, south
for (let x = 44; x < 116; x += 6) WINDOWS.push({ r: [x, 8, x + 2, 9], y0: 6, y1: Y.HEAD }); // its north side, onto the loggia
for (let x = 6; x < 38; x += 8) WINDOWS.push({ r: [x, 71, x + 2, 72], y0: Y.SILL, y1: 18 }); // the west wing, south
for (let x = 152; x < 176; x += 6) WINDOWS.push({ r: [x, 63, x + 2, 64], y0: Y.SILL, y1: 18 }); // the east mass, south
for (let x = 182; x < 204; x += 8) WINDOWS.push({ r: [x, 4, x + 2, 5], y0: 6, y1: 18 }); // the east wing, north
const inWindow = (x: number, y: number, z: number) => WINDOWS.some((w) => inRect(x, z, w.r) && y >= w.y0 && y < w.y1);

/** the podium: the retaining wall along the house's outline, from the ridge up to the floor (foundation) */
export function buildPodium(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const edge = (x: number, z: number) => inHouse(x, z) && !inPodium(x, z);
  let lo = 0;
  for (let z = -40; z < 90; z++) for (let x = -5; x < 245; x++) if (edge(x, z)) lo = Math.min(lo, groundPlates(x, z));
  b.box(-5, -40, 245, 90, lo, Y.FLOOR, { kind: 'brick', mask: (x, z) => edge(x, z), color: textile });
}

/** the floors: marble inside the masses, block-paved terraces and courts outside them (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  const inside = (x: number, z: number) => MASSES.some((m) => inRect(x, z, m.rect));
  b.box(-5, -40, 245, 90, Y.FLOOR - 3, Y.FLOOR - 1, { kind: 'plate', mask: (x, z) => inPodium(x, z), color: 0xb9b4a8 });
  b.box(-5, -40, 245, 90, Y.FLOOR - 1, Y.FLOOR, {
    kind: 'tile', mask: (x, z) => inPodium(x, z),
    color: (x, _y, z) => (inside(x, z) ? MARBLE[Math.floor(hash2(x >> 1, z >> 1) * 2)] : textile(x, 0, z)),
  });
}

/** the walls of each mass, course by course, with the window openings left (structure) */
export function buildWalls(b: Builder) {
  b.setPhase(P.STRUCTURE);
  for (const m of MASSES) {
    b.newGroup();
    const [x0, z0, x1, z1] = m.rect;
    const perim = (x: number, z: number) => (x === x0 || x === x1 - 1 || z === z0 || z === z1 - 1) && inHouse(x, z);
    b.box(x0, z0, x1, z1, Y.FLOOR, m.top, {
      kind: 'brick', mask: (x, z, y) => perim(x, z) && !inWindow(x, y, z) && !inWindow(x, y + 1, z) && !inWindow(x, y + 2, z), color: textile,
    });
  }
  // the motor court's walls, the gate opening left [documented: the wrought-iron gates]
  b.newGroup();
  const [cx0, cz0, cx1, cz1] = COURT;
  const courtWall = (x: number, z: number) => (x === cx1 - 1 || z === cz1 - 1) && !inRect(x, z, GATES);
  b.box(cx0, cz0, cx1, cz1, Y.FLOOR, Y.COURT_WALL, { kind: 'brick', mask: (x, z) => courtWall(x, z) && inHouse(x, z), color: textile });
}

/** the art-glass windows and the gates (envelope) */
export function buildGlass(b: Builder) {
  b.setPhase(P.ENVELOPE);
  for (const w of WINDOWS) {
    b.newGroup();
    // art glass: clear panes in a dark leaded grid [documented: art glass; its pattern assumed]
    b.box(w.r[0], w.r[1], w.r[2], w.r[3], w.y0, w.y1, {
      kind: 'brick', mask: (x, z, y) => inHouse(x, z) && (y - w.y0) % 6 === 0, color: LEADING,
    });
    b.box(w.r[0], w.r[1], w.r[2], w.r[3], w.y0, w.y1, { kind: 'glass', mask: (x, z) => inHouse(x, z), color: GLASS });
  }
  // the wrought-iron gates: black bars with gilded ornament [documented: HABS gates detail]
  b.newGroup();
  b.box(GATES[0], GATES[1], GATES[2], GATES[3], Y.FLOOR, Y.COURT_WALL - 2, {
    kind: 'brick', mask: (x) => (x - GATES[0]) % 2 === 0 || x === GATES[2] - 1, color: (x, y) => ((x * 7 + y) % 23 === 0 ? 0xb8962e : C.black),
  });
  b.box(GATES[0], GATES[1], GATES[2], GATES[3], Y.COURT_WALL - 2, Y.COURT_WALL, { kind: 'brick', color: textile });
}

/** the roofs: each mass's roof just under its parapet, its ceiling teak; higher masses rise through lower roofs (roof) */
export function buildRoofs(b: Builder) {
  b.setPhase(P.ROOF);
  for (const m of MASSES) {
    b.newGroup();
    const [x0, z0, x1, z1] = m.rect;
    const higher = MASSES.filter((o) => o.top > m.top);
    const under = (x: number, z: number) => inHouse(x, z) && !higher.some((o) => inRect(x, z, o.rect));
    b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, m.top - 4, m.top - 3, { kind: 'plate', mask: under, color: TEAK }); // [documented] teak ceilings
    b.box(x0 + 1, z0 + 1, x1 - 1, z1 - 1, m.top - 3, m.top - 1, { kind: 'plate', mask: under, color: 0xb7a98d });
  }
}
