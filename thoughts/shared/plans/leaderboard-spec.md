# Leaderboard Feature Spec

**Date:** 2026-05-19
**Status:** Draft — ready for implementation planning

---

## Overview

Per-category leaderboard for Bilgi Arenasi. Users play a category-specific game mode,
results are persisted to Appwrite, and a scheduled Function maintains rank order.
The leaderboard is accessible post-game and from a standalone screen.

---

## Decisions Made

| Topic | Decision |
|-------|----------|
| Scope | Per-category only (no global) |
| Persistence trigger | On game completion, score > 0 only |
| Ranking metric | Average score, minimum 5 games to appear |
| Below-threshold behavior | Hidden from list |
| Self-rank display | "Your rank: #N" header above the list |
| Entry points | Post-game button + standalone screen from home |
| Pagination | Top 20 + "Load more" (next 20) |
| Row content | Rank number, display name, avg score, game count |
| Data model | Raw game results + aggregated stats (both) |
| Rank computation | Appwrite Function, scheduled every 5 minutes |
| Category source | Separate `categories` collection in Appwrite |
| Display name fallback | Force name on signup — fix at source |
| Category game mode | New screen required (prerequisite to leaderboard) |
| Refresh strategy | Fetch on mount + pull-to-refresh |
| Deleted accounts | Cleanup Function deletes all stats on user deletion |

---

## Appwrite Collections

### `categories`
Admin-managed list. App reads, never writes.

| Field | Type | Notes |
|-------|------|-------|
| name | string | Display name, e.g. "Science" |
| slug | string | Stable key used in other collections, e.g. "science" |
| order | integer | Sort order in the category picker |

### `game_results`
One document per completed game. Append-only audit log.

| Field | Type | Notes |
|-------|------|-------|
| userId | string | Appwrite account ID |
| userName | string | Snapshot of display name at time of game |
| category | string | Matches categories.slug |
| score | integer | Raw score (multiples of 10, max 100) |
| totalQuestions | integer | Always 10 for now |
| completedAt | datetime | |

**Indexes:** `[userId, category]`, `[category, completedAt]`

### `leaderboard_stats`
One document per user+category pair. Updated on each game write, ranks updated by Function.

| Field | Type | Notes |
|-------|------|-------|
| userId | string | Appwrite account ID |
| userName | string | Updated on each game write (keeps name fresh) |
| category | string | Matches categories.slug |
| totalScore | integer | Running sum |
| gameCount | integer | Total completed games in this category |
| avgScore | float | totalScore / gameCount |
| rank | integer | Set by the scheduled Function; null until Function runs |
| lastUpdated | datetime | |

**Indexes:** `[category, rank]` (leaderboard query), `[userId, category]` (user self-lookup)

---

## Appwrite Functions

### `recompute-ranks`
- **Trigger:** CRON, every 5 minutes
- **Logic:**
  1. Fetch all distinct category slugs from `leaderboard_stats`
  2. For each category:
     a. Query all docs where `gameCount >= 5`, ordered by `avgScore DESC`
     b. Assign `rank = 1, 2, 3...` and write back in batch
  3. Docs with `gameCount < 5` — leave `rank` as null (hidden from leaderboard)
- **Note:** Ranks are eventually consistent (up to 5 min stale)

### `cleanup-user-stats`
- **Trigger:** Appwrite Users delete event
- **Logic:**
  1. Delete all `game_results` docs where `userId == deletedUserId`
  2. Delete all `leaderboard_stats` docs where `userId == deletedUserId`

---

## New Files

| File | Purpose |
|------|---------|
| `app/(app)/category-game.jsx` | Category-specific game screen |
| `app/(app)/leaderboard.jsx` | Standalone leaderboard screen |
| `services/leaderboardService.js` | Appwrite queries: fetch list, fetch user rank, load more |
| `services/gameResultService.js` | Write game_results doc + upsert leaderboard_stats |

---

## Modified Files

