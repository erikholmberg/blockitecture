// Spec: specs/075-barcelona-pavilion.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { BARCELONA_PAVILION as H } from '../src/houses/barcelona-pavilion/definition';
import { GRID } from '../src/houses/barcelona-pavilion/model/pavilion';
import { CHROME, GLASS, STONES } from '../src/houses/barcelona-pavilion/model/house';
import { BRONZE } from '../src/houses/barcelona-pavilion/model/landscape';
import {
  ANNEX, ANNEX_ROOF, COLUMNS, inRect, LARGE_POOL, MODULE, ONYX, PANES, PLINTH, Rect, ROOF, SMALL_POOL, STAIR, WALLS, Y,
} from '../src/houses/barcelona-pavilion/model/layout';
import { onPlinth, TERRAIN } from '../src/houses/barcelona-pavilion/model/site';
import { P, PHASES } from '../src/houses/barcelona-pavilion/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/barcelona-pavilion/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/barcelona-pavilion/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const onLine = (v: number) => Math.abs(v - Math.round(v / MODULE) * MODULE) <= 0.5 + 1e-9;

/** OSM's lat/lon in model ft, by the fit's anchor (as scripts/fetch-neighborhood.mjs does) */
function toModel(lat: number, lon: number): [number, number] {
  const a = n.anchor, FT = 0.3048;
  const KX = (111320 * Math.cos((a.lat * Math.PI) / 180)) / FT, KZ = 110574 / FT;
  const r = (a.rotationDeg * Math.PI) / 180, c = Math.round(Math.cos(r) * 1e9) / 1e9, s = Math.round(Math.sin(r) * 1e9) / 1e9;
  const x = (lon - a.lon) * KX, z = -(lat - a.lat) * KZ;
  return [x * c - z * s + a.offsetX, x * s + z * c + a.offsetZ];
}
const inPoly = (x: number, z: number, ring: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
};
/** the overlap of a model rect and an OSM ring, by stud cells */
function iou(r: Rect, latlon: [number, number][]) {
  const ring = latlon.map(([la, lo]) => toModel(la, lo));
  let a = 0, b = 0, both = 0;
  for (let z = -40; z < 120; z++)
    for (let x = -40; x < 220; x++) {
      const p = inPoly(x + 0.5, z + 0.5, ring), q = inRect(x, z, r);
      if (p) a++;
      if (q) b++;
      if (p && q) both++;
    }
  return both / (a + b - both);
}
// © OpenStreetMap contributors (ODbL): the two pools and Kolbe's statue
const OSM_SMALL_POOL: [number, number][] = [[41.3706772, 2.1499607], [41.3707141, 2.1499359], [41.3706627, 2.1498054], [41.370626, 2.1498303]];
const OSM_LARGE_POOL: [number, number][] = [[41.370258, 2.1501771], [41.3704338, 2.1500551], [41.3704752, 2.1501612], [41.3703631, 2.150239], [41.3702994, 2.1502832]];
const OSM_STATUE: [number, number] = [41.3706576, 2.1498312];

