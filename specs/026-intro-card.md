# 026 — A tighter intro card

- **Status:** Done (approved by Erik 2026-11-09, after the preview: the design, and dropping "block by block" from the card)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The intro card every house page opens with feels tighter and more designed. The title is smaller, and the controls note reads as a
clear set of hints, not a run-on line of grey text.

## Today
(Erik's screenshot of the Stahl House, 2026-11-09)
- **Size and title:** a 448 px card; a 30 px bold two-line title ("The Stahl House, / block by block").
- **Body:** 15 px.
- **Button:** a large "Start building" button.
- **Hints:** below the button, one 12 px grey line: "Drag to orbit · scroll to zoom · camera buttons on the right · **Walk** mode for
  first person". It wraps awkwardly.
- **Disclaimer:** on the houses that have one, it sits between the button and the hints.

## Behavior
- **The card:** a little narrower (400 px), with tighter spacing.
- **The title:** 22 px, just the house's name ("The Stahl House", "Fallingwater"): the first headline line without its trailing
  comma. "Block by block" leaves the card; it stays the site's line in the home headline and the page titles (Q2).
- **The body:** 14 px; the bold piece count stays.
- **The button:** "Start building" is the default size, with a ▸ play icon.
- **The hints:** a footer band, a slightly darker strip across the bottom of the card with a hairline above it, holding three hints
  as icon + label:
  - **desktop:** "Drag to orbit" (orbit icon) · "Scroll to zoom" (zoom icon) · "Walk to explore" (footprints);
  - **phone:** "Drag to orbit" · "Pinch to zoom" · "Tap to hide controls".

  The hint about the camera buttons goes: the buttons are visible and have tooltips.
- **The disclaimer and the map credit:** move into the same footer band, under the hints, in 11 px grey, so the card's main column
  holds only the title, the text and the button.

## Approach
- A new `IntroCard` component in `src/engine/ui/`, used by `Hud.tsx` in place of today's inline card. It's used by every house page,
  and the house text is unchanged.
- **To judge it:** while this spec is a draft, a dev-only page at `/dev/intro/` shows today's card and the new one side by side, for
  desktop and phone widths, with the Stahl House's and Fallingwater's texts. It isn't built, and it's deleted after approval.

## Acceptance criteria
- **A1** [unit] The intro card shows the eyebrow, both headline lines, the intro text with the piece count, and the Start building
  button. Clicking it starts the build (the existing spec 006/014 HUD tests still pass).
- **A2** [unit] The hints are three labelled items: on desktop orbit, zoom and walk; on phones orbit, pinch-zoom and tap-to-hide.
  They sit in the card's footer band.
- **A3** [unit] The disclaimer (where a house has one) and, on phones, the map credit are in the footer band. Nothing about "brick"
  (spec 013).
- **A4** [manual] In `npm run dev`, on desktop and at phone width, the card reads as in Behavior on two houses (one with a
  disclaimer), and nothing wraps awkwardly.

## Out of scope
- The rest of the HUD (the top bar, the camera buttons, the timeline).
- The intro texts themselves.

## Open questions
- [x] **Q2: "block by block" in the card** (Erik asked). *Recommended: drop it from the card*, as above. This amends spec 013-A2,
      which asked every house's intro headline to say it: the house `text.headline` stays as it is (and the tests keep checking it),
      but the card shows only its first part. The home headline and the page titles still say "block by block".
- [x] **Q1: The design.** *Recommended: as above.* Say "preview" to see it on the dev page before deciding, or approve as written.

## Implementation notes
- **Component:** `src/engine/ui/IntroCard.tsx`, used by `Hud.tsx` in place of the inline card. It has 400 px max width and a 22 px
  title: the first headline line without its comma (Q2).
- **Footer band:** a `bg-muted/60` band with a top border, holding three `data-hint` items with lucide icons (Move3d, ZoomIn,
  Footprints; on phones Hand, ZoomIn, EyeOff), then the disclaimer, then the map credit on phones.
- **Preview:** the dev-only page `/dev/intro/` was used to decide (Q1 and Q2), then deleted. It was never committed. New files
  didn't get Tailwind classes until the dev server restarted.
- **Tests:**
  - `tests/introCard.test.tsx` covers A1–A3. They failed first.
  - Spec 007-A3's Start button test and spec 014-A1's phone-credit test pass unchanged.
  - Spec 013's wording test now notes that the card shows only the house's name; the stored headline still says "block by block".
  - 190 tests in all.
- **A4 pass** (Chrome):
  - Desktop: the Stahl House and Fallingwater (with its disclaimer) read as in Behavior.
  - At 390 px (in a frame): Fallingwater's card is 348 px wide, its three phone hints wrap cleanly onto two lines, and the
    disclaimer and the credit sit below them.