| File | Change |
|------|--------|
| `app/signup.jsx` | Enforce non-empty name field before allowing account creation |
| `context/AuthContext.js` | Pass name validation error to UI |
| `app/(app)/home.jsx` (or equivalent) | Add "Leaderboard" navigation entry |
| `services/questionService.js` | No change — `getQuestionsByCategory` already exists |

---

## Screen Flows

### Category Game Screen (`category-game.jsx`)
- Receives `category` slug as route param: `/category-game?category=science`
- Fetches 10 questions via `getQuestionsByCategory(category, 10)`
- Same timer/sound/UI as quick-game
- On completion (score > 0): calls `gameResultService.submitResult()`
- Result screen shows score + two buttons:
  - "See Leaderboard" → navigates to `/leaderboard?category=science`
  - "Play Again" → restarts with same category
- On completion (score = 0): skips write, shows result without leaderboard button

### Leaderboard Screen (`leaderboard.jsx`)
- **Header:** Category picker — horizontal scroll of category pills, fetched from `categories`
- **Self-rank section:** "Your rank: #N in [Category]" (or "Play 5+ games to rank" if gameCount < 5)
- **List:** Top 20, ordered by `rank` field
  - Row: `#1  Ali Yilmaz  avg 87.4  (12 games)`
  - Highlighted row if userId matches current user
- **Load more:** Button fetches next 20 (offset pagination)
- **Pull-to-refresh:** Re-fetches self-rank + top 20
- **Entry points:**
  - `app/(app)/home` navigation button
  - Post-game result screen "See Leaderboard" button

---

## Service API

### `leaderboardService.js`

```js
// Fetch top N for a category starting at offset
getLeaderboard(category, limit = 20, offset = 0)
// Returns: [{ rank, userId, userName, avgScore, gameCount }]

// Fetch the current user's stats for a category
getUserStats(userId, category)
// Returns: { rank, avgScore, gameCount } or null
```

### `gameResultService.js`

```js
// Write raw result + upsert aggregated stats
submitResult({ userId, userName, category, score, totalQuestions })
// Steps:
//   1. Create game_results doc
//   2. Fetch existing leaderboard_stats doc for (userId, category)
//   3. If exists: update totalScore += score, gameCount += 1, avgScore = total/count, lastUpdated
//   4. If not: create new doc with gameCount=1, rank=null
```

---

## Signup Name Enforcement

`app/signup.jsx`: validate `name.trim().length >= 2` before calling `AuthContext.signup`.
Show inline error: "Name must be at least 2 characters."
`AuthContext.js`: no change needed — already accepts name.

---

## Edge Cases

| Case | Handling |
|------|----------|
| Category has 0 ranked users (< 5 games each) | Show empty state: "No rankings yet. Be the first to play 5 games." |
| User is ranked but their rank is stale (Function hasn't run) | Show last known rank with no special indicator — stale by ≤5 min is acceptable |
| Score = 0 on completion | Skip write entirely — no doc created |
| `getQuestionsByCategory` returns fewer than 10 questions | Show available questions, note total in header |
| Appwrite Function write fails | Stats doc remains at pre-game state — no partial update |
| User has no name after forced signup (legacy accounts) | Fall back to first part of email for now; prompt name update on next login (future) |

---

## Implementation Order

1. **Appwrite setup** — create collections, indexes, Functions (manual, not in this repo)
2. **Signup name enforcement** — `app/signup.jsx` + `context/AuthContext.js`
3. **`gameResultService.js`** — write + upsert logic
4. **`category-game.jsx`** — new game screen wired to questionService + gameResultService
5. **`leaderboardService.js`** — read queries
6. **`leaderboard.jsx`** — UI with category picker, self-rank, list, pagination
7. **Home navigation** — add leaderboard entry point
8. **Post-game leaderboard button** — on category-game result screen

---

## Out of Scope

- Global (cross-category) leaderboard
- Friends-only leaderboard
- Time-windowed rankings (daily/weekly)
- Avatars / profile pictures
- Push notifications for rank changes
- Admin UI for managing categories (done directly in Appwrite console)
