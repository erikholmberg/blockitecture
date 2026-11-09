# 023 — An off-white page background

- **Status:** Done (approved by Erik 2026-11-09: B, after the preview)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
The home page and the credits page get a slightly warm off-white background, with the cards staying pure white, so the cards lift
gently off the page and the site feels a little softer and more like paper.

## Today
The page background and the cards are both pure white (`--background` and `--card` are `oklch(1 0 0)` in
`src/styles/globals.css`). The cards separate from the page only by their thin borders.

## Behavior
- **The page:** the home page (`/`) and the credits page (`/credits/`) have an off-white background (Q1).
- **Unchanged:**
  - the cards: pure white, with their borders;
  - text colours;
  - the coming-soon cards' block-pattern placeholder;
  - the footer;
  - the house pages (the 3D viewer and its controls, which use `--card`).

## Candidates (Q1)
All warm (hue 85, toward cream rather than grey), from barely there to clearly creamy:

| | OKLCH | Hex | Reads as |
|---|---|---|---|
| **A** | `oklch(0.99 0.003 85)` | `#FDFCF9` | almost white; you notice it only next to the white cards |
| **B** | `oklch(0.982 0.008 85)` | `#FCF9F3` | warm paper |
| **C** | `oklch(0.972 0.014 85)` | `#FAF5EB` | a touch creamy |

## Approach
- A `--page` colour in `globals.css`. Only the home and credits pages use it, as their background, so `--background` and `--card`
  keep their values and the viewer is untouched.
- **To pick the shade:** while the spec is a draft, a dev-only page at `/dev/background/` shows the home page three times side by
  side, one per candidate, at their real sizes. It's left out of the build, like `/dev/shortlist/` (spec 016). After the choice, only
  the chosen shade goes into `globals.css`, and the preview page is deleted.

## Acceptance criteria
- **A1** [unit] `--page` is the chosen shade, and the home and credits pages' outer container uses it.
- **A2** [unit] `--background` and `--card` are unchanged (`oklch(1 0 0)`), so the cards stay white and the viewer looks the same.
- **A3** [unit] The text still meets WCAG AA on the new background: the muted text (`--muted-foreground`) has a contrast ratio of
  at least 4.5:1.
- **A4** [manual] In `npm run dev`, the home and credits pages show the off-white background, with the cards visibly white against
  it. The coming-soon placeholders still read clearly, and a house page looks unchanged.

## Out of scope
- Dark mode.
- The house pages and the viewer's controls (apart from the muted grey below, which they share).
- Any other colour in the theme, except the muted grey (Q2).

## Open questions
- [x] **Q1: Which shade?** *Erik: B, `oklch(0.982 0.008 85)` / `#FCF9F3`.* *Recommended: B (`#FCF9F3`, warm paper).* It's clearly not white next to the cards, but no one would call
      it cream. A is safer but may be too subtle to notice; C is the most characterful but starts to look like an old-paper theme.
      I'd decide by eye: say "preview" and I'll build the dev-only comparison page first.

- [x] **Q2: The muted grey** (raised during implementation: A3 found it at 4.49:1 on B, just under AA). *Erik: darken it slightly*,
      `--muted-foreground` 0.556 → 0.55: 4.61:1 on the paper, 4.85:1 on white. It's shared with the viewer's controls, which only gain.

## Implementation notes
- **Theme:** `--page: oklch(0.982 0.008 85)` (`#FCF9F3`) and `--color-page` in `src/styles/globals.css`. `--muted-foreground` went from
  0.556 to 0.55 (Q2).
- **Pages:** `HomePage` and `CreditsPage` gain a full-width `min-h-svh bg-page` wrapper around their column. Everything inside is
  unchanged apart from the indent.
- **Preview:** the dev-only page `/dev/background/` (a switcher plus a side-by-side view) was used to choose the shade, then deleted
  as planned. It was never committed.
- **Tests:**
  - `tests/offWhite.test.tsx` covers A1–A3. A1 and A3 failed first.
  - A3 then caught the muted grey at 4.49:1 on B, and Erik chose to darken it.
  - It computes WCAG contrast from the OKLCH tokens (via OKLab → linear sRGB): muted text 4.61:1 on the paper, body text over 7:1.
  - 172 tests in all.
- **A4 pass** (Chrome):
  - The home and credits pages render `oklch(0.982 0.008 85)` behind white cards (`oklch(1 0 0)`, read from the computed styles),
    and the coming-soon block patterns still read.
  - A house page (Farnsworth) looks as before.
