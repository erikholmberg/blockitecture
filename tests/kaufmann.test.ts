// Spec: specs/033-kaufmann-desert-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { desertColor } from '../src/engine/scene/neighborhood';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { EAMES } from '../src/houses/eames-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { ALUMINIUM } from '../src/houses/kaufmann-desert-house/model/house';
import { GRID } from '../src/houses/kaufmann-desert-house/model/kaufmannHouse';
import { GARAGE, GLORIETTE, GUEST, LIVING, LOUVRE_PITCH, MASTER, Rect, SERVICE, Y } from '../src/houses/kaufmann-desert-house/model/layout';
import { TERRAIN } from '../src/houses/kaufmann-desert-house/model/site';
import { P, PHASES } from '../src/houses/kaufmann-desert-house/phases';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { STAHL } from '../src/houses/stahl-house/definition';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = KAUFMANN.build();
const bricks = builder.bricks;
const file = readFileSync('public/kaufmann-desert-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/kaufmann-desert-house/model/${f}`, 'utf8');
const rgb = (c: number) => [c >> 16, (c >> 8) & 255, c & 255];

describe('033: the Kaufmann Desert House', () => {
  it('A1: the other seven houses\' models, piece counts and timelines are unchanged', () => {
    const pins = [
      [STAHL, { count: 27233, hash: '116d7826' }, 228.7],
      [EAMES, { count: 21657, hash: '74053447' }, 230.7],
      [FALLINGWATER, { count: 58425, hash: 'af03e3c7' }, 240.7],
      [SCHRODER, { count: 10668, hash: '501f28e6' }, 182.7],
      [FARNSWORTH, { count: 13052, hash: 'ca43acd9' }, 180.7],
      [ENNIS, { count: 31820, hash: '0b6ef15e' }, 240.7],
      [MALAPARTE, { count: 59758, hash: 'c84ca868' }, 180.7],
    ] as const;
    for (const [h, fp, total] of pins) {
      const b = h.build().builder.bricks;
      expect(modelFingerprint(b), h.slug).toEqual(fp);
      expect(sequence(b, h.phases, h.center).total).toBeCloseTo(total, 5);
    }
  }, 60_000);

  it('A2: the desert palette is opt-in (only this house), sandy on the flats and rock on the steep slopes', () => {
    for (const h of [STAHL, EAMES, FALLINGWATER, SCHRODER, FARNSWORTH, ENNIS, MALAPARTE]) expect(h.scenery?.desert, h.slug).toBeFalsy();
    expect(KAUFMANN.scenery?.desert).toBe(true);
    const others = new Set([0x4f6b44, 0x6b7550, 0x5c6f4a, 0x5f7a4e, 0x6f8a5a, 0x2f4f2a, 0x3b5a30, 0x46663a]); // chaparral, forest
    let sandy = 0, watered = 0, flats = 0;
    for (let z = -20000; z < 20000; z += 397)
      for (let x = -20000; x < 20000; x += 401) {
        const flat = desertColor(x, z, 0, 0.05), steep = desertColor(x, z, 2000, 1.8);
        expect(others.has(flat)).toBe(false);
        const [r, g, b] = rgb(flat);
        flats++;
        if (r > g && g > b && r > 180) sandy++; // sand: warm and light
        else if (g > r && g > b) watered++; // the town's watered patches
        // the mountains: bare rock, brown-grey, never green
        const [sr, sg, sb] = rgb(steep);
        expect(sr >= sg && sg >= sb, steep.toString(16)).toBe(true);
      }
    expect(sandy / flats).toBeGreaterThan(0.6);
    expect(watered).toBeGreaterThan(0);
  });

  it('A3: the footprint fits OSM\'s way 566015553 (IoU ≥ 0.75)', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(KAUFMANN.site.rotationDeg).toBe(n.anchor.rotationDeg);
  });

  it('A4: the pinwheel: four wings out from the living room in four directions; the gloriette on its roof, louvres even', () => {
    // a pinwheel's wings are offset, so each one's direction is the side it reaches furthest past the living room
    const dir = (r: Rect) => {
      const past = { W: LIVING[0] - r[0], N: LIVING[1] - r[1], E: r[2] - LIVING[2], S: r[3] - LIVING[3] };
      return (Object.entries(past) as [string, number][]).sort((a, c) => c[1] - a[1])[0][0];
    };
    expect([GUEST, MASTER, SERVICE[0], GARAGE].map(dir)).toEqual(['N', 'E', 'W', 'S']);
    // the gloriette stands on the living room's roof
    expect(GLORIETTE[0] >= LIVING[0] && GLORIETTE[1] >= LIVING[1] && GLORIETTE[2] <= LIVING[2] && GLORIETTE[3] <= LIVING[3]).toBe(true);
    const louvres = bricks.filter((b) => b.phase === P.ENVELOPE && b.color === ALUMINIUM);
    expect(louvres.length).toBeGreaterThan(0);
    // each blade a vertical 1 × 1 column from the roof to the canopy
    const blades = new Map<string, number>();
    for (const b of louvres) {
      expect(b.w === 1 && b.d === 1).toBe(true);
      blades.set(`${b.x},${b.z}`, (blades.get(`${b.x},${b.z}`) ?? 0) + b.h);
    }
    for (const h of blades.values()) expect(h).toBe(Y.GLORIETTE - Y.ROOF);
    // evenly spaced along each side
    const west = [...blades.keys()].map((k) => k.split(',').map(Number)).filter(([x]) => x === GLORIETTE[0]).map(([, z]) => z).sort((a, c) => a - c);
    const north = [...blades.keys()].map((k) => k.split(',').map(Number)).filter(([x, z]) => z === GLORIETTE[1] && x !== GLORIETTE[0]).map(([x]) => x).sort((a, c) => a - c);
    for (const side of [west, north]) {
      expect(side.length).toBeGreaterThan(4);
      for (let i = 1; i < side.length; i++) expect(side[i] - side[i - 1]).toBe(LOUVRE_PITCH);
    }
  });

  it('A5: deterministic, inside its grid, no overlaps', () => {
    expect(modelFingerprint(KAUFMANN.build().builder.bricks)).toEqual(modelFingerprint(bricks));
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

  it('A6: every phase used, about 3 minutes (build order itself: tests/buildOrder.test.ts)', () => {
    const s = sequence(bricks, PHASES, KAUFMANN.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(165);
    expect(s.total).toBeLessThan(200);
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

  it('home card: live, with the real piece count and its credits; every card live', async () => {
    const { HOUSES } = await import('../src/houses');
    const card = HOUSES.find((h) => h.slug === 'kaufmann-desert-house')!;
    expect(card.status).toBe('live');
    expect(card.pieces).toBe(bricks.length);
    expect(card.affiliations).toEqual(['the owners of the Kaufmann House', 'the Neutra estate']);
    expect(card.sources?.some((s) => /LCCN 2013631255/.test(s))).toBe(true);
    expect(HOUSES.every((h) => h.status === 'live')).toBe(true);
  });
});
