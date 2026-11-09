// @vitest-environment jsdom
// Spec: specs/026-intro-card.md
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import type { HouseDefinition } from '../src/engine/house';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { STAHL } from '../src/houses/stahl-house/definition';

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
});
afterEach(cleanup);

const handlers = (): HudHandlers => ({
  onStart: vi.fn(), onPlayPause: vi.fn(), onSpeed: vi.fn(), onSeek: vi.fn(), onFinish: vi.fn(), onRestart: vi.fn(),
  onMode: vi.fn(), onLight: vi.fn(), onRoof: vi.fn(), onCam: vi.fn(),
});
const show = (house: HouseDefinition, compact: boolean) => {
  const store = createHudStore({
    t: 0, total: 228.7, playing: false, speed: 1, placed: 0, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0], light: 'day', hidden: false, chromeHidden: false,
  });
  const { container } = render(<Hud compact={compact} store={store} h={handlers()} house={{ text: house.text, views: house.views, phaseNames: house.phases.map((p) => p.name) }} />);
  return container.querySelector('[data-intro]')!;
};

describe('026: a tighter intro card', () => {
  it('A1: eyebrow, the house\'s name as the title (without "block by block"), the text with the piece count, Start building', () => {
    const card = show(STAHL, false);
    expect(card.textContent).toContain(STAHL.text.eyebrow);
    const title = card.querySelector('h2')!;
    expect(title.textContent).toBe('The Stahl House');
    expect(title.textContent).not.toMatch(/block by block/);
    expect(card.textContent).toContain('27,233');
    expect([...card.querySelectorAll('button')].some((b) => b.textContent?.includes('Start building'))).toBe(true);
  });

  it('A2: three labelled hints in the footer band: orbit, zoom, walk on desktop; orbit, pinch, tap-to-hide on phones', () => {
    for (const [compact, want] of [[false, ['Drag to orbit', 'Scroll to zoom', 'Walk to explore']], [true, ['Drag to orbit', 'Pinch to zoom', 'Tap to hide controls']]] as const) {
      const card = show(STAHL, compact);
      const footer = card.querySelector('[data-intro-footer]')!;
      expect([...footer.querySelectorAll('[data-hint]')].map((h) => h.textContent)).toEqual(want);
      cleanup();
    }
  });

  it('A3: the disclaimer and, on phones, the map credit are in the footer band; no "brick"', () => {
    const desk = show(FALLINGWATER, false);
    const footer = desk.querySelector('[data-intro-footer]')!;
    expect(footer.textContent).toContain(FALLINGWATER.text.disclaimer!);
    expect(footer.textContent).not.toMatch(/OpenStreetMap/);
    expect(desk.textContent).not.toMatch(/brick/i);
    cleanup();
    const phone = show(FALLINGWATER, true);
    expect(phone.querySelector('[data-intro-footer] a[href*="openstreetmap"]')).not.toBeNull();
  });
});
