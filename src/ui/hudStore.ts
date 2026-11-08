/** Spec 007: tiny external store the engine (main.ts) pushes HUD state into; React reads it with useSyncExternalStore. */
export interface HudSnapshot {
  t: number;
  total: number;
  playing: boolean;
  speed: number;
  placed: number;
  pieces: number;
  phase: number;
  mode: 'orbit' | 'walk';
  walkHint: string;
  autoRotate: boolean;
  phaseStart: number[];
  light: 'day' | 'dusk';
  hidden: boolean;
}

export function createHudStore(initial: HudSnapshot) {
  let snap = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => snap,
    set(patch: Partial<HudSnapshot>) {
      let changed = false;
      for (const k in patch) if ((patch as any)[k] !== (snap as any)[k]) { changed = true; break; }
      if (!changed) return;
      snap = { ...snap, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
export type HudStore = ReturnType<typeof createHudStore>;
