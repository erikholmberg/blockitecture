/**
 * Spec 010a: everything the engine needs to know about one house. The engine (src/engine) never imports a house;
 * each house's page builds a HouseDefinition and calls startViewer() with it.
 */
import type { View } from './controls/cameraMoves';
import type { Site } from './scene/sun';
import type { Builder } from './voxel';

export type Rect = [x0: number, z0: number, x1: number, z1: number];

/**
 * What a phase builds. Spec 012: every house goes interior → envelope → roof (furnished while the frame is open, the roof
 * last, as the Stahl House since spec 002); only landscape may follow the roof. Enforced for every house by
 * tests/buildOrder.test.ts. Ceiling-hung pieces go in with the roof via Builder.hanging().
 */
export type PhaseRole = 'site' | 'foundation' | 'floor' | 'structure' | 'interior' | 'envelope' | 'roof' | 'landscape';

export interface Phase {
  name: string;
  dur: number; // seconds at 1×
  order: 'layer' | 'group' | 'wave';
  role: PhaseRole;
}

/** Ground height in plates at a stud cell (walking fallback). */
export interface Ground {
  at(x: number, z: number): number;
}

/** The brick lot inside the real terrain. */
export interface Lot {
  rect: { x0: number; z0: number; x1: number; z1: number };
  /** top of the bricks in ft (incl. pool floors), for the terrain mesh hidden beneath them */
  surfaceFt(x: number, z: number): number;
  /** where the brick driveway leaves the lot; a ribbon joins it to the nearest real street */
  driveEnd?: [x: number, z: number];
}

export interface HouseDefinition {
  slug: string;
  text: {
    /** short name in the title block, e.g. "Stahl House" */
    name: string;
    address: string;
    /** small caps line above the intro headline */
    eyebrow: string;
    headline: [string, string];
    /** intro paragraph around the bold piece count */
    intro: [before: string, after: string];
    complete: string;
    /** an extra credit line on the intro card, e.g. a no-affiliation note */
    disclaimer?: string;
  };
  site: Site;
  phases: Phase[];
  build(): { builder: Builder; heightmap: Ground };
  /** camera target and where the hillside wave starts */
  center: { x: number; y: number; z: number };
  /** named viewpoints; `overview` is the default/home view */
  views: { overview: { label: string; view: View } } & Record<string, { label: string; view: View }>;
  /** walk mode starts (and respawns) here: x, z, yaw */
  walkStart: [x: number, z: number, yaw: number];
  lights: { interior: [number, number, number][]; pool?: [number, number, number] };
  /** "No roof" cuts away everything in these rects between y0 and y1 (world units) */
  roofCut: { y0: number; y1: number; rects: Rect[] };
  lot: Lot;
  /** URL path of the baked neighborhood data, under BASE_URL */
  data: string;
  /** model-space direction from the house toward downtown (procedural city) */
  downtownDir: [x: number, z: number];
  /** optional scenery settings; the defaults are the Stahl House's (spec 010b) */
  scenery?: Scenery;
}

/** Heights are ft relative to the house (y = 0). */
export interface Scenery {
  /** water at true sea level, with a sandy shoreline (default: none) */
  sea?: boolean;
  /** steep slopes read as chaparral (dark greens) rather than bare rock, which only shows on the steepest faces */
  chaparral?: boolean;
  /** flat ground below this reads as built-up flats (default −330) */
  flatsBelow?: number;
  /** the procedural city fills flat far ground between these heights (default below −300, any depth) */
  city?: { maxY?: number; minY?: number };
}
