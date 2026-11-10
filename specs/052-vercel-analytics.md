# 052 — Vercel Web Analytics

- **Status:** In progress (approved by Erik 2026-11-10: "build it", all recommendations. Built and checked in dev; waiting on
  Erik to enable Analytics in Vercel and deploy, A4. Committed with Erik's go-ahead, 2026-11-10.)
- **Owner:** Erik
- **Created:** 2026-11-10
- **Commits:** 18267a9

## Goal
Erik asked to add Vercel Analytics to the site (2026-11-10), to see how many people visit and which houses they open. The site
is already deployed on Vercel (`vercel.json`, README), so its Web Analytics fit without another service.

## Behavior
- **Every published page** counts a visit: the home page, the credits page and each house's page. Vercel's dashboard shows
  visitors and page views per page, with referrers, countries and devices.
- **Nothing visible changes** on the site, except the note in Q3.
- **In `npm run dev`** nothing is sent (the script only runs on a Vercel deployment); the dev-only pages (`/dev/...`) aren't
  published, so they're never counted.
- **Privacy:** Vercel Web Analytics sets no cookies and stores nothing that identifies a visitor (it hashes the request with a
  salt that changes daily), so no consent banner is needed.

## Approach
- Add the `@vercel/analytics` package (2.0.1). One small module, `src/analytics.ts`, calls its `inject()` once, in production
  mode only for production builds.
- Each page's entry calls it: `src/home/main.tsx`, `src/credits/main.tsx`, and the viewer (`src/engine/viewer.ts`) for every
  house page. The engine still imports no house.
- **Erik turns it on** in the Vercel project's dashboard (Analytics → Enable); the code can't do that. Until then the script
  isn't served and nothing is counted.

## Acceptance criteria
- **A1** [unit] `src/analytics.ts` calls `inject()` once, whatever its callers, with the mode set from the build (production for
  `npm run build`).
- **A2** [unit] The home page, the credits page and the viewer each start it; the dev-only page doesn't.
- **A3** [unit] `npm run build` succeeds, and the built pages contain the analytics code.
- **A4** [manual, after deploying, with Analytics enabled in Vercel] Opening the home page and a house page shows up in the
  Vercel dashboard.
- **A5** [manual] The frame rate is unchanged (the script loads after the page and sends a small beacon per page view).

## Out of scope
- Custom events (Q1).
- Speed Insights (Q2).
- Any analytics outside Vercel.

## Open questions
- [x] **Q1: Page views only, or events too?** *Recommended: page views only, for now.* Custom events (a build started or
      finished, a view picked, Share used, Walk mode) would say more about how people use the viewer, but they need a Vercel Pro
      plan and their own spec.
- [x] **Q2: Speed Insights as well?** It measures real visitors' load times, useful for a 3D site. *Recommended: not now*; it's a
      second package and its own setting in Vercel, and can follow in its own spec.
- [x] **Q3: A line on the credits page about it.** *Recommended: yes*, one sentence under its opening line: "Visits are counted
      with Vercel Web Analytics: no cookies, and nothing that identifies you."

## Implementation notes
- **Files:** `@vercel/analytics` 2.0.1 in `package.json`; `src/analytics.ts` (`startAnalytics()`); called from
  `src/home/main.tsx`, `src/credits/main.tsx` and `startViewer()` in `src/engine/viewer.ts`; the credits page's new line
  (`src/credits/CreditsPage.tsx`).
- **Tests:** `tests/analytics.test.tsx` covers A1, A2 and Q3's line; it failed first (the module didn't exist). A1 mocks the
  package and checks one call in development mode under Vitest, and that the mode comes from `import.meta.env.PROD`.
  `npm run check`: 361 tests pass.
- **A3 pass**, by hand rather than in Vitest (a full build is too slow for the test run): `npm run build` succeeds, and the
  analytics code (`/_vercel/insights`) is in the shared chunk that the home page, the credits page and every house page load.
- **In dev** (Chrome): the package loads Vercel's debug script (`va.vercel-scripts.com/v1/script.debug.js`), which logs each
  page view to the console and sends nothing ("No requests will be sent to the server"). Seen on the credits page and the Rose
  Seidler House's page.
- **A4 not checked:** needs Analytics enabled in the Vercel project and a deploy.
- **A5 not measured.** The script loads on its own after the page and sends one small request per view.

