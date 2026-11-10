// Spec: specs/044-vanna-venturi-house.md (hidden by specs/045-douglas-house.md)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { BARRAGAN } from '../src/houses/casa-luis-barragan/definition';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { KOSHINO } from '../src/houses/koshino-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { ROSE_SEIDLER } from '../src/houses/rose-seidler-house/definition';
import { roofTop } from '../src/houses/vanna-venturi-house/model/house';
import { CHIMNEY, GAP, HOUSE, inRect, PITCH, STAIR, UPPER, Y } from '../src/houses/vanna-venturi-house/model/layout';
import { GRID } from '../src/houses/vanna-venturi-house/model/vannaVenturiHouse';
import { TERRAIN } from '../src/houses/vanna-venturi-house/model/site';
import { P, PHASES } from '../src/houses/vanna-venturi-house/phases';
import { VANNA_VENTURI } from '../src/houses/vanna-venturi-house/definition';
import { SHEATS_GOLDSTEIN } from '../src/houses/sheats-goldstein-residence/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = VANNA_VENTURI.build();
const bricks = builder.bricks;
const file = readFileSync('public/vanna-venturi-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/vanna-venturi-house/model/${f}`, 'utf8');
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

describe('044: the Vanna Venturi House', () => {
  it('A1: the other houses\' models, piece counts and timelines are unchanged', () => {
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
      [SCHRODER, { count: 10668, hash: '501f28e6' }, 182.7],
      [FARNSWORTH, { count: 13052, hash: 'ca43acd9' }, 180.7],
      [ENNIS, { count: 31820, hash: '0b6ef15e' }, 240.7],
      [MALAPARTE, { count: 59758, hash: 'c84ca868' }, 180.7],
      [KAUFMANN, { count: 20326, hash: '7d7eade4' }, 184.7],
      [LOVELL, { count: 23428, hash: '9515e85a' }, 240.7],
      [BARRAGAN, { count: 24482, hash: '15217303' }, 180.7],
      [KOSHINO, { count: 32677, hash: '84917a56' }, 186.7],
      [SHEATS_GOLDSTEIN, { count: 56669, hash: 'cce5d76f' }, 252.7],
      [ROSE_SEIDLER, { count: 19226, hash: '64a474a1' }, 162.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 180_000);

  it('A2: the footprint fits OSM\'s way 769755185 (IoU ≥ 0.75) and the survey\'s 58.3 × 26.9 ft within 1 ft', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(VANNA_VENTURI.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(HOUSE[2] - HOUSE[0] - 58.3)).toBeLessThanOrEqual(1);
    expect(Math.abs(HOUSE[3] - HOUSE[1] - 26.9)).toBeLessThanOrEqual(1);
  });

  const front = (x: number, y: number) => at(x, y, 0)?.phase === P.ENVELOPE;
  const frontTop = (x: number) => { let y = Y.GABLE_PEAK + 4; while (y > 0 && !front(x, y)) y--; return y; };

  it('A3: the front is a split gable: two halves rising to peaks, a gap down the middle, above the roof behind it', () => {
    // each half rises from the corner to its peak beside the split
    const left = Array.from({ length: GAP[0] }, (_, x) => frontTop(x));
    const right = Array.from({ length: HOUSE[2] - GAP[1] }, (_, i) => frontTop(GAP[1] + i));
    for (let i = 1; i < left.length; i++) expect(left[i]).toBeGreaterThanOrEqual(left[i - 1]);
    for (let i = 1; i < right.length; i++) expect(right[i]).toBeLessThanOrEqual(right[i - 1]);
    expect(Math.max(...left)).toBeGreaterThanOrEqual(Y.GABLE_PEAK - 2);
    expect(Math.max(...right)).toBeGreaterThanOrEqual(Y.GABLE_PEAK - 2);
    // the gap: nothing in the front wall from the split's bottom up
    for (let x = GAP[0]; x < GAP[1]; x++) for (let y = Y.SPLIT; y <= Y.GABLE_PEAK + 2; y++) expect(at(x, y, 0), `gap ${x},${y}`).toBeUndefined();
    // higher than the roof behind it, everywhere but the corners
    for (let x = 4; x < HOUSE[2] - 4; x++) if (x < GAP[0] || x >= GAP[1]) expect(frontTop(x)).toBeGreaterThan(roofTop(x, 1));
  });

  it('A4: the roof steps up about a plate a stud from level eaves, hipped at both ends as well as front and back', () => {
    expect(PITCH).toBe(1);
    const top = (x: number, z: number) => { let y = Y.EAVE + 20; while (y >= Y.EAVE && at(x, y, z)?.phase !== P.ROOF) y--; return y; };
    // level eaves all round
    for (const [x, z] of [[2, HOUSE[3] - 1], [50, HOUSE[3] - 1], [0, 12], [HOUSE[2] - 1, 12]]) expect(top(x, z), `${x},${z}`).toBe(Y.EAVE);
    // up from the back toward the ridge, and up from each end toward the middle
    for (let z = HOUSE[3] - 1; z > HOUSE[3] - 12; z--) expect(top(10, z) - top(10, z + 1 > HOUSE[3] - 1 ? z : z + 1)).toBeLessThanOrEqual(1);
    expect(top(10, 13)).toBeGreaterThan(top(10, HOUSE[3] - 1) + 8);
    expect(top(5, 13)).toBeLessThan(top(10, 13));
    expect(top(HOUSE[2] - 6, 13)).toBeLessThan(top(HOUSE[2] - 11, 13));
  });

  it('A5: the chimney rises above the ridge, and the stair wraps it', () => {
    const ridge = roofTop(HOUSE[2] >> 1, HOUSE[3] >> 1);
    let y = 0;
    while (at(CHIMNEY[0] + 1, y, CHIMNEY[1] + 1)) y++;
    expect(y).toBeGreaterThan(ridge + 10);
    expect(y).toBeGreaterThan(Y.GABLE_PEAK);
    // the stair runs alongside the chimney and climbs past it to the upstairs floor
    expect(STAIR.x1).toBeLessThanOrEqual(CHIMNEY[0]);
    expect(CHIMNEY[0] - STAIR.x1).toBeLessThanOrEqual(1);
    // each step's top, from the back up toward the front, one step higher each time, to the upstairs floor
    const stepTop = (z: number) => { let y = 0; while (at(STAIR.x0, y, z)?.phase === P.INTERIOR) y++; return y; };
    const zs = Array.from({ length: STAIR.steps }, (_, i) => STAIR.zTop + STAIR.steps - 1 - i);
    const tops = zs.map(stepTop);
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
    expect(tops[tops.length - 1]).toBe(Y.UPPER);
    expect(Math.min(...zs)).toBeLessThanOrEqual(CHIMNEY[1] + 1);
    expect(Math.max(...zs)).toBeGreaterThanOrEqual(CHIMNEY[3]);
    expect(inRect(STAIR.x0, STAIR.zTop, UPPER)).toBe(true);
  });

  it('A6: deterministic, inside its grid, no overlaps; every phase used, about 2½ minutes', () => {
    expect(modelFingerprint(VANNA_VENTURI.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, VANNA_VENTURI.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(170);
  });

  it('A8: everything marked documented or assumed; at least 8 interior pieces', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(8);
  });

  it('A9: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
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

  it('045-A1: hidden: not in the registry or the build, its model kept (spec 045)', async () => {
    const { HOUSES } = await import('../src/houses');
    const { PAGES } = await import('../vite.config');
    expect(HOUSES.some((h) => h.slug === 'vanna-venturi-house')).toBe(false);
    expect(Object.keys(PAGES)).not.toContain('vanna-venturi-house');
    expect(bricks.length).toBe(28994);
  });
});
