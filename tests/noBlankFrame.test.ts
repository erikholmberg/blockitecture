// Spec: specs/064-no-blank-frame-on-resolution-step.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { adaptiveStep, redrawAfter } from '../src/engine/resolution';

describe('064: no blank frame when the resolution steps down', () => {
  it('A1: redrawAfter makes its change, then renders, in one call', () => {
    const calls: string[] = [];
    const scene = {}, camera = {};
    const renderer = { render: (s: unknown, c: unknown) => { expect(s).toBe(scene); expect(c).toBe(camera); calls.push('render'); } };
    redrawAfter(renderer, scene, camera, () => calls.push('change'));
    expect(calls).toEqual(['change', 'render']);
  });

  it('A2: after its first setup, viewer.ts resizes only through redrawAfter', () => {
    const src = readFileSync('src/engine/viewer.ts', 'utf8');
    const lines = src.split('\n').map((l, i) => [i + 1, l] as const).filter(([, l]) => /renderer\.(setPixelRatio|setSize)\(/.test(l));
    const setup = lines.filter(([, l]) => /^\s*renderer\.(setPixelRatio|setSize)\(/.test(l));
    const guarded = lines.filter(([, l]) => /redrawAfter\(/.test(l));
    expect(setup.length).toBe(2); // the initial pixel ratio and size, before anything is drawn
    expect(Math.max(...setup.map(([n]) => n))).toBeLessThan(Math.min(...guarded.map(([n]) => n))); // before the loop and the handlers
    expect(guarded.length).toBe(lines.length - 2);
    expect(guarded.length).toBeGreaterThanOrEqual(2); // the adaptive step and the resize handler
  });

  it('A3: the adaptive rule is unchanged', () => {
    let s = { dpr: 1.5, slow: 0 };
    s = adaptiveStep(s, 30, false); expect(s).toEqual({ dpr: 1.5, slow: 1 });
    s = adaptiveStep(s, 30, false); expect(s).toEqual({ dpr: 1.25, slow: 0 });
    s = adaptiveStep(s, 37.9, false); s = adaptiveStep(s, 40, false); expect(s).toEqual({ dpr: 1.25, slow: 0 }); // a good second resets
    s = adaptiveStep(s, 38, false); expect(s.slow).toBe(0); // 38 fps isn't slow
    for (let i = 0; i < 20; i++) s = adaptiveStep(s, 10, false);
    expect(s.dpr).toBe(0.75); // the floor
    expect(adaptiveStep({ dpr: 1.75, slow: 1 }, 10, true)).toEqual({ dpr: 1.75, slow: 0 }); // pinned by ?dpr=
  });
});
