/**
 * Spec 050: a house's model by the numbers, and its palette. Pure (no DOM, no Three.js): worked out once by `npm run stats`
 * into src/houses/stats.ts, which the home page and the viewer read without building any model.
 *
 * Every figure is about the model, not the real house: blocks round everything to a foot (or a 0.4 ft plate).
 */
import { Brick, PLATE } from '@/engine/catalog';
import type { HouseDefinition, PhaseRole } from '@/engine/house';
import { sequence } from '@/engine/sequencer';

export interface HouseStats {
  /** every piece, with the site and the landscape */
  pieces: number;
  /** the house's own pieces: foundation to roof */
  housePieces: number;
  /** from the house's lowest piece to its highest, ft */
  heightFt: number;
  /** the ground the house covers, seen from above, ft² */
  footprintFt2: number;
  /** the share of the house's volume that's glass */
  glassShare: number;
  /** each build step, in order: its role, its pieces, its time at 1× (s) */
  steps: { role: PhaseRole; pieces: number; seconds: number }[];
  /** the house's main outside colours and its accents, largest first; shares are widths for the strip and add up to 1 */
  palette: { color: number; share: number }[];
}

const HOUSE_ROLES: PhaseRole[] = ['foundation', 'floor', 'structure', 'interior', 'envelope', 'roof'];
const OUTSIDE_ROLES: PhaseRole[] = ['structure', 'envelope', 'roof'];
const NOT_PAINT = new Set(['glass', 'light', 'lamp', 'water', 'falls']);
/** colours closer than this (RGB distance, 0–441) count as one shade [Q1] */
export const MERGE_DISTANCE = 40;
export const PALETTE_SIZE = 5;
/** an accent: HSL saturation at least this (the woods and browns of the models fall below 0.4) [Q1, tuned in A5] */
export const VIVID_SATURATION = 0.5;
export const VIVID_MIN_SHARE = 0.002;
export const VIVID_MAX = 3;
/** each colour's least width in the strip */
export const MIN_WIDTH = 0.05;

export function hslSaturation(c: number) {
  const r = ((c >> 16) & 255) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  return mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1));
}

const rgbDist = (a: number, b: number) =>
  Math.hypot(((a >> 16) & 255) - ((b >> 16) & 255), ((a >> 8) & 255) - ((b >> 8) & 255), (a & 255) - (b & 255));

/**
 * The palette: the outside pieces' colours weighted by their exposed faces (a top face cell is 1 ft², a side face cell 1 ft by
 * a plate), shades closer than MERGE_DISTANCE merged into the heavier one; up to VIVID_MAX vivid accents kept however small,
 * the rest of PALETTE_SIZE filled by the largest; shares are widths for the strip (at least MIN_WIDTH each), adding up to 1.
 */
