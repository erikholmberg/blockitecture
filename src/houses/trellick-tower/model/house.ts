/**
 * Trellick Tower itself (spec 061): the rafts and the entrance level; the crosswalls, the floors, the service tower's shaft,
 * the haunch under the boiler house, the bridges and Block B's frame; the balcony front, the corridor front, the slit windows
 * and the boiler house's glass; the roofs. Built a storey at a time from large pieces, like the precast panels and in-situ
 * lifts of the real thing. Layout and sourcing: layout.ts.
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BALCONY_Z, BAY, BLOCK_B, BLOCK_B_LEVELS, BOILER, BRIDGE, CORRIDORS, CROSSWALLS, FINS, inRect, isCorridor, LEVELS, levelY,
  MAISONETTE, SLAB, STOREY, TOP, TOWER, TOWER_TOP, WINDOW_Z,
} from './layout';

/** bush-hammered in-situ concrete, grey-brown [documented]; pre-cast pebble-finished panels [documented]; varnished cedar
 * boarding on the balconies [documented]; white window frames and panels [scaled: photographs]; glass */
export const CONCRETE = [0x766d62, 0x6f665b];
export const PEBBLE = [0x8a8274, 0x837b6d];
export const CEDAR = [0x6b4a33, 0x74523a];
export const WHITE = 0xe9e7e0;
export const GLASS = 0xb9cdd4;
export const SLAB_C = 0x7d7569;
export const DARK = 0x2c2f31;

/** long pieces, like panels: up to 16 studs */
const PANEL = [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]];
const concrete = (x: number, y: number, z: number) => CONCRETE[Math.floor(hash2(Math.floor((x + z) / 8), Math.floor(y / STOREY)) * 2)];
const pebble = (x: number, y: number) => PEBBLE[(Math.floor(x / 6) + Math.floor(y / STOREY)) & 1];
const cedar = (x: number, y: number) => CEDAR[(Math.floor(x / 3) + Math.floor(y / STOREY)) & 1];
const lvl = (y: number) => Math.floor(y / STOREY);
const xb = (x: number) => ((x % BAY) + BAY) % BAY;
const onRing = (x: number, z: number, r: [number, number, number, number]) => inRect(x, z, r) && (x === r[0] || z === r[1] || x === r[2] - 1 || z === r[3] - 1);

/** the service tower's slit windows: narrow, in staggered columns [documented], on its south, west and north faces */
export function slit(x: number, y: number, z: number): boolean {
  if (!onRing(x, z, TOWER) || x === TOWER[2] - 1) return false;
  const l = lvl(y), upper = y - levelY(l) >= 11;
  const u = x === TOWER[0] ? z - TOWER[1] : x - TOWER[0];
  return upper && l >= 1 && l < 34 && u > 2 && u < 30 && (u + 4 * (l % 2)) % 8 === 3;
}
/** where the bridges meet the tower and the slab's end wall: a doorway a storey high at each corridor floor */
const bridgeDoor = (y: number, z: number) => isCorridor(lvl(y)) && z >= BRIDGE[1] + 1 && z < BRIDGE[3] - 1;

/** the rafts under the slab, the tower and Block B (foundation) [assumed] */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  for (const r of [SLAB, TOWER, BLOCK_B]) { b.newGroup(); b.box(r[0], r[1], r[2], r[3], -3, -1, { kind: 'plate', color: 0x7f786d }); }
}

/** the entrance level's floor (floor) */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  for (const r of [SLAB, TOWER, BLOCK_B]) { b.newGroup(); b.box(r[0], r[1], r[2], r[3], -1, 0, { kind: 'tile', color: 0xa39c90 }); }
}

