import type { Phase } from '@/engine/house';

/** The Stahl House's build story (specs 002, 005). */
export const PHASES: Phase[] = [
  // starts at the house pad and spreads outward and down the slope (spec 005)
  { name: 'Shaping the hillside', dur: 16, order: 'wave' },
  { name: 'Foundations & pool basin', dur: 18, order: 'layer' },
  { name: 'Floor slab & terrace', dur: 18, order: 'layer' },
  { name: 'Steel frame', dur: 24, order: 'layer' },
  // interior goes in while the frame is still open, so it can be watched (spec 002)
  { name: 'Interior & furniture', dur: 52, order: 'group' },
  { name: 'Glass & walls', dur: 30, order: 'layer' },
  { name: 'Roof deck', dur: 24, order: 'layer' },
  { name: 'Pool, garden & finishing touches', dur: 34, order: 'group' },
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
