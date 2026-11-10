/**
 * Spec 052: Vercel Web Analytics on every published page: visits only, no cookies, nothing that identifies a visitor. The
 * script is served only on a Vercel deployment with Analytics enabled in the project; in development nothing is sent.
 */
import { inject } from '@vercel/analytics';

let started = false;

/** Start counting this page's visit (once, however often it's called). */
export function startAnalytics() {
  if (started) return;
  started = true;
  inject({ mode: import.meta.env.PROD ? 'production' : 'development' });
}
