# 051 — The Stahl House's blurb, without "real hillside"

- **Status:** Done (requested by Erik 2026-11-10, with the wording approved: "go ahead with that wording". Closed by Erik 2026-11-10: "close the specs")
- **Owner:** Erik
- **House:** stahl-house
- **Created:** 2026-11-10
- **Commits:** 7d06ae4

## Goal
The Stahl House's home card says it's "on the real hillside above the Sunset Strip". That was true of it alone when spec 004 put
it on the real terrain; now every house stands on its real site, so "real" suggests the others don't.

## Behavior
The Stahl House's home card blurb reads "Steel, glass and a view over the whole of Los Angeles, from a hillside above the Sunset
Strip." Nothing else changes.

## Acceptance criteria
- **A1** [unit] The Stahl House's blurb is exactly the new sentence, and no house's blurb says "real hillside".
- **A2** [manual] In `npm run dev`, the Stahl House's card reads as in Behavior.

## Out of scope
- "Real hillside" in code comments and test names: not seen by visitors.

## Open questions
None.

## Implementation notes
- **Changed:** the blurb in `src/houses/index.ts`.
- **Tests:** `tests/stahlBlurb.test.ts` covers A1; it failed first. `npm run check`: 358 tests pass.
- **A2 pass** (Chrome): the Stahl House's card reads "Steel, glass and a view over the whole of Los Angeles, from a hillside
  above the Sunset Strip."

