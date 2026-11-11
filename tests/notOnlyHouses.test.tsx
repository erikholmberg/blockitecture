// @vitest-environment jsdom
// Spec: specs/059-not-only-houses.md
import { existsSync, readdirSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NumbersPanel } from '../src/engine/ui/NumbersPanel';
import type { HouseDefinition } from '../src/engine/house';
import { HOME_DESCRIPTION, llmsTxt } from '../src/seo/seo';
import { STATS } from '../src/houses/stats';

const text = (noun?: string) =>
  new DOMParser().parseFromString(renderToString(<NumbersPanel stats={STATS['fallingwater']} phaseNames={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']} noun={noun} />), 'text/html').body.textContent ?? '';

describe('059: not only houses', () => {
  it('A1: the home description says famous buildings; llms.txt speaks of buildings', () => {
    expect(HOME_DESCRIPTION()).toMatch(/famous buildings/);
    expect(HOME_DESCRIPTION()).not.toMatch(/famous houses/);
    const t = llmsTxt();
    expect(t).not.toMatch(/Each house/);
    expect(t).not.toMatch(/^## Houses/m);
    expect(t).toMatch(/^## Buildings/m);
  });

  it('A2: the numbers panel names the building by its kind; "house" without one', () => {
    const chapel = text('chapel');
    expect(chapel).toMatch(/in the chapel/);
    expect(chapel).toMatch(/of the chapel/);
    expect(chapel).toMatch(/not the real chapel/);
    expect(chapel).not.toMatch(/house/);
    const house = text();
    expect(house).toMatch(/in the house/);
    expect(house).toMatch(/of the house/);
  });

  it('A3: the houses that were live before spec 055 have no noun, so they read as before', async () => {
    const before = ['stahl-house', 'eames-house', 'fallingwater', 'rietveld-schroder-house', 'farnsworth-house', 'ennis-house', 'casa-malaparte',
      'kaufmann-desert-house', 'lovell-health-house', 'casa-luis-barragan', 'koshino-house', 'sheats-goldstein-residence', 'rose-seidler-house',
      'douglas-house', 'vanna-venturi-house'];
    const slugs = readdirSync('src/houses', { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(`src/houses/${e.name}/definition.ts`)).map((e) => e.name);
    for (const s of before.filter((x) => slugs.includes(x))) {
      const mod = await import(`../src/houses/${s}/definition.ts`);
      const def = Object.values(mod).find((v): v is HouseDefinition => typeof v === 'object' && v !== null && 'build' in v)!;
      expect(def.text.noun, s).toBeUndefined();
    }
  });
});
