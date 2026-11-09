/**
 * The Eames House's facades (spec 010b): a grid of panels between the steel columns, two courses per bay (below and
 * above the rail at 8′1″), each course split into two sub-panels by a black mullion (the 3′8″ window module).
 *
 * Documented (spec 010 research): panels of clear glass, translucent glass and stucco/Cemesto in red, blue, black, white
 * and beige; the front door of five translucent panels topped by two gold panels; white crossed tension rods on some
 * bays; sliding doors on the north and south ends of both pavilions; the west side mostly solid, with casement windows.
 * NOT documented panel by panel here: which colour is in which bay. The arrangement below is a composition in the
 * palette and spirit of published photographs, not a verified elevation, and is marked as such in the spec.
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { RESIDENCE_BAYS, STUDIO_BAYS, X_EAST, X_WEST, Y, Z } from './layout';

/** G clear glass, T translucent glass, D glass door, R red, B blue, W white, K black, E beige/earth, A gold */
type Code = 'G' | 'T' | 'D' | 'R' | 'B' | 'W' | 'K' | 'E' | 'A';
const SOLID: Record<string, number> = {
  R: 0xb8352a, B: 0x2c4e86, W: C.white, K: C.black, E: 0xc9b48a, A: 0xd6a738,
};
const CLEAR = C.glass, TRANSLUCENT = 0xf6f6ee;

/** per bay: [lower-left, lower-right, upper-left, upper-right] (left = lower z) */
type Bay = [Code, Code, Code, Code];
const EAST: Record<number, Bay> = {
  // studio, north (carport) end → courtyard
  0: ['W', 'R', 'B', 'K'],
  1: ['G', 'G', 'T', 'T'],
  2: ['K', 'G', 'G', 'G'],
  3: ['G', 'G', 'W', 'B'], // + crossed tension rods
  4: ['G', 'G', 'R', 'W'],
  // residence, courtyard → living room
  9: ['G', 'G', 'B', 'W'],
  10: ['G', 'R', 'W', 'W'], // + crossed tension rods
  11: ['W', 'G', 'K', 'W'],
  12: ['D', 'T', 'A', 'A'], // the front door: translucent panels topped by two gold panels
  13: ['G', 'G', 'T', 'T'],
  14: ['G', 'G', 'G', 'T'],
  15: ['G', 'G', 'T', 'T'],
};
const WEST: Record<number, Bay> = {
  0: ['W', 'K', 'E', 'W'],
  1: ['E', 'W', 'G', 'W'],
  2: ['W', 'E', 'W', 'G'],
  3: ['K', 'W', 'E', 'W'],
  4: ['W', 'E', 'G', 'W'],
  9: ['W', 'E', 'W', 'G'],
  10: ['E', 'W', 'G', 'W'],
  11: ['W', 'K', 'W', 'E'],
  12: ['E', 'W', 'W', 'G'],
  13: ['K', 'E', 'E', 'W'],
  14: ['E', 'W', 'T', 'T'],
  15: ['W', 'E', 'T', 'T'],
};
const X_BRACED = [3, 10];

/** end walls across the house (x 1…18): three panels per course, [lower ×3, upper ×3] */
const ENDS: { z: number; panels: [Code, Code, Code, Code, Code, Code] }[] = [
  { z: Z[0], panels: ['W', 'D', 'K', 'E', 'T', 'W'] }, // studio north, by the carport
  { z: Z[5] - 1, panels: ['G', 'D', 'R', 'T', 'T', 'W'] }, // studio south, onto the courtyard
  { z: Z[9], panels: ['B', 'D', 'G', 'W', 'T', 'T'] }, // residence north, onto the courtyard
  { z: Z[16], panels: ['G', 'D', 'G', 'T', 'G', 'T'] }, // living room south, onto the patio
];

function panel(b: Builder, x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, code: Code) {
  if (x1 <= x0 || z1 <= z0) return;
  if (code === 'G' || code === 'T' || code === 'D') {
    b.box(x0, z0, x1, z1, y0, y1, { kind: 'glass', color: code === 'T' ? TRANSLUCENT : CLEAR });
    if (code === 'D') b.box(x0, z0, x1, z1, y1 - 1, y1, { kind: 'plate', color: C.black, studs: false }); // door head
  } else {
    b.box(x0, z0, x1, z1, y0, y1, { kind: 'brick', color: SOLID[code], studs: false });
  }
}

const COURSES: [number, number][] = [[Y.FLOOR, Y.RAIL], [Y.RAIL + 1, Y.ROOF_UNDER - 1]];

export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  for (const bays of [STUDIO_BAYS, RESIDENCE_BAYS]) {
    for (let i = bays[0]; i < bays[1]; i++) {
      for (const [x, map] of [[X_EAST, EAST], [X_WEST, WEST]] as const) {
        const codes = map[i];
        if (!codes) continue; // the open south patio bay
        b.newGroup();
        const zA = Z[i] + 1, zB = i + 1 === bays[1] ? Z[i + 1] - 1 : Z[i + 1];
        const mid = Math.floor((zA + zB) / 2);
        COURSES.forEach(([y0, y1], c) => {
          panel(b, x, zA, x + 1, mid, y0, y1, codes[c * 2]);
          b.box(x, mid, x + 1, mid + 1, y0, y1, { kind: 'brick', color: C.black, studs: false }); // mullion
          panel(b, x, mid + 1, x + 1, zB, y0, y1, codes[c * 2 + 1]);
        });
        if (x === X_EAST && X_BRACED.includes(i)) crossedRods(b, x + 1, zA, zB);
      }
    }
  }
  // the end walls: three panels per course with two mullions (x 6 and 12)
  for (const { z, panels } of ENDS) {
    b.newGroup();
    COURSES.forEach(([y0, y1], c) => {
      const p = panels.slice(c * 3, c * 3 + 3) as Code[];
      panel(b, 1, z, 6, z + 1, y0, y1, p[0]);
      b.box(6, z, 7, z + 1, y0, y1, { kind: 'brick', color: C.black, studs: false });
      panel(b, 7, z, 12, z + 1, y0, y1, p[1]);
      b.box(12, z, 13, z + 1, y0, y1, { kind: 'brick', color: C.black, studs: false });
      panel(b, 13, z, X_EAST, z + 1, y0, y1, p[2]);
    });
  }
}

/** white crossed tension rods just outside a bay: two stepped diagonals of thin white bars */
function crossedRods(b: Builder, x: number, zA: number, zB: number) {
  const n = zB - zA, y0 = Y.FLOOR, y1 = Y.ROOF_UNDER - 1, step = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const ya = Math.round(y0 + i * step), yb = Math.round(y0 + (i + 1) * step);
    b.add(x, zA + i, ya, 1, 1, Math.max(1, yb - ya), C.white, 'bar');
    const zr = zB - 1 - i;
    if (zr !== zA + i) b.add(x, zr, ya, 1, 1, Math.max(1, yb - ya), C.white, 'bar');
  }
}
