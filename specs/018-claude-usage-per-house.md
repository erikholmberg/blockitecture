# 018 — Claude usage per house

- **Status:** Approved (approved by Erik 2026-11-09: all recommendations; transcripts kept for 365 days)
- **Owner:** Erik
- **Created:** 2026-11-09
- **Commits:** <!-- filled in when Done -->

## Goal
Erik can see how much of his Claude usage each house took to build (and how much went to shared work like the engine and the home page),
and the numbers outlive Claude Code's local logs. A developer tool only: nothing visitors see changes.

## Research (2026-11-09)
- Claude Code keeps one transcript per session in `~/.claude/projects/-Users-erikholmberg-Development-blockitecture/*.jsonl`
  (subagent transcripts in a subfolder). Every assistant message has a timestamp, a `message.id` and a `usage` record:
  `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens`.
- One message can span several lines with the same `message.id` and the same usage, so totals must count each id once.
- A prototype over today's two transcripts: 566 messages, matched to their commits without trouble. Example: the Eames House commit window
  (491d035) is 110 messages, 213,582 output tokens and 87.8M cache-read tokens.
- **Gaps:**
  - The Stahl House was built before the first commit and before these transcripts, so its original build can't be counted.
    Only its later specs (001–009) are.
  - Sessions on other machines or in the cloud aren't on this disk.
  - **Claude Code deletes transcripts after 30 days** by default (`cleanupPeriodDays`), so totals must be saved into the repo.
- Plan usage (the percentage claude.ai shows) isn't in the logs. Tokens are the closest honest measure, and each house's share of the total
  answers "how much of my usage".

## Behavior
- `npm run usage` prints a table: one row per house plus **shared** (engine, home page, process) and **in progress** (work since the last
  commit). The columns are messages, input, cache-write, cache-read and output tokens, and the share of the total.
  `--by-spec` gives one row per spec.
- **How work is matched to a house:**
  - A message belongs to the first commit made after it.
  - The commit's subject names its specs: "(spec 017)", "(specs 010b, 011, 012)".
  - Each spec names its house in a new header line, `- **House:** fallingwater`. A spec with no `House` line counts as shared.
  - A commit that names several specs splits its usage evenly between them.
- `npm run usage -- --record` adds every commit not yet recorded to `usage/ledger.json` (committed): commit hash, date, specs and token
  totals. Running it twice adds nothing. The table reads the ledger and the live transcripts, without counting a commit twice, so commits whose
  transcripts have been cleaned up still count.
- **Close-out** (added to CLAUDE.md's step 4): run `npm run usage -- --record`, commit the ledger, and for a house spec, write its totals
  into Implementation notes.
- From now on, each commit covers one house at most, so the even split never mixes two houses.
- Specs 001–016 get their `House` lines now (stahl-house, eames-house, or none), and the ledger is backfilled from today's transcripts.

## Acceptance criteria
- **A1** [unit] A message that spans several transcript lines with one `message.id` is counted once; subagent transcripts are included.
- **A2** [unit] Messages go to the first commit after their timestamp; messages after the last commit are "in progress".
- **A3** [unit] Commit subjects parse to spec IDs ("spec 017", "specs 010b, 011, 012"; "010b" counts as spec 010), and those map to houses
  through the specs' `House` lines (no line → shared). A commit with several specs splits evenly.
- **A4** [unit] `--record` is idempotent, and the table counts a commit that's in both the ledger and the live transcripts only once.
- **A5** [unit] Spec 017 says `House: fallingwater`, and the template has the `House` line.
- **A6** [manual] `npm run usage` shows rows for stahl-house, eames-house, shared and in progress, and their totals match the
  prototype's grand total for the same transcripts.

## Out of scope
- Dollar costs. The plan isn't billed per token, and API prices would only be an estimate (see Q2).
- Plan percentages from claude.ai, and sessions that aren't on this machine.
- Anything on the site.

## Open questions
- [x] **Q1: Keep transcripts longer?** *Recommended: also set `cleanupPeriodDays` to 365 in your user settings*, so the raw logs stay as a
      backup to the ledger. *Erik: yes; set to 365 in `~/.claude/settings.json`.*
- [x] **Q2: Dollars?** *Recommended: tokens only.* Add an API-price estimate column if you want one, with prices kept in a config file.
- [x] **Q3: Mixed commits.** *Recommended: an even split*, as above. The alternative is weighting by lines changed per spec: more work, and
      hardly any more accurate.

## Implementation notes
Filled in after approval.
