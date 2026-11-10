import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { House, houseUrl } from '@/houses/index';
import { STATS } from '@/houses/stats';

const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

/** spec 050: the house's colours, each as wide as its share; decoration, so hidden from screen readers */
function PaletteStrip({ slug }: { slug: string }) {
  const palette = STATS[slug]?.palette;
  if (!palette) return null;
  return (
    <div data-palette aria-hidden="true" className="-mt-(--card-spacing) flex h-3.5 w-full border-t border-foreground/10">
      {palette.map((p) => (
        <div key={p.color} style={{ flexGrow: p.share, backgroundColor: hex(p.color) }} />
      ))}
    </div>
  );
}

/** Toy-brick placeholder for houses that aren't built yet. */
function BrickPlaceholder() {
  return (
    <div
      aria-hidden
      className="aspect-video w-full bg-muted"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--foreground) 9%, transparent) 28%, transparent 30%), linear-gradient(color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

export function HouseCard({ house }: { house: House }) {
  const live = house.status === 'live';
  const card = (
    <Card
      data-house={house.slug}
      aria-disabled={live ? undefined : true}
      className={cn(
        'h-full pt-0 transition-all duration-200',
        live ? 'group-hover/link:-translate-y-1 group-hover/link:shadow-lg' : 'opacity-60',
      )}
    >
      {live && house.thumbnail ? (
        <img
          src={house.thumbnail}
          alt={`${house.title}, built from toy blocks`}
          width={1200}
          height={675}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      ) : (
        <BrickPlaceholder />
      )}
      {live && <PaletteStrip slug={house.slug} />}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">{house.title}</CardTitle>
            {house.subtitle && <CardDescription>{house.subtitle}</CardDescription>}
          </div>
          {live ? (
            <Badge>{house.pieces?.toLocaleString('en-US')} pieces</Badge>
          ) : (
            <Badge variant="secondary">Coming soon</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {house.architect} · {house.year} · {house.location}
        </p>
        <p className="text-sm leading-relaxed">{house.blurb}</p>
      </CardContent>
    </Card>
  );
  if (!live) return card;
  return (
    <a
      href={houseUrl(house)}
      className="group/link block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
      aria-label={`${house.title}: watch it being built`}
    >
      {card}
    </a>
  );
}
