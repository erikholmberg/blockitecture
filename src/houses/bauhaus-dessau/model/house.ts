/**
 * The Bauhaus Dessau itself (spec 076): the dark plinth over the half-sunk basements; the ground floors; the workshop wing's
 * concrete frame with its flared columns, the rendered walls of the other wings, the bridge on its four piers and the stage;
 * the curtain wall, the windows, the balconies, the red door and the lettering; the flat roofs and the roof terrace. Built from
 * large pieces, a storey band at a time, as Trellick was (spec 061; spec 076 Q2). Plan and sourcing: layout.ts, shell.ts.
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  BRIDGE, BRIDGE_UNDER, CANOPY, CEIL, CANOPY_Y, COLUMNS, DOOR, ENT_A, ENT_B, FL, FONT, GLASS_Y0, GLASS_Y1, GROUND_FLOOR, GROUND_RECTS,
  inRect, LETTER_ROW, LETTER_Z, letterTop, letterX, LINK, LINK_BARS, LINK_ROOF, LINK_TOP, LINK_WIN, MULLION, NORTH, onGround, P_BAYS,
  P_PARAPET, P_RAIL, P_ROOF, P_STAIR_TOP, PARAPET, pBalcony, PFL, PIERS, PLINTH_TOP, PRELLER, PRELLER_STAIR, Rect, ROOF,
  ROUND_BAND, ROUND_WINDOWS, SOUTH_BALCONY, STAGE, STAGE_FLOOR, STAGE_TOP, STUB, TOWER, TRANSOM, WORD, WORKSHOP,
} from './layout';
import { basementWindow, exterior, face, inRound, opening, partAt, RIBBON, solid } from './shell';

/** white render in mineral paint [documented: Keim]: one white */
export const WHITE = 0xf0eee8;
/** the dark grey recessed plinth [documented: photographs; its grey scaled] */
export const PLINTH = 0x4f5254;
/** the stair tower's grey render [documented: photographs] */
export const GREY = 0x8e9192;
/** near-black steel window frames and the curtain wall's grid [documented: black steel windows; the aluminium grid dark] */
export const FRAME = 0x26292b;
/** the red entrance doors [documented: ArchEyes] */
export const RED = 0xb3342a;
/** glass [documented: single panes of mirror glass]; the basement's darker */
export const GLASS = 0xa9c3c9;
export const BASEMENT_GLASS = 0x5d6c70;
/** the concrete frame and slabs [assumed: grey] */
export const CONCRETE = 0xbcb8ae;
export const SLAB = 0xb5b1a7;
/** the east balconies' dark solid fronts and the tube rails [documented: photographs] */
export const BALCONY_FRONT = 0x3c3f42;
export const STEEL = 0x9ea4a8;

/** long pieces, like panels: up to 16 studs */
const PANEL = [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]];
const BIG_PLATE = [[16, 16], [16, 8], [12, 8], [8, 8], [8, 4], [4, 4], [8, 2], [4, 2], [2, 2], [8, 1], [4, 1], [2, 1], [1, 1]];
const GLASS_SIZES = [[3, 1], [2, 1], [1, 1]];

/** the whole building's bounding box (studs) */
const BX0 = 0, BZ0 = -4, BX1 = 347, BZ1 = 243;

/** the tall wings' band breaks: every storey's slab, sill and head, and where neighbouring parts start or stop */
const TALL = [GROUND_FLOOR, GLASS_Y0, ...[0, 1, 2].flatMap((l) => [FL(l) + RIBBON.sill, FL(l) + RIBBON.head]), BRIDGE_UNDER, FL(1), LINK_TOP, FL(2) - 1, FL(2), ROOF]
  .filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
/** the Prellerhaus's: each storey's slab, sill and head, and the link's roof */
const PREL = [...[0, 1, 2, 3, 4].flatMap((l) => [PFL(l), PFL(l) + 7, PFL(l) + 21, PFL(l + 1) - 1]), LINK_TOP, P_ROOF]
  .filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
const LINKB = [GROUND_FLOOR, LINK_WIN.y0, LINK_WIN.y1, LINK_ROOF];

const bands = (ys: number[]) => ys.slice(0, -1).map((y, i) => [y, ys[i + 1]] as const);
const tallPart = (x: number, z: number, y: number) => { const p = partAt(x, z, y); return p === 'north' || p === 'bridge' || p === 'workshop'; };

