/**
 * Shared helpers for a house's brick lot (specs 055–058): the baked real ground, OSM streets and plain neighbour blocks. Pure
 * (no DOM, no Three.js). Houses before spec 055 keep their own copies of these, so their models are untouched.
 */
import { Builder, hash2 } from './voxel';

export type Pt = [number, number];

/** The real ground in ft at (x, z), bilinear over a house's baked LOT_GROUND samples (heights in ft × 4). */
export function groundSampler(g: { x0: number; z0: number; step: number; nx: number; nz: number; h: number[] }) {
  return (x: number, z: number): number => {
    const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
    const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
    const H = (ii: number, jj: number) => g.h[jj * g.nx + ii] / 4;
    return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
  };
}

export const smoothstep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

export function segDist(x: number, z: number, [ax, az]: Pt, [bx, bz]: Pt) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
}

export function inPoly(x: number, z: number, ring: Pt[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** half-widths of the carriageway by OSM highway class, in ft [assumed] */
export const ROAD_HALF: Record<string, number> = {
  primary: 16, secondary: 13, tertiary: 11, residential: 9, unclassified: 9, living_street: 7, service: 5,
};

/** What the ground is at (x, z) near OSM's streets: carriageway, pavement (`kerb` ft wide) or neither. */
export function streets(roads: { highway: string; pts: Pt[] }[], half = ROAD_HALF, kerb = 6) {
  return (x: number, z: number): 'road' | 'pavement' | null => {
    let best: 'road' | 'pavement' | null = null;
    for (const r of roads) {
      const h = half[r.highway] ?? 0;
      if (!h) continue;
      for (let i = 1; i < r.pts.length; i++) {
        const d = segDist(x, z, r.pts[i - 1], r.pts[i]);
        if (d < h) return 'road';
        if (d < h + kerb) best = 'pavement';
      }
    }
    return best;
  };
}

/**
 * A plain neighbouring building on its OSM outline: a shell of walls one stud thick from `base` to `top` (plates), window
 * bands on every storey (`storey` plates), a flat roof of plates. Placed with Builder.neighbour() so the viewer can hide it
 * when it's in the way (spec 038). `keep` excludes cells (e.g. the house's own lot).
 */
export function plainNeighbour(
  b: Builder, ring: Pt[], base: number, top: number,
  o: { wall: number[]; window: number; roof: number; storey?: number; keep?: (x: number, z: number) => boolean },
) {
  const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
  const x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs)) + 1;
  const z0 = Math.floor(Math.min(...zs)), z1 = Math.ceil(Math.max(...zs)) + 1;
  const mine = (x: number, z: number) => inPoly(x + 0.5, z + 0.5, ring) && (!o.keep || o.keep(x, z));
  const edge = (x: number, z: number) => mine(x, z) && (!mine(x + 1, z) || !mine(x - 1, z) || !mine(x, z + 1) || !mine(x, z - 1));
  const storey = o.storey ?? 25;
  b.neighbour(() => {
    b.newGroup();
    b.box(x0, z0, x1, z1, base, top, {
      kind: 'brick', mask: (x, z) => edge(x, z),
      color: (x, y, z) => {
        const s = (((y - base) % storey) + storey) % storey, along = (((x + z) % 5) + 5) % 5;
        if (y - base >= 6 && s >= 8 && s < 17 && along >= 1 && along <= 3) return o.window;
        return o.wall[Math.floor(hash2(Math.floor((x + z) / 7), Math.floor(y / 9)) * o.wall.length)];
      },
    });
    b.box(x0, z0, x1, z1, top, top + 1, { kind: 'plate', color: o.roof, mask: (x, z) => mine(x, z) });
  });
}
