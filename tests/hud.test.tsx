// @vitest-environment jsdom
// Spec: specs/007-home-page.md (A3): the React HUD calls the right handlers and keeps 006's camera-control rules.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { STAHL } from '../src/houses/stahl-house/definition';

beforeAll(() => {
  // browser APIs Radix uses that jsdom lacks
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(cleanup);

const handlers = (): HudHandlers => ({
  onStart: vi.fn(), onPlayPause: vi.fn(), onSpeed: vi.fn(), onSeek: vi.fn(), onFinish: vi.fn(), onRestart: vi.fn(),
  onMode: vi.fn(), onLight: vi.fn(), onRoof: vi.fn(), onCam: vi.fn(),
});
const setup = () => {
  const store = createHudStore({
    t: 10, total: 228.7, playing: false, speed: 1, placed: 100, pieces: 27222, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0, 17.5], light: 'day', hidden: false, chromeHidden: false,
  });
  const h = handlers();
  render(<Hud compact={false} store={store} h={h} house={{ text: STAHL.text, views: STAHL.views, phaseNames: STAHL.phases.map((p) => p.name) }} />);
  return { store, h, user: userEvent.setup() };
};

describe('007: React HUD wiring', () => {
  it('A3: intro → Start building', async () => {
    const { h, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Start building' }));
    expect(h.onStart).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Start building' })).toBeNull();
  });

  it('A3: camera buttons call onCam with the right action and have aria-labels (006-A7)', async () => {
    const { h, user } = setup();
    const cases: [string, string][] = [
      ['Zoom in', 'in'], ['Zoom out', 'out'], ['Rotate left', 'left'], ['Rotate right', 'right'],
      ['Default view', 'home'], ['Auto-rotate', 'auto'],
    ];
    for (const [label, action] of cases) {
      await user.click(screen.getByRole('button', { name: label }));
      expect(h.onCam).toHaveBeenLastCalledWith(action);
    }
  });

  it('A3: the Views menu lists the four views and selects one', async () => {
    const { h, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Views' }));
    const items = await screen.findAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Overview', 'The famous view', 'Pool', 'Hills & basin']);
    await user.click(screen.getByRole('menuitem', { name: 'The famous view' }));
    expect(h.onCam).toHaveBeenLastCalledWith('view:famous');
  });

  it('A3: toggles call their handlers (mode, roof, light, speed)', async () => {
    const { h, user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Dusk' }));
    expect(h.onLight).toHaveBeenCalledWith('dusk');
    await user.click(screen.getByRole('radio', { name: 'No roof' }));
    expect(h.onRoof).toHaveBeenCalledWith(false);
    await user.click(screen.getByRole('radio', { name: '16×' }));
    expect(h.onSpeed).toHaveBeenCalledWith(16);
    await user.click(screen.getByRole('radio', { name: 'Walk' }));
    expect(h.onMode).toHaveBeenCalledWith('walk');
  });

  it('A3: play, finish, restart and the timeline slider', async () => {
    const { h, user } = setup();
    await user.click(screen.getByRole('button', { name: /Play/ }));
    expect(h.onPlayPause).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(h.onFinish).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Restart' }));
    expect(h.onRestart).toHaveBeenCalledOnce();
    const slider = screen.getByRole('slider', { name: 'Build timeline' });
    fireEvent.keyDown(slider, { key: 'End' });
    expect(h.onSeek).toHaveBeenLastCalledWith(228.7);
  });

  it('A3: after keyboard scrubbing, the timeline follows the engine again (regression)', () => {
    const { store, h } = setup();
    const slider = screen.getByRole('slider', { name: 'Build timeline' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(h.onSeek).toHaveBeenLastCalledWith(11); // 1 s steps
    act(() => store.set({ t: 228.7 })); // e.g. "F" finishes the build
    expect(slider.getAttribute('aria-valuenow')).toBe('228.7');
  });

  it('A3: the camera column is hidden in Walk mode and shows auto-rotate state (006-A4, A5)', () => {
    const { store } = setup();
    expect(screen.getByRole('toolbar', { name: 'Camera' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Auto-rotate' }).getAttribute('aria-pressed')).toBe('true');
    act(() => store.set({ autoRotate: false }));
    expect(screen.getByRole('button', { name: 'Auto-rotate' }).getAttribute('aria-pressed')).toBe('false');
    act(() => store.set({ mode: 'walk' }));
    expect(screen.queryByRole('toolbar', { name: 'Camera' })).toBeNull();
  });

  it('A3: shows the phase, piece count, the OSM credit and the way home', () => {
    setup();
    expect(screen.getByText('Shaping the hillside')).toBeTruthy();
    expect(screen.getByText('100 / 27,222 pieces')).toBeTruthy();
    expect(screen.getByRole('link', { name: /OpenStreetMap contributors/ }).getAttribute('href')).toBe('https://www.openstreetmap.org/copyright');
    expect(screen.getByRole('link', { name: /All houses/ }).getAttribute('href')).toBe('/');
  });
});
