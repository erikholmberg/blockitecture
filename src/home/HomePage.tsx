import { Separator } from '@/components/ui/separator';
import { House } from '@/houses/index';
import { HouseCard } from '@/home/HouseCard';

export function HomePage({ houses }: { houses: House[] }) {
  return (
    <div className="min-h-svh bg-page">
      <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-10 max-w-2xl">
          <div data-logo className="mb-4 font-logo text-xl font-bold tracking-wide uppercase">
            Blockitecture
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Famous houses, built block by block
          </h1>
          <p className="mt-3 text-base text-muted-foreground text-pretty">
            Landmark modernist houses rebuilt from toy blocks in your browser. Watch each one go up piece by piece
            on its real site, then orbit around it or walk inside.
          </p>
        </header>

        <main className="grid flex-1 grid-cols-1 content-start gap-6 sm:grid-cols-2">
          {houses.map((h) => (
            <HouseCard key={h.slug} house={h} />
          ))}
        </main>

        <footer className="mt-14 text-xs text-muted-foreground">
          <Separator className="mb-5" />
          <p>
            Fan tributes in a generic toy-block style.{' '}
            <a className="underline underline-offset-2 hover:text-foreground" href="/credits/">
              Credits &amp; disclaimers
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
