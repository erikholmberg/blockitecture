// Spec: specs/066-finish-options-on-a-design-page.md
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { PAGES } from '../vite.config';
import { DEFAULT_FINISH, FINISHES, finishFromParam, type Finish } from '../src/engine/finish';
import { SCENES, liveUrl } from '../src/dev/design/scenes';
import { HOUSES } from '../src/houses/index';

const look = ({ label: _l, note: _n, ...rest }: Finish) => JSON.stringify(rest);

describe('066: finish options', () => {
  it("A1: the default finish is today's values", () => {
    expect(DEFAULT_FINISH).toBe('gloss');
    const { label: _l, note: _n, ...today } = FINISHES.gloss;
    expect(today).toEqual({ roughness: 0.32, specular: 1, sun: 1, hemi: 1, tone: 'aces', exposure: 1 });
  });

  it("A2: no value or an unknown value gives today's finish; a known key gives that finish", () => {
    expect(finishFromParam(null)).toBe(FINISHES.gloss);
    expect(finishFromParam('')).toBe(FINISHES.gloss);
    expect(finishFromParam('chrome')).toBe(FINISHES.gloss);
    expect(finishFromParam('toString')).toBe(FINISHES.gloss);
    expect(finishFromParam('satin')).toBe(FINISHES.satin);
    expect(finishFromParam('soft-satin')).toBe(FINISHES['soft-satin']);
  });

  it('A3: every candidate differs from today and from each other', () => {
    const looks = Object.values(FINISHES).map(look);
    expect(new Set(looks).size).toBe(looks.length);
    expect(looks.length).toBe(9);
  });

  it('A4: the design page exists, is not built, and has a picture for every scene and finish', () => {
    expect(existsSync('dev/design/index.html')).toBe(true);
    for (const p of Object.values(PAGES)) expect(p).not.toMatch(/[\\/]dev[\\/]/);
    const live = HOUSES.filter((h) => h.status === 'live').map((h) => h.slug);
    for (const s of SCENES) {
      expect(live).toContain(s.slug);
      for (const f of Object.keys(FINISHES)) {
        expect(existsSync(`src/dev/design/${s.key}-${f}.jpg`), `${s.key}-${f}.jpg`).toBe(true);
        expect(liveUrl(s, f)).toMatch(new RegExp(`^/${s.slug}/\\?(cam=[-\\d.,]+&)?finish=${f}$`));
      }
    }
  });

  it("A5: the viewer passes ?finish= to the pieces, the light and the tone curve; today's finish edits no shader", () => {
    const viewer = readFileSync('src/engine/viewer.ts', 'utf8');
    expect(viewer).toContain("finishFromParam(params.get('finish'))");
    expect(viewer).toMatch(/new Environment\([^)]*finish\)/);
    expect(viewer).toMatch(/new BrickSet\([\s\S]{0,200}finish,/);
    expect(viewer).toMatch(/renderer\.toneMapping = \{[^}]*\}\[finish\.tone\]/);
    const set = readFileSync('src/engine/BrickSet.ts', 'utf8');
    const withFinish = set.slice(set.indexOf('function withFinish'), set.indexOf('const finishKey'));
    // both shader edits are behind a condition today's finish doesn't meet
    expect(withFinish).toContain('if (finish.specular !== 1)');
    expect(withFinish).toContain('if (box && finish.topRoughness !== undefined)');
    expect(FINISHES.gloss.specular).toBe(1);
    expect((FINISHES.gloss as Finish).topRoughness).toBeUndefined();
  });
});