/** the plinth: the ground plan's outer ring, set one stud in [documented: recessed] */
const inGround0 = (x: number, z: number) => onGround(x, z);
const groundBorder = (x: number, z: number) => inGround0(x, z) && (!inGround0(x + 1, z) || !inGround0(x - 1, z) || !inGround0(x, z + 1) || !inGround0(x, z - 1));
export const onPlinth = (x: number, z: number) => {
  if (!inGround0(x, z) || groundBorder(x, z)) return false;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (groundBorder(x + dx, z + dz)) return true;
  return false;
};
const plinthAlong = (x: number, z: number) => (groundBorder(x, z - 2) || groundBorder(x, z + 2) ? x : z);

/** the plinth's walls, its basement windows left open (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  for (const [y0, y1] of [[0, 3], [3, 8], [8, PLINTH_TOP]] as const) {
    b.newGroup();
    b.box(BX0, BZ0, BX1, BZ1, y0, y1, {
      kind: 'brick', unit: y1 - y0, sizes: PANEL, color: PLINTH,
      mask: (x, z, y) => onPlinth(x, z) && !basementWindow(plinthAlong(x, z), y),
    });
  }
}

/** the ground floors' slabs over the basements, their edge the white band [documented], and the entrance steps (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  for (const r of GROUND_RECTS) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], PLINTH_TOP, GROUND_FLOOR, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: (x, _y, z) => (exterior(x, z, PLINTH_TOP) ? WHITE : SLAB) });
  }
  // the steps up to the red door [assumed: four steps of 3 plates]
  b.newGroup();
  for (let i = 0; i < 4; i++) b.box(DOOR.x0 - 1, DOOR.z - 4 + i, DOOR.x1 + 1, DOOR.z, i * 3, i * 3 + 3, { kind: 'brick', unit: 3, sizes: PANEL, color: 0xa9a7a1 });
}

/** the walls of one group of parts over its bands; `what` picks which outside cells (and their colour) */
function shellBox(b: Builder, ys: number[], inPart: (x: number, z: number, y: number) => boolean, what: (x: number, y: number, z: number) => number | null, kind: 'brick' | 'glass' = 'brick', sizes = PANEL) {
  for (const [y0, y1] of bands(ys)) {
    b.newGroup();
    b.box(BX0, BZ0, BX1, BZ1, y0, y1, {
      kind, unit: y1 - y0, sizes,
      mask: (x, z, y) => inPart(x, z, y) && exterior(x, z, y) && what(x, y, z) !== null,
      color: (x, y, z) => what(x, y, z)!,
    });
  }
}

/** a wall cell's render: grey on the stair tower, white elsewhere [documented] */
const render = (x: number, z: number) => (inRect(x, z, TOWER) ? GREY : WHITE);

