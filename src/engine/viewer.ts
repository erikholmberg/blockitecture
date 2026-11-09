import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import '@/styles/globals.css';
import '@/engine/ui/styles.css';
import { sequence } from '@/engine/sequencer';
import { clampAboveGround, groundLookup } from '@/engine/controls/ground';
import { BrickSet, roofCut, waterTime } from '@/engine/BrickSet';
import { Environment } from '@/engine/scene/environment';
import { City } from '@/engine/scene/cityBackdrop';
import { loadNeighborhood, NeighborhoodScene } from '@/engine/scene/neighborhood';
import { Collision } from '@/engine/controls/collision';
import { Walker } from '@/engine/controls/walk';
import { attachTouch } from '@/engine/controls/touch';
import { isTap } from '@/engine/controls/tap';
import { CamAction, mountHud } from '@/engine/ui/Hud';
import { Glide, MAX_DIST, MIN_DIST, orbitNear, rotated, View, WALK_NEAR, zoomed } from '@/engine/controls/cameraMoves';
import { wantsCity, type HouseDefinition } from '@/engine/house';
import { dateParam, sunFor } from '@/engine/scene/sun';

/**
 * Spec 010a: the viewer for one house. Each house page calls this with its HouseDefinition;
 * nothing in src/engine knows about any particular house.
 */
