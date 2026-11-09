import type { Phase } from '@/engine/house';

/**
 * The Eames House's build story (spec 010 Q6, reordered by spec 012: furnished inside the open frame, then the panels,
 * the roof last). About 230 s at 1×.
 */
export const PHASES: Phase[] = [
  // starts at the house and spreads out over the meadow and down the slopes (as spec 005)
  { name: 'Shaping the hillside & meadow', dur: 16, order: 'wave', role: 'site' },
  { name: 'Retaining wall & foundations', dur: 20, order: 'layer', role: 'foundation' },
  { name: 'Slab & walkway', dur: 14, order: 'layer', role: 'floor' },
  // the frame famously went up in about a day and a half; the mezzanine and loft decks are part of it
  { name: 'Steel frame & mezzanine', dur: 16, order: 'layer', role: 'structure' },
  { name: 'Interior & furniture', dur: 50, order: 'group', role: 'interior' },
  { name: 'Panels & glass', dur: 40, order: 'layer', role: 'envelope' },
  { name: 'Roof', dur: 22, order: 'layer', role: 'roof' },
  { name: 'Meadow, eucalyptus & finishing touches', dur: 40, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STEEL: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
