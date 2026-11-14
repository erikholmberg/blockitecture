import type { Phase } from '@/engine/house';

/**
 * The Centre Pompidou's build story (spec 080): the plateau and the dig, the substructure and the footings, the Forum's floor,
 * the white steel cage level by level as it went up in 1975 (columns, gerberettes, trusses, floors; then the ties and the
 * crosses), the furniture inside the open cage, the glass, the coloured pipes and the Chenille, the roof, and last the piazza's
 * setts and stacks. About 3 minutes; the cage is the longest part.
 */
export const PHASES: Phase[] = [
  { name: 'The Plateau Beaubourg & the dig', dur: 14, order: 'wave', role: 'site' },
  { name: 'The underground box & the footings', dur: 10, order: 'layer', role: 'foundation' },
  { name: 'The Forum’s floor', dur: 6, order: 'layer', role: 'floor' },
  { name: 'The steel cage, level by level', dur: 54, order: 'group', role: 'structure' },
  { name: 'The Forum, the library & the museum', dur: 14, order: 'group', role: 'interior' },
  { name: 'The glass, the pipes & the Chenille', dur: 40, order: 'group', role: 'envelope' },
  { name: 'The roof', dur: 14, order: 'group', role: 'roof' },
  { name: 'The piazza', dur: 16, order: 'layer', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
