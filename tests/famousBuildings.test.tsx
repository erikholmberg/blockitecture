// @vitest-environment jsdom
// Spec: specs/030-famous-buildings.md
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';

describe('030: famous buildings', () => {
  it('A1: the headline, the home title and the credits description say "famous buildings"', () => {
    const doc = new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');
    expect(doc.querySelector('h1')?.textContent).toBe('Famous buildings, built block by block');
    expect(readFileSync('index.html', 'utf8')).toMatch(/<title>Blockitecture: famous buildings, built block by block<\/title>/);
    expect(readFileSync('credits/index.html', 'utf8')).toMatch(/for the famous buildings rebuilt from toy blocks/);
    for (const s of [doc.body.innerHTML, readFileSync('index.html', 'utf8'), readFileSync('credits/index.html', 'utf8')]) expect(s).not.toMatch(/famous houses/i);
  });
});
