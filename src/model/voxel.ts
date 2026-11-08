import { Brick, Kind, KIND_STUDS, KIND_UNIT, SIZES } from '../bricks/catalog';

/** Occupancy grid bounds (studs / plates). */
/** Must contain every piece (tests/model.test.ts, spec 001-A1); pieces outside it skip overlap checks. */
export const G = { x0: -128, nx: 280, z0: -128, nz: 272, y0: -136, ny: 200 };

export type ColorArg = number | ((x: number, y: number, z: number) => number);
export type Mask = (x: number, z: number, y: number) => boolean;

export interface BoxOpts {
  color: ColorArg;
  kind?: Kind;
  unit?: number;
  sizes?: number[][];
  mask?: Mask;
  studs?: boolean;
}

export interface Stud {
  x: number;
  z: number;
  y: number; // plates (bottom of stud = top of brick)
  brick: number;
}

/** Deterministic PRNG so every visitor sees the same house. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x: number, z: number) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function noise2(x: number, z: number) {
  const xi = Math.floor(x), zi = Math.floor(z);
  const xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export class Builder {
  bricks: Brick[] = [];
  /** 0 = empty, otherwise phase+1 of occupying brick */
  occ = new Uint8Array(G.nx * G.nz * G.ny);
  phase = 0;
  group = 0;
  /** while true, placed pieces are flagged as ceiling-hung */
  hangs = false;

  setPhase(p: number) {
    this.phase = p;
    this.group++;
  }
  newGroup() {
    this.group++;
  }

  /** Place ceiling-hung pieces: they join phase `p` and are hung after its solid pieces. */
  hanging(p: number, place: () => void) {
    const prev = this.phase;
    this.setPhase(p);
    this.hangs = true;
    place();
    this.hangs = false;
    this.setPhase(prev);
  }

  private idx(x: number, y: number, z: number) {
    x -= G.x0; z -= G.z0; y -= G.y0;
    if (x < 0 || z < 0 || y < 0 || x >= G.nx || z >= G.nz || y >= G.ny) return -1;
    return (y * G.nz + z) * G.nx + x;
  }
  occAt(x: number, y: number, z: number) {
    const i = this.idx(x, y, z);
    return i < 0 ? 0 : this.occ[i];
  }
  free(x: number, z: number, y0: number, y1: number) {
    for (let y = y0; y < y1; y++) if (this.occAt(x, y, z)) return false;
    return true;
  }
  private mark(b: Brick) {
    const v = b.phase + 1;
    for (let y = b.y; y < b.y + b.h; y++)
      for (let z = b.z; z < b.z + b.d; z++)
        for (let x = b.x; x < b.x + b.w; x++) {
          const i = this.idx(x, y, z);
          if (i >= 0) this.occ[i] = v;
        }
  }

  /** Place one explicit piece. Returns false (and places nothing) if space is taken. */
  add(
    x: number, z: number, y: number, w: number, d: number, h: number,
    color: number, kind: Kind = 'brick',
    opts: { studs?: boolean; force?: boolean } = {},
  ): boolean {
    if (!opts.force) {
      for (let zz = z; zz < z + d; zz++)
        for (let xx = x; xx < x + w; xx++) if (!this.free(xx, zz, y, y + h)) return false;
    }
    const b: Brick = {
      x, y, z, w, d, h, color, kind,
      phase: this.phase, group: this.group,
      studs: opts.studs ?? KIND_STUDS[kind],
    };
    if (this.hangs) b.hangs = true;
    this.bricks.push(b);
    this.mark(b);
    return true;
  }

  /** Stack of round pieces (columns, trunks, legs). */
  column(x: number, z: number, y0: number, y1: number, color: number, kind: Kind = 'round') {
    const unit = KIND_UNIT[kind];
    for (let y = y0; y < y1; y += unit) {
      const h = Math.min(unit, y1 - y);
      this.add(x, z, y, 1, 1, h, color, kind, { studs: kind === 'round' && y + h >= y1 });
    }
  }

  /**
   * Fill a half-open box [x0,x1)×[z0,z1)×[y0,y1) with bricks, layer by layer,
   * greedily packing the largest pieces that fit. Occupied cells are skipped.
   */
  box(x0: number, z0: number, x1: number, z1: number, y0: number, y1: number, o: BoxOpts) {
    const kind = o.kind ?? 'brick';
    const unit = o.unit ?? KIND_UNIT[kind];
    const sizes = o.sizes ?? SIZES[kind];
    const studs = o.studs ?? KIND_STUDS[kind];
    const W = x1 - x0, D = z1 - z0;
    if (W <= 0 || D <= 0 || y1 <= y0) return;
    const col = new Int32Array(W * D);
    const used = new Uint8Array(W * D);
    const colorFn = typeof o.color === 'number' ? null : o.color;
    const thin: 0 | 2 | undefined = kind === 'glass' ? (D === 1 ? 2 : W === 1 ? 0 : undefined) : undefined;
    let course = Math.floor(y0 / unit);

    for (let y = y0; y < y1; y += unit) {
      const h = Math.min(unit, y1 - y);
      used.fill(0);
      let any = false;
      for (let dz = 0; dz < D; dz++)
        for (let dx = 0; dx < W; dx++) {
          const x = x0 + dx, z = z0 + dz;
          const ok = (!o.mask || o.mask(x, z, y)) && this.free(x, z, y, y + h);
          const k = dz * W + dx;
          col[k] = ok ? (colorFn ? colorFn(x, y, z) : (o.color as number)) : -1;
          if (ok) any = true;
        }
      if (!any) { course++; continue; }
      const odd = (course & 1) === 1;

      for (let dz = 0; dz < D; dz++)
        for (let dx = 0; dx < W; dx++) {
          const k = dz * W + dx;
          if (col[k] < 0 || used[k]) continue;
          const c = col[k];
          const runStartX = dx === 0 || col[k - 1] !== c;
          const runStartZ = dz === 0 || col[k - W] !== c;
          let done = false;
          for (const [a, b] of sizes) {
            for (let pass = 0; pass < 2 && !done; pass++) {
              const along = odd ? 1 - pass : pass; // 0: long side along x
              if (a === b && pass === 1) continue;
              const lx = along === 0 ? a : b;
              const lz = along === 0 ? b : a;
              // running bond: on odd courses, the first piece of a run is short
              if (odd && lx > 2 && lx > lz && runStartX) continue;
              if (odd && lz > 2 && lz > lx && runStartZ) continue;
              if (dx + lx > W || dz + lz > D) continue;
              let fits = true;
              for (let iz = 0; iz < lz && fits; iz++)
                for (let ix = 0; ix < lx; ix++) {
                  const kk = (dz + iz) * W + dx + ix;
                  if (used[kk] || col[kk] !== c) { fits = false; break; }
                }
              if (!fits) continue;
              for (let iz = 0; iz < lz; iz++)
                for (let ix = 0; ix < lx; ix++) used[(dz + iz) * W + dx + ix] = 1;
              const br: Brick = {
                x: x0 + dx, y, z: z0 + dz, w: lx, d: lz, h, color: c, kind,
                phase: this.phase, group: this.group, studs, thin,
              };
              if (this.hangs) br.hangs = true;
              this.bricks.push(br);
              this.mark(br);
              done = true;
            }
            if (done) break;
          }
          if (!done) {
            // fallback 1x1
            used[k] = 1;
            const br: Brick = {
              x: x0 + dx, y, z: z0 + dz, w: 1, d: 1, h, color: c, kind,
              phase: this.phase, group: this.group, studs, thin,
            };
            if (this.hangs) br.hangs = true;
            this.bricks.push(br);
            this.mark(br);
          }
        }
      course++;
    }
  }

  /** Compute studs that will be seen at some point during the build. */
  computeStuds(order: number[]): Stud[] {
    const out: Stud[] = [];
    for (const bi of order) {
      const b = this.bricks[bi];
      if (!b.studs) continue;
      const top = b.y + b.h;
      for (let z = b.z; z < b.z + b.d; z++)
        for (let x = b.x; x < b.x + b.w; x++) {
          const o = this.occAt(x, top, z);
          if (o === 0 || o - 1 > b.phase) out.push({ x, z, y: top, brick: bi });
        }
    }
    return out;
  }
}
