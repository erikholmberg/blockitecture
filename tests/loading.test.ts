// Spec: specs/027-loading-animation.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PAGES } from '../vite.config';
import { HOUSES } from '../src/houses';

const housePages = Object.entries(PAGES).filter(([name]) => HOUSES.some((h) => h.slug === name && h.status === 'live'));
const html = (path: string) => readFileSync(path, 'utf8');
const loader = (s: string) => s.match(/<div id="loading">[\s\S]*?<span>[^<]*<\/span>\s*<\/div>/)?.[0];
const style = (s: string) => s.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';

describe('027: a spinning brick while the house loads', () => {
  it('A1: every house page has the same loader: the brick and "Sorting blocks…"', () => {
    expect(housePages.length).toBe(HOUSES.filter((h) => h.status === 'live').length);
    const first = loader(html(housePages[0][1]));
    expect(first).toBeTruthy();
    expect(first).toMatch(/class="lb"/); // the spinning 2×4, its five faces
    expect(first).toMatch(/Sorting blocks…/);
    expect(first).not.toMatch(/brick/i); // spec 013: not even in class names
    for (const [name, path] of housePages) expect(loader(html(path)), name).toBe(first);
  });

  it('A2: its keyframes animate only transform and opacity, and reduced motion stops them', () => {
    for (const [name, path] of housePages) {
      const css = style(html(path));
      const frames = [...css.matchAll(/@keyframes\s+[\w-]+\s*\{([\s\S]*?\}\s*)\}/g)].map((m) => m[1]);
      expect(frames.length, name).toBeGreaterThan(0);
      for (const f of frames) for (const prop of f.matchAll(/([a-z-]+)\s*:/g)) expect(['transform', 'opacity'], name).toContain(prop[1]);
      expect(css, name).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*animation: none/);
    }
  });

  it('A3: the loader is styled inline in the page, before the bundle loads', () => {
    for (const [name, path] of housePages) {
      const s = html(path);
      expect(style(s), name).toMatch(/#loading/);
      expect(s.indexOf('<style>'), name).toBeLessThan(s.indexOf('<script'));
    }
    expect(readFileSync('src/engine/ui/styles.css', 'utf8')).not.toMatch(/\.spinner/);
  });
});
