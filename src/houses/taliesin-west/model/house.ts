/**
 * Taliesin West's buildings (spec 077): the platform's footings, the terrace walls and the pool's shell; the red floors and the
 * flagstones; the desert masonry (battered stone set in concrete), the 13 red beams and the Garden Room's seven fins; the glass,
 * the doors and the window bays, the chequered brise-soleil; the canvas roofs, the flat roofs and the pergola's lattice. Layout
 * and sourcing: layout.ts.
 */
import { BoxOpts, Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import {
  BAY_Z, BEAM_PROUD, BEAMS_X, BREEZEWAY, CHEQUER_Y, CHIMNEY, CORE, COVE_DOOR, DINING, DINING_COVE, DOOR_HEAD, ENTRANCE, FINS_Z, FIREPLACE,
  FLAGSTONES, GARDEN_ROOM, GR_CHIMNEY, GR_FIREPLACE, GR_MAIN_Z, grRoofTop, grSouthTop, inAny, inPool, inRect, INDIAN_ROCK, KITCHEN, KIVA,
  NE_MASONRY, NE_MASONRY_TOP, OFFICE_BAY, onEdge, onRing, PANEL, PASSAGE, PATIO, PERGOLA, PIERS_X, Pt, QUARTERS, Rect, RILL, ROCK_TIERS,
  ROOF_Z, roofTop, roofUnder, SKYLIGHT, STUDIO, STUDIO_DOORS, VAULT, Y, COVE_FIREPLACE, PROW_WEST, PROW_EAST,
} from './layout';
import { HeightMap, onPoolShell, onProwWall, onTerrace, onTerraceGround, onWalk, outsidePlates, PAVING, terraceStepAt } from './site';
import { inPoly } from '@/engine/lot';

/** Cherokee red [documented: the beams, the doors, the studio's floor; its value assumed] */
export const CHEROKEE = 0xa53c2c;
/** the canvas roofs' warm white [documented: white canvas; spec 077 Q3: one warm white for every panel, inside and out] */
export const CANVAS = 0xf2ebdb;
/** the concrete the stones are set in: grey-buff [documented: cement and desert sand; its value assumed] */
export const CONCRETE = 0xb7a98f;
/** the desert stones [assumed: sampled by eye from photographs]: buff, rust, grey, purple-brown, ochre */
export const STONES = [0xcaa679, 0xa45a3b, 0x8f8b85, 0x6d4d49, 0xc48e3e];
export const GLASS = 0xbcd2d8;
/** the brise-soleil's gold and white [documented: a gold-and-white chequer] */
export const GOLD = 0xd3a23d;
export const CHEQ_WHITE = 0xf5f0e4;
export const FLAGSTONE = [0xa88c6b, 0x9b8062, 0xb59a79];
const SLAB = 0xa0978a;
const FLAT_ROOF = 0xe9e1d0;
const KIVA_ROOF = 0x9e978b;

/**
 * Desert masonry [documented: local stones set in wooden forms, filled with concrete]: stones of five colours in runs of about
 * 2 studs, a third of the face [assumed], the rest the concrete; a deterministic hash of the cell, so every visitor sees the
 * same wall.
 */
export function masonry(x: number, y: number, z: number): number {
  const c = Math.floor(y / 3);
  const u = Math.floor((x + z + (c & 1)) / 2), v = Math.floor((x - z) / 2);
  if (hash2(u * 31 + v * 7, c * 7 + 1) >= 0.36) return CONCRETE;
  return STONES[Math.floor(hash2(u + 5 * v, c * 13 + 7) * STONES.length) % STONES.length];
}
export const isMasonry = (c: number) => c === CONCRETE || STONES.includes(c);

const MASONRY: BoxOpts = { kind: 'brick', color: masonry };

/** box() tests its mask at each course's bottom only, so a wall with openings is laid in runs that break at the cuts */
function layered(b: Builder, r: Rect, y0: number, y1: number, cuts: number[], o: BoxOpts) {
  const ys = [y0, ...cuts.filter((c) => c > y0 && c < y1).sort((a, c) => a - c), y1];
  for (let i = 1; i < ys.length; i++) b.box(r[0], r[1], r[2], r[3], ys[i - 1], ys[i], o);
}
/** a wall whose top varies by cell: one run per top */
function byTop(b: Builder, r: Rect, y0: number, top: (x: number, z: number) => number, on: (x: number, z: number) => boolean, cuts: number[], o: BoxOpts) {
  const tops = new Set<number>();
  for (let z = r[1]; z < r[3]; z++) for (let x = r[0]; x < r[2]; x++) if (on(x, z)) tops.add(top(x, z));
  for (const t of [...tops].sort((a, c) => a - c)) {
    const mask = o.mask;
    layered(b, r, y0, t, cuts, { ...o, mask: (x, z, y) => on(x, z) && top(x, z) === t && (!mask || mask(x, z, y)) });
  }
}
/** a roof whose top varies by cell: a slab `thick` plates deep under each top */
function slab(b: Builder, r: Rect, top: (x: number, z: number) => number, on: (x: number, z: number) => boolean, thick: number, o: BoxOpts) {
  const tops = new Set<number>();
  for (let z = r[1]; z < r[3]; z++) for (let x = r[0]; x < r[2]; x++) if (on(x, z)) tops.add(top(x, z));
  for (const t of [...tops].sort((a, c) => a - c)) b.box(r[0], r[1], r[2], r[3], t - thick, t, { ...o, mask: (x, z) => on(x, z) && top(x, z) === t });
}
const bbox = (rs: Rect[], pad = 0): Rect => [
  Math.min(...rs.map((r) => r[0])) - pad, Math.min(...rs.map((r) => r[1])) - pad, Math.max(...rs.map((r) => r[2])) + pad, Math.max(...rs.map((r) => r[3])) + pad,
];

// ---------------------------------------------------------------------------------------------------------------------------
// The wings round the Garden Room [assumed but for their OSM outlines]: masonry to the sill, glass above between masonry piers
// ---------------------------------------------------------------------------------------------------------------------------

const SILL = 9; // 3.6 ft [assumed]
type Wing = {
  name: string; rects: Rect[]; floor: number;
  /** the underside of the roof over a wall cell */
  top: (x: number, z: number) => number;
  /** which wall cells are glazed above the sill */
  glazed?: (x: number, z: number) => boolean;
  sill?: number;
};
const OPEN = new Set(['breezeway', 'passage']);
/** a wall cell that meets another enclosed building: masonry all the way up */
const party = (x: number, z: number, name: string) =>
  CORE.some((c) => c.name !== name && !OPEN.has(c.name) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => inAny(x + dx, z + dz, c.rects)));
