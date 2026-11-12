// @vitest-environment jsdom
// Spec: specs/070-views-button-size-on-phones.md
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { STAHL } from '../src/houses/stahl-house/definition';

beforeAll(() => { globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any; });
afterEach(cleanup);
const h = (): HudHandlers => ({
  onStart: vi.fn(), onPlayPause: vi.fn(), onSpeed: vi.fn(), onSeek: vi.fn(), onFinish: vi.fn(), onRestart: vi.fn(),
  onMode: vi.fn(), onLight: vi.fn(), onRoof: vi.fn(), onCam: vi.fn(),
});
const show = async (compact: boolean) => {
  const store = createHudStore({
    t: 0, total: 228.7, playing: false, speed: 1, placed: 0, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0], light: 'day', hidden: false, chromeHidden: false,
  });
  render(<Hud compact={compact} store={store} h={h()} house={{ text: STAHL.text, views: STAHL.views, stats: STAHL.stats, phaseNames: STAHL.phases.map((p) => p.name) }} />);
  await act(async () => { screen.getByRole('button', { name: /Start building/ }).click(); });
};

describe('070: Views is the same size as its neighbours on phones', () => {
  it('A1: on a phone, Views, By the numbers and Settings are all 40 px with the same corners', async () => {
    await show(true);
    for (const name of ['Views', 'By the numbers', 'Settings']) {
      const b = screen.getByRole('button', { name });
      expect(b.className, name).toMatch(/\bsize-10\b/);
      expect(b.className, name).not.toMatch(/\bsize-9\b/);
      expect(b.className, name).toMatch(/\brounded-lg\b/);
    }
  });

  it('A2: on a wide screen Views is still 36 px', async () => {
    await show(false);
    const b = screen.getByRole('button', { name: 'Views' });
    expect(b.className).toMatch(/\bsize-9\b/);
    expect(b.className).not.toMatch(/\bsize-10\b/);
  });
});
