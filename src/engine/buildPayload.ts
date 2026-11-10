/**
 * Spec 047: the model, generated where it won't block the page. `buildPayload()` builds a house's model and its schedule and
 * packs them so they can be posted from a Web Worker (plain objects and typed arrays only); `unpackPayload()` turns that back
 * into what the viewer uses. Pure: no DOM, no Three.js, so it runs the same in a worker, on the main thread and in tests.
 */
import { Brick, DRAW_STUDS } from '@/engine/catalog';
import type { Ground, HouseDefinition } from '@/engine/house';
import { Schedule, sequence } from '@/engine/sequencer';
import type { Stud } from '@/engine/voxel';

/** how far round the lot the ground is sampled: walking can stray off it (beyond, the edge's height holds) */
export const GROUND_MARGIN = 120;

export interface BuildPayload {
  bricks: Brick[];
  order: Int32Array;
  start: Float32Array;
  phaseStart: number[];
  total: number;
  studs: Stud[];
  /** the ground's top in plates, a cell per stud, over the lot and a margin round it */
  ground: { x0: number; z0: number; w: number; d: number; top: Int16Array };
}

export function buildPayload(house: HouseDefinition): BuildPayload {
  const { builder, heightmap } = house.build();
  const schedule = sequence(builder.bricks, house.phases, house.center);
  const studs = DRAW_STUDS ? builder.computeStuds(schedule.order) : [];
  const r = house.lot.rect;
  const x0 = r.x0 - GROUND_MARGIN, z0 = r.z0 - GROUND_MARGIN;
  const w = r.x1 - r.x0 + 2 * GROUND_MARGIN, d = r.z1 - r.z0 + 2 * GROUND_MARGIN;
  const top = new Int16Array(w * d);
  for (let j = 0; j < d; j++) for (let i = 0; i < w; i++) top[j * w + i] = heightmap.at(x0 + i, z0 + j);
  return {
    bricks: builder.bricks, order: Int32Array.from(schedule.order), start: schedule.start, phaseStart: schedule.phaseStart,
    total: schedule.total, studs, ground: { x0, z0, w, d, top },
  };
}

/** the typed arrays in a payload, to transfer rather than copy when posting it */
export const transferables = (p: BuildPayload): ArrayBuffer[] => [p.order.buffer, p.start.buffer, p.ground.top.buffer] as ArrayBuffer[];

/** the ground from a payload: its sampled heights, the nearest edge's beyond them */
export function payloadGround(g: BuildPayload['ground']): Ground {
  return {
    at(x: number, z: number) {
      const i = Math.min(Math.max(Math.floor(x) - g.x0, 0), g.w - 1), j = Math.min(Math.max(Math.floor(z) - g.z0, 0), g.d - 1);
      return g.top[j * g.w + i];
    },
  };
}

export function unpackPayload(p: BuildPayload): { bricks: Brick[]; schedule: Schedule; studs: Stud[]; heightmap: Ground } {
  return {
    bricks: p.bricks,
    schedule: { order: Array.from(p.order), start: p.start, phaseStart: p.phaseStart, total: p.total },
    studs: p.studs,
    heightmap: payloadGround(p.ground),
  };
}
