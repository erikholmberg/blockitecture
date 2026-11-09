// Spec: specs/006-camera-controls.md (A1, A2)
import { describe, expect, it } from 'vitest';
import {
  distance, ease, Glide, MAX_DIST, MIN_DIST, ROTATE_STEP, rotated, View, ZOOM_STEP, zoomed,
} from '../src/engine/controls/cameraMoves';
import { STAHL } from '../src/houses/stahl-house/definition';

/** the Stahl House's named views (spec 006), from its house definition since spec 010a */
const VIEWS = STAHL.views;

const home: View = VIEWS.overview.view;
const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);
const sameView = (a: View, b: View, eps = 1e-6) => {
  for (const k of ['pos', 'target'] as const) for (const c of ['x', 'y', 'z'] as const) close(a[k][c], b[k][c], eps);
};

describe('006: camera moves', () => {
  it('A2: zoom steps are proportional (×0.75 in, ÷0.75 out), keep the direction and the target', () => {
    const d0 = distance(home);
    const zin = zoomed(home, 1), zout = zoomed(home, -1);
    close(distance(zin), d0 * ZOOM_STEP);
    close(distance(zout), d0 / ZOOM_STEP);
    expect(ZOOM_STEP).toBe(0.75);
    sameView({ pos: home.target, target: home.target }, { pos: zin.target, target: zin.target });
    // same direction: the unit offsets match
    const u = (v: View) => { const d = distance(v); return ['x', 'y', 'z'].map((c) => (v.pos[c as 'x'] - v.target[c as 'x']) / d); };
    u(zin).forEach((c, i) => close(c, u(home)[i]));
  });

  it('A1: zoom stays within the min/max distance (1,800 ft out)', () => {
    expect(MIN_DIST).toBe(12);
    expect(MAX_DIST).toBe(1800);
    let v = home;
    for (let i = 0; i < 40; i++) v = zoomed(v, 1);
    close(distance(v), MIN_DIST);
    for (let i = 0; i < 60; i++) v = zoomed(v, -1);
    close(distance(v), MAX_DIST);
  });

  it('A1: rotate steps keep distance, height and target, and turn by ROTATE_STEP around the vertical', () => {
    const r = rotated(home, 1);
    close(distance(r), distance(home));
    close(r.pos.y, home.pos.y);
    sameView({ pos: r.target, target: r.target }, { pos: home.target, target: home.target });
    const ang = (v: View) => Math.atan2(v.pos.z - v.target.z, v.pos.x - v.target.x);
    let d = ang(r) - ang(home);
    d = Math.atan2(Math.sin(d), Math.cos(d));
    close(Math.abs(d), ROTATE_STEP);
    sameView(rotated(rotated(home, 1), -1), home, 1e-9);
  });

  it('A1: easing is monotonic from 0 to 1', () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    let prev = 0;
    for (let t = 0.01; t <= 1; t += 0.01) { expect(ease(t)).toBeGreaterThanOrEqual(prev); prev = ease(t); }
  });

  it('A1: a glide ends exactly at its target, orbits (not cuts through) and reports when it is done', () => {
    const to = rotated(zoomed(home, -1), 4);
    const g = new Glide(home, to, 0.6);
    let v: View | null = null, steps = 0;
    while (!g.done) {
      v = g.step(1 / 60);
      steps++;
      // mid-glide the distance stays between the two ends (spherical interpolation, not a straight line)
      const lo = Math.min(distance(home), distance(to)) - 1e-6, hi = Math.max(distance(home), distance(to)) + 1e-6;
      expect(distance(v)).toBeGreaterThanOrEqual(lo);
      expect(distance(v)).toBeLessThanOrEqual(hi);
    }
    expect(steps).toBeGreaterThanOrEqual(35);
    expect(steps).toBeLessThanOrEqual(37);
    sameView(v!, to, 1e-9);
  });

  it('A1: named views are within the zoom range and above the horizon limit', () => {
    expect(Object.keys(VIEWS)).toEqual(['overview', 'famous', 'pool', 'basin']);
    for (const { view, label } of Object.values(VIEWS)) {
      expect(label.length).toBeGreaterThan(0);
      expect(distance(view)).toBeGreaterThanOrEqual(MIN_DIST);
      expect(distance(view)).toBeLessThanOrEqual(MAX_DIST);
      const polar = Math.acos((view.pos.y - view.target.y) / distance(view));
      expect(polar).toBeLessThanOrEqual(Math.PI * 0.53);
    }
  });
});

// Spec: specs/011-sea-flicker.md: the orbit near plane
import { orbitNear, WALK_NEAR } from '../src/engine/controls/cameraMoves';
describe('011: near plane', () => {
  it('orbit: 1% of the distance to the target, between 0.3 and 2 ft; walk mode stays at 0.3 ft', () => {
    expect(WALK_NEAR).toBe(0.3);
    expect(orbitNear(MIN_DIST)).toBeCloseTo(0.3, 6); // 12 ft → 0.12, clamped up to 0.3
    expect(orbitNear(132)).toBeCloseTo(1.32, 6); // the Eames overview distance
    expect(orbitNear(MAX_DIST)).toBe(2);
    for (let d = MIN_DIST; d <= MAX_DIST; d += 50) expect(orbitNear(d)).toBeLessThanOrEqual(d / 6); // never close to the target
  });
});
