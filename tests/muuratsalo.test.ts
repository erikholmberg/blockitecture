// Spec: specs/058-muuratsalo-experimental-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isWater, parseNeighborhood, sampleGrid, seaLevelY, waterMask } from '../src/engine/scene/neighborhoodData';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { MUURATSALO as H } from '../src/houses/muuratsalo-experimental-house/definition';
import { GRID } from '../src/houses/muuratsalo-experimental-house/model/koetalo';
import { COURT, GUEST, MAIN, SOUTH_OPENING, Y } from '../src/houses/muuratsalo-experimental-house/model/layout';
import { WHITE } from '../src/houses/muuratsalo-experimental-house/model/house';
import { TERRAIN } from '../src/houses/muuratsalo-experimental-house/model/site';
import { P, PHASES } from '../src/houses/muuratsalo-experimental-house/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/muuratsalo-experimental-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/muuratsalo-experimental-house/model/${f}`, 'utf8');
const cm = (v: number) => v / 30.48;
const cells = new Map<string, (typeof bricks)[number]>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);

describe('058: the Muuratsalo Experimental House', () => {
  it('A1: the footprint fits OSM\'s way 1341918201 (IoU ≥ 0.75), about 1427 × 1441 cm', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(Math.abs(MAIN[2] - MAIN[0] - cm(1427))).toBeLessThanOrEqual(2);
    expect(Math.abs(MAIN[3] - MAIN[1] - cm(1441))).toBeLessThanOrEqual(2);
  });

  it('A2: the south side: a 265 cm return, a 435 cm opening, then the bedroom wing', () => {
    expect(Math.abs(SOUTH_OPENING[0] - cm(265))).toBeLessThanOrEqual(1);
    expect(Math.abs(SOUTH_OPENING[1] - SOUTH_OPENING[0] - cm(435))).toBeLessThanOrEqual(1);
    const z = MAIN[3] - 1;
    expect(at(SOUTH_OPENING[0] - 2, 10, z)).toBeDefined(); // the return
    for (let x = SOUTH_OPENING[0]; x < SOUTH_OPENING[1]; x++) expect(at(x, 10, z), `opening at ${x}`).toBeUndefined();
    expect(at(SOUTH_OPENING[1] + 2, 3, z)?.phase).toBe(P.STRUCTURE); // the bedroom wing's end wall
  });

  it('A3: the courtyard\'s faces are the patchwork; every outside face is white', () => {
    const colours = new Set<number>(), patterns = new Set<string>();
    for (let z = COURT[1] + 1; z < COURT[3] - 2; z++)
      for (let y = 0; y < Y.COURT_WALL; y += 1) {
        const b = at(COURT[2], y, z); // the bedroom wing's courtyard face
        if (b?.phase === P.STRUCTURE) colours.add(b.color);
      }
    // panels: the colours of 4 × 4 windows on the face, as a pattern each
    for (let z = COURT[1] + 1; z < COURT[3] - 5; z += 4)
      for (let y = 0; y < 24; y += 8) {
        const sig: number[] = [];
        for (let dz = 0; dz < 4; dz++) for (let dy = 0; dy < 4; dy++) sig.push(at(COURT[2], y + dy, z + dz)?.color ?? -1);
        patterns.add(sig.map((c) => (c === sig[0] ? 'a' : 'b')).join(''));
      }
    expect(colours.size).toBeGreaterThanOrEqual(3);
    expect(patterns.size).toBeGreaterThanOrEqual(4);
    // the outside faces: the lake side of the west wall, the north wall, the east wall
    for (const [x, y, z] of [[0, 10, 30], [20, 10, 0], [MAIN[2] - 1, 3, 30], [3, 10, MAIN[3] - 1]] as const)
      expect(WHITE, `${x},${y},${z}`).toContain(at(x, y, z)?.color);
  });

  it('A4: the guest wing about 720 × 360 cm, its floor on posts standing on boulders', () => {
    expect(Math.abs(GUEST[2] - GUEST[0] - cm(720))).toBeLessThanOrEqual(1.5);
    expect(Math.abs(GUEST[3] - GUEST[1] - cm(360))).toBeLessThanOrEqual(1.5);
    expect(at(54, -2, 1)?.phase).toBe(P.FLOOR);
    expect(at(54, -4, 1)?.kind).toBe('round'); // a post
    const ground = hm.at(54, 1);
    expect(ground).toBeLessThan(-4);
    expect(at(54, ground, 1)?.phase).toBe(P.FOUNDATION); // its boulder
  });

  it('A5: deterministic, inside its grid, no overlaps; every phase used, about 2½ minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(135);
    expect(s.total).toBeLessThan(170);
  });

  it('A7: everything marked documented or assumed; at least 8 interior marks', () => {
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

  it('A10: Lake Päijänne is water west of the house; the island and the lot are not', () => {
    const seaY = seaLevelY(H.scenery?.sea, n.anchor.lotElevationM)!;
    const mask = waterMask(n.near, seaY);
    expect(isWater(n.near, mask, -400, 200)).toBe(true);
    expect(isWater(n.near, mask, -280, 411)).toBe(true);
    expect(isWater(n.near, mask, 23, 23)).toBe(false);
    expect(isWater(n.near, mask, 300, -100)).toBe(false);
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x += 5)
      for (let z = TERRAIN.z0; z < TERRAIN.z1; z += 5) expect(hm.at(x, z) * PLATE, `${x},${z}`).toBeGreaterThan(seaY);
  });

  it('A11: the home card is live, with the real piece count and its credits', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'muuratsalo-experimental-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toContain('the Alvar Aalto Foundation');
    expect(card.wikidata).toBe('Q5755595');
  });
});
