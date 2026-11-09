/**
 * Fallingwater's envelope (spec 017): Cherokee red steel sash and plate glass. Horizontal glazing bars at sill, mid and
 * head; vertical mullions every 4 ft, except at the glass corners, which famously have none [documented].
 * Window lines read off HABS sheets 4–6 (layout.ts frame); in each line the glass runs from the floor (or a parapet)
 * to the ceiling.
 */
import { Builder } from '@/engine/voxel';
import { P } from '../phases';
import { GUEST_WINGS, Rect, Y } from './layout';
import { CHEROKEE } from './structure';

/**
 * A glass wall along a 1-stud line [x0, z0, x1, z1] from y0 to y1: sash bars (sill, mid, head) and mullions every
 * `bay` studs. `cornerAt` ends are left without a mullion (the glass meets glass).
 */
export function glassWall(b: Builder, r: Rect, y0: number, y1: number, opts: { bay?: number; open?: ('start' | 'end')[] } = {}) {
  b.newGroup();
  const along = r[2] - r[0] > 1 ? 'x' : 'z';
  const n = along === 'x' ? r[2] - r[0] : r[3] - r[1];
  const bay = opts.bay ?? 4;
  const cell = (i: number): Rect => (along === 'x' ? [r[0] + i, r[1], r[0] + i + 1, r[3]] : [r[0], r[1] + i, r[2], r[1] + i + 1]);
  const mid = y0 + Math.round((y1 - y0) * 0.45);
  for (let i = 0; i < n; i++) {
    const [cx0, cz0, cx1, cz1] = cell(i);
    const end = i === 0 ? 'start' : i === n - 1 ? 'end' : null;
    const mullion = (i % bay === 0 || i === n - 1) && !(end && opts.open?.includes(end));
    if (mullion) {
      b.box(cx0, cz0, cx1, cz1, y0, y1, { kind: 'brick', color: CHEROKEE });
      continue;
    }
    // sash bars and the glass between them
    for (const y of [y0, mid, y1 - 1]) b.box(cx0, cz0, cx1, cz1, y, y + 1, { kind: 'plate', color: CHEROKEE });
    b.box(cx0, cz0, cx1, cz1, y0 + 1, mid, { kind: 'glass', color: 0xdff1f5 });
    b.box(cx0, cz0, cx1, cz1, mid + 1, y1 - 1, { kind: 'glass', color: 0xdff1f5 });
  }
}

export function buildEnvelope(b: Builder) {
  b.setPhase(P.ENVELOPE);
  const C1 = Y.L2 - 5; // first-floor ceiling (underside of the second tray)
  const C2 = Y.L3 - 5;
  const C3 = Y.ROOF - 4;
  // first floor [documented: sheet 4]
  glassWall(b, [30, 66, 52, 67], Y.PARAPET, C1, { open: ['end'] }); // the living room's south glass, over the long seat
  glassWall(b, [51, 53, 52, 66], 0, C1, { open: ['end'] }); // its east glass, onto the terrace around the hatch
  glassWall(b, [52, 52, 66, 53], 0, C1); // the hatch's glazing
  glassWall(b, [65, 45, 66, 52], 0, C1); // the east glass beside the stone core
  glassWall(b, [30, 54, 31, 66], 0, C1, { open: ['end'] }); // doors to the west terrace
  glassWall(b, [25, 41, 26, 51], 0, C1); // the west windows over the built-in desk
  glassWall(b, [66, 24, 67, 30], 0, C1); // the loggia's glass
  // second floor [documented: sheet 5]
  glassWall(b, [31, 45, 46, 46], Y.L2, C2, { open: ['start'] }); // master bedroom onto the south terrace
  glassWall(b, [46, 45, 54, 46], Y.L2 + Y.PARAPET, C2); // the bath
  glassWall(b, [54, 44, 65, 45], Y.L2, C2); // the guest room, south
  glassWall(b, [65, 31, 66, 44], Y.L2, C2, { open: ['end'] }); // and onto the east terrace (no corner mullion)
  glassWall(b, [17, 29, 27, 30], Y.L2, C2); // the dressing room's south windows
  // third floor [documented: sheet 6]
  glassWall(b, [32, 26, 56, 27], Y.L3, C3); // the gallery onto the terrace
  glassWall(b, [18, 26, 27, 27], Y.L3, C3, { open: ['end'] }); // the study
  // the guest wing: glass along its south side, toward the house [assumed: photographs]
  for (const r of GUEST_WINGS) glassWall(b, [r[0] + 2, r[3] - 1, r[2] - 2, r[3]], Y.GUEST + 1, Y.GUEST + 22);
}
