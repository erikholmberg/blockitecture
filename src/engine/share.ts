/**
 * Spec 037: share links and postcards. Pure helpers: the link's query string and reading it back, sharing a link through the
 * share sheet or the clipboard, and the postcard's caption and layout.
 */

export type Cam = [x: number, y: number, z: number, tx: number, ty: number, tz: number];
export interface ShareState { view?: string; cam?: Cam; light: 'day' | 'dusk'; t?: number }

const r1 = (v: number) => Math.round(v * 10) / 10;
const num = (v: number) => String(r1(v) === 0 ? 0 : r1(v));

/** the query string for a state: a named view or a free camera, dusk, and the build's time unless it's finished */
export function shareQuery(s: { view?: string; cam?: Cam; light: 'day' | 'dusk'; t: number; total: number }): string {
  const q: string[] = [];
  if (s.view) q.push(`view=${encodeURIComponent(s.view)}`);
  else if (s.cam) q.push(`cam=${s.cam.map(num).join(',')}`);
  if (s.light === 'dusk') q.push('light=dusk');
  if (s.t < s.total) q.push(`t=${num(s.t)}`);
  return q.join('&');
}

/** a shared link's state; malformed or unknown values are ignored */
export function readShare(p: URLSearchParams, views: string[], total: number): ShareState {
  const out: ShareState = { light: p.get('light') === 'dusk' ? 'dusk' : 'day' };
  const view = p.get('view');
  if (view && views.includes(view)) out.view = view;
  const cam = p.get('cam')?.split(',').map(Number);
  if (!out.view && cam && cam.length === 6 && cam.every(Number.isFinite)) out.cam = cam.map(r1) as Cam;
  const t = p.get('t');
  if (t !== null && t.trim() !== '') {
    const v = Number(t);
    if (Number.isFinite(v) && v >= 0) out.t = Math.min(r1(v), total);
  }
  return out;
}

export interface ShareNav { share?: (d: { url: string; title: string }) => Promise<void>; clipboard?: { writeText(s: string): Promise<void> } }

/** the share sheet on touch devices that have one, otherwise the clipboard */
export async function shareLink(url: string, title: string, nav: ShareNav, touch: boolean): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  if (touch && nav.share) {
    try { await nav.share({ url, title }); return 'shared'; } catch (e) { if ((e as Error)?.name === 'AbortError') return 'cancelled'; }
  }
  try { await nav.clipboard?.writeText(url); return nav.clipboard ? 'copied' : 'failed'; } catch { return 'failed'; }
}

/** the postcard: 1600 × 900, a caption band along the bottom */
export const POSTCARD = { width: 1600, height: 900, band: 104 };
export function postcardLayout() {
  const { width: w, height: h, band } = POSTCARD;
  return { scene: { x: 0, y: 0, w, h: h - band }, band: { x: 0, y: h - band, w, h: band } };
}

/** the caption's lines: the name; the architect and year (the eyebrow after its first part); the site; the credit */
export function postcardCaption(house: { name: string; eyebrow: string }, host: string): string[] {
  const parts = house.eyebrow.split(' · ');
  return [house.name, parts.slice(1).join(' · '), `Blockitecture · ${host}`, '© OpenStreetMap contributors · Terrain: Mapzen / AWS Terrain Tiles'];
}
export const postcardFileName = (slug: string) => `${slug}.png`;
