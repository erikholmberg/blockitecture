// Spec: specs/067-soft-satin-finish.md
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { DEFAULT_FINISH, FINISHES, finishFromParam, type Finish } from '../src/engine/finish';

describe('067: soft satin finish', () => {
  const today: Finish = FINISHES[DEFAULT_FINISH];

  it('A1: the default finish is soft satin, with the light and tone curve unchanged', () => {
    expect(DEFAULT_FINISH).toBe('soft-satin');
    const { label: _l, note: _n, ...values } = today;
    expect(values).toEqual({ roughness: 0.65, specular: 1, sun: 1, hemi: 1, tone: 'aces', exposure: 1 });
  });

  it('A2: no value or an unknown value gives soft satin; gloss is still there at 0.32', () => {
    for (const v of [null, '', 'chrome', 'toString']) expect(finishFromParam(v)).toBe(FINISHES['soft-satin']);
    expect(finishFromParam('gloss').roughness).toBe(0.32);
  });

  it('A3: the default finish edits no piece shader, and the pieces use it when none is given', () => {
    expect(today.specular).toBe(1);
    expect(today.topRoughness).toBeUndefined();
    const set = readFileSync('src/engine/BrickSet.ts', 'utf8');
    expect(set).toContain('opts.finish ?? FINISHES[DEFAULT_FINISH]');
    expect(set).not.toMatch(/roughness: 0\.32, metalness/);
  });

  it("A4: the design page marks the default as today's and compares against it", () => {
    expect(today.label).toMatch(/today/i);
    for (const [k, f] of Object.entries(FINISHES)) if (k !== DEFAULT_FINISH) expect(f.label).not.toMatch(/today/i);
    expect(FINISHES.gloss.label).toMatch(/previous/i);
    const page = readFileSync('src/dev/design/DesignPage.tsx', 'utf8');
    expect(page).not.toContain('Gloss (today)');
    expect(page).toContain('FINISHES[DEFAULT_FINISH].label');
    expect(page).toContain('shot(scene, today ? DEFAULT_FINISH : finish)');
  });
});
