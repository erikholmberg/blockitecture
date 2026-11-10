// Spec: specs/048-shorter-disclaimer.md
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CreditsPage } from '../src/credits/CreditsPage';
import type { HouseDefinition } from '../src/engine/house';
import { HOUSES } from '../src/houses';

const read = (p: string) => readFileSync(p, 'utf8');
const slugs = readdirSync('src/houses', { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(`src/houses/${e.name}/definition.ts`)).map((e) => e.name);
const defs: HouseDefinition[] = [];
for (const s of slugs) {
  const mod = await import(`../src/houses/${s}/definition.ts`);
  defs.push(Object.values(mod).find((v): v is HouseDefinition => typeof v === 'object' && v !== null && 'build' in v && 'slug' in v)!);
}
const creditsText = renderToString(<CreditsPage houses={HOUSES} />).replace(/<[^>]*>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

describe('048: a shorter disclaimer', () => {
  it('A1: "toy-block style" is in no house definition, on the credits page or in the README', () => {
    for (const s of slugs) expect(read(`src/houses/${s}/definition.ts`), s).not.toMatch(/toy-block style/);
    expect(creditsText).not.toMatch(/toy-block style/);
    expect(read('README.md')).not.toMatch(/toy-block style/);
  });

  it('A2: every intro card\'s disclaimer is "Fan tribute. Not affiliated with …", naming its house\'s affiliations', () => {
    for (const d of defs) {
      if (!d.text.disclaimer) continue; // the Stahl House has none
      expect(d.text.disclaimer, d.slug).toMatch(/^Fan tribute\. Not affiliated with .+\.$/);
      const card = HOUSES.find((h) => h.slug === d.slug);
      if (!card) continue; // hidden houses
      const named = d.text.disclaimer.match(/Not affiliated with (.*)\.$/)![1].split(/, | or /);
      expect(named.sort(), d.slug).toEqual([...(card.affiliations ?? [])].sort());
    }
  });

  it('A3: the credits page opens with the shorter line', () => {
    expect(creditsText).toContain('Every house here is a fan tribute, not affiliated with the people or organisations named with it.');
  });
});
