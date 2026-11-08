// Spec: specs/000-baseline.md — §Model (M1–M6); specs/001-fix-occupancy-overlaps.md (A1–A3)
import { describe, expect, it } from 'vitest';
import { buildStahlHouse } from '../src/model/stahlHouse';
import { Builder, G } from '../src/model/voxel';
import { palm } from '../src/model/landscape';
import { PHASES } from '../src/bricks/catalog';

const { builder, heightmap } = buildStahlHouse();
const bricks = builder.bricks;

describe('model', () => {
  it('M1: generates ~27,200 pieces (real hillside since spec 004; was ~17,800)', () => {
    expect(bricks.length).toBeGreaterThan(26_000);
    expect(bricks.length).toBeLessThan(28_500);
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

  it('M5 / 001-A2: no two pieces occupy the same cell', () => {
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

/** Overlaps allowed in the finished model. Never raise this without a spec change. */
const KNOWN_FORCED_OVERLAPS = 0;

describe('001: occupancy overlaps', () => {
  it('A1: every piece lies inside the occupancy grid', () => {
    const outside = bricks.filter(
      (b) =>
        b.x < G.x0 || b.x + b.w > G.x0 + G.nx ||
        b.z < G.z0 || b.z + b.d > G.z0 + G.nz ||
        b.y < G.y0 || b.y + b.h > G.y0 + G.ny,
    );
    expect(outside.length).toBe(0);
  });

  it.each([30, 31, 32, 33])('A3: palm of height %i — trunk is exactly that tall, crown sits on top', (height) => {
    const b = new Builder();
    palm(b, 0, 0, 0, height);
    const trunk = b.bricks.filter((q) => q.x === 0 && q.z === 0 && q.kind === 'round'); // segments…, crown
    const segs = trunk.slice(0, -1), crown = trunk[trunk.length - 1];
    expect(segs.reduce((n, q) => n + q.h, 0)).toBe(height);
    expect(Math.max(...segs.map((q) => q.y + q.h))).toBe(height);
    expect(crown.y).toBe(height);
    expect(b.bricks.length).toBeGreaterThan(trunk.length); // fronds placed too
  });
});
