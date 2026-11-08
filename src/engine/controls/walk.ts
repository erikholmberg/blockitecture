import * as THREE from 'three';
import { Collision } from '@/engine/controls/collision';

const EYE = 5.4;
const HEIGHT = 5.9;
const RADIUS = 0.7;
const STEP = 1.3;
const GRAVITY = 40;

/** First-person walker with pointer-lock (desktop) or virtual joystick (touch). */
export class Walker {
  pos = new THREE.Vector3();
  vel = new THREE.Vector3();
  yaw = 0;
  pitch = 0;
  onGround = false;
  keys = new Set<string>();
  /** joystick input in [-1,1] */
  stick = { x: 0, y: 0 };
  enabled = false;
  locked = false;

  /** `start`: where walk mode begins and where you respawn after falling off the world (x, z, yaw) */
  constructor(private camera: THREE.PerspectiveCamera, private dom: HTMLElement, private col: Collision, private start: [number, number, number]) {
    addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === this.dom;
      this.dom.dispatchEvent(new Event('lockchange'));
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled || !this.locked) return;
      this.look(e.movementX, e.movementY, 0.0022);
    });
  }

  look(dx: number, dy: number, s: number) {
    this.yaw -= dx * s;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - dy * s));
  }

  lock() {
    if ('ontouchstart' in window) return;
    try {
      const r = this.dom.requestPointerLock?.() as unknown as Promise<void> | undefined;
      r?.catch?.(() => {});
    } catch { /* needs a user gesture; the hint asks for a click */ }
  }

  place(x: number, z: number, yaw: number, t: number, maxY = 4) {
    this.pos.set(x, this.col.ground(x, z, maxY, t), z);
    this.vel.set(0, 0, 0);
    this.yaw = yaw;
    this.pitch = -0.05;
  }

  update(dt: number, t: number) {
    dt = Math.min(dt, 0.05);
    const k = this.keys;
    let fx = 0, fz = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) fz += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) fz -= 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) fx -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) fx += 1;
    fx += this.stick.x;
    fz += this.stick.y;
    const len = Math.hypot(fx, fz);
    if (len > 1) { fx /= len; fz /= len; }
    const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? 18 : 8;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    // forward is -z in camera space
    const mx = (-sin * fz + cos * fx) * speed * dt;
    const mz = (-cos * fz - sin * fx) * speed * dt;

    const p = this.pos;
    const tryMove = (nx: number, nz: number) => {
      if (this.col.blocked(nx, nz, RADIUS, p.y + STEP, p.y + HEIGHT, t)) return false;
      p.x = nx; p.z = nz;
      return true;
    };
    // move with sliding, substeps to avoid tunnelling through thin glass
    const steps = Math.ceil(Math.hypot(mx, mz) / 0.3) || 1;
    for (let i = 0; i < steps; i++) {
      if (!tryMove(p.x + mx / steps, p.z + mz / steps)) {
        tryMove(p.x + mx / steps, p.z) || tryMove(p.x, p.z + mz / steps);
      }
    }

    // vertical
    if (this.onGround && k.has('Space')) { this.vel.y = 13; this.onGround = false; }
    this.vel.y -= GRAVITY * dt;
    let ny = p.y + this.vel.y * dt;
    const g = this.col.ground(p.x, p.z, p.y + STEP, t);
    if (this.vel.y > 0) {
      const c = this.col.ceiling(p.x, p.z, p.y + HEIGHT - 0.01, t);
      if (ny + HEIGHT > c) { ny = c - HEIGHT; this.vel.y = 0; }
    }
    if (ny <= g) {
      // step up smoothly
      ny = g > p.y ? Math.min(g, p.y + 20 * dt + 0.3) : g;
      this.vel.y = 0;
      this.onGround = true;
    } else this.onGround = ny - g < 0.05;
    p.y = ny;
    if (p.y < -200) this.place(...this.start, t);

    this.camera.position.set(p.x, p.y + EYE, p.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
