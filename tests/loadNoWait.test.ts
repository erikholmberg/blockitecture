// Spec: specs/068-load-without-waiting-for-the-frame-rate.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { measurementDone, refreshRate } from '../src/engine/resolution';

const run = (n: number, ms: number) => new Array<number>(n).fill(ms);

describe('068: load without waiting for the frame-rate measurement', () => {
  it('A1: done at 10 intervals once the model is ready; before that, at 30 intervals or 0.6 s', () => {
    expect(measurementDone(run(9, 16.7), true)).toBe(false);
    expect(measurementDone(run(10, 16.7), true)).toBe(true);
    expect(measurementDone(run(10, 16.7), false)).toBe(false);
    expect(measurementDone(run(29, 16.7), false)).toBe(false);
    expect(measurementDone(run(30, 16.7), false)).toBe(true);
    expect(measurementDone(run(19, 33.3), false)).toBe(true); // over 0.6 s
    expect(measurementDone(run(3, 250), true)).toBe(true); // frames barely coming: 0.6 s is the limit either way
  });

  it('A2: ten intervals are enough to tell 60 from 30, even with three long ones', () => {
    expect(refreshRate(run(10, 16.7))).toBe(60);
    expect(refreshRate(run(10, 33.3))).toBe(30);
    expect(refreshRate([...run(7, 33.3), 90, 120, 70])).toBe(30);
    expect(refreshRate([...run(27, 33.3), 90, 120, 70])).toBe(30);
  });

  it('A3: the viewer tells the measurement when the model is ready, and still passes the threshold on', () => {
    const src = readFileSync('src/engine/viewer.ts', 'utf8');
    const made = src.indexOf('await generateModel(');
    const ready = src.indexOf('refresh.modelReady()');
    const used = src.indexOf('slowThreshold(await refresh.rate)');
    expect(made).toBeGreaterThan(0);
    expect(ready).toBeGreaterThan(made);
    expect(used).toBeGreaterThan(ready);
    expect(src).toContain('measurementDone(gaps, modelIsReady)');
  });
});
