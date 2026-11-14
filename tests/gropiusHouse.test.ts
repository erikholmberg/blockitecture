// Spec: specs/078-gropius-house.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PLATE } from '../src/engine/catalog';
import { inPoly, segDist } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { sequence } from '../src/engine/sequencer';
import { GROPIUS_HOUSE as H } from '../src/houses/gropius-house/definition';
import { GARAGE_CELLS } from '../src/houses/gropius-house/model/garage';
import { GRID } from '../src/houses/gropius-house/model/gropiusHouse';
import {
  CHIMNEY_GREYS, GLASS_BLOCKS, glassBlockCells, GREY, OPENINGS, SALMON, SCREEN, SIDING, SPIRAL_POST, wallCell,
} from '../src/houses/gropius-house/model/house';
import { MASTER_GLASS, PLASTER } from '../src/houses/gropius-house/model/interior';
import { ORCHARD, ORCHARD_STEP } from '../src/houses/gropius-house/model/landscape';
import {
  BRISE, CANOPY, CHIMNEY, DECK, DECK_OPENING, DINING, DRIVE, ENTRY, FRAME_COLS, GB_N, GB_X0, GUEST, HOUSE, inCanopy, inRect, LIVING,
  MASTER, OAK, PARTITION_X, PLINTH, PORCH, SPIRAL, STAIR, UPPER_EXT, ATI, Y,
} from '../src/houses/gropius-house/model/layout';
import { GARAGE_RING, GARAGE_Y, nearGarage, onDrive, TERRAIN } from '../src/houses/gropius-house/model/site';
import { P, PHASES } from '../src/houses/gropius-house/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
type B = (typeof bricks)[number];
const file = readFileSync('public/gropius-house/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/gropius-house/model/${f}`, 'utf8');
const cells = new Map<string, B>();
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(`${x},${y},${z}`, b);
const at = (x: number, y: number, z: number) => cells.get(`${x},${y},${z}`);
const ft = (plates: number) => plates * PLATE;
/** heights above the plinth, in ft */
const aboveGrade = (plates: number) => ft(plates - Y.LAWN);
const inR = (b: { x: number; z: number; w: number; d: number }, r: number[]) => b.x >= r[0] && b.x + b.w <= r[2] && b.z >= r[1] && b.z + b.d <= r[3];
const of = (phase: number) => bricks.filter((b) => b.phase === phase);
const footprint = (bs: B[]) => {
  const s = new Set<string>();
  for (const b of bs) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) s.add(`${x},${z}`);
  return s;
};
const within = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

