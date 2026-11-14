import type { Phase } from '@/engine/house';

/**
 * The Gropius House's build story (spec 078): the hilltop above the orchard, the fieldstone walls and the foundation, the
 * floors, the open wooden frame with the steel posts and the spiral stair, the Bauhaus furniture inside the open frame, the
 * white siding, the windows and the glass block, the flat roofs with the canopy and the brise-soleil, and last the orchard, the
 * oak and the Japanese garden. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The hilltop above the orchard', dur: 18, order: 'wave', role: 'site' },
  { name: 'The fieldstone walls & the stone foundation', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The cork, the linoleum & the bluestone', dur: 8, order: 'layer', role: 'floor' },
  { name: 'The wooden frame & the steel posts', dur: 22, order: 'layer', role: 'structure' },
  { name: 'Bauhaus furniture on both floors', dur: 24, order: 'group', role: 'interior' },
  { name: 'White siding, ribbon windows & glass block', dur: 22, order: 'layer', role: 'envelope' },
  { name: 'The flat roofs, the canopy & the brise-soleil', dur: 12, order: 'layer', role: 'roof' },
  { name: 'The orchard, the oak & the Japanese garden', dur: 24, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
