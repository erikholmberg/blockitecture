// Spec: specs/042-shortlist-marks-built.md
import { describe, expect, it } from 'vitest';
import { SHORTLIST, builtOnShortlist, livePicks } from '../src/dev/shortlist';
import { HOUSES } from '../src/houses/index';

describe('spec 042: the shortlist marks off built houses', () => {
  it('A1: built = shortlist slugs whose house is live', () => {
    const built = builtOnShortlist(SHORTLIST, HOUSES);
    expect([...built].sort()).toEqual([
      'barcelona-pavilion', 'bauhaus-dessau', 'casa-luis-barragan', 'casa-malaparte', 'centre-pompidou', 'church-of-the-light', 'douglas-house', 'ennis-house',
      'fallingwater', 'farnsworth-house', 'glass-house', 'gropius-house', 'habitat-67', 'haus-am-horn', 'kaufmann-desert-house', 'koshino-house', 'lovell-beach-house',
      'lovell-health-house', 'muuratsalo-experimental-house', 'neue-nationalgalerie', 'rietveld-schroder-house',
      'rose-seidler-house', 'salk-institute', 'schindler-house', 'sheats-goldstein-residence', 'sonneveld-house', 'taliesin-west', 'trellick-tower', 'unity-temple', 'villa-savoye',
    ]);
    expect(built.has('stahl-house')).toBe(false);
    expect(built.has('eames-house')).toBe(false);
  });

  it('A2: saved picks drop built houses and keep the rest in order', () => {
    const built = new Set(['fallingwater', 'koshino-house']);
    expect(livePicks(['villa-savoye', 'fallingwater', 'habitat-67', 'koshino-house'], built)).toEqual(['villa-savoye', 'habitat-67']);
  });
});
