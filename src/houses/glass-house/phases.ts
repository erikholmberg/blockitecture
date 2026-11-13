import type { Phase } from '@/engine/house';

/**
 * The Glass House's build story (spec 073): the knoll above the pond, the two brick platforms, the herringbone floors, the
 * black steel, the brick cylinder and the Brick House's walls, the kitchen and Mies's furniture inside the open frame, the
 * glass and the doors, the flat roofs, and last the oak, the trees, the pool, the pond and the Pavilion. About 2½ minutes.
 */
export const PHASES: Phase[] = [
  { name: 'The knoll above the pond', dur: 18, order: 'wave', role: 'site' },
  { name: 'The platforms', dur: 8, order: 'layer', role: 'foundation' },
  { name: 'The herringbone floors', dur: 10, order: 'layer', role: 'floor' },
  { name: "The black steel, the cylinder & the guest house's walls", dur: 22, order: 'layer', role: 'structure' },
  { name: "The kitchen, the walnut cabinets & Mies's furniture", dur: 26, order: 'group', role: 'interior' },
  { name: 'The glass, the four doors & the rail', dur: 16, order: 'layer', role: 'envelope' },
  { name: 'The flat roofs', dur: 10, order: 'layer', role: 'roof' },
  { name: 'The oak, the trees, the court, the pool, the pond & the Pavilion', dur: 26, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
