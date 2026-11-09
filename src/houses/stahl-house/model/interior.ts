import { C } from '@/engine/catalog';
import { P } from '@/houses/stahl-house/phases';
import { Builder } from '@/engine/voxel';
import { Y } from '@/houses/stahl-house/model/layout';

const F = Y.FLOOR;

/** `y0`: where the legs stand: the floor, or the top of a rug (spec 012: on the rug the legs used to be silently dropped) */
function chair(b: Builder, x: number, z: number, facing: 'n' | 's' | 'e' | 'w', color: number, y0 = F) {
  b.newGroup();
  for (const [lx, lz] of [[x, z], [x + 1, z], [x, z + 1], [x + 1, z + 1]]) b.add(lx, lz, y0, 1, 1, F + 6 - y0, C.steel, 'bar');
  b.add(x, z, F + 6, 2, 2, 1, color, 'tile');
  const back: Record<string, [number, number, number, number]> = {
    n: [x, z + 1, 2, 1], s: [x, z, 2, 1], e: [x, z, 1, 2], w: [x + 1, z, 1, 2],
  };
  const [bx, bz, bw, bd] = back[facing];
  b.add(bx, bz, F + 7, bw, bd, 5, color, 'tile');
}

function bed(b: Builder, x: number, z: number, w: number, d: number, cover: number, headAtX0 = true) {
  b.newGroup();
  b.box(x, z, x + w, z + d, F, F + 2, { kind: 'brick', unit: 2, color: C.darkWood });
  b.box(x, z, x + w, z + d, F + 2, F + 4, { kind: 'plate', unit: 2, color: C.white });
  b.box(x, z, x + w, z + d, F + 4, F + 5, {
    kind: 'tile',
    color: (xx) => (headAtX0 ? xx < x + 2 : xx >= x + w - 2) ? C.white : cover,
  });
  const hx = headAtX0 ? x : x + w - 1;
  b.add(hx, z, F + 5, 1, d, 6, C.wood, 'tile');
}

