// @vitest-environment jsdom
// Spec: specs/050-palette-and-numbers.md
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NumbersPanel } from '../src/engine/ui/NumbersPanel';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';
import { STATS } from '../src/houses/stats';

const doc = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

describe('050: palette and numbers on the page', () => {
  it('A3: each live card has a palette strip, one segment per colour, widths in proportion, hidden from screen readers', () => {
    const home = doc(renderToString(<HomePage houses={HOUSES} />));
    for (const h of HOUSES) {
      const strip = home.querySelector(`[data-house="${h.slug}"] [data-palette]`);
      if (h.status !== 'live') { expect(strip, h.slug).toBeNull(); continue; }
      expect(strip, h.slug).not.toBeNull();
      expect(strip!.getAttribute('aria-hidden'), h.slug).toBe('true');
      const segs = [...strip!.children] as HTMLElement[];
      const pal = STATS[h.slug].palette;
      expect(segs.length, h.slug).toBe(pal.length);
      segs.forEach((el, i) => {
        expect(el.style.backgroundColor.replace(/\s/g, ''), h.slug).toBe(rgb(pal[i].color));
        expect(parseFloat(el.style.flexGrow), h.slug).toBeCloseTo(pal[i].share, 3);
      });
    }
  });

  it('A4: the panel renders the figures, says they\'re the model\'s, gives feet and metres', () => {
    const st = STATS['fallingwater'];
    const text = doc(renderToString(<NumbersPanel stats={st} phaseNames={['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']} />)).body.textContent ?? '';
    expect(text).toMatch(/By the numbers/);
    expect(text).toMatch(/this model/i);
    expect(text).toContain(st.pieces.toLocaleString('en-US'));
    expect(text).toContain(st.housePieces.toLocaleString('en-US'));
    expect(text).toMatch(new RegExp(`${Math.round(st.heightFt)} ft \\(${Math.round(st.heightFt * 0.3048)} m\\)`));
    expect(text).toMatch(/ft²/);
    expect(text).toMatch(/m²/);
    expect(text).toContain(`${Math.round(st.glassShare * 100)}%`);
    void hex;
  });
});

function rgb(c: number) {
  return `rgb(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255})`;
}
