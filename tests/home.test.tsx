// @vitest-environment jsdom
// Spec: specs/007-home-page.md (A2)
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses/index';

const html = renderToString(<HomePage houses={HOUSES} />);
const doc = new DOMParser().parseFromString(html, 'text/html');

describe('007: home page', () => {
  it('A2: one card per house, in registry order', () => {
    const titles = [...doc.querySelectorAll('[data-house]')].map((c) => c.getAttribute('data-house'));
    expect(titles).toEqual(HOUSES.map((h) => h.slug));
  });

  it('A2: the Stahl House card links to its page', () => {
    const card = doc.querySelector('[data-house="stahl-house"]')!;
    const link = card.closest('a') ?? card.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/stahl-house/');
    expect(card.textContent).toContain('27,222');
  });

  it('A2: coming-soon cards are not links and say so', () => {
    for (const slug of ['eames-house', 'fallingwater']) {
      const card = doc.querySelector(`[data-house="${slug}"]`)!;
      expect(card.closest('a')).toBeNull();
      expect(card.querySelector('a')).toBeNull();
      expect(card.getAttribute('aria-disabled')).toBe('true');
      expect(card.textContent).toContain('Coming soon');
    }
  });

  it('A2: credits are on the page', () => {
    expect(doc.body.textContent).toContain('OpenStreetMap contributors');
    expect(doc.body.textContent).toContain('not affiliated with the LEGO Group');
  });
});