const corner = (x: number, z: number, rs: Rect[]) => {
  const out = (dx: number, dz: number) => !inAny(x + dx, z + dz, rs);
  return (out(1, 0) || out(-1, 0)) && (out(0, 1) || out(0, -1));
};
/** the wall's run: along x if it faces ±z */
const along = (x: number, z: number, rs: Rect[]) => (!inAny(x, z + 1, rs) || !inAny(x, z - 1, rs) ? x : z);

/** the shed roofs of Wright's quarters [assumed: red-beamed shed roofs falling to the south-west, 2 plates every 3 studs] */
export function quartersTop(x: number, z: number): number {
  const r = QUARTERS.find((q) => inRect(x, z, q)) ?? QUARTERS[0];
  return 22 + 2 * Math.floor((r[3] - 1 - z) / 3);
}
const flatTop = () => Y.FLAT_ROOF;
/** the Garden Room's ceiling over a cell, for its lamps */
export const grLampY = (x: number, z: number) => (z < GR_MAIN_Z[1] ? grRoofTop(x) : grSouthTop(z)) - PANEL;

export const WINGS: Wing[] = [
  { name: 'kitchen', rects: KITCHEN, floor: Y.FLOOR, top: flatTop },
  { name: 'dining', rects: DINING, floor: Y.FLOOR, top: flatTop },
  { name: 'entrance', rects: ENTRANCE, floor: Y.FLOOR, top: flatTop },
  { name: 'cove', rects: [DINING_COVE], floor: Y.FLOOR, top: flatTop },
  { name: 'quarters', rects: QUARTERS, floor: Y.FLOOR, top: (x, z) => quartersTop(x, z) - PANEL },
  // the Garden Room: the west and south walls masonry, glass on the north and east [documented], over a low masonry sill
  {
    name: 'garden', rects: [GARDEN_ROOM], floor: Y.FLOOR, sill: 3,
    top: (x, z) => (z < GR_MAIN_Z[1] ? grRoofTop(x) : grSouthTop(z)) - PANEL,
    glazed: (x, z) => z === GARDEN_ROOM[1] || x === GARDEN_ROOM[2] - 1,
  },
  // the Kiva: solid masonry [documented: partly underground], its roof concrete
  { name: 'kiva', rects: KIVA, floor: Y.KIVA_FLOOR, top: () => Y.KIVA_ROOF, glazed: () => false },
];

