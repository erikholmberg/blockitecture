// @vitest-environment jsdom
// Spec: specs/037-share-and-accessibility.md
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { motionSettings } from '../src/engine/motion';
import { POSTCARD, postcardCaption, postcardFileName, postcardLayout, readShare, shareLink, shareQuery } from '../src/engine/share';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { HOUSES } from '../src/houses';
import { STAHL } from '../src/houses/stahl-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(cleanup);

const handlers = () =>
  Object.fromEntries(['onStart', 'onPlayPause', 'onSpeed', 'onSeek', 'onFinish', 'onRestart', 'onMode', 'onLight', 'onRoof', 'onCam', 'onShare'].map((k) => [k, vi.fn()])) as unknown as HudHandlers & { onShare: ReturnType<typeof vi.fn> };
const mount = (compact: boolean) => {
  const store = createHudStore({
    t: 0, total: 228.7, playing: false, speed: 1, placed: 0, pieces: 27233, phase: 0,
    mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0, 17.5], light: 'day', hidden: false, chromeHidden: false,
  });
  const h = handlers();
  const r = render(<Hud compact={compact} store={store} h={h} house={{ text: STAHL.text, views: STAHL.views, phaseNames: STAHL.phases.map((p) => p.name) }} />);
  return { ...r, store, h, user: userEvent.setup() };
};

describe('037: accessibility', () => {
  it('A1: reduced motion turns off auto-rotate, makes glides instant and pieces appear in place', () => {
    expect(motionSettings(true)).toEqual({ autoRotate: false, glide: false, dropHeight: 0 });
    const normal = motionSettings(false);
    expect(normal.autoRotate).toBe(true);
    expect(normal.glide).toBe(true);
    expect(normal.dropHeight).toBe(9); // as before (BrickSet's drop)
  });

  it('A2: one polite live region announces each phase as it starts, and Complete at the end', async () => {
    const { container, store, user } = mount(false);
    const regions = container.querySelectorAll('[aria-live="polite"]');
    expect(regions.length).toBe(1);
    const live = regions[0];
    expect(live.textContent).toBe(''); // nothing before Start
    await user.click(screen.getByRole('button', { name: 'Start building' }));
    expect(live.textContent).toBe(`Now building: ${STAHL.phases[0].name}`);
    act(() => store.set({ t: 5, placed: 500 }));
    expect(live.textContent).toBe(`Now building: ${STAHL.phases[0].name}`); // unchanged within a phase
    act(() => store.set({ t: 20, phase: 1, placed: 3000 }));
    expect(live.textContent).toBe(`Now building: ${STAHL.phases[1].name}`);
    act(() => store.set({ t: 228.7, phase: STAHL.phases.length - 1, placed: 27233 }));
    expect(live.textContent).toBe('Complete');
  });

  for (const compact of [false, true]) {
    it(`A3: "See it finished" on the intro starts the viewer finished (${compact ? 'phone' : 'desktop'})`, async () => {
      const { h, user } = mount(compact);
      await user.click(screen.getByRole('button', { name: 'See it finished' }));
      expect(h.onStart).toHaveBeenCalledOnce();
      expect(h.onFinish).toHaveBeenCalledOnce();
      expect(screen.queryByRole('button', { name: 'Start building' })).toBeNull();
    });
  }
});

