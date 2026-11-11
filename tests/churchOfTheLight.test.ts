// Spec: specs/055-church-of-the-light.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { CHURCH_OF_THE_LIGHT as H } from '../src/houses/church-of-the-light/definition';
import { GRID } from '../src/houses/church-of-the-light/model/chapel';
import { ALTAR_WALL_X, BOX, CROSSING, diagZ, DIAG, INSIDE, rowX0, ROWS, SLIT_Z, STUB, Y } from '../src/houses/church-of-the-light/model/layout';
import { TERRAIN } from '../src/houses/church-of-the-light/model/site';
import { P, PHASES } from '../src/houses/church-of-the-light/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/church-of-the-light/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/church-of-the-light/model/${f}`, 'utf8');
const M = 3.28084;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

describe('055: the Church of the Light', () => {
  it('A1: the footprint fits OSM\'s way 597276853 (IoU ≥ 0.75), about 18.3 × 6.66 m', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(BOX[2] - BOX[0] - 18.3 * M)).toBeLessThanOrEqual(2);
    expect(Math.abs(BOX[3] - BOX[1] - 6.66 * M)).toBeLessThanOrEqual(2);
  });

  it('A2: the cross: a glowing slit in the middle stud, floor to ceiling, and an arm from wall to wall', () => {
    expect(SLIT_Z - INSIDE[1]).toBe(INSIDE[3] - 1 - SLIT_Z); // centred
    for (let y = Y.ALTAR; y < Y.CEILING; y++) expect(at(ALTAR_WALL_X, y, SLIT_Z)?.kind, `slit at ${y}`).toBe('light');
    for (let z = INSIDE[1]; z < INSIDE[3]; z++) expect(at(ALTAR_WALL_X, Y.ARM[0], z)?.kind, `arm at ${z}`).toBe('light');
    // beside the cross, the wall is concrete
    expect(at(ALTAR_WALL_X, Y.ARM[0] - 3, SLIT_Z - 3)?.kind).toBe('brick');
  });

  it('A3: the 15° wall crosses the long wall, ends inside near the middle; a stub on its line through the entrance wall', () => {
    const angle = (Math.atan2(diagZ(DIAG.x1) - diagZ(DIAG.x0), DIAG.x1 - DIAG.x0) * 180) / Math.PI;
    expect(Math.abs(angle - 15)).toBeLessThanOrEqual(1);
    const mid = (INSIDE[1] + INSIDE[3]) / 2;
    expect(Math.abs(diagZ(DIAG.x0) - mid)).toBeLessThanOrEqual(3);
    expect(CROSSING.z).toBeGreaterThanOrEqual(INSIDE[3]);
    expect(CROSSING.z).toBeLessThanOrEqual(BOX[3]);
    // its cells: inside the room half way along, and outside beyond the long wall
    const wallAt = (x: number) => [-1, 0, 1].some((d) => at(x, Y.ENTRY + 6, Math.floor(diagZ(x + 0.5)) + d)?.phase === P.STRUCTURE);
    expect(wallAt(25)).toBe(true);
    expect(wallAt(55)).toBe(true);
    expect(diagZ(55)).toBeGreaterThan(BOX[3]);
    // the stub, both sides of the entrance wall
    for (const x of [STUB.x0, STUB.x1 - 1]) expect([-1, 0, 1].some((d) => at(x, Y.ENTRY + 6, Math.floor(diagZ(x + 0.5)) + d)?.phase === P.STRUCTURE), `stub at ${x}`).toBe(true);
  });

  it('A4: the floor steps down 9 plates to the altar; 12 pew rows, each on one level, shorter where the wall cuts in', () => {
    const floorAt = (x: number) => { for (let y = Y.ENTRY + 3; y > Y.ALTAR - 4; y--) if (at(x, y - 1, 4)?.phase === P.FLOOR) return y; return NaN; };
    expect(floorAt(INSIDE[0] + 1) - floorAt(INSIDE[2] - 1)).toBe(9);
    expect(Math.abs((Y.ENTRY - Y.ALTAR) * PLATE - 1.1 * M)).toBeLessThanOrEqual(0.4);
    let prev = floorAt(INSIDE[0] + 1);
    for (let x = INSIDE[0] + 1; x < INSIDE[2]; x++) { const f = floorAt(x); expect(f, `floor at ${x}`).toBeLessThanOrEqual(prev); prev = f; }
    const rowLen = (k: number) => { let n = 0; for (let z = INSIDE[1]; z < INSIDE[3]; z++) if (at(rowX0(k) + 1, floorAt(rowX0(k) + 1), z)?.phase === P.INTERIOR) n++; return n; };
    const lens = Array.from({ length: ROWS }, (_, k) => rowLen(k));
    expect(lens.filter((l) => l > 0).length).toBe(12);
    expect(lens[ROWS - 1]).toBeLessThan(lens[0]);
  });

  it('A5: deterministic, inside its grid, no overlaps; every phase used, about 2 minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(105);
    expect(s.total).toBeLessThan(145);
  });

  it('A7: everything marked documented or assumed; at least 5 interior marks', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|assumed)/);
    expect((src('interior.ts').match(/\[(documented|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });

  it('A8: the lot meets the real ground at its edges', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
  });

  it('A9: the terrain has no spikes (spec 010b)', () => {
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

  it('A10: the home card is live, with the real piece count and its credits; the numbers say "chapel"', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'church-of-the-light')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('Tadao Ando Architect & Associates');
    expect(card.wikidata).toBe('Q1655766');
    expect(H.text.noun).toBe('chapel');
  });
});
