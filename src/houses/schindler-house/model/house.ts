/**
 * The Schindler House itself (spec 081): the one floor slab that's both foundation and floor; the tilt-up concrete slabs on the
 * 4 ft module with the slits between them, the four concrete chimneys, the redwood frame, the stairs and the sleeping baskets;
 * the slits' glass and concrete, the patio walls' glass and sliding canvas, the clerestories, the doors and the baskets' canvas;
 * the flat roof with its board cornice, the lower roofs over the patio sides, the skylights and the baskets' tops. Layout and
 * sourcing: layout.ts.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  ARMS, BASKETS, cellOf, CHIMNEYS, DIAMOND, FRAME_RUNS, GLAZING_BARS, GUEST_PATIO, inAny, inBasket, inChimney, inDiamond, inDoor,
  inHouse, inRect, isPost, LOWER_ROOFS, NORTH_STAIR, Rect, ROOMS, Run, SCREEN_RUNS, screenPart, SKYLIGHTS, SLAB_RUNS, slabPart, slabsOf,
  slitFill, SOUTH_STAIR, STAIRWELL, treadTop, wallTop, Y,
} from './layout';

/** the concrete of the slabs, the chimneys and the floor slab, left bare inside and out [documented]; its grey [assumed:
 * photographs] */
export const CONCRETE = 0xb8b3a7;
/** the concrete poured into the joints that aren't glazed [documented], a shade darker so the joints read [assumed] */
export const JOINT = 0x95908a;
/** the redwood of the frame, the doors and the cornice, unpainted in 1922 [documented; its colour assumed] */
export const REDWOOD = 0x8c4b2f;
/** the sliding panels' canvas and the baskets' sides [documented], natural duck [assumed] */
export const CANVAS = 0xebe3cf;
/** the green rolled roofing [documented] */
export const ROOFING = 0x627258;
/** clear and frosted glass in the slits [documented] */
export const GLASS = C.glass;
export const FROSTED = 0xf2f3ee;
/** the floor slab's finish in the rooms [assumed: the concrete, troweled darker] and the hearths [assumed] */
export const FLOOR = 0x9d978b;
const HEARTH = 0x7e776c;

const PL_BEAM = Y.BEAM;

/** a run's box: a wall along x is 1 deep in z, along z 1 wide in x */
function runBox(b: Builder, r: Run, y0: number, y1: number, o: Parameters<Builder['box']>[6]) {
  if (r.axis === 'x') b.box(r.from, r.at, r.to, r.at + 1, y0, y1, o);
  else b.box(r.at, r.from, r.at + 1, r.to, y0, y1, o);
}
const runCell = (r: Run, x: number, z: number) => (r.axis === 'x' ? x : z);

/** the floor slab, poured on the ground, its edge 8″ proud [documented]; the guest patio's slab and the entry pads; footings (foundation) */
export function buildFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  b.newGroup();
  const inRoom = (x: number, z: number) => Object.values(ROOMS).some((r) => inRect(x, z, r));
  for (const a of ARMS)
    b.box(a[0], a[1], a[2], a[3], -4, 0, { kind: 'brick', color: CONCRETE, mask: (x, z, y) => y < -1 || !inRoom(x, z) });
  // the guest apartment's small concrete patio, level with the floor [documented]
  b.newGroup();
  b.box(GUEST_PATIO[0], GUEST_PATIO[1], GUEST_PATIO[2], GUEST_PATIO[3], -4, 0, { kind: 'brick', color: CONCRETE });
  // the entry slab under the south basket [documented: "the entry slabs"] and the south stair's pad [assumed]
  b.newGroup();
  b.box(27, 60, 31, 63, -1, 0, { kind: 'plate', color: CONCRETE });
  b.box(SOUTH_STAIR.x0, SOUTH_STAIR.z, SOUTH_STAIR.x0 + 11, SOUTH_STAIR.z + SOUTH_STAIR.d, -1, 0, { kind: 'plate', color: CONCRETE });
  // the chimneys' footings where they stand out of the slab [assumed]
  b.newGroup();
  for (const c of CHIMNEYS) b.box(c.rect[0], c.rect[1], c.rect[2], c.rect[3], -4, 0, { kind: 'brick', color: CONCRETE });
}

/** the floor in the rooms: the slab is the final floor [documented], here its troweled top; the hearths (floor) */
export function buildFloors(b: Builder) {
  b.setPhase(P.FLOOR);
  for (const r of Object.values(ROOMS)) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], -1, 0, { kind: 'tile', color: (x, _y, z) => (hearth(x, z) ? HEARTH : FLOOR), mask: (x, z) => !inChimney(x, z) });
  }
}
/** the hearth in front of each indoor fireplace [assumed: 2 ft deep] */
function hearth(x: number, z: number) {
  for (const o of fireplaces()) if (o.inside && inRect(x, z, o.hearth)) return true;
  return false;
}

