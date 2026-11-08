// Spec: specs/000-baseline.md — §Model (M1–M6)
import { describe, expect, it } from 'vitest';
import { buildStahlHouse } from '../src/model/stahlHouse';
import { PHASES } from '../src/bricks/catalog';

const { builder, heightmap } = buildStahlHouse();
const bricks = builder.bricks;

describe('model', () => {
  it('M1: generates ~17,800 pieces', () => {
    expect(bricks.length).toBeGreaterThan(17_000);
    expect(bricks.length).toBeLessThan(18_500);
  });

  it('M2: is deterministic — every visitor sees the same house', () => {
    const again = buildStahlHouse().builder.bricks;
    expect(again.length).toBe(bricks.length);
    expect(again).toEqual(bricks);
  });

  it('M3: every phase has at least one piece and phases are valid', () => {
    const per = PHASES.map(() => 0);
    for (const b of bricks) {
      expect(b.phase).toBeGreaterThanOrEqual(0);
      expect(b.phase).toBeLessThan(PHASES.length);
      per[b.phase]++;
    }
    per.forEach((n) => expect(n).toBeGreaterThan(0));
  });

  it('M4: every piece has a positive integer size', () => {
    for (const b of bricks) {
      for (const v of [b.x, b.y, b.z, b.w, b.d, b.h]) expect(Number.isInteger(v)).toBe(true);
      expect(b.w).toBeGreaterThan(0);
      expect(b.d).toBeGreaterThan(0);
      expect(b.h).toBeGreaterThan(0);
    }
  });

  it('M5: no two pieces occupy the same cell (known exceptions: KI-1)', () => {
    const seen = new Map<string, number>();
    const overlaps: [number, number][] = [];
    bricks.forEach((b, i) => {
      for (let y = b.y; y < b.y + b.h; y++)
        for (let z = b.z; z < b.z + b.d; z++)
          for (let x = b.x; x < b.x + b.w; x++) {
            const k = `${x},${y},${z}`;
            const j = seen.get(k);
            if (j !== undefined) overlaps.push([j, i]);
            else seen.set(k, i);
          }
    });
    const pairs = new Set(overlaps.map(([a, c]) => `${a}-${c}`));
    expect(pairs.size).toBeLessThanOrEqual(KNOWN_FORCED_OVERLAPS);
  });

  it('M6: generation stays fast (< 1.5 s in Node)', () => {
    const t0 = performance.now();
    buildStahlHouse();
    expect(performance.now() - t0).toBeLessThan(1500);
  });

  it('heightmap returns finite terrain heights across the lot', () => {
    for (let x = -100; x < 140; x += 20)
      for (let z = -100; z < 120; z += 20) expect(Number.isFinite(heightmap.at(x, z))).toBe(true);
  });
});

/**
 * KI-1 (specs/000-baseline.md): one palm trunk's top segment overlaps its crown
 * (landscape.ts palm(), height not a multiple of 3; above the occupancy grid ceiling).
 * Lower this to 0 when KI-1 is fixed. Never raise it without a spec change.
 */
const KNOWN_FORCED_OVERLAPS = 1;
