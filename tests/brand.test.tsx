// @vitest-environment jsdom
// Spec: specs/008-quantico-logo-favicon.md (A1, A2)
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses/index';

describe('008: Quantico wordmark and B favicon', () => {
  it('A1: the wordmark is Quantico, bold, all caps, with no brick icon', () => {
    const doc = new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');
    const mark = doc.querySelector('[data-logo]')!;
    expect(mark.textContent).toBe('Blockitecture');
    expect(mark.className).toMatch(/\bfont-logo\b/);
    expect(mark.className).toMatch(/\bfont-bold\b/);
    expect(mark.className).toMatch(/\buppercase\b/);
    expect(doc.querySelector('header svg')).toBeNull();
  });

  it('A1: Quantico is wired up as the logo font', () => {
    const css = readFileSync('src/styles/globals.css', 'utf8');
    expect(css).toContain('@fontsource/quantico/latin-700.css');
    expect(css).toMatch(/--font-logo:\s*'Quantico'/);
  });

  it('A2: the favicon is the B outline, black on orange', () => {
    const svg = readFileSync('public/favicon.svg', 'utf8');
    expect(svg).not.toMatch(/<text/);
    expect(svg).toMatch(/<rect[^>]*fill="#e8892c"/);
    expect(svg).toMatch(/<path[^>]*fill="#000"/);
    expect(existsSync('public/apple-touch-icon.png')).toBe(true);
  });

  it('A2: both pages link the favicon (and no old inline brick icon)', () => {
    for (const f of ['index.html', 'stahl-house/index.html']) {
      const html = readFileSync(f, 'utf8');
      expect(html).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />');
      expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />');
      expect(html).not.toContain('data:image/svg+xml');
    }
  });
});
