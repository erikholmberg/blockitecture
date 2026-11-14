// Spec: specs/081-schindler-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { SCHINDLER as H } from '../src/houses/schindler-house/definition';
import { CANVAS, CONCRETE, FROSTED, GLASS, JOINT, REDWOOD, ROOFING } from '../src/houses/schindler-house/model/house';
import { BLANKET, MATTRESS } from '../src/houses/schindler-house/model/interior';
import { BAMBOO_GREEN, HEDGE, LAWN } from '../src/houses/schindler-house/model/landscape';
import {
  bbox, cellOf, CHIMNEYS, DIAMOND, DRIVE_STRIPS, EAST_GARDEN, EAST_PATIO, inDiamond, inHouse, NE_WING, NORTH_BASKET, PLAN, Rect, ROOMS,
  SCREEN_RUNS, SLAB_RUNS, slabPart, slabsOf, SOUTH_BASKET, SOUTH_STAIR, SOUTH_WING, GUEST, WEST_GARDEN, WEST_PATIO, Y, BAMBOO,
} from '../src/houses/schindler-house/model/layout';
import { LOT_ROADS, LOT_SELF } from '../src/houses/schindler-house/model/lotTerrain';
import { lawnTop, TERRAIN } from '../src/houses/schindler-house/model/site';
import { GRID } from '../src/houses/schindler-house/model/schindlerHouse';
import { P, PHASES } from '../src/houses/schindler-house/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/schindler-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/schindler-house/model/${f}`, 'utf8');
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const ft = (plates: number) => plates * PLATE;
const inR = (b: { x: number; z: number; w: number; d: number }, r: Rect) => b.x >= r[0] && b.x + b.w <= r[2] && b.z >= r[1] && b.z + b.d <= r[3];
const house = (b: (typeof bricks)[number] | undefined) => !!b && (b.phase === P.STRUCTURE || b.phase === P.ENVELOPE);
const range = (a: number, e: number) => Array.from({ length: e - a }, (_, i) => a + i);

/** the neighbourhood's building (from the data file) whose outline holds a point: its ring, base and top in ft */
function neighbourAt(px: number, pz: number) {
  const B = n.buildings;
  for (let i = 0; i < B.count; i++) {
    const ring: [number, number][] = [];
    for (let k = B.start[i]; k < B.start[i + 1]; k++) ring.push([B.xz[k * 2], B.xz[k * 2 + 1]]);
    if (inPoly(px, pz, ring)) return { ring, top: B.top[i] };
  }
  return null;
}
const KINGS_WEST = neighbourAt(20, -100)!;
const HABITAT = neighbourAt(20, 130)!;

