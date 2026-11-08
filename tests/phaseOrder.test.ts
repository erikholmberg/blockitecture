// Spec: specs/002-interior-before-enclosure.md (A1–A6)
import { describe, expect, it } from 'vitest';
import { buildStahlHouse } from '../src/model/stahlHouse';
import { sequence } from '../src/build/sequencer';
import { P, PHASES } from '../src/bricks/catalog';
import { houseFingerprint } from './fingerprint';

const bricks = buildStahlHouse().builder.bricks;
const s = sequence(bricks);
const startsOf = (pred: (i: number) => boolean) => bricks.map((_, i) => i).filter(pred).map((i) => s.start[i]);
const min = (a: number[]) => a.reduce((m, v) => Math.min(m, v), Infinity);
const max = (a: number[]) => a.reduce((m, v) => Math.max(m, v), -Infinity);

describe('002: interior before enclosure', () => {
  it('A1: phase order', () => {
    expect(PHASES.map((p) => p.name)).toEqual([
      'Shaping the hillside',
      'Foundations & pool basin',
      'Floor slab & terrace',
      'Steel frame',
      'Interior & furniture',
      'Glass & walls',
      'Roof deck',
      'Pool, garden & finishing touches',
    ]);
    expect([P.SITE, P.FOUNDATION, P.FLOOR, P.STEEL, P.INTERIOR, P.ENVELOPE, P.ROOF, P.LANDSCAPE]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it('A2: interior → walls → roof, strictly in time', () => {
    const interior = startsOf((i) => bricks[i].phase === P.INTERIOR);
    const walls = startsOf((i) => bricks[i].phase === P.ENVELOPE);
    const roof = startsOf((i) => bricks[i].phase === P.ROOF);
    expect(max(interior)).toBeLessThan(min(walls));
    expect(max(walls)).toBeLessThan(min(roof));
  });

  it('A3: ceiling-hung pieces are roof-phase, hung last and top-down', () => {
    const hung = bricks.map((_, i) => i).filter((i) => bricks[i].hangs);
    // light panel (box) + cabinet box + 2 cabinet rods + 3 pendant rods + 3 lamps
    expect(hung.filter((i) => bricks[i].kind === 'lamp').length).toBe(3);
    expect(hung.filter((i) => bricks[i].kind === 'bar').length).toBe(5);
    expect(hung.some((i) => bricks[i].kind === 'light')).toBe(true);
    expect(hung.some((i) => bricks[i].kind === 'brick')).toBe(true);
    // all within the kitchen
    for (const i of hung) {
      const b = bricks[i];
      expect(b.phase).toBe(P.ROOF);
      expect(b.x).toBeGreaterThanOrEqual(20);
      expect(b.x + b.w).toBeLessThanOrEqual(34);
      expect(b.z).toBeGreaterThanOrEqual(32);
      expect(b.z + b.d).toBeLessThanOrEqual(48);
    }
    const roofSolid = startsOf((i) => bricks[i].phase === P.ROOF && !bricks[i].hangs);
    expect(min(hung.map((i) => s.start[i]))).toBeGreaterThan(max(roofSolid));
    const order = s.order.filter((i) => bricks[i].hangs);
    for (let k = 1; k < order.length; k++) {
      const a = bricks[order[k - 1]], b = bricks[order[k]];
      expect(b.y + b.h).toBeLessThanOrEqual(a.y + a.h);
    }
  });

  it('A4: phase durations and total time unchanged', () => {
    const dur = Object.fromEntries(PHASES.map((p) => [p.name, p.dur]));
    expect(dur).toEqual({
      'Shaping the hillside': 24,
      'Foundations & pool basin': 18,
      'Floor slab & terrace': 18,
      'Steel frame': 24,
      'Roof deck': 24,
      'Glass & walls': 30,
      'Interior & furniture': 52,
      'Pool, garden & finishing touches': 34,
    });
    expect(s.total).toBeCloseTo(236.7, 5);
  });

  it('A5: the house itself is unchanged (fingerprint of phases 1–6; spec 004 moved the paving and reshaped the hillside)', () => {
    expect(houseFingerprint(bricks)).toEqual({ count: 3603, hash: 'e781fb43' });
  });
});
