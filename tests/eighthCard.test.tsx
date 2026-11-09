// @vitest-environment jsdom
// Spec: specs/020-eighth-card.md
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses/index';

describe('020: an eighth card', () => {
  it('A1: the Kaufmann Desert House joins the coming-soon cards, last, as data only', () => {
    const soon = HOUSES.filter((h) => h.status === 'coming-soon');
    expect(soon.map((h) => h.slug)).toEqual(['ennis-house', 'casa-malaparte', 'kaufmann-desert-house']);
    const k = soon[2]; // (spec 022 made the Farnsworth House live)
    expect(k.title && k.architect && k.location && k.blurb).toBeTruthy();
    expect(k.year).toBe(1946);
    expect(k.thumbnail).toBeUndefined();
    expect(k.pieces).toBeUndefined();
  });

  it('A2: the home page renders 8 cards (spec 022: now 5 live, 3 coming soon)', () => {
    const doc = new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');
    expect(doc.querySelectorAll('[data-house]').length).toBe(8);
    expect(HOUSES.filter((h) => h.status === 'live').length).toBe(5);
  });
});
