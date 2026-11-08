/**
 * Spec 003: decoding and sampling of public/neighborhood.bin (written by scripts/fetch-neighborhood.mjs).
 * Pure: no DOM, no Three.js, so it can be unit-tested in Node.
 *
 * Model coordinates: x/z in ft (1 unit = 1 stud ≈ 1 ft), y up in ft, y = 0 is the brick lot.
 * The real world is rotated 180° to match the brick model (see the script header).
 */
import { surfaceFt, TERRAIN } from '../model/site';

export interface Grid {
  x0: number; z0: number; step: number; nx: number; nz: number;
  /** heights in ft, row-major (z rows, x columns) */
  h: Float32Array;
}

export interface Neighborhood {
  attribution: string[];
  anchor: { lat: number; lon: number; rotationDeg: number; lotElevationM: number; offsetX: number; offsetZ: number; houseIoU: number };
  near: Grid;
  far: Grid;
  buildings: {
    count: number;
    /** interleaved x,z in ft for all rings; ring i spans points start[i]..start[i+1] */
    xz: Float32Array;
    start: Uint32Array;
    base: Float32Array;
    top: Float32Array;
    /** 0 house, 1 apartments, 2 commercial */
    kind: Uint8Array;
  };
  roads: { count: number; xz: Float32Array; start: Uint32Array; cls: Uint8Array };
}

type ArrayInfo = { type: string; offset: number; length: number };
const CTORS = { Int16Array, Uint32Array, Uint8Array } as const;

export function parseNeighborhood(buf: ArrayBuffer): Neighborhood {
  const headerLen = new DataView(buf).getUint32(0, true);
  const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, headerLen)));
  const base = 4 + headerLen;
  const arr = (name: string) => {
    const a: ArrayInfo = header.arrays[name];
    const C = CTORS[a.type as keyof typeof CTORS];
    return new C(buf, base + a.offset, a.length);
  };
  const hs = header.scale.heights as number, cs = header.scale.coords as number;

  const grid = (name: 'near' | 'far', key: string): Grid => {
    const g = header[name];
    const d = arr(key) as Int16Array;
    const h = new Float32Array(d.length);
    // undo row-wise delta encoding
    let acc = 0;
    for (let i = 0; i < d.length; i++) {
      acc = i % g.nx === 0 ? d[i] : acc + d[i];
      h[i] = acc / hs;
    }
    return { x0: g.x0, z0: g.z0, step: g.step, nx: g.nx, nz: g.nz, h };
  };
  const paths = (key: string, start: Uint32Array) => {
    const d = arr(key) as Int16Array;
    const xz = new Float32Array(d.length);
    for (let p = 0; p < start.length - 1; p++) {
      let x = 0, z = 0;
      for (let i = start[p]; i < start[p + 1]; i++) {
        x = i === start[p] ? d[i * 2] : x + d[i * 2];
        z = i === start[p] ? d[i * 2 + 1] : z + d[i * 2 + 1];
        xz[i * 2] = x / cs;
        xz[i * 2 + 1] = z / cs;
      }
    }
    return xz;
  };

  const bStart = Uint32Array.from(arr('bStart') as Uint32Array);
  const rStart = Uint32Array.from(arr('rStart') as Uint32Array);
  const toFt = (a: Int16Array) => Float32Array.from(a, (v) => v / hs);
  return {
    attribution: header.attribution,
    anchor: header.anchor,
    near: grid('near', 'nearH'),
    far: grid('far', 'farH'),
    buildings: {
      count: bStart.length - 1,
      xz: paths('bCoords', bStart),
      start: bStart,
      base: toFt(arr('bBase') as Int16Array),
      top: toFt(arr('bTop') as Int16Array),
      kind: Uint8Array.from(arr('bKind') as Uint8Array),
    },
    roads: { count: rStart.length - 1, xz: paths('rCoords', rStart), start: rStart, cls: Uint8Array.from(arr('rClass') as Uint8Array) },
  };
}

/** Bilinear sample of a grid in ft; clamps at the edges. */
export function sampleGrid(g: Grid, x: number, z: number): number {
  const fx = Math.min(Math.max((x - g.x0) / g.step, 0), g.nx - 1.0001);
  const fz = Math.min(Math.max((z - g.z0) / g.step, 0), g.nz - 1.0001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const H = (ii: number, jj: number) => g.h[jj * g.nx + ii];
  return H(i, j) * (1 - u) * (1 - v) + H(i + 1, j) * u * (1 - v) + H(i, j + 1) * (1 - u) * v + H(i + 1, j + 1) * u * v;
}

export const inGrid = (g: Grid, x: number, z: number) =>
  x >= g.x0 && z >= g.z0 && x <= g.x0 + (g.nx - 1) * g.step && z <= g.z0 + (g.nz - 1) * g.step;

/** Width of the band at the edge of the near grid that blends into the far grid. */
export const FAR_BLEND = 500;

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Distance from (x,z) to the brick lot rectangle; 0 inside. */
export function lotDistance(x: number, z: number) {
  const dx = Math.max(TERRAIN.x0 - x, 0, x - TERRAIN.x1);
  const dz = Math.max(TERRAIN.z0 - z, 0, z - TERRAIN.z1);
  return Math.hypot(dx, dz);
}

/** How far the terrain mesh sits under the real ground inside the brick lot, hidden by the bricks. */
export const UNDER_LOT = 3;

/**
 * Ground height for the terrain mesh: the real ground, blended into the coarse far grid at the edge of the
 * near grid. Inside the brick lot it sits UNDER_LOT ft below the lowest real or designed surface (pad, driveway,
 * pool floor) within one mesh cell, so the bricks hide it.
 */
export function groundHeight(n: Neighborhood, x: number, z: number): number {
  const d = lotDistance(x, z);
  if (d === 0) {
    // lowest surface within one mesh cell in every direction, so the interpolated mesh stays under the bricks
    const s = n.near.step;
    let m = Infinity;
    for (let dz = -s; dz <= s; dz += s / 4)
      for (let dx = -s; dx <= s; dx += s / 4) m = Math.min(m, sampleGrid(n.near, x + dx, z + dz), surfaceFt(x + dx, z + dz));
    return m - UNDER_LOT;
  }
  const far = sampleGrid(n.far, x, z);
  let real = far;
  if (inGrid(n.near, x, z)) {
    const g = n.near;
    const edge = Math.min(x - g.x0, z - g.z0, g.x0 + (g.nx - 1) * g.step - x, g.z0 + (g.nz - 1) * g.step - z);
    real = sampleGrid(g, x, z) * smooth(edge / FAR_BLEND) + far * (1 - smooth(edge / FAR_BLEND));
  }
  return real;
}
