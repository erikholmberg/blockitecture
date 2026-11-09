# 007 — Home page with house cards; shadcn/ui and Inter on every page

- **Status:** Done (approved by Erik 2026-11-08 via the plan: shadcn on home + viewer HUD; coming-soon cards for the Eames House and Fallingwater)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** 54f994d

## Goal
Erik wants to make many of these brick-by-brick renderings. Today the site *is* the Stahl House viewer at `/`.
We need a home page listing the renderings as cards that click through to each one, built with **shadcn/ui** and the
**Inter** font. Decisions made with Erik:
- **shadcn on both pages:** the home page *and* the viewer's controls (rebuilt in React/shadcn).
- **Cards:** the Stahl House (live), plus "coming soon" cards for the **Eames House** and **Fallingwater**.

The project is Vite + vanilla TypeScript + Three.js (no React or Tailwind yet). The viewer's controls are one class,
`src/ui/hud.ts` (`Hud`), driven by `src/main.ts` through a small API. The neighborhood data is fetched relative to the page
(`new URL('neighborhood.bin', document.baseURI)` in `src/scene/neighborhood.ts`), and Vite uses `base: './'`. Both need changing once the viewer moves off `/`.

Per `CLAUDE.md` this is spec-driven: step 1 writes `specs/007-home-page.md` from this plan. Approving this plan approves that spec.


## Design

### 1. Site structure (Vite multi-page)
- `index.html` → **home page** (React). The current viewer HTML moves to `stahl-house/index.html` → served at `/stahl-house/`.
- `vite.config.ts`: `base: '/'`, `build.rollupOptions.input` = both HTML files, plugins `@vitejs/plugin-react` and `@tailwindcss/vite`,
  alias `@` → `src`.
- Per-house static files under `public/<slug>/`: move `public/neighborhood.bin` → `public/stahl-house/neighborhood.bin`, add
  `public/stahl-house/thumbnail.jpg`. Fetch with an absolute path (`${import.meta.env.BASE_URL}stahl-house/neighborhood.bin`) so it works with or without a trailing slash.
  Update the `OUT` path in `scripts/fetch-neighborhood.mjs` and the `.bin` path in `tests/neighborhood.test.ts` and `tests/lotTerrain.test.ts`.

