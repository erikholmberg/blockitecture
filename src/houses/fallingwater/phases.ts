import type { Phase } from '@/engine/house';

/**
 * Fallingwater's build story (spec 017): the ravine, the bolsters on the rock, the living-room tray out over the falls,
 * then the stone core and the upper terraces (the cantilever moment), furnished inside the open frame, the Cherokee red
 * sash and glass, the roofs, and last the water and the forest. About 230 s at 1×.
 */
export const PHASES: Phase[] = [
  // starts at the house and spreads out along the ravine and up the hill (as spec 005)
  { name: 'Shaping the ravine & Bear Run', dur: 18, order: 'wave', role: 'site' },
  { name: 'Bolsters & stone piers on the rock', dur: 18, order: 'layer', role: 'foundation' },
  { name: 'The living-room tray', dur: 16, order: 'layer', role: 'floor' },
  { name: 'Stone core, chimney & upper terraces', dur: 36, order: 'layer', role: 'structure' },
  { name: 'Walnut built-ins & furniture', dur: 40, order: 'group', role: 'interior' },
  { name: 'Cherokee red sash & glass', dur: 34, order: 'layer', role: 'envelope' },
  { name: 'Roofs, trellises & canopy', dur: 22, order: 'layer', role: 'roof' },
  { name: 'Water, rhododendron & forest', dur: 44, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
