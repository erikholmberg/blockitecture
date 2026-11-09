import * as THREE from 'three';
import { groundHeight, inGrid, isWater, lotDistance, Neighborhood, parseNeighborhood, sampleGrid, seaMeshHeight, waterMask } from '@/engine/scene/neighborhoodData';
import { hash2, noise2 } from '@/engine/voxel';
import type { Lot, Scenery } from '@/engine/house';

/**
 * Spec 003: the real Hollywood Hills around the house: terrain, roads and buildings from
 * OpenStreetMap / AWS Terrain Tiles (public/<slug>/neighborhood.bin). Scenery only, not part of the build.
 */
export class NeighborhoodScene {
  group = new THREE.Group();
  private lights: THREE.PointsMaterial;
  private glow: THREE.PointsMaterial;
  private mats: THREE.MeshStandardMaterial[] = [];

  private seaY: number | null;
  private flatsBelow: number;
  private chaparral: boolean;

  constructor(private n: Neighborhood, private lot: Lot, scenery: Scenery = {}) {
    this.seaY = scenery.sea ? -n.anchor.lotElevationM / 0.3048 : null;
    this.flatsBelow = scenery.flatsBelow ?? -330;
    this.chaparral = scenery.chaparral ?? false;
    const ground = (x: number, z: number) => groundHeight(n, lot, x, z);
    if (this.seaY !== null) this.group.add(this.sea(this.seaY));
    this.group.add(this.terrain(ground));
    this.group.add(this.farTerrain());
    this.group.add(this.roads(ground));
    this.group.add(this.buildings(ground));

    const pts = this.nightPoints(ground);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pts.pos, 3));
    pg.setAttribute('color', new THREE.Float32BufferAttribute(pts.col, 3));
    const mk = (size: number) => new THREE.PointsMaterial({
      size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    this.lights = mk(2.4);
    this.glow = mk(7);
    for (const m of [this.lights, this.glow]) {
      const p = new THREE.Points(pg, m);
      p.frustumCulled = false;
      this.group.add(p);
    }
  }

  // ---------- terrain ----------
  private terrainColor(x: number, z: number, y: number, slope: number, c: THREE.Color) {
    const nz = noise2(x * 0.012, z * 0.012), r = hash2(Math.floor(x / 40), Math.floor(z / 40));
    if (this.seaY !== null && y < this.seaY + 6) return c.setHex(y < this.seaY ? 0xbfae86 : 0xd8c9a0); // beach and sea floor
    if (y < this.flatsBelow && slope < 0.12) return c.setHex(nz < 0.5 ? 0x9a948a : 0xa39d90); // the flats: built-up
    if (this.chaparral && slope > 0.9 && slope < 2.2) return c.setHex(nz < 0.5 ? 0x4f6b44 : r < 0.5 ? 0x6b7550 : 0x5c6f4a); // chaparral
    if (slope > 0.9) return c.setHex(r < 0.5 ? 0x8b8378 : 0x958a73); // cut rock / bare slope
    // chaparral and dry grass, like the brick hillside palette
    if (nz < 0.35) return c.setHex(0x5f7a4e);
    if (nz < 0.55) return c.setHex(r < 0.3 ? 0x8d8b4f : 0x6f8a5a);
    return c.setHex(r < 0.4 ? 0xb3a274 : 0x8fae9a);
  }

  /** the sea: one flat sheet at true sea level under everything (vertex-coloured, so dusk can tint it) */
  private sea(y: number) {
    const f = this.n.far, half = ((f.nx - 1) * f.step) / 2 + 20000;
    const g = new THREE.PlaneGeometry(half * 2, half * 2, 1, 1).rotateX(-Math.PI / 2);
    g.translate(f.x0 + ((f.nx - 1) * f.step) / 2, y, f.z0 + ((f.nz - 1) * f.step) / 2);
    const c = new THREE.Color(0x2e6b86);
    g.setAttribute('color', new THREE.Float32BufferAttribute(Array.from({ length: 4 }, () => [c.r, c.g, c.b]).flat(), 3));
    // pushed slightly back in depth, so terrain just above the waterline always wins against it (spec 011)
    return new THREE.Mesh(g, this.material({ roughness: 0.18, metalness: 0.15, polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 4 }));
  }

  private gridMesh(
    x0: number, z0: number, step: number, nx: number, nz: number,
    height: (x: number, z: number) => number,
    skipCell: (x: number, z: number) => boolean,
  ) {
    const pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3);
    const c = new THREE.Color();
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const x = x0 + i * step, z = z0 + j * step, y = height(x, z);
        const k = (j * nx + i) * 3;
        pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
        const slope = Math.abs(height(x + step, z) - y) / step + Math.abs(height(x, z + step) - y) / step;
        this.terrainColor(x, z, y, slope, c);
        col[k] = c.r; col[k + 1] = c.g; col[k + 2] = c.b;
      }
    const idx: number[] = [];
    for (let j = 0; j < nz - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        if (skipCell(x0 + (i + 0.5) * step, z0 + (j + 0.5) * step)) continue;
        const a = j * nx + i, b = a + 1, d = a + nx, e = d + 1;
        idx.push(a, d, b, b, d, e);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  private material(opts: THREE.MeshStandardMaterialParameters = {}) {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, ...opts });
    this.mats.push(m);
    return m;
  }

  private terrain(ground: (x: number, z: number) => number) {
    const g = this.n.near;
    // no hole under the brick lot: there the ground sits just below the bricks' lowest course
    // under the sea, rendered terrain drops well below it so the two never z-fight (spec 011)
    const water = this.seaY !== null ? waterMask(g, this.seaY) : null;
    const h = (x: number, z: number) => seaMeshHeight(ground(x, z), this.seaY, !!water && isWater(g, water, x, z));
    const geo = this.gridMesh(g.x0, g.z0, g.step, g.nx, g.nz, h, () => false);
    const m = new THREE.Mesh(geo, this.material());
    m.receiveShadow = true;
    return m;
  }

  private farTerrain() {
    const f = this.n.far, near = this.n.near;
    const water = this.seaY !== null ? waterMask(f, this.seaY) : null;
    // just under the near terrain where they overlap; under the sea, well below it (spec 011)
    const h = (x: number, z: number) => seaMeshHeight(sampleGrid(f, x, z) - 4, this.seaY, !!water && isWater(f, water, x, z));
    const inside = (x: number, z: number) =>
      inGrid(near, x - f.step, z - f.step) && inGrid(near, x + f.step, z + f.step);
    return new THREE.Mesh(this.gridMesh(f.x0, f.z0, f.step, f.nx, f.nz, h, inside), this.material());
  }

  // ---------- roads ----------
  private roads(ground: (x: number, z: number) => number) {
    const { xz, start, cls, count } = this.n.roads;
    const WIDTH = [12, 24, 36, 56];
    const COLOR = [0x77746c, 0x5d5d5a, 0x4f504f, 0x4a4c4e];
    const pos: number[] = [], col: number[] = [];
    const c = new THREE.Color();
    const paths: { pts: [number, number][]; cls: number; connector?: boolean }[] = [];
    for (let r = 0; r < count; r++) {
      const pts: [number, number][] = [];
      for (let p = start[r]; p < start[r + 1]; p++) pts.push([xz[p * 2], xz[p * 2 + 1]]);
      paths.push({ pts, cls: cls[r] });
    }
    // spec 004: join the brick driveway's end (if the house has one) to the nearest real street
    const end = this.lot.driveEnd;
    if (end) {
      let best: [number, number] = end, bestD = Infinity;
      for (const { pts, cls: k } of paths) {
        if (k === 0) continue; // not service roads
        for (let i = 0; i < pts.length - 1; i++) {
          const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
          const L2 = (bx - ax) ** 2 + (bz - az) ** 2 || 1;
          const t = Math.max(0, Math.min(1, ((end[0] - ax) * (bx - ax) + (end[1] - az) * (bz - az)) / L2));
          const px = ax + (bx - ax) * t, pz = az + (bz - az) * t, d = Math.hypot(px - end[0], pz - end[1]);
          if (d < bestD) { bestD = d; best = [px, pz]; }
        }
      }
      if (bestD < 400) paths.push({ pts: [[end[0] - 1, end[1]], best], cls: 0, connector: true });
    }
    for (const { pts, cls: k, connector } of paths) {
      const hw = WIDTH[k] / 2;
      c.setHex(connector ? 0xc9c3b5 : COLOR[k]);
      // resample to ≤ 16 ft segments so the ribbon follows the ground
      const line: [number, number][] = [];
      for (let p = 0; p < pts.length - 1; p++) {
        const [ax, az] = pts[p], [bx, bz] = pts[p + 1];
        const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / 16));
        for (let s = 0; s < steps; s++) line.push([ax + ((bx - ax) * s) / steps, az + ((bz - az) * s) / steps]);
      }
      line.push(pts[pts.length - 1]);
      for (let i = 0; i < line.length - 1; i++) {
        const [ax, az] = line[i], [bx, bz] = line[i + 1];
        if (lotDistance(this.lot, ax, az) < 2 || lotDistance(this.lot, bx, bz) < 2) continue; // the brick lot has its own road
        const L = Math.hypot(bx - ax, bz - az) || 1;
        const px = (-(bz - az) / L) * hw, pz = ((bx - ax) / L) * hw;
        const v = (x: number, z: number) => { pos.push(x, ground(x, z) + 1.2, z); col.push(c.r, c.g, c.b); };
        v(ax + px, az + pz); v(ax - px, az - pz); v(bx + px, bz + pz);
        v(bx + px, bz + pz); v(ax - px, az - pz); v(bx - px, bz - pz);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, this.material({ side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.receiveShadow = true;
    return m;
  }

  // ---------- buildings ----------
  private buildings(ground: (x: number, z: number) => number) {
    const b = this.n.buildings;
    const WALLS = [
      [0xf2efe6, 0xe9e2d0, 0xdcd3bf, 0xf4f4f4, 0xcfc5b0, 0xe6d6b8, 0xbfc4c2], // houses: stucco, white, sand
      [0xd9d0bc, 0xc9c3b5, 0xe9e6dc, 0xb9ae98, 0xa8a49a], // apartments
      [0xa0a5a9, 0xc9c3b5, 0x8a9096, 0xd9d0bc], // commercial
    ];
    const ROOFS = [0x9c978b, 0x7d7a74, 0xb5643c, 0xa0583a, 0x6c6e68, 0xc9c3b5, 0xe9e6dc];
    const pos: number[] = [], nor: number[] = [], col: number[] = [];
    const wc = new THREE.Color(), rc = new THREE.Color();
    const push = (x: number, y: number, z: number, n: THREE.Vector3, c: THREE.Color) => {
      pos.push(x, y, z); nor.push(n.x, n.y, n.z); col.push(c.r, c.g, c.b);
    };
    const nrm = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < b.count; i++) {
      const s = b.start[i], e = b.start[i + 1];
      const ring: THREE.Vector2[] = [];
      let minG = Infinity, cx = 0, cz = 0;
      for (let p = s; p < e; p++) {
        const x = b.xz[p * 2], z = b.xz[p * 2 + 1];
        ring.push(new THREE.Vector2(x, z));
        minG = Math.min(minG, ground(x, z));
        cx += x / (e - s); cz += z / (e - s);
      }
      // follow the blended ground near the lot: shift the whole building with its base
      const shift = minG - 2 - b.base[i];
      const y0 = b.base[i] + shift, y1 = b.top[i] + shift;
      const h = hash2(Math.round(cx), Math.round(cz));
      const pal = WALLS[b.kind[i]] ?? WALLS[0];
      wc.setHex(pal[Math.floor(h * pal.length)]);
      rc.setHex(ROOFS[Math.floor(hash2(Math.round(cz), Math.round(cx)) * ROOFS.length)]);
      // make the ring counter-clockwise (in x,z) so wall normals point out
      if (THREE.ShapeUtils.isClockWise(ring)) ring.reverse();
      for (let k = 0; k < ring.length; k++) {
        const a = ring[k], c = ring[(k + 1) % ring.length];
        nrm.set(c.y - a.y, 0, -(c.x - a.x)).normalize();
        push(a.x, y0, a.y, nrm, wc); push(c.x, y0, c.y, nrm, wc); push(a.x, y1, a.y, nrm, wc);
        push(a.x, y1, a.y, nrm, wc); push(c.x, y0, c.y, nrm, wc); push(c.x, y1, c.y, nrm, wc);
      }
      for (const [a, c, d] of THREE.ShapeUtils.triangulateShape(ring, [])) {
        push(ring[a].x, y1, ring[a].y, up, rc); push(ring[d].x, y1, ring[d].y, up, rc); push(ring[c].x, y1, ring[c].y, up, rc);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, this.material({ roughness: 0.85, side: THREE.DoubleSide }));
    m.receiveShadow = true;
    return m;
  }

  // ---------- dusk ----------
  private nightPoints(ground: (x: number, z: number) => number) {
    const pos: number[] = [], col: number[] = [];
    const warm = new THREE.Color(0xffb15c), white = new THREE.Color(0xfff1d8), sodium = new THREE.Color(0xffa040);
    // windows: one or two warm lights per building, a bit above its base
    const b = this.n.buildings;
    for (let i = 0; i < b.count; i++) {
      const s = b.start[i], e = b.start[i + 1];
      let cx = 0, cz = 0;
      for (let p = s; p < e; p++) { cx += b.xz[p * 2] / (e - s); cz += b.xz[p * 2 + 1] / (e - s); }
      const r = hash2(Math.round(cx * 3), Math.round(cz * 3));
      if (r < 0.2) continue;
      const y = ground(cx, cz) + 6 + r * 6;
      pos.push(cx, y, cz);
      const c = r < 0.75 ? warm : white;
      col.push(c.r, c.g, c.b);
    }
    // street lights along the real roads, ~every 90 ft
    const { xz, start, count } = this.n.roads;
    for (let r = 0; r < count; r++) {
      let acc = 0;
      for (let p = start[r]; p < start[r + 1] - 1; p++) {
        const ax = xz[p * 2], az = xz[p * 2 + 1], bx = xz[p * 2 + 2], bz = xz[p * 2 + 3];
        const L = Math.hypot(bx - ax, bz - az);
        for (let t = (90 - acc) % 90; t < L; t += 90) {
          const x = ax + ((bx - ax) * t) / L, z = az + ((bz - az) * t) / L;
          if (lotDistance(this.lot, x, z) < 4) continue;
          pos.push(x, ground(x, z) + 3, z);
          col.push(sodium.r, sodium.g, sodium.b);
        }
        acc = (acc + L) % 90;
      }
    }
    return { pos, col };
  }

  setNight(f: number) {
    this.lights.opacity = f;
    this.glow.opacity = f * 0.08;
    this.lights.visible = this.glow.visible = f > 0.01;
    for (const m of this.mats) m.color.setRGB(1, 1, 1).lerp(new THREE.Color(0x2a2a38), f * 0.85);
  }
}

/** Fetch the neighborhood from our own static file (never from a map service). */
export async function loadNeighborhood(path: string): Promise<Neighborhood> {
  // absolute path under BASE_URL: works with and without the page's trailing slash (spec 007)
  const res = await fetch(`${import.meta.env.BASE_URL}${path}`);
  if (!res.ok) throw new Error(`neighborhood.bin: ${res.status}`);
  return parseNeighborhood(await res.arrayBuffer());
}
