/**
 * Spec 082: going from one building to another inside the viewer. Pure (no DOM, no React).
 * The list comes from each house's main.ts (`navList()` in src/houses/index.ts), since the engine may not import src/houses.
 */

/** one building in the viewer's menu, in the home page's order (newest first) */
export interface NavBuilding {
  slug: string;
  title: string;
  architect: string;
  year: number;
  thumbnail?: string;
}

export const buildingUrl = (slug: string) => `/${slug}/`;

/** the buildings before and after `slug` in the list, wrapping around at the ends; none when it isn't listed */
export function neighbours(list: NavBuilding[], slug: string): { prev?: NavBuilding; next?: NavBuilding } {
  const i = list.findIndex((b) => b.slug === slug);
  if (i < 0 || list.length < 2) return {};
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] };
}

/** true while the user types into a field, where `[` and `]` are text, not commands */
export function isTyping(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).tagName !== 'string') return false;
  const el = target as HTMLElement;
  return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable === true;
}

/** spec 082: `[` goes to the previous building, `]` to the next; the page to open, or null for any other key */
export function keyTarget(code: string, list: NavBuilding[], slug: string): string | null {
  if (code !== 'BracketLeft' && code !== 'BracketRight') return null;
  const { prev, next } = neighbours(list, slug);
  const to = code === 'BracketLeft' ? prev : next;
  return to ? buildingUrl(to.slug) : null;
}
