// @vitest-environment jsdom
// Spec: specs/029-landmark-buildings.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';

describe('029: landmark buildings', () => {
  it('A1: the home text and meta description say "Landmark buildings", and never "modernist"', () => {
    const page = renderToString(<HomePage houses={HOUSES} />);
    const html = readFileSync('index.html', 'utf8');
    expect(page).toMatch(/Landmark buildings rebuilt from toy blocks in your browser/);
    expect(html).toMatch(/<meta name="description" content="Landmark buildings rebuilt from toy blocks in your browser/);
    for (const s of [page, html]) expect(s).not.toMatch(/modernist/i);
  });
});
