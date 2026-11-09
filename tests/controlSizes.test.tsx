// @vitest-environment jsdom
// Spec: specs/032-control-sizes.md
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
const show = async () => {
  const store = createHudStore({
    t: 0, total: 228.7, playing: false, speed: 1, placed: 0, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0], light: 'day', hidden: false, chromeHidden: false,
  });
  render(<Hud compact={false} store={store} h={h()} house={{ text: STAHL.text, views: STAHL.views, phaseNames: STAHL.phases.map((p) => p.name) }} />);
  await act(async () => { screen.getByRole('button', { name: /Start building/ }).click(); });
};

describe('032: matching corners, one size smaller', () => {
  it('A1: the top toggles are small, in --radius frames, their segments concentric', async () => {
    await show();
    for (const name of ['Walk', 'No roof', 'Dusk']) {
      const g = screen.getByRole('radio', { name }).closest('[data-slot="toggle-group"]')!;
      expect(g.getAttribute('data-size'), name).toBe('sm');
      expect(g.className, name).toMatch(/\brounded-lg\b/);
      for (const item of g.querySelectorAll('[role="radio"]')) expect(item.className, name).toMatch(/rounded-\[calc\(var\(--radius\)-2px\)\]/);
    }
  });

  it('A2: the camera buttons and Views are 36 px with --radius corners', async () => {
    await show();
    const buttons = [...screen.getByRole('toolbar', { name: 'Camera' }).querySelectorAll('button')];
    expect(buttons.length).toBeGreaterThan(5);
    for (const b of buttons) {
      expect(b.className, b.getAttribute('aria-label') ?? '').toMatch(/\bsize-9\b/);
      expect(b.className, b.getAttribute('aria-label') ?? '').toMatch(/\brounded-lg\b/);
      expect(b.className).not.toMatch(/\bsize-10\b/);
    }
  });
});
