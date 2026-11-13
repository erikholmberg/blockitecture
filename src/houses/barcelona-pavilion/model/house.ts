/**
 * The Barcelona Pavilion itself (spec 075): the travertine plinth with the pools' basins and the annex's base; its paving in
 * 2 × 1 module slabs and the stair; the eight chrome cruciform columns; the free-standing walls of travertine, Tinos and Alpine
 * green marble, the glass walls in their chrome frames and the closed annex; the two thin white roofs, with the red curtain
 * hanging from the main one. Layout and sourcing: layout.ts.
 */
import { TERRAIN_SIZES } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import {
  ANNEX, ANNEX_ROOF, BENCH, COLUMNS, inColumn, inRect, LARGE_POOL, M, MODULE, PANES, PLINTH, Rect, ROOF, SMALL_POOL, STAIR,
  STEPS, Stone, Tint, WALLS, Y,
} from './layout';
import { onPlinth } from './site';

/** Roman travertine [documented], in three close tones so the slabs read */
export const TRAVERTINE = [0xedd6a6, 0xe5cd9b, 0xf1dfb8];
export const STONES: Record<Stone, number[]> = {
  travertine: TRAVERTINE,
  tinos: [0x2e5646, 0x335c4b], // ancient green marble from Tinos, verde antico: dark [documented: the stone]
  alpine: [0x5f8b70, 0x6a9479], // green Alpine marble: lighter [documented: the stone]
  onyx: [0xd99a5e, 0xe3ad72, 0xcd8a52], // golden onyx from the Atlas, the 1986 slabs redder than the original's honey (Q1) [documented]
};
export const GLASS: Record<Tint, number> = {
  green: 0x86b39c, grey: 0xa3abae, black: 0x30353a, clear: 0xdff1f5, frosted: 0xf2f4f1,
};
/** chrome: the columns' cladding (stainless in 1986) and the glass's frames [documented] */
export const CHROME = 0xc9ced1;
/** the roofs' white render [documented: rendered, white] */
export const ROOF_WHITE = 0xf3f1ec;
const LINING = { large: 0x4f7d72, small: 0x15171a }; // the large pool's light green water [documented]; the small one's black glass [documented]

const SLAB_ROWS = Array.from({ length: 18 }, (_, m) => M(m));
/** the glass's mullions: every second module line [scaled: photographs show panes about 2.2 m wide] */
const LINES = new Set(Array.from({ length: 27 }, (_, k) => M(2 * k)));
/** the slab a cell belongs to: 2 modules (7 studs) along x by 1 module (3 or 4 studs) across [documented: 2.18 × 1.09 m] */
export const slabOf = (x: number, z: number) => {
  let row = 0;
  while (row + 1 < SLAB_ROWS.length && z >= SLAB_ROWS[row + 1]) row++;
  return [Math.floor(x / (2 * MODULE)), row] as const;
};
const slabColor = (x: number, _y: number, z: number) => {
  const [i, j] = slabOf(x, z);
  return TRAVERTINE[(i * 7 + j * 3 + ((i * j) & 1)) % 3];
};
const inPool = (x: number, z: number) => inRect(x, z, LARGE_POOL) || inRect(x, z, SMALL_POOL);
const near = (x: number, z: number, r: Rect) => inRect(x, z, [r[0] - 1, r[1] - 1, r[2] + 1, r[3] + 1]);

/** the plinth (foundation): solid travertine-faced, its top course the floor's; the pools' basins lined; the annex's base */
export function buildPlinth(b: Builder) {
  b.setPhase(P.FOUNDATION);
  const faced = (x: number, z: number) => !onPlinth(x - 1, z) || !onPlinth(x + 1, z) || !onPlinth(x, z - 1) || !onPlinth(x, z + 1);
  const color = (x: number, y: number, z: number) =>
    faced(x, z) ? TRAVERTINE[(Math.floor(x / 7) + Math.floor(z / 7) + Math.floor((y + 12) / 6)) % 2]
      : near(x, z, LARGE_POOL) ? LINING.large : near(x, z, SMALL_POOL) ? LINING.small : 0xb9ae96;
  b.newGroup();
  b.box(PLINTH[0], PLINTH[1], PLINTH[2], PLINTH[3], Y.GROUND - 1, Y.POOL_FLOOR - 1, { kind: 'brick', sizes: TERRAIN_SIZES, color, mask: (x, z) => onPlinth(x, z) });
  b.box(PLINTH[0], PLINTH[1], PLINTH[2], PLINTH[3], Y.POOL_FLOOR - 1, -1, { kind: 'brick', sizes: TERRAIN_SIZES, color, mask: (x, z) => onPlinth(x, z) && !inPool(x, z) });
  // the basins' floors: the large pool's pale green-grey, the small one's black glass [documented]
  b.newGroup();
  b.box(LARGE_POOL[0], LARGE_POOL[1], LARGE_POOL[2], LARGE_POOL[3], Y.POOL_FLOOR - 1, Y.POOL_FLOOR, { kind: 'tile', color: LINING.large });
  b.box(SMALL_POOL[0], SMALL_POOL[1], SMALL_POOL[2], SMALL_POOL[3], Y.POOL_FLOOR - 1, Y.POOL_FLOOR, { kind: 'tile', color: LINING.small });
  // the annex's base where it reaches back beyond the plinth, up to the plinth's top [documented: OSM; its base assumed]
  b.newGroup();
  b.box(ANNEX[0], PLINTH[3], ANNEX[2], ANNEX[3], -3, 0, { kind: 'brick', color: TRAVERTINE[1] });
}

