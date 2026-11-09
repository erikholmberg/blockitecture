# 002 — Furnish the interior before the walls and roof go up

- **Status:** Done (approved by Erik 2026-11-08: Q1 yes, Q2 after, Q3 yes)
- **Owner:** Erik
- **House:** stahl-house
- **Created:** 2026-11-08
- **Commits:** c1448e5

## Goal
Today the roof and the solid walls are built *before* the furniture, so the most detailed
phase of the build happens inside a closed box. Visitors only see it if they find the **No roof**
toggle. If the interior is furnished while the house is still an open steel frame, the build is
much easier to watch.

## Behavior
The house is built in this order (changes in **bold**):

1. Shaping the hillside
2. Foundations & pool basin
3. Floor slab & terrace
4. Steel frame
5. **Interior & furniture.** Furnished inside the open frame, with nothing in the way.
6. **Glass & walls.** Walls go up around the furniture that's already in place.
7. **Roof deck.** The roof closes the house.
8. Pool, garden & finishing touches

The phase names, the per-phase durations and the total build time (~236.7 s at 1×) stay the same.
Only the order changes. The timeline ticks and the phase label follow the new order.

### Ceiling-hung items
Three interior items hang from the ceiling: the luminous kitchen ceiling panel, the suspended
cabinets over the kitchen island (with their rods), and the three pendant lamps over the kitchen
(with their rods). Once the roof comes after the interior, these would float in mid-air.
They move into the *Roof deck* phase and are hung **after** the deck above them is in place,
top-down: rods and ceiling panel first, then the cabinets and lamps.

*(Correction to the draft: the fireplace hood stands on the firebox walls, so it doesn't hang.
It stays in the interior phase.)*

## Acceptance criteria
- **A1** [unit] `PHASES` order is: hillside, foundations & pool basin, floor slab & terrace,
  steel frame, interior & furniture, glass & walls, roof deck, pool/garden/finishing touches.
- **A2** [unit] In the build order, every interior piece (other than the ceiling-hung items) starts
  before every glass/wall piece, and every glass/wall piece starts before every roof-deck piece.
- **A3** [unit] Ceiling-hung pieces are flagged `hangs: true`, belong to the *Roof deck* phase, and
  start after every non-hanging roof piece. Among themselves they go top-down (non-increasing top).
  Exactly these are flagged: the kitchen light panel, the suspended cabinets and their 2 rods,
  and the 3 pendant lamps and their 3 rods. Nothing else.
- **A4** [unit] The total build time and each phase's duration are unchanged (S6 still 220–250 s).
- **A5** [unit] The model itself is unchanged: same piece count (17,823) and same positions, colors
  and kinds. Only the `phase` and `group` fields may differ.
- **A6** [unit] Baseline S1–S4 still hold. **S5 is amended:** `layer` phases build bottom-up *except hanging pieces*, which come last, top-down (see A3).
- **A7** [manual] `npm run dev` → Start building at 16×. During *Interior & furniture* there is a clear view
  into the house from the default orbit, with no roof and no street wall in the way.
- **A8** [manual] Ceiling-hung items don't float. They appear at the end of *Roof deck*, under the finished ceiling.
- **A9** [manual] Studs: no stud is drawn sticking out of a wall or roof once the build finishes.
  Stud visibility depends on phase order, so check the bedroom wing and the kitchen.

## Out of scope
- Making the roof transparent or lifting it automatically. The **No roof** toggle stays as it is.
- Re-timing phases (e.g. making the interior longer). That can be its own spec.

## Open questions
- [x] **Q1:** Should ceiling-hung items move into *Roof deck*? **Yes.**
- [x] **Q2:** **After the furniture.** Should the interior partitions (white walls between rooms) also wait until after the furniture,
      or should they go up *before* the furniture so rooms are defined first? The draft order puts all
      walls after the furniture, which gives the clearest view, but furniture then briefly sits in
      undivided space. (Recommended: after, for the view.)
- [x] **Q3:** **Yes, view over realism.** Real construction closes the roof before fitting out. Is it fine to give up that realism
      for the view? (Recommended: yes. This is a showpiece, and the README can say so if needed.)

## Implementation notes
- `src/bricks/catalog.ts`: `PHASES` reordered (durations untouched). `P.INTERIOR`, `P.ENVELOPE` and `P.ROOF`
  renumbered to 4/5/6, so phase indices still match build order. `computeStuds` relies on that.
  `Brick` gets an optional `hangs?: true`.
- `src/model/voxel.ts`: `Builder.hanging(phase, place)` places pieces into another phase and flags them `hangs`.
- `src/model/interior.ts`: the suspended cabinets and the luminous ceiling panel with its pendant lamps are
  wrapped in `b.hanging(P.ROOF, …)`.
- `src/build/sequencer.ts`: in `layer` phases, hanging pieces sort after all solid pieces, top-down.
- Geometry fingerprint (FNV-1a over position/size/color/kind/studs/thin) is `361f4999` both before and after.
  The house is unchanged.
- Studs: 38,243 → 38,249. The 6 new studs are on top of the fireplace flue, which is now built before the roof deck.
  They're visible while the flue stands open and are then buried inside the deck plate (0.2 vs 0.4 units), the same as wall-top studs.
- Timeline: interior 90–142 s, walls 143.5–173.5 s, roof 175–199 s (hanging pieces ~199 s), garden from 200.5 s. Total 236.7 s.
- Manual results (Chrome, `?debug`):
  - A7 pass: at 125 s the house is an open frame with the furniture clearly visible.
  - A8 pass: the deck is finished by ~197 s and the ceiling panel appears at ~199 s, under it.
  - A9 pass: no studs on the finished roof except the vents (intentional).
- Tests: `tests/phaseOrder.test.ts` (A1–A5). Baseline S5 amended for hanging pieces (A6). 28 tests total.
