import { Separator } from '@/components/ui/separator';
import { House } from '@/houses';
import { HouseCard } from './HouseCard';

export function HomePage({ houses }: { houses: House[] }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 max-w-2xl">
        <div className="mb-3 flex items-center gap-2">
          <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
            <rect x="2" y="12" width="28" height="14" rx="2" fill="var(--primary)" />
            <rect x="7" y="7" width="6" height="5" rx="1" fill="var(--primary)" />
            <rect x="19" y="7" width="6" height="5" rx="1" fill="var(--primary)" />
          </svg>
          <span className="text-sm font-semibold tracking-tight">Blockitecture</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Famous houses, built brick by brick
        </h1>
        <p className="mt-3 text-base text-muted-foreground text-pretty">
          Landmark modernist houses rebuilt from toy bricks in your browser. Watch each one go up piece by piece
          on its real site, then orbit around it or walk inside.
        </p>
      </header>

      <main className="grid flex-1 grid-cols-1 content-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {houses.map((h) => (
          <HouseCard key={h.slug} house={h} />
        ))}
      </main>

      <footer className="mt-14 text-xs text-muted-foreground">
        <Separator className="mb-5" />
        <p>
          Fan tributes in a generic toy-brick style, not affiliated with the LEGO Group. Neighborhoods ©{' '}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://www.openstreetmap.org/copyright">
            OpenStreetMap contributors
          </a>
          ; terrain from Mapzen / AWS Terrain Tiles.
        </p>
      </footer>
    </div>
  );
}
