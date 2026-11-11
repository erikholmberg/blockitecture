// @vitest-environment jsdom
// Spec: specs/021-footer-credits.md
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { PAGES } from '../vite.config';
import { CreditsPage } from '../src/credits/CreditsPage';
import { HomePage } from '../src/home/HomePage';
import { HOUSES } from '../src/houses';
import { EAMES } from '../src/houses/eames-house/definition';
import { FALLINGWATER } from '../src/houses/fallingwater/definition';
import { SCHRODER } from '../src/houses/rietveld-schroder-house/definition';
import { FARNSWORTH } from '../src/houses/farnsworth-house/definition';
import { ENNIS } from '../src/houses/ennis-house/definition';
import { MALAPARTE } from '../src/houses/casa-malaparte/definition';
import { KAUFMANN } from '../src/houses/kaufmann-desert-house/definition';
import { LOVELL } from '../src/houses/lovell-health-house/definition';
import { BARRAGAN } from '../src/houses/casa-luis-barragan/definition';
import { KOSHINO } from '../src/houses/koshino-house/definition';
import { SHEATS_GOLDSTEIN } from '../src/houses/sheats-goldstein-residence/definition';
import { ROSE_SEIDLER } from '../src/houses/rose-seidler-house/definition';
import { DOUGLAS } from '../src/houses/douglas-house/definition';
import { CHURCH_OF_THE_LIGHT } from '../src/houses/church-of-the-light/definition';
import { STAHL } from '../src/houses/stahl-house/definition';

const doc = (html: string) => new DOMParser().parseFromString(html, 'text/html');
const home = doc(renderToString(<HomePage houses={HOUSES} />));
const credits = doc(renderToString(<CreditsPage houses={HOUSES} />));
const creditsText = credits.body.textContent ?? '';
const live = HOUSES.filter((h) => h.status === 'live');
const DEFINITIONS = [STAHL, EAMES, FALLINGWATER, SCHRODER, FARNSWORTH, ENNIS, MALAPARTE, KAUFMANN, LOVELL, BARRAGAN, KOSHINO, SHEATS_GOLDSTEIN, ROSE_SEIDLER, DOUGLAS, CHURCH_OF_THE_LIGHT];

describe('021: a credits page', () => {
  it('A1: the home footer links to /credits/ and names no organisation', () => {
    const footer = home.querySelector('footer')!;
    expect([...footer.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toContain('/credits/');
    expect(footer.textContent).not.toMatch(/not affiliated/i);
    for (const h of live) for (const org of h.affiliations ?? []) expect(footer.textContent).not.toContain(org.replace(/^the /, ''));
    expect(footer.textContent).toContain('OpenStreetMap contributors');
  });

  it('A2: the credits page has the fan-tribute line, and each live house with its affiliations and sources', () => {
    // spec 046: the LEGO Group is no longer named; spec 048: nor the toy-block style
    expect(creditsText).toMatch(/fan tribute, not affiliated with/);
    for (const h of live) {
      const section = credits.querySelector(`[data-credits="${h.slug}"]`);
      expect(section, h.slug).not.toBeNull();
      expect(section!.textContent).toContain(h.title);
      for (const org of h.affiliations ?? []) expect(section!.textContent).toContain(org);
      expect(h.sources?.length, h.slug).toBeGreaterThan(0);
      for (const s of h.sources ?? []) expect(section!.textContent).toContain(s);
    }
    for (const h of HOUSES.filter((h) => h.status === 'coming-soon')) expect(credits.querySelector(`[data-credits="${h.slug}"]`)).toBeNull();
    expect(creditsText).toContain('OpenStreetMap contributors');
  });

  it('A3: each live house\'s affiliations match its intro-card disclaimer', () => {
    expect(DEFINITIONS.map((d) => d.slug).sort()).toEqual(live.map((h) => h.slug).sort());
    for (const d of DEFINITIONS) {
      const card = HOUSES.find((h) => h.slug === d.slug)!;
      // "… Not affiliated with A, B or C." → [A, B, C], minus the LEGO Group
      const m = d.text.disclaimer?.match(/Not affiliated with (.*)\.$/);
      const named = m ? m[1].split(/, | or /).filter((o) => o !== 'the LEGO Group') : [];
      expect([...(card.affiliations ?? [])].sort(), d.slug).toEqual([...named].sort());
    }
  });

  it('A4: /credits/ is a built page, and says "block", never "brick"', () => {
    expect(Object.keys(PAGES)).toContain('credits');
    expect(readFileSync(PAGES.credits, 'utf8')).not.toMatch(/brick/i);
    expect(creditsText).not.toMatch(/brick/i);
  });
});
