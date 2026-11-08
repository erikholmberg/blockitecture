import { Brick, PHASES, PLATE } from '../bricks/catalog';
import { CENTER } from '../model/layout';

/** Where the hillside wave starts: the middle of the house pad (spec 005). */
export const WAVE_CENTER = { x: CENTER.x, z: CENTER.z };

/**
 * Outward-and-downhill order: horizontal distance from the house plus the drop of each piece's top below the pad
 * (ft). Then each piece is pushed after every piece under it in any of its stud cells, so stacks still go up
 * bottom-first and nothing floats.
 */
function waveKeys(bricks: Brick[], list: number[]) {
  const key = new Map<number, number>();
  const below = new Map<number, number>(); // stud cell → key of the highest piece placed in it so far
  const byY = [...list].sort((a, c) => bricks[a].y - bricks[c].y);
  for (const i of byY) {
    const b = bricks[i];
    let k = Math.hypot(b.x + b.w / 2 - WAVE_CENTER.x, b.z + b.d / 2 - WAVE_CENTER.z) + Math.max(0, -(b.y + b.h) * PLATE);
    for (let z = b.z; z < b.z + b.d; z++)
      for (let x = b.x; x < b.x + b.w; x++) {
        const under = below.get(x * 4096 + z);
        if (under !== undefined && under + 1e-3 > k) k = under + 1e-3;
      }
    for (let z = b.z; z < b.z + b.d; z++) for (let x = b.x; x < b.x + b.w; x++) below.set(x * 4096 + z, k);
    key.set(i, k);
  }
  return key;
}

export interface Schedule {
  order: number[]; // brick indices in build order
  start: Float32Array; // start time per brick index
  phaseStart: number[];
  total: number;
}

export const DROP_DUR = 0.7;

export function sequence(bricks: Brick[]): Schedule {
  const byPhase: number[][] = PHASES.map(() => []);
  bricks.forEach((b, i) => byPhase[b.phase].push(i));
  const order: number[] = [];
  const start = new Float32Array(bricks.length);
  const phaseStart: number[] = [];
  let t = 0;
  PHASES.forEach((ph, p) => {
    const list = byPhase[p];
    const sweep = (b: Brick) => b.x * 0.55 + b.z * 0.45;
    if (ph.order === 'wave') {
      const key = waveKeys(bricks, list);
      list.sort((a, c) => key.get(a)! - key.get(c)! || a - c);
    } else if (ph.order === 'layer') {
      // bottom-up; ceiling-hung pieces last, top-down from the ceiling
      list.sort((a, c) => {
        const A = bricks[a], B = bricks[c];
        if (!A.hangs !== !B.hangs) return A.hangs ? 1 : -1;
        if (A.hangs) return B.y + B.h - (A.y + A.h) || sweep(A) - sweep(B);
        return A.y - B.y || sweep(A) - sweep(B);
      });
    } else {
      list.sort((a, c) => {
        const A = bricks[a], B = bricks[c];
        return A.group - B.group || A.y - B.y || sweep(A) - sweep(B);
      });
    }
    phaseStart.push(t);
    const n = list.length;
    // within a phase, ease in/out slightly so it starts and ends gently
    list.forEach((bi, k) => {
      const u = n > 1 ? k / (n - 1) : 0;
      start[bi] = t + u * ph.dur;
      order.push(bi);
    });
    t += ph.dur + 1.5;
  });
  return { order, start, phaseStart, total: t + DROP_DUR };
}
