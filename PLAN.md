# PLAN — future improvements & new features

## Context & guiding principles

This is a private, friends-only prediction game (~10 players) that runs a shared money pot.
It's **not a commercial product** and never will be — so there's no scale/perf work that
doesn't bite at this size, no premature optimization. What matters is: it feels good to use,
it's low-effort to run each tournament, and it stays low-effort to resurrect for years.

**Horizon: 10+ years.** The goal is to reuse this system for each FIFA World Cup and UEFA
Euro (every ~2 years, 5+ tournaments), and possibly other events. Dependencies and external
coupling are evaluated against "will this still work in 2034?" — not just "does it work
today." This is why self-containment (#14–#16, #29, #32) matters more than it would for a
throwaway app.

**Design principle — two views, premium feel.** The app has just two user-facing views
(predictions + leaderboard) with a clean, minimal aesthetic. New features must layer in
_subtly_: fold information into existing surfaces, prefer progressive disclosure (details on
tap) over chrome-on-every-screen. Avoid proliferating buttons, toggles, and badges into a
"power user" UI. When in doubt, less is more.

**Branch strategy.** This list is built on the `future` branch. Items are independent and
can be cherry-picked to `main` individually. The items marked `ship-now` below are safe to
ship to the _current live tournament_ mid-stream — they're purely visual (or trivial
non-behavioral refactors) with no schema, game-logic, or flow changes, so they won't
disrupt an in-progress tournament.

**Legend:** `ship-now` = purely visual / safe to cherry-pick to the live tournament now. `done` = completed.

---

## UX

### 1. Error feedback on actions

`savePrediction` and the admin actions ignore their return values, and `pendingAction`
state never resets if the action throws — so buttons can stick in "loading..." forever
with no error shown. Surface action errors to the user and always reset pending state
(in a `finally`).

### 2. Roll back optimistic prediction on failure

`match-card.tsx` sets an optimistic pick but never reverts it if `savePrediction` fails
(e.g. a lock-race at kickoff). Revert the optimistic value and show a message on failure.

### 4. Invalid-session redirect

A tampered/expired session cookie renders a blank screen (pages do `if (!user) return null`)
with no recovery path. Redirect to `/` with a "session expired" message instead.
(Realistic trigger: rotating `ADMIN_INVITE_CODE`, which is the HMAC session secret today.)

---

## Setup for a future tournament

### 10. Dynamic stage structure

The `Stage` enum is hard-coded to the WC2026 48-team format (`group | r32 | r16 | qf | sf
| third | final`) — `r32` only exists because 2026 expanded to 48 teams. Make the stage
value data-driven (free text + a label map) so a 32-team tournament or a different
format needs no schema change.

### 11. Non-destructive bootstrap

`scripts/seed.ts` truncates every table with no guardrail — re-running against a live DB
wipes everything. Split into a non-destructive upsert `bootstrap` vs the destructive
`seed`, so spinning up or refreshing a tournament can't accidentally nuke live data.

### 12. Real setup / onboarding doc

`README.md` is still the `create-next-app` boilerplate. Replace it with actual steps to
spin up a new tournament: provision a DB, set env vars, migrate, seed/bootstrap, deploy.

### 13. Configurable scoring

Scoring is hard-coded to 1 point per correct pick (`src/lib/scoring.ts`). Make the rules
a small typed config object so a future tournament can define different point values
(e.g. per stage) without touching code. Foundation for the risk/reward prediction modes
below.

---

## External-system coupling

### 14. `output: 'standalone'`

Add `output: 'standalone'` to `next.config.ts` (currently empty). One line, zero cost,
makes the app Dockerizable / runnable on any VPS or Raspberry Pi via `next start` — the
real optionality for "what if Vercel isn't available."

### 15. Clean DB seam (SQLite-swappable)

Turso coupling is thin (4 import/config lines; schema is already pure `sqliteTable`).
Abstract the db-client init so swapping to plain SQLite (`better-sqlite3` / `node:sqlite`)
is a 4-line change and nothing more. Keeps Turso as the default but makes the swap trivial.

### 16. Bundle flag images locally

Flags load from `flagcdn.com` at runtime — the app's one external dependency, which breaks
if the CDN is down/blocked. Ship the flag images in-repo (`public/flags/`) so the app is
fully self-contained.

---

## New features

### 17. Auto-fetch results