/** the Cherokee-red doors [documented: red doors; their places assumed but for the Garden Room's pivot door and its door to
 * the Dining Cove]: cells, each 1 stud thick */
export const DOORS: Rect[] = [
  [COVE_DOOR[0], DINING_COVE[3] - 1, COVE_DOOR[1], DINING_COVE[3]], // the Dining Cove → the Garden Room [documented]
  [ENTRANCE[0][0], 14, ENTRANCE[0][0] + 1, 18], // the pivot door, 4 ft wide [documented: 4′ × 6′-3″], from the Breezeway
  [98, 40, 99, 43], // the kitchen onto Indian Rock Terrace
  [150, 61, 154, 62], [126, 61, 129, 62], // the Dining Room onto the terrace
  [300, -4, 303, -3], [290, 31, 294, 32], [260, 26, 263, 27], // Wright's quarters
  [213, -16, 216, -15], // the Kiva, from the platform
];
export const doorAt = (x: number, z: number) => DOORS.some((d) => inRect(x, z, d));
const PIVOT_HEAD = 15; // 6 ft: 6′-3″ [documented], to the course

/** a wall cell: masonry below the sill and at piers, corners and party walls; glass above the sill elsewhere */
export function wingCell(w: Wing, x: number, y: number, z: number): 'masonry' | 'glass' | 'door' | null {
  if (!onEdge(x, z, w.rects)) return null;
  const head = Math.min(w.name === 'entrance' ? PIVOT_HEAD : DOOR_HEAD, w.top(x, z));
  if (doorAt(x, z) && y >= Math.max(w.floor, 0) && y < head) return 'door';
  // the doorway into the Garden Room from the Dining Cove's door [documented: connected by a glass door]
  if (w.name === 'garden' && z === GARDEN_ROOM[1] && x >= COVE_DOOR[0] && x < COVE_DOOR[1] && y < DOOR_HEAD) return null;
  if (w.name === 'kiva') return 'masonry';
  const sill = w.sill ?? SILL;
  if (y < sill || party(x, z, w.name) || corner(x, z, w.rects)) return 'masonry';
  if (w.glazed && !w.glazed(x, z)) return 'masonry';
  if (!w.glazed && ((along(x, z, w.rects) % 8) + 8) % 8 < 2) return 'masonry';
  return 'glass';
}

// ---------------------------------------------------------------------------------------------------------------------------