function plant(b: Builder, x: number, z: number, y = F, big = false) {
  b.newGroup();
  b.add(x, z, y, 2, 2, 3, C.white, 'brick', { studs: false });
  b.add(x, z, y + 3, 2, 2, 1, C.dirt, 'plate', { studs: false });
  const leaves = big ? 6 : 3;
  // leaves spiral around the pot, so each one shares a face with the one below it (spec 012: none float)
  const around = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (let i = 0; i < leaves; i++) {
    const [ox, oz] = around[i % 4];
    b.add(x + ox, z + oz, y + 4 + i * 2, 1, 1, 3, i % 2 ? C.brightGreen : C.green, 'round');
  }
}

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);

  // ---------------- Kitchen (west end of the living wing) ----------------
  // freestanding counter island with cooktop
  b.newGroup();
  b.box(23, 35, 33, 37, F, F + 7, { kind: 'brick', color: (x) => (x % 3 === 0 ? C.darkWood : C.wood) });
  b.box(23, 35, 33, 37, F + 7, F + 8, {
    kind: 'tile',
    color: (x) => (x >= 26 && x < 30 ? C.black : C.white),
  });
  // second counter with double sink
  b.newGroup();
  b.box(23, 41, 33, 43, F, F + 7, { kind: 'brick', color: (x) => (x % 3 === 0 ? C.darkWood : C.wood) });
  b.box(23, 41, 33, 43, F + 7, F + 8, {
    kind: 'tile',
    color: (x) => (x === 27 || x === 29 ? C.lightGray : C.white),
  });
  b.add(28, 42, F + 8, 1, 1, 3, C.lightGray, 'bar'); // faucet
  // suspended aluminium & wood cabinets over the island
  // (ceiling-hung: built with the roof deck, see spec 002)
  b.hanging(P.ROOF, () => {
    for (const x of [24, 32]) b.add(x, 36, 22, 1, 1, 7, C.lightGray, 'bar');
    b.box(23, 35, 33, 37, 17, 22, { kind: 'brick', unit: 5, color: (x) => (x % 2 ? C.lightGray : C.wood) });
  });
  // pink GE appliances
  b.newGroup();
  b.box(20, 44, 23, 47, F, F + 18, { kind: 'brick', color: C.pink });
  b.add(20, 47, F, 3, 2, 9, C.pink, 'brick');
  b.add(20, 47, F + 9, 3, 2, 1, C.black, 'tile');
  // tall pantry cabinets along the corner wall
  b.box(20, 38, 22, 44, F, F + 21, { kind: 'brick', color: C.wood });
  // illuminated plastic ceiling with three spherical lamps
  // (ceiling-hung: built with the roof deck, see spec 002)
  b.hanging(P.ROOF, () => {
    b.box(21, 32, 30, 48, Y.BEAM_TOP - 1, Y.BEAM_TOP, { kind: 'light', color: C.warmLight });
    for (const x of [23, 27, 31]) {
      b.add(x, 42, 22, 1, 1, 6, C.black, 'bar');
      b.add(x, 42, 19, 1, 1, 3, C.warmLight, 'lamp');
    }
  });

  // ---------------- Dining ----------------
  b.newGroup();
  for (const [x, z] of [[37, 37], [42, 37], [37, 41], [42, 41]]) b.add(x, z, F, 1, 1, 6, C.steel, 'bar');
  b.box(36, 36, 44, 43, F + 6, F + 7, { kind: 'plate', color: C.white });
  b.box(36, 36, 44, 43, F + 7, F + 8, { kind: 'tile', color: C.white });
  for (const x of [36.5, 39.5, 42.5].map(Math.floor)) {
    chair(b, x, 33, 's', x === 39 ? C.orange : C.white);
    chair(b, x, 44, 'n', x === 39 ? C.orange : C.white);
  }
  // low credenza along the view glass
  b.newGroup();
  b.box(34, 47, 46, 49, F, F + 5, { kind: 'brick', unit: 5, color: (x) => (x % 4 === 0 ? C.darkWood : C.wood) });
  b.add(36, 47, F + 5, 2, 2, 3, C.orange, 'round');
  b.add(43, 47, F + 5, 1, 1, 6, C.white, 'round');

  // ---------------- Living room (cantilevered end) ----------------
  // freestanding fireplace: hearth, firebox, hood and flue to the ceiling
  b.newGroup();
  b.box(47, 36, 52, 41, F, F + 2, { kind: 'plate', unit: 2, color: C.darkGray });
  b.newGroup();
  b.box(48, 37, 51, 40, F + 2, F + 3, { kind: 'tile', color: C.black });
  b.add(49, 38, F + 3, 1, 1, 2, C.fire, 'light');
  b.add(48, 37, F + 3, 1, 3, 6, C.white, 'brick', { studs: false });
  b.add(50, 37, F + 3, 1, 3, 6, C.white, 'brick', { studs: false });
  b.add(49, 37, F + 3, 1, 1, 6, C.black, 'brick', { studs: false });
  b.newGroup();
  b.box(47, 36, 52, 41, F + 9, F + 15, { kind: 'brick', color: C.white });
  b.box(48, 37, 51, 40, F + 15, Y.BEAM_TOP, { kind: 'brick', color: C.white });

  // rug
  b.newGroup();
  b.box(53, 33, 67, 46, F, F + 1, {
    kind: 'tile',
    color: (x, _y, z) => (x === 53 || x === 66 || z === 33 || z === 45 ? C.darkTan : C.tan),
  });
  // long low sofa with its back to the pool, facing the view
  b.newGroup();
  b.box(54, 32, 66, 35, F, F + 3, { kind: 'brick', color: C.black });
  b.box(54, 32, 66, 33, F + 3, F + 8, { kind: 'brick', unit: 5, color: C.black });
  b.box(54, 33, 55, 35, F + 3, F + 5, { kind: 'brick', unit: 2, color: C.black });
  b.box(65, 33, 66, 35, F + 3, F + 5, { kind: 'brick', unit: 2, color: C.black });
  b.box(55, 33, 65, 35, F + 3, F + 4, {
    kind: 'tile',
    color: (x) => ((x - 55) % 4 === 3 ? C.offWhite : C.white),
  });
  b.add(56, 33, F + 4, 2, 1, 2, C.orange, 'tile');
  b.add(62, 33, F + 4, 2, 1, 2, C.teal, 'tile');
  // coffee table
  b.newGroup();
  for (const [x, z] of [[56, 38], [62, 38], [56, 40], [62, 40]]) b.add(x, z, F + 1, 1, 1, 3, C.steel, 'bar');
  b.box(56, 38, 63, 41, F + 4, F + 5, { kind: 'tile', color: C.darkWood });
  b.add(58, 39, F + 5, 1, 1, 1, C.orange, 'tile');
  b.add(60, 39, F + 5, 2, 1, 2, C.white, 'tile');
  // two armchairs facing the sofa
  chair(b, 55, 43, 'n', C.teal, F + 1); // on the rug
  chair(b, 61, 43, 'n', C.teal, F + 1);
  // lounge chair & ottoman by the corner glass
  b.newGroup();
  b.box(65, 39, 68, 42, F, F + 2, { kind: 'plate', unit: 2, color: C.reddishBrown });
  b.box(65, 39, 68, 42, F + 2, F + 4, { kind: 'brick', unit: 2, color: C.black });
  b.box(67, 39, 68, 42, F + 4, F + 10, { kind: 'brick', unit: 6, color: C.black });
  b.box(65, 44, 67, 46, F, F + 3, { kind: 'brick', color: C.black });
  // floor lamp, at the end of the sofa (spec 012: it used to stand inside the sofa, so only its shade was placed)
  b.newGroup();
  b.add(66, 32, F, 1, 1, 3, C.black, 'round');
  b.add(66, 32, F + 3, 1, 1, 12, C.steel, 'bar');
  b.add(66, 32, F + 15, 1, 1, 3, C.warmLight, 'lamp');
  // hi-fi cabinet & plants
  b.newGroup();
  b.box(58, 47, 66, 49, F, F + 4, { kind: 'brick', unit: 4, color: C.darkWood });
  b.add(59, 47, F + 4, 2, 2, 1, C.black, 'tile');
  plant(b, 67, 47, F, true);
  plant(b, 46, 31, F, true);

  // ---------------- Master bedroom ----------------
  bed(b, 1, 17, 7, 6, C.sandBlue);
  b.newGroup();
  b.box(1, 14, 3, 16, F, F + 5, { kind: 'brick', unit: 5, color: C.wood });
  b.box(1, 24, 3, 26, F, F + 5, { kind: 'brick', unit: 5, color: C.wood });
  b.add(1, 14, F + 5, 1, 1, 3, C.warmLight, 'lamp');
  b.add(1, 25, F + 5, 1, 1, 3, C.warmLight, 'lamp');
  // built-in wardrobe along the partition
  b.newGroup();
  b.box(1, 11, 12, 13, F, Y.WALL_TOP - 3, { kind: 'brick', color: (x) => (x % 3 === 0 ? C.darkWood : C.wood) });
  // writing desk by the glass
  b.newGroup();
  b.box(15, 22, 18, 27, F + 7, F + 8, { kind: 'tile', color: C.white });
  b.add(15, 22, F, 1, 1, 7, C.steel, 'bar');
  b.add(15, 26, F, 1, 1, 7, C.steel, 'bar');
  b.add(17, 22, F, 1, 1, 7, C.steel, 'bar');
  b.add(17, 26, F, 1, 1, 7, C.steel, 'bar');
  chair(b, 13, 23, 'e', C.white);

  // ---------------- Children's room (two sleeping areas) ----------------
  bed(b, 1, 2, 5, 6, C.yellow);
  bed(b, 1, -8, 5, 6, C.red);
  b.newGroup();
  b.box(10, 1, 13, 4, F, F + 3, { kind: 'brick', color: C.red });
  b.add(10, 1, F + 3, 2, 2, 3, C.yellow, 'brick');
  b.add(12, 3, F + 3, 1, 1, 3, C.darkBlue, 'brick');
  b.box(13, -9, 18, -7, F, F + 12, { kind: 'brick', color: C.wood });
  b.add(14, -9, F + 12, 2, 2, 3, C.red, 'brick');
  b.add(16, -9, F + 12, 1, 2, 3, C.yellow, 'brick');

  // ---------------- Dressing room & master bath (service corner) ----------------
  b.newGroup();
  b.box(1, 31, 3, 40, F, Y.WALL_TOP - 3, { kind: 'brick', color: (_x, _y, z) => (z % 3 === 0 ? C.darkWood : C.wood) });
  b.box(8, 37, 13, 39, F, F + 7, { kind: 'brick', color: C.white });
  b.box(8, 37, 13, 39, F + 7, F + 8, { kind: 'tile', color: C.white });
  // the mirror hangs on the dressing-room partition, so it goes in with the walls (spec 012)
  b.setPhase(P.ENVELOPE);
  b.box(8, 39, 13, 40, F + 10, F + 20, { kind: 'glass', unit: 10, color: C.glass });
  b.setPhase(P.INTERIOR);
  b.newGroup();
  // double sink vanity
  b.box(13, 41, 19, 43, F, F + 7, { kind: 'brick', color: C.white });
  b.box(13, 41, 19, 43, F + 7, F + 8, { kind: 'tile', color: (x) => (x === 14 || x === 17 ? C.lightGray : C.white) });
  b.setPhase(P.ENVELOPE); // mirror on the partition (spec 012)
  b.box(13, 41, 19, 42, F + 10, F + 20, { kind: 'glass', unit: 10, color: C.glass });
  b.setPhase(P.INTERIOR);
  // WC
  b.newGroup();
  b.add(11, 47, F, 2, 2, 4, C.white, 'round');
  b.add(11, 48, F + 4, 2, 1, 4, C.white, 'brick', { studs: false });
  // sunken shower: floor drain & shower head
  b.newGroup();
  b.add(3, 47, F, 1, 1, 1, C.lightGray, 'tile');
  b.setPhase(P.ENVELOPE); // the shower head is on the street wall (spec 012)
  b.add(1, 47, 18, 1, 1, 3, C.lightGray, 'bar');
  b.setPhase(P.INTERIOR);
  // light fixtures in the ceiling: they hang from the roof deck, so they go in with it (spec 012, as spec 002)
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[8, 15], [8, 4], [8, -5], [5, 35], [14, 45], [56, 40], [43, 39]])
      b.add(x, z, Y.BEAM_TOP - 1, 2, 2, 1, C.warmLight, 'light');
  });
}
