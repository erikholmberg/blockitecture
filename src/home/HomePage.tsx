import { useEffect, useState } from 'react';
import { House } from '@/houses/index';
import { HouseCard } from '@/home/HouseCard';
import { Filters, applyFilters, formatQuery, newSlugs, newestFirst, parseQuery, toggle } from '@/home/filter';
import { FilterChips } from '@/home/FilterChips';
import { Button } from '@/components/ui/button';

export function HomePage({ houses }: { houses: House[] }) {
  // spec 082: newest first. The server renders no filter; the address's filters are read after hydration (spec 053),
  // so the first render in the browser matches the HTML
  const all = newestFirst(houses);
  const fresh = newSlugs(houses);
  const [filters, setFilters] = useState<Filters>({});
  useEffect(() => {
    // keep the same state when the address holds the same filters, so hydrating with no query renders nothing again
    const read = () => setFilters((f) => {
      const next = parseQuery(location.search);
      return formatQuery(next) === formatQuery(f) ? f : next;
    });
    read();
    addEventListener('popstate', read);
    return () => removeEventListener('popstate', read);
  }, []);
  const choose = (f: Filters) => {
    setFilters(f);
    history.pushState(null, '', `${location.pathname}${formatQuery(f)}${location.hash}`);
  };
  const shown = applyFilters(all, filters);

  return (
    <div className="min-h-svh bg-page">
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-8 max-w-2xl">
          <div data-logo className="mb-4 font-logo text-xl font-bold tracking-wide uppercase">
            Blockitecture
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Famous buildings, built block by block
          </h1>
          <p className="mt-3 text-base text-muted-foreground text-pretty">
            Landmark buildings rebuilt from toy blocks in your browser. Watch each one go up piece by piece
            on its real site, then orbit around it or walk inside.
          </p>
        </header>

        <FilterChips houses={all} filters={filters} shown={shown.length} onChange={(g, v) => choose(toggle(filters, g, v))} onClear={() => choose({})} />

        <main className="grid flex-1 grid-cols-1 content-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((h) => (
            <HouseCard key={h.slug} house={h} isNew={fresh.has(h.slug)} />
          ))}
          {shown.length === 0 && (
            <div className="col-span-full flex flex-col items-start gap-3 py-10">
              <p className="text-base font-semibold">No buildings match</p>
              <Button variant="outline" size="sm" onClick={() => choose({})}>Clear filters</Button>
            </div>
          )}
        </main>

        <footer className="mt-14 text-xs text-muted-foreground">
          <p>
            Built by{' '}
            <a className="underline underline-offset-2 hover:text-foreground" href="https://erikholmberg.com">
              Erik Holmberg
            </a>
            .{' '}
            <a className="underline underline-offset-2 hover:text-foreground" href="/credits/">
              Credits
            </a>{' '}
            · Neighborhoods ©{' '}
            <a className="underline underline-offset-2 hover:text-foreground" href="https://www.openstreetmap.org/copyright">
              OpenStreetMap contributors
            </a>
            ; terrain from Mapzen / AWS Terrain Tiles.
          </p>
        </footer>
      </div>
    </div>
  );
}
