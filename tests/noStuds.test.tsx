// Spec: specs/046-no-studs.md
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DRAW_STUDS } from '../src/engine/catalog';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HOUSES } from '../src/houses';
import { PAGES } from '../vite.config';

const read = (p: string) => readFileSync(p, 'utf8');
const housePages = Object.entries(PAGES).filter(([name]) => HOUSES.some((h) => h.slug === name));

describe('046: no studs', () => {
  it('A1: the viewer draws no studs: the brick set is built with none, for every house', () => {
    expect(DRAW_STUDS).toBe(false);
    // the only call that makes studs is behind the switch (since spec 047, where the model is generated)
    const gen = read('src/engine/buildPayload.ts');
    expect(gen).toMatch(/DRAW_STUDS \? builder\.computeStuds\(/);
    expect(gen.match(/computeStuds\(/g)?.length).toBe(1);
    expect(read('src/engine/viewer.ts')).not.toMatch(/computeStuds\(/);
  });

  it('A3: no house page\'s loading brick has studs', () => {
    for (const [name, path] of housePages) {
      const css = read(path).match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
      expect(css, name).not.toMatch(/radial-gradient/);
    }
  });

  it('A4: "LEGO" appears in no house definition, on the credits page or in the README; each card still names its affiliations', () => {
    for (const d of readdirSync('src/houses', { withFileTypes: true }).filter((e) => e.isDirectory())) {
      const f = `src/houses/${d.name}/definition.ts`;
      if (existsSync(f)) expect(read(f), d.name).not.toMatch(/LEGO/);
    }
    expect(read('README.md')).not.toMatch(/LEGO/);
    const credits = renderToString(<CreditsPage houses={HOUSES} />).replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
    expect(credits).not.toMatch(/LEGO/);
    for (const h of HOUSES.filter((x) => x.status === 'live')) for (const org of h.affiliations ?? []) expect(credits).toContain(org);
  });
});
