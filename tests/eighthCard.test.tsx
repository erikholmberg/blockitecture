// @vitest-environment jsdom
// Spec: specs/020-eighth-card.md
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses/index';

describe('020: an eighth card', () => {
  it('A1: the Kaufmann Desert House is the last card (spec 033 made it live, with every other)', () => {
    const k = HOUSES[HOUSES.length - 1];
    expect(k.slug).toBe('kaufmann-desert-house');
    expect(k.title && k.architect && k.location && k.blurb).toBeTruthy();
    expect(k.year).toBe(1946);
    expect(HOUSES.filter((h) => h.status === 'coming-soon')).toEqual([]);
  });

  it('A2: the home page renders 8 cards (specs 022, 025, 031, 033: now all 8 live)', () => {
    const doc = new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');
    expect(doc.querySelectorAll('[data-house]').length).toBe(8);
    expect(HOUSES.filter((h) => h.status === 'live').length).toBe(8);
  });
});
