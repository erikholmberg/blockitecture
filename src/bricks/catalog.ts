/** Units: 1 world unit = 1 stud (~1 ft at minifig-ish scale). Heights are counted in plates. */
export const PLATE = 0.4;

export type Kind =
  | 'brick' // studded box
  | 'plate' // studded thin box
  | 'tile' // smooth box (no studs)
  | 'round' // cylinder with stud
  | 'bar' // thin cylinder, no stud
  | 'glass' // transparent panel
  | 'water' // transparent block
  | 'light' // emissive box
  | 'lamp'; // emissive sphere

export interface Brick {
  x: number; // min corner, studs
  y: number; // min corner, plates
  z: number;
  w: number; // size along x (studs)
  d: number; // size along z (studs)
  h: number; // height (plates)
  color: number;
  kind: Kind;
  phase: number;
  group: number;
  studs: boolean;
  /** for glass panels: which axis is thin (0 = x, 2 = z) */
  thin?: 0 | 2;
  /** hangs from the ceiling: built after the solid pieces of its phase, top-down (spec 002) */
  hangs?: true;
}

export const C = {
  white: 0xf4f4f4,
  offWhite: 0xe9e6dc,
  lightGray: 0xa0a5a9,
  midGray: 0x8a8e8c,
  darkGray: 0x6c6e68,
  steel: 0x3a4148,
  black: 0x222426,
  tan: 0xe4cd9e,
  beige: 0xd9d0bc,
  concrete: 0xc9c3b5,
  concreteDark: 0x9c978b,
  darkTan: 0x958a73,
  dirt: 0x7d6a52,
  rock: 0x8b8378,
  nougat: 0xd09168,
  wood: 0xa0673f,
  darkWood: 0x6b3f22,
  reddishBrown: 0x582a12,
  green: 0x237841,
  brightGreen: 0x4b9f4a,
  limeGreen: 0x8fb43a,
  olive: 0x8d8b4f,
  darkGreen: 0x184632,
  sandGreen: 0x8fae9a,
  poolTile: 0x6fc6d8,
  poolDeep: 0x3c9ebd,
  water: 0x7fd8ea,
  glass: 0xdff1f5,
  pink: 0xf2a6c4,
  orange: 0xe8892c,
  yellow: 0xf2cd37,
  red: 0xc91a09,
  darkRed: 0x8a1c1c,
  teal: 0x13a3a3,
  turquoise: 0x48c2c0,
  sandBlue: 0x6f8fb0,
  darkBlue: 0x1f3a63,
  blueTile: 0x9fc3dd,
  warmLight: 0xfff0c8,
  fire: 0xff8a2a,
  asphalt: 0x4a4c4e,
};

export const PHASES: { name: string; dur: number; order: 'layer' | 'group' }[] = [
  { name: 'Shaping the hillside', dur: 24, order: 'layer' },
  { name: 'Foundations & pool basin', dur: 18, order: 'layer' },
  { name: 'Floor slab & terrace', dur: 18, order: 'layer' },
  { name: 'Steel frame', dur: 24, order: 'layer' },
  // interior goes in while the frame is still open, so it can be watched (spec 002)
  { name: 'Interior & furniture', dur: 52, order: 'group' },
  { name: 'Glass & walls', dur: 30, order: 'layer' },
  { name: 'Roof deck', dur: 24, order: 'layer' },
  { name: 'Pool, garden & finishing touches', dur: 34, order: 'group' },
];

export const P = {
  SITE: 0,
  FOUNDATION: 1,
  FLOOR: 2,
  STEEL: 3,
  INTERIOR: 4,
  ENVELOPE: 5,
  ROOF: 6,
  LANDSCAPE: 7,
};

const BRICK_SIZES = [
  [8, 2], [6, 2], [4, 2], [3, 2], [2, 2],
  [8, 1], [6, 1], [4, 1], [3, 1], [2, 1], [1, 1],
];
const PLATE_SIZES = [
  [16, 8], [12, 8], [8, 8], [10, 6], [8, 6], [6, 6], [8, 4], [6, 4], [4, 4],
  [8, 2], [6, 2], [4, 2], [3, 2], [2, 2], [8, 1], [6, 1], [4, 1], [3, 1], [2, 1], [1, 1],
];
const TILE_SIZES = [
  [8, 4], [6, 6], [6, 4], [4, 4], [8, 2], [6, 2], [4, 2], [3, 2], [2, 2],
  [8, 1], [6, 1], [4, 1], [3, 1], [2, 1], [1, 1],
];
export const TERRAIN_SIZES = [
  [8, 8], [8, 6], [6, 6], [8, 4], [6, 4], [4, 4], [8, 2], [6, 2], [4, 2], [3, 2], [2, 2],
  [6, 1], [4, 1], [3, 1], [2, 1], [1, 1],
];
export const BIG_SIZES = [
  [32, 32], [32, 16], [24, 24], [24, 16], [20, 20], [16, 16], [16, 8], [12, 8], [8, 8],
  [8, 4], [6, 4], [4, 4], [4, 2], [2, 2], [4, 1], [2, 1], [1, 1],
];

export const SIZES: Record<Kind, number[][]> = {
  brick: BRICK_SIZES,
  plate: PLATE_SIZES,
  tile: TILE_SIZES,
  round: [[1, 1]],
  bar: [[1, 1]],
  glass: [[4, 1], [3, 1], [2, 1], [1, 1]],
  water: BIG_SIZES,
  light: TILE_SIZES,
  lamp: [[1, 1]],
};

export const KIND_UNIT: Record<Kind, number> = {
  brick: 3, plate: 1, tile: 1, round: 3, bar: 3, glass: 6, water: 1, light: 1, lamp: 3,
};

export const KIND_STUDS: Record<Kind, boolean> = {
  brick: true, plate: true, tile: false, round: true, bar: false,
  glass: false, water: false, light: false, lamp: false,
};
