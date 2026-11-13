// Spec: specs/073-glass-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { GLASS_HOUSE as H } from '../src/houses/glass-house/definition';
import { GRID } from '../src/houses/glass-house/model/glassHouse';
import { BLACK, BRICKS, DOOR_GLASS, frontCell } from '../src/houses/glass-house/model/house';
import { WALNUT } from '../src/houses/glass-house/model/interior';
import { inPavilion } from '../src/houses/glass-house/model/landscape';
import { BRICK, CYL, FIREPLACE, HOUSE, inCylinder, KITCHEN, onRing, PAVILION, ROUND_WINDOWS, STORAGE, Y } from '../src/houses/glass-house/model/layout';
import { LOT_BUILDINGS } from '../src/houses/glass-house/model/lotTerrain';
import { inPond, POND, POND_LEVEL, TERRAIN } from '../src/houses/glass-house/model/site';
import { P, PHASES } from '../src/houses/glass-house/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/glass-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/glass-house/model/${f}`, 'utf8');
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const ft = (plates: number) => plates * PLATE;
const inR = (b: { x: number; z: number; w: number; d: number }, r: number[]) => b.x >= r[0] && b.x + b.w <= r[2] && b.z >= r[1] && b.z + b.d <= r[3];
const bInCyl = (b: { x: number; z: number; w: number; d: number }) => {
  for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) if (!inCylinder(x, z)) return false;
  return true;
};
/** the four fronts: the cells along each, outside in */
const FRONTS = {
  east: Array.from({ length: 56 }, (_, u) => [HOUSE[2] - 1, u] as [number, number]),
  west: Array.from({ length: 56 }, (_, u) => [HOUSE[0], u] as [number, number]),
  north: Array.from({ length: 32 }, (_, u) => [u, HOUSE[1]] as [number, number]),
  south: Array.from({ length: 32 }, (_, u) => [u, HOUSE[3] - 1] as [number, number]),
};

