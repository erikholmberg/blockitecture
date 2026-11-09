// @vitest-environment jsdom
// Spec: specs/023-off-white-pages.md
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';

const css = readFileSync('src/styles/globals.css', 'utf8');
const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
const token = (name: string) => root.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

/** OKLCH → relative luminance (WCAG), via OKLab → linear sRGB */
function luminance(oklch: string) {
  const [L, C, h] = oklch.match(/oklch\(([^)]+)\)/)![1].trim().split(/\s+/).map(Number);
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const r = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}
const contrast = (x: string, y: string) => { const [p, q] = [luminance(x), luminance(y)].sort((u, v) => v - u); return (p + 0.05) / (q + 0.05); };

describe('023: an off-white page background', () => {
  it('A1: --page is warm paper, and the home and credits pages use it', () => {
    expect(token('page')).toBe('oklch(0.982 0.008 85)');
    expect(css).toMatch(/--color-page:\s*var\(--page\)/);
    for (const html of [renderToString(<HomePage houses={HOUSES} />), renderToString(<CreditsPage houses={HOUSES} />)]) {
      const outer = new DOMParser().parseFromString(html, 'text/html').body.firstElementChild!;
      expect(outer.className).toMatch(/\bbg-page\b/);
    }
  });

  it('A2: the background and the cards stay white (the viewer is untouched)', () => {
    expect(token('background')).toBe('oklch(1 0 0)');
    expect(token('card')).toBe('oklch(1 0 0)');
  });

  it('A3: the muted text still meets WCAG AA (4.5:1) on the new background', () => {
    expect(contrast(token('muted-foreground')!, token('page')!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token('foreground')!, token('page')!)).toBeGreaterThanOrEqual(7);
  });
});
