// @vitest-environment jsdom
// Spec: specs/082-finding-your-way.md
import { readFileSync } from 'node:fs';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HOUSES, navList } from '../src/houses/index';
import {
  applyFilters, chipCount, eraOf, formatQuery, newestFirst, parseQuery, toggle,
} from '../src/home/filter';
import { isTyping, keyTarget, neighbours } from '../src/engine/nav';
import { Hud, HudHandlers } from '../src/engine/ui/Hud';
import { createHudStore } from '../src/engine/ui/hudStore';
import { STAHL } from '../src/houses/stahl-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as any;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => { cleanup(); history.replaceState(null, '', '/'); });

const live = HOUSES.filter((h) => h.status === 'live');
const slugs = (hs: { slug: string }[]) => hs.map((h) => h.slug);
const SIX = ['neue-nationalgalerie', 'trellick-tower', 'habitat-67', 'church-of-the-light', 'salk-institute', 'centre-pompidou'];

describe('082: finding your way among the buildings', () => {
  // ---------- registry ----------
  it('A1: every building has a type and a region; a landmark is exactly one whose definition sets text.noun', () => {
    for (const h of HOUSES) {
      expect(['house', 'landmark'], h.slug).toContain(h.type);
      expect(['us-west', 'us-east', 'europe', 'elsewhere'], h.slug).toContain(h.region);
      const def = readFileSync(`src/houses/${h.slug}/definition.ts`, 'utf8');
      expect(h.type, h.slug).toBe(/\bnoun: '/.test(def) ? 'landmark' : 'house');
    }
    expect(live.filter((h) => h.type === 'landmark')).toHaveLength(10);
    expect(live.filter((h) => h.type === 'house')).toHaveLength(22);
  });

  it('A2: regions 10 / 6 / 11 / 5; eras from the year 9 / 13 / 10, with 1930 and 1960 opening their eras', () => {
    const count = (f: (h: (typeof live)[number]) => string) =>
      live.reduce<Record<string, number>>((a, h) => ({ ...a, [f(h)]: (a[f(h)] ?? 0) + 1 }), {});
    expect(count((h) => h.region)).toEqual({ 'us-west': 10, 'us-east': 6, europe: 11, elsewhere: 5 });
    expect(count((h) => eraOf(h.year))).toEqual({ 'before-1930': 9, '1930': 13, '1960': 10 });
    expect([eraOf(1929), eraOf(1930), eraOf(1959), eraOf(1960)]).toEqual(['before-1930', '1930', '1930', '1960']);
  });

  // ---------- home page ----------
  const home = () => new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');

  it('A3: one card per building, newest first; the New badge on the last four added only', () => {
    const doc = home();
    const cards = [...doc.querySelectorAll('[data-house]')];
    expect(cards.map((c) => c.getAttribute('data-house'))).toEqual(slugs([...live].reverse()));
    const badged = cards.filter((c) => c.querySelector('[data-new]')).map((c) => c.getAttribute('data-house'));
    expect(badged.sort()).toEqual(slugs(live.slice(-4)).sort());
    for (const c of cards.filter((c) => c.querySelector('[data-new]'))) expect(c.querySelector('[data-new]')!.textContent).toBe('New');
  });

  it('A4: 1 column on phones, 2 from sm, 3 from lg, never more', () => {
    const cls = [...home().querySelector('main')!.classList];
    for (const c of ['grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3']) expect(cls).toContain(c);
    const cols = cls.map((c) => c.match(/(?:^|:)grid-cols-(\d+)$/)).filter(Boolean).map((m) => Number(m![1]));
    expect(Math.max(...cols)).toBe(3);
  });

  it('A5: groups combine; each chip counts under the other groups\' choices; clearing gives back all 32', () => {
    const f = toggle(toggle({}, 'type', 'landmark'), 'era', '1960');
    expect(slugs(applyFilters(newestFirst(HOUSES), f)).sort()).toEqual([...SIX].sort());
    // with Landmarks picked, Europe would show the landmarks in Europe
    const lmEurope = live.filter((h) => h.type === 'landmark' && h.region === 'europe').length;
    expect(chipCount(live, { type: 'landmark' }, 'region', 'europe')).toBe(lmEurope);
    // a chip in an already-chosen group counts as if it replaced that choice
    expect(chipCount(live, f, 'era', 'before-1930')).toBe(live.filter((h) => h.type === 'landmark' && h.year < 1930).length);
    // picking the chosen chip again turns it off
    expect(toggle(f, 'era', '1960')).toEqual({ type: 'landmark' });
    expect(applyFilters(live, toggle(toggle(f, 'era', '1960'), 'type', 'landmark'))).toHaveLength(32);
  });

  it('A6: filters round-trip through the address; unknown keys and values are ignored; none is no query', () => {
    const q = '?type=landmark&era=1960&region=europe';
    expect(formatQuery(parseQuery(q))).toBe(q);
    expect(parseQuery('?era=1960&type=landmark')).toEqual({ type: 'landmark', era: '1960' });
    expect(parseQuery('?type=castle&era=1800&colour=red&region=europe')).toEqual({ region: 'europe' });
    expect(formatQuery({})).toBe('');
    expect(formatQuery(parseQuery(''))).toBe('');
  });

  it('A7: rendered on the server, all 32 cards and no filter applied', () => {
    const doc = home();
    expect(doc.querySelectorAll('[data-house]')).toHaveLength(32);
    expect(doc.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0);
    expect(doc.body.textContent).toContain('32 buildings');
  });

  it('A8: with a query in the address, only the matching cards and their count; with none, "No buildings match" and Clear filters', async () => {
    history.replaceState(null, '', '/?type=landmark&era=1960');
    const { container } = render(<HomePage houses={HOUSES} />);
    await act(async () => {});
    expect(slugs([...container.querySelectorAll('[data-house]')].map((c) => ({ slug: c.getAttribute('data-house')! }))).sort()).toEqual([...SIX].sort());
    expect(container.textContent).toContain('6 buildings');
    expect(screen.getByRole('button', { name: /Landmarks/ }).getAttribute('aria-pressed')).toBe('true');
    cleanup();

    // no landmark from 1930–1959 stands outside the US and Europe
    history.replaceState(null, '', '/?type=landmark&era=1930&region=elsewhere');
    const r = render(<HomePage houses={HOUSES} />);
    await act(async () => {});
    expect(r.container.querySelectorAll('[data-house]')).toHaveLength(0);
    expect(r.container.textContent).toContain('No buildings match');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(r.container.querySelectorAll('[data-house]')).toHaveLength(32);
    expect(location.search).toBe('');
  });

  // ---------- inside a building ----------
  it('A9: navList is every live building, newest first; prev and next wrap around; the engine imports nothing from src/houses', () => {
    const list = navList();
    expect(slugs(list)).toEqual(slugs([...live].reverse()));
    expect(neighbours(list, list[0].slug).prev!.slug).toBe(list[list.length - 1].slug);
    expect(neighbours(list, list[list.length - 1].slug).next!.slug).toBe(list[0].slug);
    expect(neighbours(list, 'stahl-house')).toMatchObject({ prev: { slug: 'eames-house' }, next: { slug: list[0].slug } });
    for (const h of live) expect(readFileSync(`src/houses/${h.slug}/main.ts`, 'utf8'), h.slug).toMatch(/navList\(\)/);
  });

  const handlers = (): HudHandlers => ({
    onStart: vi.fn(), onPlayPause: vi.fn(), onSpeed: vi.fn(), onSeek: vi.fn(), onFinish: vi.fn(), onRestart: vi.fn(),
    onMode: vi.fn(), onLight: vi.fn(), onRoof: vi.fn(), onCam: vi.fn(),
  });
  const hud = (compact: boolean, def = STAHL) => {
    const store = createHudStore({
      t: 0, total: 100, playing: false, speed: 1, placed: 0, pieces: 1000, phase: 0,
      mode: 'orbit', walkHint: '', autoRotate: true, phaseStart: [0], light: 'day', hidden: false, chromeHidden: false,
    });
    return render(<Hud compact={compact} store={store} h={handlers()} house={{
      slug: def.slug, buildings: navList(), text: def.text, views: def.views, phaseNames: def.phases.map((p) => p.name),
    }} />);
  };

  it('A10: "← All buildings" links home above the intro; a menu button with the name; on desktop ‹ › link to the neighbours', () => {
    for (const compact of [false, true]) {
      const { container } = hud(compact);
      expect(screen.getByRole('link', { name: /All buildings/ }).getAttribute('href')).toBe('/');
      expect(screen.getByRole('button', { name: /Stahl House/ }).getAttribute('aria-haspopup')).toBeTruthy();
      const z = (el: Element) => Number(/(?:^|\s)z-(\d+)(?:\s|$)/.exec(el.className)?.[1] ?? 0);
      const backdrop = container.querySelector('[data-intro]')!.parentElement!;
      const menu = screen.getByRole('button', { name: /Stahl House/ });
      let el: Element | null = menu, above = false;
      while (el && el !== container) { if (z(el) > z(backdrop)) { above = true; break; } el = el.parentElement; }
      expect(above, compact ? 'phone' : 'desktop').toBe(true);
      if (!compact) {
        expect(screen.getByRole('link', { name: /Previous building: Eames House/ }).getAttribute('href')).toBe('/eames-house/');
        expect(screen.getByRole('link', { name: /Next building: Schindler House/ }).getAttribute('href')).toBe('/schindler-house/');
      }
      cleanup();
    }
  });

  it('A11: the menu lists every building with architect · year, linked; the current one is marked (desktop and phone)', async () => {
    for (const compact of [false, true]) {
      hud(compact, FALLINGWATER);
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Fallingwater/ }));
      const list = await screen.findByRole('list', { name: 'All buildings' });
      const links = within(list).getAllByRole('link');
      expect(links.map((a) => a.getAttribute('href'))).toEqual(navList().map((b) => `/${b.slug}/`));
      expect(list.textContent).toContain('Frank Lloyd Wright · 1939');
      const current = links.filter((a) => a.getAttribute('aria-current') === 'page');
      expect(current.map((a) => a.getAttribute('href'))).toEqual(['/fallingwater/']);
      if (compact) {
        expect(screen.getByRole('link', { name: /Previous/ })).toBeTruthy();
        expect(screen.getByRole('link', { name: /Next/ })).toBeTruthy();
      }
      cleanup();
    }
  });

  it('A12: [ and ] go to the previous and next building; ignored while typing', () => {
    const list = navList();
    expect(keyTarget('BracketLeft', list, 'stahl-house')).toBe('/eames-house/');
    expect(keyTarget('BracketRight', list, 'stahl-house')).toBe(`/${list[0].slug}/`);
    expect(keyTarget('KeyP', list, 'stahl-house')).toBeNull();
    expect(isTyping(document.createElement('input'))).toBe(true);
    expect(isTyping(document.createElement('textarea'))).toBe(true);
    expect(isTyping(document.createElement('canvas'))).toBe(false);
    expect(isTyping(null)).toBe(false);
    expect(readFileSync('src/engine/viewer.ts', 'utf8')).toMatch(/keyTarget\(/);
  });

  it('A13: "All houses" is gone from the HUD and the credits page; "All buildings" is there', () => {
    for (const compact of [false, true]) {
      const { container } = hud(compact);
      expect(container.textContent).not.toMatch(/All houses/);
      cleanup();
    }
    const credits = renderToString(<CreditsPage houses={HOUSES} />);
    expect(credits).not.toMatch(/All houses/);
    expect(credits).toMatch(/All buildings/);
    expect(readFileSync('src/engine/ui/Hud.tsx', 'utf8')).not.toMatch(/All houses/);
  });
});
