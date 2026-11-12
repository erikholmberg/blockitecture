# 000 — Baseline: the site as it exists today

- **Status:** Done (retroactive)
- **Owner:** Erik
- **Created:** 2026-11-08
- **Commits:** ba2d559, 64ae035

*Since spec 007 the viewer lives at `/stahl-house/` (the home page is `/`), and its controls are React/shadcn (`src/ui/Hud.tsx`).*

## Goal
Describe what the site already does, so that later specs only cover changes and the
behavior that exists today is protected by tests.

## Behavior
Visitors land on an intro card ("The Stahl House, brick by brick") and press **Start building**.
Pierre Koenig's Case Study House #22 then assembles itself piece by piece on a
procedurally generated Hollywood Hills site, in eight named phases, over about 4 minutes at 1×.
Visitors can orbit (default, slow auto-rotate) or walk through it in first person while it builds.

## Acceptance criteria

### Model (`src/model/*`): `tests/model.test.ts`
- **M1** [unit] The model generates ~27,200 pieces (currently 27,222; the test allows 26,000–28,500). *(Was ~17,800 before spec 004's real hillside.)*
- **M2** [unit] Generation is deterministic: two builds produce identical brick lists.
- **M3** [unit] Every piece belongs to one of the 8 phases, and every phase has at least one piece.
- **M4** [unit] Every piece has integer coordinates and positive integer size (studs × studs × plates).
- **M5** [unit] No two pieces overlap.
- **M6** [unit] Generation completes in < 1.5 s in Node (currently ~150 ms).

### Build sequence (`src/build/sequencer.ts`): `tests/sequencer.test.ts`
- **S1** [unit] The build order includes every piece exactly once.
- **S2** [unit] Phases build in catalog order and never interleave:
  hillside → foundations & pool basin → floor slab & terrace → steel frame → interior & furniture →
  glass & walls → roof deck → pool, garden & finishing touches. *(Order changed by spec 002.)*
- **S3** [unit] Start times never decrease along the order, starting at 0 and ending within the total.
- **S4** [unit] There is one phase start per phase, strictly increasing (these drive the timeline ticks).
- **S5** [unit] `layer` phases build bottom-up; `group` phases build object by object. *(Amended by 002: ceiling-hung pieces come last in their phase, top-down.
  Amended by 005: the hillside is a `wave`, outward and downhill from the house, bottom-up within each spot.)*
- **S6** [unit] A full build at 1× takes 220–250 s (currently 228.7 s; the hillside went 24 → 16 s in spec 005).

### Walk mode collision (`src/controls/collision.ts`): `tests/collision.test.ts`
- **W1** [unit] A piece only blocks the walker once it has landed (start + drop duration).
- **W2** [unit] The walker can stand on top of a landed piece.
- **W3** [unit] Before any pieces land, an invisible terrain heightmap holds the walker up.
- **W4** [unit] Lamps, bars and high ceiling lights never block the walker.

### Timeline & HUD: manual
- **H1** [manual] The intro card shows the live piece count; **Start building** starts playback.
- **H2** [manual] Play/pause (button or `P`), 1×/4×/16× speed, scrubbing, **Finish** (or `F` in orbit mode) and **Restart** all work.
- **H3** [manual] The timeline shows a tick at each phase start; the current phase name and placed/total count update while it plays.

### Views: manual
- **V1** [manual] **Orbit** is the default view: drag to orbit, scroll to zoom, auto-rotate stops on the first interaction.
- **V2** [manual] **Walk** (button or `Tab`) starts you on the carport walkway looking toward the living room.
  Desktop: click to lock the pointer, WASD/arrow keys, Shift to run, Space to jump, Esc to release.
  Touch: the left thumb moves and the right thumb looks.
  Switching back restores the previous orbit camera.
- **V3** [manual] **No roof** lifts the roof off so you can see inside; **Roof** puts it back.
- **V4** [manual] **Dusk** lights up the house and the city backdrop; **Day** turns it back.
- **V6** [manual] On-screen camera controls and named views (spec 006).
- **V5** [manual] `?debug` shows an FPS / DPR / triangle-count overlay and exposes `window.__stahl`. `?dpr=N` pins the pixel ratio (spec 004), kept between 0.5 and 3 (spec 071).

### Performance & build
- **P1** [manual] Resolution adapts: after sustained < 38 fps, the pixel ratio drops in 0.25 steps down to 0.75.
- **P2** [unit] `npm run build` type-checks (`src/` and `tests/`) and produces a static `dist/` (deployed to Vercel), including `neighborhood.bin` (spec 003).

## Out of scope
Rendering correctness (shaders, instancing, lighting) has no automated tests. It's checked by eye.

## Known issues
- **KI-1** *(Fixed in 001.)* One palm trunk's top segment overlaps its crown. In `palm()` (`src/model/landscape.ts`),
  when the trunk height isn't a multiple of 3, the last 3-plate segment runs past `t`, where the crown is placed.
  The overlap is above the occupancy grid ceiling (`G.y0 + G.ny = 44` plates in `voxel.ts`), so `add()` doesn't catch it.
  `tests/model.test.ts` allows exactly this one overlap; fix it in a follow-up spec and set the allowance to 0.
- **KI-2** *(Fixed in 001.)* The occupancy grid only covers y < 44 plates, so placement above that height is never checked.

## Implementation notes
Retroactive spec, written by reading the code at 64ae035.
