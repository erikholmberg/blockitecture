// @vitest-environment jsdom
// Spec: specs/024-built-by.md
import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';

const doc = (html: string) => new DOMParser().parseFromString(html, 'text/html');

describe('024: built by Erik Holmberg', () => {
  const footer = doc(renderToString(<HomePage houses={HOUSES} />)).querySelector('footer')!;

  it('A1: the footer starts "Built by Erik Holmberg." with the name linked to erikholmberg.com', () => {
    expect(footer.textContent?.trim()).toMatch(/^Built by Erik Holmberg\./);
    const link = [...footer.querySelectorAll('a')].find((a) => a.textContent === 'Erik Holmberg');
    expect(link?.getAttribute('href')).toBe('https://erikholmberg.com');
  });

  it('A2: the fan-tribute line moved: not in the footer, still on the credits page', () => {
    expect(footer.textContent).not.toMatch(/Fan tributes/);
    expect(doc(renderToString(<CreditsPage houses={HOUSES} />)).body.textContent).toMatch(/fan tribute in a generic toy-block style, not affiliated with the people or organisations named with it/); // spec 046: no LEGO Group
  });
});
