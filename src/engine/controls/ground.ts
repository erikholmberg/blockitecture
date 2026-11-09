/**
 * Spec 028: the orbit camera stays above the ground. Pure (no DOM, no Three.js), so it's tested in Node.
 */
import { PLATE } from '@/engine/catalog';
import type { Ground, Lot, Scenery } from '@/engine/house';
import { groundHeight, lotDistance, Neighborhood, waterAreaAt } from '@/engine/scene/neighborhoodData';

/** how far above the ground the camera stops, in ft (Q1) */
export const CAMERA_MARGIN = 3;

export interface Vec3 { x: number; y: number; z: number }

/** The position raised to ground + margin if it's below that, otherwise unchanged (the same object). */
export function clampAboveGround(p: Vec3, ground: (x: number, z: number) => number, margin = CAMERA_MARGIN): Vec3 {
  const floor = ground(p.x, p.z) + margin;
  return p.y < floor ? { x: p.x, y: floor, z: p.z } : p;
}

/**
 * The ground under (x, z) in ft: the block terrain's top inside the lot, the real terrain outside it (once the neighbourhood
 * has loaded), and never below the water: the sea (spec 010b) or a water area (spec 022).
 */
export function groundLookup(o: { heightmap: Ground; lot: Lot; n: Neighborhood | null; scenery?: Scenery }) {
  const seaY = o.scenery?.sea && o.n ? -o.n.anchor.lotElevationM / 0.3048 : null;
  const areas = o.scenery?.waterAreas ?? [];
  return (x: number, z: number): number => {
    let y = !o.n || lotDistance(o.lot, x, z) === 0 ? o.heightmap.at(x, z) * PLATE : groundHeight(o.n, o.lot, x, z);
    if (seaY !== null) y = Math.max(y, seaY);
    if (areas.length) {
      const w = waterAreaAt(areas, x, z);
      if (w !== null) y = Math.max(y, w);
    }
    return y;
  };
}
