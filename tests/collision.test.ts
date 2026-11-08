// Spec: specs/000-baseline.md — §Walk mode collision (W1–W4)
import { describe, expect, it } from 'vitest';
import { Collision } from '../src/controls/collision';
import { Brick, PLATE } from '../src/bricks/catalog';
import { DROP_DUR } from '../src/build/sequencer';
import { HeightMap } from '../src/model/site';

const brick = (o: Partial<Brick>): Brick => ({
  x: 0, y: 0, z: 0, w: 1, d: 1, h: 3, color: 0, kind: 'brick', phase: 0, group: 0, studs: true, ...o,
});
const flat = new HeightMap(); // all-zero terrain inside TERRAIN bounds

describe('walk collision', () => {
  // a 4×4 wall, 10 plates tall, landing at t = 5 (+ DROP_DUR)
  const wall = brick({ x: 10, z: 10, w: 4, d: 4, h: 10 });
  const start = new Float32Array([5]);
  const c = new Collision([wall], start, flat);
  const landed = 5 + DROP_DUR;

  it('W1: bricks only block once they have landed', () => {
    expect(c.blocked(12, 12, 0.3, 0, 1.8, 5)).toBe(false);
    expect(c.blocked(12, 12, 0.3, 0, 1.8, landed)).toBe(true);
  });

  it('W2: you can stand on a landed brick top', () => {
    expect(c.ground(12, 12, 100, landed)).toBeCloseTo(10 * PLATE);
    expect(c.ground(12, 12, 100, 0)).toBe(0); // before landing: fallback terrain
  });

  it('W3: the invisible terrain fallback lets you stand anywhere before bricks arrive', () => {
    expect(c.ground(-50, -50, 100, 0)).toBe(0);
  });

  it('W4: lamps, bars and high ceiling lights never block', () => {
    const decor = [
      brick({ x: 0, kind: 'lamp' }),
      brick({ x: 2, kind: 'bar' }),
      brick({ x: 4, kind: 'light', y: 25 }),
    ];
    const cc = new Collision(decor, new Float32Array([0, 0, 0]), flat);
    for (const b of decor) expect(cc.blocked(b.x + 0.5, 0.5, 0.3, -100, 100, 999)).toBe(false);
  });

  it('ceiling stops jumps through a landed roof', () => {
    const roof = brick({ x: 0, z: 0, y: 20, h: 1 });
    const cc = new Collision([roof], new Float32Array([0]), flat);
    expect(cc.ceiling(0.5, 0.5, 0, 999)).toBeCloseTo(20 * PLATE);
    expect(cc.ceiling(0.5, 0.5, 0, 0)).toBe(Infinity);
  });
});
