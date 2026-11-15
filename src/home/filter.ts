/**
 * Spec 082: the home page's order and filters. Pure (no DOM, no React), so it can be tested in Node.
 */
import type { House, Region } from '@/houses/index';

export type Era = 'before-1930' | '1930' | '1960';
export type Type = House['type'];

export interface Filters {
  type?: Type;
  era?: Era;
  region?: Region;
}
export type Group = keyof Filters;

/** the chips, in order, with their labels */
export const GROUPS: { group: Group; label: string; chips: { value: string; label: string }[] }[] = [
  { group: 'type', label: 'Type', chips: [{ value: 'house', label: 'Houses' }, { value: 'landmark', label: 'Landmarks' }] },
  {
    group: 'era', label: 'Era',
    chips: [{ value: 'before-1930', label: 'Before 1930' }, { value: '1930', label: '1930–1959' }, { value: '1960', label: '1960 on' }],
  },
  {
    group: 'region', label: 'Region',
    chips: [
      { value: 'us-west', label: 'Western US' }, { value: 'us-east', label: 'Eastern US' },
      { value: 'europe', label: 'Europe' }, { value: 'elsewhere', label: 'Elsewhere' },
    ],
  },
];

/** 1930 and 1960 open their eras */
export const eraOf = (year: number): Era => (year < 1930 ? 'before-1930' : year < 1960 ? '1930' : '1960');

/** how many of the last-added buildings carry the New badge (Q1) */
export const NEW_COUNT = 4;

/** live buildings, newest first: the registry is in the order they were added */
export const newestFirst = (houses: House[]): House[] => houses.filter((h) => h.status === 'live').reverse();

/** the slugs of the last NEW_COUNT buildings added */
export const newSlugs = (houses: House[]): Set<string> =>
  new Set(houses.filter((h) => h.status === 'live').slice(-NEW_COUNT).map((h) => h.slug));

const valueOf = (h: House, g: Group): string => (g === 'type' ? h.type : g === 'era' ? eraOf(h.year) : h.region);

export const matches = (h: House, f: Filters): boolean =>
  (Object.keys(f) as Group[]).every((g) => f[g] === undefined || valueOf(h, g) === f[g]);

export const applyFilters = (houses: House[], f: Filters): House[] => houses.filter((h) => matches(h, f));

/** how many buildings a chip would show: its group's choice replaced by the chip, the other groups' choices kept */
export const chipCount = (houses: House[], f: Filters, g: Group, value: string): number =>
  applyFilters(houses, { ...f, [g]: value }).length;

/** pick a chip, or drop it if it's already picked */
export const toggle = (f: Filters, g: Group, value: string): Filters => {
  const next: Filters = { ...f };
  if (next[g] === value) delete next[g];
  else (next as Record<Group, string>)[g] = value;
  return next;
};

export const isEmpty = (f: Filters) => !f.type && !f.era && !f.region;

/** the filters in the page's address: `?type=landmark&era=1960&region=europe`; unknown keys and values are ignored */
export function parseQuery(search: string): Filters {
  const p = new URLSearchParams(search);
  const f: Filters = {};
  for (const { group, chips } of GROUPS) {
    const v = p.get(group);
    if (v && chips.some((c) => c.value === v)) (f as Record<Group, string>)[group] = v;
  }
  return f;
}

/** the address query for some filters ('' for none), groups in a fixed order */
export function formatQuery(f: Filters): string {
  const p = new URLSearchParams();
  for (const { group } of GROUPS) if (f[group]) p.set(group, f[group]!);
  const q = p.toString();
  return q ? `?${q}` : '';
}
