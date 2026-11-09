import type { Phase } from '@/engine/house';

/** The Stahl House's build story (specs 002, 005). */
export const PHASES: Phase[] = [
  // starts at the house pad and spreads outward and down the slope (spec 005)
  { name: 'Shaping the hillside', dur: 16, order: 'wave', role: 'site' },
  { name: 'Foundations & pool basin', dur: 18, order: 'layer', role: 'foundation' },
  { name: 'Floor slab & terrace', dur: 18, order: 'layer', role: 'floor' },
  { name: 'Steel frame', dur: 24, order: 'layer', role: 'structure' },
  // interior goes in while the frame is still open, so it can be watched (spec 002)
  { name: 'Interior & furniture', dur: 52, order: 'group', role: 'interior' },
  { name: 'Glass & walls', dur: 30, order: 'layer', role: 'envelope' },
  { name: 'Roof deck', dur: 24, order: 'layer', role: 'roof' },
  { name: 'Pool, garden & finishing touches', dur: 34, order: 'group', role: 'landscape' },
];

export const P = {
  SITE: 0,
  FOUNDATION: 1,
  FLOOR: 2,
  STEEL: 3,
  INTERIOR: 4,
  ENVELOPE: 5,
  ROOF: 6,
  LANDSCAPE: 7,
};
