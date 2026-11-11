/**
 * Spec 007: the viewer's controls in React + shadcn/ui (replaces the vanilla src/ui/hud.ts).
 * main.ts keeps the engine, keyboard and camera logic and drives this through mountHud()'s small API.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ChartColumn, Expand, Eye, Home, ImageDown, Link2, Minus, Pause, Play, Plus, RotateCcw, RotateCw, Repeat, Share2, SlidersHorizontal,
} from 'lucide-react';
import type { HouseDefinition } from '@/engine/house';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NumbersPanel } from '@/engine/ui/NumbersPanel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { createHudStore, HudSnapshot, HudStore } from '@/engine/ui/hudStore';
import { IntroCard } from '@/engine/ui/IntroCard';

export type CamAction = 'in' | 'out' | 'left' | 'right' | 'home' | 'auto' | 'full' | `view:${string}`;

/** What the HUD shows about the house (spec 010a). */
export type HudHouse = Pick<HouseDefinition, 'text' | 'views' | 'stats'> & { phaseNames: string[] };

export interface HudState {
  t: number; total: number; playing: boolean; speed: number; placed: number; pieces: number; phase: number;
}

export interface HudHandlers {
  onStart(): void;
  onPlayPause(): void;
  onSpeed(s: number): void;
  onSeek(t: number): void;
  onFinish(): void;
  onRestart(): void;
  onMode(m: 'orbit' | 'walk'): void;
  onLight(l: 'day' | 'dusk'): void;
  onRoof(on: boolean): void;
  onCam(a: CamAction): void;
  /** spec 037: copy a link to this view, or save a postcard of it */
  onShare?(kind: 'link' | 'image'): void;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// no backdrop-blur: over the WebGL canvas it re-blurs the scene under every panel each frame
// (measured −22% fps at dpr 3, spec 007-A7)
const paper = 'bg-background/90 shadow-sm ring-1 ring-foreground/10';
const toggleOn = 'data-[state=on]:bg-foreground data-[state=on]:text-background';

const OSM_URL = 'https://www.openstreetmap.org/copyright';
const CREDIT = '© OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles';

/** Spec 014: phones (below Tailwind's md, 768 px) get the compact layout. */
const PHONE_QUERY = '(max-width: 767px)';
function useCompact() {
  return useSyncExternalStore(
    (cb) => {
      if (typeof matchMedia === 'undefined') return () => {};
      const mq = matchMedia(PHONE_QUERY);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => typeof matchMedia !== 'undefined' && matchMedia(PHONE_QUERY).matches,
  );
}

function Seg<T extends string>({ value, onChange, items, label, size = 'default' }: {
  value: T; onChange: (v: T) => void; items: [T, string][]; label: string; size?: 'default' | 'sm';
}) {
  return (
    <ToggleGroup
      type="single"
      size={size}
      spacing={0}
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      aria-label={label}
      className={cn('rounded-lg p-0.5', paper)}
    >
      {items.map(([v, text]) => (
        <ToggleGroupItem key={v} value={v} className={cn('rounded-[calc(var(--radius)-2px)]! px-3', toggleOn)}>
          {text}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function CamButton({ label, keyHint, onClick, pressed, children }: {
  label: string; keyHint?: string; onClick: () => void; pressed?: boolean; children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={label}
          aria-pressed={pressed}
          onClick={onClick}
          className={cn('size-9 rounded-lg', paper, pressed && 'bg-foreground text-background hover:bg-foreground/90 hover:text-background')}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{keyHint ? `${label} (${keyHint})` : label}</TooltipContent>
    </Tooltip>
  );
}

/** spec 037: Share, beside the camera controls on wide screens */
function ShareMenu({ h }: { h: HudHandlers }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Share" className={cn('size-9 rounded-lg', paper)}>
          <Share2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start" className="min-w-44">
        <DropdownMenuLabel>Share</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => h.onShare?.('link')}><Link2 /> Copy link</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => h.onShare?.('image')}><ImageDown /> Save image</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** spec 050: "By the numbers", beside Views and Share; no blur over the canvas */
function NumbersMenu({ house, compact }: { house: HudHouse; compact: boolean }) {
  if (!house.stats) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="By the numbers" className={cn(compact ? 'size-10' : 'size-9', 'rounded-lg', paper)}>
          <ChartColumn />
        </Button>
      </PopoverTrigger>
      {/* on phones below the button, where there's room across the screen; on wide screens beside the controls */}
      <PopoverContent side={compact ? 'bottom' : 'left'} align={compact ? 'end' : 'start'} collisionPadding={12} className="max-h-[calc(100dvh-24px)] w-[min(20rem,calc(100vw-24px))] overflow-y-auto">
        <NumbersPanel stats={house.stats} phaseNames={house.phaseNames} noun={house.text.noun} />
      </PopoverContent>
    </Popover>
  );
}

function ViewsMenu({ house, h }: { house: HudHouse; h: HudHandlers }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Views" className={cn('size-9 rounded-lg', paper)}>
          <Eye />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start" className="min-w-44">
        <DropdownMenuLabel>Views</DropdownMenuLabel>
        {Object.entries(house.views).map(([k, v]) => (
          <DropdownMenuItem key={k} onSelect={() => h.onCam(`view:${k}`)}>
            {v.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Hud({ store, h, house, compact: compactProp }: {
  store: HudStore; h: HudHandlers; house: HudHouse; compact?: boolean;
}) {
  const { text } = house;
  const s = useSyncExternalStore(store.subscribe, store.get);
  const media = useCompact();
  const compact = compactProp ?? media;
  const [started, setStarted] = useState(false);
  const [roof, setRoof] = useState<'on' | 'off'>('on');
  // while the timeline is being *dragged*, show the drag position (the engine catches up at 10 Hz);
  // keyboard changes go straight through, so nothing can get stuck showing an old value
  const [scrub, setScrub] = useState<number | null>(null);
  const dragging = useRef(false);
  useEffect(() => {
    const up = () => { dragging.current = false; setScrub(null); };
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
    return () => { removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
  }, []);
  const done = s.placed >= s.pieces;
  const t = scrub ?? s.t;
  const fullscreenOk = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  if (s.hidden) return null;
  const onRoof = (v: 'on' | 'off') => { setRoof(v); h.onRoof(v === 'on'); };

  const timeline = (
    <div className="relative py-1">
      <Slider
        aria-label="Build timeline"
        min={0}
        max={s.total}
        step={1}
        value={[Math.min(t, s.total)]}
        onPointerDown={() => { dragging.current = true; }}
        onValueChange={([v]) => { if (dragging.current) setScrub(v); h.onSeek(v); }}
        onValueCommit={() => { dragging.current = false; setScrub(null); }}
      />
      <div className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-1.5" aria-hidden>
        {s.phaseStart.map((p, i) => (
          <i key={i} title={house.phaseNames[i]} className="absolute h-1.5 w-px bg-foreground/25" style={{ left: `${(p / s.total) * 100}%` }} />
        ))}
      </div>
    </div>
  );
  const phaseLabel = done ? text.complete : house.phaseNames[s.phase];
  // spec 037: what the screen-reader live region says: the phase as it starts, then Complete
  const announcement = !started ? '' : done ? 'Complete' : `Now building: ${house.phaseNames[s.phase]}`;
  const count = `${s.placed.toLocaleString('en-US')} / ${s.pieces.toLocaleString('en-US')} pieces`;
  const playButton = (
    <Button size="icon" className="size-9 shrink-0 rounded-full" aria-label={s.playing ? 'Pause (P)' : 'Play (P)'} title="Play / pause (P)" onClick={h.onPlayPause}>
      {s.playing ? <Pause /> : <Play />}
    </Button>
  );

  // spec 014: on phones a tap on the scene hides everything but a thin progress line
  if (compact && started && s.chromeHidden) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[3px] bg-foreground/15" data-testid="progress-line" aria-hidden>
        <div className="h-full bg-primary" style={{ width: `${(Math.min(t, s.total) / s.total) * 100}%` }} />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="pointer-events-none fixed inset-0 font-sans text-foreground select-none" data-mode={s.mode}>
        {/* intro: no translucent backdrop over the canvas (iOS Safari flashes those); the viewer dims the scene itself (spec 036) */}
        {!started && (
          <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center p-5">
            <IntroCard
              text={text}
              pieces={s.pieces}
              compact={compact}
              onStart={() => { setStarted(true); h.onStart(); }}
              onFinished={() => { setStarted(true); h.onStart(); h.onFinish(); }}
              credit={<a href={OSM_URL} target="_blank" rel="noopener" className="text-[11px] text-muted-foreground underline">{CREDIT}</a>}
            />
          </div>
        )}

        {/* spec 037: build progress for screen readers (visually hidden), and brief notes such as "Link copied" */}
        <div aria-live="polite" className="sr-only">{announcement}</div>
        {s.note && (
          <div role="status" className="absolute top-16 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-3.5 py-2 text-[13px] text-background shadow-sm">
            {s.note}
          </div>
        )}

        {/* walk hint */}
        {s.walkHint && (
          <div className={cn(
            'absolute left-1/2 -translate-x-1/2 rounded-md bg-black/75 px-3.5 py-2 text-[13px] text-white',
            compact ? 'top-[64px] w-max max-w-[calc(100vw-24px)] text-center' : 'top-16 whitespace-nowrap',
          )}>
            {s.walkHint}
          </div>
        )}

        {compact ? (
          <>
            {/* spec 014: one line of title on the left, Views and Settings on the right */}
            <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
              {/* spec 007: "All houses" works before the build starts too, above the intro's backdrop */}
              <a href="/" className={cn('pointer-events-auto relative z-20 flex h-10 min-w-0 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold', paper)}>
                <ArrowLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="sr-only">All houses: </span>
                <span className="truncate">{text.name}</span>
              </a>
              <div className="pointer-events-auto flex gap-1.5">
                {s.mode === 'orbit' && <ViewsMenu house={house} h={h} />}
                <NumbersMenu house={house} compact />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Settings" className={cn('size-10 rounded-lg', paper)}>
                      <SlidersHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[calc(100dvh-72px)] w-60 overflow-y-auto">
                    <DropdownMenuLabel>Camera</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={s.mode} onValueChange={(v) => h.onMode(v as 'orbit' | 'walk')}>
                      <DropdownMenuRadioItem value="orbit">Orbit</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="walk">Walk</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuLabel>Roof</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={roof} onValueChange={(v) => onRoof(v as 'on' | 'off')}>
                      <DropdownMenuRadioItem value="on">With roof</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="off">No roof</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuLabel>Light</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={s.light} onValueChange={(v) => h.onLight(v as 'day' | 'dusk')}>
                      <DropdownMenuRadioItem value="day">Day</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dusk">Dusk</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuLabel>Build speed</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={String(s.speed)} onValueChange={(v) => h.onSpeed(Number(v))}>
                      {['1', '4', '16'].map((v) => <DropdownMenuRadioItem key={v} value={v}>{v}×</DropdownMenuRadioItem>)}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    {s.mode === 'orbit' && (
                      <>
                        <DropdownMenuItem onSelect={() => h.onCam('home')}><Home /> Default view</DropdownMenuItem>
                        <DropdownMenuCheckboxItem checked={s.autoRotate} onCheckedChange={() => h.onCam('auto')}>
                          Auto-rotate
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                    {fullscreenOk && <DropdownMenuItem onSelect={() => h.onCam('full')}><Expand /> Fullscreen</DropdownMenuItem>}
                    <DropdownMenuItem onSelect={h.onRestart}><RotateCcw /> Restart</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Share</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => h.onShare?.('link')}><Link2 /> Copy link</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => h.onShare?.('image')}><ImageDown /> Save image</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="text-[11px] leading-snug text-muted-foreground">
                      <a href={OSM_URL} target="_blank" rel="noopener">{CREDIT}</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* spec 014: one-row bar */}
            <div className={cn('pointer-events-auto absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5', paper)}>
              {playButton}
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 text-[11px] leading-tight">
                  <span className="truncate font-semibold">{phaseLabel}</span>
                  <span className="whitespace-nowrap text-muted-foreground tabular-nums" title={count}>
                    {s.placed.toLocaleString('en-US')} / {s.pieces.toLocaleString('en-US')}
                  </span>
                </div>
                {timeline}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmt(Math.min(t, s.total))}</span>
              <Button variant="outline" size="sm" onClick={h.onFinish}>Finish</Button>
            </div>
          </>
        ) : (
          <>
            {/* top: title and toggles */}
            <div className="absolute inset-x-3.5 top-3.5 flex flex-wrap items-start justify-between gap-2.5">
              {/* spec 007: "All houses" works before the build starts too, above the intro's backdrop */}
              <div className={cn('pointer-events-auto relative z-20 rounded-md px-3 py-2', paper)}>
                <a href="/" className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-3" aria-hidden /> All houses
                </a>
                <div className="text-[13px] font-semibold">{text.name}</div>
                <div className="hidden text-[11px] text-muted-foreground sm:block">{text.address}</div>
              </div>
              <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
                <Seg size="sm" label="Camera mode" value={s.mode} onChange={(m) => h.onMode(m)} items={[['orbit', 'Orbit'], ['walk', 'Walk']]} />
                <Seg size="sm" label="Roof" value={roof} onChange={onRoof} items={[['on', 'Roof'], ['off', 'No roof']]} />
                <Seg size="sm" label="Light" value={s.light} onChange={(v) => h.onLight(v)} items={[['day', 'Day'], ['dusk', 'Dusk']]} />
              </div>
            </div>

            {/* OSM credit: under the toggles (003-A11) */}
            <a
              href={OSM_URL}
              target="_blank"
              rel="noopener"
              className="pointer-events-auto absolute top-[70px] right-3.5 rounded bg-background/60 px-1.5 py-0.5 text-[10px] text-foreground/60 hover:text-foreground hover:underline"
            >
              {CREDIT}
            </a>

            {/* camera controls (spec 006) */}
            {s.mode === 'orbit' && (
              <div role="toolbar" aria-label="Camera" data-testid="camctl" className="pointer-events-auto absolute top-1/2 right-3.5 flex -translate-y-1/2 flex-col gap-1.5">
                <ViewsMenu house={house} h={h} />
                <CamButton label="Zoom in" keyHint="+" onClick={() => h.onCam('in')}><Plus /></CamButton>
                <CamButton label="Zoom out" keyHint="−" onClick={() => h.onCam('out')}><Minus /></CamButton>
                <CamButton label="Rotate left" keyHint="←" onClick={() => h.onCam('left')}><RotateCcw /></CamButton>
                <CamButton label="Rotate right" keyHint="→" onClick={() => h.onCam('right')}><RotateCw /></CamButton>
                <CamButton label="Default view" keyHint="H" onClick={() => h.onCam('home')}><Home /></CamButton>
                <CamButton label="Auto-rotate" keyHint="R" pressed={s.autoRotate} onClick={() => h.onCam('auto')}><Repeat /></CamButton>
                {fullscreenOk && <CamButton label="Fullscreen" onClick={() => h.onCam('full')}><Expand /></CamButton>}
                <ShareMenu h={h} />
                <NumbersMenu house={house} compact={false} />
              </div>
            )}

            {/* bottom bar */}
            <div className={cn('pointer-events-auto absolute inset-x-3.5 bottom-3.5 flex flex-nowrap items-center gap-2.5 rounded-lg px-3 py-2', paper)}>
              {playButton}
              <Seg
                label="Speed"
                size="sm"
                value={String(s.speed)}
                onChange={(v) => h.onSpeed(Number(v))}
                items={[['1', '1×'], ['4', '4×'], ['16', '16×']]}
              />
              <div className="min-w-[120px] flex-1">
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <span className="truncate font-semibold">{phaseLabel}</span>
                  <span className="whitespace-nowrap text-muted-foreground tabular-nums">{count}</span>
                </div>
                {timeline}
              </div>
              <span className="w-9 shrink-0 text-xs text-muted-foreground tabular-nums">{fmt(Math.min(t, s.total))}</span>
              <Button variant="outline" size="sm" onClick={h.onFinish}>Finish</Button>
              <Button variant="outline" size="sm" onClick={h.onRestart}>Restart</Button>
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

/** Same API main.ts used with the old vanilla Hud class. */
export function mountHud(parent: HTMLElement, h: HudHandlers, total: number, pieces: number, house: HudHouse) {
  const store = createHudStore({
    t: 0, total, playing: false, speed: 1, placed: 0, pieces, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [], light: 'day', hidden: false, chromeHidden: false,
  } satisfies HudSnapshot);
  const el = document.createElement('div');
  el.className = 'hud-root';
  parent.appendChild(el);
  createRoot(el).render(<Hud store={store} h={h} house={house} />);
  return {
    store,
    update: (s: HudState) => store.set(s),
    setPhaseTicks: (phaseStart: number[], t: number) => store.set({ phaseStart, total: t }),
    setMode: (mode: 'orbit' | 'walk') => store.set({ mode, chromeHidden: false }),
    /** spec 014: a tap on the scene (only takes effect in the phone layout) */
    toggleChrome: () => store.set({ chromeHidden: !store.get().chromeHidden }),
    setWalkHint: (walkHint: string) => store.set({ walkHint }),
    setAutoRotate: (autoRotate: boolean) => store.set({ autoRotate }),
    setLight: (light: 'day' | 'dusk') => store.set({ light }),
    hide: () => store.set({ hidden: true }),
    /** spec 037: a brief note ("Link copied"), cleared after a couple of seconds */
    note: (note: string) => {
      store.set({ note });
      setTimeout(() => { if (store.get().note === note) store.set({ note: '' }); }, 2200);
    },
  };
}
export type HudApi = ReturnType<typeof mountHud>;
