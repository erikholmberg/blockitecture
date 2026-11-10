/**
 * The Koshino House's interior (spec 039): the rooms the published plans show, furnished sparely as in the photographs
 * [documented: the rooms; the furniture assumed unless marked]. Each piece says [documented] or [assumed].
 */
import { C } from '@/engine/catalog';
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { BEDROOMS, DINING, Y } from './layout';

const OAK = 0xa88457;
const DARK = 0x3d3a36;
const LINEN = 0xe9e4d6;
const SOFA = 0x2f2e2c; // black leather, as in the photographs of the living room [documented: photographs]
const FUTON = 0xd8d0bd;

export function buildInterior(b: Builder) {
  b.setPhase(P.INTERIOR);
  const F = Y.FLOOR;
  // [documented: photographs] the living room: a long low black sofa facing the tall window, two chairs, a low table
  b.newGroup();
  b.box(36, 41, 50, 44, F, F + 3, { kind: 'brick', color: SOFA });
  b.box(36, 43, 50, 44, F + 3, F + 6, { kind: 'brick', color: SOFA });
  for (const x of [37, 46]) b.box(x, 33, x + 3, 36, F, F + 3, { kind: 'brick', color: SOFA });
  b.box(40, 37, 46, 40, F, F + 2, { kind: 'plate', color: DARK });
  // [assumed] a pale rug under the table
  b.newGroup();
  b.box(35, 36, 51, 41, F, F + 1, { kind: 'tile', color: 0xd9d3c4 });
  // [documented: section, the stair up to the upper floor] solid concrete steps along the living room's end wall
  b.newGroup();
  for (let i = 0; i < 8; i++) b.box(52, 31 + i, 55, 32 + i, F, F + 3 * (i + 1), { kind: 'brick', color: 0xb7b4ad });
  // [documented: plan, "dining"] the dining table and its chairs
  b.newGroup();
  for (const [x, z] of [[57, 34], [63, 34], [57, 38], [63, 38]]) b.add(x, z, F, 1, 1, 6, DARK, 'bar');
  b.add(57, 34, F + 6, 7, 5, 1, OAK, 'plate');
  for (const x of [58, 61]) for (const z of [32, 40]) b.add(x, z, F, 1, 1, 4, OAK, 'brick');
  // [documented: plan, "kitchen"] the kitchen counter along the uphill wall
  b.newGroup();
  b.box(56, 43, 66, 45, F, F + 7, { kind: 'brick', color: 0xe3e0d8 });
  // [documented: section, the main bedroom upstairs] its bed on the upper floor
  b.newGroup();
  const U = Y.UPPER + 2;
  b.box(58, 33, 64, 40, U, U + 2, { kind: 'plate', color: OAK });
  b.box(58, 33, 64, 40, U + 2, U + 3, { kind: 'plate', color: LINEN });
  b.box(DINING[0] + 1, 43, DINING[0] + 3, 45, U, U + 6, { kind: 'brick', color: OAK });
  // [documented: six children's rooms] a futon and a low desk in each
  for (const r of BEDROOMS) {
    b.newGroup();
    b.box(r[0] + 2, r[1] + 1, r[0] + 6, r[1] + 8, F, F + 2, { kind: 'plate', color: FUTON });
    b.box(r[0] + 8, r[1] + 1, r[0] + 11, r[1] + 3, F, F + 5, { kind: 'brick', color: OAK });
  }
  // [documented: the studio, "atelier"] Koshino's long cutting tables under the curved skylight, and a rail of clothes
  b.newGroup();
  b.box(56, 50, 70, 54, F, F + 7, { kind: 'brick', color: OAK });
  b.box(50, 56, 60, 59, F, F + 7, { kind: 'brick', color: OAK });
  b.newGroup();
  for (const x of [46, 54]) b.add(x, 49, F, 1, 1, 15, DARK, 'bar');
  b.box(46, 49, 55, 50, F + 15, F + 16, { kind: 'tile', color: DARK });
}

/** [assumed] lights hung under the roofs, with the roofs */
export function buildLights(b: Builder) {
  b.hanging(P.ROOF, () => {
    for (const [x, z] of [[42, 38], [48, 38]]) b.add(x, z, Y.LIV_ROOF - 4, 2, 1, 1, C.warmLight, 'light');
    for (const x of [8, 32, 56]) b.add(x, 14, Y.BED_ROOF - 2, 2, 1, 1, C.warmLight, 'light');
    for (const [x, z] of [[62, 55], [52, 52]]) b.add(x, z, Y.STUDIO_ROOF - 3, 2, 1, 1, C.warmLight, 'light');
  });
}
