# 083 — Jazz while the buildings go up

- **Status:** Done (closed by Erik 2026-11-19: "commit this and close the spec", with A18, his iPhone, and how it sounds
  not reported; approved by Erik 2026-11-19 with his answers to the two open questions: "airport lounge 40% volume,
  can you load the audio in a way that it doesn't affect the performance of the site"; asked for by Erik 2026-11-19: "could we add royalty free jazz music playing during the assembly of the
  buildings?"; his choices the same day: he picks the track from a shortlist, CC0 or CC BY, on by default with a mute button (changed to off by default later that day: "let's start with music off"),
  and it keeps playing while exploring)
- **Owner:** Erik
- **Created:** 2026-11-19
- **Commits:** <!-- filled in when Done -->

## Goal
A building page has a soundtrack: one jazz track starts when the visitor starts the build and keeps playing while they
watch and explore, if they switch it on. Today the site is silent. Music starts off; one press turns it on, and the site
remembers that.

## Behavior
- **Off until asked for.** Music starts off. The intro card has a small "Music off" switch beside its two buttons;
  pressing it makes it "Music on". The choice is saved in the browser and applies to every building, so a visitor who
  switched it on gets music on their next visit without asking again.
- **Start.** With music on, it starts when the visitor presses "Start building" or "See it finished" on the intro card,
  and fades in over about 1.5 seconds. Nothing plays before that press, and nothing plays on the home page or the credits
  page. Switched on later, from the speaker button, it starts at that press.
- **It keeps playing.** The track repeats from the start when it ends. Pausing the build, changing speed, scrubbing the
  timeline, Finish and Restart don't change the music: it is the page's soundtrack, not tied to the build clock.
- **Speaker button.** A speaker button sits in the bottom bar, on wide screens and on phones. It shows whether music is
  on, has a tooltip, and the `M` key does the same. Turning it off stops the music; turning it on again continues from
  where it stopped. It is the same choice as the intro card's switch.
- **Hidden tab.** The music pauses when the tab is hidden and continues when the visitor comes back.
- **The track** is "Airport Lounge" by Kevin MacLeod (5:08), at 40% of its full volume.
- **It doesn't slow the site.**
  - Nothing about the music is downloaded or set up before the press, so pages load exactly as fast as today. A visitor
    who leaves the music off never downloads it.
  - After the press the browser streams the file while it plays: the building doesn't wait for it, and it is played by
    the browser's own player, off the thread that draws the bricks.
  - The music never makes the scene redraw: a finished, resting building still draws nothing (spec 069).
  - The 40% is in the file itself, so it is the same on iPhones, which don't let a page set the volume. There the music
    starts at once, without the fade.
- **Skipped intro.** Links that skip the intro card (`?clean`, used by the video and link-preview scripts) stay silent.
- **Credit.** The credits page gets a "Music" section naming the track, Kevin MacLeod (incompetech.com) and the CC BY 4.0
  licence, with links.
- **One track for the whole site**, the same on every building.

## Acceptance criteria
- **A1** [unit] `shouldPlay` is true only when the build has been started, music is not muted and the tab is visible; false
  in each of the other cases.
- **A2** [unit] The saved choice: nothing saved reads as off (muted); a saved "on" reads back as on and a saved "off" as
  off; reading and writing don't throw when the browser blocks storage, and blocked storage reads as off.
- **A3** [unit] The wide layout's bottom bar has a mute button with an accessible name, `aria-pressed` matching the muted
  state, and pressing it calls the mute handler.
- **A4** [unit] The phone layout's bottom bar has the same button, 36 px like the play button beside it.
- **A5** [unit] The credits page has a Music section with the track's title, "Kevin MacLeod", a link to incompetech.com
  and a link to the CC BY 4.0 licence.