/** the platform's footings and the terrace walls, Indian Rock Terrace's tiers, the pool's shell (foundation) */
export function buildFoundation(b: Builder, hm: HeightMap) {
  b.setPhase(P.FOUNDATION);
  // footings under every building's walls [assumed]
  for (const c of CORE) {
    b.newGroup();
    const top = c.rects === KIVA ? Y.KIVA_FLOOR - 3 : Y.SLAB;
    b.box(...bbox(c.rects), top - 3, top, { kind: 'brick', color: CONCRETE, mask: (x, z) => onEdge(x, z, c.rects) });
  }
  // Sunset Terrace's battered walls along the prow [documented: the 45° sides; battered: assumed], from the ground outside up to
  // a 1.2 ft parapet; the outer row only to below the lawn, so the face steps in
  b.newGroup();
  const T: Rect = [-10, 30, 210, 175];
  const wallTop = (x: number, z: number) => Math.max(Y.TERRACE + 3, outsidePlates(x, z));
  b.box(T[0], T[1], T[2], T[3], -60, 30, {
    ...MASONRY,
    mask: (x, z, y) => {
      if (!onProwWall(x, z) || y < hm.at(x, z)) return false;
      const outer = Math.abs(z - x - PROW_WEST) / Math.SQRT2 < 1 || Math.abs(z + x + 1 - PROW_EAST) / Math.SQRT2 < 1;
      return y < (outer ? Math.min(Y.TERRACE - 3, wallTop(x, z)) : wallTop(x, z));
    },
  });
  // the step down from the spine to the lawn: a stone wall [assumed]
  b.newGroup();
  b.box(T[0], T[1], T[2], T[3], Y.TERRACE, 0, { ...MASONRY, mask: (x, z) => terraceStepAt(x, z) });
  // Indian Rock Terrace: a stepped pyramid of desert masonry [documented], four tiers [assumed]
  b.newGroup();
  for (let t = 0; t < ROCK_TIERS; t++) {
    const [x0, z0, x1, z1] = INDIAN_ROCK;
    b.box(x0 + 2 * t, z0 + 2 * t, x1 - 2 * t, z1 - 2 * t, Y.TERRACE + 3 * t, Y.TERRACE + 3 * t + 3, MASONRY);
  }
  // the pool's shell [documented: fed from the well, a fire reservoir], its walls concrete [assumed]
  b.newGroup();
  const PR: Rect = [48, 64, 96, 112];
  b.box(PR[0], PR[1], PR[2], PR[3], Y.POOL_FLOOR, Y.TERRACE + 1, { kind: 'brick', color: CONCRETE, mask: (x, z) => onPoolShell(x, z) && onTerrace(x, z) });
  b.box(PR[0], PR[1], PR[2], PR[3], Y.POOL_FLOOR, Y.POOL_FLOOR + 1, { kind: 'plate', color: 0x8d9a94, mask: (x, z) => inPool(x, z) });
  // the Kiva Fountain's rill [documented], its rim of masonry [assumed]
  b.newGroup();
  b.box(RILL[0], RILL[1], RILL[2], RILL[3], -3, 0, { ...MASONRY, mask: (x, z) => onRing(x, z, RILL) });
  b.box(RILL[0], RILL[1], RILL[2], RILL[3], -3, -2, { kind: 'plate', color: 0x7f8a86, mask: (x, z) => !onRing(x, z, RILL) });
}

