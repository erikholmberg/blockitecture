/** The Salk Institute as a house definition for the engine (spec 079). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildSalk } from './model/salk';
import { CENTER, SITE, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';
import { STATS } from '../stats';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;
/** sea level in model ft: y = 0 is the plaza, 113.03 m above it (the data script's lot elevation) */
const SEA_Y = -113.03 / 0.3048;

export const SALK_INSTITUTE: HouseDefinition = {
  slug: 'salk-institute',
  text: {
    name: 'Salk Institute',
    address: '10010 N Torrey Pines Road, La Jolla',
    eyebrow: 'Salk Institute · Louis Kahn · 1965',
    headline: ['The Salk Institute,', 'block by block'],
    intro: [
      'Two mirror-image wings of bare concrete on a mesa above the Pacific, their teak studies turned toward the sea, and between them an empty travertine plaza cut by a single line of water. Watch all',
      'pieces snap into place. Fly around it, or walk down the plaza to the ocean.',
    ],
    complete: 'Complete. Welcome to the Salk Institute',
    disclaimer: 'Fan tribute. Not affiliated with the Salk Institute for Biological Studies.',
    noun: 'institute',
  },
  site: SITE,
  phases: PHASES,
  build: buildSalk,
  center: CENTER,
  // model frame (layout.ts): +x along the plaza toward the sea (real west), +z toward the north wing (real north)
  views: {
    // from the south-south-east, over the south wing, the plaza and the north wing to the sea
    overview: { label: 'Overview', view: { pos: v3(40, 230, -470), target: v3(320, -10, 30) } },
    // from the plaza's east end at eye height, down the channel to the ocean (the thumbnail's camera)
    plaza: { label: 'The plaza', view: { pos: v3(54, 5.5, 0.5), target: v3(420, 2, 0) } },
    study: { label: 'A study', view: { pos: v3(226, 7, 18), target: v3(190, 14, 45) } },
    fountain: { label: 'The fountain', view: { pos: v3(355, Y.LANDING * PL + 5.5, 0.5), target: v3(280, 2, 0) } },
    lightWell: { label: 'A light well', view: { pos: v3(140, 26, 199), target: v3(158, -30, 174) } },
    service: { label: 'The service floor', view: { pos: v3(56, 4.5, 113), target: v3(300, 4, 113) } },
    above: { label: 'From above', view: { pos: v3(181, 560, 0.5), target: v3(181, 0, 0) } },
  },
  // on the plaza by the grove's steps, facing down the channel to the sea (+x)
  walkStart: [56, 0, -Math.PI / 2],
  lights: {
    interior: [[120, 15, 130], [250, 15, 130], [120, 15, -130], [250, 15, -130], [122, 11, 56], [242, 11, 56], [122, 11, -57], [242, 11, -57], [341, 15, 130], [341, 15, -130]],
  },
  // "No roof": the wings', the outer towers' and the study towers' roof slabs and parapets
  roofCut: { y0: (Y.ROOF - Y.SLAB) * PL - 0.05, y1: Y.PARAPET * PL + 0.5, rects: [[0, 39, 362, 188], [0, -188, 362, -39]] },
  lot: { rect: TERRAIN, surfaceFt },
  data: 'salk-institute/neighborhood.bin',
  // downtown San Diego lies to the south-south-east, down the coast
  downtownDir: realToModelDir(165, SITE.rotationDeg),
  // the Pacific at true sea level, the canyon's and bluffs' scrub; the procedural city on the mesa's flat ground beyond the
  // real neighbourhood (UC San Diego, Sorrento) and on La Jolla's flats, not on the beach
  scenery: { sea: true, chaparral: true, flatsBelow: -100, city: { maxY: 30, minY: SEA_Y + 20 } },
  // spec 079: the buildings span about 360 × 375 ft
  shadowReach: 220,
  stats: STATS['salk-institute'],
};