- **A6** [unit] The track's file exists in `public/` at the path the player uses and is at most 5 MB.
- **A7** [unit] The security headers test still passes with no change to the policy (the file is served by the site itself).
- **A8** [unit] Nothing in `src/engine` imports from `src/houses` (the existing test still passes).
- **A22** [unit] The intro card has a music switch, in the wide and the phone layout: it reads "Music on" with
  `aria-pressed="true"` when music is on and "Music off" with `aria-pressed="false"` when muted, and pressing it calls the
  mute handler without starting the build.
- **A23** [manual] With nothing saved, `/stahl-house/` → the card shows "Music off" → "Start building" → silence, no
  request for the music file, and the speaker button shows off. Reload → press the switch → "Music on" → "Start
  building" → music. Reload → the card shows "Music on".
- **A19** [unit] The player makes no audio element until it is first told to play; the one it then makes has
  `preload="none"`, loops, and points at the track. Telling it to stop pauses it, and telling it to play again makes no
  second element.
- **A20** [unit] The music modules don't ask for a redraw or a frame: `src/engine/music.ts` and
  `src/engine/musicPlayer.ts` contain no `requestAnimationFrame`, `askRedraw` or Web Audio (`AudioContext`).
- **A21** [manual] `/stahl-house/?debug`, music playing, building finished and auto-rotate off → the overlay still says
  "resting".
- **A9** [manual] `npm run dev` → `/stahl-house/` → "Start building" → music fades in. Reload → "See it finished" → music
  starts as well.
- **A10** [manual] Press the speaker button → silence, the button shows muted. Press again → the music continues. `M` does
  the same.
- **A11** [manual] Mute, reload, start the build → silence, and the network tab shows no request for the music file. Open
  another building → still muted.
- **A12** [manual] With music playing: pause the build, switch to 16×, scrub, Finish, Restart → the music plays on unchanged.
- **A13** [manual] Switch to another tab → the music pauses. Switch back → it continues.
- **A14** [manual] Let the track run past its end → it starts again.
- **A15** [manual] At phone width the speaker button is visible in the bottom bar and nothing in the bar is pushed off screen.
- **A16** [manual] `/stahl-house/?clean` is silent, and before the press the network tab shows no request for the music file.
- **A17** [manual] `npm run build` → `dist/music/` holds only the chosen track, and none of the candidates from
  `/dev/music/` are in `dist/`.
- **A18** [manual, Erik's phone] The music starts on "Start building" on an iPhone and the button mutes it.

## Out of scope
- A different track per building, a playlist, or a volume slider.
- Sound effects (bricks landing) and ambient sound (the falls at Fallingwater, spec 017).
- Music in the 30 s video (`npm run video`), which stays silent.
- Tying the music to the build: slowing it with speed, or ending it when the building is finished.
- Carrying the music across pages: each building is its own page, so the track starts from the beginning on each one.
- A seamless loop: the tracks have an ending, so there is a short breath before the track starts again.

## Open questions
None. Answered by Erik 2026-11-19:
- **Which track?** Airport Lounge, picked at `/dev/music/` from six by Kevin MacLeod (the others: Backbay Lounge, Bossa
  Antigua, Lobby Time, George Street Shuffle, Cool Vibes).
- **How loud?** 40%.

## Implementation notes
**Files**
- `public/music/airport-lounge.mp3`: the track, 5:08, 128 kbps, 4.9 MB, re-encoded from incompetech's 320 kbps file with
  ffmpeg (`-filter:a volume=0.4 -b:a 128k`). The 40% is in the file because iPhones ignore a page's volume setting.
- `src/engine/music.ts` (pure): the track's details (`MUSIC`), `shouldPlay`, and the saved choice (`readMuted`,
  `writeMuted`, key `blockitecture:music-muted`). The engine's first use of `localStorage`.
- `src/engine/musicPlayer.ts`: one `Audio` element, made on the first `sync(true)`, with `preload="none"` and `loop`. The
  fade-in runs from the element's first `playing` event, so it starts when sound does and not at the press.
