/**
 * Spec 082: the building menu in the viewer: every building, newest first, the current one marked. On wide screens it
 * opens as a popover under the building's name; on phones as a sheet from the bottom, with Previous and Next at its top.
 * Solid panels, no backdrop blur over the canvas (spec 007).
 */
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { NavBuilding, buildingUrl, neighbours } from '@/engine/nav';

function BuildingList({ buildings, slug, className }: { buildings: NavBuilding[]; slug: string; className?: string }) {
  const current = useRef<HTMLAnchorElement>(null);
  // open scrolled to the current building
  useEffect(() => { current.current?.scrollIntoView({ block: 'center' }); }, []);
  return (
    <ul aria-label="All buildings" className={cn('overflow-y-auto overscroll-contain', className)}>
      {buildings.map((b) => {
        const here = b.slug === slug;
        return (
          <li key={b.slug}>
            <a
              ref={here ? current : undefined}
              href={buildingUrl(b.slug)}
              aria-current={here ? 'page' : undefined}
              className={cn(
                'flex min-h-10 items-center gap-3 rounded-md px-2 py-1.5 outline-none hover:bg-muted focus-visible:bg-muted',
                here && 'bg-muted',
              )}
            >
              {b.thumbnail ? (
                <img src={b.thumbnail} alt="" width={64} height={36} loading="lazy" className="h-9 w-16 shrink-0 rounded-sm object-cover" />
              ) : (
                <span aria-hidden className="h-9 w-16 shrink-0 rounded-sm bg-muted" />
              )}
              <span className="min-w-0">
                <span className={cn('block truncate text-[13px]', here ? 'font-semibold' : 'font-medium')}>{b.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{b.architect} · {b.year}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** ‹ and › beside the name on wide screens */
export function PrevNext({ buildings, slug }: { buildings: NavBuilding[]; slug: string }) {
  const { prev, next } = neighbours(buildings, slug);
  if (!prev || !next) return null;
  const cls = 'inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground';
  return (
    <span className="flex items-center">
      <a href={buildingUrl(prev.slug)} aria-label={`Previous building: ${prev.title} ([)`} title={`${prev.title} ([)`} className={cls}>
        <ChevronLeft className="size-4" aria-hidden />
      </a>
      <a href={buildingUrl(next.slug)} aria-label={`Next building: ${next.title} (])`} title={`${next.title} (])`} className={cls}>
        <ChevronRight className="size-4" aria-hidden />
      </a>
    </span>
  );
}

export function BuildingMenu({ buildings, slug, name, compact }: {
  buildings: NavBuilding[]; slug: string; name: string; compact: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open || !compact) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [open, compact]);

  if (!compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="-mx-1 flex min-w-0 items-center gap-1 rounded px-1 text-[13px] font-semibold outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/60">
            <span className="truncate">{name}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" collisionPadding={12} className="flex max-h-[min(32rem,calc(100dvh-96px))] w-80 flex-col p-1.5">
          <BuildingList buildings={buildings} slug={slug} />
        </PopoverContent>
      </Popover>
    );
  }

  const { prev, next } = neighbours(buildings, slug);
  const navBtn = 'inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-md border text-[13px] font-medium hover:bg-muted';
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-10 min-w-0 items-center gap-1 pr-3 text-[13px] font-semibold outline-none"
      >
        <span className="truncate">{name}</span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </button>
      {open && (
        <div className="pointer-events-auto fixed inset-0 z-40">
          <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/30" onClick={() => setOpen(false)} />
          <div role="dialog" aria-label="Buildings" className="absolute inset-x-0 bottom-0 flex max-h-[75dvh] flex-col rounded-t-xl bg-background pb-[env(safe-area-inset-bottom)] shadow-lg">
            <div className="flex items-center gap-2 border-b p-3">
              {prev && next && (
                <>
                  <a href={buildingUrl(prev.slug)} className={navBtn}><ChevronLeft className="size-4" aria-hidden /> Previous</a>
                  <a href={buildingUrl(next.slug)} className={navBtn}>Next <ChevronRight className="size-4" aria-hidden /></a>
                </>
              )}
              <button type="button" aria-label="Close the list" onClick={() => setOpen(false)} className="inline-flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-muted">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <BuildingList buildings={buildings} slug={slug} className="p-1.5" />
          </div>
        </div>
      )}
    </>
  );
}
