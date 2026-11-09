// Spec: specs/010-eames-house.md (010b: the Eames House)
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { EAMES } from '../src/houses/eames-house/definition';
import { GRID } from '../src/houses/eames-house/model/eamesHouse';
import { BAY, COURT_BAYS, DEPTH, RESIDENCE_BAYS, STUDIO_BAYS, Y, Z } from '../src/houses/eames-house/model/layout';
import { TERRAIN } from '../src/houses/eames-house/model/site';
import { P, PHASES } from '../src/houses/eames-house/phases';
import { HOUSES } from '../src/houses';
import { sequence } from '../src/engine/sequencer';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = EAMES.build();
const bricks = builder.bricks;
const file = readFileSync('public/eames-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const span = ([a, b]: readonly [number, number]) => Z[b] - Z[a];

describe('010b: the Eames House', () => {
  it('house: the 7′4″ bay grid and the published dimensions (±2 ft)', () => {
    expect(BAY).toBeCloseTo(7 + 4 / 12, 6);
    expect(Math.abs(span(STUDIO_BAYS) - 37)).toBeLessThanOrEqual(2); // 5 bays, 37 ft
    expect(Math.abs(span(COURT_BAYS) - 4 * BAY)).toBeLessThanOrEqual(2); // 4 bays
    expect(Math.abs(Z[16] - Z[9] - 51)).toBeLessThanOrEqual(2); // residence, enclosed: 51 ft
    expect(Math.abs(span(RESIDENCE_BAYS) - 8 * BAY)).toBeLessThanOrEqual(2); // + the open patio bay
    expect(DEPTH).toBe(20);
    expect(Math.abs(Y.ROOF_TOP * PLATE - 17)).toBeLessThanOrEqual(0.5); // 17 ft
    expect(Math.abs(Y.MEZZ * PLATE - 8)).toBeLessThanOrEqual(0.5); // mezzanine joists at 8 ft
  });

  it('model: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(EAMES.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    const seen = new Set<string>();
    let overlaps = 0;
    for (const b of bricks)
      for (let y = b.y; y < b.y + b.h; y++)
        for (let z = b.z; z < b.z + b.d; z++)
          for (let x = b.x; x < b.x + b.w; x++) {
            const k = `${x},${y},${z}`;
            if (seen.has(k)) overlaps++; else seen.add(k);
          }
    expect(overlaps).toBe(0);
  });

  it('build: phases in order, every phase used, about 4 minutes, the hillside wave stacks bottom-up', () => {
    const s = sequence(bricks, PHASES, EAMES.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    let last = -1;
    for (const i of s.order) { expect(bricks[i].phase).toBeGreaterThanOrEqual(last); last = bricks[i].phase; }
    expect(s.total).toBeGreaterThan(220);
    expect(s.total).toBeLessThan(250);
    // nothing floats: in every stud cell the hillside goes up bottom-first (as spec 005)
    const cells = new Map<string, number[]>();
    bricks.forEach((b, i) => {
      if (b.phase !== P.SITE) return;
      for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
        const k = `${x},${z}`; (cells.get(k) ?? cells.set(k, []).get(k)!).push(i);
      }
    });
    let bad = 0;
    for (const list of cells.values()) {
      list.sort((a, c) => bricks[a].y - bricks[c].y);
      for (let j = 1; j < list.length; j++) if (s.start[list[j]] < s.start[list[j - 1]]) { bad++; break; }
    }
    expect(bad).toBe(0);
  });

  it('site: the lot meets the real ground at its edges (within a brick, except where the drive leaves)', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => {
      if (x >= 6 && x < 18 && z === TERRAIN.z0) return; // the drive
      if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`);
    };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('site: real-world placement agrees with the data, and the sea is at true sea level', () => {
    expect(EAMES.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(EAMES.site.lat).toBeCloseTo(n.anchor.lat, 6);
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.8);
    // sources: the bluff is about 150 ft above the Pacific
    expect(Math.abs(n.anchor.lotElevationM / 0.3048 - 150)).toBeLessThan(10);
    expect(EAMES.scenery?.sea).toBe(true);
    // the ocean is in view: real ground falls below sea level toward the residence end (model +z), within the near grid
    let lowest = Infinity;
    for (let z = 200; z <= 4000; z += 50) lowest = Math.min(lowest, sampleGrid(n.near, 10, z));
    expect(lowest).toBeLessThan(-n.anchor.lotElevationM / 0.3048);
  });

  it('site: the terrain has no spikes left (the tiles had corrupt samples over the ocean, despiked by the data script)', () => {
    const seaY = -n.anchor.lotElevationM / 0.3048;
    for (const [g, limit] of [[n.near, 150], [n.far, 500]] as const) {
      let worst = 0;
      for (let j = 1; j < g.nz - 1; j++)
        for (let i = 1; i < g.nx - 1; i++) {
          if (g.h[j * g.nx + i] < seaY - 0.5) continue; // under the water: not visible (sea floor clamped by the data script)
          const nb: number[] = [];
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (di || dj) nb.push(g.h[(j + dj) * g.nx + i + di]);
          nb.sort((a, c) => a - c);
          worst = Math.max(worst, Math.abs(g.h[j * g.nx + i] - (nb[3] + nb[4]) / 2));
        }
      expect(worst).toBeLessThanOrEqual(limit + 0.5);
    }
  });

  it('furniture: every piece says whether it is documented or assumed', () => {
    const src = readFileSync('src/houses/eames-house/model/interior.ts', 'utf8');
    const documented = (src.match(/\[documented\]/g) ?? []).length, assumed = (src.match(/\[assumed/g) ?? []).length;
    expect(documented).toBeGreaterThanOrEqual(8);
    expect(assumed).toBeGreaterThanOrEqual(4);
    expect(src).toMatch(/Eames Lounge Chair and ottoman/);
    expect(src).toMatch(/alcove sofa/);
  });

  it('home card: live, with the real piece count and the no-affiliation credit on the page', () => {
    const card = HOUSES.find((h) => h.slug === 'eames-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(EAMES.text.disclaimer).toMatch(/Eames Office.*Eames Foundation.*Herman Miller.*Vitra/);
  });
});
