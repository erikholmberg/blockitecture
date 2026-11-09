// Spec: specs/016-next-houses.md (A1)
import { describe, expect, it } from 'vitest';
import { HOUSES } from '../src/houses/index';

describe('016: the next houses', () => {
  it('A1: coming-soon cards for the picks, in order, data only (specs 017 and 019 made Fallingwater and Schröder live)', () => {
    const soon = HOUSES.filter((h) => h.status === 'coming-soon');
    // spec 020 added the Kaufmann Desert House; specs 031 and 033 made the last two live, so none are left
    expect(soon.map((h) => h.slug)).toEqual([]);
    for (const h of soon) {
      expect(h.title && h.architect && h.location && h.blurb).toBeTruthy();
      expect(h.year).toBeGreaterThan(1900);
      expect(h.thumbnail).toBeUndefined();
      expect(h.pieces).toBeUndefined();
    }
  });
});
