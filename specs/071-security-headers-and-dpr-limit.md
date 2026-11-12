# 071 — Security headers, and a limit on `?dpr=`

- **Status:** Done (approved by Erik 2026-11-12: "approved", taking the proposed answers to Q1 and Q2; merged on his "merge")
- **Owner:** Erik
- **Created:** 2026-11-12
- **Commits:** 0d3bb93

## Goal
The site tells browsers what it is allowed to load and where it may be embedded, so a compromised dependency or a hostile page
can do less with it; and a crafted link can no longer crash a visitor's tab by asking for a huge canvas. Both came out of the
security audit of 2026-11-12, which found nothing exploitable: this is defence in depth.

## Behavior
- A visitor sees no difference on any page: the home page, the credits page and every house look and work as before
  (loading screen, fonts, the build, the neighbourhood, share link, postcard, analytics).
- Every response from the deployed site carries these headers, set in `vercel.json`:
  - `Content-Security-Policy`:
    `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
  - `X-Frame-Options: DENY` (for browsers that don't read `frame-ancestors`)
- Another site that puts a Blockitecture page in a frame gets an empty frame.
- `?dpr=` still pins the resolution, but only between 0.5 and 3. A value outside that is pulled to the nearest end
  (`?dpr=50` → 3, `?dpr=0.1` → 0.5); a value that isn't a number, or `?dpr=0`, is ignored as today (adaptive resolution stays on).

Why the policy looks like this: scripts are only the site's own files (the structured data is a data block, which the policy
doesn't block; Vercel Analytics loads from `/_vercel/insights/` on the same origin). Styles need `'unsafe-inline'` for the
loading screen's `<style>`, the hidden article's `style` attribute and the home page's rendered HTML. `blob:` in `img-src`
covers the postcard.

## Acceptance criteria
- **A1** [unit] `vercel.json` has one `headers` rule whose `source` matches every path, with the five headers above, and
  `trailingSlash` is still `true`.
- **A2** [unit] The policy has exactly the directives listed in Behavior; `script-src` is `'self'` alone (no `'unsafe-inline'`,
  no `'unsafe-eval'`, no other origin), and `frame-ancestors` is `'none'`.
- **A3** [unit] No published page's HTML source has an inline script that runs (a `<script>` with neither `src` nor
  `type="application/ld+json"`) or an inline event handler (`on…=`), so `script-src 'self'` can't break one.
- **A4** [unit] `pinnedDpr(param)` (pure, in `src/engine/resolution.ts`): `'1.75'` → 1.75, `'50'` → 3, `'0.1'` → 0.5,
  `'-2'` → 0.5, `null`, `''`, `'abc'`, `'0'`, `'Infinity'` and `'NaN'` → 0 (not pinned).
- **A5** [manual] On a Vercel preview deploy, open the home page, the credits page and two houses (Stahl House and one more)
  with the browser console open → no Content-Security-Policy errors; the loading screen is styled, the fonts are Inter and
  Quantico, the build plays, the neighbourhood appears, Share copies a link, the postcard downloads.
- **A6** [manual] On the preview deploy, `curl -I` on `/`, `/stahl-house/` and an `/assets/…js` file → all five headers on each.
- **A7** [manual] On the preview deploy, the Network tab shows `/_vercel/insights/script.js` loading and a page view sent
  (or, if Analytics isn't served on previews, checked on production right after the deploy).
- **A8** [manual] `npm run dev` → `/stahl-house/?debug&dpr=50` → the overlay reads `dpr 3.00` and the page stays usable.

## Out of scope
- The `npm audit` advisories under the `shadcn` CLI (dev-only; the offered fix is a breaking downgrade).
- Removing `'unsafe-inline'` from `style-src` (would need hashes or moving the inline styles out).
- CSP in `npm run dev` / `vite preview` (Vite's dev server needs inline scripts); the policy is checked on a preview deploy.
- CORS (`access-control-allow-origin: *` is Vercel's default for static files; nothing here is private).
- Reporting (`report-to` / `report-uri`).

## Open questions
- [x] **Q1** Should other sites be able to embed a house in a frame? **No** (`frame-ancestors 'none'`; approved as proposed). If
  embeds are wanted later (a blog post, a portfolio), this is the line to change.
- [x] **Q2** Limits for `?dpr=`: **0.5 to 3** (approved as proposed).
- [x] **Q3** A5–A7 need a Vercel preview deploy: Erik, 2026-11-12: "commit and push to preview". Pushed as the branch
  `spec-071-security-headers`.

## Implementation notes
- `vercel.json`: one `headers` rule on `/(.*)` with the five headers. `src/engine/resolution.ts`: `pinnedDpr()` and
  `PINNED_DPR`; `src/engine/viewer.ts` reads `?dpr=` through it. Tests: `tests/securityHeaders.test.ts` (A1–A4).
- A3 passed before any change (the pages already had no inline script that runs): it's a guard for the policy, not a fix.
- Before this, a negative `?dpr=` was passed straight to the renderer; it is now pulled up to 0.5.
- **Checked before any deploy** (not a criterion): the built `dist/` served locally with the headers from `vercel.json`, opened
  in headless Chromium: `/`, `/credits/`, `/stahl-house/` and `/fallingwater/?dpr=50&debug`. No policy violation on any of
  them; Inter and Quantico loaded, the houses' workers built the model, the neighbourhood loaded, and the postcard rendered
  and decoded from a `blob:` URL (1600 × 900). The only console error was `/_vercel/insights/script.js` 404, which only Vercel
  serves.
- **A8 passed** (headless Chromium, software rendering, `npm run dev`, 1000 × 700 window): `/stahl-house/?debug&dpr=50` → the
  overlay reads `dpr 3.00`, canvas 3000 × 2100, the page still answers; `dpr=0.1` → `dpr 0.50`; `dpr=abc` → not pinned (1.00).
- **Preview deploy** of 0d3bb93: `blockitecture-8phbpq854-erikholmberg.vercel.app` (behind Vercel's sign-in, so checked in
  Erik's signed-in Chrome, not with `curl`).
- **A5 passed, with two parts checked another way.** Home, credits, Stahl House and Fallingwater: no Content-Security-Policy
  message in the console on any of them (only the viewer's own `?debug` logs and two Three.js deprecation warnings). The
  loading screen went away, Inter and Quantico loaded, the Stahl House build played (9,365 of 27,233 pieces after a few
  seconds, 64 frames a second), both neighbourhoods loaded. **Share and the postcard were checked through `window.__viewer`,
  not by pressing the buttons** (to leave the clipboard and Downloads alone): `shareQuery()` gave the link's query, and
  `postcard()` gave a 1600 × 900 PNG that decoded from a `blob:` URL. Neither the clipboard nor a download is governed by the policy.
- **A6 passed, by `fetch` in the page and not `curl -I`** (the sign-in wall): `/`, `/stahl-house/` and `/assets/home-….js` each
  returned 200 with all five headers, the policy exactly as written above.
- **A7 passed:** `/_vercel/insights/script.js` 200 and `POST /_vercel/insights/view` 200 on each of the four pages.
- Seen on the preview only: a request to `vercel.live/_next-live/feedback/feedback.js` (Vercel's preview toolbar) came back
  503. It isn't part of the site and isn't served on production; if the toolbar is wanted on previews, the policy would have
  to allow `vercel.live` there.
- **Production** (`blockitecture.vercel.app`, after the merge to `main`): `curl -I` on `/`, `/stahl-house/` and
  `/assets/home-….js` shows all five headers on each (A6 as written).
