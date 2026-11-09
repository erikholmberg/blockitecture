// Spec: specs/025-ennis-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { GRID } from '../src/houses/ennis-house/model/ennisHouse';
import { MASSES, MODULE, Y } from '../src/houses/ennis-house/model/layout';
import { inHouse, TERRAIN } from '../src/houses/ennis-house/model/site';
import { P, PHASES } from '../src/houses/ennis-house/phases';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = ENNIS.build();
const bricks = builder.bricks;
const file = readFileSync('public/ennis-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const ft = (plates: number) => plates * PLATE;
const src = (f: string) => readFileSync(`src/houses/ennis-house/model/${f}`, 'utf8');

describe('025: the Ennis House', () => {
  it('A1: the other houses\' models, piece counts and timelines are unchanged', () => {
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
      [SCHRODER, { count: 10668, hash: '501f28e6' }, 182.7],
      [FARNSWORTH, { count: 13052, hash: 'ca43acd9' }, 180.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  });

  it('A2: fitting by OSM id is opt-in (only the Ennis House\'s settings use it)', async () => {
    const settings = async (slug: string) => (await import(`../scripts/houses/${slug}.mjs`)).default;
    for (const slug of ['stahl-house', 'eames-house', 'fallingwater', 'rietveld-schroder-house', 'farnsworth-house'])
      expect((await settings(slug)).fit.osmIds).toBeUndefined();
    expect((await settings('ennis-house')).fit.osmIds).toEqual([426658114]);
  });

  it('A3: the outline is OSM\'s, the heights the HABS elevation\'s (±1 ft)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    // HABS CA-1942, read at 6 px/ft from the floor line: tiers about 11, 19 and 24 ft, the tower about 24½ ft, the court wall 8 ft
    for (const [plates, feet] of [[Y.T1, 11], [Y.T2, 19], [Y.T3, 24], [Y.TOWER, 24.5], [Y.COURT_WALL, 8]] as const)
      expect(Math.abs(ft(plates) - feet)).toBeLessThanOrEqual(1);
    // every mass stands inside the outline
    for (const m of MASSES) {
      let inside = 0, all = 0;
      for (let z = m.rect[1]; z < m.rect[3]; z++) for (let x = m.rect[0]; x < m.rect[2]; x++) { all++; if (inHouse(x, z)) inside++; }
      expect(inside / all, m.name).toBeGreaterThan(0.85);
    }
  });

  it('A4: the walls sit on the 4-ft, three-block module (±1 ft)', () => {
    expect(MODULE).toBe(4);
    for (const m of MASSES) {
      const len = m.rect[2] - m.rect[0], dep = m.rect[3] - m.rect[1];
      for (const v of [len, dep]) expect(Math.abs(v - MODULE * Math.round(v / MODULE)), m.name).toBeLessThanOrEqual(1);
    }
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(ENNIS.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    const seen = new Set<number>();
    let overlaps = 0;
    for (const b of bricks)
      for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) {
        const k = ((y - GRID.y0) * GRID.nz + (z - GRID.z0)) * GRID.nx + (x - GRID.x0);
        if (seen.has(k)) overlaps++; else seen.add(k);
      }
    expect(overlaps).toBe(0);
  });

  it('A6: every phase used, about 4 minutes; the ridge wave stacks bottom-up', () => {
    const s = sequence(bricks, PHASES, ENNIS.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(220);
    expect(s.total).toBeLessThan(250);
    const cells = new Map<number, number[]>();
    bricks.forEach((b, i) => {
      if (b.phase !== P.SITE) return;
      for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) { const k = x * 4096 + z; (cells.get(k) ?? cells.set(k, []).get(k)!).push(i); }
    });
    let bad = 0;
    for (const list of cells.values()) {
      list.sort((a, c) => bricks[a].y - bricks[c].y);
      for (let j = 1; j < list.length; j++) if (s.start[list[j]] < s.start[list[j - 1]]) { bad++; break; }
    }
    expect(bad).toBe(0);
  });

  it('A7: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A8: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A9: placed by OSM id (IoU ≥ 0.75)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(ENNIS.site.rotationDeg).toBe(n.anchor.rotationDeg);
  });

  it('home card: live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'ennis-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toEqual(['the Ennis House Foundation', 'the Frank Lloyd Wright Foundation']);
    expect(card.sources?.some((s) => /HABS CA-1942/.test(s))).toBe(true);
  });
});