### 2. React, Tailwind v4, shadcn/ui, Inter
- Add `react`, `react-dom`, `@types/react(-dom)`, `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, and
  **`@fontsource-variable/inter`**. Inter is self-hosted, so there's no Google Fonts request; this keeps 003-A6's "no third-party calls at runtime" spirit.
- `npx shadcn@latest init` (non-interactive defaults, neutral base color) creates `components.json`, `src/lib/utils.ts` (`cn`) and the theme
  tokens in `src/styles/globals.css`. Then `npx shadcn@latest add card badge button toggle-group slider tooltip dropdown-menu separator`
  → `src/components/ui/*`.
- `tsconfig.json`: `"jsx": "react-jsx"` and `"paths": { "@/*": ["./src/*"] }`. `tests/tsconfig.json` inherits it.
- `globals.css`: `@import "tailwindcss"`, the shadcn tokens, `font-family: 'Inter Variable'` on `body`. Brand accent `--primary` stays the site's orange `#e8892c`.

### 3. House registry (`src/houses.ts`, pure data)
`{ slug, title, subtitle, architect, year, location, status: 'live' | 'coming-soon', pieces?, thumbnail?, blurb }`:
- `stahl-house`: Stahl House · Case Study House #22 · Pierre Koenig · 1960 · Los Angeles · live · 27,222 pieces · `/stahl-house/thumbnail.jpg`
- `eames-house`: Eames House · Case Study House #8 · Charles & Ray Eames · 1949 · Pacific Palisades · coming soon
- `fallingwater`: Fallingwater · Frank Lloyd Wright · 1939 · Mill Run, Pennsylvania · coming soon

Adding a house later = one registry entry + `<slug>/index.html` + `public/<slug>/` assets (documented in `CLAUDE.md`).

### 4. Home page (`src/home/main.tsx`, `HomePage.tsx`, `HouseCard.tsx`)
- Header: "Blockitecture" wordmark and a one-line tagline. A responsive grid of shadcn `Card`s: 1 column on phones, 2 on tablets, 3 on desktop.
- **Live card:** the whole card is an `<a href="/stahl-house/">`. 16:9 thumbnail, title, subtitle, "architect · year", location, and a `Badge` with the piece count.
  Hover lift and a visible focus ring.
- **Coming-soon card:** not a link (`aria-disabled`), dimmed, with a brick-pattern placeholder instead of a thumbnail and a "Coming soon" `Badge`.
- Footer: the LEGO-affiliation disclaimer from the README and "© OpenStreetMap contributors", since the thumbnail shows OSM-derived scenery.

### 5. Viewer controls in React (`src/ui/Hud.tsx` + `src/ui/hudStore.ts`, replaces `src/ui/hud.ts`)
- **The interface to `main.ts` stays the same:** `mountHud(parent, handlers, total, pieces)` returns an object with today's methods
  (`update`, `setPhaseTicks`, `setMode`, `setWalkHint`, `setAutoRotate`), backed by a tiny external store (`useSyncExternalStore`).
  `main.ts` keeps all engine, keyboard and camera logic (`camAction`, glides, keys) and keeps pushing HUD state at 10 Hz as now.
- **Component mapping:**
  - Intro → `Card` + `Button`.
  - Orbit/Walk, Roof, Day/Dusk and the 1×/4×/16× speed → `ToggleGroup`.
  - Timeline → `Slider`, with phase ticks overlaid and a scrubbing flag so updates don't fight the drag.
  - Play, Finish and Restart → `Button`.
  - Camera column → icon `Button`s (lucide icons) with `Tooltip`s naming the key; Views → `DropdownMenu`.
  - Walk hint and credit → styled divs.
- **Keep every existing behavior:** baseline H1–H3 and V1–V6, 006-A3–A7 (tooltips, aria labels, hidden in Walk mode, ≥ 40 px buttons, phone layout) and the
  phone credit placement. The loading screen and touch joystick stay vanilla (`touch.ts`), and `src/ui/styles.css` is trimmed to just those.
- Add a **"← All houses"** link to `/` in the top-left title block.

### 6. Thumbnails
- Add viewer URL params: `?view=<key>` (from `VIEWS` in `src/controls/cameraMoves.ts`), `&light=dusk`, `&clean` (skip the intro, finish the build, hide the HUD).
  These are also handy for sharing a specific view.
- Capture `/stahl-house/?view=famous&light=dusk&clean` in Chrome at 1600 × 900, scale to 1200 × 675 JPEG with `sips`, save as `public/stahl-house/thumbnail.jpg`.

### 7. Docs
`specs/007-home-page.md` (criteria below), README (site structure, adding a house), CLAUDE.md (folders and commands), baseline note (viewer now at `/stahl-house/`).


## Acceptance criteria
- **A1** [unit] Registry: slugs unique and URL-safe; live houses have `thumbnail` and `pieces`, and their thumbnail file exists in `public/`;
  `vite.config.ts` has an HTML input for every live slug; Stahl's `pieces` equals the generated model's count (27,222).
- **A2** [unit] Home page `renderToString`: three cards in registry order; Stahl links to `/stahl-house/`; the coming-soon cards have no link and say "Coming soon".
- **A3** [unit] HUD wiring, with `jsdom` + `@testing-library/react` (dev-only): each control calls the right handler
  (e.g. "+" → `onCam('in')`, Dusk → `onLight('dusk')`, slider → `onSeek`); camera buttons have `aria-label`s; the camera column is hidden in Walk mode.
- **A4** [unit] All existing tests pass (data path updated); 003-A6 still holds (no map-service URLs, and now no font CDN either).
- **A5** [manual] Home at `/`: Inter renders, the grid is responsive (390 / 768 / 1440 px), the Stahl card opens the viewer, and coming-soon cards aren't clickable.
- **A6** [manual] Viewer at `/stahl-house/` *and* `/stahl-house`: re-run baseline H1–H3, V1–V6 and 006-A3–A7 with the new controls on desktop and a 390 × 844 frame;
  "All houses" returns home.
- **A7** [manual] Performance: `?debug&dpr=1.75` A/B against `681e649` from the default camera, day and dusk, within ±5% (the HUD only re-renders at 10 Hz).
- **A8** [manual] `npm run build` → `dist/index.html`, `dist/stahl-house/index.html` and `dist/stahl-house/neighborhood.bin` exist.
  `npm run preview` serves both pages, and the home bundle doesn't contain Three.js.


## Out of scope
- Building the Eames House or Fallingwater models (cards only).
- Generalizing the 3D engine for multiple houses. Stahl-specific modules stay in place until house #2 is built (its own spec).

## Implementation notes
- **Stack:** React 19, Tailwind v4 (`@tailwindcss/vite`), shadcn/ui CLI 4 with the Radix base and the *Nova* preset
  (its Geist font replaced by `@fontsource-variable/inter`), lucide icons. shadcn now ships `cn` from its own `cn` package
  (repo `shadcn-ui/cn`, maintainer shadcn), which replaces `clsx` + `tailwind-merge`. I checked it before keeping it.
  The `shadcn` CLI is a devDependency; only its CSS is used, at build time.
  Brand: `--primary` is the site orange `#e8892c` with dark ink text, because white on that orange is only ~2.6:1 contrast.
- **Pages:** `index.html` (home) and `stahl-house/index.html` (viewer), listed in `PAGES` in `vite.config.ts`, with `base: '/'`.
  The viewer's data moved to `public/stahl-house/` and is fetched by absolute path.
  - `/stahl-house` → `/stahl-house/` redirects: `vercel.json` sets `trailingSlash: true`, and the small `pageSlashRedirect`
    Vite plugin does the same in dev and preview. (Without it, Vite dev served the *home page* at `/stahl-house`.)
- **HUD:** `src/ui/Hud.tsx` + `src/ui/hudStore.ts` replace `src/ui/hud.ts`. `mountHud()` keeps the old API, plus `setLight` and `hide`.
  The Light toggle is now controlled from `main.ts`, so `?light=dusk` shows correctly.
- **URL params:** `?view=<overview|famous|pool|basin>`, `&light=dusk`, `&clean` (finished build, no HUD).
  The thumbnail is `/stahl-house/?view=famous&light=dusk&clean`, cropped to 16:9 at 1200 × 675 (134 KB).
  *Later:* recaptured in daylight to match the Eames card, as `/stahl-house/?view=pool&clean&date=2026-06-21` (154 KB).
- **Bugs found and fixed during verification:**
  - *shadcn `Slider` had no accessible name.* Radix puts `role="slider"` on the thumb, but `aria-label` went to the root.
    `src/components/ui/slider.tsx` now passes it to the thumb (caught by A3).
  - *The keyboard guard was too broad.* My first version ignored **all** keys while focus was in a toggle group or the slider, so `P`/`Tab`/`H`
    stopped working after clicking e.g. Dusk. Now only the widgets' own navigation keys (arrows, Home/End, Page Up/Down) are skipped there.
  - *The timeline got stuck after keyboard scrubbing.* The HUD kept showing the scrub value, e.g. 2:44 after `F` finished
    the build. The scrub value is now held only during a pointer drag. There's a regression test.
  - *The timeline step was 0.01 s* (unchanged from the old range input), so arrow keys were useless. It's now 1 s, and Shift+arrow jumps 10 s.
  - *Backdrop blur on the HUD panels cost 22% fps* (dpr 3: 49 → 38). Over a WebGL canvas the browser re-blurs the scene
    under 14 panels every frame. I confirmed it by switching the blur off live (38 → 46) and hiding the whole HUD (46). Removed, with a note in CLAUDE.md.
  - The Views menu was too narrow ("The famous view" wrapped); it's now `min-w-44`.
- **Results:**
  - A1–A4: `tests/houses.test.ts`, `tests/home.test.tsx`, `tests/hud.test.tsx` (jsdom + Testing Library, 8 tests), and the
    extended no-third-party test. 67 tests total.
  - A5 pass: Inter loads only from the site itself; 3 columns at 1475 px, 2 at 768, 1 at 390, no horizontal scroll;
    the Stahl card opens the viewer and coming-soon cards don't navigate.
  - A6 pass, real mouse and keys in Chrome:
    - Start; 16×; `P` while the speed toggle has focus; Dusk; No roof; + (194 → 145.5 ft);
      `←` (−22.5°); `-` (→ 194 ft); `R`; Views → The famous view (exactly (44, 7, 62)); arrows on the slider scrub without
      rotating the camera; `F`; Tab → Walk (camera column hidden, walk hint shown) → Orbit; Restart; a mouse drag on the timeline
      (→ 115 s, then `F` → 3:48); "All houses" → `/`; `/stahl-house` redirects to `/stahl-house/`.
    - In a 390 × 844 frame: toggles end at 114 px, the camera column spans 239–601 px, the credit (fully visible) is at 697–716 px,
      the bar starts at 732 px, buttons are 40 × 40, and there's no horizontal scroll.
  - A7 pass: `?debug`, same camera, interleaved runs against a worktree of `681e649`.
    - At dpr 1.75 both hit the 60 fps display cap (60/60 vs 60/59.1).
    - At dpr 3, after removing the blur: new 42.8 day / 44.7 dusk vs baseline 41.0 / 43.3, which is level, within noise.
  - A8 pass: `dist/index.html`, `dist/stahl-house/{index.html,neighborhood.bin,thumbnail.jpg}`. The home page loads
    `home-*.js` (6.5 KB) and the shared React/shadcn chunk (252 KB, 82 KB gzipped), neither containing Three.js.
    In `vite preview` both pages run with no console errors, and the viewer loads all 4,159 neighborhood buildings.
