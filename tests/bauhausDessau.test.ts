// Spec: specs/076-bauhaus-dessau.md
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inPoly } from '../src/engine/lot';
import { parseNeighborhood, sampleGrid } from '../src/engine/scene/neighborhoodData';
import { realToModelDir } from '../src/engine/scene/sun';
import { PLATE } from '../src/engine/catalog';
import { sequence } from '../src/engine/sequencer';
import { BAUHAUS_DESSAU as H } from '../src/houses/bauhaus-dessau/definition';
import { GRID } from '../src/houses/bauhaus-dessau/model/bauhaus';
import {
  AULA, BRIDGE, BRIDGE_UNDER, CEIL, COLUMNS, DOOR, EAST_X0, EAST_Z, ENT_A, ENT_B, FL, FONT, GLASS_Y0, GLASS_Y1, GROUND_FLOOR, inFootprint,
  inRect, LETTER_ROW, LETTER_Z, letterTop, letterX, LINK, LINK_TOP, NORTH, P_BAYS, P_PARAPET, P_RAIL, P_ROOF, PARAPET, pBalcony, pDoor,
  PFL, PIERS, PRELLER, Rect, ROOF, SOUTH_BALCONY, SOUTH_X, STAGE_TOP, STUB, TOWER, WEST_Z, WORD, WORKSHOP,
} from '../src/houses/bauhaus-dessau/model/layout';
import { BALCONY_FRONT, FRAME, GREY, PLINTH, RED, WHITE } from '../src/houses/bauhaus-dessau/model/house';
import { BENCH_Z, STUDIO } from '../src/houses/bauhaus-dessau/model/interior';
import { exterior } from '../src/houses/bauhaus-dessau/model/shell';
import { TERRAIN } from '../src/houses/bauhaus-dessau/model/site';
import { LOT_PARTS, LOT_SELF } from '../src/houses/bauhaus-dessau/model/lotTerrain';
import { P, PHASES } from '../src/houses/bauhaus-dessau/phases';
import { modelFingerprint } from './fingerprint';

const { builder, heightmap: hm } = H.build();
const bricks = builder.bricks;
const file = readFileSync('public/bauhaus-dessau/neighborhood.bin');
const n = parseNeighborhood(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
const src = (f: string) => readFileSync(`src/houses/bauhaus-dessau/model/${f}`, 'utf8');
const PL = PLATE;
type B = (typeof bricks)[number];
const cells = new Map<number, B>();
const key = (x: number, y: number, z: number) => ((y + 64) * 1024 + (z + 256)) * 1024 + (x + 256);
for (const b of bricks) for (let y = b.y; y < b.y + b.h; y++) for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) cells.set(key(x, y, z), b);
const at = (x: number, y: number, z: number) => cells.get(key(x, y, z));
const bearingOf = (dx: number, dz: number) => {
  let best = 0, err = Infinity;
  for (let b = 0; b < 360; b += 0.1) {
    const [x, z] = realToModelDir(b, H.site.rotationDeg);
    const e = Math.hypot(x - dx / Math.hypot(dx, dz), z - dz / Math.hypot(dx, dz));
    if (e < err) { err = e; best = b; }
  }
  return best;
};
const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
const part = (id: number) => LOT_PARTS.filter((p) => p.id === id);
/** IoU of a set of rectangles with OSM's ring(s), over cells */
function iou(rects: Rect[], rings: [number, number][][]) {
  const xs = [...rects.flatMap((r) => [r[0], r[2]]), ...rings.flat().map((p) => p[0])];
  const zs = [...rects.flatMap((r) => [r[1], r[3]]), ...rings.flat().map((p) => p[1])];
  let inter = 0, union = 0;
  for (let z = Math.floor(Math.min(...zs)) - 1; z <= Math.max(...zs) + 1; z++)
    for (let x = Math.floor(Math.min(...xs)) - 1; x <= Math.max(...xs) + 1; x++) {
      const mine = rects.some((r) => inRect(x, z, r)), osm = rings.some((ring) => inPoly(x + 0.5, z + 0.5, ring));
      if (mine && osm) inter++;
      if (mine || osm) union++;
    }
  return inter / union;
}
const size = (r: Rect) => [r[2] - r[0], r[3] - r[1]];

