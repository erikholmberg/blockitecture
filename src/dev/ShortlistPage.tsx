/**
 * Dev-only photo page for picking the next houses (spec 016's shortlist). Served by `npm run dev` at /dev/shortlist/;
 * not in PAGES (vite.config.ts), so it is never built or deployed. Photos are loaded live from Wikipedia and Wikimedia
 * Commons and are not copied into the repo.
 */
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { HOUSES } from '@/houses/index';
import { Candidate, SHORTLIST, batches, builtOnShortlist, livePicks } from '@/dev/shortlist';

interface Photo { thumb: string; page: string; credit: string }

const strip = (html = '') => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const PICKS_KEY = 'blockitecture:shortlist-picks';
/** file names that are not photos of the house */
const NOT_A_PHOTO = /logo|signature|seal|map|plan|diagram|stamp|coin|icon|\.png$/i;

/** The Wikipedia lead photo of every candidate that has an article, in batches of 50 titles (the API's limit; spec 054). */
async function leadPhotos(): Promise<Map<string, Photo>> {
  const titles = SHORTLIST.flatMap((c) => (c.wiki ? [c.wiki] : []));
  const alias = new Map<string, string>(); // requested title → final title
  const byTitle = new Map<string, any>();
  for (const batch of batches(titles)) {
    const q = new URLSearchParams({
      action: 'query', format: 'json', origin: '*', redirects: '1', prop: 'pageimages',
      piprop: 'thumbnail|name', pithumbsize: '1200', titles: batch.join('|'),
    });
    const d = (await (await fetch(`https://en.wikipedia.org/w/api.php?${q}`)).json()).query;
    for (const r of [...(d.normalized ?? []), ...(d.redirects ?? [])]) alias.set(r.from, r.to);
    for (const p of Object.values(d.pages) as any[]) byTitle.set(p.title, p);
  }
  const resolve = (t: string) => { let x = t; while (alias.has(x)) x = alias.get(x)!; return x; };
  const out = new Map<string, Photo>();
  for (const c of SHORTLIST) {
    const p = c.wiki && byTitle.get(resolve(c.wiki));
    if (p?.thumbnail && p.thumbnail.width >= 400 && !NOT_A_PHOTO.test(p.pageimage)) {
      out.set(c.slug, {
        thumb: p.thumbnail.source,
        page: `https://en.wikipedia.org/wiki/File:${encodeURIComponent(p.pageimage)}`,
        credit: 'Wikipedia lead photo',
      });
    }
  }
  return out;
}

