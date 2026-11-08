// Spec: specs/000-baseline.md — §Build sequence (S1–S6); S5 amended by specs/002 (A6) and 005 (A4)
import { describe, expect, it } from 'vitest';
import { buildStahlHouse } from '../src/model/stahlHouse';
import { DROP_DUR, sequence } from '../src/build/sequencer';
import { PHASES } from '../src/bricks/catalog';

const bricks = buildStahlHouse().builder.bricks;
const s = sequence(bricks);

describe('build sequence', () => {
  it('S1: order is a permutation of every brick', () => {
    expect(s.order.length).toBe(bricks.length);
    expect(new Set(s.order).size).toBe(bricks.length);
  });

  it('S2: phases build in catalog order (hillside → … → garden), never interleaved', () => {
    let last = -1;
    for (const i of s.order) {
      expect(bricks[i].phase).toBeGreaterThanOrEqual(last);
      last = bricks[i].phase;
    }
  });

  it('S3: start times are non-decreasing along the order and within [0, total]', () => {
    let prev = -Infinity;
    for (const i of s.order) {
      expect(s.start[i]).toBeGreaterThanOrEqual(prev);
      prev = s.start[i];
    }
    expect(s.start[s.order[0]]).toBe(0);
    expect(prev + DROP_DUR).toBeLessThanOrEqual(s.total + 1e-6);
  });

  it('S4: one phaseStart per phase, strictly increasing', () => {
    expect(s.phaseStart.length).toBe(PHASES.length);
    for (let p = 1; p < PHASES.length; p++) expect(s.phaseStart[p]).toBeGreaterThan(s.phaseStart[p - 1]);
  });

  it('S5: "layer" phases build bottom-up (hanging pieces excluded, 002-A3; the hillside is a "wave", 005)', () => {
    for (let p = 0; p < PHASES.length; p++) {
      if (PHASES[p].order !== 'layer') continue;
      let y = -Infinity;
      for (const i of s.order) {
        if (bricks[i].phase !== p || bricks[i].hangs) continue;
        expect(bricks[i].y).toBeGreaterThanOrEqual(y);
        y = bricks[i].y;
      }
    }
  });

  it('S6: full build at 1× takes about 4 minutes (220–250 s)', () => {
    expect(s.total).toBeGreaterThan(220);
    expect(s.total).toBeLessThan(250);
  });
});