/** the floors: the studio's Cherokee-red concrete and its flagstones, the others' concrete, the Kiva's, sunk (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  for (const c of CORE) {
    b.newGroup();
    const kiva = c.rects === KIVA;
    const f = kiva ? Y.KIVA_FLOOR : Y.FLOOR;
    const open = c.name === 'breezeway' || c.name === 'passage';
    b.box(...bbox(c.rects), f - 3, f - 1, { kind: 'brick', color: SLAB, mask: (x, z) => inAny(x, z, c.rects) });
    b.box(...bbox(c.rects), f - 1, f, {
      kind: 'plate', mask: (x, z) => inAny(x, z, c.rects),
      // [documented: the studio's floor bare concrete painted Cherokee red, with a flagstone area at the south-east end]
      color: (x, _y, z) => (c.name === 'studio'
        ? (inRect(x, z, FLAGSTONES) ? FLAGSTONE[Math.floor(hash2(x >> 1, z >> 1) * 3)] : CHEROKEE)
        : open ? FLAGSTONE[Math.floor(hash2(x >> 1, z >> 1) * 3)] : kiva ? 0x8c8073 : 0xa39a8e),
    });
  }
  // the terrace's paved walks [documented: OSM's paving-stone footways round the pool and across the lawn]
  b.newGroup();
  b.box(-10, 30, 210, 175, Y.TERRACE, Y.TERRACE + 1, { kind: 'plate', color: (x, _y, z) => PAVING[((x + z) >> 2) & 1], mask: (x, z) => onTerraceGround(x, z) && onWalk(x, z) });
  // the Kiva's steps down from its door [assumed]
  b.newGroup();
  b.box(213, -19, 216, -17, Y.KIVA_FLOOR, -3, { kind: 'brick', color: CONCRETE, mask: (_x, z, y) => (z === -17 ? y < -3 : y < -6) });
}

/** the desert masonry, the beams and the fins, the posts (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  const [sx0, , sx1, sz1] = STUDIO;
  // the studio's south-west base, battered in two courses [documented]: the lower to z = 30, the upper stepped in to z = 29
  b.newGroup();
  b.box(sx0, sz1 - 2, sx1, sz1 + 1, Y.FLOOR, Y.BASE_1, MASONRY);
  b.box(sx0, sz1 - 2, sx1, sz1, Y.BASE_1, Y.BASE_2, MASONRY);
  // the five piers on the north-east [documented], battered the same way [assumed], up under the roof
  b.newGroup();
  for (const p of PIERS_X) {
    b.box(p - 1, -1, p + 2, 2, Y.FLOOR, 9, MASONRY);
    for (const z of [0, 1]) b.box(p - 1, z, p + 2, z + 1, 9, roofUnder(z), MASONRY);
  }
  // the two south-eastern bays' masonry on the north-east [documented: 4′-6″]
  b.box(NE_MASONRY[0], -1, NE_MASONRY[1], 1, Y.FLOOR, 6, MASONRY);
  b.box(NE_MASONRY[0], 0, NE_MASONRY[1], 1, 6, NE_MASONRY_TOP, MASONRY);
  // the south-east end wall, up under the roof, with the fireplace shared with the kitchen [documented] and its chimney rising
  // 16 ft from the foundation [documented]
  b.newGroup();
  byTop(b, [sx1 - 1, 0, sx1, sz1], Y.FLOOR, (_x, z) => roofUnder(z), () => true, [], MASONRY);
  b.box(...FIREPLACE, Y.FLOOR, 12, MASONRY);
  b.box(...CHIMNEY, 12, Y.CHIMNEY, MASONRY);
  // the Vault [documented: the first desert-masonry building], its walls up under the studio's slope
  b.newGroup();
  byTop(b, VAULT, Y.FLOOR, (_x, z) => roofUnder(z), (x, z) => onRing(x, z, VAULT), [], MASONRY);
  // the walled patio [documented] and the three-walled office bay [documented], open to the south-east
  b.newGroup();
  b.box(...PATIO, Y.FLOOR, 9, { ...MASONRY, mask: (x, z) => onRing(x, z, PATIO) && x !== PATIO[2] - 1 && !(x === PATIO[0] && z >= 12 && z < 18) });
  b.box(...OFFICE_BAY, Y.FLOOR, 15, { ...MASONRY, mask: (x, z) => x === OFFICE_BAY[0] || z === OFFICE_BAY[1] || z === OFFICE_BAY[3] - 1 });
  // the other buildings' masonry
  for (const w of WINGS) {
    b.newGroup();
    byTop(b, bbox(w.rects), w.floor, w.top, (x, z) => onEdge(x, z, w.rects), [w.sill ?? SILL, 0, DOOR_HEAD, PIVOT_HEAD], {
      ...MASONRY, mask: (x, z, y) => wingCell(w, x, y, z) === 'masonry',
    });
    if (w.name === 'kiva') {
      // the Kiva's walls are battered too: a second course inside, below the platform's level [assumed]
      b.box(...bbox(w.rects), w.floor, 0, {
        ...MASONRY, mask: (x, z) => inAny(x, z, w.rects) && !onEdge(x, z, w.rects) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => onEdge(x + dx, z + dz, w.rects)) && !inRect(x, z, [212, -20, 217, -16]),
      });
    }
  }
  // the Garden Room's fireplace at its south end [documented] and the Dining Cove's [documented]
  b.newGroup();
  b.box(...GR_FIREPLACE, Y.FLOOR, 15, MASONRY);
  b.box(...GR_CHIMNEY, 15, 40, MASONRY);
  b.box(...COVE_FIREPLACE, Y.FLOOR, 12, MASONRY);
  b.box(COVE_FIREPLACE[0], 30, COVE_FIREPLACE[0] + 2, 33, 12, 30, MASONRY);

  // the 13 red beams [documented: flitch beams, redwood either side of a steel web; Cherokee red], standing open over the studio
  // [documented: no ridge beam], each running on past the north-east eave to carry the pergola [scaled: sheet 4]
  for (const x of BEAMS_X) {
    b.newGroup();
    for (let z = ROOF_Z[0]; z < ROOF_Z[1]; z += 3) b.box(x, z, x + 1, Math.min(z + 3, ROOF_Z[1]), roofUnder(z), roofTop(z) + BEAM_PROUD, { kind: 'brick', color: CHEROKEE });
    b.box(x, ROOF_Z[0] - 1, x + 1, ROOF_Z[0], Y.PERGOLA_TOP, roofTop(ROOF_Z[0]) + BEAM_PROUD, { kind: 'brick', color: CHEROKEE });
    b.box(x, PERGOLA[1], x + 1, ROOF_Z[0], Y.PERGOLA_TOP - 3, Y.PERGOLA_TOP, { kind: 'brick', color: CHEROKEE });
    // its posts: the pergola's outer one, one under the north-east edge where no pier stands, one on the base on the south-west
    b.column(x, PERGOLA[1], Y.FLOOR, Y.PERGOLA_TOP - 3, CHEROKEE, 'brick');
    const onMasonry = x >= NE_MASONRY[0] && x < NE_MASONRY[1];
    if (!PIERS_X.includes(x) && x > VAULT[2] - 2 && x < sx1 - 1) b.column(x, 0, onMasonry ? NE_MASONRY_TOP : Y.FLOOR, roofUnder(0), CHEROKEE, 'brick');
    b.column(x, BAY_Z, Y.BASE_1, roofUnder(BAY_Z), CHEROKEE, 'brick');
  }
  // the pergola's outer rail [assumed]
  b.newGroup();
  b.box(BEAMS_X[0], PERGOLA[1], BEAMS_X[12] + 1, PERGOLA[1] + 1, Y.PERGOLA_TOP - 3, Y.PERGOLA_TOP, { kind: 'brick', color: CHEROKEE });

  // the Garden Room's seven red fins [documented: seven structural fins; the roof fin 26 ft long], across the room, standing
  // proud of its panels [assumed]
  for (const z of FINS_Z) {
    b.newGroup();
    for (let x = GARDEN_ROOM[0] - 1; x < GARDEN_ROOM[2] + 1; x++) b.box(x, z, x + 1, z + 1, grRoofTop(x) - PANEL, grRoofTop(x) + 3, { kind: 'brick', color: CHEROKEE });
  }
  // the Breezeway's and the passage's red posts [assumed]
  b.newGroup();
  for (const r of [...BREEZEWAY, ...PASSAGE])
    for (let z = r[1]; z < r[3]; z += 7) for (const x of [r[0], r[2] - 1]) b.column(x, Math.min(z, r[3] - 1), Y.FLOOR, Y.FLAT_ROOF, CHEROKEE, 'brick');
}

/** the glass, the doors and the window bays, the chequered brise-soleil (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const [, , sx1] = STUDIO;
  // the studio's north-east glass between the piers [documented: glazing from the late 1940s], with the four pairs of red doors
  // onto the pergola [documented]
  b.newGroup();
  const neOpen = (x: number) => x >= VAULT[2] && x < NE_MASONRY[0] && !PIERS_X.some((p) => Math.abs(x - p) <= 1) && !BEAMS_X.includes(x);
  const neDoor = (x: number) => STUDIO_DOORS.some(([a, c]) => x >= a && x < c);
  b.box(VAULT[2], 0, sx1, 1, Y.FLOOR, DOOR_HEAD, { kind: 'tile', unit: 3, color: CHEROKEE, mask: (x) => neOpen(x) && neDoor(x) });
  b.box(VAULT[2], 0, sx1, 1, Y.FLOOR, roofUnder(0), { kind: 'glass', color: GLASS, mask: (x, _z, y) => neOpen(x) && !(neDoor(x) && y < DOOR_HEAD) });
  b.box(NE_MASONRY[0], 0, NE_MASONRY[1], 1, NE_MASONRY_TOP, roofUnder(0), { kind: 'glass', color: GLASS, mask: (x) => !BEAMS_X.includes(x) });
  // the window bays on the south-west, cantilevered over the base [documented], between the beams' posts
  b.newGroup();
  b.box(VAULT[2], BAY_Z, sx1 - 1, BAY_Z + 1, Y.BASE_1, roofUnder(BAY_Z), { kind: 'glass', color: GLASS, mask: (x) => !BEAMS_X.includes(x) });
  // the gold-and-white chequered brise-soleil on the north-east front [documented], under the eave, in 2-stud squares [assumed]
  b.newGroup();
  b.box(VAULT[2], -1, sx1, 0, CHEQUER_Y[0], CHEQUER_Y[1], {
    kind: 'tile', unit: 2, color: (x, y) => (((x >> 1) + (y >> 1)) & 1 ? GOLD : CHEQ_WHITE),
    mask: (x) => !BEAMS_X.includes(x) && x < NE_MASONRY[1],
  });
  // the other buildings' glass and doors
  for (const w of WINGS) {
    b.newGroup();
    byTop(b, bbox(w.rects), w.floor, w.top, (x, z) => onEdge(x, z, w.rects), [w.sill ?? SILL, 0, DOOR_HEAD, PIVOT_HEAD], {
      kind: 'glass', color: GLASS, mask: (x, z, y) => wingCell(w, x, y, z) === 'glass',
    });
    b.box(...bbox(w.rects), w.floor, DOOR_HEAD, { kind: 'tile', unit: 3, color: CHEROKEE, mask: (x, z, y) => wingCell(w, x, y, z) === 'door' });
  }
  // the dentilled fascias [documented: 2″ × 2″ dentils, 4″ apart] round the flat roofs: red tiles every other stud [assumed]
  b.newGroup();
  for (const w of WINGS.filter((v) => v.top === flatTop))
    b.box(...bbox(w.rects, 1), Y.FLAT_ROOF - 1, Y.FLAT_ROOF, {
      kind: 'tile', color: CHEROKEE,
      mask: (x, z) => !inAny(x, z, w.rects) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => inAny(x + dx, z + dz, w.rects)) && (x + z) % 2 === 0 && !inCoreAny(x, z),
    });
}
const inCoreAny = (x: number, z: number) => CORE.some((c) => inAny(x, z, c.rects));

/** the canvas roofs between the beams, the flat roofs, the Kiva's concrete roof, the pergola's lattice (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const [sx0, , sx1] = STUDIO;
  // the studio's sloped panels [documented: canvas once, today white panels; spec 077 Q3], one strip of 3 studs at a time
  for (let z = ROOF_Z[0]; z < ROOF_Z[1]; z += 3) {
    b.newGroup();
    b.box(sx0, z, sx1, Math.min(z + 3, ROOF_Z[1]), roofUnder(z), roofTop(z), { kind: 'brick', color: CANVAS, mask: (x) => !BEAMS_X.includes(x) });
  }
  // the pergola's diamond lattice between the beams [scaled: sheet 4], wood [assumed]
  b.newGroup();
  b.box(PERGOLA[0], PERGOLA[1] + 1, PERGOLA[2], ROOF_Z[0], Y.PERGOLA_TOP - 1, Y.PERGOLA_TOP, {
    kind: 'plate', color: 0x8a5a3c, mask: (x, z) => !BEAMS_X.includes(x) && ((((x + z) % 6) + 6) % 6 === 0 || (((x - z) % 6) + 6) % 6 === 0),
  });
  // the flat roofs [documented: over the entrance and the Dining Cove; assumed elsewhere], the entrance's pentagon skylight
  for (const w of WINGS.filter((v) => v.top === flatTop)) {
    b.newGroup();
    const sky = (x: number, z: number) => w.name === 'entrance' && inPoly(x + 0.5, z + 0.5, SKYLIGHT as Pt[]);
    b.box(...bbox(w.rects), Y.FLAT_ROOF, Y.FLAT_ROOF + 3, { kind: 'brick', color: FLAT_ROOF, mask: (x, z) => inAny(x, z, w.rects) && !sky(x, z) });
    b.box(...bbox(w.rects), Y.FLAT_ROOF, Y.FLAT_ROOF + 1, { kind: 'glass', unit: 1, color: GLASS, mask: (x, z) => sky(x, z) });
  }
  // the Breezeway's and the passage's flat roofs on their posts [assumed]
  b.newGroup();
  for (const r of [...BREEZEWAY, ...PASSAGE]) b.box(...r, Y.FLAT_ROOF, Y.FLAT_ROOF + 3, { kind: 'brick', color: FLAT_ROOF });
  // Wright's quarters: shed roofs falling to the south-west between red beams every 8 studs [assumed]
  b.newGroup();
  const qb = bbox(QUARTERS);
  const qBeam = (x: number) => x % 8 === 0;
  slab(b, qb, quartersTop, (x, z) => inAny(x, z, QUARTERS) && !qBeam(x), PANEL, { kind: 'brick', color: CANVAS });
  slab(b, qb, (x, z) => quartersTop(x, z) + BEAM_PROUD, (x, z) => inAny(x, z, QUARTERS) && qBeam(x), PANEL + BEAM_PROUD, { kind: 'brick', color: CHEROKEE });
  // the Garden Room's roof: panels between the fins sloping one way [documented: 8 → 11 ft], and the south end's own roof
  // sloping south [documented]
  b.newGroup();
  const G = GARDEN_ROOM;
  slab(b, [G[0], G[1], G[2], GR_MAIN_Z[1]], (x) => grRoofTop(x), (x, z) => !FINS_Z.includes(z) && inRect(x, z, G), PANEL, { kind: 'brick', color: CANVAS });
  b.newGroup();
  slab(b, [G[0], GR_MAIN_Z[1], G[2], G[3]], (_x, z) => grSouthTop(z), (x, z) => inRect(x, z, G), PANEL, { kind: 'brick', color: CANVAS });
  // the Kiva's flat concrete roof [documented], and the office bay's [assumed]
  b.newGroup();
  b.box(...bbox(KIVA), Y.KIVA_ROOF, Y.KIVA_ROOF + 3, { kind: 'brick', color: KIVA_ROOF, mask: (x, z) => inAny(x, z, KIVA) });
  b.box(...OFFICE_BAY, 15, 18, { kind: 'brick', color: KIVA_ROOF });
}