/** each fireplace's opening (cells cut from its chimney) and the hearth or patio before it */
export function fireplaces(): { id: string; inside: boolean; open: Rect; hearth: Rect }[] {
  const out: { id: string; inside: boolean; open: Rect; hearth: Rect }[] = [];
  for (const c of CHIMNEYS) {
    const [x0, z0, x1, z1] = c.rect, mx = (x0 + x1) >> 1;
    // an opening 2 wide and 1 deep in the face,
    const face = (f: 'n' | 's' | 'e' | 'w', inside: boolean) => {
      if (f === 'n') out.push({ id: `${c.id}-${inside ? 'in' : 'out'}`, inside, open: [mx - 1, z0, mx + 1, z0 + 1], hearth: [mx - 1, z0 - 2, mx + 1, z0] });
      if (f === 's') out.push({ id: `${c.id}-${inside ? 'in' : 'out'}`, inside, open: [mx - 1, z1 - 1, mx + 1, z1], hearth: [mx - 1, z1, mx + 1, z1 + 2] });
    };
    face(c.inside, true);
    if (c.patio) face(c.patio, false);
  }
  // the 45° chimney: a fireplace on each side, into the kitchen and into the studio [documented: "copper panels over its
  // fireplaces"; which rooms assumed]
  const dx = Math.floor(DIAMOND.x - 1), dz0 = Math.floor(DIAMOND.z - DIAMOND.r), dz1 = Math.ceil(DIAMOND.z + DIAMOND.r);
  out.push({ id: 'diamond-n', inside: true, open: [dx, dz0, dx + 2, dz0 + 2], hearth: [dx, dz0 - 2, dx + 2, dz0] });
  out.push({ id: 'diamond-s', inside: true, open: [dx, dz1 - 2, dx + 2, dz1], hearth: [dx, dz1, dx + 2, dz1 + 2] });
  return out;
}
const inOpening = (x: number, z: number) => fireplaces().some((o) => inRect(x, z, o.open));

