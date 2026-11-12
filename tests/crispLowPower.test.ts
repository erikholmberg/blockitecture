// Spec: specs/065-crisp-in-low-power-mode.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { adaptiveStep, minDpr, refreshRate, slowThreshold } from '../src/engine/resolution';

/** run `seconds` of a steady frame rate through the adaptive rule */
const settle = (fps: number, hz: number | undefined, touch: boolean, start = 1.5, seconds = 30) => {
  let s = { dpr: start, slow: 0 };
  for (let i = 0; i < seconds; i++) s = adaptiveStep(s, fps, false, { slowFps: slowThreshold(hz), minDpr: minDpr(touch) });
  return s.dpr;
};

describe('065: crisp on a phone in Low Power Mode', () => {
  it('A1: the slow threshold: 38 at 60 and 120 Hz, about 19 at 30 Hz, 38 when unmeasured', () => {
    expect(slowThreshold(60)).toBe(38);
    expect(slowThreshold(120)).toBe(38);
    expect(slowThreshold(30)).toBeCloseTo(19, 6);
    expect(slowThreshold(undefined)).toBe(38);
  });

  it('A2: a steady 30 fps on a 30 Hz screen never steps down; 15 fps does', () => {
    expect(settle(30, 30, true)).toBe(1.5);
    expect(settle(29, 30, true)).toBe(1.5); // the cap, measured a little low
    expect(settle(15, 30, true)).toBeLessThan(1.5);
  });

  it('A3: a steady 30 fps on a 60 Hz screen steps down, as before', () => {
    expect(settle(30, 60, true)).toBeLessThan(1.5);
    expect(settle(30, 60, false, 1.75)).toBe(0.75);
  });

  it('A4: a phone never goes below 1.0; a desktop\'s floor is 0.75', () => {
    expect(minDpr(true)).toBe(1);
    expect(minDpr(false)).toBe(0.75);
    expect(settle(5, 60, true)).toBe(1);
    expect(settle(5, 60, false, 1.75)).toBe(0.75);
  });

  it('A5: the screen\'s rate is the median of a run of frame intervals', () => {
    const run = (ms: number, n = 20) => Array.from({ length: n }, () => ms);
    expect(refreshRate(run(1000 / 30))).toBe(30);
    expect(refreshRate(run(1000 / 60))).toBe(60);
    expect(refreshRate(run(1000 / 120))).toBe(120);
    expect(refreshRate([...run(33.3, 16), 250, 180])).toBe(30); // two long frames don't skew it
    expect(refreshRate([33.9, 32.8, 33.4, 33.1, 34.0, 33.3, 33.2, 33.5])).toBe(30); // jitter
    expect(refreshRate(run(1000 / 59))).toBe(60); // a measurement within 5% of a common rate is that rate
    expect(refreshRate(run(1000 / 31))).toBe(30);
    expect(refreshRate([16.7, 16.6])).toBeUndefined(); // too few frames to tell
    expect(refreshRate(run(2000))).toBeUndefined(); // not a screen's rate
  });

  it('the viewer measures the rate at load and passes the threshold and the floor to the rule', () => {
    const src = readFileSync('src/engine/viewer.ts', 'utf8');
    expect(src).toMatch(/slowThreshold\(/);
    expect(src).toMatch(/minDpr\(isTouch\)/);
    expect(src.indexOf('measureRefresh(')).toBeGreaterThan(0);
    expect(src.indexOf('measureRefresh(')).toBeLessThan(src.indexOf('new THREE.WebGLRenderer')); // before the scene is drawn
  });
});
