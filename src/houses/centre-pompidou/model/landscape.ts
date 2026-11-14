/**
 * The piazza (spec 080): Place Georges-Pompidou's setts on its real slope, falling toward the building a plate at a time
 * [documented: OSM surface=sett; IGN's levels], and its seven white ventilation stacks, the "trumpets" of the underground levels
 * [documented: OSM man_made=chimney, height 7 m, about 2.4 m across; their shape scaled from photographs].
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { inBrancusi, inPiazza, realPlates, SETT, STACKS, TERRAIN } from './site';

/** the stacks' height: 7 m [documented: OSM height=7] is 57 plates; their width 8 studs (2.4 m) [documented: OSM] */
export const STACK_H = 57;
export const STACK_W = 8;
const STACK_WHITE = 0xeeeeea;

/** a stack's stem: the 4 × 4 studs round its OSM centre (the setts go round it) */
export const stem = (s: { x: number; z: number }) => [Math.round(s.x) - 2, Math.round(s.z) - 2] as const;
export const inStack = (x: number, z: number) => STACKS.some((s) => { const [x0, z0] = stem(s); return x >= x0 && x < x0 + 4 && z >= z0 && z < z0 + 4; });

export function buildLandscape(b: Builder) {
  b.setPhase(P.LANDSCAPE);
  // the setts, a plate at a time down the slope, in long courses across it [documented: setts; their courses assumed]
  let lo = Infinity, hi = -Infinity;
  for (let z = TERRAIN.z0; z < TERRAIN.z1; z += 4)
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 4) if (inPiazza(x, z)) { const y = realPlates(x, z); lo = Math.min(lo, y); hi = Math.max(hi, y); }
  for (let y = lo - 3; y <= hi + 3; y++)
    b.box(TERRAIN.x0, TERRAIN.z0, TERRAIN.x1, TERRAIN.z1, y - 1, y, {
      kind: 'tile', sizes: SETT_SIZES,
      mask: (x, z) => inPiazza(x, z) && !inBrancusi(x, z) && !inStack(x, z) && realPlates(x, z) === y,
      color: (_x, yy) => SETT[yy & 1],
    });
  // the seven stacks at their OSM places: a stem and a flared white mouth [scaled: photographs]
  for (const s of STACKS) {
    b.newGroup();
    const cx = Math.round(s.x), cz = Math.round(s.z);
    // standing on the highest of the setts round its stem
    let g = -Infinity;
    for (let dz = -2; dz < 2; dz++) for (let dx = -2; dx < 2; dx++) g = Math.max(g, realPlates(cx + dx, cz + dz));
    const stemH = STACK_H - 15;
    // the stem: 4 studs square
    b.add(cx - 2, cz - 2, g - 1, 4, 4, stemH + 1, STACK_WHITE);
    // the mouth: a stepped round of 8 studs, in two layers widening upward
    for (const [r, y0, h] of [[3, stemH, 5], [4, stemH + 5, 10]] as const) {
      b.add(cx - r, cz - 2, g + y0, 2 * r, 4, h, STACK_WHITE);
      b.add(cx - 2, cz - r, g + y0, 4, r - 2, h, STACK_WHITE);
      b.add(cx - 2, cz + 2, g + y0, 4, r - 2, h, STACK_WHITE);
    }
    // its dark grille
    b.add(cx - 2, cz - 2, g + STACK_H, 4, 4, 1, 0x2e3033, 'tile');
  }
}
const SETT_SIZES = [32, 16, 8, 4, 2, 1].flatMap((l) => [8, 7, 6, 5, 4, 3, 2, 1].filter((w) => w <= l || l >= 8).map((w) => [l, w]));
