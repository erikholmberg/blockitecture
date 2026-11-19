// @vitest-environment jsdom
// Spec: specs/083-jazz-while-building.md
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { MUSIC, MUTED_KEY, readMuted, shouldPlay, writeMuted } from '../src/engine/music';
import { createMusicPlayer, type AudioLike } from '../src/engine/musicPlayer';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HOUSES } from '../src/houses';
import { STAHL } from '../src/houses/stahl-house/definition';

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(cleanup);

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const blocked = {
  getItem(): string | null { throw new Error('blocked'); },
  setItem(): void { throw new Error('blocked'); },
};

const house = { text: STAHL.text, views: STAHL.views, phaseNames: STAHL.phases.map((p) => p.name) };
const setup = async (compact: boolean, muted: boolean, start = true) => {
  const store = createHudStore({
    t: 10, total: 228.7, playing: false, speed: 1, placed: 100, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0, 17.5], light: 'day', hidden: false, chromeHidden: false,
    muted,
  });
  const h: HudHandlers = {
    onStart: vi.fn(), onPlayPause: vi.fn(), onSpeed: vi.fn(), onSeek: vi.fn(), onFinish: vi.fn(), onRestart: vi.fn(),
    onMode: vi.fn(), onLight: vi.fn(), onRoof: vi.fn(), onCam: vi.fn(), onMute: vi.fn(),
  };
  render(<Hud compact={compact} store={store} h={h} house={house} />);
  const user = userEvent.setup();
  if (start) await user.click(screen.getByRole('button', { name: 'Start building' }));
  // before the start the intro card's switch is "Music on" / "Music off"; the bottom bar's adds the key, "(M)"
  return { h, user, button: screen.getByRole('button', { name: start ? /^Music .*\(M\)$/ : /^Music (on|off)$/ }) };
};

const fakeAudio = () => {
  const made: (AudioLike & { plays: number; pauses: number })[] = [];
  const make = () => {
    const a = {
      src: '', preload: '', loop: false, volume: 1, paused: true, plays: 0, pauses: 0,
      play() { a.plays++; a.paused = false; return Promise.resolve(); },
      pause() { a.pauses++; a.paused = true; },
    };
    made.push(a);
    return a;
  };
  return { made, make };
};

describe('083: jazz while the buildings go up', () => {
  it('A1: music plays only when started, not muted and the tab is visible', () => {
    expect(shouldPlay({ started: true, muted: false, hidden: false })).toBe(true);
    expect(shouldPlay({ started: false, muted: false, hidden: false })).toBe(false);
    expect(shouldPlay({ started: true, muted: true, hidden: false })).toBe(false);
    expect(shouldPlay({ started: true, muted: false, hidden: true })).toBe(false);
  });

  it('A2: the choice is saved, music is off until it is switched on, and blocked storage is survived', () => {
    const s = memory();
    expect(readMuted(s)).toBe(true);
    writeMuted(s, false);
    expect(s.getItem(MUTED_KEY)).not.toBeNull();
    expect(readMuted(s)).toBe(false);
    writeMuted(s, true);
    expect(readMuted(s)).toBe(true);
    expect(readMuted(null)).toBe(true);
    expect(() => writeMuted(null, false)).not.toThrow();
    expect(readMuted(blocked)).toBe(true);
    expect(() => writeMuted(blocked, false)).not.toThrow();
  });

  it('A3: the wide bottom bar has a mute button that shows its state and calls the handler', async () => {
    const on = await setup(false, false);
    expect(on.button.getAttribute('aria-pressed')).toBe('true');
    await on.user.click(on.button);
    expect(on.h.onMute).toHaveBeenCalledTimes(1);
    cleanup();
    const off = await setup(false, true);
    expect(off.button.getAttribute('aria-pressed')).toBe('false');
  });

  it('A4: the phone bottom bar has the same button, 36 px like the play button', async () => {
    const { button, h, user } = await setup(true, false);
    expect(button.className).toContain('size-9');
    expect(screen.getByRole('button', { name: /^(Play|Pause)/ }).className).toContain('size-9');
    expect(button.parentElement).toBe(screen.getByRole('button', { name: 'Finish' }).parentElement);
    await user.click(button);
    expect(h.onMute).toHaveBeenCalledTimes(1);
  });

  it('A5: the credits page credits the track, its composer and its licence', () => {
    const doc = new DOMParser().parseFromString(renderToString(<CreditsPage houses={HOUSES} />), 'text/html');
    const section = doc.querySelector('[data-credits="music"]')!;
    expect(section).toBeTruthy();
    expect(section.textContent).toContain('Airport Lounge');
    expect(section.textContent).toContain('Kevin MacLeod');
    const links = [...section.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links.some((l) => l?.startsWith('https://incompetech.com'))).toBe(true);
    expect(links).toContain('https://creativecommons.org/licenses/by/4.0/');
  });

  it('A6: the track is in public/ at the path the player uses, at most 5 MB', () => {
    const file = `public/${MUSIC.path}`;
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeLessThanOrEqual(5 * 1024 * 1024);
  });

  it('A22: the intro card says the build has music, and switches it off or on without starting', async () => {
    for (const compact of [false, true]) {
      const on = await setup(compact, false, false);
      expect(on.button.closest('[data-intro]')).toBeTruthy();
      expect(on.button.textContent).toBe('Music on');
      expect(on.button.getAttribute('aria-pressed')).toBe('true');
      await on.user.click(on.button);
      expect(on.h.onMute).toHaveBeenCalledTimes(1);
      expect(on.h.onStart).not.toHaveBeenCalled();
      cleanup();
      const off = await setup(compact, true, false);
      expect(off.button.textContent).toBe('Music off');
      expect(off.button.getAttribute('aria-pressed')).toBe('false');
      cleanup();
    }
  });

  it('A19: no audio element until first told to play; then one, not preloaded, looping', () => {
    const { made, make } = fakeAudio();
    const player = createMusicPlayer('/music/x.mp3', make);
    expect(made.length).toBe(0);
    player.sync(false);
    expect(made.length).toBe(0);
    player.sync(true);
    expect(made.length).toBe(1);
    expect(made[0]).toMatchObject({ src: '/music/x.mp3', preload: 'none', loop: true, plays: 1 });
    player.sync(true); // already playing: nothing more to do
    expect(made[0].plays).toBe(1);
    player.sync(false);
    expect(made[0].paused).toBe(true);
    player.sync(true);
    expect(made.length).toBe(1);
    expect(made[0].plays).toBe(2);
  });

  it('A19: a refused play() is swallowed', async () => {
    const { make } = fakeAudio();
    const player = createMusicPlayer('/music/x.mp3', () => ({ ...make(), play: () => Promise.reject(new Error('NotAllowedError')) }));
    expect(() => player.sync(true)).not.toThrow();
    await Promise.resolve();
  });

  it('A20: the music modules ask for no frame, no redraw and no Web Audio', () => {
    for (const f of ['src/engine/music.ts', 'src/engine/musicPlayer.ts']) {
      const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
      expect(code).not.toMatch(/requestAnimationFrame|askRedraw|AudioContext/);
    }
  });
});