export async function startViewer(house: HouseDefinition) {
  const app = document.getElementById('app')!;
  const loading = document.getElementById('loading')!;
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');
  // spec 007: ?view=<key>&light=dusk for sharing a view; &clean = finished house, no HUD (for thumbnails)
  const VIEW_PARAM = params.get('view');
  const LIGHT_PARAM = params.get('light') === 'dusk' ? 'dusk' : 'day';
  const CLEAN = params.has('clean');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // the real neighborhood (spec 003) downloads while the model is generated
  const neighborhoodData = loadNeighborhood(house.data).catch((e) => {
    console.warn(`[${house.slug}] neighborhood unavailable`, e);
    return null;
  });

  // ---------- build the model ----------
  // let the loading screen paint before the heavy lifting
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  const t0 = performance.now();
  const { builder, heightmap } = house.build();
  const schedule = sequence(builder.bricks, house.phases, house.center);
  const studs = builder.computeStuds(schedule.order);
  const bricks = builder.bricks;
  builder.occ = new Uint8Array(0); // free memory
  if (DEBUG) console.log(`[${house.slug}] ${bricks.length} pieces, ${studs.length} studs, generated in ${(performance.now() - t0).toFixed(0)} ms`);

  // ---------- renderer & scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  // ?dpr=1.75 pins the pixel ratio and turns off adaptive resolution (for like-for-like performance checks)
  const FIXED_DPR = params.has('dpr') ? Number(params.get('dpr')) : 0;
  let dpr = FIXED_DPR || Math.min(devicePixelRatio, isTouch ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.3, 25000);
  { const p = house.views.overview.view.pos; camera.position.set(p.x, p.y, p.z); }

  // the real sun for this house on the visitor's today, or ?date=YYYY-MM-DD (spec 009)
  const SUN_DAY = dateParam(params.get('date'));
  const sun = { day: sunFor(SUN_DAY, house.site, 'day'), dusk: sunFor(SUN_DAY, house.site, 'dusk') };
  const env = new Environment(renderer, scene, sun, house);
  if (DEBUG) console.log(`[${house.slug}] sun on ${SUN_DAY}: day ${sun.day.bearing.toFixed(0)}° / ${sun.day.elevation.toFixed(0)}°, dusk ${sun.dusk.bearing.toFixed(0)}° / ${sun.dusk.elevation.toFixed(1)}°`);
  let city: City | null = null;
  let hood: NeighborhoodScene | null = null;
  {
    const t1 = performance.now();
    const n = await neighborhoodData;
    if (n) {
      hood = new NeighborhoodScene(n, house.lot, house.scenery);
      scene.add(hood.group);
      if (wantsCity(house.scenery)) {
        city = new City(n, house.downtownDir, house.scenery);
        scene.add(city.group);
      }
      if (DEBUG) console.log(`[${house.slug}] neighborhood: ${n.buildings.count} buildings, ${n.roads.count} roads, ready in ${(performance.now() - t1).toFixed(0)} ms`);
    }
    // the OSM credit is rendered by the HUD (src/ui/Hud.tsx)
  }

  // spec 028: the orbit camera never goes below the ground (or the water) under it
  const ground = groundLookup({ heightmap, lot: house.lot, n: hood ? await neighborhoodData : null, scenery: house.scenery });

  const set = new BrickSet(bricks, schedule.order, schedule.start, studs, house.roofCut, {
    flowingWater: house.scenery?.flowingWater,
  });
  scene.add(set.group);

  // ---------- controls ----------
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(house.center.x, house.center.y, house.center.z);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.07;
  orbit.minDistance = MIN_DIST;
  orbit.maxDistance = MAX_DIST; // spec 006 (was 520)
  orbit.maxPolarAngle = Math.PI * 0.53;
  orbit.autoRotate = true;
  orbit.autoRotateSpeed = -0.35;
  // grabbing the scene stops auto-rotation and any glide in progress (spec 006)
  orbit.addEventListener('start', () => {
    orbit.autoRotate = false;
    glide = null;
    hud.setAutoRotate(false);
  });
  let glide: Glide | null = null;
  const currentView = (): View => ({
    pos: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
    target: { x: orbit.target.x, y: orbit.target.y, z: orbit.target.z },
  });

  function camAction(a: CamAction) {
    if (mode !== 'orbit') return;
    if (a === 'full') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen?.();
      return;
    }
    if (a === 'auto') {
      orbit.autoRotate = !orbit.autoRotate;
      hud.setAutoRotate(orbit.autoRotate);
      return;
    }
    // repeated clicks build on where the current glide is heading
    const base = glide ? glide.to : currentView();
    const to =
      a === 'in' ? zoomed(base, 1)
      : a === 'out' ? zoomed(base, -1)
      : a === 'left' ? rotated(base, -1)
      : a === 'right' ? rotated(base, 1)
      : a === 'home' ? house.views.overview.view
      : (house.views[a.slice(5)] ?? house.views.overview).view;
    glide = new Glide(currentView(), to);
    orbit.autoRotate = false;
    hud.setAutoRotate(false);
  }
  orbit.update();

  const collision = new Collision(bricks, schedule.start, heightmap);
  const walker = new Walker(camera, renderer.domElement, collision, house.walkStart);
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
    glide = null;
    hud.setMode(m);
    if (m === 'walk') {
      savedOrbit.pos.copy(camera.position);
      savedOrbit.target.copy(orbit.target);
      orbit.enabled = false;
      walker.enabled = true;
      // start on the walkway by the carport, looking down the pool toward the living room
      walker.place(...house.walkStart, t);
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

  // spec 014: a tap on the scene (not a drag, pinch or long press) hides or shows the controls; the HUD only applies it on phones
  const downs = new Map<number, { x: number; y: number; t: number }>();
  let maxPointers = 0;
  renderer.domElement.addEventListener('pointerdown', (e) => {
    downs.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
    maxPointers = Math.max(maxPointers, downs.size);
  });
  const lift = (e: PointerEvent, cancelled: boolean) => {
    const d = downs.get(e.pointerId);
    downs.delete(e.pointerId);
    const pointers = maxPointers;
    if (downs.size === 0) maxPointers = 0;
    if (!d || cancelled || mode !== 'orbit') return;
    if (isTap({ dx: e.clientX - d.x, dy: e.clientY - d.y, dt: performance.now() - d.t, pointers })) hud.toggleChrome();
  };
  renderer.domElement.addEventListener('pointerup', (e) => lift(e, false));
  renderer.domElement.addEventListener('pointercancel', (e) => lift(e, true));

  const hud = mountHud(app, {
    onStart() { playing = true; },
    onPlayPause() { playing = !playing; if (t >= schedule.total) { t = 0; playing = true; } },
    onSpeed(s) { speed = s; },
    onSeek(v) { t = v; },
    onFinish() { t = schedule.total; },
    onRestart() { t = 0; playing = true; },
    onMode: setMode,
    onLight(l) { env.set(l); hud.setLight(l); },
    onRoof(on) { roofCut.value = on ? 0 : 1; },
    onCam: camAction,
  }, schedule.total, bricks.length, { text: house.text, views: house.views, phaseNames: house.phases.map((p) => p.name) });
  hud.setPhaseTicks(schedule.phaseStart, schedule.total);

  if (VIEW_PARAM && house.views[VIEW_PARAM]) {
    const v = house.views[VIEW_PARAM].view;
    camera.position.set(v.pos.x, v.pos.y, v.pos.z);
    orbit.target.set(v.target.x, v.target.y, v.target.z);
    orbit.autoRotate = false;
    hud.setAutoRotate(false);
    orbit.update();
  }
  if (LIGHT_PARAM === 'dusk') { env.set('dusk'); hud.setLight('dusk'); }
  if (CLEAN) {
    t = schedule.total;
    orbit.autoRotate = false;
    hud.hide();
  }

  addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    // the keys the HUD's own widgets use (timeline slider, toggle groups, menus) belong to them, not to the camera;
    // everything else (P, F, Tab, H, R, + / −) still works while one of them has focus
    const widgetKey = /^(Arrow|Home$|End$|Page)/.test(e.key);
    if (widgetKey && e.target instanceof Element && e.target.closest('[role=slider],[role=menu],[data-slot=toggle-group]')) return;
    if (e.code === 'KeyP') { playing = !playing; }
    if (e.code === 'KeyF' && mode === 'orbit') t = schedule.total;
    if (e.code === 'Tab') { e.preventDefault(); setMode(mode === 'orbit' ? 'walk' : 'orbit'); }
    if (mode === 'orbit') {
      const a: CamAction | null =
        e.code === 'Equal' || e.code === 'NumpadAdd' ? 'in'
        : e.code === 'Minus' || e.code === 'NumpadSubtract' ? 'out'
        : e.code === 'ArrowLeft' ? 'left'
        : e.code === 'ArrowRight' ? 'right'
        : e.code === 'KeyH' ? 'home'
        : e.code === 'KeyR' ? 'auto'
        : null;
      if (a) { e.preventDefault(); camAction(a); }
    }
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // ---------- debug overlay ----------
  let fpsEl: HTMLElement | null = null;
  if (DEBUG && !CLEAN) {
    fpsEl = document.createElement('div');
    fpsEl.className = 'fps';
    app.appendChild(fpsEl);
    const debugApi = { house, seek: (v: number) => (t = v), schedule, camera, orbit, walker, setMode, env, hood: () => hood, sun, renderer, scene, ground };
    (window as any).__viewer = debugApi;
    (window as any).__stahl = debugApi; // older name, kept for existing debug snippets
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
    waterTime.value = (waterTime.value + dt) % 3600;

    const light = env.update(dt);
    set.setLightLevel(light);
    city?.setNight(env.nightFactor);
    hood?.setNight(env.nightFactor);

    if (mode === 'walk') walker.update(dt, t);
    else {
      if (glide) {
        const v = glide.step(dt);
        camera.position.set(v.pos.x, v.pos.y, v.pos.z);
        orbit.target.set(v.target.x, v.target.y, v.target.z);
        if (glide.done) glide = null;
      }
      orbit.update(dt);
      const c = clampAboveGround(camera.position, ground);
      if (c !== camera.position) camera.position.y = c.y;
    }
    // spec 011: keep the near plane as far out as the camera allows, for depth precision (no flicker far away)
    const near = mode === 'walk' ? WALK_NEAR : orbitNear(camera.position.distanceTo(orbit.target));
    if (Math.abs(near - camera.near) > camera.near * 0.05) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    // adaptive resolution
    fpsAcc += dt; fpsFrames++; hudAcc += dt;
    if (fpsAcc > 1) {
      const fps = fpsFrames / fpsAcc;
      if (fpsEl) fpsEl.textContent = `${fps.toFixed(0)} fps · dpr ${dpr.toFixed(2)} · ${renderer.info.render.triangles.toLocaleString()} tris · ${renderer.info.render.calls} calls`;
      if (!FIXED_DPR && fps < 38 && dpr > 0.75) { slowTime++; if (slowTime >= 2) { dpr = Math.max(0.75, dpr - 0.25); renderer.setPixelRatio(dpr); slowTime = 0; } }
      else slowTime = 0;
      fpsAcc = 0; fpsFrames = 0;
    }
    if (hudAcc > 0.1) {
      hudAcc = 0;
      hud.update({ t, total: schedule.total, playing, speed, placed, pieces: set.total, phase: currentPhase() });
    }
  });
}
