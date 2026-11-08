import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './ui/styles.css';
import { buildStahlHouse } from './model/stahlHouse';
import { sequence } from './build/sequencer';
import { BrickSet, roofCut } from './bricks/BrickSet';
import { Environment } from './scene/environment';
import { City } from './scene/cityBackdrop';
import { loadNeighborhood, NeighborhoodScene } from './scene/neighborhood';
import { Collision } from './controls/collision';
import { Walker } from './controls/walk';
import { attachTouch } from './controls/touch';
import { Hud } from './ui/hud';
import { CENTER } from './model/layout';

const app = document.getElementById('app')!;
const loading = document.getElementById('loading')!;
const params = new URLSearchParams(location.search);
const DEBUG = params.has('debug');
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// the real neighborhood (spec 003) downloads while the model is generated
const neighborhoodData = loadNeighborhood().catch((e) => {
  console.warn('[stahl] neighborhood unavailable', e);
  return null;
});

// ---------- build the model ----------
// let the loading screen paint before the heavy lifting
await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
const t0 = performance.now();
const { builder, heightmap } = buildStahlHouse();
const schedule = sequence(builder.bricks);
const studs = builder.computeStuds(schedule.order);
const bricks = builder.bricks;
builder.occ = new Uint8Array(0); // free memory
if (DEBUG) console.log(`[stahl] ${bricks.length} pieces, ${studs.length} studs, generated in ${(performance.now() - t0).toFixed(0)} ms`);

// ---------- renderer & scene ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
let dpr = Math.min(devicePixelRatio, isTouch ? 1.5 : 1.75);
renderer.setPixelRatio(dpr);
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.3, 25000);
camera.position.set(-95, 70, -120);

const env = new Environment(renderer, scene);
let city: City | null = null;
let hood: NeighborhoodScene | null = null;
{
  const t1 = performance.now();
  const n = await neighborhoodData;
  if (n) {
    hood = new NeighborhoodScene(n);
    city = new City(n);
    scene.add(hood.group, city.group);
    if (DEBUG) console.log(`[stahl] neighborhood: ${n.buildings.count} buildings, ${n.roads.count} roads, ready in ${(performance.now() - t1).toFixed(0)} ms`);
  }
  const credit = document.createElement('a');
  credit.className = 'credit';
  credit.href = 'https://www.openstreetmap.org/copyright';
  credit.target = '_blank';
  credit.rel = 'noopener';
  credit.textContent = '© OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles';
  app.appendChild(credit);
}

const set = new BrickSet(bricks, schedule.order, schedule.start, studs);
scene.add(set.group);

// ---------- controls ----------
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(CENTER.x, CENTER.y, CENTER.z);
orbit.enableDamping = true;
orbit.dampingFactor = 0.07;
orbit.minDistance = 12;
orbit.maxDistance = 520;
orbit.maxPolarAngle = Math.PI * 0.53;
orbit.autoRotate = true;
orbit.autoRotateSpeed = -0.35;
orbit.addEventListener('start', () => (orbit.autoRotate = false));
orbit.update();

const collision = new Collision(bricks, schedule.start, heightmap);
const walker = new Walker(camera, renderer.domElement, collision);
const touch = isTouch ? attachTouch(app, walker) : null;
touch?.show(false);

// ---------- state ----------
let t = 0;
let playing = false;
let speed = 1;
let mode: 'orbit' | 'walk' = 'orbit';
const savedOrbit = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

const currentPhase = () => {
  let p = 0;
  schedule.phaseStart.forEach((s, i) => { if (t >= s) p = i; });
  return p;
};

function setMode(m: 'orbit' | 'walk') {
  if (m === mode) return;
  mode = m;
  hud.setMode(m);
  if (m === 'walk') {
    savedOrbit.pos.copy(camera.position);
    savedOrbit.target.copy(orbit.target);
    orbit.enabled = false;
    walker.enabled = true;
    // start on the walkway by the carport, looking down the pool toward the living room
    walker.place(23.5, -16, -2.6, t);
    camera.fov = 70;
    touch?.show(true);
    if (!isTouch) walker.lock();
  } else {
    walker.enabled = false;
    document.exitPointerLock?.();
    camera.fov = 50;
    camera.position.copy(savedOrbit.pos);
    orbit.target.copy(savedOrbit.target);
    orbit.enabled = true;
    touch?.show(false);
  }
  camera.updateProjectionMatrix();
  updateWalkHint();
}

function updateWalkHint() {
  if (mode !== 'walk') return hud.setWalkHint('');
  if (isTouch) hud.setWalkHint('Left thumb: move · right thumb: look');
  else if (!walker.locked) hud.setWalkHint('Click to look around · WASD to walk · Shift to run · Space to jump · Esc to release');
  else hud.setWalkHint('');
}
renderer.domElement.addEventListener('lockchange', updateWalkHint);
renderer.domElement.addEventListener('click', () => {
  if (mode === 'walk' && !walker.locked) walker.lock();
});

const hud = new Hud(app, {
  onStart() { playing = true; },
  onPlayPause() { playing = !playing; if (t >= schedule.total) { t = 0; playing = true; } },
  onSpeed(s) { speed = s; },
  onSeek(v) { t = v; },
  onFinish() { t = schedule.total; },
  onRestart() { t = 0; playing = true; },
  onMode: setMode,
  onLight(l) { env.set(l); },
  onRoof(on) { roofCut.value = on ? 0 : 1; },
}, schedule.total, bricks.length);
hud.setPhaseTicks(schedule.phaseStart, schedule.total);

addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.code === 'KeyP') { playing = !playing; }
  if (e.code === 'KeyF' && mode === 'orbit') t = schedule.total;
  if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'orbit' ? 'walk' : 'orbit'); }
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------- debug overlay ----------
let fpsEl: HTMLElement | null = null;
if (DEBUG) {
  fpsEl = document.createElement('div');
  fpsEl.className = 'fps';
  app.appendChild(fpsEl);
  (window as any).__stahl = { seek: (v: number) => (t = v), schedule, camera, orbit, walker, setMode, env, hood: () => hood };
}

// ---------- loop ----------
const clock = new THREE.Clock();
let fpsAcc = 0, fpsFrames = 0, hudAcc = 0, slowTime = 0;
loading.remove();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  if (playing) {
    t += dt * speed;
    if (t >= schedule.total) { t = schedule.total; playing = false; }
  }
  const placed = set.update(t);

  const light = env.update(dt);
  set.setLightLevel(light);
  city?.setNight(env.nightFactor);
  hood?.setNight(env.nightFactor);

  if (mode === 'walk') walker.update(dt, t);
  else orbit.update(dt);

  renderer.render(scene, camera);

  // adaptive resolution
  fpsAcc += dt; fpsFrames++; hudAcc += dt;
  if (fpsAcc > 1) {
    const fps = fpsFrames / fpsAcc;
    if (fpsEl) fpsEl.textContent = `${fps.toFixed(0)} fps · dpr ${dpr.toFixed(2)} · ${renderer.info.render.triangles.toLocaleString()} tris · ${renderer.info.render.calls} calls`;
    if (fps < 38 && dpr > 0.75) { slowTime++; if (slowTime >= 2) { dpr = Math.max(0.75, dpr - 0.25); renderer.setPixelRatio(dpr); slowTime = 0; } }
    else slowTime = 0;
    fpsAcc = 0; fpsFrames = 0;
  }
  if (hudAcc > 0.1) {
    hudAcc = 0;
    hud.update({ t, total: schedule.total, playing, speed, placed, pieces: set.total, phase: currentPhase() });
  }
});
