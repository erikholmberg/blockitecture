import * as THREE from 'three';
import { CENTER, CITY_Y } from '../model/layout';
import { rng } from '../model/voxel';

/** The Los Angeles basin below the hill: a street grid of low blocks and a carpet of lights. */
export class City {
  group = new THREE.Group();
  private lights: THREE.PointsMaterial;
  private glow: THREE.PointsMaterial;
  private ground: THREE.MeshStandardMaterial;
  private blocks: THREE.MeshStandardMaterial;

  constructor() {
    const r = rng(1960);
    const cx = CENTER.x, cz = CENTER.z;
    // ground
    this.ground = new THREE.MeshStandardMaterial({ color: 0x948d78, roughness: 1 });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), this.ground);
    g.rotation.x = -Math.PI / 2;
    g.position.set(cx, CITY_Y - 0.05, cz);
    g.receiveShadow = true;
    this.group.add(g);

    const inCity = (x: number, z: number) => {
      const dx = x - cx, dz = z - cz;
      const d = Math.hypot(dx, dz);
      if (d < 150) return false;
      // hills to the north
      if (dz < -120 && dz < -0.4 * Math.abs(dx)) return false;
      return d < 2600;
    };

    // buildings
    const N = 40000;
    this.blocks = new THREE.MeshStandardMaterial({ roughness: 0.9 });
    const bgeo = new THREE.BoxGeometry(1, 1, 1);
    bgeo.translate(0, 0.5, 0);
    const bm = new THREE.InstancedMesh(bgeo, this.blocks, N);
    const m = new THREE.Matrix4(), col = new THREE.Color();
    const palette = [0xb9ae98, 0xa89c86, 0xcfc5b0, 0x948c80, 0xb7a58a, 0x8a9096, 0x7d8a66];
    const downtown = new THREE.Vector2(cx + 900, cz + 650);
    let n = 0;
    for (let tries = 0; n < N && tries < N * 4; tries++) {
      const ang = r() * Math.PI * 2, rad = 150 + Math.pow(r(), 1.5) * 2300;
      const x = cx + Math.cos(ang) * rad, z = cz + Math.sin(ang) * rad;
      if (!inCity(x, z)) continue;
      const gx = Math.floor(x / 16) * 16 + 3 + Math.floor(r() * 2) * 6, gz = Math.floor(z / 16) * 16 + 3 + Math.floor(r() * 2) * 6;
      const dd = Math.hypot(gx - downtown.x, gz - downtown.y);
      let h = 1 + r() * 3;
      if (dd < 160) h = 15 + r() * 70;
      else if (dd < 400) h += r() * 12;
      const w = 3 + r() * 4, d = 3 + r() * 4;
      m.makeScale(w, h, d).setPosition(gx, CITY_Y, gz);
      bm.setMatrixAt(n, m);
      bm.setColorAt(n, col.setHex(palette[Math.floor(r() * palette.length)]));
      n++;
    }
    bm.count = n;
    bm.receiveShadow = false;
    this.group.add(bm);

    // street lights along the grid
    const pts: number[] = [], cols: number[] = [];
    const warm = new THREE.Color(0xffb15c), white = new THREE.Color(0xfff1d8), blue = new THREE.Color(0xbfd6ff);
    const addPt = (x: number, z: number) => {
      if (!inCity(x, z)) return;
      pts.push(x, CITY_Y + 0.6, z);
      const c = r() < 0.75 ? warm : r() < 0.7 ? white : blue;
      cols.push(c.r, c.g, c.b);
    };
    for (let gx = -2400; gx <= 2400; gx += 16) {
      const x = Math.round((cx + gx) / 16) * 16;
      const step = Math.abs(gx) % 160 === 0 ? 2 : 5; // boulevards brighter
      for (let z = cz - 2400; z < cz + 2400; z += step) if (r() < 0.8) addPt(x, z);
    }
    for (let gz = -2400; gz <= 2400; gz += 16) {
      const z = Math.round((cz + gz) / 16) * 16;
      const step = Math.abs(gz) % 160 === 0 ? 2 : 5;
      for (let x = cx - 2400; x < cx + 2400; x += step) if (r() < 0.8) addPt(x, z);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    pg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    this.lights = new THREE.PointsMaterial({
      size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    const p = new THREE.Points(pg, this.lights);
    p.frustumCulled = false;
    this.group.add(p);
    // soft glow pass (bigger, dimmer)
    this.glow = new THREE.PointsMaterial({
      size: 7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    const p2 = new THREE.Points(pg, this.glow);
    p2.frustumCulled = false;
    this.group.add(p2);
  }

  setNight(f: number) {
    this.lights.opacity = f;
    this.glow.opacity = f * 0.08;
    this.lights.visible = this.glow.visible = f > 0.01;
    this.ground.color.setHex(0x948d78).lerp(new THREE.Color(0x15141c), f);
    this.blocks.color.setRGB(1, 1, 1).lerp(new THREE.Color(0x2a2a38), f);
  }
}