/** the tilt-up slabs, the chimneys, the redwood frame, the stairs and the sleeping baskets (structure) */
export function buildStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  const opens = fireplaces();
  // the chimneys: plain concrete masses from the slab to above the roof [documented], with their fireplaces' openings
  for (const c of CHIMNEYS) {
    b.newGroup();
    b.box(c.rect[0], c.rect[1], c.rect[2], c.rect[3], 0, c.top, {
      kind: 'brick', color: CONCRETE, mask: (x, z, y) => !(y < Y.FIREPLACE && opens.some((o) => inRect(x, z, o.open))),
    });
  }
  b.newGroup();
  const [dx0, dz0] = [Math.floor(DIAMOND.x - DIAMOND.r), Math.floor(DIAMOND.z - DIAMOND.r)];
  b.box(dx0, dz0, dx0 + 2 * DIAMOND.r + 1, dz0 + 2 * DIAMOND.r + 2, 0, Y.CHIMNEY_45, {
    kind: 'brick', color: CONCRETE, mask: (x, z, y) => inDiamond(x, z) && !(y < Y.FIREPLACE && inOpening(x, z)),
  });

  // the slabs: one piece each, cast flat and tilted up [documented], from the floor slab to the roof's underside; the slits left
  // open, to be filled with the envelope
  for (const r of SLAB_RUNS) {
    b.newGroup();
    for (const [s, e] of slabsOf(r)) {
      const [x, z] = cellOf(r, s);
      b.add(x, z, 0, r.axis === 'x' ? e - s : 1, r.axis === 'z' ? e - s : 1, Y.SLAB_TOP, CONCRETE, 'tile');
    }
    // over the doorways, a redwood lintel at the head [assumed]
    for (const [a, e] of r.doors ?? []) {
      const [x, z] = cellOf(r, a);
      b.add(x, z, Y.BEAM, r.axis === 'x' ? e - a : 1, r.axis === 'z' ? e - a : 1, 1, REDWOOD, 'brick');
    }
  }

  // the redwood frame of the patio walls and the frame walls: posts every 4 ft [documented: the module], floor to roof
  for (const r of [...SCREEN_RUNS, ...FRAME_RUNS]) {
    b.newGroup();
    for (let c = r.from; c < r.to; c++) {
      const [x, z] = cellOf(r, c);
      if (!isPost(r, c) || inChimney(x, z) || !b.free(x, z, 0, wallTop(x, z))) continue;
      b.add(x, z, 0, 1, 1, wallTop(x, z), REDWOOD, 'brick');
    }
  }
  // the double beams at 6′-1″ along the patio walls and over every opening [documented: the head of the openings]
  for (const r of [...SCREEN_RUNS, ...FRAME_RUNS]) {
    b.newGroup();
    runBox(b, r, PL_BEAM, PL_BEAM + 1, { kind: 'brick', color: REDWOOD, mask: (x, z) => !inChimney(x, z) });
  }
  // and through the major rooms [documented], one pair along each studio and the guest room [assumed: their lines]
  b.newGroup();
  for (const [x0, z0, x1, z1] of [[45, 9, 78, 11], [38, 40, 40, 63], [4, 70, 26, 72], [1, 26, 31, 28]] as Rect[])
    b.box(x0, z0, x1, z1, PL_BEAM, PL_BEAM + 1, { kind: 'brick', color: REDWOOD });

  // the stairs: the north one inside the north door, the south one outside the south entrance [documented]; 11 risers to the
  // baskets' floors at 7′-0″ [documented: the south stair's]; solid redwood under each tread [assumed]
  b.newGroup();
  for (let i = 0; i < 11; i++) b.add(NORTH_STAIR.x, NORTH_STAIR.z0 + NORTH_STAIR.dz * i, 0, NORTH_STAIR.w, 1, treadTop(i), REDWOOD, 'brick');
  b.newGroup();
  for (let i = 0; i < 11; i++) b.add(SOUTH_STAIR.x0 + i, SOUTH_STAIR.z, 0, 1, SOUTH_STAIR.d, treadTop(i), REDWOOD, 'brick');

  // the sleeping baskets [documented: "redwood four-post canopies with mitered beams"; their form assumed]: the floor over the
  // entrance, a post at every corner, the mitred beams round the top
  for (const basket of BASKETS) {
    b.newGroup();
    for (const r of basket) b.box(r[0], r[1], r[2], r[3], Y.ENTRY_CEILING, Y.BASKET_FLOOR, { kind: 'plate', color: REDWOOD, mask: (x, z) => !inRect(x, z, STAIRWELL) });
    b.newGroup();
    for (const [x, z] of basketCorners(basket)) b.add(x, z, Y.BASKET_FLOOR, 1, 1, Y.BASKET_TOP - Y.BASKET_FLOOR - 1, REDWOOD, 'brick');
    b.newGroup();
    for (const r of basket) b.box(r[0], r[1], r[2], r[3], Y.BASKET_TOP - 1, Y.BASKET_TOP, { kind: 'brick', color: REDWOOD, mask: (x, z) => basketEdge(basket, x, z) });
  }

  // the roof beams on the 4 ft module, carried by the walls [documented: "the bearing walls carry redwood beams"]
  b.newGroup();
  for (const a of Object.values(ROOMS))
    b.box(a[0], a[1], a[2], a[3], Y.SLAB_TOP - 1, Y.SLAB_TOP, {
      kind: 'brick', color: REDWOOD, mask: (x, z) => (a[2] - a[0] > a[3] - a[1] ? x % 4 === 2 : z % 4 === 2) && !inBasket(x, z) && !inChimney(x, z),
    });
}

/** a basket's outline cells (on its edge) */
export const basketEdge = (basket: Rect[], x: number, z: number) => {
  if (!inAny(x, z, basket)) return false;
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (!inAny(x + dx, z + dz, basket)) return true;
  return false;
};
/** a basket's posts: its outline's corners (convex and concave) [documented: four-post; the L's six assumed] */
export function basketCorners(basket: Rect[]): [number, number][] {
  const out: [number, number][] = [];
  const [x0, z0, x1, z1] = [Math.min(...basket.map((r) => r[0])), Math.min(...basket.map((r) => r[1])), Math.max(...basket.map((r) => r[2])), Math.max(...basket.map((r) => r[3]))];
  for (let z = z0; z < z1; z++)
    for (let x = x0; x < x1; x++) {
      if (!basketEdge(basket, x, z)) continue;
      const h = !inAny(x - 1, z, basket) || !inAny(x + 1, z, basket), v = !inAny(x, z - 1, basket) || !inAny(x, z + 1, basket);
      const diag = [[-1, -1], [1, -1], [-1, 1], [1, 1]].some(([a, c]) => !inAny(x + a, z + c, basket));
      // a convex corner is open on two sides; a concave one only diagonally
      if ((h && v) || (!h && !v && diag)) out.push([x, z]);
    }
  return out;
}
/** where each basket's stair arrives: no side there [assumed] */
const BASKET_GAPS: Rect[] = [[SOUTH_STAIR.x0 + 11, SOUTH_STAIR.z, SOUTH_STAIR.x0 + 12, SOUTH_STAIR.z + SOUTH_STAIR.d]];

