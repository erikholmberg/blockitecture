/**
 * The Atelier Brancusi (spec 080): the one-storey building at the piazza's north-west corner, on OSM's way 55503399 [documented:
 * its outline, one level, a gabled roof (OSM)]. Everything else about it is [assumed]: a plain pale exterior on a plinth that
 * takes up the piazza's slope, a band of glass, and the gabled roof, its ridge along its longer side.
 */
import { inPoly } from '@/engine/lot';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BRANCUSI, siteTop } from './site';

const xs = BRANCUSI.map((p) => p[0]), zs = BRANCUSI.map((p) => p[1]);
export const B_BOX = [Math.floor(Math.min(...xs)), Math.floor(Math.min(...zs)), Math.ceil(Math.max(...xs)) + 1, Math.ceil(Math.max(...zs)) + 1];
export const inside = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, BRANCUSI);
const edge = (x: number, z: number) => inside(x, z) && (!inside(x + 1, z) || !inside(x - 1, z) || !inside(x, z + 1) || !inside(x, z - 1));
/** its floor: level with the highest ground under it [assumed] */
export const B_FLOOR = (() => {
  let m = -Infinity;
  for (let z = B_BOX[1]; z < B_BOX[3]; z++) for (let x = B_BOX[0]; x < B_BOX[2]; x++) if (inside(x, z)) m = Math.max(m, siteTop(x, z) + 1);
  return m;
})();
/** one storey: 4.4 m to the eaves [assumed] */
export const B_WALL = 36;
const along = B_BOX[2] - B_BOX[0] >= B_BOX[3] - B_BOX[1];
const STONE = 0xe1dccf;
const ROOF = 0x8d9296;

/** its plinth and floor (floor) */
export function buildBrancusiFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  let lo = Infinity;
  for (let z = B_BOX[1]; z < B_BOX[3]; z++) for (let x = B_BOX[0]; x < B_BOX[2]; x++) if (inside(x, z)) lo = Math.min(lo, siteTop(x, z));
  // in whole bricks down from the floor, as deep as the ground under each cell allows
  for (let y = B_FLOOR - 3; y + 3 > lo; y -= 3)
    b.box(B_BOX[0], B_BOX[1], B_BOX[2], B_BOX[3], y, y + 3, {
      kind: 'brick', sizes: [[16, 16], [16, 8], [8, 8], [16, 4], [8, 4], [4, 4], [16, 2], [8, 2], [4, 2], [2, 2], [16, 1], [8, 1], [4, 1], [2, 1], [1, 1]],
      color: 0xb9b2a5, mask: (x, z) => inside(x, z) && y >= siteTop(x, z),
    });
}

/** its walls, with a band of glass (envelope) */
export function buildBrancusiWalls(b: Builder) {
  b.newGroup();
  const sizes = [[16, 1], [8, 1], [4, 1], [2, 1], [1, 1]];
  const [x0, z0, x1, z1] = B_BOX;
  b.box(x0, z0, x1, z1, B_FLOOR, B_FLOOR + 12, { kind: 'brick', unit: 12, sizes, color: STONE, mask: edge });
  b.box(x0, z0, x1, z1, B_FLOOR + 12, B_FLOOR + 28, { kind: 'glass', unit: 16, sizes, color: 0xbcd3db, mask: edge });
  b.box(x0, z0, x1, z1, B_FLOOR + 28, B_FLOOR + B_WALL, { kind: 'brick', unit: B_WALL - 28, sizes, color: STONE, mask: edge });
}

/** its gabled roof, a plate a step up to the ridge (roof) */
export function buildBrancusiRoof(b: Builder) {
  b.newGroup();
  const [x0, z0, x1, z1] = B_BOX;
  const mid = along ? (z0 + z1) / 2 : (x0 + x1) / 2, half = along ? (z1 - z0) / 2 : (x1 - x0) / 2;
  for (let k = 0; ; k++) {
    const reach = half + 1 - k * 2;
    if (reach <= 1) break;
    b.box(x0, z0, x1, z1, B_FLOOR + B_WALL + k, B_FLOOR + B_WALL + k + 1, {
      kind: 'tile', sizes: [[32, 32], [32, 16], [16, 16], [32, 8], [16, 8], [8, 8], [32, 4], [16, 4], [8, 4], [4, 4], [32, 2], [16, 2], [8, 2], [4, 2], [2, 2], [16, 1], [8, 1], [4, 1], [2, 1], [1, 1]],
      color: ROOF, mask: (x, z) => inside(x, z) && Math.abs((along ? z : x) + 0.5 - mid) < reach,
    });
  }
}
