# 005 — Build the hillside from the top down the slope

- **Status:** Done (approved by Erik 2026-11-08: Q1 wave, Q2 16 s, Q3 keep name)
- **Owner:** Erik
- **House:** stahl-house
- **Created:** 2026-11-08
- **Commits:** 309af6f

## Goal
The build opens with "Shaping the hillside" (24 s), and it's the least interesting part of the show. It builds strictly in layers,
bottom-up, starting 150 ft below the house, so for most of the phase the action is far below the default camera, out of frame.
Start where the visitor is looking, at the top of the mound where the house will stand, and let the hillside spread outward and down the slope from there.

## Research (2026-11-08, at ea17490)
- Since spec 004 the hillside is **22,720 of 27,222 pieces (83%)**, and 45% of them are more than 40 ft below the house.
- With today's bottom-up layer order, the first hillside piece within 90 ft of the house lands at **4.8 s**, and the first piece at pad level
  lands at **19.1 s** of the 24 s phase.
- A hidden terrain mesh already sits 3 ft under every brick surface (spec 004), so pieces landing "on the ground" never look like they're floating.
  Only the steep cut faces (columns several bricks deep) need care: a brick there must not land before the brick under it.

## Behavior
- The phase opens with the **house pad**: the level lawn and lot around where the house will stand appear first, right in the default view.
- From there the hillside **spreads outward and downhill** in a wave: nearer and higher ground first, the far bottom of the slope last.
- **Nothing floats.** Within each spot the bricks still stack bottom-up. The wave just reaches the pad first.
- (Q2) The phase is shorter, so the part the visitor wants to see, the house going up, starts sooner.

## Acceptance criteria (draft, finalized once the open questions are answered)
- **A1** [unit] The pad comes first: every hillside piece at pad level within the pad (`PLATEAU`) starts within the first 25% of the phase.
- **A2** [unit] Outward and downhill: hillside pieces' start times increase with their distance from the house. The Spearman rank
  correlation between start time and (horizontal distance + drop below the pad) is ≥ 0.8.
- **A3** [unit] Nothing floats: in every stud cell, hillside pieces start bottom-up. A piece never lands before the piece under it in the same spot.
  (The lowest piece of each stack rests on the hidden terrain mesh or is enclosed by its neighbors, as in the finished model today.)
- **A4** [unit] The other phases keep their order and durations. The total time changes only by the hillside phase's change (Q2).
  Baseline S1–S4 and S6 still hold. S5 is amended: the hillside phase uses the new order, and the other `layer` phases are still bottom-up.
- **A5** [unit] The model itself doesn't change: same 27,222 pieces and same whole-model fingerprint. Only start times move.
- **A6** [manual] From the default camera at 1×, something is happening around the house within the first second, and the wave reads clearly as spreading down the hill.
- **A7** [manual] At 4× and 16×, nothing visibly pops in mid-air.

## Out of scope
- Camera moves during the hillside phase (e.g. an automatic fly-down). That could be a follow-up.
- Changing what's in the hillside or the other phases.

## Open questions
- [x] **Q1 — Order.** *(a) Outward-and-down wave from the house (recommended):* sort hillside pieces by horizontal distance from the house
      plus their drop below the pad, but keep each spot bottom-up so nothing floats. *(b) Strict top-down by layer:* the pad first, then each layer
      below it. Simpler, but steep faces would show pieces hanging in mid-air until the bricks under them arrive.
- [x] **Q2 — Duration.** Keep 24 s, or shorten it? *Recommended: 16 s.* The wave reaches the far slope by the end either way, and the house starts 8 s sooner.
      The total build time goes 236.7 → 228.7 s, still inside S6's 220–250 s.
- [x] **Q3 — Name.** Keep "Shaping the hillside"? *Recommended: yes.*

## Implementation notes
- `src/bricks/catalog.ts`: the hillside phase has a new order, `'wave'`, and lasts 16 s (was `'layer'`, 24 s).
- `src/build/sequencer.ts`: `waveKeys()` gives each piece key = horizontal distance from `WAVE_CENTER` (the house centre)
  + the drop of the piece's top below the pad, in ft. Going through pieces bottom-up, it raises a piece's key to just above the key of
  every piece under it in any of its stud cells, so stacks still go up bottom-first (A3) while the overall wave moves out and down.
  Start times stay evenly spaced by rank, as before.
- The model is untouched: 27,222 pieces, whole-model fingerprint `ebe0f28f` (`modelFingerprint()` in `tests/fingerprint.ts`).
- **Numbers:** first piece next to the house 4.8 s → **0.0 s**; the 560-piece pad interior done by **2.3 s** (14% of the phase);
  the house starts at **17.5 s** (was 25.5 s); total 236.7 → **228.7 s**.
- **Results:**
  - A1–A5: `tests/hillsideWave.test.ts`, plus updated 002-A4 durations and the S5 note. 45 tests total.
  - A6 pass: from the default camera a green disk forms around the house at 0:01 and spreads over the pad and down the slopes (0:04, 0:09).
    At the wave front, the deeper stacks briefly show as a fringe of short columns rising from the ground. That reads as growth, not floating.
  - A7 pass: played live at 4× and 16×, nothing appears in mid-air, and the foundations start at 0:18.
