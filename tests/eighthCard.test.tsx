// @vitest-environment jsdom
// Spec: specs/020-eighth-card.md
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses/index';

describe('020: an eighth card', () => {
  it('A1: the Kaufmann Desert House joins the coming-soon cards, last, as data only', () => {
    const soon = HOUSES.filter((h) => h.status === 'coming-soon');
    expect(soon.map((h) => h.slug)).toEqual(['kaufmann-desert-house']);
    const k = soon[0]; // (specs 022, 025 and 031 made Farnsworth, Ennis and Casa Malaparte live)
    expect(k.title && k.architect && k.location && k.blurb).toBeTruthy();
    expect(k.year).toBe(1946);
    expect(k.thumbnail).toBeUndefined();
    expect(k.pieces).toBeUndefined();
  });

  it('A2: the home page renders 8 cards (specs 022, 025, 031: now 7 live, 1 coming soon)', () => {
    const doc = new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');
    expect(doc.querySelectorAll('[data-house]').length).toBe(8);
    expect(HOUSES.filter((h) => h.status === 'live').length).toBe(7);
  });
});
