/**
 * Spec 050: "By the numbers: this model", what the model is made of and how it goes up. Every figure is the model's, not the
 * real house's: blocks round everything to a foot.
 */
import { FT_TO_M, type HouseStats } from '@/engine/stats';

const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');
const fmt = (n: number) => n.toLocaleString('en-US');
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** `noun`: what the building is, e.g. "chapel" (spec 059); "house" by default */
export function NumbersPanel({ stats, phaseNames, noun = 'house' }: { stats: HouseStats; phaseNames: string[]; noun?: string }) {
  const total = stats.steps.reduce((a, s) => a + s.seconds, 0);
  const rows: [string, string][] = [
    ['Pieces', `${fmt(stats.housePieces)} in the ${noun}, ${fmt(stats.pieces)} with its site`],
    ['Height', `${Math.round(stats.heightFt)} ft (${Math.round(stats.heightFt * FT_TO_M)} m)`],
    ['Footprint', `${fmt(stats.footprintFt2)} ft² (${fmt(Math.round(stats.footprintFt2 * FT_TO_M * FT_TO_M))} m²)`],
    ['Glass', `${pct(stats.glassShare)} of the ${noun}`],
  ];
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div>
        <p className="font-semibold">By the numbers</p>
        <p className="text-xs text-muted-foreground">This model, not the real {noun}: blocks round everything to a foot.</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted-foreground">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-1.5">
        <p className="text-muted-foreground">The build</p>
        <div className="flex h-2 overflow-hidden rounded-full ring-1 ring-foreground/10" aria-hidden>
          {stats.steps.map((s, i) => (
            <div key={i} style={{ flexGrow: s.seconds, backgroundColor: `color-mix(in oklab, var(--foreground) ${20 + (i % 2) * 25}%, transparent)` }} />
          ))}
        </div>
        <ol className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-xs">
          {stats.steps.map((s, i) => (
            <li key={i} className="contents">
              <span className="truncate">{phaseNames[i] ?? s.role}</span>
              <span className="text-right text-muted-foreground">{fmt(s.pieces)}</span>
              <span className="text-right text-muted-foreground">{pct(s.seconds / total)}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-muted-foreground">Its colours</p>
        <div className="flex h-4 overflow-hidden rounded-md ring-1 ring-foreground/10">
          {stats.palette.map((p) => (
            <div key={p.color} title={hex(p.color)} style={{ flexGrow: p.share, backgroundColor: hex(p.color) }} />
          ))}
        </div>
      </div>
    </div>
  );
}
