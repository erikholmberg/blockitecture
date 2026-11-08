/**
 * Spec 007: the viewer's controls in React + shadcn/ui (replaces the vanilla src/ui/hud.ts).
 * main.ts keeps the engine, keyboard and camera logic and drives this through mountHud()'s small API.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, Expand, Eye, Home, Minus, Pause, Play, Plus, RotateCcw, RotateCw, Repeat,
} from 'lucide-react';
import type { HouseDefinition } from '@/engine/house';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { createHudStore, HudSnapshot, HudStore } from '@/engine/ui/hudStore';

export type CamAction = 'in' | 'out' | 'left' | 'right' | 'home' | 'auto' | 'full' | `view:${string}`;

/** What the HUD shows about the house (spec 010a). */
export type HudHouse = Pick<HouseDefinition, 'text' | 'views'> & { phaseNames: string[] };

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
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
// no backdrop-blur: over the WebGL canvas it re-blurs the scene under every panel each frame
// (measured −22% fps at dpr 3, spec 007-A7)
const paper = 'bg-background/90 shadow-sm ring-1 ring-foreground/10';
const toggleOn = 'data-[state=on]:bg-foreground data-[state=on]:text-background';

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
      className={cn('rounded-md p-0.5', paper)}
    >
      {items.map(([v, text]) => (
        <ToggleGroupItem key={v} value={v} className={cn('px-3', toggleOn)}>
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
          className={cn('size-10', paper, pressed && 'bg-foreground text-background hover:bg-foreground/90 hover:text-background')}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{keyHint ? `${label} (${keyHint})` : label}</TooltipContent>
    </Tooltip>
  );
}

export function Hud({ store, h, house }: { store: HudStore; h: HudHandlers; house: HudHouse }) {
  const { text } = house;
  const s = useSyncExternalStore(store.subscribe, store.get);
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
  const fullscreenOk = typeof document !== 'undefined' && document.fullscreenEnabled;
  if (s.hidden) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="pointer-events-none fixed inset-0 font-sans text-foreground select-none" data-mode={s.mode}>
        {/* intro */}
        {!started && (
          <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-b from-black/15 to-black/45 p-5">
            <Card className="w-full max-w-md shadow-2xl">
              <CardHeader>
                <CardDescription className="text-[11px] tracking-[0.14em] uppercase">
                  {text.eyebrow}
                </CardDescription>
                <CardTitle className="text-3xl leading-tight font-bold tracking-tight">
                  {text.headline[0]}
                  <br />
                  {text.headline[1]}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {text.intro[0]}{' '}
                  <b className="text-foreground">{s.pieces.toLocaleString('en-US')}</b> {text.intro[1]}
                </p>
                <Button size="lg" className="h-11 w-fit px-5 text-[15px]" onClick={() => { setStarted(true); h.onStart(); }}>
                  Start building
                </Button>
                <p className="text-xs text-muted-foreground">
                  Drag to orbit · scroll to zoom · camera buttons on the right · <b>Walk</b> mode for first person
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* top: title and toggles */}
        <div className="absolute inset-x-3.5 top-3.5 flex flex-wrap items-start justify-between gap-2.5">
          <div className={cn('pointer-events-auto rounded-md px-3 py-2', paper)}>
            <a href="/" className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3" aria-hidden /> All houses
            </a>
            <div className="text-[13px] font-semibold">{text.name}</div>
            <div className="hidden text-[11px] text-muted-foreground sm:block">{text.address}</div>
          </div>
          <div className="pointer-events-auto flex flex-wrap justify-end gap-2">
            <Seg label="Camera mode" value={s.mode} onChange={(m) => h.onMode(m)} items={[['orbit', 'Orbit'], ['walk', 'Walk']]} />
            <Seg label="Roof" value={roof} onChange={(v) => { setRoof(v); h.onRoof(v === 'on'); }} items={[['on', 'Roof'], ['off', 'No roof']]} />
            <Seg label="Light" value={s.light} onChange={(v) => h.onLight(v)} items={[['day', 'Day'], ['dusk', 'Dusk']]} />
          </div>
        </div>

        {/* OSM credit: under the toggles on wide screens, above the bar on phones (003-A11) */}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener"
          className="pointer-events-auto absolute bottom-[124px] left-3.5 rounded bg-background/60 px-1.5 py-0.5 text-[10px] text-foreground/60 hover:text-foreground hover:underline md:top-[70px] md:right-3.5 md:bottom-auto md:left-auto"
        >
          © OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles
        </a>

        {/* walk hint */}
        {s.walkHint && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 rounded-md bg-black/75 px-3.5 py-2 text-[13px] whitespace-nowrap text-white">
            {s.walkHint}
          </div>
        )}

        {/* camera controls (spec 006) */}
        {s.mode === 'orbit' && (
          <div role="toolbar" aria-label="Camera" data-testid="camctl" className="pointer-events-auto absolute top-1/2 right-3.5 flex -translate-y-1/2 flex-col gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Views" className={cn('size-10', paper)}>
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
            <CamButton label="Zoom in" keyHint="+" onClick={() => h.onCam('in')}><Plus /></CamButton>
            <CamButton label="Zoom out" keyHint="−" onClick={() => h.onCam('out')}><Minus /></CamButton>
            <CamButton label="Rotate left" keyHint="←" onClick={() => h.onCam('left')}><RotateCcw /></CamButton>
            <CamButton label="Rotate right" keyHint="→" onClick={() => h.onCam('right')}><RotateCw /></CamButton>
            <CamButton label="Default view" keyHint="H" onClick={() => h.onCam('home')}><Home /></CamButton>
            <CamButton label="Auto-rotate" keyHint="R" pressed={s.autoRotate} onClick={() => h.onCam('auto')}><Repeat /></CamButton>
            {fullscreenOk && <CamButton label="Fullscreen" onClick={() => h.onCam('full')}><Expand /></CamButton>}
          </div>
        )}

        {/* bottom bar */}
        <div className={cn('pointer-events-auto absolute inset-x-3.5 bottom-3.5 flex flex-wrap items-center gap-2.5 rounded-lg px-3 py-2 md:flex-nowrap', paper)}>
          <Button size="icon" className="size-9 shrink-0 rounded-full" aria-label={s.playing ? 'Pause (P)' : 'Play (P)'} title="Play / pause (P)" onClick={h.onPlayPause}>
            {s.playing ? <Pause /> : <Play />}
          </Button>
          <Seg
            label="Speed"
            size="sm"
            value={String(s.speed)}
            onChange={(v) => h.onSpeed(Number(v))}
            items={[['1', '1×'], ['4', '4×'], ['16', '16×']]}
          />
          <div className="order-first min-w-[120px] basis-full md:order-none md:flex-1 md:basis-auto">
            <div className="mb-1 flex justify-between gap-2 text-xs">
              <span className="truncate font-semibold">{done ? text.complete : house.phaseNames[s.phase]}</span>
              <span className="whitespace-nowrap text-muted-foreground tabular-nums">
                {s.placed.toLocaleString('en-US')} / {s.pieces.toLocaleString('en-US')} pieces
              </span>
            </div>
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
          </div>
          <span className="w-9 shrink-0 text-xs text-muted-foreground tabular-nums">{fmt(Math.min(t, s.total))}</span>
          <Button variant="outline" size="sm" onClick={h.onFinish}>Finish</Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={h.onRestart}>Restart</Button>
        </div>
      </div>
    </TooltipProvider>
  );
}

/** Same API main.ts used with the old vanilla Hud class. */
export function mountHud(parent: HTMLElement, h: HudHandlers, total: number, pieces: number, house: HudHouse) {
  const store = createHudStore({
    t: 0, total, playing: false, speed: 1, placed: 0, pieces, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [], light: 'day', hidden: false,
  } satisfies HudSnapshot);
  const el = document.createElement('div');
  el.className = 'hud-root';
  parent.appendChild(el);
  createRoot(el).render(<Hud store={store} h={h} house={house} />);
  return {
    store,
    update: (s: HudState) => store.set(s),
    setPhaseTicks: (phaseStart: number[], t: number) => store.set({ phaseStart, total: t }),
    setMode: (mode: 'orbit' | 'walk') => store.set({ mode }),
    setWalkHint: (walkHint: string) => store.set({ walkHint }),
    setAutoRotate: (autoRotate: boolean) => store.set({ autoRotate }),
    setLight: (light: 'day' | 'dusk') => store.set({ light }),
    hide: () => store.set({ hidden: true }),
  };
}
export type HudApi = ReturnType<typeof mountHud>;
