// Spec: specs/054-forty-more-candidates.md
import { describe, expect, it } from 'vitest';
import { SHORTLIST, WIKI_TITLE_LIMIT, batches } from '../src/dev/shortlist';

const NEW = [
  'lovell-beach-house', 'vdl-research-house', 'moriyama-house', 'house-na', 'row-house-in-sumiyoshi', 'sky-house', 'tower-house',
  'maison-a-bordeaux', 'villa-dall-ava', 'casa-de-vidro', 'casa-butanta', 'casa-gilardi', 'walker-guest-house', 'jacobs-house',
  'fisher-house', 'muuratsalo-experimental-house', 'villa-stein-de-monzie', 'sonneveld-house', 'haus-am-horn', 'hopkins-house',
  'casa-bianchi', 'sea-ranch-condominium-one', 'schminke-house', 'gehry-residence',
  'neue-nationalgalerie', 'crown-hall', 'church-of-the-light', 'therme-vals', 'unity-temple', 'centre-pompidou',
  'van-nelle-factory', 'fagus-factory', 'lever-house', 'lake-shore-drive-860-880', 'trellick-tower', 'boston-city-hall',
  'casa-del-fascio', 'isokon-building', 'villa-la-rotonda', 'katsura-imperial-villa',
];

describe('spec 054: forty more candidates', () => {
  it('A1: 81 candidates with unique slugs, the 40 new ones in order after the first 41', () => {
    const slugs = SHORTLIST.map((c) => c.slug);
    expect(slugs).toHaveLength(81);
    expect(new Set(slugs).size).toBe(81);
    expect(slugs.slice(41)).toEqual(NEW);
  });

  it('A2: each new candidate has a fit of 1–3, a year, a place, a why and a Commons search', () => {
    for (const c of SHORTLIST.slice(41)) {
      expect([1, 2, 3], c.slug).toContain(c.fit);
      expect(c.year, c.slug).toBeGreaterThan(1500);
      expect(c.place.trim(), c.slug).not.toBe('');
      expect(c.why.trim(), c.slug).not.toBe('');
      expect(c.commons.trim(), c.slug).not.toBe('');
    }
  });
});

describe('spec 054: lead photos in batches', () => {
  it('A5: the Wikipedia titles go out in batches of at most 50, none lost', () => {
    const titles = SHORTLIST.flatMap((c) => (c.wiki ? [c.wiki] : []));
    expect(titles.length).toBeGreaterThan(WIKI_TITLE_LIMIT); // why batching is needed
    const parts = batches(titles);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(50);
    expect(parts.flat()).toEqual(titles);
  });
});