describe('076: the Bauhaus Dessau', () => {
  it('A1: the whole footprint fits OSM relation 14318571 (IoU ≥ 0.80); the workshop wing\'s long sides within 2° of 337.6°', () => {
    expect(n.anchor.houseIoU).toBeGreaterThanOrEqual(0.8);
    expect(H.site.rotationDeg).toBe(n.anchor.rotationDeg);
    expect(LOT_SELF.length).toBe(1);
    expect(iou([NORTH, BRIDGE, WORKSHOP, ENT_A, ENT_B, STUB, LINK, PRELLER], LOT_SELF)).toBeGreaterThanOrEqual(0.8);
    // the long sides run along x; −x is the north end
    expect(angleDiff(bearingOf(-1, 0), 337.6)).toBeLessThanOrEqual(2);
  });

  it('A2: each part fits its OSM part relation (IoU ≥ 0.70), its plan within 2 ft of OSM\'s', () => {
    const cases: [number, Rect[], [number, number] | null][] = [
      [14318568, [WORKSHOP, ENT_A, ENT_B, STUB], null],
      [14318566, [NORTH], [64, 124]],
      [14318569, [LINK], [52, 80]],
      [14318570, [PRELLER], [63, 37]],
      [14318567, [BRIDGE], null],
    ];
    for (const [id, rects, plan] of cases) {
      const rings = part(id).map((p) => p.pts);
      expect(rings.length, `${id}`).toBeGreaterThan(0);
      expect(iou(rects, rings), `${id}`).toBeGreaterThanOrEqual(0.7);
      if (plan) { expect(Math.abs(size(rects[0])[0] - plan[0])).toBeLessThanOrEqual(2); expect(Math.abs(size(rects[0])[1] - plan[1])).toBeLessThanOrEqual(2); }
    }
    // the workshop wing's main block 54 × 158 ft; the bridge 31 ft wide
    expect(Math.abs(size(WORKSHOP)[0] - 158)).toBeLessThanOrEqual(2);
    expect(Math.abs(size(WORKSHOP)[1] - 54)).toBeLessThanOrEqual(2);
    expect(Math.abs(size(BRIDGE)[1] - 31)).toBeLessThanOrEqual(2);
  });

  it('A3: the storeys and the heights; the Prellerhaus\'s roof the highest, the link\'s the lowest', () => {
    const slab = (x: number, y: number, z: number) => at(x, y, z)?.kind === 'plate' && [P.FLOOR, P.STRUCTURE].includes(at(x, y, z)!.phase);
    // three storeys over the plinth in the workshop wing and the north wing: the ground floor, two slabs, the roof
    for (const [x, z] of [[230, 185], [30, 180]]) {
      expect(slab(x, GROUND_FLOOR - 1, z), `${x},${z} ground`).toBe(true);
      for (const l of [1, 2]) expect(slab(x, FL(l) - 1, z), `${x},${z} floor ${l}`).toBe(true);
      expect(at(x, ROOF, z)?.phase).toBe(P.ROOF);
    }
    // two in the bridge, at the workshop wing's first and second upper floors, nothing under it but air
    expect(slab(100, FL(1) - 1, 120)).toBe(true);
    expect(slab(100, FL(2) - 1, 120)).toBe(true);
    expect(at(100, ROOF, 120)?.phase).toBe(P.ROOF);
    for (let y = 0; y < BRIDGE_UNDER; y++) expect(at(100, y, 120)).toBeUndefined();
    // one in the link: no slab between its floor and its roof
    for (let y = GROUND_FLOOR; y < 48; y++) expect(slab(170, y, 50), `link ${y}`).toBe(false);
    expect(at(170, 48, 50)?.phase).toBe(P.ROOF);
    // five over the plinth in the Prellerhaus
    for (const l of [1, 2, 3, 4]) expect(slab(180, PFL(l) - 1, 18), `preller ${l}`).toBe(true);
    expect(at(180, P_ROOF, 18)?.phase).toBe(P.ROOF);
    // heights (spec 076 "Heights at the site's scale", within one plate)
    const near = (plates: number, ft: number) => expect(Math.abs(plates - ft / PL)).toBeLessThanOrEqual(1);
    near(GROUND_FLOOR, 5); near(FL(1) - FL(0), 14.4); near(PARAPET, 50); near(BRIDGE_UNDER, 19); near(PFL(1) - PFL(0), 10); near(P_PARAPET, 57);
    near(LINK_TOP, 20); near(STAGE_TOP, 28);
    const tops = { workshop: PARAPET, north: PARAPET, bridge: PARAPET, link: LINK_TOP, preller: P_PARAPET };
    expect(Math.max(...Object.values(tops))).toBe(tops.preller);
    expect(Math.min(...Object.values(tops))).toBe(tops.link);
    // and the pieces reach them
    expect(at(30, PARAPET - 1, NORTH[1])?.color).toBe(WHITE);
    expect(at(PRELLER[0], P_PARAPET - 1, 10)?.color).toBe(WHITE);
    expect(at(PRELLER[0], P_PARAPET, 10)).toBeUndefined();
  });

  it('A4: the bridge spans Bauhausstraße on four piers at OSM\'s, ≥ 14 ft clear, nothing else beneath it', () => {
    const street = part(239651885)[0];
    expect(street).toBeDefined();
    for (const [x] of street.pts) { expect(x).toBeGreaterThan(BRIDGE[0]); expect(x).toBeLessThan(BRIDGE[2]); }
    const zs = street.pts.map((p) => p[1]);
    expect(Math.min(...zs)).toBeLessThanOrEqual(BRIDGE[1] + 1);
    expect(Math.max(...zs)).toBeGreaterThanOrEqual(BRIDGE[3] - 1);
    const centre = (pts: [number, number][]) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    expect(PIERS.length).toBe(4);
    for (const id of [473496075, 473496076, 473496077, 473496078]) {
      const [cx, cz] = centre(part(id)[0].pts);
      const d = Math.min(...PIERS.map((r) => Math.hypot((r[0] + r[2]) / 2 - cx, (r[1] + r[3]) / 2 - cz)));
      expect(d, `${id}`).toBeLessThanOrEqual(2);
    }
    expect(BRIDGE_UNDER * PL).toBeGreaterThanOrEqual(14);
    // the street's line passes between the piers
    const sx = street.pts[0][0];
    expect(PIERS.filter((r) => r[2] <= sx).length).toBe(2);
    expect(PIERS.filter((r) => r[0] >= sx).length).toBe(2);
    const stray: string[] = [];
    for (let z = BRIDGE[1]; z < BRIDGE[3]; z++)
      for (let x = BRIDGE[0]; x < BRIDGE[2]; x++)
        for (let y = 0; y < BRIDGE_UNDER; y++) {
          const b = at(x, y, z);
          if (b && !PIERS.some((r) => inRect(x, z, r))) stray.push(`${x},${y},${z}`);
        }
    expect(stray.slice(0, 10)).toEqual([]);
    for (const r of PIERS) expect(at(r[0], BRIDGE_UNDER - 1, r[1])?.phase).toBe(P.STRUCTURE);
    expect(at(100, BRIDGE_UNDER, 130)?.phase).toBe(P.STRUCTURE);
  });

  it('A5: the curtain wall: unbroken glass on three fronts, nothing in its plane; the columns ≥ 2 ft behind it, with flared heads', () => {
    const fronts: [string, [number, number][]][] = [
      ['west', Array.from({ length: WORKSHOP[2] - WORKSHOP[0] }, (_, i) => [WORKSHOP[0] + i, WEST_Z])],
      ['south', Array.from({ length: WORKSHOP[3] - WORKSHOP[1] }, (_, i) => [SOUTH_X, WORKSHOP[1] + i])],
      ['east', Array.from({ length: WORKSHOP[2] - EAST_X0 }, (_, i) => [EAST_X0 + i, EAST_Z])],
    ];
    for (const [name, line] of fronts) {
      let glass = 0;
      for (const [x, z] of line) {
        // the white band under it, the roof's band over it
        expect(at(x, GLASS_Y0 - 1, z)?.color, `${name} ${x},${z} band`).toBe(WHITE);
        expect(at(x, GLASS_Y1, z)?.color, `${name} ${x},${z} roof band`).toBe(WHITE);
        for (let y = GLASS_Y0; y < GLASS_Y1; y++) {
          const b = at(x, y, z);
          expect(b?.phase, `${name} ${x},${y},${z}`).toBe(P.ENVELOPE);
          expect(b!.kind === 'glass' || b!.color === FRAME, `${name} ${x},${y},${z}`).toBe(true);
          if (b!.kind === 'glass') glass++;
        }
      }
      expect(glass / (line.length * (GLASS_Y1 - GLASS_Y0)), name).toBeGreaterThan(0.6);
    }
    // within 2 ft behind the glass, nothing of the frame on any storey but the slabs' edges
    const near: string[] = [];
    for (let l = 0; l < 3; l++)
      for (let y = Math.max(FL(l), GLASS_Y0); y < CEIL(l); y++) {
        for (let x = WORKSHOP[0]; x < SOUTH_X; x++) for (const z of [WEST_Z - 1, WEST_Z - 2]) if (at(x, y, z)?.phase === P.STRUCTURE && !exterior(x, z, y)) near.push(`${x},${y},${z}`);
        for (let z = WORKSHOP[1] + 1; z < WEST_Z; z++) for (const x of [SOUTH_X - 1, SOUTH_X - 2]) if (at(x, y, z)?.phase === P.STRUCTURE) near.push(`${x},${y},${z}`);
        for (let x = EAST_X0; x < SOUTH_X; x++) for (const z of [EAST_Z + 1, EAST_Z + 2]) if (at(x, y, z)?.phase === P.STRUCTURE) near.push(`${x},${y},${z}`);
      }
    expect(near.slice(0, 10)).toEqual([]);
    // the columns: 2 × 2, their outer faces ≥ 2 ft in, flared at the head
    const outer = COLUMNS.filter(([x, z]) => z + 2 >= WEST_Z - 3 || x + 2 >= SOUTH_X - 3 || (z <= EAST_Z + 4 && x >= EAST_X0));
    expect(outer.length).toBeGreaterThan(15);
    for (const [x, z] of COLUMNS) {
      expect(WEST_Z - (z + 2)).toBeGreaterThanOrEqual(2);
      expect(SOUTH_X - (x + 2)).toBeGreaterThanOrEqual(2);
      if (x >= EAST_X0) expect(z - (EAST_Z + 1)).toBeGreaterThanOrEqual(2);
      for (let l = 0; l < 3; l++) {
        const mid = FL(l) + 10, head = CEIL(l) - 1;
        expect(at(x, mid, z)?.phase, `column ${x},${z} storey ${l}`).toBe(P.STRUCTURE);
        expect(at(x - 1, mid, z - 1)).toBeUndefined();
        expect(at(x - 1, head, z - 1)?.phase, `head ${x},${z} storey ${l}`).toBe(P.STRUCTURE);
        expect(at(x + 2, head, z + 2)?.phase).toBe(P.STRUCTURE);
      }
    }
  });

  it('A6: the Prellerhaus: 4 × 4 small balconies in the windows\' right thirds; none and two round windows below; the south balconies; the railing', () => {
    let balconies = 0;
    for (let l = 1; l <= 4; l++)
      for (const b0 of P_BAYS) {
        const r = pBalcony(b0), y = PFL(l);
        const slab = at(r[0], y - 1, r[1]);
        expect(slab?.phase, `balcony ${l} ${b0}`).toBe(P.ENVELOPE);
        expect(at(r[0] + 2, y + 1, r[1])?.color).toBe(BALCONY_FRONT);
        expect(at(r[0], y + 6, r[1])?.kind).toBe('bar');
        // in front of the door, the window's right third (from the lawn, right is −x)
        const [d0, d1] = pDoor(b0);
        expect(r[0]).toBeLessThanOrEqual(d0);
        expect(r[2]).toBeGreaterThanOrEqual(d1);
        expect(r[2] - r[0]).toBeLessThanOrEqual(8);
        for (let x = d0; x < d1; x++) expect(at(x, y + 10, 0)?.phase, `door ${l} ${x}`).toBe(P.ENVELOPE);
        balconies++;
      }
    expect(balconies).toBe(16);
    // nothing else projects from the east front
    const out = new Set<string>();
    for (const b of bricks) if (b.z < 0 && b.phase >= P.FOUNDATION && b.phase <= P.ROOF && b.x >= PRELLER[0] - 1 && b.x < PRELLER[2] + 1) out.add(`${Math.floor((b.y + 1 - GROUND_FLOOR) / 25)}`);
    expect([...out].sort()).toEqual(['1', '2', '3', '4']);
    // the ground floor's two round windows
    const round = bricks.filter((b) => b.kind === 'glass' && b.z === 0 && b.y >= PFL(0) && b.y < PFL(1) - 1 && b.x >= PRELLER[0] && b.x < PRELLER[2]);
    const xs = [...new Set(round.map((b) => b.x))].sort((a, c) => a - c);
    let clusters = xs.length ? 1 : 0;
    for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > 1) clusters++;
    expect(clusters).toBe(2);
    // the wide south balconies
    for (let l = 1; l <= 4; l++) {
      const s = SOUTH_BALCONY;
      expect(s[3] - s[1]).toBeGreaterThanOrEqual(20);
      expect(at(s[0] + 2, PFL(l) - 1, s[1] + 10)?.color, `south ${l}`).toBe(WHITE);
    }
    expect(bricks.filter((b) => b.x >= PRELLER[2] && b.y < PFL(1) - 2 && b.phase === P.ENVELOPE && b.z < PRELLER[3]).length).toBe(0);
    // the roof terrace's railing all round
    for (let x = PRELLER[0]; x < PRELLER[2]; x++) for (const z of [PRELLER[1], PRELLER[3] - 1]) expect(at(x, P_RAIL - 1, z)?.phase, `rail ${x},${z}`).toBe(P.ROOF);
    for (let z = PRELLER[1]; z < PRELLER[3]; z++) for (const x of [PRELLER[0], PRELLER[2] - 1]) expect(at(x, P_RAIL - 1, z)?.phase, `rail ${x},${z}`).toBe(P.ROOF);
  });

  it('A7: the colours: one white render, a dark grey plinth, near-black frames, red doors; BAUHAUS down the grey tower', () => {
    const house = bricks.filter((b) => b.phase >= P.FOUNDATION && b.phase <= P.ROOF);
    // the outer walls: white, grey only on the tower
    const walls = house.filter((b) => b.phase === P.STRUCTURE && b.kind === 'brick' && exterior(b.x, b.z, b.y) && b.y >= GROUND_FLOOR && inFootprint(b.x, b.z));
    expect(walls.length).toBeGreaterThan(500);
    for (const b of walls) expect(b.color, `${b.x},${b.y},${b.z}`).toBe(inRect(b.x, b.z, TOWER) ? GREY : WHITE);
    expect(walls.filter((b) => b.color === GREY).length).toBeGreaterThan(5);
    // the plinth
    const plinth = house.filter((b) => b.phase === P.FOUNDATION);
    expect(plinth.length).toBeGreaterThan(50);
    for (const b of plinth) expect(b.color).toBe(PLINTH);
    // every frame and mullion one near-black
    const frames = house.filter((b) => b.phase === P.ENVELOPE && b.kind !== 'glass' && b.y >= GLASS_Y0 && b.y < GLASS_Y1 && b.z === WEST_Z);
    expect(frames.length).toBeGreaterThan(50);
    for (const b of frames) expect(b.color).toBe(FRAME);
    // the red door
    for (let x = DOOR.x0; x < DOOR.x1; x++) for (let y = DOOR.y0; y < DOOR.y1; y += 5) expect(at(x, y, DOOR.z)?.color).toBe(RED);
    // the letters, read back off the tower's east face
    expect(WORD).toBe('BAUHAUS');
    [...WORD].forEach((ch, i) =>
      FONT[ch].forEach((row, r) =>
        [...row].forEach((px, c) => {
          const b = at(letterX(c), letterTop(i) - r * LETTER_ROW - 1, LETTER_Z);
          if (px === '#') expect(b?.color, `${ch} ${r},${c}`).toBe(WHITE);
          else expect(b, `${ch} ${r},${c}`).toBeUndefined();
        })));
    // on the grey: the wall behind each letter is the tower
    for (let i = 0; i < 7; i++) expect(at(letterX(1), letterTop(i) - 1, LETTER_Z + 1)?.color).toBe(GREY);
    // reading from the east (facing +z), left is +x: the B's spine is on the left
    expect(letterX(0)).toBeGreaterThan(letterX(3));
    expect(angleDiff(bearingOf(0, -1), 67.8)).toBeLessThanOrEqual(2);
  });

  it('A8: inside: the Aula\'s seats face the stage, its lamps hang from the roof; benches on every workshop floor; a studio furnished', () => {
    const seats = bricks.filter((b) => b.phase === P.INTERIOR && b.kind === 'brick' && b.h === 4 && inRect(b.x, b.z, AULA) && b.y === GROUND_FLOOR);
    const rows = new Set(seats.map((b) => b.z));
    expect(rows.size).toBeGreaterThanOrEqual(4);
    expect(seats.length).toBeGreaterThanOrEqual(80);
    // each seat's back is behind it (+z), so it faces the stage (−z)
    for (const s of seats) expect(at(s.x, s.y + 6, s.z + 1)?.kind).toBe('bar');
    const lamps = bricks.filter((b) => b.kind === 'light' && inRect(b.x, b.z, AULA));
    expect(lamps.length).toBeGreaterThan(6);
    for (const l of lamps) { expect(l.hangs).toBe(true); expect(l.phase).toBe(P.ROOF); }
    for (let l = 0; l < 3; l++) {
      const benches = bricks.filter((b) => b.phase === P.INTERIOR && b.y === FL(l) && inRect(b.x, b.z, WORKSHOP) && BENCH_Z.includes(b.z) && b.w === 8);
      expect(benches.length, `floor ${l}`).toBeGreaterThanOrEqual(6);
    }
    const studio = bricks.filter((b) => b.phase === P.INTERIOR && b.y === PFL(STUDIO.l) && b.x >= STUDIO.x0 && b.x < STUDIO.x1 && b.z >= STUDIO.z0 && b.z < STUDIO.z1);
    expect(studio.length).toBeGreaterThanOrEqual(3);
  });

  it('A9: deterministic, inside its grid, no overlaps; every phase used; about 3 minutes', () => {
    expect(modelFingerprint(H.build().builder.bricks)).toEqual(modelFingerprint(bricks));
    const outside = bricks.filter((b) => b.x < GRID.x0 || b.x + b.w > GRID.x0 + GRID.nx || b.z < GRID.z0 || b.z + b.d > GRID.z0 + GRID.nz || b.y < GRID.y0 || b.y + b.h > GRID.y0 + GRID.ny);
    expect(outside.length).toBe(0);
    let volume = 0;
    for (const b of bricks) volume += b.w * b.d * b.h;
    expect(cells.size).toBe(volume);
    const s = sequence(bricks, PHASES, H.center);
    expect(new Set(bricks.map((b) => b.phase)).size).toBe(PHASES.length);
    expect(s.total).toBeGreaterThan(165);
    expect(s.total).toBeLessThan(200);
  }, 120_000);

  it('A11: everything marked with its source; at least 10 marks in the interior; every height marked', () => {
    for (const f of ['house.ts', 'layout.ts', 'shell.ts', 'interior.ts', 'site.ts', 'landscape.ts']) expect(src(f)).toMatch(/\[(documented|scaled|assumed)/);
    expect((src('interior.ts').match(/\[(documented|scaled|assumed)/g) ?? []).length).toBeGreaterThanOrEqual(10);
    // the heights: no section was found (Q4), so each is scaled or assumed
    const heights = src('layout.ts').split('// ---------- heights')[1].split('// ----------')[0];
    for (const block of heights.split('/**').slice(1)) expect(block, block.slice(0, 80)).toMatch(/\[(scaled|assumed)/);
  });

  it('A12: the budget: ≤ 50,000 pieces, ≤ 30,000 in the building; the grid ≤ 40 MB', () => {
    expect(bricks.length).toBeLessThanOrEqual(50_000);
    const building = bricks.filter((b) => b.phase >= P.FOUNDATION && b.phase <= P.ROOF).length;
    expect(building).toBeLessThanOrEqual(30_000);
    expect((GRID.nx * GRID.nz * GRID.ny) / 2).toBeLessThanOrEqual(40 * 1024 * 1024);
  });

  it('A13: the data settings fit by fit.osmRelations [14318571]; the lot and neighbourhood exist', async () => {
    const slug = 'bauhaus-dessau';
    const S = (await import(`../scripts/houses/${slug}.mjs`)).default;
    expect(S.fit.osmRelations).toEqual([14318571]);
    expect(existsSync('public/bauhaus-dessau/neighborhood.bin')).toBe(true);
    expect(existsSync('src/houses/bauhaus-dessau/model/lotTerrain.ts')).toBe(true);
    expect(n.buildings.count).toBeGreaterThan(100);
  });

  it('A14: no other house sets fit.osmRelations', async () => {
    for (const f of readdirSync('scripts/houses')) {
      if (f === 'bauhaus-dessau.mjs') continue;
      const S = (await import(`../scripts/houses/${f}`)).default;
      expect(S.fit.osmRelations, f).toBeUndefined();
      // spec 080: the Centre Pompidou exports its piazza, stacks and neighbours' ways the same way
      if (f !== 'centre-pompidou.mjs') expect(S.exportParts, f).toBeUndefined();
    }
  });

  // A14: regenerating another house gives the same bytes. Needs that house's cached Overpass data (scripts/.cache, not in git).
  const cached = existsSync('scripts/.cache/haus-am-horn-buildings-1200.json') && existsSync('scripts/.cache/haus-am-horn-roads-1200.json');
  it.skipIf(!cached)('A14: regenerating the Haus am Horn gives byte-identical neighborhood.bin and lotTerrain.ts', () => {
    const files = ['public/haus-am-horn/neighborhood.bin', 'src/houses/haus-am-horn/model/lotTerrain.ts'];
    const before = files.map((f) => readFileSync(f));
    execFileSync('node', ['scripts/fetch-neighborhood.mjs', 'haus-am-horn'], { stdio: 'ignore' });
    files.forEach((f, i) => expect(readFileSync(f).equals(before[i]), f).toBe(true));
  }, 120_000);

  it('A15: its shadowReach is 150–250 ft; no other house\'s changed', () => {
    expect(H.shadowReach).toBeGreaterThanOrEqual(150);
    expect(H.shadowReach).toBeLessThanOrEqual(250);
    const reach: Record<string, number> = {};
    for (const d of readdirSync('src/houses')) {
      if (['bauhaus-dessau', 'centre-pompidou'].includes(d) || !existsSync(`src/houses/${d}/definition.ts`)) continue;
      const m = readFileSync(`src/houses/${d}/definition.ts`, 'utf8').match(/shadowReach: (\d+)/);
      if (m) reach[d] = +m[1];
    }
    expect(reach).toEqual({ 'trellick-tower': 300, 'habitat-67': 480, 'salk-institute': 220 }); // spec 079 adds the Salk Institute's
  });

  it('A16: the lot meets the real ground at its edges, and is flat: within 3 ft across the lot inside its 40 ft edge', () => {
    const misses: string[] = [];
    const check = (x: number, z: number) => { if (Math.abs(hm.at(x, z) * PL - sampleGrid(n.near, x, z)) > 3 * PL + 1e-6) misses.push(`${x},${z}`); };
    for (let x = TERRAIN.x0; x < TERRAIN.x1; x++) { check(x, TERRAIN.z0); check(x, TERRAIN.z1 - 1); }
    for (let z = TERRAIN.z0; z < TERRAIN.z1; z++) { check(TERRAIN.x0, z); check(TERRAIN.x1 - 1, z); }
    expect(misses).toEqual([]);
    let lo = Infinity, hi = -Infinity;
    // the lot eases into the real ground over its last 40 ft (the real ground varies about 8 ft across it); inside that, level
    for (let z = TERRAIN.z0 + 40; z < TERRAIN.z1 - 40; z += 2)
      for (let x = TERRAIN.x0 + 40; x < TERRAIN.x1 - 40; x += 2) { lo = Math.min(lo, hm.at(x, z)); hi = Math.max(hi, hm.at(x, z)); }
    expect((hi - lo) * PL).toBeLessThanOrEqual(3);
  });

  it('A17: the terrain has no spikes (spec 010b)', () => {
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

  it('A18: the home card is live, with the real piece count, its credits; the numbers say "school"', async () => {
    const { HOUSES } = await import('../src/houses');
    const { PAGES } = await import('../vite.config');
    const { STATS } = await import('../src/houses/stats');
    const card = HOUSES.find((h) => h.slug === 'bauhaus-dessau');
    expect(card?.status).toBe('live');
    expect(card?.pieces).toBe(STATS['bauhaus-dessau'].pieces);
    expect(card?.pieces).toBe(bricks.length);
    const sources = (card?.sources ?? []).join(' ');
    for (const s of ['OpenStreetMap', 'AWS Terrain Tiles', 'Wikipedia', 'bauhaus-dessau.de', 'Wikimedia Commons']) expect(sources).toContain(s);
    expect(Object.keys(PAGES)).toContain('bauhaus-dessau');
    expect(H.text.noun).toBe('school');
    expect(H.text.disclaimer).toBe('Fan tribute. Not affiliated with the Stiftung Bauhaus Dessau.');
    expect(existsSync('public/bauhaus-dessau/thumbnail.jpg')).toBe(true);
  });

  it('views start in the open: not inside a neighbouring building (as tests/viewsClear.test.ts)', () => {
    const b = n.buildings;
    const inside: string[] = [];
    for (const [name, v] of Object.entries(H.views)) {
      const p = v.view.pos;
      for (let i = 0; i < b.count; i++) {
        if (p.y > b.top[i] + 15) continue;
        const ring: [number, number][] = [];
        for (let k = b.start[i]; k < b.start[i + 1]; k++) ring.push([b.xz[k * 2], b.xz[k * 2 + 1]]);
        if (inPoly(p.x, p.z, ring)) inside.push(name);
      }
    }
    expect(inside).toEqual([]);
  });
});