describe('078: the Gropius House', () => {
  it('A1: the roof outline fits OSM\'s way 215140093 (IoU ≥ 0.75), its long sides within 2° of 80.9°; the ground floor 54.7 × 21.75 ft', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.75);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    // the model's +x is the real bearing 90° − rotation (realToModelDir)
    expect(Math.abs(90 - H.site.rotationDeg - 80.9)).toBeLessThanOrEqual(2);
    expect(within(HOUSE[2] - HOUSE[0], 54 + 8 / 12, 0.5)).toBe(true);
    expect(within(HOUSE[3] - HOUSE[1], 21.75, 0.5)).toBe(true);
    // the data script fitted the model's own roof outline: the upper floor with the brise-soleil and the deck's joists, and the
    // porch's roof beyond them
    expect(readFileSync('scripts/houses/gropius-house.mjs', 'utf8')).toContain(`roof: [[${HOUSE[0]}, ${HOUSE[1]}, ${HOUSE[2]}, ${UPPER_EXT[3]}], [${PORCH[0]}, ${UPPER_EXT[3]}, ${PORCH[2]}, ${PORCH[3]}]]`);
    const roofed = footprint(bricks.filter((b) => [P.STRUCTURE, P.ROOF].includes(b.phase) && b.y >= Y.GF_CEIL && b.z >= 0 && b.x >= 0 && b.x < 60 && b.z < 50 && !b.hangs));
    let hit = 0, want = 0;
    for (let z = 0; z < PORCH[3]; z++) for (let x = 0; x < HOUSE[2]; x++) {
      const w = z < UPPER_EXT[3] || (x >= PORCH[0] && x < PORCH[2]);
      if (w) { want++; if (roofed.has(`${x},${z}`)) hit++; }
    }
    expect(hit / want).toBeGreaterThanOrEqual(0.97);
  });

  it('A2: the upper floor 7 ft further south over the east; the deck 21 × 14 ft at 11.7 ft; the parapet\'s top at 20.2 ft', () => {
    expect(within(UPPER_EXT[3] - HOUSE[3], 7, 1)).toBe(true);
    expect(UPPER_EXT[2]).toBe(HOUSE[2]);
    expect(at(50, Y.UP - 1, UPPER_EXT[3] - 1)?.phase).toBe(P.STRUCTURE);
    expect(at(10, Y.UP - 1, UPPER_EXT[3] - 1)?.phase).not.toBe(P.STRUCTURE);
    const [a, c] = [DECK[2] - DECK[0], DECK[3] - DECK[1]].sort((p, q) => p - q);
    expect(within(a, 14, 1) && within(c, 21, 1)).toBe(true);
    expect(DECK[0]).toBe(HOUSE[0]);
    expect(within(aboveGrade(Y.UP), 11.7, 1)).toBe(true);
    // the deck: its floor at that level, open above it
    expect(at(6, Y.UP - 1, 12)?.phase).toBe(P.STRUCTURE);
    for (let y = Y.UP; y < Y.ROOF - 1; y++) expect(at(6, y, 12), `${y}`).toBeUndefined();
    const parapet = of(P.ROOF).filter((b) => b.color === SIDING && b.x >= 0 && b.x < HOUSE[2] && b.z >= 0 && b.z < UPPER_EXT[3] && b.y >= Y.ROOF);
    expect(parapet.length).toBeGreaterThan(20);
    expect(within(aboveGrade(Math.max(...parapet.map((b) => b.y + b.h))), 20.2, 1)).toBe(true);
  });

  it('A3: the glass block 12 × 9 by the door; the canopy at 30° on two posts and the glass block, past the east end; one opening in the deck\'s north wall', () => {
    const gb = glassBlockCells();
    expect(gb.length).toBe(12);
    expect(GB_N).toBe(12);
    for (const [x, z] of gb) {
      const col = bricks.filter((b) => b.x === x && b.z === z && GLASS_BLOCKS.includes(b.color));
      expect(col.length, `${x},${z}`).toBe(9);
      for (const b of col) expect([b.w, b.d, b.phase]).toEqual([1, 1, P.ENVELOPE]);
      // the canopy rests on it
      expect(GLASS_BLOCKS).toContain(at(x, Y.GB_TOP - 1, z)?.color);
      expect(at(x, Y.CANOPY[0], z)?.phase).toBe(P.ROOF);
    }
    // one block per stud along x, beside the entrance door
    expect(new Set(gb.map(([x]) => x)).size).toBe(12);
    expect(GB_X0).toBe(ENTRY[1]);
    for (let x = ENTRY[0]; x < ENTRY[1]; x++) expect(wallCell(x, 5, 0)).toMatchObject({ kind: 'door' });
    // the canopy: a flat slab; its south edge's slope over its run
    const canopy = of(P.ROOF).filter((b) => b.z < 0 && b.y === Y.CANOPY[0] && !b.hangs);
    expect(canopy.length).toBeGreaterThan(20);
    for (const b of canopy) expect(b.y + b.h).toBe(Y.CANOPY[1]);
    const fp = footprint(canopy);
    const south = (x: number) => Math.max(...[...fp].map((k) => k.split(',').map(Number)).filter(([xx]) => xx === x).map(([, z]) => z));
    const x0 = GB_X0, x1 = CANOPY.x1 - 1;
    const deg = (Math.atan2(south(x0) - south(x1), x1 - x0) * 180) / Math.PI;
    expect(Math.abs(deg - 30)).toBeLessThanOrEqual(3);
    // it points east-north-east: out from the front, toward the drive
    expect(south(x1)).toBeLessThan(south(x0));
    expect(Math.max(...canopy.map((b) => b.x + b.w))).toBeGreaterThan(HOUSE[2]);
    // exactly two steel posts under it, besides the glass block
    const posts = new Set(of(P.STRUCTURE).filter((b) => b.kind === 'bar' && inCanopy(b.x, b.z)).map((b) => `${b.x},${b.z}`));
    expect(posts.size).toBe(2);
    // the deck's north wall: solid but for one opening, where the spiral stair arrives
    const openCols = [];
    for (let x = DECK[0]; x < DECK[2]; x++) if (at(x, Y.UP + 5, 0) === undefined) openCols.push(x);
    expect(openCols).toEqual(Array.from({ length: DECK_OPENING[1] - DECK_OPENING[0] }, (_, i) => DECK_OPENING[0] + i));
    for (let x = DECK[0]; x < DECK[2]; x++)
      for (let y = Y.UP; y < Y.ROOF; y++) if (!openCols.includes(x) || y >= Y.UP + 18) expect(at(x, y, 0)?.color, `${x},${y}`).toBe(SIDING);
  });

  it('A4: the spiral stair: round, 4–6 ft, a central post 12.6 ft from the west end, in front of the north front; its treads climb from the plinth to the deck', () => {
    const treads = of(P.STRUCTURE).filter((b) => b.kind === 'tile' && b.color === GREY && b.z < 0 && b.x < 20);
    const xs = treads.map((b) => b.x), zs = treads.map((b) => b.z);
    const span = (v: number[]) => Math.max(...v) - Math.min(...v) + 1;
    expect(span(xs)).toBeGreaterThanOrEqual(4);
    expect(span(xs)).toBeLessThanOrEqual(6);
    expect(span(zs)).toBeGreaterThanOrEqual(4);
    expect(span(zs)).toBeLessThanOrEqual(6);
    expect(Math.abs(SPIRAL.x - 12.6)).toBeLessThanOrEqual(1);
    expect(Math.abs((Math.min(...xs) + Math.max(...xs) + 1) / 2 - 12.6)).toBeLessThanOrEqual(1);
    expect(Math.max(...zs)).toBeLessThan(HOUSE[1]);
    // the post, from the plinth to above the deck
    const post = bricks.filter((b) => b.x === SPIRAL_POST[0] && b.z === SPIRAL_POST[1] && b.kind === 'bar');
    expect(Math.min(...post.map((b) => b.y))).toBeLessThanOrEqual(Y.LAWN + 1);
    expect(Math.max(...post.map((b) => b.y + b.h))).toBeGreaterThan(Y.UP);
    for (const b of post) expect(b.color).toBe(GREY);
    // the treads, by height: from just above the plinth to the deck's floor, each touching the post or the one below
    const ys = [...new Set(treads.map((b) => b.y))].sort((a, c) => a - c);
    expect(ys[0]).toBeGreaterThan(Y.LAWN);
    expect(ys[ys.length - 1] + 1).toBe(Y.UP);
    ys.forEach((y, i) => {
      const t = treads.filter((b) => b.y === y);
      const touchesPost = t.some((b) => Math.max(Math.abs(b.x - SPIRAL_POST[0]), Math.abs(b.z - SPIRAL_POST[1])) <= 1);
      const below = i > 0 ? treads.filter((b) => b.y === ys[i - 1]) : [];
      const touchesBelow = t.some((b) => below.some((c) => Math.abs(b.x - c.x) + Math.abs(b.z - c.z) <= 1));
      expect(touchesPost || touchesBelow, `tread at ${y}`).toBe(true);
      if (i > 0) expect(y - ys[i - 1]).toBeLessThanOrEqual(3);
    });
    // the top tread arrives at the deck's opening
    const top = treads.filter((b) => b.y === ys[ys.length - 1]);
    expect(top.some((b) => b.z === -1 && b.x >= DECK_OPENING[0] && b.x < DECK_OPENING[1])).toBe(true);
  });

  it('A5: the porch 11.5 × 23 ft at right angles, a flat roof on posts, screens; the big windows 6 ft high; the brise-soleil on joists; the chimney through the roof', () => {
    expect(within(PORCH[2] - PORCH[0], 11.5, 1)).toBe(true);
    expect(within(PORCH[3] - PORCH[1], 23, 1)).toBe(true);
    expect(PORCH[1]).toBe(HOUSE[3]);
    const porchRoof = of(P.ROOF).filter((b) => inR(b, [PORCH[0], UPPER_EXT[3], PORCH[2], PORCH[3]]));
    // flat: one top layer over the whole porch beyond the overhang
    expect(footprint(porchRoof.filter((b) => b.y + b.h === Y.UP)).size).toBe((PORCH[2] - PORCH[0]) * (PORCH[3] - UPPER_EXT[3]));
    expect(Math.max(...porchRoof.map((b) => b.y + b.h))).toBe(Y.UP);
    expect(of(P.STRUCTURE).filter((b) => b.kind === 'bar' && inR(b, PORCH)).length).toBeGreaterThanOrEqual(4);
    expect(of(P.ENVELOPE).filter((b) => b.color === SCREEN && b.kind === 'glass' && inR(b, PORCH)).length).toBeGreaterThanOrEqual(10);
    const big = OPENINGS.filter((o) => o.kind === 'big');
    expect(big.length).toBe(3);
    for (const o of big) {
      expect(Math.abs(ft(o.y[1] - o.y[0]) - 6)).toBeLessThanOrEqual(0.5);
      expect(o.b - o.a).toBeGreaterThanOrEqual(9);
      expect(o.b - o.a).toBeLessThanOrEqual(12.5);
      const mid = Math.floor((o.a + o.b) / 2), [x, z] = o.axis === 'x' ? [mid, o.line] : [o.line, mid];
      expect(at(x, o.y[0] + 5, z)?.kind).toBe('glass');
    }
    // the brise-soleil: joists across the south front, open between
    const brise = of(P.ROOF).filter((b) => inR(b, BRISE) && b.color === SIDING);
    expect(new Set(brise.map((b) => b.x)).size).toBeGreaterThanOrEqual(10);
    expect(Math.max(...brise.map((b) => b.z + b.d)) - Math.min(...brise.map((b) => b.z))).toBe(BRISE[3] - BRISE[1]);
    // the chimney on the west end, above the parapet
    const chim = of(P.STRUCTURE).filter((b) => inR(b, CHIMNEY));
    expect(CHIMNEY[0]).toBeLessThanOrEqual(HOUSE[0]);
    expect(CHIMNEY[2]).toBeLessThanOrEqual(HOUSE[0] + 3);
    expect(Math.max(...chim.map((b) => b.y + b.h))).toBeGreaterThan(Y.PARAPET);
  });

  it('A6: one white for the siding, the trellises and the parapets; one grey for the windows, the canopy\'s posts and the spiral stair; a grey chimney; pink on the deck side only', () => {
    const boards = of(P.ENVELOPE).filter((b) => b.kind === 'brick' && b.w === 1 && b.d === 1 && wallCell(b.x, b.y, b.z) === 'wall');
    expect(boards.length).toBeGreaterThan(400);
    for (const b of boards) expect(b.color).toBe(SIDING);
    const trellis = of(P.ENVELOPE).filter((b) => (b.x < 0 && b.z === 0) || (b.x === 54 && b.z > UPPER_EXT[3]));
    expect(trellis.length).toBeGreaterThan(10);
    for (const b of trellis) expect(b.color).toBe(SIDING);
    for (const b of of(P.ROOF).filter((b) => b.y >= Y.ROOF && b.y < Y.PARAPET && b.kind === 'brick' && b.z >= 0)) expect(b.color).toBe(SIDING);
    // the window frames: everything in the openings that isn't glass
    const frames = of(P.ENVELOPE).filter((b) => b.kind !== 'glass' && OPENINGS.some((o) => o.kind !== 'open' && wallCell(b.x, b.y, b.z) === o));
    expect(frames.length).toBeGreaterThan(50);
    for (const b of frames) expect(b.color).toBe(GREY);
    for (const b of of(P.STRUCTURE).filter((b) => b.kind === 'bar' && (inCanopy(b.x, b.z) || (b.x === SPIRAL_POST[0] && b.z === SPIRAL_POST[1])))) expect(b.color).toBe(GREY);
    for (const b of of(P.STRUCTURE).filter((b) => b.z < 0 && b.x < 20 && b.y > Y.LAWN)) expect(b.color).toBe(GREY);
    const chim = bricks.filter((b) => inR(b, CHIMNEY) && b.phase === P.STRUCTURE);
    expect(chim.length).toBeGreaterThan(20);
    for (const b of chim) expect(CHIMNEY_GREYS).toContain(b.color);
    // pink: only on the deck's side of its north wall, the outside white
    const pink = bricks.filter((b) => b.color === SALMON);
    expect(pink.length).toBeGreaterThan(10);
    for (const b of pink) {
      expect(inR(b, DECK)).toBe(true);
      expect(b.z).toBe(1);
      expect([SIDING, undefined]).toContain(at(b.x, b.y, 0)?.color);
    }
  });

  it('A7: the living room 14.4 × 21 and the dining room 11 × 13.4 in an L; the curved glass-block partition; the hall\'s stair; three bedrooms and the glass partition', () => {
    expect(within(LIVING[2] - LIVING[0], 14.4, 1) && within(LIVING[3] - LIVING[1], 21, 1)).toBe(true);
    const [dA, dB] = [DINING[2] - DINING[0], DINING[3] - DINING[1]].sort((a, c) => a - c);
    expect(within(dA, 11, 1) && within(dB, 13.4, 1)).toBe(true);
    // an L: the dining room opens off the living room's east side, along part of it
    expect(DINING[0]).toBe(LIVING[2]);
    expect(DINING[1]).toBeGreaterThan(LIVING[1]);
    for (let z = DINING[1]; z < DINING[3]; z++) expect(at(DINING[0], 10, z)?.color === PLASTER).toBe(false);
    const part = of(P.INTERIOR).filter((b) => GLASS_BLOCKS.includes(b.color) && b.x >= PARTITION_X[0] && b.x < PARTITION_X[1]);
    expect(part.length).toBeGreaterThan(0);
    expect(new Set(part.map((b) => b.z)).size).toBeGreaterThanOrEqual(2);
    // the stair from the ground floor to the upper floor
    const steps = of(P.STRUCTURE).filter((b) => b.x >= STAIR.x0 && b.x < STAIR.x1 && b.y >= 0 && b.y < Y.UP && b.z >= 2 && b.z < 20);
    expect(Math.min(...steps.map((b) => b.y))).toBe(0);
    expect(Math.max(...steps.map((b) => b.y + b.h))).toBe(Y.UP);
    // three bedrooms, each with a bed; the master suite's glass
    for (const r of [ATI, GUEST, MASTER]) expect(of(P.INTERIOR).some((b) => inR(b, r) && b.y === Y.UP + 2 && b.kind === 'plate'), `${r}`).toBe(true);
    expect(of(P.INTERIOR).filter((b) => b.kind === 'glass' && inR(b, MASTER_GLASS)).length).toBeGreaterThan(0);
  });

  it('A8: every element marked; at least 12 marks in the interior; the partitions assumed', () => {
    for (const f of ['house.ts', 'layout.ts', 'interior.ts', 'site.ts', 'landscape.ts', 'garage.ts']) expect(src(f), f).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(12);
    expect(src('interior.ts')).toMatch(/where each partition stands is \[assumed\]/);
    expect(src('layout.ts')).toMatch(/the partitions, other than the living and dining rooms' sizes, are \[assumed\]/);
  });

  it('A9: the lot meets the real ground at its edges; the plinth is level; 150 ft out the ground is ≥ 6 ft below it every way', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PLATE - sampleGrid(n.near, x, z)) > 3 * PLATE + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    for (let z = PLINTH[1] + 1; z < PLINTH[3] - 1; z++)
      for (let x = PLINTH[0] + 1; x < PLINTH[2] - 1; x++) if (!inRect(x, z, [CHIMNEY[0], HOUSE[1], HOUSE[2], HOUSE[3]])) expect(hm.at(x, z), `${x},${z}`).toBe(Y.LAWN);
    const cx = (HOUSE[0] + HOUSE[2]) / 2, cz = (HOUSE[1] + HOUSE[3]) / 2;
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, x = Math.round(cx + 150 * Math.cos(a)), z = Math.round(cz + 150 * Math.sin(a));
      expect(ft(hm.at(x, z)), `${k * 45}°`).toBeLessThanOrEqual(ft(Y.LAWN) - 6);
    }
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

  it('A11: the retaining walls south and west; the lally frame 20 ft south of the porch; the oak on the chimney\'s axis; the orchard\'s grid; the drive on OSM\'s way; the garage', () => {
    const walls = footprint(of(P.FOUNDATION).filter((b) => !inR(b, [CHIMNEY[0] - 1, -1, HOUSE[2] + 1, PORCH[3] + 1]) && b.y < Y.LAWN));
    let west = 0, south = 0;
    for (let z = PLINTH[1]; z < PLINTH[3]; z++) if (walls.has(`${PLINTH[0]},${z}`)) west++;
    for (let x = PLINTH[0]; x < PLINTH[2]; x++) if (walls.has(`${x},${PLINTH[3] - 1}`)) south++;
    expect(west).toBe(PLINTH[3] - PLINTH[1]);
    expect(south).toBe(PLINTH[2] - PLINTH[0]);
    for (const [x, z] of FRAME_COLS) {
      expect(Math.abs(z - PORCH[3] - 20)).toBeLessThanOrEqual(2);
      expect(at(x, 10, z)?.color).toBe(GREY);
    }
    // the oak: west of the house, on the chimney's axis
    const chimneyZ = (CHIMNEY[1] + CHIMNEY[3]) / 2;
    expect(OAK[0]).toBeLessThan(HOUSE[0]);
    expect(Math.abs(OAK[1] + 1 - chimneyZ)).toBeLessThanOrEqual(2);
    expect(at(OAK[0], hm.at(OAK[0], OAK[1]) + 3, OAK[1])?.kind).toBe('round');
    // the orchard: on a grid, north of the house, each tree standing
    expect(ORCHARD.length).toBeGreaterThanOrEqual(30);
    for (const [x, z] of ORCHARD) {
      expect(z).toBeLessThan(PLINTH[1]);
      expect(((x - ORCHARD[0][0]) % ORCHARD_STEP + ORCHARD_STEP) % ORCHARD_STEP).toBe(0);
      expect(((z - ORCHARD[0][1]) % ORCHARD_STEP + ORCHARD_STEP) % ORCHARD_STEP).toBe(0);
      expect(at(x, hm.at(x, z) + 1, z)?.kind, `${x},${z}`).toBe('round');
    }
    // the drive: its gravel on OSM's way 753318617 (within 6 ft), all along it
    const osmDrive = readFileSync('src/houses/gropius-house/model/lotTerrain.ts', 'utf8');
    expect(osmDrive).toContain(`[${DRIVE.map((p) => `[${p.join(', ')}]`).join(', ')}]`);
    const toLine = (x: number, z: number) => Math.min(...DRIVE.slice(1).map((q, i) => segDist(x + 0.5, z + 0.5, DRIVE[i], q)));
    const gravel = of(P.LANDSCAPE).filter((b) => b.kind === 'tile' && onDrive(b.x, b.z) && !(Math.hypot(b.x - 86, b.z + 10) < 13));
    expect(gravel.length).toBeGreaterThan(50);
    for (const b of gravel) expect(toLine(b.x, b.z)).toBeLessThanOrEqual(6);
    for (let i = 1; i < DRIVE.length; i++)
      for (let t = 0; t <= 1; t += 0.1) {
        const x = Math.floor(DRIVE[i - 1][0] + t * (DRIVE[i][0] - DRIVE[i - 1][0])), z = Math.floor(DRIVE[i - 1][1] + t * (DRIVE[i][1] - DRIVE[i - 1][1]));
        if (nearGarage(x, z) || z < TERRAIN.z0 + 2) continue;
        expect(at(x, hm.at(x, z), z)?.kind, `${x},${z}`).toBe('tile');
      }
    // the garage on OSM's way 1490862339, at least 8 ft below the plinth
    let hit = 0, osm = 0;
    const mine = new Set(GARAGE_CELLS.map(([x, z]) => `${x},${z}`));
    for (let z = -120; z < -60; z++) for (let x = 190; x < 250; x++) { const o = inPoly(x + 0.5, z + 0.5, GARAGE_RING); if (o) osm++; if (o && mine.has(`${x},${z}`)) hit++; }
    expect(hit / (osm + mine.size - hit)).toBeGreaterThanOrEqual(0.7);
    expect(ft(GARAGE_Y)).toBeLessThanOrEqual(ft(Y.LAWN) - 8);
    for (const [x, z] of GARAGE_CELLS) expect(at(x, GARAGE_Y, z)?.phase).toBe(P.FOUNDATION);
  });

  it('A12: forest scenery, no city; the other houses untouched', async () => {
    expect(H.scenery).toEqual({ forest: true, city: false });
    const { GLASS_HOUSE } = await import('../src/houses/glass-house/definition');
    expect(GLASS_HOUSE.scenery?.forest).toBe(true);
    expect(GLASS_HOUSE.slug).not.toBe(H.slug);
  });

  it('A13: deterministic, inside its grid, no overlaps; every phase used; about 2½ minutes', () => {
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

  it('A15: the home card is live, with the real piece count, its credits and the disclaimer; no visitor text says "brick"', async () => {
    const { HOUSES } = await import('../src/houses');
    const c = HOUSES.find((h) => h.slug === 'gropius-house')!;
    expect(c.status).toBe('live');
    expect(c.pieces).toBe(bricks.length);
    expect(c.affiliations).toEqual(['Historic New England']);
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with Historic New England.');
    expect(c.wikidata).toBe('Q4179781');
    expect(c.sources?.some((s) => /National Historic Landmark/.test(s))).toBe(true);
    expect(c.sources?.some((s) => /Historic American Buildings Survey/.test(s))).toBe(true);
    const visitor = [
      ...Object.values(H.text).flat(), ...PHASES.map((p) => p.name), ...Object.values(H.views).map((v) => v.label),
      c.title, c.blurb, ...(c.sources ?? []), readFileSync('gropius-house/index.html', 'utf8'),
    ].join('\n');
    expect(visitor).not.toMatch(/brick/i);
  });
});
