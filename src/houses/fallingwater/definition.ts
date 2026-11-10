/** Fallingwater as a house definition for the engine (spec 017). */
import type { HouseDefinition } from '@/engine/house';
import { realToModelDir } from '@/engine/scene/sun';
import { buildFallingwater } from './model/fallingwater';
import { BRIDGE, CENTER, CHIMNEY, ROOF, SITE, TRAY2, TRAY3, Y } from './model/layout';
import { surfaceFt, TERRAIN } from './model/site';
import { PHASES } from './phases';

const v3 = (x: number, y: number, z: number) => ({ x, y, z });
const PL = 0.4;

export const FALLINGWATER: HouseDefinition = {
  slug: 'fallingwater',
  text: {
    name: 'Fallingwater',
    address: 'Bear Run, Mill Run, Pennsylvania',
    eyebrow: 'Kaufmann Residence · Frank Lloyd Wright · 1937',
    headline: ['Fallingwater,', 'block by block'],
    intro: [
      'Ochre concrete terraces cantilevered over the falls of Bear Run, anchored in a core of local sandstone. Watch all',
      'pieces snap into place, from the rock ledge to the last rhododendron. Fly around it, or walk in while it goes up.',
    ],
    complete: 'Complete. Welcome to Fallingwater',
    disclaimer:
      'Fan tribute. Not affiliated with the Western Pennsylvania Conservancy or the Frank Lloyd Wright Foundation.',
  },
  site: SITE,
  phases: PHASES,
  build: buildFallingwater,
  center: CENTER,
  // model frame = the HABS plans: +x ≈ north-east along the stream (upstream), +z ≈ south-east across it; the terraces
  // face +z, the falls drop toward −x
  views: {
    overview: { label: 'Overview', view: { pos: v3(-60, 70, 190), target: v3(50, 0, 45) } },
    // the famous photograph: from downstream, below the falls, looking up at the terraces
    classic: { label: 'The classic view', view: { pos: v3(-30, -9, 135), target: v3(48, 4, 50) } }, // y −14 → −9: it was inside the bank (spec 028)
    living: { label: 'Living room', view: { pos: v3(47, 5, 62), target: v3(31, 3, 33) } },
    bridge: { label: 'The bridge', view: { pos: v3(168, 8, 62), target: v3(70, 4, 50) } },
    guest: { label: 'Guest wing & walkway', view: { pos: v3(95, 60, 10), target: v3(40, 30, -45) } },
  },
  // on the bridge over Bear Run, facing the house
  walkStart: [120, 60, Math.PI / 2],
  lights: { interior: [[45, 5, 45], [40, 14, 36], [38, 22, 22], [70, 32, -60]] },
  // "No roof": the main roof and the canopy, then the third and second floors' trays, so all three levels open up
  roofCut: {
    y0: (Y.L2 - 5) * PL - 0.05,
    y1: (Y.ROOF + 2) * PL,
    rects: [ROOF, ...TRAY3, ...TRAY2, [20, 34, 100, 47], [CHIMNEY[0], CHIMNEY[1], CHIMNEY[2], CHIMNEY[3]]],
  },
  lot: { rect: TERRAIN, surfaceFt, driveEnd: [(BRIDGE[0] + BRIDGE[2]) / 2, TERRAIN.z1 - 1] },
  data: 'fallingwater/neighborhood.bin',
  // Pittsburgh is about 60 miles away at a bearing of ~300° (not shown: there is no city here)
  downtownDir: realToModelDir(300, SITE.rotationDeg),
  scenery: { forest: true, city: false, flowingWater: true, chaparral: false, flatsBelow: -100000 },
};
