# 015 — Two cards across on wide screens

- **Status:** Done (approved by Erik 2026-11-09: "approved, go with your recommendations")
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The thumbnails are the best advertisement for each house, but at three across on a wide screen each card is only about 345 px wide.
Two across makes each image about 530 px wide, roughly 2.4× the area, without turning the home page into a long scroll.

## Behavior
- **Columns:** the home page grid is 1 column on phones and 2 columns from tablets (640 px, Tailwind `sm`) upward, including the widest
  screens. Spec 007 had 3 columns from 1024 px (`lg`).
- **Page width:** unchanged (`max-w-6xl`, 1152 px; about 1088 px of content), so at 1440 px each card is about 530 px wide.
- **Cards:** the same as today. With three houses, Fallingwater's "coming soon" card sits alone on the second row, left-aligned, at the
  same size as the others.
- **Images:** unchanged. The 1200 × 675 thumbnails are already sharp for a 530 px card on a 2× screen (1,060 px needed) and for a
  phone-width card at 3× (about 1,050 px), so no extra sizes or `srcset` are needed.

## Acceptance criteria
- **A1** [unit] The home page markup (`renderToString`) has a 1-column base grid, 2 columns from `sm`, and no 3-column or wider class at
  any breakpoint.
- **A2** [unit] The existing home page tests (007-A1, A2) pass unchanged.
- **A3** [manual] In `npm run dev`, in Chrome, at each width:
  - 390 px: 1 column.
  - 768 px: 2 columns.
  - 1440 px: 2 columns, each image about 530 px wide and sharp (not upscaled).
  - No horizontal scroll at any of these widths.
  - The live cards still open their houses.

## Out of scope
- Making coming-soon cards smaller, or giving live houses more space than coming-soon ones (worth considering once there are more
  houses).
- New or larger thumbnails.
- The viewer pages.

## Open questions
None.

## Implementation notes
- **Change:** `src/home/HomePage.tsx` drops `lg:grid-cols-3`, leaving the grid at `grid-cols-1 sm:grid-cols-2`.
- **Test:** `tests/homeGrid.test.tsx` (A1). It failed first, with 3 columns, then passed. The 007 home tests are unchanged (A2).
- **A3 pass**, measured with iframes in Chrome (DPR 2):
  - 390 px: 1 column, 350 px cards.
  - 768 px: 2 columns, 340 px.
  - 1440 px: 2 columns, 532 px, so the 1200 px images aren't upscaled at 2× (1,064 px needed).
  - 1652 px window: 2 columns, 532 px.
  - No horizontal scroll at any width. Clicking the Stahl and Eames cards opens `/stahl-house/` and `/eames-house/`.
