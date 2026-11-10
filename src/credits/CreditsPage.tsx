import { Separator } from '@/components/ui/separator';
import { House } from '@/houses/index';

/** "A, B or C" */
const either = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}`);

/**
 * Spec 021: credits and disclaimers, moved off the home page's footer. One section per live house: what it isn't
 * affiliated with and what it was built from; then the data credits.
 */
export function CreditsPage({ houses }: { houses: House[] }) {
  const live = houses.filter((h) => h.status === 'live');
  return (
    <div className="min-h-svh bg-page">
      <div className="mx-auto flex min-h-svh max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-10">
          <a href="/" className="mb-4 inline-block font-logo text-xl font-bold tracking-wide uppercase">
            Blockitecture
          </a>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Credits &amp; disclaimers</h1>
          <p className="mt-3 text-base text-muted-foreground text-pretty">
            Every house here is a fan tribute in a generic toy-block style, not affiliated with the LEGO Group.
          </p>
        </header>

        <main className="flex-1 space-y-8">
          {live.map((h) => (
            <section key={h.slug} data-credits={h.slug}>
              <h2 className="text-lg font-semibold tracking-tight">
                <a href={`/${h.slug}/`} className="hover:underline">{h.title}</a>
              </h2>
              <p className="text-sm text-muted-foreground">
                {h.architect} · {h.year} · {h.location}
              </p>
              {h.affiliations?.length ? (
                <p className="mt-2 text-sm">Not affiliated with {either(h.affiliations)}.</p>
              ) : null}
              {h.sources?.length ? (
                <>
                  <p className="mt-2 text-sm font-medium">Built from</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted-foreground">
                    {h.sources.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          ))}

          <Separator />
          <section data-credits="data">
            <h2 className="text-lg font-semibold tracking-tight">Maps and terrain</h2>
            <p className="mt-2 text-sm">
              Neighborhoods ©{' '}
              <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright">
                OpenStreetMap contributors
              </a>{' '}
              (ODbL). Terrain from Mapzen / AWS Terrain Tiles.
            </p>
          </section>
        </main>

        <footer className="mt-14 text-xs text-muted-foreground">
          <a href="/" className="underline underline-offset-2 hover:text-foreground">
            ← All houses
          </a>
        </footer>
      </div>
    </div>
  );
}
