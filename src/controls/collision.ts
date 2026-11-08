import { Brick, PLATE } from '../bricks/catalog';
import { DROP_DUR } from '../build/sequencer';
import { HeightMap } from '../model/site';

/**
 * Column-span collision: for each stud cell, list of [bottom, top, landedTime].
 * Only bricks that have already landed block the walker.
 */
export class Collision {
  private cells = new Map<number, number[]>();
  constructor(bricks: Brick[], start: Float32Array, private hm: HeightMap) {
    bricks.forEach((b, i) => {
      if (b.kind === 'light' && b.y > 20) return;
      if (b.kind === 'lamp' || b.kind === 'bar') return;
      const y0 = b.y * PLATE, y1 = (b.y + b.h) * PLATE, t = start[i] + DROP_DUR;
      for (let z = b.z; z < b.z + b.d; z++)
        for (let x = b.x; x < b.x + b.w; x++) {
          const k = this.key(x, z);
          let arr = this.cells.get(k);
          if (!arr) this.cells.set(k, (arr = []));
          arr.push(y0, y1, t);
        }
    });
  }
  private key(x: number, z: number) {
    return (x + 1024) * 4096 + (z + 1024);
  }

  /** Highest landed surface at or below `maxY` in a cell. */
  ground(x: number, z: number, maxY: number, t: number) {
    const cx = Math.floor(x), cz = Math.floor(z);
    // invisible fallback terrain so you can stand anywhere before bricks arrive
    let g = this.hm.at(cx, cz) * PLATE;
    if (g > maxY) g = -Infinity;
    const arr = this.cells.get(this.key(cx, cz));
    if (arr)
      for (let i = 0; i < arr.length; i += 3)
        if (arr[i + 2] <= t && arr[i + 1] <= maxY && arr[i + 1] > g) g = arr[i + 1];
    return g;
  }

  /** Does a vertical cylinder at (x,z) from y0..y1 hit any landed brick? */
  blocked(x: number, z: number, r: number, y0: number, y1: number, t: number) {
    for (let cz = Math.floor(z - r); cz <= Math.floor(z + r); cz++)
      for (let cx = Math.floor(x - r); cx <= Math.floor(x + r); cx++) {
        // circle vs cell test
        const nx = Math.max(cx, Math.min(x, cx + 1)), nz = Math.max(cz, Math.min(z, cz + 1));
        if ((nx - x) ** 2 + (nz - z) ** 2 > r * r) continue;
        const arr = this.cells.get(this.key(cx, cz));
        if (!arr) continue;
        for (let i = 0; i < arr.length; i += 3)
          if (arr[i + 2] <= t && arr[i] < y1 && arr[i + 1] > y0) return true;
      }
    return false;
  }

  /** Lowest ceiling above y in a cell (to stop jumps through the roof). */
  ceiling(x: number, z: number, y: number, t: number) {
    const arr = this.cells.get(this.key(Math.floor(x), Math.floor(z)));
    let c = Infinity;
    if (arr)
      for (let i = 0; i < arr.length; i += 3)
        if (arr[i + 2] <= t && arr[i] >= y && arr[i] < c) c = arr[i];
    return c;
  }
}
