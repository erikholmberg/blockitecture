/**
 * The Eames House's structure (spec 010b): the retaining wall, the slab, the steel frame of thin H-columns on the
 * 7′4″ module, the open-web roof joists and decks, the mezzanine and studio loft decks.
 * Steel was originally neutral grey and later painted black (sources), so it's black here.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  CARPORT, COURT, DEPTH, HOIST, inRect, MEZZANINE, PATIO, RESIDENCE, RESIDENCE_BAYS, STAIR, STUDIO, STUDIO_BAYS, STUDIO_LOFT, WALK,
  WALL_WINGS, WALL_X, WALL_Z, X_EAST, X_WEST, Y, Z,
} from './layout';

const STEEL = C.black;

/** the bay lines of a pavilion, with the last line pulled inside its end */
const lines = ([a, b]: readonly [number, number]) =>
  Array.from({ length: b - a + 1 }, (_, i) => (i === b - a ? Z[b] - 1 : Z[a + i]));

export function buildRetainingWall(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const concrete = (x: number, y: number, z: number) => ((x * 3 + z + y) % 7 === 0 ? C.concreteDark : C.concrete);
  // the straight run: 9 in thick (one stud), 8 ft high
  b.box(WALL_X - 1, WALL_Z[0], WALL_X, WALL_Z[1] + 1, 0, Y.WALL_TOP, { kind: 'brick', color: concrete, studs: false });
  // the angled wings, stepped one stud at a time
  for (const { from, to } of WALL_WINGS) {
    const n = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
    for (let i = 1; i <= n; i++) {
      const x = Math.round(from[0] - 1 + ((to[0] - from[0]) * i) / n), z = Math.round(from[1] + ((to[1] - from[1]) * i) / n);
      b.box(x, z, x + 1, z + 1, 0, Y.WALL_TOP, { kind: 'brick', color: concrete, studs: false });
    }
  }
}

export function buildSlabs(b: Builder) {
  b.setPhase(P.FOUNDATION);
  for (const r of [STUDIO, RESIDENCE, PATIO])
    b.box(r[0], r[1], r[2], r[3], 0, Y.FLOOR, { kind: 'plate', color: C.concreteDark });
  b.setPhase(P.FLOOR);
  // the courtyard, the walkway along the east facade and the carport: concrete pavers
  const pavers = (x: number, _y: number, z: number) => ((x >> 1) + (z >> 1)) % 2 === 0 ? C.concrete : C.beige;
  for (const r of [COURT, WALK, CARPORT]) b.box(r[0], r[1], r[2], r[3], 0, Y.FLOOR, { kind: 'tile', color: pavers });
}

export function buildFrame(b: Builder) {
  b.setPhase(P.STEEL);
  for (const bays of [STUDIO_BAYS, RESIDENCE_BAYS]) {
    const zs = lines(bays);
    for (const z of zs)
      for (const x of [X_WEST, X_EAST]) {
        b.newGroup();
        b.box(x, z, x + 1, z + 1, Y.FLOOR, Y.ROOF_UNDER, { kind: 'brick', color: STEEL, studs: false });
      }
    // perimeter edge beams at the roof, and the horizontal rail at 8′1″ along both long facades
    const z0 = Z[bays[0]], z1 = Z[bays[1]];
    b.newGroup();
    for (const x of [X_WEST, X_EAST]) {
      b.box(x, z0, x + 1, z1, Y.ROOF_UNDER - 1, Y.ROOF_UNDER, { kind: 'plate', color: STEEL });
      b.box(x, z0, x + 1, z1, Y.RAIL, Y.RAIL + 1, { kind: 'plate', color: STEEL });
    }
    for (const z of [z0, z1 - 1]) b.box(X_WEST, z, DEPTH, z + 1, Y.ROOF_UNDER - 1, Y.ROOF_UNDER, { kind: 'plate', color: STEEL });
  }
}

export function buildDecks(b: Builder) {
  b.setPhase(P.ROOF);
  for (const bays of [STUDIO_BAYS, RESIDENCE_BAYS]) {
    const z0 = Z[bays[0]], z1 = Z[bays[1]];
    // open-web joists across the house at every bay line, just under the deck
    b.newGroup();
    for (const z of lines(bays)) b.box(X_WEST + 1, z, X_EAST, z + 1, Y.ROOF_UNDER - 1, Y.ROOF_UNDER, { kind: 'plate', color: C.darkGray });
    // the corrugated steel deck, exposed and painted white inside; white gravel on top; a black curb at the edge
    b.newGroup();
    b.box(X_WEST, z0, DEPTH, z1, Y.ROOF_UNDER, Y.ROOF_UNDER + 1, { kind: 'plate', color: C.white });
    b.box(X_WEST, z0, DEPTH, z1, Y.ROOF_UNDER + 1, Y.ROOF_TOP, {
      kind: 'tile',
      color: (x, _y, z) => ((x * 5 + z * 3) % 11 === 0 ? C.lightGray : C.offWhite),
    });
    const curb = (x: number, z: number) => x === X_WEST || x === DEPTH - 1 || z === z0 || z === z1 - 1;
    b.box(X_WEST, z0, DEPTH, z1, Y.ROOF_TOP, Y.ROOF_TOP + 1, { kind: 'plate', color: STEEL, mask: curb });
  }
  // the residence mezzanine and the studio loft: decks at 8 ft, built with the frame (spec 012: before the interior)
  b.setPhase(P.STEEL);
  b.newGroup();
  for (const r of [MEZZANINE, STUDIO_LOFT])
    b.box(X_WEST + 1, r[1], X_EAST, r[3], Y.MEZZ, Y.MEZZ_FLOOR, {
      kind: 'plate', color: C.white, mask: (x, z) => !inRect(x, z, STAIR) && !inRect(x, z, HOIST),
    });
}