- `src/engine/viewer.ts`: makes the player, calls it from `onStart`, the mute handler, the `M` key and `visibilitychange`.
- `src/engine/ui/Hud.tsx`, `hudStore.ts`: the speaker button at the end of both bottom bars; `muted` in the store.
- `src/credits/CreditsPage.tsx`: the Music section, from `MUSIC`.
- `tests/music.test.tsx`: A1–A6, A19, A20. A7 and A8 are the existing `securityHeaders` and `engine` tests, unchanged.

**How it stays off the scene's back** (Erik: "load the audio in a way that it doesn't affect the performance of the site")
- Before the press there is no audio element and no request. After it the browser streams the file as it plays.
- A plain audio element, not Web Audio: decoding the whole track up front would hold about 100 MB of samples and stall
  the page while it decodes.
- The player never asks for a frame. Its only timer is the fade: about 30 ticks of 50 ms, once per page.

**Trade-offs and things to know**
- Off by default (Erik, 2026-11-19: "let's start with music off"), so most visitors never download the file. `readMuted`
  treats anything but a saved "on" as off.
- The intro card's switch (`IntroCard.tsx`, `muted` / `onMute`) and the speaker button are the same choice; `M` works
  before the build starts as well.
- On phones the button takes 46 px from the timeline (149 px wide at 390 px, was 195 px), so the phase name is cut
  shorter.
- If a browser refuses to continue the music after a hidden tab, the button still shows it as on; pressing it twice
  starts it again.
- The shortlist page `/dev/music/` and the five other candidates were deleted after the pick.
- Licence, from incompetech.com's FAQ: the whole catalogue is offered under CC BY 4.0, with the credit "Title, Kevin
  MacLeod (incompetech.com), Licensed under Creative Commons: By Attribution 4.0". The credits page also says the track is
  played quieter than the original, as the licence asks for changes to be noted.

**Manual criteria** (Chrome on this Mac, dev server, 2026-11-19; the audio element was read from the page, not heard)
- **A9 passed.** "Start building": one audio element, playing, volume 0 → 1 over 1.5 s. "See it finished": the same.
- **A10 passed.** `M` paused it and the button read "Music off"; the button started it again from 3.4 s.
- **A11 passed.** Muted, opened `/eames-house/`, started: no audio element made, button read "Music off". Not checked in
  the network tab itself.
- **A12 passed.** Pause, 16×, Restart and Finish: still playing. Scrubbing not tried.
- **A13 passed, simulated.** With `document.hidden` forced and a `visibilitychange` event sent: paused, then playing
  again. Not tried with a real tab switch.
- **A14 passed.** Moved to 2 s before the end: 3.5 s later it was at 1.4 s and playing.
- **A15 passed.** In a 390 px wide frame: play, timeline, time, Finish and the speaker button all inside the bar.
- **A16 passed.** `?clean`: no audio element and no request for the file.
- **A17 passed.** `npm run build`: `dist/music/airport-lounge.mp3` is the only mp3 in `dist/`.
- **A21 passed.** `?debug`, finished, auto-rotate off, music playing: the overlay read "resting".
- **A23 passed** (after the change to off by default). Nothing saved: the card read "Music off"; "Start building" → no
  audio element, no request for the file, the bar's button read "Music off". Fresh load → pressed the switch → "Music
  on", still no audio element → "Start building" → playing at full level 2 s later. `/eames-house/` then read "Music on".
  On a wide screen the switch sits on the buttons' row (the row's gap went from 16 to 12 px to fit it); at 390 px it
  wraps to its own line under them, so the card is about 28 px taller on phones.
- A9–A16 and A21 above were walked through while music was still on by default; with it off by default they need the
  switch pressed first. Only A23 was repeated after the change.
- **A18 not checked:** needs Erik's iPhone.
- **Not checked by anyone yet:** how it sounds. I can't hear it: the level (40%), the fade and the join when it repeats
  are for Erik's ears.
