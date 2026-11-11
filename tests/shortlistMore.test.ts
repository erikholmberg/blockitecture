// Spec: specs/041-twenty-more-candidates.md
import { describe, expect, it } from 'vitest';
import { SHORTLIST } from '../src/dev/shortlist';

const NEW = [
  'villa-muller', 'maison-de-verre', 'schindler-house', 'esherick-house', 'douglas-house', 'hollyhock-house', 'gamble-house',
  'villa-mairea', 'taliesin-west', 'can-lis', 'hill-house', 'barcelona-pavilion', 'habitat-67', 'bauhaus-dessau', 'salk-institute',
  'unite-d-habitation', 'seagram-building', 'nakagin-capsule-tower', 'guggenheim-museum', 'sydney-opera-house',
];

describe('spec 041: twenty more candidates', () => {
  it('A1: at least 41 candidates with unique slugs, including the 20 new ones in order after the first 21', () => {
    const slugs = SHORTLIST.map((c) => c.slug);
    expect(slugs.length).toBeGreaterThanOrEqual(41); // spec 054 adds 40 more after these
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.slice(21, 41)).toEqual(NEW);
  });
});
