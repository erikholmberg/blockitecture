/**
 * Fallingwater's roofs (spec 017): the main roof over the third floor, the long canopy over the second-floor bedrooms
 * that reaches east over the east terrace (its only canopy), the trellis beams over the drive (bent around two trees),
 * the folded concrete canopy stepping up the hill over the walkway, the guest wing's roof, and the ceiling lights.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { CANOPY, DRIVE_TRELLIS, GUEST_WINGS, ROOF, TRELLIS_TREES, WALK_HALF, Y } from './layout';
import { stepTop, walkwayAt, WALL_Z } from './site';
import { CHEROKEE, GUEST_TOP, OCHRE } from './structure';

/** a flat concrete roof over `r` from y0 to top, with a deep band around its edge */
function flatRoof(b: Builder, r: [number, number, number, number], y0: number, top: number) {
  b.newGroup();
  b.box(r[0], r[1], r[2], r[3], y0, top - 1, { kind: 'brick', color: OCHRE });
  b.box(r[0] + 1, r[1] + 1, r[2] - 1, r[3] - 1, top - 1, top, { kind: 'tile', color: C.concrete });
  // the band: one plate proud of the roof all round
  const edge = (x0: number, z0: number, x1: number, z1: number) => b.box(x0, z0, x1, z1, top - 1, top + 1, { kind: 'brick', color: OCHRE, unit: 2 });
  edge(r[0], r[1], r[2], r[1] + 1); edge(r[0], r[3] - 1, r[2], r[3]);
  edge(r[0], r[1] + 1, r[0] + 1, r[3] - 1); edge(r[2] - 1, r[1] + 1, r[2], r[3] - 1);
}

export function buildRoofs(b: Builder) {
  b.setPhase(P.ROOF);
  // the main roof [documented: 24′-11½″ on sheet 10]
  flatRoof(b, ROOF, Y.ROOF - 4, Y.ROOF);
  // the long canopy at the third level: the bedrooms' roof, reaching east over the east terrace [documented: sheet 6]
  for (const r of CANOPY) flatRoof(b, r, Y.L3 - 5, Y.L3 - 2);

  // the trellis over the drive: concrete beams from the house's north wall to the retaining wall, every 4 ft, bent around
  // the trees that stood there [documented: sheet 4]
  b.newGroup();
  const beamY = 18;
  for (let x = DRIVE_TRELLIS[0] + 2; x < DRIVE_TRELLIS[2]; x += 4)
    for (let z = WALL_Z; z < (x < 66 ? 19 : DRIVE_TRELLIS[3]); z++) {
      const nearTree = TRELLIS_TREES.some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 2);
      if (nearTree) continue;
      b.box(x, z, x + 1, z + 1, beamY, beamY + 2, { kind: 'brick', color: OCHRE, unit: 2 });
    }
  // where a beam meets a tree it bends around it: a short beam on each side
  for (const [tx, tz] of TRELLIS_TREES)
    for (const dz of [-2, 2]) b.box(tx - 3, tz + dz, tx + 4, tz + dz + 1, beamY, beamY + 2, { kind: 'brick', color: OCHRE, unit: 2 });
  // a cross beam along the north wall to carry them
  b.box(DRIVE_TRELLIS[0], WALL_Z, DRIVE_TRELLIS[2], WALL_Z + 1, beamY, beamY + 2, { kind: 'brick', color: OCHRE, unit: 2 });

  // the folded canopy over the walkway: a slab 8 ft over each tread, on posts along its outer edge [documented]
  b.newGroup();
  for (let z = -70; z < WALL_Z; z++)
    for (let x = 15; x < 65; x++) {
      const w = walkwayAt(x, z);
      if (w.d > WALK_HALF + 1.5) continue;
      const top = stepTop(w.s) + 22;
      b.box(x, z, x + 1, z + 1, top - 2, top, { kind: 'brick', color: OCHRE, unit: 2 });
    }
  // its posts, Cherokee red, every few feet along the outer (west) edge
  for (let z = -66; z < WALL_Z; z += 6)
    for (let x = 15; x < 65; x++) {
      const w = walkwayAt(x, z);
      if (Math.abs(w.d - WALK_HALF) > 0.5) continue; // the outermost tread cell: scanning from the west, the first found
      const top = stepTop(w.s);
      b.column(x, z, top, top + 20, CHEROKEE, 'bar');
      break;
    }

  // the guest wing's roof, with overhangs [assumed: photographs]
  for (const r of GUEST_WINGS) flatRoof(b, [r[0] - 2, r[1] - 1, r[2] + 2, r[3] + 3], GUEST_TOP, GUEST_TOP + 3);

  // ceiling lights hung from the trays: the living room, the bedrooms, the study [assumed: recessed lights in the ceilings]
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[40, 40], [46, 56], [36, 26], [56, 36]]) b.add(x, z, Y.L2 - 6, 2, 1, 1, C.warmLight, 'light');
    for (const [x, z] of [[37, 36], [59, 38]]) b.add(x, z, Y.L3 - 6, 2, 1, 1, C.warmLight, 'light');
    b.add(23, 19, Y.ROOF - 5, 2, 1, 1, C.warmLight, 'light');
  });
}
