/**
 * The Rose Seidler House's landscape (spec 043): the steel rails of the deck, the landing and the ramp; Rose's sandstone
 * rockeries along the garden terrace's edge [documented: rockeries built from the garage's excavated stone; places assumed];
 * the citrus trees on the slope [documented: a terraced citrus orchard; places assumed]; and the gum trees of the bush, a few
 * kept close to the house on purpose [documented; species and places assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { BLACK, SANDSTONE } from './house';
import { DECK, GARDEN, HOUSE, inRect, LANDING, RAMP, rampTop, Y } from './layout';
import { APRON, HeightMap, inPad, onRoad, TERRAIN } from './site';

/** a rail: a steel post every 3 ft and a top rail, 3.2 ft high [assumed: photographs] */
function rail(b: Builder, cells: [number, number, number][]) {
  b.newGroup();
  cells.forEach(([x, z, y], i) => {
    if (i % 3 === 0 || i === cells.length - 1) b.add(x, z, y, 1, 1, 8, BLACK, 'bar');
  });
  b.newGroup();
  for (const [x, z, y] of cells) b.add(x, z, y + 8, 1, 1, 1, BLACK, 'tile');
}

/** a gum tree: a tall pale trunk, bare low down, and two or three open clumps of grey-green leaves up high [assumed: photographs] */
function gum(b: Builder, x: number, z: number, y: number, h: number) {
  b.newGroup();
  b.column(x, z, y, y + h, hash2(x, z) < 0.5 ? 0xd8d0c0 : 0xbdb3a0, 'round');
  const c = hash2(z, x) < 0.5 ? 0x7d8c5c : 0x667852;
  const clumps = 2 + Math.floor(hash2(x * 3, z) * 2);
  for (let i = 0; i < clumps; i++) {
    const a = hash2(x + i * 17, z - i * 5) * Math.PI * 2, r = i === 0 ? 0 : 3;
    const cx = x + Math.round(Math.cos(a) * r), cz = z + Math.round(Math.sin(a) * r), cy = y + h - 3 - i * 6;
    const s = i === 0 ? 3 : 2;
    b.box(cx - s, cz - s, cx + s + 1, cz + s + 1, cy, cy + 3, {
      kind: 'brick', color: c,
      // gaps in the leaves, and the trunk left through the middle (clumps that meet just skip taken space)
      mask: (xx, zz) => hash2(xx * 7 + i, zz * 3 - i) > 0.3 && !(xx === x && zz === z),
    });
  }
}
/** a low shrub of the bush's understorey [assumed] */
function shrub(b: Builder, x: number, z: number, y: number) {
  b.newGroup();
  const c = hash2(x, z * 3) < 0.5 ? 0x4f6236 : 0x5d6e3e;
  b.box(x, z, x + 2, z + 2, y, y + 3, { kind: 'brick', color: c });
}
/** a citrus tree: a short trunk and a round dark crown with fruit [assumed] */
function citrus(b: Builder, x: number, z: number, y: number) {
  b.newGroup();
  b.column(x, z, y, y + 6, 0x5a4632, 'round');
  b.box(x - 2, z - 2, x + 3, z + 3, y + 6, y + 12, { kind: 'brick', color: (xx, yy, zz) => (hash2(xx * 5 + yy, zz) < 0.12 ? 0xf08a24 : 0x2f5a2c) });
}

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the rails: along the deck's open edge, round the landing, both sides of the ramp
  const F = Y.FLOOR;
  rail(b, Array.from({ length: LANDING[0] - DECK[0] }, (_, i) => [DECK[0] + i, DECK[3] - 1, F] as [number, number, number]));
  rail(b, Array.from({ length: RAMP.z0 - LANDING[1] }, (_, i) => [LANDING[0], LANDING[1] + i, F] as [number, number, number]));
  rail(b, [
    ...Array.from({ length: 2 }, (_, i) => [33 + i, LANDING[1], F] as [number, number, number]),
    ...Array.from({ length: LANDING[3] - LANDING[1] - 1 }, (_, i) => [LANDING[2] - 1, LANDING[1] + 1 + i, F] as [number, number, number]),
    ...Array.from({ length: LANDING[2] - LANDING[0] - 1 }, (_, i) => [LANDING[2] - 2 - i, LANDING[3] - 1, F] as [number, number, number]),
  ]);
  for (const z of [RAMP.z0, RAMP.z1 - 1]) {
    const cells: [number, number, number][] = [];
    for (let x = RAMP.x1 - 1; x > RAMP.x0; x--) if (rampTop(x) > hm.at(x, z)) cells.push([x, z, rampTop(x)]);
    rail(b, cells);
  }

  // Rose's rockeries: sandstone boulders along the garden terrace's downhill edge and its east end
  for (let x = GARDEN[0]; x < GARDEN[2]; x += 4) {
    const z = GARDEN[3] - 1 - Math.floor(hash2(x, 9) * 2);
    rock(b, x, z, hm);
  }
  for (let z = GARDEN[1] + 4; z < GARDEN[3] - 4; z += 5) rock(b, GARDEN[0] + Math.floor(hash2(z, 4) * 2), z, hm);

  // the gum trees kept beside the house [documented: "a few eucalypts kept on purpose"; places assumed]
  for (const [x, z] of [[-22, 6], [56, 46], [58, 6]]) gum(b, x, z, hm.at(x, z), 56 + Math.floor(hash2(x, z) * 12));
  // the citrus orchard on the slope west of the house [documented: a terraced citrus orchard; places assumed]
  for (let z = 4; z < 40; z += 9) for (const x of [60, 68]) citrus(b, x + (z % 2), z, hm.at(x + (z % 2), z));

  // the bush all round: gum trees scattered on a loose grid, and shrubs between them
  const clear = (x: number, z: number) =>
    inPad(x, z) || onRoad(x, z) || inRect(x, z, APRON) || (x > HOUSE[0] - 12 && x < 76 && z > -14 && z < 70);
  for (let gz = TERRAIN.z0 + 5; gz < TERRAIN.z1 - 5; gz += 11)
    for (let gx = TERRAIN.x0 + 5; gx < TERRAIN.x1 - 5; gx += 11) {
      const x = gx + Math.floor(hash2(gx, gz) * 9) - 4, z = gz + Math.floor(hash2(gz, gx) * 9) - 4, t = hash2(x * 3, z * 5);
      if (clear(x, z) || clear(x + 4, z + 4) || clear(x - 4, z - 4)) continue;
      if (t < 0.3) shrub(b, x, z, hm.at(x, z));
      else gum(b, x, z, hm.at(x, z), 48 + Math.floor(t * 40));
    }
  for (let gz = TERRAIN.z0 + 2; gz < TERRAIN.z1 - 2; gz += 7)
    for (let gx = TERRAIN.x0 + 2; gx < TERRAIN.x1 - 2; gx += 7) {
      const x = gx + Math.floor(hash2(gx * 5, gz) * 5), z = gz + Math.floor(hash2(gz * 5, gx) * 5);
      if (hash2(x, z) < 0.5 || clear(x, z) || clear(x + 2, z + 2)) continue;
      shrub(b, x, z, hm.at(x, z));
    }
}

/** a sandstone boulder [assumed] */
function rock(b: Builder, x: number, z: number, hm: HeightMap) {
  b.newGroup();
  const y = hm.at(x, z), c = SANDSTONE[Math.floor(hash2(x, z) * SANDSTONE.length)];
  b.box(x, z, x + 3, z + 2, y, y + 3, { kind: 'brick', color: c });
  if (hash2(z, x) < 0.5) b.box(x, z, x + 2, z + 2, y + 3, y + 6, { kind: 'brick', color: c });
}
