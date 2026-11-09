// @vitest-environment jsdom
// Spec: specs/013-block-wording.md (A1, A2)
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { PAGES } from '../vite.config';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';
import { STAHL } from '../src/houses/stahl-house/definition';
import { EAMES } from '../src/houses/eames-house/definition';

const text = (html: string) => new DOMParser().parseFromString(html, 'text/html').documentElement.textContent ?? '';

describe('013: "block", not "brick", in what visitors read', () => {
  it('A1: no "brick" in any page\'s HTML (titles, descriptions, loading text)', () => {
    for (const [name, path] of Object.entries(PAGES)) expect(readFileSync(path, 'utf8'), name).not.toMatch(/brick/i);
  });

  it('A1/A2: the home page says "block by block" and never "brick"', () => {
    const html = renderToString(<HomePage houses={HOUSES} />);
    expect(text(html)).not.toMatch(/brick/i);
    expect(html).toMatch(/alt="[^"]*"/); // alt text is part of the HTML checked here
    expect(html).not.toMatch(/brick/i);
    expect(text(html)).toMatch(/block by block/);
  });

  for (const house of [STAHL, EAMES]) {
    it(`A1/A2: ${house.slug}: intro text says "block by block" and never "brick"`, () => {
      expect(JSON.stringify(house.text)).not.toMatch(/brick/i);
      // spec 026: the intro card now shows only the house's name; the stored headline (and the page titles) keep the line
      expect(house.text.headline.join(' ')).toMatch(/block by block/);
    });
  }
});
