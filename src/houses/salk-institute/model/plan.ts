/**
 * The Salk Institute's plan, cell by cell (spec 079): what stands on each stud of both wings, worked out once so the walls can be
 * laid band by band. Pure. Sources and marks: layout.ts and site.ts.
 */
import { BLOCK, fold, inAny, inRect, OUTER_TOWERS, STOREYS, StoreyKind, Y } from './layout';
import { groundPlates, inBlock, inPit, inStudyTower, onLowerWall, onRing, platformTop, PLATFORM, wallTop } from './site';

/** the plan's bounding box (studs): both wings, their light wells' walls and the lower level */
export const BX0 = -1, BX1 = 364, BZ0 = -199, BZ1 = 199;
const W = BX1 - BX0, D = BZ1 - BZ0;

export const C = {
  NONE: 0,
  BLOCK_WALL: 1, // the lab block's outer walls
  INNER_WALL: 2, // the walls between the labs and the ends
  BLOCK_IN: 3,
  TOWER_WALL: 4, // the outer towers' walls
  TOWER_IN: 5,
  RING: 6, // the pits' retaining walls
  LOWER_WALL: 7, // the wall down to the lower level
  STUDY: 8, // a study tower's plan
  PIT: 9,
} as const;

export const code = new Uint8Array(W * D);
/** for an outer wall: its outward direction (0: none, 1: −x, 2: +x, 3: −z, 4: +z), 8 if it's a corner */
export const face = new Uint8Array(W * D);
/** the finished ground's top (plates), where nothing is built */
export const ground = new Int16Array(W * D);
/** a wall's top (plates), for the retaining walls */
export const top = new Int16Array(W * D);

const inOuter = (x: number, z: number) => { const f = fold(z); return inRect(x, f, BLOCK) || inAny(x, f, OUTER_TOWERS); };
const DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

for (let iz = 0; iz < D; iz++)
  for (let ix = 0; ix < W; ix++) {
    const x = ix + BX0, z = iz + BZ0, k = iz * W + ix, f = fold(z);
    let c: number = C.NONE;
    if (inBlock(x, z)) {
      if (inRect(x, f, BLOCK)) {
        const out = DIRS.map(([dx, dz]) => !inOuter(x + dx, z + dz));
        const n = out.filter(Boolean).length;
        // the block's outer row behind an outer tower stays a wall too (between the lab and the tower's shaft)
        if (n > 0 || f === BLOCK[3] - 1) {
          c = C.BLOCK_WALL;
          face[k] = n === 0 ? 0 : n > 1 ? 8 : out.indexOf(true) + 1;
        } else c = x === 50 || x === 321 ? C.INNER_WALL : C.BLOCK_IN;
      } else c = C.TOWER_IN; // the outer towers: their walls below
    } else if (inPit(x, z)) c = C.PIT;
    else if (onRing(x, z)) c = C.RING;
    else if (onLowerWall(x, z)) c = C.LOWER_WALL;
    else if (inStudyTower(x, z)) c = C.STUDY;
    code[k] = c;
    if (c === C.RING || c === C.LOWER_WALL) top[k] = wallTop(x, z);
    ground[k] = c === C.PIT ? Y.LOWEST : c === C.RING || c === C.LOWER_WALL ? top[k] : c === C.STUDY ? 0
      : x >= PLATFORM[0] && x < PLATFORM[2] && z >= PLATFORM[1] && z < PLATFORM[3] ? platformTop(x, z) : groundPlates(x, z);
  }
// an outer tower's walls: the cells of its rectangle on its edge, not against the block
for (const r of OUTER_TOWERS)
  for (const s of [1, -1])
    for (let x = r[0]; x < r[2]; x++)
      for (let fz = r[1]; fz < r[3]; fz++) {
        const z = s > 0 ? fz : -1 - fz, k = (z - BZ0) * W + (x - BX0);
        const edge = x === r[0] || x === r[2] - 1 || fz === r[3] - 1;
        if (edge) {
          code[k] = C.TOWER_WALL;
          const outs = DIRS.map(([dx, dz]) => !inOuter(x + dx, z + dz));
          const n = outs.filter(Boolean).length;
          face[k] = n === 0 ? 0 : n > 1 ? 8 : outs.indexOf(true) + 1;
        } else code[k] = C.TOWER_IN;
      }

export const idx = (x: number, z: number) => (x < BX0 || x >= BX1 || z < BZ0 || z >= BZ1 ? -1 : (z - BZ0) * W + (x - BX0));
export const codeAt = (x: number, z: number) => { const k = idx(x, z); return k < 0 ? C.NONE : code[k]; };

/** open air at a cell: above the finished ground, and not inside a building (a study tower counts as inside) */
export function openAir(x: number, y: number, z: number): boolean {
  const k = idx(x, z);
  if (k < 0) return y >= groundPlates(x, z);
  const c = code[k];
  if (c === C.BLOCK_WALL || c === C.INNER_WALL || c === C.BLOCK_IN || c === C.TOWER_WALL || c === C.TOWER_IN) return y >= Y.PARAPET;
  if (c === C.STUDY) return y >= Y.PARAPET;
  return y >= ground[k];
}
/** a cell's storey (index into STOREYS), or −1 */
export function storeyOf(y: number): number {
  for (let i = 0; i < STOREYS.length; i++) if (y >= STOREYS[i].y0 && y < STOREYS[i].y1) return i;
  return -1;
}
export const kindAt = (y: number): StoreyKind | null => { const s = storeyOf(y); return s < 0 ? null : STOREYS[s].kind; };
export { inBlock };
