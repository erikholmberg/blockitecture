import type { Phase } from '@/engine/house';

/**
 * The Salk Institute's build story (spec 079): the mesa above the Pacific and the cut for the lower storeys, the retaining walls and
 * the deep slabs, the lowest lab floor, the concrete rising storey by storey with the truss floors between the lab floors and the
 * plaza's travertine laid when the walls reach it, the labs, the pipes and the studies inside the open frame, the glass and the
 * teak, the flat roofs, and last the river of life, the orange trees and the eucalyptus. About 3½ minutes (spec 079 Q6).
 */
export const PHASES: Phase[] = [
  { name: 'The mesa above the Pacific', dur: 18, order: 'wave', role: 'site' },
  { name: 'The retaining walls & the deep slabs', dur: 16, order: 'layer', role: 'foundation' },
  { name: 'The lowest lab floor & the light wells\' paving', dur: 10, order: 'layer', role: 'floor' },
  { name: 'Concrete, storey by storey', dur: 62, order: 'layer', role: 'structure' },
  { name: 'The labs, the pipes & the studies', dur: 26, order: 'group', role: 'interior' },
  { name: 'Glass & teak', dur: 34, order: 'layer', role: 'envelope' },
  { name: 'The flat roofs', dur: 16, order: 'layer', role: 'roof' },
  { name: 'The river of life, the orange trees & the eucalyptus', dur: 26, order: 'group', role: 'landscape' },
];

export const P = { SITE: 0, FOUNDATION: 1, FLOOR: 2, STRUCTURE: 3, INTERIOR: 4, ENVELOPE: 5, ROOF: 6, LANDSCAPE: 7 };
