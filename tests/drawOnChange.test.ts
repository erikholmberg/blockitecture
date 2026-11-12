// Spec: specs/069-draw-only-when-something-changes.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fpsWindow, lookChanged, mustDraw, renderOptions, type Look } from '../src/engine/redraw';
import { adaptiveStep } from '../src/engine/resolution';

const look = (o: Partial<Look> = {}): Look => ({
  t: 100, mode: 'orbit', roof: 0, exposure: 0.42, light: 0.2, night: 0, hidden: '',
  cam: [10, 20, 30, 0, 0, 0, 1, 50, 0.3, 1, 2, 3], ...o,
});
const still = { changed: false, lightChanging: false, movingWater: false, asked: false };

describe('069: draw only when something changes', () => {
  it('A1: nothing happening means no frame; any one thing means a frame', () => {
    expect(mustDraw(still)).toBe(false);
    for (const k of Object.keys(still) as (keyof typeof still)[]) expect(mustDraw({ ...still, [k]: true }), k).toBe(true);
  });

  it('A1: the watched state: build time, mode, roof, exposure, lights, hidden neighbours and the camera', () => {
    expect(lookChanged(null, look())).toBe(true); // nothing drawn yet
    expect(lookChanged(look(), look())).toBe(false);
    expect(lookChanged(look(), look({ t: 100.02 }))).toBe(true); // pieces landing, playing, seeking
    expect(lookChanged(look(), look({ mode: 'walk' }))).toBe(true);
    expect(lookChanged(look(), look({ roof: 1 }))).toBe(true);
    expect(lookChanged(look(), look({ exposure: 0.4 }))).toBe(true); // the intro brightening
    expect(lookChanged(look(), look({ light: 0.21 }))).toBe(true);
    expect(lookChanged(look(), look({ night: 0.01 }))).toBe(true);
    expect(lookChanged(look(), look({ hidden: '3' }))).toBe(true);
    // the camera: position, rotation, lens, near plane, orbit target; one at a time
    const cam = look().cam;
    cam.forEach((_, i) => {
      const moved = [...cam]; moved[i] += 0.01;
      expect(lookChanged(look(), look({ cam: moved })), `cam[${i}]`).toBe(true);
    });
  });

  it('A1: the last, invisible crawl of a damped camera is not a change, but it adds up to one', () => {
    const a = look();
    const crawl = (d: number) => look({ cam: a.cam.map((v, i) => (i === 0 ? v + d : v)) });
    expect(lookChanged(a, crawl(1e-6))).toBe(false);
    // compared with the last frame drawn, not the last tick: a slow drift is drawn once it shows
    expect(lookChanged(a, crawl(1e-3))).toBe(true);
  });

  it('A2: everything that changes the picture is watched or asks for a redraw', () => {
    const src = readFileSync('src/engine/viewer.ts', 'utf8');
    const watched = src.slice(src.indexOf('const now: Look = {'), src.indexOf('};', src.indexOf('const now: Look = {')));
    // play, pause, seek, speed, finish, restart: all move t. Roof cut, walk/orbit, the intro's dimming, day/dusk, view buttons:
    for (const field of ['t,', 'mode,', 'roof: roofCut.value', 'exposure,', 'light: lightLevel', 'night: env.nightFactor', 'hidden:', 'camera.position.x', 'camera.quaternion.w', 'camera.fov', 'camera.near', 'orbit.target.x'])
      expect(watched, field).toContain(field);
    expect(src).toContain('lightChanging: env.busy');
    // what the watched state can't see asks outright: a resize, the tab coming back, a restored graphics context
    expect(src).toMatch(/addEventListener\('resize'[\s\S]{0,300}askRedraw\(\)/);
    expect(src).toMatch(/addEventListener\('visibilitychange', askRedraw\)/);
    expect(src).toMatch(/addEventListener\('webglcontextrestored', askRedraw\)/);
    // a resolution step draws at once (spec 064), and the loop draws only through the rule
    expect(src).toMatch(/redrawAfter\(renderer, scene, camera, \(\) => renderer\.setPixelRatio\(dpr\)\)/);
    const loop = src.slice(src.indexOf('renderer.setAnimationLoop('));
    expect(loop.match(/renderer\.render\(scene, camera\)/g)?.length).toBe(1);
    expect(loop).toMatch(/if \(draw\) \{[\s\S]{0,400}renderer\.render\(scene, camera\)/);
  });

  it('A3: only drawn seconds are judged: a rested second neither counts as slow nor resets the count', () => {
    // 2 s drawn at 30 fps on a 60 Hz screen: two slow verdicts, as today
    let w = fpsWindow.start(), verdicts: number[] = [];
    const tick = (dt: number, drew: boolean) => { const r = fpsWindow.add(w, dt, drew); w = r.window; if (r.fps !== undefined) verdicts.push(r.fps); };
    for (let i = 0; i < 64; i++) tick(1 / 30, true);
    expect(verdicts.length).toBe(2);
    for (const v of verdicts) expect(v).toBeCloseTo(30, 0);

    // one slow second, then 10 s of rest, then another slow second: the rest gives no verdict, so the count carries over
    w = fpsWindow.start(); verdicts = [];
    for (let i = 0; i < 33; i++) tick(1 / 30, true);
    for (let i = 0; i < 600; i++) tick(1 / 60, false);
    expect(verdicts.length).toBe(1);
    for (let i = 0; i < 33; i++) tick(1 / 30, true);
    expect(verdicts.length).toBe(2);
    let s = { dpr: 1.5, slow: 0 };
    for (const fps of verdicts) s = adaptiveStep(s, fps, false);
    expect(s.dpr).toBe(1.25);

    // the first frame after a rest carries the rest's long gap: it isn't counted as a slow frame
    w = fpsWindow.start(); verdicts = [];
    for (let i = 0; i < 200; i++) { tick(0.1, false); tick(1 / 60, true); tick(1 / 60, true); }
    for (const v of verdicts) expect(v).toBeGreaterThan(55);
  });

  it('A3: a second with fewer than 10 drawn frames is not judged', () => {
    let w = fpsWindow.start(); const verdicts: number[] = [];
    // 5 frames drawn, each 0.25 s after the last (a page barely drawing): over a second, but too few frames to judge
    for (let i = 0; i < 6; i++) { const r = fpsWindow.add(w, 0.25, true); w = r.window; if (r.fps !== undefined) verdicts.push(r.fps); }
    expect(verdicts).toEqual([]);
  });

  it('A4: ?shadow= takes 1024, 2048 or 4096; ?aa=0 turns smoothing off; without them, as today', () => {
    const opts = (q: string) => renderOptions(new URLSearchParams(q));
    expect(opts('')).toEqual({ shadowMapSize: 4096, antialias: true });
    expect(opts('shadow=2048')).toEqual({ shadowMapSize: 2048, antialias: true });
    expect(opts('shadow=1024&aa=0')).toEqual({ shadowMapSize: 1024, antialias: false });
    for (const bad of ['shadow=0', 'shadow=3000', 'shadow=big', 'shadow=8192', 'shadow=']) expect(opts(bad).shadowMapSize, bad).toBe(4096);
    for (const on of ['aa=1', 'aa=', 'aa=off']) expect(opts(on).antialias, on).toBe(true);
    const src = readFileSync('src/engine/viewer.ts', 'utf8');
    expect(src).toContain('renderOptions(params)');
    expect(src).toMatch(/new THREE\.WebGLRenderer\(\{ antialias: options\.antialias,/);
  });
});