/** the concrete frame (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the crosswalls at 22′-11″ [documented], from the corridor front to the balconies' edge, a doorway through each at the
  // corridor floors; the two end walls
  b.newGroup();
  for (const x of CROSSWALLS)
    b.box(x, SLAB[1], x + 1, SLAB[3], 0, TOP, {
      kind: 'brick', unit: 11, sizes: PANEL, color: concrete,
      mask: (_x, z, y) => !(isCorridor(lvl(y)) && z >= 2 && z < 7 && x !== CROSSWALLS[CROSSWALLS.length - 1]),
    });
  // the fins halving each bay on the balcony front [documented]
  for (const x of FINS) b.box(x, WINDOW_Z + 1, x + 1, SLAB[3], 0, TOP, { kind: 'brick', unit: 11, color: concrete });
  // the floors [documented: in-situ reinforced concrete]
  for (let l = 1; l < LEVELS; l++) {
    b.newGroup();
    b.box(SLAB[0], SLAB[1], SLAB[2], SLAB[3], levelY(l), levelY(l) + 1, { kind: 'plate', color: SLAB_C });
  }
  // the service tower's shaft [documented: 35 storeys], its slits left open, a doorway at each bridge
  b.newGroup();
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], 0, TOWER_TOP, {
    kind: 'brick', unit: 11, sizes: PANEL, color: concrete,
    mask: (x, z, y) => onRing(x, z, TOWER) && !slit(x, y, z) && !(x === TOWER[2] - 1 && (bridgeDoor(y, z) || (y < STOREY && z >= 2 && z < 7))),
  });
  // its landings at the corridor floors [assumed: the lifts stop at every third floor, documented]
  for (const l of CORRIDORS) b.box(TOWER[0] + 1, TOWER[1] + 1, TOWER[2] - 1, TOWER[3] - 1, levelY(l), levelY(l) + 1, { kind: 'plate', color: SLAB_C });
  // the haunch carrying the boiler house out from the tower's top, three storeys deep [scaled], and its floor
  b.newGroup();
  for (let i = 0; i < 6; i++) {
    const y = BOILER.y0 - BOILER.haunch + 11 * i, x0 = TOWER[0] - Math.round(((BOILER.x1 - BOILER.x0) * (i + 1)) / 6);
    b.box(x0, BOILER.z0, TOWER[0], BOILER.z1, y, y + 11, { kind: 'brick', unit: 11, sizes: PANEL, color: concrete });
  }
  b.box(BOILER.x0, BOILER.z0, BOILER.x1, BOILER.z1, BOILER.y0, BOILER.y0 + 1, { kind: 'plate', color: SLAB_C });
  // the bridges [documented: at every third floor]: a floor, two walls and a roof each, a small window in the south wall
  for (const l of CORRIDORS) {
    const y = levelY(l);
    b.newGroup();
    b.box(BRIDGE[0], BRIDGE[1], BRIDGE[2], BRIDGE[3], y, y + 1, { kind: 'plate', color: SLAB_C });
    for (const z of [BRIDGE[1], BRIDGE[3] - 1])
      b.box(BRIDGE[0], z, BRIDGE[2], z + 1, y + 1, y + 21, {
        kind: 'brick', unit: 10, sizes: PANEL, color: concrete, mask: (x, _z, yy) => !(z === BRIDGE[3] - 1 && yy > y + 10 && x >= -16 && x < -11),
      });
    b.box(BRIDGE[0], BRIDGE[1], BRIDGE[2], BRIDGE[3], y + 21, y + 22, { kind: 'plate', color: SLAB_C });
  }
  // Block B: its floors and end walls [documented: seven storeys; its build assumed]
  b.newGroup();
  for (let l = 1; l < BLOCK_B_LEVELS; l++) b.box(BLOCK_B[0], BLOCK_B[1], BLOCK_B[2], BLOCK_B[3], levelY(l), levelY(l) + 1, { kind: 'plate', color: SLAB_C });
  for (const z of [BLOCK_B[1], BLOCK_B[3] - 1])
    b.box(BLOCK_B[0], z, BLOCK_B[2], z + 1, 0, levelY(BLOCK_B_LEVELS), { kind: 'brick', unit: 11, sizes: PANEL, color: concrete });
}

/** the fronts (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const east = (x: number) => x > CROSSWALLS[5];
  for (let l = 0; l < LEVELS; l++) {
    const S = levelY(l), lo: [number, number] = [l === 0 ? 0 : S + 1, S + 10], hi: [number, number] = [S + 10, S + STOREY];
    const t = l % 3; // 0: a corridor floor, 1: the floor over it, 2: the floor under the next
    b.newGroup();
    // ---- the balcony front [documented: a grid of five bays; scaled: its three-storey rhythm] ----
    // floors 23–24: the maisonettes' projecting pebble-panel boxes [documented]
    if (l === MAISONETTE)
      b.box(1, WINDOW_Z + 1, CROSSWALLS[5], SLAB[3], S + 1, S + 14, { kind: 'brick', unit: 13, sizes: PANEL, color: pebble, mask: (x) => xb(x) >= 3 && xb(x) < 10 });
    // the floor under each corridor floor: a white window wall near the front, a short balcony at the middle of each bay
    const flush = (x: number) => t === 2 && l > 1 && !east(x) && (xb(x) < 6 || xb(x) >= 17);
    for (const z of [WINDOW_Z, WINDOW_Z + 1]) {
      const here = (x: number) => (z === WINDOW_Z ? !flush(x) : flush(x)) && !(east(x) && x < 127);
      b.box(1, z, SLAB[2] - 1, z + 1, lo[0], lo[1], { kind: 'brick', unit: lo[1] - lo[0], sizes: PANEL, color: l === 0 ? GLASS : WHITE, mask: here });
      b.box(1, z, SLAB[2] - 1, z + 1, hi[0], hi[1], { kind: 'brick', unit: 12, color: WHITE, mask: (x) => here(x) && x % 4 === 0 });
      b.box(1, z, SLAB[2] - 1, z + 1, hi[0], hi[1], { kind: 'glass', unit: 12, color: GLASS, mask: (x) => here(x) && x % 4 !== 0 });
    }
    // the balconies' fronts in cedar boarding [documented]: all along on the corridor floor and the one over it
    if (l > 0)
      b.box(1, BALCONY_Z, CROSSWALLS[5], BALCONY_Z + 1, lo[0], lo[1], {
        kind: 'brick', unit: 9, sizes: PANEL, color: cedar, mask: (x) => t !== 2 || l === 1 || (xb(x) >= 6 && xb(x) < 17),
      });
    // the east end bay: more solid, a column of small windows and a column of recessed balconies [scaled]
    b.box(CROSSWALLS[5] + 1, BALCONY_Z, 127, BALCONY_Z + 1, S + (l === 0 ? 0 : 1), S + STOREY, {
      kind: 'brick', unit: 7, sizes: PANEL, color: concrete, mask: (x, _z, y) => !(y - S >= 8 && y - S < 15 && x >= 119 && x < 124),
    });
    b.box(119, BALCONY_Z, 124, BALCONY_Z + 1, S + 8, S + 15, { kind: 'glass', unit: 7, color: GLASS });
    if (l > 0) b.box(127, BALCONY_Z, SLAB[2] - 1, BALCONY_Z + 1, lo[0], lo[1], { kind: 'brick', unit: 9, sizes: PANEL, color: concrete });

    // ---- the corridor front ----
    b.newGroup();
    if (isCorridor(l)) {
      // a corridor floor: a band of pebble-finished panels, a few small windows [documented]
      const w = (x: number) => !east(x) && [5, 6, 16, 17].includes(xb(x));
      b.box(1, 0, SLAB[2] - 1, 1, S + 1, S + 22, { kind: 'brick', unit: 7, sizes: PANEL, color: pebble, mask: (x, _z, y) => !(w(x) && y - S === 8) });
      b.box(1, 0, SLAB[2] - 1, 1, S + 8, S + 15, { kind: 'glass', unit: 7, color: GLASS, mask: w });
    } else {
      // the floors between: two rows of paired bedroom windows [documented], white frames
      const w = (x: number) => (east(x) ? x === 139 : [2, 3, 4, 7, 8, 9, 13, 14, 15, 18, 19, 20].includes(xb(x)));
      const y0 = l === 0 ? 0 : S + 1;
      b.box(1, 0, SLAB[2] - 1, 1, y0, S + 8, { kind: 'brick', unit: S + 8 - y0, sizes: PANEL, color: concrete });
      b.box(1, 0, SLAB[2] - 1, 1, S + 8, S + 17, { kind: 'brick', unit: 9, sizes: PANEL, color: (x, y, z) => (east(x) ? concrete(x, y, z) : WHITE), mask: (x) => !w(x) });
      b.box(1, 0, SLAB[2] - 1, 1, S + 8, S + 17, { kind: 'glass', unit: 9, color: GLASS, mask: w });
      b.box(1, 0, SLAB[2] - 1, 1, S + 17, S + 22, { kind: 'brick', unit: 5, sizes: PANEL, color: concrete });
    }
  }
  // the service tower's slits, glazed [documented]; the bridges' windows
  b.newGroup();
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], 0, TOWER_TOP, { kind: 'glass', unit: 11, color: GLASS, mask: (x, z, y) => slit(x, y, z) });
  for (const l of CORRIDORS) b.box(-16, BRIDGE[3] - 1, -11, BRIDGE[3], levelY(l) + 11, levelY(l) + 21, { kind: 'glass', unit: 10, color: GLASS });
  // the boiler house: glass all round, in dark frames [documented: "fully glazed"]
  b.newGroup();
  const ring = (x: number, z: number) => x === BOILER.x0 || z === BOILER.z0 || z === BOILER.z1 - 1;
  b.box(BOILER.x0, BOILER.z0, BOILER.x1, BOILER.z1, BOILER.y0 + 1, BOILER.y1 - 1, { kind: 'brick', unit: 7, color: DARK, mask: (x, z) => ring(x, z) && (x + z) % 4 === 0 });
  b.box(BOILER.x0, BOILER.z0, BOILER.x1, BOILER.z1, BOILER.y0 + 1, BOILER.y1 - 1, { kind: 'glass', unit: 7, color: GLASS, mask: (x, z) => ring(x, z) && (x + z) % 4 !== 0 });
  // Block B's long fronts: bands of concrete and windows, shops on Golborne Road [documented: six shops; the fronts assumed]
  for (let l = 0; l < BLOCK_B_LEVELS; l++) {
    const S = levelY(l);
    b.newGroup();
    for (const x of [BLOCK_B[0], BLOCK_B[2] - 1]) {
      const shop = l === 0 && x === BLOCK_B[0];
      b.box(x, BLOCK_B[1] + 1, x + 1, BLOCK_B[3] - 1, l === 0 ? 0 : S + 1, S + 10, { kind: 'brick', unit: l === 0 ? 10 : 9, sizes: PANEL, color: shop ? GLASS : x === BLOCK_B[0] ? concrete : cedar });
      b.box(x, BLOCK_B[1] + 1, x + 1, BLOCK_B[3] - 1, S + 10, S + STOREY, { kind: 'brick', unit: 12, color: WHITE, mask: (_x, z) => z % 4 === 0 });
      b.box(x, BLOCK_B[1] + 1, x + 1, BLOCK_B[3] - 1, S + 10, S + STOREY, { kind: 'glass', unit: 12, color: GLASS, mask: (_x, z) => z % 4 !== 0 });
    }
  }
}

/** the roofs (roof): the slab's and its parapet, the east bay's rise, the tower's top and mast, the boiler house's, Block B's */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  b.newGroup();
  b.box(SLAB[0], SLAB[1], SLAB[2], SLAB[3], TOP, TOP + 2, { kind: 'plate', color: SLAB_C });
  b.box(SLAB[0], SLAB[1], SLAB[2], SLAB[3], TOP + 2, TOP + 8, { kind: 'brick', unit: 6, sizes: PANEL, color: concrete, mask: (x, z) => onRing(x, z, SLAB) });
  // the east end bay rises a little above the roof [scaled]
  b.box(CROSSWALLS[5], SLAB[1], SLAB[2], SLAB[3], TOP + 2, TOP + 14, {
    kind: 'brick', unit: 6, sizes: PANEL, color: concrete, mask: (x, z) => onRing(x, z, [CROSSWALLS[5], SLAB[1], SLAB[2], SLAB[3]]),
  });
  b.box(CROSSWALLS[5], SLAB[1], SLAB[2], SLAB[3], TOP + 14, TOP + 15, { kind: 'plate', color: SLAB_C });
  // the boiler house's roof, the tower's top with its notched parapet [scaled], the mast [documented: 120 m with the mast]
  b.newGroup();
  b.box(BOILER.x0, BOILER.z0, BOILER.x1, BOILER.z1, BOILER.y1 - 1, BOILER.y1 + 1, { kind: 'plate', color: SLAB_C });
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], TOWER_TOP, TOWER_TOP + 2, { kind: 'plate', color: SLAB_C });
  b.box(TOWER[0], TOWER[1], TOWER[2], TOWER[3], TOWER_TOP + 2, TOWER_TOP + 24, {
    kind: 'brick', unit: 11, sizes: PANEL, color: concrete, mask: (x, z) => onRing(x, z, TOWER) && !(z === TOWER[3] - 1 && x > TOWER[0] + 10 && x < TOWER[2] - 10),
  });
  b.newGroup();
  b.box(TOWER[0] + 12, TOWER[1] + 12, TOWER[0] + 13, TOWER[1] + 13, TOWER_TOP + 2, TOWER_TOP + 62, { kind: 'bar', unit: 12, color: 0x8a8f93 });
  b.newGroup();
  b.box(BLOCK_B[0], BLOCK_B[1], BLOCK_B[2], BLOCK_B[3], levelY(BLOCK_B_LEVELS), levelY(BLOCK_B_LEVELS) + 2, { kind: 'plate', color: SLAB_C });
}