export function paletteWeights(bricks: Brick[], roleOf: (b: Brick) => PhaseRole, occupied: (x: number, y: number, z: number) => boolean) {
  const weight = new Map<number, number>();
  for (const b of bricks) {
    if (!OUTSIDE_ROLES.includes(roleOf(b)) || NOT_PAINT.has(b.kind)) continue;
    let area = 0;
    for (let z = b.z; z < b.z + b.d; z++)
      for (let x = b.x; x < b.x + b.w; x++) {
        if (!occupied(x, b.y + b.h, z)) area += 1;
        if (!occupied(x, b.y - 1, z)) area += 1;
      }
    for (let y = b.y; y < b.y + b.h; y++) {
      for (let x = b.x; x < b.x + b.w; x++) {
        if (!occupied(x, y, b.z - 1)) area += PLATE;
        if (!occupied(x, y, b.z + b.d)) area += PLATE;
      }
      for (let z = b.z; z < b.z + b.d; z++) {
        if (!occupied(b.x - 1, y, z)) area += PLATE;
        if (!occupied(b.x + b.w, y, z)) area += PLATE;
      }
    }
    if (area > 0) weight.set(b.color, (weight.get(b.color) ?? 0) + area);
  }
  const clusters: { color: number; w: number }[] = [];
  for (const [color, w] of [...weight].sort((a, b) => b[1] - a[1] || a[0] - b[0])) {
    const near = clusters.find((c) => rgbDist(c.color, color) < MERGE_DISTANCE);
    if (near) near.w += w;
    else clusters.push({ color, w });
  }
  clusters.sort((a, b) => b.w - a.w || a.color - b.color);
  const total = clusters.reduce((a, c) => a + c.w, 0);
  // the accents first: up to VIVID_MAX vivid colours, however thin (the Rietveld Schröder House's red, yellow and blue beams,
  // Barragán's pink wall); then the largest of the rest
  const vivid = clusters.filter((c) => hslSaturation(c.color) >= VIVID_SATURATION && c.w / total >= VIVID_MIN_SHARE).slice(0, VIVID_MAX);
  const rest = clusters.filter((c) => !vivid.includes(c)).slice(0, PALETTE_SIZE - vivid.length);
  const top = [...rest, ...vivid].sort((a, b) => b.w - a.w || a.color - b.color);
  // widths: each colour's share of the chosen area, but at least MIN_WIDTH, so a thin accent still shows
  const sum = top.reduce((a, c) => a + c.w, 0);
  const floored = top.map((c) => Math.max(c.w / sum, MIN_WIDTH));
  const f = floored.reduce((a, x) => a + x, 0);
  return top.map((c, i) => ({ color: c.color, share: floored[i] / f }));
}

/** shares to 4 places, the last taking up the rounding so they add up to exactly 1 */
function roundShares(p: { color: number; share: number }[]) {
  const r = p.map((c) => ({ color: c.color, share: Math.round(c.share * 1e4) / 1e4 }));
  r[r.length - 1].share = Math.round((1 - r.slice(0, -1).reduce((a, c) => a + c.share, 0)) * 1e4) / 1e4;
  return r;
}

export function houseStats(house: HouseDefinition): HouseStats {
  const { builder } = house.build();
  const bricks = builder.bricks;
  const roleOf = (b: Brick) => house.phases[b.phase].role;
  const own = bricks.filter((b) => HOUSE_ROLES.includes(roleOf(b)));
  let lo = Infinity, hi = -Infinity, volume = 0, glass = 0;
  const cover = new Set<number>();
  for (const b of own) {
    lo = Math.min(lo, b.y); hi = Math.max(hi, b.y + b.h);
    const v = b.w * b.d * b.h;
    volume += v;
    if (b.kind === 'glass') glass += v;
    for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cover.add((z + 32768) * 65536 + (x + 32768));
  }
  const s = sequence(bricks, house.phases, house.center);
  const steps = house.phases.map((p, i) => ({
    role: p.role,
    pieces: bricks.filter((b) => b.phase === i).length,
    seconds: Math.round(((i + 1 < s.phaseStart.length ? s.phaseStart[i + 1] : s.total) - s.phaseStart[i]) * 10) / 10,
  }));
  return {
    pieces: bricks.length,
    housePieces: own.length,
    heightFt: Math.round((hi - lo) * PLATE * 10) / 10,
    footprintFt2: cover.size,
    glassShare: Math.round((glass / volume) * 1000) / 1000,
    steps,
    palette: roundShares(paletteWeights(bricks, roleOf, (x, y, z) => builder.occAt(x, y, z) !== 0)),
  };
}

/** src/houses/stats.ts's text, from every house's stats */
export function renderStatsModule(all: Record<string, HouseStats>): string {
  const body = Object.keys(all).sort().map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(all[k])},`).join('\n');
  return `// GENERATED by \`npm run stats\` (tests/stats.test.ts): do not edit. Spec 050.
// Each house's model by the numbers and its palette, worked out from the models, so the pages needn't build them.
import type { HouseStats } from '@/engine/stats';

export const STATS: Record<string, HouseStats> = {
${body}
};
`;
}

export const FT_TO_M = 0.3048;
