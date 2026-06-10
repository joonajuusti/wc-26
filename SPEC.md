# Performance & Responsiveness Spec

## Problem

The app feels sluggish: buttons lack feedback during server actions, actions take time
due to `refresh()` causing full page re-renders, navigation has no loading states, and
on mobile Safari the bottom nav is hidden behind the URL bar.

---

## Fix 1 — Mobile Safari URL bar overflow

**Root cause**: `layout.tsx` uses `h-screen` (= `100vh`), which is Safari's *large*
viewport. When the URL bar is visible it slides down and covers the bottom nav.

**Fix**:
- `layout.tsx`: change `h-screen` to `h-dvh` on the outer flex container
- Remove the `[&:has(nav)]:pb-[env(safe-area-inset-bottom)]` workaround on `<body>`
  (the `h-dvh` + nav's existing `pb-[env(safe-area-inset-bottom)]` handles this)

**Files**: `src/app/layout.tsx`

---

## Fix 2 — Loading states for every route

Add `loading.tsx` skeleton UI so navigation shows instant feedback instead of a blank
screen while the server renders.

**Files to create**:
- `src/app/predictions/loading.tsx`
- `src/app/leaderboard/loading.tsx`
- `src/app/omat/loading.tsx`
- `src/app/admin/loading.tsx`
- `src/app/admin/matches/loading.tsx`
- `src/app/admin/users/loading.tsx`
- `src/app/users/[name]/loading.tsx`

**Pattern**: gray pulsing blocks matching each page's real layout shape.

---

## Fix 3 — Optimistic UI on MatchCard

**Root cause**: `useTransition` is used but `isPending` only disables the button — no
visual change. The user sees nothing until `refresh()` completes a full page re-render.

**Fix**:
- Replace `useTransition` with `useOptimistic` to immediately show the picked option
  as selected
- Add a subtle `animate-pulse` + reduced opacity to the optimistically selected button
  to indicate "saving..."
- On success the optimistic value becomes permanent; on error it auto-reverts
- Add `active:scale-[0.97] transition-transform` to all three buttons for tactile press

**File**: `src/components/match-card.tsx`

---

## Fix 4 — Admin action feedback

**Root cause**: `match-list.tsx` handlers call server actions with no `useTransition` or
loading state at all. User has zero feedback.

**Fix**:
- Wrap `handleResult`, `handleTeam`, `handleLock`, `handleUnlock` in `startTransition`
- Track pending state per action:
  - Per-match result pending (`pendingResultMatchId`)
  - Per-match team pending (`pendingTeamMatchId`)
  - Lock/unlock pending stage (`pendingLockStage`)
- Visual indicators: dim buttons/selects while pending, disable to prevent double-click
- Add `active:scale-[0.97] transition-transform` to result buttons

**File**: `src/app/admin/matches/match-list.tsx`

---

## Fix 5 — User list loading state

The user list already has a manual `loading` state for the "generate" action. This is
fine — just verify the button shows loading text and is properly disabled.

**File**: `src/app/admin/users/user-list.tsx`

---

## Fix 6 — Replace `refresh()` with `revalidatePath()`

**Root cause**: `refresh()` invalidates the entire router cache, causing every active
route to re-render server-side on next navigation. This makes every action expensive.

**Fix**: Replace each `refresh()` with targeted `revalidatePath()` calls.

**File**: `src/actions/predictions.ts`
- `savePrediction`: revalidate `/predictions`, `/omat`

**File**: `src/actions/admin.ts`
- `setMatchResult`: revalidate `/predictions`, `/omat`, `/leaderboard`, `/admin/matches`, `/admin`
- `setMatchTeams`: revalidate `/predictions`, `/omat`, `/admin/matches`
- `lockStage` / `unlockStage`: revalidate `/predictions`, `/omat`, `/admin/matches`
- `generateInviteCode`: revalidate `/admin/users`

---

## Fix 7 — Cache teams + matches data

**Root cause**: Every page load fetches the full teams + matches tables from the DB.
Teams never change during the tournament; matches change rarely (only when admin sets
results).

**Fix**: Create a shared cached query helper using `unstable_cache`.

**File**: new `src/lib/cached-queries.ts`
- `getCachedTeamsAndMatches()` — cached for 60s, keyed as `["teams-matches"]`
- `getCachedTeams()` — cached for 60s

Consumers:
- `src/app/predictions/page.tsx` — use cached helper for teams+matches, keep
  predictions query dynamic
- `src/components/user-predictions-view.tsx` — same split
- `src/app/leaderboard/page.tsx` — predictions+matches join stays dynamic
  (user-specific), but could cache the base match data

---

## Fix 8 — Batch admin DB operations

**Root cause**: `lockStage` and `unlockStage` loop over matches with individual
`await db.update()` calls — N sequential DB roundtrips for N matches in a stage.

**Fix**: Fetch match IDs, then do a single `UPDATE ... WHERE id IN (...)` using
`inArray`.

**File**: `src/actions/admin.ts`
- `lockStage`: single `db.update().set({ locked: true }).where(inArray(matches.id, ids))`
- `unlockStage`: same pattern with `locked: false`

---

## Fix 9 — Button press feedback

Add tactile press animation to interactive elements.

**Files**:
- `src/components/match-card.tsx` — prediction buttons
- `src/app/admin/matches/match-list.tsx` — result buttons, lock/unlock buttons
- `src/components/bottom-nav.tsx` — nav items

**Change**: add `active:scale-[0.97] transition-transform` to button classes.

---

## Fix 10 — Suspense boundaries

Wrap page content in `<Suspense>` so the layout shell (header, bottom nav) renders
instantly while data streams in.

**File**: `src/app/layout.tsx`
- Wrap `{children}` in `<Suspense fallback={<SkeletonShell />}>`

**File**: individual pages — wrap heavy data-fetching sections in `<Suspense>` where
splitting streaming is beneficial.
