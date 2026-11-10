// Spec: specs/051-stahl-blurb.md
import { describe, expect, it } from 'vitest';
import { HOUSES } from '../src/houses';

describe('051: the Stahl House\'s blurb', () => {
  it('A1: reads "from a hillside", and no blurb says "real hillside"', () => {
    expect(HOUSES.find((h) => h.slug === 'stahl-house')!.blurb).toBe('Steel, glass and a view over the whole of Los Angeles, from a hillside above the Sunset Strip.');
    for (const h of HOUSES) expect(h.blurb, h.slug).not.toMatch(/real hillside/i);
  });
});
