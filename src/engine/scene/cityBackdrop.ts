import * as THREE from 'three';
import { rng } from '@/engine/voxel';
import { Neighborhood, sampleGrid } from '@/engine/scene/neighborhoodData';

/**
 * The Los Angeles basin beyond the real neighborhood (spec 003): procedural blocks and a carpet of
 * lights at true scale, placed only where the real far terrain is low and flat, i.e. the basin,
 * not the Santa Monica Mountains.
 */
export class City {
  group = new THREE.Group();
  private lights: THREE.PointsMaterial;
  private glow: THREE.PointsMaterial;
  private blocks: THREE.MeshStandardMaterial;

  /** `downtownDir`: model-space direction from the house toward downtown */
  constructor(n: Neighborhood, downtownDir: [number, number]) {
    const r = rng(1960);
    const cx = n.anchor.offsetX, cz = n.anchor.offsetZ;
    const R0 = 1200 / 0.3048 + 150; // real data covers everything inside this
    const R1 = 24000;
    const f = n.far;
    const h = (x: number, z: number) => sampleGrid(f, x, z);
    const inCity = (x: number, z: number) => {
      const d = Math.hypot(x - cx, z - cz);
      if (d < R0 || d > R1) return false;
      const y = h(x, z);
      if (y > -300) return false; // hills and mountains
      const s = Math.abs(h(x + 250, z) - y) + Math.abs(h(x, z + 250) - y);
      return s < 45; // flat ground only
    };
    // downtown: along the house's real bearing to it (in model space), pulled in to 16,000 ft
    const dir = new THREE.Vector2(downtownDir[0], downtownDir[1]).normalize();
    const downtown = new THREE.Vector2(cx + dir.x * 16000, cz + dir.y * 16000);

    // buildings: houses and low blocks on a ~330 ft LA street grid, towers downtown
    const N = 45000;
    this.blocks = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    const bgeo = new THREE.BoxGeometry(1, 1, 1);
    bgeo.translate(0, 0.5, 0);
    const bm = new THREE.InstancedMesh(bgeo, this.blocks, N);
    const m = new THREE.Matrix4(), col = new THREE.Color();
    const palette = [0xb9ae98, 0xa89c86, 0xcfc5b0, 0x948c80, 0xb7a58a, 0x8a9096, 0x7d8a66, 0xe9e6dc];
    let count = 0;
    for (let tries = 0; count < N && tries < N * 6; tries++) {
      const ang = r() * Math.PI * 2, rad = R0 + Math.pow(r(), 1.6) * (R1 - R0);
      let x = cx + Math.cos(ang) * rad, z = cz + Math.sin(ang) * rad;
      const dd = Math.hypot(x - downtown.x, z - downtown.y);
      if (dd < 1400 && r() < 0.5) { x = downtown.x + (r() - 0.5) * 2400; z = downtown.y + (r() - 0.5) * 2400; }
      // snap into a lot inside a 330 ft block (streets 50 ft wide)
      const bx = Math.floor(x / 330) * 330, bz = Math.floor(z / 330) * 330;
      const lx = bx + 40 + Math.floor(r() * 4) * 62, lz = bz + 40 + Math.floor(r() * 2) * 125;
      if (!inCity(lx, lz)) continue;
      const ddd = Math.hypot(lx - downtown.x, lz - downtown.y);
      let w = 30 + r() * 30, d = 35 + r() * 60, hh = 14 + r() * 18;
      if (ddd < 1300) { w = 80 + r() * 120; d = 80 + r() * 120; hh = 120 + Math.pow(r(), 2) * 800; }
      else if (ddd < 4000) hh += r() * 60;
      else if (r() < 0.04) { w += 60; d += 60; hh += 40 + r() * 80; } // the odd apartment block or office
      m.makeScale(w, hh, d).setPosition(lx + w / 2, h(lx, lz) - 2, lz + d / 2);
      bm.setMatrixAt(count, m);
      bm.setColorAt(count, col.setHex(palette[Math.floor(r() * palette.length)]));
      count++;
    }
    bm.count = count;
    this.group.add(bm);

    // street lights along the grid; boulevards every ~1/2 mile are brighter
    const pts: number[] = [], cols: number[] = [];
    const warm = new THREE.Color(0xffb15c), white = new THREE.Color(0xfff1d8), blue = new THREE.Color(0xbfd6ff);
    const addPt = (x: number, z: number) => {
      if (!inCity(x, z)) return;
      pts.push(x, h(x, z) + 3, z);
      const c = r() < 0.75 ? warm : r() < 0.7 ? white : blue;
      cols.push(c.r, c.g, c.b);
    };
    const span = R1 + 2000;
    for (let g = -span; g <= span; g += 330) {
      const major = Math.round(g / 330) % 8 === 0;
      const step = major ? 60 : 140;
      for (let t = -span; t < span; t += step) {
        if (r() < 0.85) addPt(Math.round((cx + g) / 330) * 330, cz + t);
        if (r() < 0.85) addPt(cx + t, Math.round((cz + g) / 330) * 330);
      }
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const mk = (size: number) => new THREE.PointsMaterial({
      size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    this.lights = mk(2.2);
    this.glow = mk(7);
    for (const mat of [this.lights, this.glow]) {
      const p = new THREE.Points(pg, mat);
      p.frustumCulled = false;
      this.group.add(p);
    }
  }

  setNight(f: number) {
    this.lights.opacity = f;
    this.glow.opacity = f * 0.08;
    this.lights.visible = this.glow.visible = f > 0.01;
    this.blocks.color.setRGB(1, 1, 1).lerp(new THREE.Color(0x2a2a38), f);
  }
}
