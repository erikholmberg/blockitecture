import { Brick } from '../src/engine/catalog';
import { P } from '../src/houses/stahl-house/phases';

/** FNV-1a: small, dependency-free fingerprint */
export const fnv1a = (str: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16).padStart(8, '0');
};

const inR = (b: Brick, r: number[]) => b.x >= r[0] && b.x < r[2] && b.z >= r[1] && b.z < r[3];
/** Street/driveway paving that spec 004 moved: the old ROAD and DRIVEWAY, and the new DRIVE. */
const PAVING = [[-122, -78, 26, -64], [0, -64, 24, -38], [-112, -30, -2, -14]];

/**
 * The house itself: foundations through roof (phases 1–6), without the street/driveway paving.
 * Spec 002-A5 / 004-A2: 3,603 pieces, e781fb43.
 */
export function houseFingerprint(bricks: Brick[]) {
  const house = bricks.filter(
    (b) => b.phase >= P.FOUNDATION && b.phase <= P.ROOF && !(b.phase === P.FLOOR && PAVING.some((r) => inR(b, r))),
  );
  return {
    count: house.length,
    hash: fnv1a(house.map((q) => [q.x, q.y, q.z, q.w, q.d, q.h, q.color, q.kind, q.studs, q.thin ?? '', q.phase].join(',')).join('\n')),
  };
}

/** Every piece, every field that defines the model (not when it lands). */
export function modelFingerprint(bricks: Brick[]) {
  return {
    count: bricks.length,
    hash: fnv1a(bricks.map((q) => [q.x, q.y, q.z, q.w, q.d, q.h, q.color, q.kind, q.studs, q.thin ?? '', q.phase, q.group, q.hangs ? 1 : 0].join(',')).join('\n')),
  };
}
