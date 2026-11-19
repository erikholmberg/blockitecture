/**
 * Spec 083: plays the soundtrack without costing the scene anything.
 * - Nothing is made or downloaded until the first sync(true), which the viewer calls from the visitor's press.
 * - One plain audio element with preload="none": the browser streams and decodes it on its own threads. (Decoding the
 *   whole track with Web Audio would hold about 100 MB of samples and stall the page while it decodes.)
 * - It never asks the viewer for a frame, so a resting scene stays at rest (spec 069). The only timer is the fade-in,
 *   about 30 short ticks, once.
 */
export type AudioLike = Pick<HTMLAudioElement, 'src' | 'loop' | 'volume' | 'paused' | 'pause'> & {
  preload: string;
  play(): Promise<void> | void;
  addEventListener?(type: 'playing', listener: () => void, options: { once: true }): void;
};

const FADE_MS = 1500;
const FADE_STEP_MS = 50;

export function createMusicPlayer(src: string, make: () => AudioLike = () => new Audio()) {
  let el: AudioLike | null = null;

  /** The level is in the file; this only fades the start in. iPhones ignore `volume`, so there it simply starts. */
  const fadeIn = (a: AudioLike) => {
    const t0 = Date.now();
    const timer = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / FADE_MS);
      a.volume = k;
      if (k >= 1) clearInterval(timer);
    }, FADE_STEP_MS);
  };

  return {
    /** Play or pause to match `on` (see shouldPlay in music.ts). Safe to call as often as you like. */
    sync(on: boolean) {
      if (!on) { el?.pause(); return; }
      if (!el) {
        el = make();
        el.preload = 'none';
        el.loop = true;
        el.src = src;
        // fade from the moment sound actually comes out, not from the press (the first bytes take a moment)
        const a = el;
        a.volume = 0;
        if (a.addEventListener) a.addEventListener('playing', () => fadeIn(a), { once: true });
        else fadeIn(a);
      }
      if (!el.paused) return;
      // a browser may refuse (no press yet, or its own autoplay rules): stay silent, don't break the page
      try { void Promise.resolve(el.play()).catch(() => {}); } catch { /* same */ }
    },
  };
}

/** localStorage, or null where the browser blocks it (reading the property can itself throw). */
export function browserStorage(): Storage | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}