/** the slits' fills, the patio walls' glass and canvas, the clerestories, the doors, the frame walls, the baskets' sides (envelope) */
export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  // the slits: clear glass, frosted glass or concrete, never empty [documented]. The frosted glass and the canvas are drawn as
  // lit panels, so at dusk they glow with the rooms' light behind them (spec 081's Behavior) [assumed: how they're drawn]
  for (const r of SLAB_RUNS) {
    b.newGroup();
    const fill = (x: number, z: number) => { const c = runCell(r, x, z); return slabPart(r, c) === 'slit' ? slitFill(r, c) : null; };
    runBox(b, r, 0, Y.SLAB_TOP, { kind: 'glass', unit: Y.SLAB_TOP, color: GLASS, mask: (x, z) => fill(x, z) === 'clear' });
    runBox(b, r, 0, Y.SLAB_TOP, { kind: 'light', unit: Y.SLAB_TOP, color: FROSTED, mask: (x, z) => fill(x, z) === 'frosted' });
    runBox(b, r, 0, Y.SLAB_TOP, { kind: 'tile', unit: Y.SLAB_TOP, color: JOINT, mask: (x, z) => fill(x, z) === 'concrete' });
    // the doors: laminated boards [documented], and redwood boards over them to the roof [assumed]
    runBox(b, r, 0, Y.BEAM, { kind: 'tile', unit: Y.BEAM, color: REDWOOD, mask: (x, z) => inDoor(r, runCell(r, x, z)) });
    runBox(b, r, Y.BEAM + 1, Y.SLAB_TOP, { kind: 'tile', color: REDWOOD, mask: (x, z) => inDoor(r, runCell(r, x, z)) });
  }
  // the patio walls: in each bay between posts a sliding canvas panel [documented: 1922] or glass in horizontal bands with
  // redwood bars [documented: "a series of horizontal glass panels"]; the doors; the clerestory above the beam line [documented]
  for (const r of [...SCREEN_RUNS, FRAME_RUNS[0]]) {
    b.newGroup();
    const part = (x: number, z: number) => screenPart(r, runCell(r, x, z));
    const canvas = (x: number, z: number) => part(x, z) === 'canvas' && r.id !== 'north-entrance';
    const glass = (x: number, z: number) => part(x, z) === 'glass' || (part(x, z) === 'canvas' && r.id === 'north-entrance');
    runBox(b, r, 0, Y.BEAM, { kind: 'light', unit: Y.BEAM, color: CANVAS, mask: (x, z) => canvas(x, z) && !inChimney(x, z) });
    const bars = (y: number) => GLAZING_BARS.includes(y);
    let y0 = 0;
    for (const y of [...GLAZING_BARS, Y.BEAM]) {
      runBox(b, r, y0, y, { kind: 'glass', unit: y - y0, color: GLASS, mask: (x, z) => glass(x, z) && !inChimney(x, z) });
      if (bars(y)) runBox(b, r, y, y + 1, { kind: 'plate', color: REDWOOD, mask: (x, z) => glass(x, z) && !inChimney(x, z) });
      y0 = y + 1;
    }
    runBox(b, r, 0, Y.BEAM, { kind: 'tile', unit: Y.BEAM, color: REDWOOD, mask: (x, z) => part(x, z) === 'door' });
    runBox(b, r, Y.BEAM + 1, Y.SLAB_TOP, {
      kind: 'glass', unit: Y.SLAB_TOP - Y.BEAM - 1, color: GLASS, mask: (x, z, y) => part(x, z) !== 'post' && !inChimney(x, z) && y < wallTop(x, z),
    });
  }
  // the frame partitions: redwood boards to the ceiling, the doorways open [assumed: the 1922 partitions' finish]
  for (const r of FRAME_RUNS.slice(1)) {
    b.newGroup();
    runBox(b, r, 0, Y.SLAB_TOP, {
      kind: 'tile', unit: 5, color: REDWOOD,
      mask: (x, z, y) => !inChimney(x, z) && y < wallTop(x, z) && !(inDoor(r, runCell(r, x, z)) && y < Y.BEAM),
    });
  }
  // the baskets' sides: redwood boards from the floor up to the roof, then canvas rolled half down from the beams [documented:
  // canvas sides; how far down assumed]; open where the stairs arrive
  for (const basket of BASKETS) {
    b.newGroup();
    const side = (x: number, z: number) => basketEdge(basket, x, z) && !inAny(x, z, BASKET_GAPS);
    for (const r of basket) {
      b.box(r[0], r[1], r[2], r[3], Y.BASKET_FLOOR, Y.ROOF, { kind: 'tile', color: REDWOOD, mask: side });
      b.box(r[0], r[1], r[2], r[3], Y.BASKET_TOP - 6, Y.BASKET_TOP - 1, { kind: 'tile', unit: 5, color: CANVAS, mask: side });
    }
  }
}

