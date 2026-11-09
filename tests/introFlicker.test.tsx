// @vitest-environment jsdom
// Spec: specs/036-intro-flicker.md
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { exposureAt, INTRO_EXPOSURE, INTRO_FADE } from '../src/engine/introDim';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { STAHL } from '../src/houses/stahl-house/definition';

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
});
afterEach(cleanup);

const mount = (compact: boolean) => {
  const store = createHudStore({
    t: 0, total: 228.7, playing: false, speed: 1, placed: 0, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0, 17.5], light: 'day', hidden: false, chromeHidden: false,
  });
  const h = Object.fromEntries(['onStart', 'onPlayPause', 'onSpeed', 'onSeek', 'onFinish', 'onRestart', 'onMode', 'onLight', 'onRoof', 'onCam'].map((k) => [k, vi.fn()])) as unknown as HudHandlers;
  return render(<Hud compact={compact} store={store} h={h} house={{ text: STAHL.text, views: STAHL.views, phaseNames: STAHL.phases.map((p) => p.name) }} />);
};

describe('036: no flicker behind the intro card', () => {
  for (const compact of [false, true]) {
    it(`A1: nothing translucent covers the whole screen while the intro shows (${compact ? 'phone' : 'desktop'})`, () => {
      const { container } = mount(compact);
      const card = container.querySelector('[data-intro]')!;
      expect(card).not.toBeNull();
      const backdrop = card.parentElement!;
      expect(backdrop.className).not.toMatch(/(^|\s)(bg-|from-|to-|via-)/);
      // no full-screen element anywhere in the HUD has a semi-transparent fill
      for (const el of container.querySelectorAll<HTMLElement>('.inset-0, .fixed')) expect(el.className, el.className).not.toMatch(/bg-[a-z]+(-\d+)?\/\d+|from-|bg-gradient/);
    });

    it(`A3: the card has its own compositing layer and no large soft shadow (${compact ? 'phone' : 'desktop'})`, () => {
      const { container } = mount(compact);
      const card = container.querySelector<HTMLElement>('[data-intro]')!;
      expect(card.className).toMatch(/(^|\s)transform-gpu(\s|$)/);
      expect(card.className).not.toMatch(/shadow-2xl/);
    });
  }

  it('A2: the scene is dimmed by exposure before Start, and fades back to 1 after it', () => {
    expect(INTRO_EXPOSURE).toBeGreaterThan(0.5);
    expect(INTRO_EXPOSURE).toBeLessThan(0.9);
    expect(exposureAt(null)).toBe(INTRO_EXPOSURE);
    expect(exposureAt(0)).toBe(INTRO_EXPOSURE);
    expect(exposureAt(INTRO_FADE / 2)).toBeGreaterThan(INTRO_EXPOSURE);
    expect(exposureAt(INTRO_FADE / 2)).toBeLessThan(1);
    expect(exposureAt(INTRO_FADE)).toBe(1);
    expect(exposureAt(60)).toBe(1);
    expect(INTRO_FADE).toBeCloseTo(0.5, 5);
  });
});
