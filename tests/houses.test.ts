// Spec: specs/007-home-page.md (A1)
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { HOUSES } from '../src/houses/index';
import { PAGES } from '../vite.config';
import { buildStahlHouse } from '../src/houses/stahl-house/model/stahlHouse';

describe('007: house registry', () => {
  it('A1: slugs are unique and URL-safe', () => {
    const slugs = HOUSES.map((h) => h.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('A1: live houses have a thumbnail file, a piece count and a page in the build', () => {
    const live = HOUSES.filter((h) => h.status === 'live');
    expect(live.length).toBeGreaterThan(0);
    for (const h of live) {
      expect(h.pieces).toBeGreaterThan(0);
      expect(h.thumbnail).toMatch(new RegExp(`^/${h.slug}/`));
      expect(existsSync(`public${h.thumbnail}`)).toBe(true);
      expect(Object.keys(PAGES)).toContain(h.slug);
      expect(existsSync(`${h.slug}/index.html`)).toBe(true);
    }
  });

  it('A1: the Stahl House piece count matches the model', () => {
    expect(HOUSES.find((h) => h.slug === 'stahl-house')!.pieces).toBe(buildStahlHouse().builder.bricks.length);
  });

  it('A1: the planned coming-soon houses are listed', () => {
    // spec 010 made the Eames House live, spec 017 Fallingwater, spec 019 the Schröder House; spec 016's other picks are to come
    expect(HOUSES.filter((h) => h.status === 'coming-soon').map((h) => h.slug)).toEqual([
      // spec 020's Kaufmann Desert House was the last; specs 031 and 033 made Casa Malaparte and it live
    ]);
    expect(HOUSES.filter((h) => h.status === 'live').map((h) => h.slug)).toEqual(['stahl-house', 'eames-house', 'fallingwater', 'rietveld-schroder-house', 'farnsworth-house', 'ennis-house', 'casa-malaparte', 'kaufmann-desert-house', 'lovell-health-house', 'casa-luis-barragan', 'koshino-house', 'sheats-goldstein-residence']);
  });
});