Today the admin enters match results by hand, which is "delayed by hours, sometimes days."
Add an optional "Hae tulos" button that pulls a match result from a free sports feed.
Keep it opt-in / manual-trigger so it never blocks the existing manual-entry path. Kills
the biggest real-world drag in the workflow.

### 19. Flexible prediction modes with risk/reward scoring

Make predictions dynamic per match/stage instead of always 1X2:

- **Format variety**: some matches offer 1X2, others exact-score, and knockout matches can
  offer "who proceeds."
- **Player-chosen risk**: in supported matches the user picks how bold to be — e.g. safe
  (advancer → 1pt), medium (1X2 → 2pts), bold (exact score → 4pts, 0 if wrong).

A high-risk/high-reward layer that rewards bravery. Builds on #13 (configurable scoring)
and #10 (dynamic stages); touches the predictions schema, match-card UI, and scoring logic.

### 20. Scheduled auto-lock by deadline

Locking is manual today (admin toggles per match/stage). Let the admin configure
deadlines — e.g. "lock all group-stage picks 5 min before the first kickoff of the day" —
and have matches auto-lock at the scheduled time. Reduces admin ceremony and removes the
"forgot to lock" failure mode. Pair with #17 (auto-fetch) for a fully hands-off result flow.

### 22. Self-registration with join code + generated password

Replace the per-user invite-code flow (admin generates + distributes N codes by hand):

- **Sign-up**: a new player enters a shared **join code** (admin posts it in the group chat
  once) and picks their own display name.
- **Log-in**: on sign-up the system generates a **4-digit password** the user keeps and uses
  to log in on future visits (login becomes name + password, two fields instead of one code).
- **Recovery**: if a password is forgotten, the admin can view/reset it.
- **Safety valve**: admin can delete or rename a user (handles name-squatting and
  non-payers). `users.name` is already unique, so names are first-come-first-served.

Removes the biggest admin onboarding bottleneck while keeping the game private (the join
code is the gate). Note: there is no delete/rename-user admin capability today — that needs
adding as part of this.

### 23. Pot & payouts

The group runs a shared money pot (entry fee × players, split by final standings). Money
handling itself stays external (cash/transfer), but the app surfaces the math:

- **Payment tracking** (admin-only): a simple paid/unpaid toggle per user, with the
  outstanding count visible to the admin/"game-leader."
- **Pot total** (everyone): fixed entry fee × number of players, shown on the leaderboard.
- **Projected payout** (everyone): live payout per rank, shown next to the current
  standings.
- **Configurable payout split**: define the split in config (e.g. 60/30/10 for top 3,
  winner-takes-all, etc.).

### 24. End-of-tournament share card

