import { Brick, PHASES } from '../bricks/catalog';

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
    if (ph.order === 'layer') {
      list.sort((a, c) => {
        const A = bricks[a], B = bricks[c];
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
