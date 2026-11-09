/**
 * Spec 026: a tighter intro card. Title, text and the Start button in the main column; the control hints, the
 * disclaimer and (on phones) the map credit in a footer band. Used by the HUD on every house page.
 */
import { Footprints, Hand, Move3d, Play, ZoomIn, EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { HouseDefinition } from '@/engine/house';

export function IntroCard({ text, pieces, compact, onStart, credit }: {
  text: HouseDefinition['text'];
  pieces: number;
  compact: boolean;
  onStart: () => void;
  /** the map credit, shown on phones (where it isn't in the corner) */
  credit?: ReactNode;
}) {
  const hints: [ReactNode, string][] = compact
    ? [[<Hand key="o" />, 'Drag to orbit'], [<ZoomIn key="z" />, 'Pinch to zoom'], [<EyeOff key="h" />, 'Tap to hide controls']]
    : [[<Move3d key="o" />, 'Drag to orbit'], [<ZoomIn key="z" />, 'Scroll to zoom'], [<Footprints key="w" />, 'Walk to explore']];
  return (
    <div data-intro className="w-full max-w-[400px] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl">
      <div className="flex flex-col gap-4 p-6">
        <div>
          <div className="text-[10.5px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{text.eyebrow}</div>
          {/* just the house's name: "block by block" stays the site's line (home headline, page titles) */}
          <h2 className="mt-2 text-[22px] leading-[1.15] font-bold tracking-tight">{text.headline[0].replace(/,\s*$/, '')}</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {text.intro[0]} <b className="text-foreground">{pieces.toLocaleString('en-US')}</b> {text.intro[1]}
        </p>
        <Button className="w-fit gap-1.5 px-4" onClick={onStart}>
          <Play className="size-3.5 fill-current" />
          Start building
        </Button>
      </div>
      <div data-intro-footer className="flex flex-col gap-2.5 border-t bg-muted/60 px-6 py-3.5">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-foreground/80">
          {hints.map(([icon, label]) => (
            <li key={label} data-hint className="flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:text-muted-foreground">
              {icon}
              {label}
            </li>
          ))}
        </ul>
        {text.disclaimer && <p className="text-[11px] leading-snug text-muted-foreground">{text.disclaimer}</p>}
        {compact && credit}
      </div>
    </div>
  );
}
