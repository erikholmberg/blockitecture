import { House } from '@/houses/index';
import { Filters, GROUPS, Group, chipCount, isEmpty } from '@/home/filter';
import { cn } from '@/lib/utils';

/** Spec 082: the home page's filter chips: one choice per group, each chip with how many it would show. */
export function FilterChips({ houses, filters, shown, onChange, onClear }: {
  houses: House[]; filters: Filters; shown: number; onChange(g: Group, value: string): void; onClear(): void;
}) {
  return (
    <section aria-label="Filter the buildings" className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {GROUPS.map(({ group, label, chips }) => (
          <div key={group} role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
            {chips.map((c) => {
              const on = filters[group] === c.value;
              const n = chipCount(houses, filters, group, c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && n === 0}
                  onClick={() => onChange(group, c.value)}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors outline-none',
                    'focus-visible:ring-3 focus-visible:ring-ring/60 disabled:cursor-default disabled:opacity-40',
                    on ? 'border-foreground bg-foreground text-background' : 'border-foreground/15 bg-background hover:border-foreground/40',
                  )}
                >
                  {c.label}
                  <span className={cn('text-[11px] tabular-nums', on ? 'text-background/70' : 'text-muted-foreground')}>{n}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <p aria-live="polite">{shown} {shown === 1 ? 'building' : 'buildings'}</p>
        {/* beside the count, where it's in view; the empty grid has its own */}
        {!isEmpty(filters) && shown > 0 && (
          <button type="button" onClick={onClear} className="underline underline-offset-2 hover:text-foreground">Clear filters</button>
        )}
      </div>
    </section>
  );
}
