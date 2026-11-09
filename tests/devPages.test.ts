// Dev-only pages (the /dev/shortlist/ photo page) must never be built or deployed.
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { PAGES } from '../vite.config';
import { SHORTLIST } from '../src/dev/shortlist';
import { HOUSES } from '../src/houses/index';

describe('dev pages', () => {
  it('the shortlist page exists but is not a build input', () => {
    expect(existsSync('dev/shortlist/index.html')).toBe(true);
    for (const p of Object.values(PAGES)) expect(p).not.toMatch(/[\\/]dev[\\/]/);
  });

  it('the shortlist covers every coming-soon house, with unique slugs', () => {
    const slugs = SHORTLIST.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.length).toBe(21); // the 20 from spec 016, plus Fallingwater
    for (const h of HOUSES.filter((x) => x.status === 'coming-soon')) expect(slugs).toContain(h.slug);
  });
});
