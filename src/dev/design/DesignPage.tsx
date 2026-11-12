/**
 * Dev-only page for comparing looks before they go in a spec. Served by `npm run dev` at /dev/design/; not in PAGES
 * (vite.config.ts), so it is never built or deployed. Spec 066: the finish options for the sun's glare; spec 067
 * made soft satin the default.
 * The pictures are made by scripts/design-shots.mjs from the running dev server.
 */
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { FINISHES, DEFAULT_FINISH, type FinishKey } from '@/engine/finish';
import { SCENES, liveUrl, type Scene } from '@/dev/design/scenes';

const SHOTS = import.meta.glob<string>('./*.jpg', { eager: true, import: 'default' });
const shot = (scene: Scene, finish: string) => SHOTS[`./${scene.key}-${finish}.jpg`];
const KEYS = Object.keys(FINISHES) as FinishKey[];

function Shot({ scene, finish }: { scene: Scene; finish: FinishKey }) {
  const [today, setToday] = useState(false);
  const f = FINISHES[finish];
  const isToday = finish === DEFAULT_FINISH;
  return (
    <figure className="overflow-hidden rounded-lg border bg-card">
      <img
        src={shot(scene, today ? DEFAULT_FINISH : finish)} alt={`${scene.title}: ${f.label}`} loading="lazy"
        className={`block aspect-[8/5] w-full select-none ${isToday ? '' : 'cursor-pointer'}`} draggable={false}
        onPointerDown={() => !isToday && setToday(true)} onPointerUp={() => setToday(false)} onPointerLeave={() => setToday(false)}
      />
      <figcaption className="flex items-start justify-between gap-3 p-3">
        <div>
          <div className="text-sm font-semibold">{today ? FINISHES[DEFAULT_FINISH].label : f.label}</div>
          <div className="text-xs text-muted-foreground">{f.note}</div>
        </div>
        <a href={liveUrl(scene, finish)} target="_blank" rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium underline-offset-4 hover:underline">
          Live <ExternalLink className="size-3" />
        </a>
      </figcaption>
    </figure>
  );
}

export function DesignPage() {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Design: the sun's glare</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Dev only. With the old gloss, flat surfaces turned white looking towards the sun; soft satin (1b) replaced it
        in spec 067. Each picture is the same view in one finish. Hold a picture down to see today's finish in its place; "Live" opens the
        building in that finish so you can orbit it.
      </p>
      {SCENES.map((scene) => (
        <section key={scene.key} className="mt-10">
          <h2 className="text-lg font-semibold">{scene.title}</h2>
          <p className="text-sm text-muted-foreground">{scene.why}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {KEYS.map((k) => <Shot key={k} scene={scene} finish={k} />)}
          </div>
        </section>
      ))}
    </main>
  );
}
