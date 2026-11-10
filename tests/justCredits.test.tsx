// @vitest-environment jsdom
// Spec: specs/049-just-credits.md
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';

const doc = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const home = doc(renderToString(<HomePage houses={HOUSES} />));
const credits = doc(renderToString(<CreditsPage houses={HOUSES} />));
const creditsHtml = readFileSync('credits/index.html', 'utf8');

describe('049: just "Credits"', () => {
  it('A1: no "disclaimer" in the home footer, the credits page, or its title and description', () => {
    expect(home.querySelector('footer')?.textContent).not.toMatch(/disclaimer/i);
    expect(credits.body.textContent).not.toMatch(/disclaimer/i);
    expect(creditsHtml.match(/<title>([^<]*)<\/title>/)?.[1]).not.toMatch(/disclaimer/i);
    expect(creditsHtml.match(/<meta name="description" content="([^"]*)"/)?.[1]).not.toMatch(/disclaimer/i);
  });

  it('A2: the footer link reads "Credits" and goes to /credits/; the page\'s heading reads "Credits"', () => {
    const link = home.querySelector('footer a[href="/credits/"]');
    expect(link?.textContent?.trim()).toBe('Credits');
    expect(credits.querySelector('h1')?.textContent?.trim()).toBe('Credits');
    expect(creditsHtml).toMatch(/<title>Credits · Blockitecture<\/title>/);
    expect(creditsHtml).toMatch(/<meta name="description" content="Credits and sources for the famous buildings rebuilt from toy blocks on Blockitecture\." \/>/);
  });
});