/** the paving (floor): travertine slabs over the whole plinth but the pools [documented], and the 8-step stair [documented] */
export function buildFloor(b: Builder) {
  b.setPhase(P.FLOOR);
  b.newGroup();
  b.box(PLINTH[0], PLINTH[1], PLINTH[2], PLINTH[3], -1, 0, { kind: 'tile', color: slabColor, mask: (x, z) => onPlinth(x, z) && !inPool(x, z) });
  // the stair: 8 risers from the paving at its foot to the plinth's top, 2 studs a tread [the risers alternate 1 and 2 plates]
  b.newGroup();
  for (const [x0, top] of stairTreads())
    b.box(x0, STAIR[1], x0 + 2, STAIR[3], Y.GROUND - 1, top, { kind: 'brick', color: (x, y, z) => (y + 3 >= top ? TRAVERTINE[2] : TRAVERTINE[(x + z) & 1]) });
}
/** each tread's x and its top (plates): STEPS risers in all, the last onto the plinth */
export function stairTreads(): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k < STEPS - 1; k++) out.push([STAIR[0] + 2 * k, Y.GROUND + Math.round(((k + 1) * -Y.GROUND) / STEPS)]);
  return out;
}

/** the eight columns (structure): chrome crosses from the plinth into the roof [documented: cruciform, chrome-clad] */
export function buildColumns(b: Builder) {
  b.setPhase(P.STRUCTURE);
  for (const [cx, cz] of COLUMNS) {
    b.newGroup();
    // thin round bars, so the cross reads slender [documented: about 30 cm across; a stud is a little more]
    b.box(cx - 1, cz - 1, cx + 2, cz + 2, 0, Y.ROOF - 1, { kind: 'bar', color: CHROME, mask: (x, z) => inColumn(x, z) });
  }
}

/** the walls (envelope): stone, glass in chrome frames, the bench, the annex */
export function buildWalls(b: Builder) {
  b.setPhase(P.ENVELOPE);
  for (const w of WALLS) {
    b.newGroup();
    const [x0, z0, x1, z1] = w.r;
    const pal = STONES[w.stone];
    // [documented: the stones' slabs, book-matched; drawn as panels of 2 modules by 6 plates, one colour each]
    b.box(x0, z0, x1, z1, 0, Y.CEILING, { kind: 'brick', color: (x, y, z) => pal[(Math.floor((x + z) / 7) + Math.floor(y / 12)) % pal.length] });
  }
  // the travertine bench along the large court's back wall [documented], about 45 cm high [assumed]
  b.newGroup();
  b.box(BENCH[0], BENCH[1], BENCH[2], BENCH[3], 0, 4, { kind: 'brick', color: TRAVERTINE[2] });
  for (const p of PANES) {
    b.newGroup();
    const [x0, z0, x1, z1] = p.r;
    const along = x1 - x0 > z1 - z0;
    const mullion = (x: number, z: number) => {
      const u = along ? x : z, a = along ? x0 : z0, c = along ? x1 : z1;
      return u === a || u === c - 1 || LINES.has(u);
    };
    // the frames: chrome mullions on the module lines, a sill and a head [documented: thin chrome frames]
    b.box(x0, z0, x1, z1, 0, Y.CEILING, { kind: 'bar', color: CHROME, mask: (x, z) => mullion(x, z) });
    b.box(x0, z0, x1, z1, 0, 1, { kind: 'plate', color: CHROME });
    b.box(x0, z0, x1, z1, Y.CEILING - 1, Y.CEILING, { kind: 'plate', color: CHROME });
    b.box(x0, z0, x1, z1, 1, Y.CEILING - 1, { kind: 'glass', color: GLASS[p.tint] });
  }
  // the annex: a closed block of travertine [documented: OSM; its rooms out of scope], a door of dark glass toward the court
  // [assumed]
  b.newGroup();
  const [ax0, az0, ax1, az1] = ANNEX;
  const door = (x: number, z: number) => z === az0 && x >= ax0 + 6 && x < ax0 + 12;
  b.box(ax0, az0, ax1, az1, 0, Y.CEILING, {
    kind: 'brick', color: (x, y, z) => TRAVERTINE[(Math.floor((x + z) / 7) + Math.floor(y / 12)) % 3],
    mask: (x, z, y) => (x === ax0 || z === az0 || x === ax1 - 1 || z === az1 - 1) && !(door(x, z) && y < 21),
  });
  b.box(ax0 + 6, az0, ax0 + 12, az0 + 1, 0, 21, { kind: 'glass', color: GLASS.black });
}

/** the roofs (roof): thin white slabs [documented: about 24 cm, white], and the red curtain hanging from the main one (Q1) */
export function buildRoofs(b: Builder) {
  b.setPhase(P.ROOF);
  for (const r of [ROOF, ANNEX_ROOF]) {
    b.newGroup();
    b.box(r[0], r[1], r[2], r[3], Y.CEILING, Y.ROOF, { kind: 'plate', color: ROOF_WHITE });
  }
  // [documented: the 1986 red velvet curtain, along the inside of the green glass; its length assumed]
  b.hanging(P.ROOF, () => {
    b.newGroup();
    b.box(CURTAIN[0], CURTAIN[1], CURTAIN[2], CURTAIN[3], 1, Y.CEILING, { kind: 'tile', unit: 3, color: (x) => ((x & 1) ? 0x8e1b22 : 0x7f161d) });
  });
}
export const CURTAIN: Rect = [56, 22, 70, 23];
