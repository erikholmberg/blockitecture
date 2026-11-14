/**
 * The garage at the foot of the drive (spec 078 Q5): "two cars, a shallow shed roof, white vertical siding" [documented: the
 * nomination], on OSM's outline (way 1490862339, 25.6 × 17.3 ft, turned 33° to the house's grid) [documented]. Exterior only:
 * the visitor centre inside is out of scope. Its height and the doors' size are [assumed]; its two overhead doors face the road
 * and the drive's foot [assumed].
 */
import { segDist } from '@/engine/lot';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { GREY, SIDING } from './house';
import { GARAGE_RING, GARAGE_Y, inGarage } from './site';

const CONCRETE = 0xc9c3b5;
const DOOR = 0xe2dfd6;
const ROOFING = 0x5e5b56;
const xs = GARAGE_RING.map((p) => p[0]), zs = GARAGE_RING.map((p) => p[1]);
const BOX = [Math.floor(Math.min(...xs)), Math.floor(Math.min(...zs)), Math.ceil(Math.max(...xs)) + 1, Math.ceil(Math.max(...zs)) + 1] as const;
/** the cells of the garage */
export const GARAGE_CELLS: [number, number][] = [];
for (let z = BOX[1]; z < BOX[3]; z++) for (let x = BOX[0]; x < BOX[2]; x++) if (inGarage(x, z)) GARAGE_CELLS.push([x, z]);
const edge = (x: number, z: number) => !inGarage(x - 1, z) || !inGarage(x + 1, z) || !inGarage(x, z - 1) || !inGarage(x, z + 1);
/** its long north side, toward the road: OSM's first edge */
const [A, B] = [GARAGE_RING[0], GARAGE_RING[1]];
const onDoorSide = (x: number, z: number) => edge(x, z) && segDist(x + 0.5, z + 0.5, A, B) < 1.6;
const along = (x: number, z: number) => ((x + 0.5 - A[0]) * (B[0] - A[0]) + (z + 0.5 - A[1]) * (B[1] - A[1])) / Math.hypot(B[0] - A[0], B[1] - A[1]);
const LEN = Math.hypot(B[0] - A[0], B[1] - A[1]);
/** the two doors: 8 ft each, either side of a middle post [assumed] */
export const garageDoor = (x: number, z: number) => {
  if (!onDoorSide(x, z)) return false;
  const u = along(x, z);
  return (u > 2.5 && u < 11) || (u > LEN - 11 && u < LEN - 2.5);
};
/** across the garage from its door side: the shed roof falls toward the back [assumed] */
const across = (x: number, z: number) => segDist(x + 0.5, z + 0.5, A, B);

const G0 = GARAGE_Y, WALL = 21, DOOR_H = 17;
const box = (b: Builder, y0: number, y1: number, o: Parameters<Builder['box']>[6]) => b.box(BOX[0], BOX[1], BOX[2], BOX[3], y0, y1, o);

/** its concrete pad (foundation) */
export function garageFoundation(b: Builder) {
  b.setPhase(P.FOUNDATION);
  box(b, G0, G0 + 1, { kind: 'plate', color: CONCRETE, mask: inGarage });
}
/** its corner posts (structure) */
export function garageStructure(b: Builder) {
  b.setPhase(P.STRUCTURE);
  for (const [x, z] of GARAGE_CELLS) {
    const corner = [GARAGE_RING[0], GARAGE_RING[1], GARAGE_RING[2], GARAGE_RING[3]].some(([cx, cz]) => Math.hypot(x + 0.5 - cx, z + 0.5 - cz) < 1.6);
    if (corner && edge(x, z) && b.free(x, z, G0 + 1, G0 + 1 + WALL)) b.add(x, z, G0 + 1, 1, 1, WALL, SIDING, 'brick');
  }
}
/** its white siding and the two doors (envelope) */
export function garageEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  box(b, G0 + 1, G0 + 1 + DOOR_H, { kind: 'tile', unit: DOOR_H, color: DOOR, mask: (x, z) => garageDoor(x, z) });
  box(b, G0 + 1 + DOOR_H, G0 + 2 + DOOR_H, { kind: 'plate', color: GREY, mask: (x, z) => garageDoor(x, z) });
  box(b, G0 + 1, G0 + 1 + WALL, { kind: 'brick', unit: 7, sizes: [[1, 1]], color: SIDING, mask: (x, z) => edge(x, z) && inGarage(x, z) });
}
/** its shallow shed roof (roof) */
export function garageRoof(b: Builder) {
  b.setPhase(P.ROOF);
  box(b, G0 + 1 + WALL, G0 + 2 + WALL, { kind: 'plate', color: ROOFING, mask: inGarage });
  box(b, G0 + 2 + WALL, G0 + 3 + WALL, { kind: 'plate', color: ROOFING, mask: (x, z) => inGarage(x, z) && across(x, z) < 9 });
}
