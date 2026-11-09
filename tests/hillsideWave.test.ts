// Spec: specs/005-hillside-from-the-top.md (A1–A5)
import { describe, expect, it } from 'vitest';
import { buildStahlHouse } from '../src/houses/stahl-house/model/stahlHouse';
import { sequence } from '../src/engine/sequencer';
import { PLATE } from '../src/engine/catalog';
import { P, PHASES } from '../src/houses/stahl-house/phases';
import { PLATEAU } from '../src/houses/stahl-house/model/layout';
import { modelFingerprint } from './fingerprint';
import { STAHL } from '../src/houses/stahl-house/definition';

const bricks = buildStahlHouse().builder.bricks;
const s = sequence(bricks, PHASES, STAHL.center);
const site = bricks.map((_, i) => i).filter((i) => bricks[i].phase === P.SITE);
const t0 = s.phaseStart[P.SITE], dur = PHASES[P.SITE].dur;
const u = (i: number) => (s.start[i] - t0) / dur; // 0…1 through the phase

/** horizontal distance from the house + drop of the piece's top below the pad, in ft */
const waveKey = (i: number) => {
  const b = bricks[i];
  const d = Math.hypot(b.x + b.w / 2 - STAHL.center.x, b.z + b.d / 2 - STAHL.center.z);
  return d + Math.max(0, -(b.y + b.h) * PLATE);
};

const ranks = (v: number[]) => {
  const idx = v.map((_, i) => i).sort((a, b) => v[a] - v[b]);
  const r = new Array<number>(v.length);
  idx.forEach((k, pos) => (r[k] = pos));
  return r;
};
const spearman = (a: number[], b: number[]) => {
  const ra = ranks(a), rb = ranks(b), n = a.length;
  let d2 = 0;
  for (let i = 0; i < n; i++) d2 += (ra[i] - rb[i]) ** 2;
  return 1 - (6 * d2) / (n * (n * n - 1));
};

describe('005: hillside from the top, down the slope', () => {
  it('A1: the house pad comes first (its interior lands in the first 25% of the phase)', () => {
    const inner = [PLATEAU[0] + 12, PLATEAU[1] + 12, PLATEAU[2] - 12, PLATEAU[3] - 12];
    const pad = site.filter((i) => {
      const b = bricks[i];
      return b.y + b.h === 0 && b.x >= inner[0] && b.x + b.w <= inner[2] && b.z >= inner[1] && b.z + b.d <= inner[3];
    });
    expect(pad.length).toBeGreaterThan(50);
    for (const i of pad) expect(u(i)).toBeLessThanOrEqual(0.25);
  });

  it('A2: the wave spreads outward and downhill (Spearman ≥ 0.8)', () => {
    expect(spearman(site.map((i) => s.start[i]), site.map(waveKey))).toBeGreaterThanOrEqual(0.8);
  });

  it('A3: nothing floats: in every stud cell, hillside pieces land bottom-up', () => {
    const cells = new Map<string, number[]>();
    for (const i of site) {
      const b = bricks[i];
      for (let z = b.z; z < b.z + b.d; z++)
        for (let x = b.x; x < b.x + b.w; x++) {
          const k = `${x},${z}`;
          if (!cells.has(k)) cells.set(k, []);
          cells.get(k)!.push(i);
        }
    }
    const bad: string[] = [];
    for (const [k, list] of cells) {
      list.sort((a, b) => bricks[a].y - bricks[b].y);
      for (let j = 1; j < list.length; j++)
        if (s.start[list[j]] < s.start[list[j - 1]]) { bad.push(k); break; }
      if (bad.length > 5) break;
    }
    expect(bad).toEqual([]);
  });

  it('A4: the hillside takes 16 s and the rest of the timeline only shifts', () => {
    expect(PHASES[P.SITE].dur).toBe(16);
    expect(s.total).toBeCloseTo(228.7, 5);
    for (let p = 1; p < PHASES.length; p++) expect(s.phaseStart[p] - s.phaseStart[p - 1]).toBeCloseTo(PHASES[p - 1].dur + 1.5, 5);
  });

  it('A5: the model itself is unchanged (only start times move)', () => {
    expect(modelFingerprint(bricks)).toEqual({ count: 27233, hash: '116d7826' }); // spec 012 (was 27,222 / ebe0f28f)
  });
});