describe('075: the Barcelona Pavilion', () => {
  it("A1: the main roof fits OSM's way 67917935 (IoU ≥ 0.75); the plinth 56.62 × 18.48 m within 3%", () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs((PLINTH[2] - PLINTH[0]) / M / 56.62 - 1)).toBeLessThanOrEqual(0.03);
    expect(Math.abs((PLINTH[3] - PLINTH[1]) / M / 18.48 - 1)).toBeLessThanOrEqual(0.03);
    // the roof drawn is the roof fitted
    expect(at(ROOF[0], Y.CEILING, ROOF[1])?.phase).toBe(P.ROOF);
    expect(at(ROOF[2] - 1, Y.CEILING, ROOF[3] - 1)?.phase).toBe(P.ROOF);
    expect(at(ROOF[2], Y.CEILING, ROOF[3] - 3)).toBeUndefined();
  });

  it('A2: the grid: columns and wall ends on module lines; the plinth 52 × 17 modules', () => {
    for (const [cx, cz] of COLUMNS) expect(onLine(cx + 0.5) && onLine(cz + 0.5), `column ${cx},${cz}`).toBe(true);
    const all: Rect[] = [...WALLS.map((w) => w.r), ...PANES.map((p) => p.r), ONYX];
    const touches = (r: Rect, x: number, z: number) => [...all, ANNEX].some((o) => o !== r && inRect(x, z, o));
    for (const r of all) {
      const along = r[2] - r[0] >= r[3] - r[1];
      // each free end (one not butting into another wall) on a module line
      const ends: [number, number, number][] = along
        ? [[r[0], r[0] - 1, r[1]], [r[2], r[2], r[1]]]
        : [[r[1], r[0], r[1] - 1], [r[3], r[0], r[3]]];
      for (const [v, x, z] of ends) if (!touches(r, x, z)) expect(onLine(v), `${r} end ${v}`).toBe(true);
      // and its centre line on one too
      expect(onLine(along ? (r[1] + r[3]) / 2 : (r[0] + r[2]) / 2) || onLine(along ? r[1] : r[0]) || onLine(along ? r[3] : r[2]), `${r} line`).toBe(true);
    }
    expect((PLINTH[2] - PLINTH[0]) / MODULE).toBe(52);
    expect(Math.abs(PLINTH[3] - PLINTH[1] - 17 * MODULE)).toBeLessThanOrEqual(0.5);
  });

  it('A3: eight columns in two rows of four, chrome crosses from the plinth into the roof, all under the main roof', () => {
    expect(COLUMNS.length).toBe(8);
    expect(new Set(COLUMNS.map((c) => c[1])).size).toBe(2);
    expect(new Set(COLUMNS.map((c) => c[0])).size).toBe(4);
    for (const [cx, cz] of COLUMNS) {
      expect(inRect(cx - 1, cz - 1, ROOF) && inRect(cx + 1, cz + 1, ROOF)).toBe(true);
      for (let y = 0; y <= Y.CEILING; y++) {
        for (const [x, z] of [[cx, cz], [cx - 1, cz], [cx + 1, cz], [cx, cz - 1], [cx, cz + 1]]) {
          expect(at(x, y, z)?.color, `${x},${y},${z}`).toBe(CHROME);
          expect(at(x, y, z)?.phase).toBe(P.STRUCTURE);
        }
        expect(at(cx - 1, y, cz - 1)?.phase).not.toBe(P.STRUCTURE); // a cross, not a square
      }
      expect(at(cx, -1, cz)?.phase).toBe(P.FLOOR);
    }
  });

  it('A4: the clear height under the main roof 3.10 m within 0.15 m; the slabs no more than 3 plates thick', () => {
    expect(Math.abs((Y.CEILING * PLATE) / M - 3.1)).toBeLessThanOrEqual(0.15);
    for (const [x, z] of [[20, 20], [54, 30], [90, 57], [160, 60]]) {
      const roof = [...Array(40).keys()].filter((y) => at(x, y, z)?.phase === P.ROOF);
      expect(roof.length, `${x},${z}`).toBeGreaterThan(0);
      expect(roof.length).toBeLessThanOrEqual(3);
      expect(Math.min(...roof)).toBe(Y.CEILING);
    }
    for (let y = 0; y < Y.CEILING; y++) expect(at(20, y, 20)).toBeUndefined();
    expect(at(20, -1, 20)?.phase).toBe(P.FLOOR);
  });

  it("A5: the plinth's top 1.30 m within 0.15 m above the ground at the stair's foot; the stair has 8 steps", () => {
    const foot = hm.at(STAIR[0] - 1, (STAIR[1] + STAIR[3]) >> 1);
    expect(Math.abs((-foot * PLATE) / M - 1.3)).toBeLessThanOrEqual(0.15);
    const z = (STAIR[1] + STAIR[3]) >> 1;
    const topAt = (x: number) => { let y = 5; while (y > -30 && !at(x, y - 1, z)) y--; return y; };
    let risers = 0, prev = topAt(STAIR[0] - 1);
    expect(prev).toBe(foot);
    for (let x = STAIR[0]; x <= STAIR[2]; x++) { const t = topAt(x); if (t > prev) risers++; expect(t).toBeGreaterThanOrEqual(prev); prev = t; }
    expect(risers).toBe(8);
    expect(prev).toBe(0);
  });

  it("A6: the large pool fits OSM's way 1104411435 and the small one way 1104411431 (IoU ≥ 0.6); their water under the plinth's top", () => {
    expect(iou(LARGE_POOL, OSM_LARGE_POOL)).toBeGreaterThanOrEqual(0.6);
    expect(iou(SMALL_POOL, OSM_SMALL_POOL)).toBeGreaterThanOrEqual(0.6);
    for (const pool of [LARGE_POOL, SMALL_POOL]) {
      const water = bricks.filter((b) => b.kind === 'water' && inRect(b.x, b.z, pool));
      expect(water.length).toBeGreaterThan(0);
      for (const w of water) expect(w.y + w.h).toBeLessThanOrEqual(0);
      expect(at(pool[0] + 5, Y.WATER - 1, pool[1] + 5)?.kind).toBe('water');
    }
  });

  it('A7: the walls make no closed room: a path on the plinth from the middle of the roofed space to the open air', () => {
    const y = 10; // above the furniture, under the roof
    const start: [number, number] = [(ROOF[0] + ROOF[2]) >> 1, (ROOF[1] + ROOF[3]) >> 1];
    const seen = new Set([start.join()]);
    const queue = [start];
    let out = false;
    while (queue.length && !out) {
      const [x, z] = queue.shift()!;
      if (!inRect(x, z, ROOF) && !inRect(x, z, ANNEX_ROOF)) { out = true; break; }
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, nz = z + dz, k = `${nx},${nz}`;
        if (seen.has(k) || !onPlinth(nx, nz) || at(nx, y, nz) || at(nx, 1, nz)?.kind === 'glass') continue;
        seen.add(k);
        queue.push([nx, nz]);
      }
    }
    expect(out).toBe(true);
  });

  it('A8: the materials: golden onyx, travertine and green marble walls, glass in three tints or more, chrome columns', () => {
    const onyx = at(ONYX[0] + 3, 5, ONYX[1])!;
    expect(STONES.onyx).toContain(onyx.color);
    for (const c of STONES.onyx) { const r = c >> 16, g = (c >> 8) & 255, bl = c & 255; expect(r > g && g > bl && r - bl > 0x40).toBe(true); }
    const stones = new Set(WALLS.map((w) => w.stone));
    expect(stones.has('travertine')).toBe(true);
    expect(stones.has('tinos') || stones.has('alpine')).toBe(true);
    for (const w of WALLS) expect(STONES[w.stone]).toContain(at(w.r[0], 5, w.r[1])?.color);
    const tints = new Set(bricks.filter((b) => b.kind === 'glass' && b.phase === P.ENVELOPE).map((b) => b.color));
    expect(tints.size).toBeGreaterThanOrEqual(3);
    for (const t of ['green', 'grey', 'black', 'clear'] as const) expect(tints.has(GLASS[t])).toBe(true);
    for (const [cx, cz] of COLUMNS) expect(at(cx, 10, cz)?.color).toBe(CHROME);
  });

  it("A9: the statue's stand-in stands in the small pool, within 2 m of OSM's node, 1.73 m high within 0.15 m", () => {
    const s = bricks.filter((b) => b.color === BRONZE);
    expect(s.length).toBeGreaterThan(0);
    const x0 = Math.min(...s.map((b) => b.x)), x1 = Math.max(...s.map((b) => b.x + b.w));
    const z0 = Math.min(...s.map((b) => b.z)), z1 = Math.max(...s.map((b) => b.z + b.d));
    const y0 = Math.min(...s.map((b) => b.y)), y1 = Math.max(...s.map((b) => b.y + b.h));
    expect(inRect(x0, z0, SMALL_POOL) && inRect(x1 - 1, z1 - 1, SMALL_POOL)).toBe(true);
    const [ox, oz] = toModel(...OSM_STATUE);
    expect(Math.hypot((x0 + x1) / 2 - ox, (z0 + z1) / 2 - oz) / M).toBeLessThanOrEqual(2);
    expect(Math.abs(((y1 - y0) * PLATE) / M - 1.73)).toBeLessThanOrEqual(0.15);
    for (const b of s) expect(b.phase).toBe(P.LANDSCAPE);
  });

  it('A10: deterministic, inside its grid, no overlaps; every phase used; about 1½ minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(75);
    expect(s.total).toBeLessThan(110);
  }, 120_000);

  it('A12: everything marked with its source; at least 5 marks in the interior', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });

  it('A13: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A13: the ground falls toward the plaça: the lot\'s front edge at least 1 ft below the ground behind the plinth', () => {
    let front = 0, behind = 0, k = 0;
    for (let x = PLINTH[0]; x < PLINTH[2]; x++) { front += hm.at(x, TERRAIN.z0); behind += hm.at(x, PLINTH[3] + 4); k++; }
    expect(((behind - front) / k) * PLATE).toBeGreaterThanOrEqual(1);
  });

  it('A14: the terrain has no spikes (spec 010b)', () => {
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

  it('A16: the home card is live, with the real piece count and its credits; the numbers say "pavilion"', async () => {
    const { HOUSES } = await import('../src/houses');
    const c = HOUSES.find((h) => h.slug === 'barcelona-pavilion')!;
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toContain('the Fundació Mies van der Rohe');
    expect(c.wikidata).toBe('Q807915');
    expect(H.text.noun).toBe('pavilion');
  });
});