At tournament end, generate a shareable "my season" summary card: final rank, best streak
(from #18), biggest upset call, pot result (from #23). Lightweight bragging-rights output
that fits the friends-game spirit.

---

## Visual polish

### 26. Responsive desktop layout `ship-now`

The app is mobile-first and caps everything at `max-w-lg` centered on screen — on desktop
it's a narrow phone-width strip with dead space on both sides. Add a real responsive
layout: wider multi-column grids on larger screens (e.g. predictions as 2–3 columns of
match cards, leaderboard + compare side-by-side, admin tables with room to breathe).

### 28. Zoom accessibility `ship-now`

Some users browse with their mobile device zoomed in. Verify the layout holds at 200% zoom
(no horizontal scroll, no overlapping/cropped controls, bottom nav still reachable) and
that text reflows rather than getting cut off.

---

## Architecture

### 29. Static reference data in code, not the DB

Today the full team catalog (id, name, flag) lives in the `teams` table and is fetched from
the DB on every page load — but it's seeded once and **never changes** during a tournament.
Querying static data from the DB is pointless overhead.

- **Move to code**: the team catalog (and similarly the static group-stage fixture data —
  home/away/kickoff) becomes a typed constant in code.
- **Keep dynamic state in the DB**: match results, lock status, and knockout team
  _assignments_ (admin sets these via `setMatchTeams`) stay in the DB — only those actually
  change.

Net effect: eliminates the `teams` table reads, the FK joins, and one of the two cached
queries in `getCachedTeamsAndMatches`. The static catalog also doubles as the natural home
for the flag data (#16), collapsing three sources (seed + `flags.ts` + DB) into one code
constant. Less data round-tripped, fewer moving parts — not for scale, just for not doing
pointless work.

### 30. Deterministic bracket resolution

Knockout matchups aren't random — they follow a fixed, pre-published mapping (e.g. winner of
Group A vs runner-up of Group B; winner of R32 match 1 vs winner of R32 match 2; the WC2026
"best 8 third-placed teams" slotted into specific R32 positions). Today the admin manually
assigns KO teams via `setMatchTeams` once group results are known, which is busywork and
error-prone.

Encode the bracket rules in the tournament config so KO assignments are **computed
automatically**:

- A declarative slot mapping (which group position / prior match feeds each KO slot), pulled
  verbatim from the official source — not reconstructed from memory.
- Resolution runs **when a prerequisite result lands** (group standings settle → R32 slots
  fill; R32 results → R16 slots fill; etc.), whether via auto-fetch (#17) or manual entry.
- **"All, with a safety net":** with score data (#31), the app computes full standings with
  real tiebreakers (goal difference, goals scored) and resolves ~all cases automatically.
  When a tie is unresolvable by the tracked data (the rare fair-play / FIFA-ranking tier —
  once-a-decade frequency), the system **detects** it, flags the slot as unresolved, and the
  admin enters it by hand. No silent guessing, no "TBD" as a routine state.
- **Manual override always available**: admin can correct any individual assignment via the
  existing team-select UI.

Depends on #31 (score tracking) for tiebreaker data. Pairs with #29 (config holds the
bracket rules) and #17 (auto-fetch results cascade through the bracket). Biggest win for
reducing admin ceremony during the knockout phase.

### 31. Track real match scores

Add actual score data (home goals, away goals) per match, not just the 1X2 result. This
unlocks three things:

- **Group standings with real tiebreakers** (points → goal difference → goals scored) — the
  prerequisite for deterministic bracket resolution (#30).
- **Graceful failure detection** for unresolvable ties (fair-play/FIFA-ranking tier): the
  system knows when it can't decide and flags the slot for manual entry.
- **Exact-score predictions** as a new prediction mode (#19), since the data now exists.

Scope: add `home_score` / `away_score` columns to `matches`; admin result-entry becomes
entering the score (1X2 is then derived, not stored separately); UI shows scores where
relevant. Foundation for #30 and a richer #19.

---

## Long-term maintainability

### 32. Minimize external dependencies

**Timeline reality check:** the goal is to reuse this system for each FIFA World Cup and UEFA
Euro for the next **10+ years** (every ~2 years, 5+ tournaments). A dependency added today
may need updating, breaking-change handling, or replacement 5 times over that horizon.
Treat every dependency as a long-term maintenance liability, not just a today convenience.

- **Audit and justify each dep** against "will this still exist / be maintained / be
  installable in 2034?" Prefer fewer, larger, stable packages over many small/fly-by-night
  ones. Be willing to run an older-but-stable version if it works.
- **Concrete candidates to reconsider:** the runtime surface is already lean (`next`,
  `react`, `react-dom`, `@libsql/client`, `drizzle-orm`) — that's good. The dev-time
  conveniences (`tailwindcss`, `drizzle-kit`, `tsx`, `eslint`, `typescript`) carry more
  churn risk; evaluate whether each earns its keep over the horizon.
- **Self-containment (#14, #15, #16, #29) compounds here:** the more the app does with code
  constants and a swappable local DB rather than external services/libs, the less there is to
  break over a decade.

This is an ongoing principle, not a one-time refactor — bake it into how new deps are
evaluated whenever a feature is built.

---

## Visual polish (continued)

> **Design principle for everything below:** the app currently has just two user-facing
> views (predictions + leaderboard) and a clean, premium feel. New features must layer in
> _subtly_ — fold information into the existing surfaces, avoid proliferating buttons,
> toggles, and badges into a "power user" UI. Prefer progressive disclosure (details on
> tap) over chrome-on-every-screen.

---

## New features (continued)

### 41. Export final standings for historical records `ship-now`

At tournament end, let the admin export the final standings (per-player points, rank, picks)
to a CSV or similar file — purely for off-app historical record-keeping.

**Key constraint:** the app itself must remain **wipeable at any time** when no tournament is
in progress. History does _not_ live in the app — the export is the record, the DB can be
nuked afterwards. So this is a one-way export (no import, no in-app archive), deliberately
kept external so the app stays clean and disposable between tournaments.

Pairs with #24 (share card) as the other end-of-tournament output — one for the group chat
(visual share), one for the admin's records (data).
