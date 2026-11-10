/**
 * Spec 053: what the `seo` plugin (seo.plugin.ts) loads through Vite's SSR loader at build and dev time: the home and credits
 * pages rendered to HTML (React hydrates them in the browser), and each house's intro text from its definition.
 * Never imported by the pages themselves.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { CreditsPage } from '@/credits/CreditsPage';
import { HomePage } from '@/home/HomePage';
import type { HouseDefinition } from '@/engine/house';
import { HOUSES } from '@/houses/index';
import type { HouseText } from '@/seo/seo';

/** the same trees the pages' entries hydrate (src/home/main.tsx, src/credits/main.tsx) */
export const homeTree = () => <StrictMode><HomePage houses={HOUSES} /></StrictMode>;
export const creditsTree = () => <StrictMode><CreditsPage houses={HOUSES} /></StrictMode>;
export const renderHome = () => renderToString(homeTree());
export const renderCredits = () => renderToString(creditsTree());

const DEFINITIONS = import.meta.glob<Record<string, unknown>>('/src/houses/*/definition.ts');

/** a house's intro text, from its definition (loaded only when asked) */
export async function houseText(slug: string): Promise<HouseText | undefined> {
  const load = DEFINITIONS[`/src/houses/${slug}/definition.ts`];
  if (!load) return undefined;
  const def = Object.values(await load()).find((v) => (v as HouseDefinition)?.slug === slug) as HouseDefinition | undefined;
  return def?.text;
}
