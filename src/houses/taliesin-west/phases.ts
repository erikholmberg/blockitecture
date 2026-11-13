import type { Phase } from '@/engine/house';

/**
 * Taliesin West's build story (spec 077): the desert slope below the McDowells, the platforms and the terrace walls, the red
 * floors, the desert masonry and the bare redwood beams, the drafting tables and the Garden Room inside the open frame, the glass
 * and the window bays, the canvas roofs and the pergola, and last the prow's lawn, the pool and the desert garden. About 3 minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The desert slope below the McDowells', dur: 16, order: 'wave', role: 'site' },
  { name: 'The concrete platforms & the terrace walls', dur: 14, order: 'layer', role: 'foundation' },
  { name: 'The red floors & the flagstones', dur: 12, order: 'layer', role: 'floor' },
  { name: 'Desert masonry & the redwood beams', dur: 36, order: 'layer', role: 'structure' },
  { name: 'The drafting tables & the Garden Room', dur: 24, order: 'group', role: 'interior' },
  { name: 'The glass, the doors & the window bays', dur: 24, order: 'layer', role: 'envelope' },
  { name: 'The canvas roofs & the pergola', dur: 26, order: 'layer', role: 'roof' },
  { name: 'The prow, the pool & the desert garden', dur: 22, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