/** Up to 8 more photos from a Wikimedia Commons search. */
async function commonsPhotos(c: Candidate): Promise<Photo[]> {
  const q = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrnamespace: '6', gsrlimit: '8',
    gsrsearch: `${c.commons} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '1200',
    iiextmetadatafilter: 'Artist|LicenseShortName',
  });
  const d = await (await fetch(`https://commons.wikimedia.org/w/api.php?${q}`)).json();
  return Object.values(d.query?.pages ?? {})
    .sort((a: any, b: any) => a.index - b.index)
    .filter((p: any) => !NOT_A_PHOTO.test(p.title) && p.imageinfo[0].width >= 800)
    .map((p: any) => {
      const ii = p.imageinfo[0], m = ii.extmetadata ?? {};
      const artist = strip(m.Artist?.value), license = strip(m.LicenseShortName?.value);
      return { thumb: ii.thumburl, page: ii.descriptionurl, credit: [artist, license].filter(Boolean).join(' · ') };
    });
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(3 - n);
const FIT = { 3: 'Boxes: the engine can build it today', 2: 'Needs one new trick', 1: 'A showpiece challenge' } as const;

function CandidateCard({ c, lead, more, picked, onPick, status, built }: {
  c: Candidate; lead?: Photo; more?: Photo[]; picked: boolean; onPick: () => void; status?: string; built: boolean;
}) {
  const photos = useMemo(() => {
    const all = [...(lead ? [lead] : []), ...(more ?? [])];
    return all.filter((p, i) => all.findIndex((q) => q.thumb === p.thumb) === i);
  }, [lead, more]);
  const [shown, setShown] = useState(0);
  const main = photos[Math.min(shown, photos.length - 1)];
  return (
    <Card className={cn('gap-4 pt-0 transition-shadow', picked && 'ring-2 ring-primary')} data-built={built || undefined}>
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
        {main ? (
          <img src={main.thumb} alt={c.title} className={cn('size-full object-cover', built && 'opacity-40 grayscale')} />
        ) : more ? (
          <div className="flex size-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            No photos on Wikimedia Commons.{' '}
            <a className="ml-1 underline" target="_blank" rel="noopener" href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${c.title} ${c.architect}`)}`}>
              Search images
            </a>
          </div>
        ) : (
          <div className="size-full animate-pulse" />
        )}
        {built && (
          <Badge className="absolute top-3 left-3 gap-1 px-2.5 py-1 text-sm shadow">
            <Check /> Built
          </Badge>
        )}
        {main && (
          <a href={main.page} target="_blank" rel="noopener" className="absolute right-2 bottom-2 max-w-[80%] truncate rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white hover:underline">
            {main.credit || 'Wikimedia Commons'}
          </a>
        )}
      </div>
      {photos.length > 1 && (
        <div className="-mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
          {photos.map((p, i) => (
            <button
              key={p.thumb}
              onClick={() => setShown(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn('h-12 w-20 shrink-0 overflow-hidden rounded-md ring-offset-2', i === shown ? 'ring-2 ring-foreground' : 'opacity-70 hover:opacity-100')}
            >
              <img src={p.thumb} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">{c.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{c.architect} · {c.year} · {c.place}</p>
          </div>
          {built ? (
            <Button size="sm" variant="ghost" asChild>
              <a href={`/${c.slug}/`}>View <ArrowRight /></a>
            </Button>
          ) : (
            <Button size="sm" variant={picked ? 'default' : 'outline'} onClick={onPick} aria-pressed={picked}>
              {picked && <Check />} {picked ? 'Picked' : 'Pick'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm leading-relaxed">{c.why}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span title={FIT[c.fit]} className="tracking-widest text-foreground">{stars(c.fit)}</span>
          <span>{FIT[c.fit]}</span>
          {status && <Badge variant="secondary">{status}</Badge>}
          {c.wiki && (
            <a className="ml-auto inline-flex items-center gap-1 hover:text-foreground" target="_blank" rel="noopener" href={`https://en.wikipedia.org/wiki/${encodeURIComponent(c.wiki.replace(/ /g, '_'))}`}>
              Wikipedia <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ShortlistPage() {
  const [leads, setLeads] = useState<Map<string, Photo>>(new Map());
  const [more, setMore] = useState<Record<string, Photo[]>>({});
  const [picks, setPicks] = useState<string[]>(() => JSON.parse(localStorage.getItem(PICKS_KEY) ?? '[]'));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    leadPhotos().then(setLeads).catch(() => {});
    // a few at a time, to be gentle with the Commons API
    let i = 0;
    const next = async (): Promise<void> => {
      const c = SHORTLIST[i++];
      if (!c) return;
      const photos = await commonsPhotos(c).catch(() => []);
      setMore((m) => ({ ...m, [c.slug]: photos }));
      return next();
    };
    Promise.all([next(), next(), next()]);
  }, []);
  useEffect(() => { localStorage.setItem(PICKS_KEY, JSON.stringify(picks)); }, [picks]);

  const toggle = (slug: string) => setPicks((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));
  const statusOf = (slug: string) => {
    const h = HOUSES.find((x) => x.slug === slug);
    return h && h.status !== 'live' ? 'On the home page as coming soon' : undefined;
  };
  const built = useMemo(() => builtOnShortlist(SHORTLIST, HOUSES), []);
  const pickedTitles = livePicks(picks, built).map((s) => SHORTLIST.find((c) => c.slug === s)?.title).filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="font-logo text-xl font-bold tracking-wide uppercase">Blockitecture</div>
          <Badge variant="outline">Dev only, not published</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Which house next?</h1>
        <p className="max-w-2xl text-muted-foreground">
          The shortlist from spec 016, with photos from Wikipedia and Wikimedia Commons. Click the small photos to flip through them, and
          <b className="text-foreground"> Pick</b> the ones you like. Picks are saved in this browser.
        </p>
        <div className="sticky top-3 z-10 flex flex-wrap items-center gap-2 rounded-lg bg-background/95 p-3 shadow-sm ring-1 ring-foreground/10">
          <span className="text-sm text-muted-foreground">{built.size} of {SHORTLIST.length} built</span>
          <span className="text-sm font-semibold">Picks ({pickedTitles.length}):</span>
          <span className="text-sm text-muted-foreground">{pickedTitles.length ? pickedTitles.join(', ') : 'none yet'}</span>
          {pickedTitles.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => { navigator.clipboard.writeText(pickedTitles.join(', ')); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            >
              {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy list'}
            </Button>
          )}
        </div>
      </header>
      <main className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SHORTLIST.map((c) => (
          <CandidateCard
            key={c.slug}
            c={c}
            lead={leads.get(c.slug)}
            more={more[c.slug]}
            picked={picks.includes(c.slug)}
            onPick={() => toggle(c.slug)}
            status={statusOf(c.slug)}
            built={built.has(c.slug)}
          />
        ))}
      </main>
      <footer className="mt-12 text-xs text-muted-foreground">
        Photos load live from Wikipedia and Wikimedia Commons; each photo's credit links to its file page with the author and license.
      </footer>
    </div>
  );
}