describe('081: the Schindler House', () => {
  it('A1: 79′-4″ × 77′-8″ over all, the south wing 44′-8″; the west patio closed on three sides and open west; the east patio closed by the house and by hedges', () => {
    const slabs = bricks.filter((b) => b.phase === P.STRUCTURE && b.color === CONCRETE && b.kind === 'tile');
    const xs = slabs.flatMap((b) => [b.x, b.x + b.w]), zs = slabs.flatMap((b) => [b.z, b.z + b.d]);
    expect(Math.abs(Math.max(...xs) - Math.min(...xs) - (79 + 4 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(Math.max(...zs) - Math.min(...zs) - (77 + 8 / 12))).toBeLessThanOrEqual(1);
    expect(Math.abs(SOUTH_WING[2] - SOUTH_WING[0] - (44 + 8 / 12))).toBeLessThanOrEqual(1);
    // the west patio: the house along its north (z − 1), east (x1) and south (z1); nothing of the house to its west
    const [wx0, wz0, wx1, wz1] = WEST_PATIO;
    for (const x of range(wx0, wx1)) {
      expect(house(at(x, 5, wz0 - 1)), `north ${x}`).toBe(true);
      expect(house(at(x, 5, wz1)), `south ${x}`).toBe(true);
    }
    for (const z of range(wz0, wz1)) {
      expect(house(at(wx1, 5, z)), `east ${z}`).toBe(true);
      for (let x = wx0 - 30; x < wx0; x++) expect(house(at(x, 5, z)), `west ${x},${z}`).toBe(false);
    }
    // the east patio: the house on its north and west; hedges on its east and south
    const [ex0, ez0, ex1, ez1] = EAST_PATIO;
    const hedge = (b: (typeof bricks)[number] | undefined) => !!b && b.phase === P.LANDSCAPE && HEDGE.includes(b.color);
    for (const x of range(ex0, ex1)) {
      expect(house(at(x, 5, ez0 - 1)) || hedge(at(x, 5, ez0 - 1)), `north ${x}`).toBe(true);
      expect(range(ez1, ez1 + 30).some((z) => hedge(at(x, 5, z))), `south ${x}`).toBe(true);
    }
    for (const z of range(ez0, ez1)) {
      expect(house(at(ex0 - 1, 5, z)), `west ${z}`).toBe(true);
      expect(range(ex1, ex1 + 30).some((x) => hedge(at(x, 5, z))), `east ${z}`).toBe(true);
    }
    expect(range(NE_WING[0], NE_WING[2]).filter((x) => house(at(x, 5, ez0 - 1))).length).toBeGreaterThan(25);
  });

  it('A2: OSM\'s ways 391380962 and 391380944 ≥ 85% inside the footprint, their edges within 1.5° of the walls; between Kings West and Habitat 825, west of the sidewalk', () => {
    expect(LOT_SELF.length).toBe(2);
    for (const ring of LOT_SELF) {
      let inside = 0, all = 0;
      for (let z = -10; z < 90; z++) for (let x = -10; x < 90; x++) if (inPoly(x + 0.5, z + 0.5, ring)) { all++; if (inHouse(x, z)) inside++; }
      expect(all).toBeGreaterThan(400);
      expect(inside / all).toBeGreaterThanOrEqual(0.85);
      // every edge longer than 10 ft runs within 1.5° of the model's axes (its walls)
      for (let i = 0; i < ring.length; i++) {
        const [a, b] = [ring[i], ring[(i + 1) % ring.length]];
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 10) continue;
        const deg = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        const off = Math.abs((((deg % 90) + 135) % 90) - 45);
        expect(off).toBeLessThanOrEqual(1.5);
      }
    }
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // the neighbours: Kings West's south face north of the house, Habitat 825's north face south of it
    expect(Math.max(...KINGS_WEST.ring.map((p) => p[1]))).toBeLessThan(PLAN[1]);
    expect(Math.min(...HABITAT.ring.map((p) => p[1]))).toBeGreaterThan(PLAN[3]);
    // west of Kings Road's west sidewalk (its carriageway 18 ft each side of OSM's line, the sidewalk 8 ft)
    const road = LOT_ROADS.find((r) => r.name === 'North Kings Road')!;
    expect(Math.min(...road.pts.filter((p) => p[1] > -100 && p[1] < 200).map((p) => p[0])) - 26).toBeGreaterThan(PLAN[2]);
  });

  it('A3: the concrete walls are 3-stud slabs on the 4-stud module, a filled slit between each pair; each slab floor to roof; ≥ 40 slits, ≥ ⅓ glass', () => {
    let slits = 0, glass = 0;
    for (const r of SLAB_RUNS) {
      const slabs = slabsOf(r);
      expect(slabs.length, r.id).toBeGreaterThan(0);
      for (const [s, e] of slabs) {
        expect(e - s, r.id).toBeLessThanOrEqual(4);
        const [x, z] = cellOf(r, s), b = at(x, 0, z)!;
        expect(b.phase, r.id).toBe(P.STRUCTURE);
        expect(b.color, r.id).toBe(CONCRETE);
        expect(b.y).toBe(0);
        expect(Math.abs(ft(b.h) - 8)).toBeLessThanOrEqual(0.5);
        expect(r.axis === 'x' ? b.w : b.d).toBe(e - s);
      }
      // between neighbouring slabs, exactly one slit (or a door or a chimney)
      for (let i = 1; i < slabs.length; i++) {
        const gap = range(slabs[i - 1][1], slabs[i][0]).map((c) => slabPart(r, c));
        if (gap.length === 0) { expect(slabs[i][0] - r.from, r.id).toBe(slabs[i - 1][1] - r.from); continue; }
        if (gap.every((p) => p === 'slit')) expect(gap.length, r.id).toBe(1);
        else expect(gap.some((p) => p === 'door' || p === 'chimney'), `${r.id} ${gap}`).toBe(true);
      }
      for (let c = r.from; c < r.to; c++) {
        if (slabPart(r, c) !== 'slit') continue;
        slits++;
        const [x, z] = cellOf(r, c);
        for (let y = 0; y < Y.SLAB_TOP; y++) {
          const b = at(x, y, z);
          expect(b, `${r.id} ${c} ${y}`).toBeDefined();
          expect(b!.phase).toBe(P.ENVELOPE);
          expect([GLASS, FROSTED, JOINT]).toContain(b!.color);
        }
        if (at(x, 5, z)!.color !== JOINT) glass++;
      }
    }
    expect(slits).toBeGreaterThanOrEqual(40);
    expect(glass / slits).toBeGreaterThanOrEqual(1 / 3);
  });

  it('A4: the roof at 8.5 ft and the beam line at 6′-1″; clerestories along both patios; entrance halls at 6′-4″, baskets\' floors at 7′-0″; the south stair has 11 risers', () => {
    const roof = bricks.filter((b) => b.phase === P.ROOF && b.color === ROOFING && inR(b, [-1, -1, 80, 79]) && b.y > Y.LOWER_ROOF);
    expect(Math.abs(ft(Math.max(...roof.map((b) => b.y + b.h))) - 8.5)).toBeLessThanOrEqual(0.5);
    // the double beam line: redwood along the patio walls and through each studio, all at one height
    expect(Math.abs(ft(Y.BEAM) - (6 + 1 / 12))).toBeLessThanOrEqual(0.5);
    for (const r of SCREEN_RUNS) {
      const beam = range(r.from, r.to).filter((c) => { const [x, z] = cellOf(r, c); const b = at(x, Y.BEAM, z); return b?.color === REDWOOD && b.phase === P.STRUCTURE; });
      expect(beam.length, r.id).toBe(r.to - r.from - range(r.from, r.to).filter((c) => { const [x, z] = cellOf(r, c); return at(x, Y.BEAM, z)?.color === CONCRETE; }).length);
    }
    for (const s of [ROOMS.chaceA, ROOMS.chaceB, ROOMS.pauline, ROOMS.rudolph]) {
      const beams = bricks.filter((b) => b.phase === P.STRUCTURE && b.color === REDWOOD && b.kind === 'brick' && b.y === Y.BEAM && b.h === 1 && inR(b, s));
      expect(beams.length).toBeGreaterThan(0);
    }
    // clerestory glass above the beam line on the patio walls of both patios
    for (const id of ['ne-south', 'long-west']) {
      const r = SCREEN_RUNS.find((s) => s.id === id)!;
      const cl = range(r.from, r.to).filter((c) => { const [x, z] = cellOf(r, c); return at(x, Y.BEAM + 2, z)?.kind === 'glass'; });
      expect(cl.length, id).toBeGreaterThan(10);
    }
    for (const basket of [NORTH_BASKET, SOUTH_BASKET]) {
      const floor = bricks.filter((b) => b.phase === P.STRUCTURE && b.kind === 'plate' && basket.some((r) => inR(b, r)));
      expect(Math.abs(ft(Math.min(...floor.map((b) => b.y))) - (6 + 4 / 12))).toBeLessThanOrEqual(0.5);
      expect(Math.abs(ft(Math.max(...floor.map((b) => b.y + b.h))) - 7)).toBeLessThanOrEqual(0.5);
    }
    const stair = bricks.filter((b) => b.phase === P.STRUCTURE && inR(b, [SOUTH_STAIR.x0, SOUTH_STAIR.z, SOUTH_STAIR.x0 + 11, SOUTH_STAIR.z + SOUTH_STAIR.d]));
    const tops = [...new Set(stair.map((b) => b.y + b.h))].sort((a, b) => a - b);
    expect(tops.length).toBe(11);
    expect(tops[10]).toBe(Y.BASKET_FLOOR);
  });

  it('A5: two sleeping baskets over the entrances, on four or more redwood posts, 14′-10″ × 12′-0″ and 20′-4″ × 16′-3″, overhanging; canvas sides; no bath in the north one', () => {
    const doorOut = (id: string, dx: number, dz: number) => {
      const r = [...SCREEN_RUNS, { id: 'north-entrance', axis: 'z' as const, at: 31, from: 1, to: 17, doors: [[10, 13]] as [number, number][] }].find((s) => s.id === id)!;
      const [x, z] = cellOf(r, r.doors![0][0]);
      return [x + dx, z + dz] as [number, number];
    };
    const sizes: [number, number][] = [[14 + 10 / 12, 12], [20 + 4 / 12, 16.25]];
    [[NORTH_BASKET, doorOut('north-entrance', -1, 0)], [SOUTH_BASKET, doorOut('south-north', 0, -1)]].forEach(([basket, out], i) => {
      const bs = basket as Rect[], [ox, oz] = out as [number, number];
      const bb = bbox(bs);
      expect(Math.abs(bb[2] - bb[0] - sizes[i][0])).toBeLessThanOrEqual(1);
      expect(Math.abs(bb[3] - bb[1] - sizes[i][1])).toBeLessThanOrEqual(1);
      // over the entrance: the cell outside its door is under the basket, outside the house
      expect(bs.some((r) => ox >= r[0] && ox < r[2] && oz >= r[1] && oz < r[3])).toBe(true);
      expect(inHouse(ox, oz)).toBe(false);
      const posts = bricks.filter((b) => b.phase === P.STRUCTURE && b.color === REDWOOD && b.y === Y.BASKET_FLOOR && b.h > 10 && bs.some((r) => inR(b, r)));
      expect(posts.length).toBeGreaterThanOrEqual(4);
      const sides = bricks.filter((b) => b.phase === P.ENVELOPE && b.color === CANVAS && b.y > Y.ROOF && bs.some((r) => inR(b, r)));
      expect(sides.length).toBeGreaterThan(8);
    });
    const inNorth = bricks.filter((b) => b.phase === P.INTERIOR && b.y >= Y.BASKET_FLOOR && inR(b, NORTH_BASKET[0]));
    expect(inNorth.length).toBeGreaterThan(0);
    for (const b of inNorth) expect([MATTRESS, ...BLANKET]).toContain(b.color);
  });

  it('A6: four plain concrete chimneys at HABS\'s corners, above the roof; the 45° one a stepped diagonal; two open a fireplace onto a patio', () => {
    expect(CHIMNEYS.length + 1).toBe(4);
    const corners: [number, number][] = [[NE_WING[2] - 1, NE_WING[3] - 1], [GUEST[0], GUEST[3] - 1], [SOUTH_WING[0], SOUTH_WING[3] - 1]];
    CHIMNEYS.forEach((c, i) => {
      const [x, z] = corners[i];
      expect(x >= c.rect[0] && x < c.rect[2] && z >= c.rect[1] && z < c.rect[3], c.id).toBe(true);
      const mass = bricks.filter((b) => b.phase === P.STRUCTURE && inR(b, c.rect));
      for (const b of mass) expect(b.color).toBe(CONCRETE);
      expect(Math.max(...mass.map((b) => b.y + b.h))).toBeGreaterThan(Y.ROOF);
    });
    // the diamond: rows 2, 4, 6, 6, 4, 2 cells wide, centred
    const rows = new Map<number, number[]>();
    for (let z = 30; z < 44; z++) for (let x = 34; x < 46; x++) if (inDiamond(x, z) && at(x, 10, z)?.color === CONCRETE) rows.set(z, [...(rows.get(z) ?? []), x]);
    expect([...rows.values()].map((r) => r.length)).toEqual([2, 4, 6, 6, 4, 2]);
    for (const r of rows.values()) expect((Math.min(...r) + Math.max(...r) + 1) / 2).toBe(DIAMOND.x);
    expect(Math.max(...bricks.filter((b) => b.phase === P.STRUCTURE && inDiamond(b.x, b.z)).map((b) => b.y + b.h))).toBeGreaterThan(Y.ROOF);
    // a fireplace on a patio: an opening low in a chimney's face, with a patio lawn before it
    const onPatio = CHIMNEYS.filter((c) => {
      for (let x = c.rect[0]; x < c.rect[2]; x++)
        for (const [z, out] of [[c.rect[1], c.rect[1] - 1], [c.rect[3] - 1, c.rect[3]]])
          if (at(x, 2, z)?.phase !== P.STRUCTURE && at(x, 10, z)?.color === CONCRETE && lawnTop(x, out) === 0 && !inHouse(x, out)) return true;
      return false;
    });
    expect(onPatio.length).toBe(2);
  });

  it('A7: the patio walls: redwood frames with glass and sliding canvas, a canvas panel on each studio\'s patio side; the slab 2 plates proud; the lawns level with the floor', () => {
    const run = (id: string) => SCREEN_RUNS.find((s) => s.id === id)!;
    for (const [room, id] of [[ROOMS.chaceA, 'ne-south'], [ROOMS.chaceB, 'ne-south'], [ROOMS.pauline, 'long-west'], [ROOMS.rudolph, 'south-north'], [ROOMS.guest, 'guest-south']] as const) {
      const r = run(id);
      const along = r.axis === 'x' ? [room[0], room[2]] : [room[1], room[3]];
      const cs = range(Math.max(r.from, along[0]), Math.min(r.to, along[1]));
      const kinds = cs.map((c) => { const [x, z] = cellOf(r, c); return at(x, 5, z); });
      expect(kinds.some((b) => b?.color === CANVAS && b.phase === P.ENVELOPE), id).toBe(true);
      expect(kinds.some((b) => b?.kind === 'glass'), id).toBe(true);
      expect(kinds.some((b) => b?.color === REDWOOD && b.phase === P.STRUCTURE), id).toBe(true);
    }
    for (const [x, z] of [[40, -1], [79, 5], [20, 78], [-1, 10]]) {
      expect(hm.at(x, z), `${x},${z}`).toBe(-2);
      expect(at(x + (x < 0 ? 1 : x > 70 ? -1 : 0), -1, z + (z < 0 ? 1 : z > 70 ? -1 : 0))?.phase).toBe(P.FOUNDATION);
    }
    for (const p of [WEST_PATIO, EAST_PATIO]) {
      const lawn = bricks.filter((b) => b.phase === P.LANDSCAPE && LAWN.includes(b.color) && inR(b, p));
      expect(lawn.length).toBeGreaterThan(20);
      for (const b of lawn) expect(b.y + b.h).toBe(0);
    }
  });

  it('A8: one concrete grey for the slabs and chimneys, one redwood for the frame, doors and cornice, one canvas, a green roof', () => {
    const struct = bricks.filter((b) => b.phase === P.STRUCTURE && inR(b, [-2, -2, 82, 80]));
    expect(new Set(struct.map((b) => b.color))).toEqual(new Set([CONCRETE, REDWOOD]));
    const env = bricks.filter((b) => b.phase === P.ENVELOPE);
    expect(new Set(env.map((b) => b.color))).toEqual(new Set([GLASS, FROSTED, JOINT, REDWOOD, CANVAS]));
    const roof = bricks.filter((b) => b.phase === P.ROOF);
    expect(new Set(roof.map((b) => b.color))).toEqual(new Set([REDWOOD, ROOFING, GLASS, CONCRETE, CANVAS]));
    expect(at(60, Y.ROOF - 1, 10)?.color).toBe(ROOFING);
  });

  it('A9: everything marked; at least 10 marks in the interior; the baskets\' form, the furniture and the plants assumed', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f), f).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(10);
    expect(src('house.ts')).toMatch(/the sleeping baskets \[documented: "redwood four-post canopies with mitered beams"; their form assumed\]/);
    expect(src('interior.ts')).toMatch(/blocky stand-ins[\s\S]*Where each piece stands is \[assumed\]/);
    expect(src('landscape.ts')).toMatch(/hedges \[documented;\s*\* their lines and height assumed\]/);
    expect(src('landscape.ts')).toMatch(/bamboo along the street \[documented: "behind bamboo shoots"; its line assumed\]/);
  });

  it('A10: the lot meets the real ground at its edges; within 30 ft of the house, outside the sunken gardens, within 2 ft of the slab', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 2 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    const far: string[] = [];
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++)
      for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) {
        const d = Math.hypot(Math.max(PLAN[0] - x, 0, x - PLAN[2] + 1), Math.max(PLAN[1] - z, 0, z - PLAN[3] + 1));
        if (d > 30 || [WEST_GARDEN, EAST_GARDEN].some((g) => x >= g[0] && x < g[2] && z >= g[1] && z < g[3])) continue;
        if (Math.abs(ft(hm.at(x, z))) > 2) far.push(`${x},${z}`);
      }
    expect(far).toEqual([]);
  });

  it('A11: the terrain has no spikes (spec 010b)', () => {
    for (const [g, limit] of [[n.near, 150], [n.far, 500]] as const) {
      let worst = 0;
      for (let j = 1; j < g.nz - 1; j++)
        for (let i = 1; i < g.nx - 1; i++) {
          const nb: number[] = [];
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (di || dj) nb.push(g.h[(j + dj) * g.nx + i + di]);
          nb.sort((a, c) => a - c);
          worst = Math.max(worst, Math.abs(g.h[j * g.nx + i] - (nb[3] + nb[4]) / 2));
        }
      expect(worst).toBeLessThanOrEqual(limit + 0.5);
    }
  });

  it('A12: the definition opts into the urban flats; the other LA houses\' scenery unchanged', async () => {
    const s = H.scenery!;
    expect(s.chaparral).toBe(true);
    expect(typeof s.flatsBelow).toBe('number');
    expect(s.city && typeof s.city.maxY).toBe('number');
    const { STAHL } = await import('../src/houses/stahl-house/definition');
    const { LOVELL } = await import('../src/houses/lovell-health-house/definition');
    const { SHEATS_GOLDSTEIN } = await import('../src/houses/sheats-goldstein-residence/definition');
    const { LOVELL_BEACH } = await import('../src/houses/lovell-beach-house/definition');
    expect(STAHL.scenery).toBeUndefined();
    expect(LOVELL.scenery).toEqual({ chaparral: true });
    expect(SHEATS_GOLDSTEIN.scenery).toEqual({ chaparral: true });
    expect(LOVELL_BEACH.scenery).toEqual({ sea: true, desert: true });
  });

  it('A13: two sunken gardens below the patios\' lawns; hedges ≥ 8 ft round the east patio; bamboo along the street; the driveway\'s two strips; the neighbours at their OSM heights', () => {
    for (const [g, depth] of [[WEST_GARDEN, -8], [EAST_GARDEN, -4]] as const) {
      const cx = (g[0] + g[2]) >> 1, cz = (g[1] + g[3]) >> 1;
      const b = at(cx, depth - 1, cz);
      expect(b?.phase, `${g}`).toBe(P.LANDSCAPE);
      expect(LAWN).toContain(b!.color);
      expect(b!.y + b!.h).toBe(depth);
    }
    const hedges = bricks.filter((b) => b.phase === P.LANDSCAPE && HEDGE.includes(b.color) && b.x >= EAST_PATIO[0]);
    expect(Math.max(...hedges.map((b) => b.y + b.h)) - Math.max(0, hm.at(EAST_PATIO[2], EAST_PATIO[3]))).toBeGreaterThanOrEqual(20);
    const bamboo = bricks.filter((b) => b.phase === P.LANDSCAPE && b.kind === 'round' && BAMBOO_GREEN.includes(b.color) && inR(b, BAMBOO));
    expect(bamboo.length).toBeGreaterThan(100);
    const zs = bamboo.map((b) => b.z);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(80);
    expect(Math.max(...bamboo.map((b) => b.y + b.h))).toBeGreaterThan(25);
    // the driveway: two parallel strips with grass between, from near the street to the garage
    expect(DRIVE_STRIPS.length).toBe(2);
    for (const s of DRIVE_STRIPS) for (const x of [10, 60, 120]) expect(at(x, hm.at(x, s[1]), s[1])?.phase, `${x}`).toBe(P.LANDSCAPE);
    const mid = (DRIVE_STRIPS[0][3] + DRIVE_STRIPS[1][1]) >> 1;
    expect(at(60, hm.at(60, mid), mid)).toBeUndefined();
    // Kings West 14.1 m, Habitat 825 13.8 m (OSM), above the ground at their centres
    for (const [nb, m] of [[KINGS_WEST, 14.1], [HABITAT, 13.8]] as const) {
      const cx = nb.ring.reduce((a, p) => a + p[0], 0) / nb.ring.length, cz = nb.ring.reduce((a, p) => a + p[1], 0) / nb.ring.length;
      expect(Math.abs(nb.top - sampleGrid(n.near, cx, cz) - m / 0.3048)).toBeLessThanOrEqual(1);
    }
  });

  it('A14: deterministic, inside its grid, no overlaps; every phase used; about 2½ minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(165);
  }, 120_000);

  it('A15: tests/buildOrder.test.ts covers it', () => {
    expect(readFileSync('tests/buildOrder.test.ts', 'utf8')).toMatch(/SCHINDLER\b/);
  });

  it('A16: the home card is live, with the real piece count, its credits and the disclaimer', async () => {
    const { HOUSES } = await import('../src/houses');
    const c = HOUSES.find((h) => h.slug === 'schindler-house')!;
    expect(c).toBeDefined();
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toEqual(['the Friends of the Schindler House', 'the MAK Center for Art and Architecture']);
    expect(c.wikidata).toBe('Q1932041');
    expect(c.sources?.some((s) => /HABS CA-1939/.test(s))).toBe(true);
    expect(c.sources?.some((s) => /National Register/.test(s))).toBe(true);
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with the Friends of the Schindler House or the MAK Center for Art and Architecture.');
  });
});
