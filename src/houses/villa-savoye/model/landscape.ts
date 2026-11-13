/**
 * The Villa Savoye's park (spec 074): fourteen tall trees round the lawn's edge [documented: the park is bordered by fourteen
 * trees; their places assumed along the edge of OSM's woods], the woods themselves round the park [documented: OSM way
 * 985370239; the trees in them assumed], some rose bushes [documented; placed by the drive's loop, assumed], and the park's wall
 * along Rue de Villiers [documented: OSM; its height assumed].
 */
import { Builder, hash2 } from '@/engine/voxel';
import { P } from '../phases';
import { HOUSE, inRect, LODGE } from './layout';
import { HeightMap, inWoods, onDrive, onWall, streetAt, TERRAIN, WOODS } from './site';

function tree(b: Builder, x: number, z: number, y: number, h: number, rs: number[], colors: number[]) {
  b.newGroup();
  b.column(x, z, y, y + h, 0x5a4636, 'round');
  rs.forEach((r, i) =>
    b.box(x - r, z - r, x + r + 1, z + r + 1, y + h + i * 3, y + h + 3 + i * 3, {
      kind: 'brick', color: colors[i % colors.length], mask: (xx, zz) => Math.hypot(xx - x, zz - z) <= r + 0.3,
    }));
}

/** the fourteen trees: evenly along the lawn's edge, where the woods begin (the inner line of OSM's woods) */
export function specimenTrees(): [number, number][] {
  const inner = WOODS.slice(0, 48);
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < inner.length; i++) { const l = Math.hypot(inner[i][0] - inner[i - 1][0], inner[i][1] - inner[i - 1][1]); segs.push(l); total += l; }
  const out: [number, number][] = [];
  for (let k = 0; k < 14; k++) {
    let s = ((k + 0.5) / 14) * total, i = 0;
    while (s > segs[i]) s -= segs[i++];
    const [ax, az] = inner[i], [bx, bz] = inner[i + 1], t = s / segs[i];
    // a few feet into the woods, so the crowns hang over the lawn's edge
    out.push([Math.round(ax + (bx - ax) * t), Math.round(az + (bz - az) * t)]);
  }
  return out;
}

const clearFor = (b: Builder, hm: HeightMap, x: number, z: number, r: number) => {
  for (let dz = -r; dz <= r; dz += 2)
    for (let dx = -r; dx <= r; dx += 2) {
      const xx = x + dx, zz = z + dz;
      if (xx < TERRAIN.x0 + 2 || zz < TERRAIN.z0 + 2 || xx >= TERRAIN.x1 - 2 || zz >= TERRAIN.z1 - 2) return false;
      if (streetAt(xx, zz) || onDrive(xx, zz) || onWall(xx, zz) || inRect(xx, zz, [HOUSE[0] - 12, HOUSE[1] - 12, HOUSE[2] + 12, HOUSE[3] + 12])) return false;
      if (inRect(xx, zz, [LODGE[0] - 4, LODGE[1] - 4, LODGE[2] + 4, LODGE[3] + 4])) return false;
    }
  return b.free(x, z, hm.at(x, z), hm.at(x, z) + 60);
};

export function buildLandscape(b: Builder, hm: HeightMap) {
  b.setPhase(P.LANDSCAPE);
  // the park's wall along Rue de Villiers, 5 ft of pale stone [assumed], the gate left open between its two runs
  b.newGroup();
  for (let z = TERRAIN.z0; z < TERRAIN.z1; z++)
    for (let x = 200; x < TERRAIN.x1; x++) if (onWall(x, z) && !streetAt(x, z)) b.add(x, z, hm.at(x, z), 1, 1, 12, 0xd8d0bd, 'brick');
  // the fourteen trees round the lawn
  for (const [x, z] of specimenTrees()) {
    if (!clearFor(b, hm, x, z, 4)) continue;
    tree(b, x, z, hm.at(x, z), 42 + Math.floor(hash2(x, z) * 10), [5, 7, 9, 10, 10, 9, 7, 5], [0x4a7a36, 0x56863e]);
  }
  // the woods round the park
  for (let gz = TERRAIN.z0 + 6; gz < TERRAIN.z1 - 6; gz += 24)
    for (let gx = TERRAIN.x0 + 6; gx < TERRAIN.x1 - 6; gx += 24) {
      const x = gx + Math.floor(hash2(gx, gz) * 11) - 5, z = gz + Math.floor(hash2(gz, gx) * 11) - 5;
      if (!inWoods(x, z) || !clearFor(b, hm, x, z, 4)) continue;
      const h = 26 + Math.floor(hash2(x * 3, z) * 14);
      const evergreen = hash2(z, x * 7) < 0.2;
      tree(b, x, z, hm.at(x, z), h, evergreen ? [5, 4, 3, 2, 1] : [4, 6, 7, 6, 4], evergreen ? [0x2f5a35, 0x356240] : [0x4c7638, 0x5a8640, 0x52803a]);
    }
  // [documented: some rose bushes] along the inside of the drive's loop, south-east of the villa
  b.newGroup();
  for (let x = 96; x < 152; x += 6)
    for (const z of [10, 46]) {
      const y = hm.at(x, z);
      b.box(x, z, x + 2, z + 2, y, y + 3, { kind: 'brick', color: 0x3f6a34 });
      b.add(x, z, y + 3, 1, 1, 1, (x / 6) % 2 ? 0xc8374a : 0xe6a0b0, 'plate');
    }
}