/** the concrete frame, the walls, the slabs, the bridge and the stage (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  // the workshop wing's columns, set back from the glass, their heads flared under each slab [documented]
  for (let l = 0; l < 3; l++) {
    b.newGroup();
    for (const [x, z] of COLUMNS) {
      b.box(x, z, x + 2, z + 2, FL(l), CEIL(l) - 2, { kind: 'brick', unit: CEIL(l) - 2 - FL(l), sizes: [[2, 2]], color: CONCRETE });
      b.box(x - 1, z - 1, x + 3, z + 3, CEIL(l) - 2, CEIL(l), { kind: 'plate', unit: 2, sizes: [[4, 4]], color: CONCRETE });
    }
  }
  // the bridge's four piers [documented: OSM] up to its underside
  b.newGroup();
  for (const r of PIERS) b.box(r[0], r[1], r[2], r[3], 0, BRIDGE_UNDER, { kind: 'brick', unit: BRIDGE_UNDER, sizes: [[6, 6], [6, 1], [1, 1]], color: WHITE });
  // the upper slabs of the tall wings: inside the walls, behind the curtain wall [documented: the glass hangs in front]
  for (const l of [1, 2]) {
    b.newGroup();
    b.box(BX0, BZ0, BX1, BZ1, FL(l) - 1, FL(l), {
      kind: 'plate', unit: 1, sizes: BIG_PLATE, color: SLAB, mask: (x, z, y) => tallPart(x, z, y) && !exterior(x, z, y),
    });
  }
  // the rendered walls of the tall wings and the entrance block, their windows left open; the white band over the plinth
  shellBox(b, TALL, tallPart, (x, y, z) => {
    const o = opening(x, y, z);
    return o === 'wall' || o === 'band' ? render(x, z) : null;
  });
  // the link's walls, its tall windows left open; the stage's platform and its walls rising over the link [documented]
  shellBox(b, LINKB, (x, z, y) => partAt(x, z, y) === 'link', (x, y, z) => (opening(x, y, z) === 'wall' ? WHITE : null));
  b.newGroup();
  b.box(STAGE[0], STAGE[1], STAGE[2], STAGE[3], GROUND_FLOOR, STAGE_FLOOR, { kind: 'brick', unit: STAGE_FLOOR - GROUND_FLOOR, sizes: PANEL, color: 0x6b5a4a });
  const stageRing = (x: number, z: number) => x === STAGE[0] || x === STAGE[2] - 1 || z === STAGE[1] || z === STAGE[3] - 1;
  b.box(STAGE[0], STAGE[1], STAGE[2], STAGE[3], STAGE_FLOOR, LINK_ROOF, { kind: 'brick', unit: LINK_ROOF - STAGE_FLOOR, sizes: PANEL, color: WHITE, mask: (x) => x === STAGE[0] || x === STAGE[2] - 1 });
  b.box(STAGE[0], STAGE[1], STAGE[2], STAGE[3], LINK_ROOF, STAGE_TOP - 2, { kind: 'brick', unit: STAGE_TOP - 2 - LINK_ROOF, sizes: PANEL, color: WHITE, mask: stageRing });
  // the Prellerhaus: its floors and its walls [documented: five storeys], the round windows' courses laid finely
  for (let l = 1; l <= 4; l++) {
    b.newGroup();
    b.box(PRELLER[0], PRELLER[1], PRELLER[2], PRELLER[3], PFL(l) - 1, PFL(l), { kind: 'plate', unit: 1, sizes: BIG_PLATE, color: SLAB, mask: (x, z, y) => !exterior(x, z, y) });
  }
  const nearRound = (x: number, z: number, y: number) => ROUND_WINDOWS.some(([cx, cz]) => z === cz && Math.abs(x + 0.5 - cx) < 3) && y >= ROUND_BAND[0] && y < ROUND_BAND[1];
  b.newGroup();
  for (const [cx] of ROUND_WINDOWS)
    b.box(cx - 3, PRELLER[1], cx + 3, PRELLER[1] + 1, ROUND_BAND[0], ROUND_BAND[1], { kind: 'brick', unit: 1, sizes: PANEL, color: WHITE, mask: (x, z, y) => !inRound(x, y, z) && exterior(x, z, y) });
  shellBox(b, PREL, (x, z, y) => partAt(x, z, y) === 'preller', (x, y, z) => (opening(x, y, z) === 'wall' && !nearRound(x, z, y) ? WHITE : null));
}

/** the curtain wall, the windows, the balconies, the red door, the canopy and the lettering (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const first = b.bricks.length;
  const isCurtain = (x: number, z: number, y: number) => opening(x, y, z) === 'curtain';
  const along = (x: number, z: number, y: number) => face(x, z, y)?.along ?? -1;
  // the curtain wall [documented]: its mullions the full height, then the transoms, then the panes between them
  b.newGroup();
  b.box(WORKSHOP[0], WORKSHOP[1], WORKSHOP[2], WORKSHOP[3], GLASS_Y0, GLASS_Y1, {
    kind: 'brick', unit: GLASS_Y1 - GLASS_Y0, sizes: [[1, 1]], color: FRAME,
    mask: (x, z, y) => isCurtain(x, z, y) && (along(x, z, y) < 0 || along(x, z, y) % MULLION === 0),
  });
  for (let y = GLASS_Y0; y < GLASS_Y1; y += TRANSOM) {
    b.newGroup();
    b.box(WORKSHOP[0], WORKSHOP[1], WORKSHOP[2], WORKSHOP[3], y, y + 1, { kind: 'plate', unit: 1, sizes: PANEL, color: FRAME, mask: (x, z, yy) => isCurtain(x, z, yy) });
    const top = Math.min(y + TRANSOM, GLASS_Y1);
    b.box(WORKSHOP[0], WORKSHOP[1], WORKSHOP[2], WORKSHOP[3], y + 1, top, { kind: 'glass', unit: top - y - 1, sizes: GLASS_SIZES, color: GLASS, mask: (x, z, yy) => isCurtain(x, z, yy) });
  }
  // the windows of the other wings: steel frames [documented], a bar every 6 studs (4 on the Prellerhaus), the glass between
  const win = (x: number, y: number, z: number) => opening(x, y, z) === 'window';
  const bar = (x: number, y: number, z: number) => {
    const a = along(x, z, y), p = partAt(x, z, y);
    if (p === 'link') return LINK_BARS.includes(y);
    return a < 0 || a % (p === 'preller' ? 4 : 6) === 0;
  };
  const linkYs = [LINK_WIN.y0, ...LINK_BARS.flatMap((y) => [y, y + 1]), LINK_WIN.y1];
  for (const [ys, inPart] of [
    [TALL, (x: number, z: number, y: number) => tallPart(x, z, y)],
    [linkYs, (x: number, z: number, y: number) => partAt(x, z, y) === 'link'],
    [PREL, (x: number, z: number, y: number) => partAt(x, z, y) === 'preller'],
  ] as const) {
    shellBox(b, [...ys], inPart, (x, y, z) => (win(x, y, z) && bar(x, y, z) ? FRAME : null));
    shellBox(b, [...ys], inPart, (x, y, z) => (win(x, y, z) && !bar(x, y, z) ? GLASS : null), 'glass', GLASS_SIZES);
  }
  // the Prellerhaus's round windows [documented]
  b.newGroup();
  for (const [cx, cz] of ROUND_WINDOWS) b.box(cx - 3, cz, cx + 3, cz + 1, ROUND_BAND[0], ROUND_BAND[1], { kind: 'glass', unit: 1, sizes: [[1, 1]], color: GLASS, mask: (x, z, y) => inRound(x, y, z) });
  // the basement windows in the plinth [documented]
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, 3, 8, { kind: 'glass', unit: 5, sizes: GLASS_SIZES, color: BASEMENT_GLASS, mask: (x, z, y) => onPlinth(x, z) && basementWindow(plinthAlong(x, z), y) });
  // the red double door [documented] under its flat canopy [documented]
  b.newGroup();
  b.box(DOOR.x0, DOOR.z, DOOR.x1, DOOR.z + 1, DOOR.y0, DOOR.y1, { kind: 'brick', unit: DOOR.y1 - DOOR.y0, sizes: [[3, 1], [1, 1]], color: RED });
  b.box(CANOPY[0], CANOPY[1], CANOPY[2], CANOPY[3], CANOPY_Y, CANOPY_Y + 1, { kind: 'plate', unit: 1, sizes: BIG_PLATE, color: WHITE });
  // BAUHAUS, top to bottom, in white on the grey tower [documented: photographs; Q8]
  b.newGroup();
  [...WORD].forEach((ch, i) =>
    FONT[ch].forEach((row, r) =>
      [...row].forEach((px, c) => { if (px === '#') b.add(letterX(c), LETTER_Z, letterTop(i) - (r + 1) * LETTER_ROW, 1, 1, LETTER_ROW, WHITE, 'tile'); })));
  // the Prellerhaus's sixteen small balconies [documented: four upper floors × four bays]: a slab, a dark solid front, a tube rail
  for (let l = 1; l <= 4; l++) {
    const y = PFL(l);
    b.newGroup();
    for (const b0 of P_BAYS) {
      const r = pBalcony(b0);
      b.box(r[0], r[1], r[2], r[3], y - 1, y, { kind: 'plate', unit: 1, sizes: BIG_PLATE, color: WHITE });
      b.box(r[0], r[1], r[2], r[1] + 1, y, y + 5, { kind: 'brick', unit: 5, sizes: PANEL, color: BALCONY_FRONT });
      for (const x of [r[0], r[2] - 1]) b.add(x, r[1], y + 5, 1, 1, 3, STEEL, 'bar');
      b.box(r[0], r[1], r[2], r[1] + 1, y + 8, y + 9, { kind: 'plate', unit: 1, sizes: PANEL, color: STEEL });
    }
    // the wide south balcony [documented]: a white cantilevered slab, tube rails round it
    const s = SOUTH_BALCONY;
    b.newGroup();
    b.box(s[0], s[1], s[2], s[3], y - 2, y, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: WHITE });
    for (let z = s[1]; z < s[3]; z += 4) b.column(s[2] - 1, z, y, y + 9, STEEL, 'bar');
    b.column(s[2] - 1, s[3] - 1, y, y + 9, STEEL, 'bar');
    b.box(s[0], s[1], s[2], s[3], y + 9, y + 10, {
      kind: 'plate', unit: 1, sizes: PANEL, color: STEEL, mask: (x, z) => x === s[2] - 1 || z === s[1] || z === s[3] - 1,
    });
  }
}

/** the flat roofs and their parapets, the roof terrace's railing, the stair head and the stage's roof (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  // the tall wings' roof: a slab inside, the white band all round [documented]
  b.newGroup();
  b.box(BX0, BZ0, BX1, BZ1, ROOF, ROOF + 2, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: SLAB, mask: (x, z, y) => tallPart(x, z, y) && !exterior(x, z, y) });
  b.box(BX0, BZ0, BX1, BZ1, ROOF, PARAPET, { kind: 'brick', unit: PARAPET - ROOF, sizes: PANEL, color: WHITE, mask: (x, z, y) => tallPart(x, z, y) && exterior(x, z, y) });
  // the link's roof over its walls, open over the stage
  b.newGroup();
  b.box(LINK[0], LINK[1], LINK[2], LINK[3], LINK_ROOF, LINK_TOP, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: SLAB, mask: (x, z) => !inRect(x, z, STAGE) });
  b.box(STAGE[0], STAGE[1], STAGE[2], STAGE[3], STAGE_TOP - 2, STAGE_TOP, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: SLAB });
  // the Prellerhaus's roof terrace [documented]: the slab, a low parapet, a tube railing all round
  b.newGroup();
  b.box(PRELLER[0], PRELLER[1], PRELLER[2], PRELLER[3], P_ROOF, P_ROOF + 2, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: SLAB, mask: (x, z, y) => !exterior(x, z, y) });
  b.box(PRELLER[0], PRELLER[1], PRELLER[2], PRELLER[3], P_ROOF, P_PARAPET, { kind: 'brick', unit: P_PARAPET - P_ROOF, sizes: PANEL, color: WHITE, mask: (x, z, y) => exterior(x, z, y) });
  const ring = (x: number, z: number) => x === PRELLER[0] || x === PRELLER[2] - 1 || z === PRELLER[1] || z === PRELLER[3] - 1;
  b.box(PRELLER[0], PRELLER[1], PRELLER[2], PRELLER[3], P_PARAPET, P_RAIL - 1, {
    kind: 'bar', unit: 3, sizes: [[1, 1]], color: STEEL,
    mask: (x, z) => ring(x, z) && (x === PRELLER[0] || x === PRELLER[2] - 1 ? (z - PRELLER[1]) % 4 === 0 || z === PRELLER[3] - 1 : (x - PRELLER[0]) % 4 === 0),
  });
  b.box(PRELLER[0], PRELLER[1], PRELLER[2], PRELLER[3], P_RAIL - 1, P_RAIL, { kind: 'plate', unit: 1, sizes: PANEL, color: STEEL, mask: ring });
  // the stair head, a level over the terrace [documented: OSM, 6 levels], its door onto the terrace [assumed]
  const sr: Rect = PRELLER_STAIR;
  const sRing = (x: number, z: number) => x === sr[0] || x === sr[2] - 1 || z === sr[1] || z === sr[3] - 1;
  b.newGroup();
  b.box(sr[0], sr[1], sr[2], sr[3], P_ROOF + 2, P_STAIR_TOP, {
    kind: 'brick', unit: P_STAIR_TOP - P_ROOF - 2, sizes: PANEL, color: WHITE, mask: (x, z, y) => sRing(x, z) && !(z === sr[3] - 1 && x >= sr[0] + 4 && x < sr[0] + 7 && y < P_ROOF + 22),
  });
  b.box(sr[0], sr[1], sr[2], sr[3], P_STAIR_TOP, P_STAIR_TOP + 2, { kind: 'plate', unit: 2, sizes: BIG_PLATE, color: SLAB });
}

/** for the tests: the parts' outer walls are solid at these heights */
export const isSolid = solid;
export { ENT_A, ENT_B, NORTH, STUB };