describe('037: share link', () => {
  const views = Object.keys(STAHL.views);
  it('A4: round-trips a named view, a free camera, dusk and the build time; leaves out t when finished', () => {
    const named = shareQuery({ view: 'famous', light: 'day', t: 42.37, total: 228.7 });
    expect(named).toBe('view=famous&t=42.4');
    expect(readShare(new URLSearchParams(named), views, 228.7)).toEqual({ view: 'famous', light: 'day', t: 42.4 });
    const cam: [number, number, number, number, number, number] = [12.345, 30, -7.06, 1, 2.04, 3];
    const free = shareQuery({ cam, light: 'dusk', t: 228.7, total: 228.7 });
    expect(free).toBe('cam=12.3,30,-7.1,1,2,3&light=dusk');
    expect(readShare(new URLSearchParams(free), views, 228.7)).toEqual({ cam: [12.3, 30, -7.1, 1, 2, 3], light: 'dusk' });
  });

  it('A4: ignores malformed values and unknown views', () => {
    const r = readShare(new URLSearchParams('view=nowhere&cam=1,2,x,4,5,6&t=-3&light=noon'), views, 228.7);
    expect(r).toEqual({ light: 'day' });
    expect(readShare(new URLSearchParams('cam=1,2,3&t=abc'), views, 228.7)).toEqual({ light: 'day' });
    expect(readShare(new URLSearchParams('cam=1,2,3,4,5,Infinity'), views, 228.7)).toEqual({ light: 'day' });
    // past the end: finished
    expect(readShare(new URLSearchParams('t=999'), views, 228.7)).toEqual({ light: 'day', t: 228.7 });
  });

  it('A5: desktop: a Share button with Copy link and Save image', async () => {
    const { h, user } = mount(false);
    await user.click(screen.getByRole('button', { name: 'Start building' }));
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Copy link' }));
    expect(h.onShare).toHaveBeenLastCalledWith('link');
    await user.click(screen.getByRole('button', { name: 'Share' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Save image' }));
    expect(h.onShare).toHaveBeenLastCalledWith('image');
  });

  it('A5: phones: both in the Settings menu', async () => {
    const { h, user } = mount(true);
    await user.click(screen.getByRole('button', { name: 'Start building' }));
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Copy link' }));
    expect(h.onShare).toHaveBeenLastCalledWith('link');
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Save image' }));
    expect(h.onShare).toHaveBeenLastCalledWith('image');
  });

  it('A6: the share sheet on touch devices that have one, otherwise the clipboard', async () => {
    const url = 'https://example.test/stahl-house/?view=famous';
    const share = vi.fn(async () => {}), writeText = vi.fn(async () => {});
    expect(await shareLink(url, 'Stahl House', { share, clipboard: { writeText } }, true)).toBe('shared');
    expect(share).toHaveBeenCalledWith({ url, title: 'Stahl House' });
    expect(writeText).not.toHaveBeenCalled();
    expect(await shareLink(url, 'Stahl House', { share, clipboard: { writeText } }, false)).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(url);
    expect(await shareLink(url, 'Stahl House', { clipboard: { writeText } }, true)).toBe('copied');
    // a cancelled share sheet isn't an error, and doesn't fall back to copying
    const cancelled = vi.fn(async () => { throw new DOMException('cancelled', 'AbortError'); });
    expect(await shareLink(url, 'Stahl House', { share: cancelled, clipboard: { writeText } }, true)).toBe('cancelled');
  });

  it('A6: "Link copied" shows after a copy', () => {
    const { store } = mount(false);
    act(() => store.set({ note: 'Link copied' }));
    expect(screen.getByText('Link copied')).toBeTruthy();
  });
});

describe('037: postcard', () => {
  it('A7: the caption: name, architect and year, the site, the credit; no "brick" or "LEGO"', () => {
    const lines = postcardCaption({ name: LOVELL.text.name, eyebrow: LOVELL.text.eyebrow }, 'blockitecture.example');
    expect(lines).toEqual([
      'Lovell Health House',
      'Richard Neutra · 1929',
      'Blockitecture · blockitecture.example',
      '© OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles',
    ]);
    for (const h of HOUSES) expect(h.slug).toMatch(/^[a-z-]+$/);
    expect(postcardFileName('lovell-health-house')).toBe('lovell-health-house.png');
    for (const l of lines) expect(l).not.toMatch(/brick|lego/i);
    const stahl = postcardCaption({ name: STAHL.text.name, eyebrow: STAHL.text.eyebrow }, 'x');
    expect(stahl[1]).toBe('Pierre Koenig · 1959–60');
  });

  it('A8: 1600 × 900, the scene above a caption band, both inside the image', () => {
    expect([POSTCARD.width, POSTCARD.height]).toEqual([1600, 900]);
    const { scene, band } = postcardLayout();
    expect(scene).toEqual({ x: 0, y: 0, w: 1600, h: 900 - POSTCARD.band });
    expect(band).toEqual({ x: 0, y: 900 - POSTCARD.band, w: 1600, h: POSTCARD.band });
    expect(POSTCARD.band).toBeGreaterThan(60);
    expect(POSTCARD.band).toBeLessThan(160);
  });
});
