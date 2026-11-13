/**
 * The Bauhaus Dessau's outer walls (spec 076): which cells are on the outside of the building at each height, and where its
 * windows are. Pure, so the tests can ask the same questions. Plan and heights: layout.ts.
 */
import {
  BRIDGE, BRIDGE_UNDER, curtain, DOOR, ENT_A, ENT_B, FL, GROUND_FLOOR, inRect, LINK, LINK_BAY, LINK_TOP, LINK_WIN, NORTH,
  P_BAYS, P_HEAD, P_PARAPET, P_SILL, PARAPET, pDoor, PFL, PLINTH_TOP, PRELLER, pWindow, Rect, ROUND_WINDOWS, ROUND_Y, STAIR_WINDOW,
  STUB, TOWER, WORKSHOP,
} from './layout';

/** each part's volume: its plan and the heights its walls stand between (plates) */
export const VOLUMES: { name: 'north' | 'bridge' | 'workshop' | 'stub' | 'link' | 'preller'; r: Rect; y0: number; y1: number }[] = [
  { name: 'north', r: NORTH, y0: PLINTH_TOP, y1: PARAPET },
  { name: 'bridge', r: BRIDGE, y0: BRIDGE_UNDER, y1: PARAPET },
  { name: 'workshop', r: WORKSHOP, y0: PLINTH_TOP, y1: PARAPET },
  { name: 'workshop', r: ENT_A, y0: PLINTH_TOP, y1: PARAPET },
  { name: 'workshop', r: ENT_B, y0: PLINTH_TOP, y1: PARAPET },
  { name: 'stub', r: STUB, y0: PLINTH_TOP, y1: GROUND_FLOOR },
  { name: 'link', r: LINK, y0: PLINTH_TOP, y1: LINK_TOP },
  { name: 'preller', r: PRELLER, y0: PLINTH_TOP, y1: P_PARAPET },
];
export type PartName = (typeof VOLUMES)[number]['name'];

export const partAt = (x: number, z: number, y: number): PartName | null => {
  for (const v of VOLUMES) if (y >= v.y0 && y < v.y1 && inRect(x, z, v.r)) return v.name;
  return null;
};
export const solid = (x: number, z: number, y: number) => partAt(x, z, y) !== null;

/** on the outside: in the building at this height, beside a cell that isn't */
export const exterior = (x: number, z: number, y: number) =>
  solid(x, z, y) && (!solid(x + 1, z, y) || !solid(x - 1, z, y) || !solid(x, z + 1, y) || !solid(x, z - 1, y));

/** the face an outside cell is on: 'x' (faces ±x, runs along z) or 'z' (faces ±z, runs along x); null at a corner */
export function face(x: number, z: number, y: number): { n: 'x' | 'z'; along: number } | null {
  const ox = !solid(x + 1, z, y) || !solid(x - 1, z, y), oz = !solid(x, z + 1, y) || !solid(x, z - 1, y);
  if (ox && oz) return null;
  if (ox) return exterior(x, z + 1, y) && exterior(x, z - 1, y) ? { n: 'x', along: z } : null;
  if (oz) return exterior(x + 1, z, y) && exterior(x - 1, z, y) ? { n: 'z', along: x } : null;
  return null;
}

/** the window band of a 36-plate storey [scaled: the photographs' ribbon windows, sill 4 ft, head 11.2 ft over the floor] */
export const RIBBON = { sill: 10, head: 28 };
const storeyOf = (y: number) => Math.floor((y - GROUND_FLOOR) / 36);

/**
 * What fills an outside cell at (x, y, z), y a band's bottom: 'wall' (render), 'window' (glass in a frame), 'door' (the red
 * door), 'curtain' (the workshop wing's glass), 'band' (the white band over the plinth).
 */
export function opening(x: number, y: number, z: number): 'wall' | 'window' | 'door' | 'curtain' | 'band' {
  const part = partAt(x, z, y);
  if (part === 'workshop' && curtain(x, z)) return y < GROUND_FLOOR + 2 ? 'band' : 'curtain';
  if (part === 'workshop' && inRect(x, z, TOWER)) {
    // the tower: solid grey, the red door [documented]
    if (z === DOOR.z && x >= DOOR.x0 && x < DOOR.x1 && y >= DOOR.y0 && y < DOOR.y1) return 'door';
    return 'wall';
  }
  const f = face(x, z, y);
  if (part === 'north' || part === 'bridge' || part === 'workshop') {
    // ribbon windows on every storey [documented: the bridge's two ribbons, photographs; the north wing's assumed alike]
    const s = y - FL(storeyOf(y));
    return f && s >= RIBBON.sill && s < RIBBON.head ? 'window' : 'wall';
  }
  if (part === 'link') {
    // ten bays of tall windows on each long side [documented: the north side; the south side assumed alike]
    return f && f.n === 'x' && y >= LINK_WIN.y0 && y < LINK_WIN.y1 && (f.along - LINK[1]) % LINK_BAY >= 2 ? 'window' : 'wall';
  }
  if (part === 'preller') {
    const l = Math.floor((y - GROUND_FLOOR) / 25), s = y - PFL(l);
    if (!f) return 'wall';
    // the tall stair window up the north front [documented]
    if (x === STAIR_WINDOW.x && z >= STAIR_WINDOW.z0 && z < STAIR_WINDOW.z1) return y >= STAIR_WINDOW.y0 && y < STAIR_WINDOW.y1 ? 'window' : 'wall';
    if (z === PRELLER[1] && l >= 1 && l <= 4) {
      // the east front: four windows a floor, the right third a door onto the balcony [documented]
      for (const b0 of P_BAYS) {
        const [w0, w1] = pWindow(b0), [d0, d1] = pDoor(b0);
        if (x >= d0 && x < d1 && s < P_HEAD) return 'window';
        if (x >= w0 && x < w1 && s >= P_SILL && s < P_HEAD) return 'window';
      }
      return 'wall';
    }
    if (z === PRELLER[3] - 1 && l >= 2 && l <= 4) {
      // the west front over the link: the studios' windows [assumed: as the east, without balconies]
      for (const b0 of P_BAYS) { const [w0, w1] = pWindow(b0); if (x >= w0 && x < w1 && s >= P_SILL && s < P_HEAD) return 'window'; }
      return 'wall';
    }
    if (x === PRELLER[2] - 1 && l <= 4) {
      // the south front: a window on each floor, the kitchen's door to the wide balcony [documented: the balcony; the openings assumed]
      if (l >= 1 && z >= 14 && z < 18 && s < P_HEAD) return 'window';
      if (z >= 6 && z < 31 && s >= P_SILL && s < P_HEAD) return 'window';
    }
    return 'wall';
  }
  return 'wall';
}

/** the Prellerhaus's two round windows: within 2 ft of their centres [documented: photographs; the size scaled] */
export const inRound = (x: number, y: number, z: number) =>
  ROUND_WINDOWS.some(([cx, cz]) => z === cz && Math.hypot(x + 0.5 - cx, (y + 0.5 - ROUND_Y) * 0.4) <= 2.1);

/** the plinth's basement windows [documented: photographs]: 4 studs in every 10, 5 plates high */
export const basementWindow = (along: number, y: number) => y >= 3 && y < 8 && ((along % 10) + 10) % 10 >= 3 && ((along % 10) + 10) % 10 < 7;