/** the roof's area: the house and 1 ft of overhang [scaled: sheet 4's outline overhangs the walls] */
export const underRoof = (x: number, z: number) => {
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (inHouse(x + dx, z + dz)) return true;
  return false;
};
const roofEdge = (x: number, z: number) => underRoof(x, z) && (!underRoof(x - 1, z) || !underRoof(x + 1, z) || !underRoof(x, z - 1) || !underRoof(x, z + 1));
/** beside the lower roofs the cornice is three boards [documented] */
const nearLower = (x: number, z: number) => LOWER_ROOFS.some((r) => inRect(x, z, [r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]));

/** the flat roof, the cornice, the lower roofs, the skylights, the chimney tops and the baskets' tops (roof) */
export function buildRoof(b: Builder) {
  b.setPhase(P.ROOF);
  const [x0, z0, x1, z1] = [-1, -1, 80, 79];
  const open = (x: number, z: number) => inBasket(x, z) || inChimney(x, z) || inAny(x, z, SKYLIGHTS);
  // the 7″ tongue-and-groove roof boards, the ceilings below [documented], and the green rolled roofing over them [documented]
  b.newGroup();
  b.box(x0, z0, x1, z1, Y.SLAB_TOP, Y.SLAB_TOP + 1, { kind: 'plate', color: REDWOOD, mask: (x, z) => underRoof(x, z) && !roofEdge(x, z) && !open(x, z) });
  b.newGroup();
  b.box(x0, z0, x1, z1, Y.SLAB_TOP + 1, Y.ROOF, { kind: 'plate', color: ROOFING, mask: (x, z) => underRoof(x, z) && !roofEdge(x, z) && !open(x, z) });
  // the redwood board cornice round the edge [documented]; three boards high beside the clerestories [documented]
  b.newGroup();
  b.box(x0, z0, x1, z1, Y.SLAB_TOP, Y.ROOF + 1, {
    kind: 'tile', color: REDWOOD, mask: (x, z, y) => roofEdge(x, z) && !inBasket(x, z) && !inChimney(x, z) && (y < Y.ROOF || nearLower(x, z)),
  });
  // the skylights [scaled]
  b.newGroup();
  for (const s of SKYLIGHTS) b.box(s[0], s[1], s[2], s[3], Y.SLAB_TOP, Y.ROOF, { kind: 'glass', unit: 2, color: GLASS });
  // the lower roofs over the patio sides, below the clerestories [scaled]: green roofing with a redwood edge
  b.newGroup();
  for (const r of LOWER_ROOFS)
    b.box(r[0], r[1], r[2], r[3], Y.LOWER_ROOF - 1, Y.LOWER_ROOF, {
      kind: 'plate', color: (x, _y, z) => (x === r[0] || x === r[2] - 1 || z === r[1] || z === r[3] - 1 ? REDWOOD : ROOFING),
    });
  // the chimneys' tops: a concrete cap [assumed]
  b.newGroup();
  for (const c of CHIMNEYS) b.box(c.rect[0], c.rect[1], c.rect[2], c.rect[3], c.top, c.top + 1, { kind: 'plate', color: CONCRETE });
  const [dx0, dz0] = [Math.floor(DIAMOND.x - DIAMOND.r), Math.floor(DIAMOND.z - DIAMOND.r)];
  b.box(dx0, dz0, dx0 + 2 * DIAMOND.r + 1, dz0 + 2 * DIAMOND.r + 2, Y.CHIMNEY_45, Y.CHIMNEY_45 + 1, { kind: 'plate', color: CONCRETE, mask: inDiamond });
  // the baskets' tops: canvas stretched over the mitred beams [assumed: spec 081 Q1's "canvas or open top"]
  for (const basket of BASKETS) {
    b.newGroup();
    for (const r of basket) b.box(r[0], r[1], r[2], r[3], Y.BASKET_TOP, Y.BASKET_TOP + 1, { kind: 'plate', color: CANVAS });
  }
}

export { inHouse };
