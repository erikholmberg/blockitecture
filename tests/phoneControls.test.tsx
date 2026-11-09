// @vitest-environment jsdom
// Spec: specs/014-phone-controls.md (A1–A4)
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hud, HudHandlers, mountHud } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { isTap, TAP_MOVE, TAP_MS } from '../src/engine/controls/tap';
import { STAHL } from '../src/houses/stahl-house/definition';

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(cleanup);

const house = { text: STAHL.text, views: STAHL.views, phaseNames: STAHL.phases.map((p) => p.name) };
const handlers = (): HudHandlers => ({
  onStart: vi.fn(), onPlayPause: vi.fn(), onSpeed: vi.fn(), onSeek: vi.fn(), onFinish: vi.fn(), onRestart: vi.fn(),
  onMode: vi.fn(), onLight: vi.fn(), onRoof: vi.fn(), onCam: vi.fn(),
});
const setup = (compact: boolean) => {
  const store = createHudStore({
    t: 10, total: 228.7, playing: false, speed: 1, placed: 100, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0, 17.5], light: 'day', hidden: false, chromeHidden: false,
  });
  const h = handlers();
  render(<Hud compact={compact} store={store} h={h} house={house} />);
  return { store, h, user: userEvent.setup() };
};
const start = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Start building' }));
const openSettings = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Settings' }));
  return screen.findByRole('menu');
};

describe('014: phone controls', () => {
  it('A1: compact shows no camera column, no toggle groups and no credit outside the menu', async () => {
    const { user } = setup(true);
    // the intro card carries the credit on phones (the first thing every visit sees)
    expect(screen.getByRole('link', { name: /OpenStreetMap contributors/ })).toBeTruthy();
    await start(user);
    expect(screen.queryByRole('toolbar', { name: 'Camera' })).toBeNull();
    for (const g of ['Camera mode', 'Roof', 'Light', 'Speed']) expect(screen.queryByRole('group', { name: g })).toBeNull();
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByRole('link', { name: /OpenStreetMap contributors/ })).toBeNull();
    expect(screen.getByRole('link', { name: /All houses/ }).getAttribute('href')).toBe('/');
    expect(screen.getByRole('slider', { name: 'Build timeline' })).toBeTruthy();
  });

  it('A1: the Settings menu drives mode, roof, light, speed, default view, auto-rotate and restart, and holds the credit', async () => {
    const { h, user } = setup(true);
    await start(user);
    const pick = async (role: 'menuitemradio' | 'menuitemcheckbox' | 'menuitem', name: string | RegExp) => {
      const menu = await openSettings(user);
      await user.click(within(menu).getByRole(role, { name }));
    };
    await pick('menuitemradio', 'Walk');
    expect(h.onMode).toHaveBeenLastCalledWith('walk');
    await pick('menuitemradio', 'No roof');
    expect(h.onRoof).toHaveBeenLastCalledWith(false);
    await pick('menuitemradio', 'Dusk');
    expect(h.onLight).toHaveBeenLastCalledWith('dusk');
    await pick('menuitemradio', '16×');
    expect(h.onSpeed).toHaveBeenLastCalledWith(16);
    await pick('menuitem', 'Default view');
    expect(h.onCam).toHaveBeenLastCalledWith('home');
    await pick('menuitemcheckbox', 'Auto-rotate');
    expect(h.onCam).toHaveBeenLastCalledWith('auto');
    await pick('menuitem', 'Restart');
    expect(h.onRestart).toHaveBeenCalledOnce();
    const menu = await openSettings(user);
    expect(within(menu).getByRole('menuitem', { name: /OpenStreetMap contributors/ }).getAttribute('href'))
      .toBe('https://www.openstreetmap.org/copyright');
  });

  it('A1: Views still lists the four views on phones', async () => {
    const { h, user } = setup(true);
    await start(user);
    await user.click(screen.getByRole('button', { name: 'Views' }));
    const items = await screen.findAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Overview', 'The famous view', 'Pool', 'Hills & basin']);
    await user.click(screen.getByRole('menuitem', { name: 'Pool' }));
    expect(h.onCam).toHaveBeenLastCalledWith('view:pool');
  });

  it('A1: play and finish stay in the one-row bar', async () => {
    const { h, user } = setup(true);
    await start(user);
    await user.click(screen.getByRole('button', { name: /Play/ }));
    expect(h.onPlayPause).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(h.onFinish).toHaveBeenCalledOnce();
  });

  it('A3: a tap is one still, quick pointer', () => {
    expect(TAP_MOVE).toBe(8);
    expect(TAP_MS).toBe(300);
    expect(isTap({ dx: 0, dy: 0, dt: 120, pointers: 1 })).toBe(true);
    expect(isTap({ dx: 5, dy: -5, dt: 299, pointers: 1 })).toBe(true);
    expect(isTap({ dx: 8, dy: 0, dt: 100, pointers: 1 })).toBe(false); // a drag
    expect(isTap({ dx: 6, dy: 6, dt: 100, pointers: 1 })).toBe(false); // 8.5 px diagonally
    expect(isTap({ dx: 0, dy: 0, dt: 300, pointers: 1 })).toBe(false); // a long press
    expect(isTap({ dx: 0, dy: 0, dt: 100, pointers: 2 })).toBe(false); // a pinch
  });

  it('A4: chromeHidden hides everything but the progress line on phones, and toggles back', async () => {
    const { store, user } = setup(true);
    await start(user);
    act(() => store.set({ chromeHidden: true }));
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('slider')).toBeNull();
    expect(screen.getByTestId('progress-line')).toBeTruthy();
    act(() => store.set({ chromeHidden: false }));
    expect(screen.getByRole('button', { name: 'Settings' })).toBeTruthy();
    expect(screen.queryByTestId('progress-line')).toBeNull();
  });

  it('A4: chromeHidden has no effect on wide screens', async () => {
    const { store, user } = setup(false);
    await start(user);
    act(() => store.set({ chromeHidden: true }));
    expect(screen.getByRole('toolbar', { name: 'Camera' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Build timeline' })).toBeTruthy();
  });

  it('A4: mountHud: toggleChrome flips it, setMode resets it', () => {
    const api = mountHud(document.body, handlers(), 228.7, 27233, house);
    expect(api.store.get().chromeHidden).toBe(false);
    api.toggleChrome();
    expect(api.store.get().chromeHidden).toBe(true);
    api.toggleChrome();
    api.toggleChrome();
    api.setMode('walk');
    expect(api.store.get().chromeHidden).toBe(false);
  });
});
