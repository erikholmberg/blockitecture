// @vitest-environment jsdom
// Spec: specs/015-two-across-cards.md (A1)
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses/index';

const doc = new DOMParser().parseFromString(renderToString(<HomePage houses={HOUSES} />), 'text/html');

describe('015: two cards across', () => {
  it('A1: 1 column on phones, 2 from sm, never 3 or more', () => {
    const grid = doc.querySelector('main')!;
    const cls = [...grid.classList];
    expect(cls).toContain('grid-cols-1');
    expect(cls).toContain('sm:grid-cols-2');
    const cols = cls.map((c) => c.match(/(?:^|:)grid-cols-(\d+)$/)).filter(Boolean).map((m) => Number(m![1]));
    expect(Math.max(...cols)).toBe(2);
  });
});