/** the checks every house shares: invariants, sourcing marks, the lot's edges, no terrain spikes */
describe('073: the Glass House', () => {
  it('A1: the footprint fits OSM\'s way 364907964 (IoU ≥ 0.8), its long sides within 3° of 357.2°; 56 × 32 ft, long axis north–south', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.8);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // the model's −z is the real bearing 360° − rotation (realToModelDir)
    expect(Math.abs(360 - H.site.rotationDeg - 357.2)).toBeLessThanOrEqual(3);
    expect(Math.abs(HOUSE[3] - HOUSE[1] - 56)).toBeLessThanOrEqual(1);
    expect(Math.abs(HOUSE[2] - HOUSE[0] - 32)).toBeLessThanOrEqual(1);
  });

  it('A2: the floor 10 in above the terrain; the roof 10.5 ft above the floor; the cylinder 1–2 ft above the roof', () => {
    expect(Math.abs(0 - sampleGrid(n.near, 16, 28) - 10 / 12)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(0 - ft(hm.at(-6, 28)) - 10 / 12)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(0 - ft(hm.at(50, 28)) - 10 / 12)).toBeLessThanOrEqual(0.5);
    const roof = bricks.filter((b) => b.phase === P.ROOF && !b.hangs && inR(b, HOUSE));
    const roofTop = Math.max(...roof.map((b) => b.y + b.h));
    expect(Math.abs(ft(roofTop) - 10.5)).toBeLessThanOrEqual(0.5);
    const cylTop = Math.max(...bricks.filter((b) => b.phase === P.STRUCTURE && bInCyl(b)).map((b) => b.y + b.h));
    expect(ft(cylTop - roofTop)).toBeGreaterThanOrEqual(1);
    expect(ft(cylTop - roofTop)).toBeLessThanOrEqual(2);
  });

  it('A3: one glass door at the middle of each front; otherwise glass between black steel, floor to roof; the rail on all four sides', () => {
    for (const [name, front] of Object.entries(FRONTS)) {
      const doors = front.filter(([x, z]) => at(x, 10, z)?.color === DOOR_GLASS);
      expect(doors.length, name).toBeGreaterThan(0);
      for (const [x, z] of doors) expect(at(x, 10, z)?.kind, name).toBe('glass');
      const us = doors.map(([x, z]) => (name === 'east' || name === 'west' ? z + 0.5 : x + 0.5));
      const mid = (Math.min(...us) + Math.max(...us)) / 2, len = front.length;
      expect(Math.abs(mid - len / 2), name).toBeLessThanOrEqual(1);
      // one door: its cells run together
      expect(Math.max(...us) - Math.min(...us), name).toBe(doors.length - 1);
      // every cell of the front, floor to ceiling: glass or black steel
      for (const [x, z] of front)
        for (let y = 0; y < Y.CEILING; y++) {
          const b = at(x, y, z);
          expect(b, `${name} ${x},${y},${z}`).toBeDefined();
          expect(b!.kind === 'glass' || b!.color === BLACK, `${name} ${x},${y},${z}`).toBe(true);
        }
      // the rail: black across the panes at its height
      const panes = front.filter(([x, z]) => frontCell(x, z) === 'glass');
      expect(panes.length, name).toBeGreaterThan(10);
      for (const [x, z] of panes) expect(at(x, Y.RAIL, z)?.color, `${name} rail`).toBe(BLACK);
      expect(at(panes[0][0], Y.RAIL + 4, panes[0][1])?.kind, name).toBe('glass');
    }
  });

  it('A4: only the cylinder runs floor to ceiling inside; it is brick, off-centre, a fireplace outside and the bathroom inside; nothing taller than the storage wall', () => {
    const inside = bricks.filter((b) => !b.hangs && b.y >= 0 && b.y < Y.CEILING && inR(b, [HOUSE[0] + 1, HOUSE[1] + 1, HOUSE[2] - 1, HOUSE[3] - 1]));
    const tall = inside.filter((b) => b.y + b.h >= Y.CEILING);
    expect(tall.length).toBeGreaterThan(0);
    for (const b of tall) expect(bInCyl(b), `${b.kind} ${b.x},${b.y},${b.z}`).toBe(true);
    for (const b of tall) expect(BRICKS).toContain(b.color);
    expect(Math.hypot(CYL.x - 16, CYL.z - 28)).toBeGreaterThan(2);
    // the cylinder's wall stands from the floor, round its ring
    expect(at(CYL.x, 2, CYL.z - CYL.r + 0.5 | 0)?.phase).toBe(P.STRUCTURE);
    // the fireplace: an opening in the wall's outer face, with a fire in it
    expect(at(FIREPLACE[0], 3, FIREPLACE[1])).toBeUndefined();
    expect(at(FIREPLACE[0], 0, FIREPLACE[1])?.kind).toBe('light');
    // the bathroom's fittings inside it
    expect(bricks.filter((b) => b.phase === P.INTERIOR && bInCyl(b) && b.kind === 'brick').length).toBeGreaterThanOrEqual(2);
    // nothing else in the room taller than the walnut storage wall
    const rest = inside.filter((b) => !bInCyl(b) && b.phase === P.INTERIOR);
    expect(Math.max(...rest.map((b) => b.y + b.h))).toBe(Y.STORAGE);
    expect(at(STORAGE[0], Y.STORAGE - 1, STORAGE[1])?.color).toBe(WALNUT);
  });

  it('A5: the kitchen 42″ high and walnut; the steel all one black; the floor brick in herringbone', () => {
    const kitchen = bricks.filter((b) => b.phase === P.INTERIOR && inR(b, KITCHEN));
    expect(kitchen.length).toBeGreaterThan(0);
    for (const b of kitchen) expect(b.color).toBe(WALNUT);
    expect(Math.abs(ft(Math.max(...kitchen.map((b) => b.y + b.h))) - 3.5)).toBeLessThanOrEqual(PLATE);
    const steel = bricks.filter((b) => b.phase === P.STRUCTURE && inR(b, HOUSE) && !bInCyl(b));
    expect(steel.length).toBeGreaterThan(20);
    for (const b of steel) expect(b.color).toBe(BLACK);
    const floor = bricks.filter((b) => b.phase === P.FLOOR && b.y === -1 && inR(b, HOUSE));
    for (const b of floor) expect(BRICKS).toContain(b.color);
    expect(floor.filter((b) => b.w === 2 && b.d === 1).length).toBeGreaterThan(300);
    expect(floor.filter((b) => b.w === 1 && b.d === 2).length).toBeGreaterThan(300);
  });

  it('A6: everything marked; at least 10 marks in the interior; the cylinder, the short fronts\' panes and the room\'s layout assumed', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(10);
    expect(src('layout.ts')).toMatch(/the brick cylinder: about 10 ft across \[assumed\]/);
    expect(src('layout.ts')).toMatch(/\[assumed: the pane widths of the short fronts\]/);
    expect(src('interior.ts')).toMatch(/where each piece stands is \[assumed\]/);
  });

  it('A7: the Brick House fits OSM\'s way 364907966 (IoU ≥ 0.75), 18 × 52 ft, parallel within 1°; 80–90 ft between the facing walls', () => {
    const ring = LOT_BUILDINGS.find((b) => b.id === 364907966)!.ring;
    let hit = 0, osm = 0, model = 0;
    for (let z = BRICK[1] - 10; z < BRICK[3] + 10; z++)
      for (let x = BRICK[0] - 10; x < BRICK[2] + 10; x++) {
        const o = inPoly(x + 0.5, z + 0.5, ring), m = x >= BRICK[0] && x < BRICK[2] && z >= BRICK[1] && z < BRICK[3];
        if (o) osm++;
        if (m) model++;
        if (o && m) hit++;
      }
    expect(hit / (osm + model - hit)).toBeGreaterThanOrEqual(0.75);
    expect(Math.abs(BRICK[2] - BRICK[0] - 18)).toBeLessThanOrEqual(1);
    expect(Math.abs(BRICK[3] - BRICK[1] - 52)).toBeLessThanOrEqual(1);
    // OSM's long sides against the model's z axis
    const [a, b] = [ring[0], ring[1]];
    expect(Math.abs((Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI)).toBeLessThanOrEqual(1);
    expect(BRICK[0] - HOUSE[2]).toBeGreaterThanOrEqual(80);
    expect(BRICK[0] - HOUSE[2]).toBeLessThanOrEqual(90);
  });

  it('A8: the Brick House\'s west front has one opening, the black door; the east three round windows; the others none', () => {
    /** the openings in a front, as runs of cells along it at each height merged into connected parts */
    const openings = (cellsOf: (u: number) => [number, number], len: number) => {
      const open = new Set<string>();
      for (let u = 0; u < len; u++) for (let y = 0; y < Y.BRICK_CEILING; y++) { const [x, z] = cellsOf(u), b = at(x, y, z); if (!b || b.phase !== P.STRUCTURE) open.add(`${u},${y}`); }
      const seen = new Set<string>(), parts: string[][] = [];
      for (const k of open) {
        if (seen.has(k)) continue;
        const part: string[] = [], stack = [k];
        seen.add(k);
        while (stack.length) {
          const c = stack.pop()!, [u, y] = c.split(',').map(Number);
          part.push(c);
          for (const nb of [`${u + 1},${y}`, `${u - 1},${y}`, `${u},${y + 1}`, `${u},${y - 1}`]) if (open.has(nb) && !seen.has(nb)) { seen.add(nb); stack.push(nb); }
        }
        parts.push(part);
      }
      return parts;
    };
    const len = BRICK[3] - BRICK[1], wid = BRICK[2] - BRICK[0];
    const west = openings((u) => [BRICK[0], BRICK[1] + u], len);
    expect(west.length).toBe(1);
    for (const c of west[0]) { const [u, y] = c.split(',').map(Number); expect(at(BRICK[0], y, BRICK[1] + u)?.color).toBe(BLACK); }
    const east = openings((u) => [BRICK[2] - 1, BRICK[1] + u], len);
    expect(east.length).toBe(3);
    expect(ROUND_WINDOWS.length).toBe(3);
    for (const p of east) {
      // round: about as tall as wide (heights in plates), and glass
      const us = p.map((c) => +c.split(',')[0]), ys = p.map((c) => +c.split(',')[1]);
      const w = Math.max(...us) - Math.min(...us) + 1, h = ft(Math.max(...ys) - Math.min(...ys) + 1);
      expect(Math.abs(w - h)).toBeLessThanOrEqual(1.5);
      expect(p.length).toBeLessThan(w * (h / PLATE));
    }
    expect(openings((u) => [BRICK[0] + u, BRICK[1]], wid).length).toBe(0);
    expect(openings((u) => [BRICK[0] + u, BRICK[3] - 1], wid).length).toBe(0);
  });

  it('A9: the lot meets the real ground at its edges; the ground 150 ft west is at least 40 ft below the floor', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    expect(ft(hm.at(HOUSE[0] - 150, 28))).toBeLessThanOrEqual(-40);
  });

  it('A10: the terrain has no spikes (spec 010b)', () => {
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

  it('A11: the pond\'s water at its level along OSM\'s way 1169420796; the Pavilion stands in it, about 32 ft square', () => {
    expect(Math.abs(ft(POND_LEVEL) - POND.level)).toBeLessThanOrEqual(PLATE / 2);
    // the outline is OSM's way (its first point, in model ft)
    expect(POND.rings[0].some(([x, z]) => Math.hypot(x + 196, z - 111) < 2)).toBe(true);
    const water = bricks.filter((b) => b.kind === 'water' && b.phase === P.LANDSCAPE && b.x < -150);
    expect(water.length).toBeGreaterThan(0);
    for (const b of water) {
      expect(b.y + b.h).toBe(POND_LEVEL);
      expect(inPond(b.x, b.z)).toBe(true);
    }
    // the water fills the pond: every cell inside has water at its surface or the Pavilion
    let dry = 0;
    for (let z = 44; z < 164; z++) for (let x = -362; x < -186; x++) if (inPond(x, z) && !inPavilion(x, z) && at(x, POND_LEVEL - 1, z)?.kind !== 'water') dry++;
    expect(dry).toBe(0);
    const pav = bricks.filter((b) => b.phase === P.LANDSCAPE && b.kind !== 'water' && inR(b, PAVILION));
    const xs = pav.flatMap((b) => [b.x, b.x + b.w]), zs = pav.flatMap((b) => [b.z, b.z + b.d]);
    expect(Math.abs(Math.max(...xs) - Math.min(...xs) - 32)).toBeLessThanOrEqual(2);
    expect(Math.abs(Math.max(...zs) - Math.min(...zs) - 32)).toBeLessThanOrEqual(2);
    for (const b of pav) expect(inPond(b.x, b.z)).toBe(true);
    expect(Math.max(...pav.map((b) => b.y + b.h))).toBeGreaterThan(POND_LEVEL + 10);
  });

  it('A12: deterministic, inside its grid, no overlaps; every phase used; about 2½ minutes', () => {
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

  it('A13: tests/buildOrder.test.ts covers it', () => {
    expect(readFileSync('tests/buildOrder.test.ts', 'utf8')).toMatch(/GLASS_HOUSE/);
    expect(onRing(HOUSE[0], HOUSE[1], HOUSE)).toBe(true);
  });

  it('A14: the home card is live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const c = HOUSES.find((h) => h.slug === 'glass-house')!;
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toEqual(['the National Trust for Historic Preservation', 'the Glass House']);
    expect(c.wikidata).toBe('Q1506237');
    expect(c.sources?.some((s) => /National Historic Landmark/.test(s))).toBe(true);
  });
});
