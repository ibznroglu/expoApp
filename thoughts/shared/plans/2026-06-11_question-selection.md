# Plan: Robust Random Question Selection

Date: 2026-06-11
Research basis: direct read of `services/questionService.js`, `app/game/quick-game.jsx`, `lib/appwrite.js`, `package.json`

## Goal

Make question selection scale beyond the first 100 rows, eliminate biased shuffling, and prevent heavy repeats across consecutive games by tracking recently-seen question ids on-device. Every question in the collection (113+ and growing) must eventually be reachable, while the external API of `getQuestions` / `getQuestionsByCategory` stays identical so no call site changes are required.

## Files to Change

| File | Change |
|------|--------|
| `services/questionService.js` | Rewrite `getQuestions` (cursor pagination, seen exclusion, Fisher–Yates); update `getQuestionsByCategory` the same way; remove biased shuffle. |
| `package.json` | Add `@react-native-async-storage/async-storage` (via `npx expo install`, not hand-edited). |
| `app/game/quick-game.jsx` | Verification only — no code change expected. |

## Files to Create

| File | Purpose |
|------|---------|
| `utils/seenQuestions.js` | AsyncStorage load/save/prune helpers + Fisher–Yates shuffle. |

## Notes on existing code (load-bearing)

- `lib/appwrite.js` exports `database` (singular) and `config` where `config.db === "expoAppNew"` and `config.col.questions === "questions"`. Keep these references consistent.
- `mapDoc` shape must be preserved exactly: `{ id, question, options, correctAnswer, category, difficulty, explanation }` where `id = doc.$id`.
- `@react-native-async-storage/async-storage` is NOT in `package.json` — install it in Phase 1.
- All three call sites (`quick-game.jsx` lines 131, 136, 305) call `getQuestions(10)` and consume an array of `mapDoc` objects. They must keep working unchanged.
- The Appwrite console row-number gaps (123→126) are NOT a bug — code uses `$id` via `mapDoc`; do not touch that.

---

## Phase 1 — AsyncStorage util + shuffle helper

### Steps

**1.1** — Install the dependency (do not hand-edit `package.json`):
```
npx expo install @react-native-async-storage/async-storage
```

**1.2** — Create `utils/seenQuestions.js`. Export the following:

```js
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@bilgiArenasi/seenQuestionIds";
const MAX_SEEN = 35;

export const fisherYatesShuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const loadSeenIds = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Görülen sorular okunamadı:", e);
    return [];
  }
};

export const saveSeenIds = async (ids) => {
  if (!Array.isArray(ids)) return;
  try {
    const trimmed = ids.slice(-MAX_SEEN);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Görülen sorular kaydedilemedi:", e);
  }
};

export const appendSeenIds = async (newIds) => {
  const existing = await loadSeenIds();
  const merged = [...existing, ...newIds];
  // Deduplicate preserving recency (newest occurrence wins), then trim
  const seen = new Set();
  const deduped = [];
  for (let i = merged.length - 1; i >= 0; i--) {
    if (!seen.has(merged[i])) {
      seen.add(merged[i]);
      deduped.unshift(merged[i]);
    }
  }
  await saveSeenIds(deduped);
  return deduped.slice(-MAX_SEEN);
};

export const clearSeenIds = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Görülen sorular temizlenemedi:", e);
  }
};
```

- `fisherYatesShuffle`: pure, does not mutate the argument.
- All AsyncStorage functions catch internally and degrade gracefully — never throw.

### Validation

- `npm run lint` passes for the new file.
- `npx tsc --noEmit` passes (no new type errors).

---

## Phase 2 — Rewrite `getQuestions` with cursor pagination + seen exclusion

### Steps

**2.1** — Update imports at top of `services/questionService.js`:
```js
import { Query } from "react-native-appwrite";
import { database, config } from "../lib/appwrite";
import { fisherYatesShuffle, loadSeenIds, appendSeenIds } from "../utils/seenQuestions";
```

**2.2** — Remove the biased `const shuffle = (arr) => [...arr].sort(...)` line. Replace any remaining internal uses with `fisherYatesShuffle`.

**2.3** — Add private helper `fetchAllIds(extraQueries = [])`:
```js
const fetchAllIds = async (extraQueries = []) => {
  const ids = [];
  let cursor = null;
  while (true) {
    const queries = [...extraQueries, Query.select(["$id"]), Query.limit(100)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await database.listDocuments(config.db, config.col.questions, queries);
    if (res.documents.length === 0) break;
    for (const doc of res.documents) ids.push(doc.$id);
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
    if (ids.length > 100_000) break; // safety cap
  }
  return ids;
};
```

`Query.select(["$id"])` keeps per-page payload tiny. `$id` is always returned by Appwrite even when selecting.

**2.4** — Add private helper `pickIds(allIds, count)`:
```js
const pickIds = async (allIds, count) => {
  const seen = await loadSeenIds();
  const seenSet = new Set(seen);
  let candidates = allIds.filter((id) => !seenSet.has(id));

  // Release oldest seen entries until we have enough candidates
  let releaseIdx = 0;
  while (candidates.length < count && releaseIdx < seen.length) {
    seenSet.delete(seen[releaseIdx]);
    releaseIdx++;
    candidates = allIds.filter((id) => !seenSet.has(id));
  }
  // Final fallback: use whole pool
  if (candidates.length < count) candidates = [...allIds];

  const shuffled = fisherYatesShuffle(candidates);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
```

**2.5** — Add private helper `fetchDocsByIds(ids)`:
```js
const fetchDocsByIds = async (ids) => {
  if (ids.length === 0) return [];
  const res = await database.listDocuments(config.db, config.col.questions, [
    Query.equal("$id", ids),
    Query.limit(ids.length),
  ]);
  // Appwrite does not guarantee order for equal-on-array — reorder to match requested sequence
  const docMap = new Map(res.documents.map((doc) => [doc.$id, doc]));
  return ids.map((id) => docMap.get(id)).filter(Boolean).map(mapDoc);
};
```

**2.6** — Rewrite `getQuestions(limit = 10)`:
```js
export const getQuestions = async (limit = 10) => {
  try {
    const allIds = await fetchAllIds();
    if (allIds.length === 0) return [];
    const chosenIds = await pickIds(allIds, limit);
    const docs = await fetchDocsByIds(chosenIds);
    await appendSeenIds(docs.map((d) => d.id));
    return docs;
  } catch (error) {
    console.error("Sorular alınamadı:", error);
    return [];
  }
};
```

External API (name, param, return shape) is identical to before.

### Validation

- `npm run lint` and `npx tsc --noEmit` pass.
- Manual: launch a game; 10 distinct questions render. Play 3–4 consecutive games; minimal/no repeats. High-row questions (beyond first 100) appear over repeated play.

---

## Phase 3 — Verify call sites + update `getQuestionsByCategory`

### Steps

**3.1** — Verify `app/game/quick-game.jsx`:
- Confirm lines ~131, ~136, ~305 still call `getQuestions(10)` and consume the `mapDoc` shape. Do NOT edit unless a shape mismatch is found.
- Confirm the import of `getQuestions` from `questionService` is unchanged.

**3.2** — Update `getQuestionsByCategory(category, limit = 10)` to use the same pattern:
```js
export const getQuestionsByCategory = async (category, limit = 10) => {
  try {
    const allIds = await fetchAllIds([Query.equal("category", category)]);
    if (allIds.length === 0) return [];
    const chosenIds = await pickIds(allIds, limit);
    const docs = await fetchDocsByIds(chosenIds);
    await appendSeenIds(docs.map((d) => d.id));
    return docs;
  } catch (error) {
    console.error("Kategoriye göre sorular alınamadı:", error);
    return [];
  }
};
```

Category pools may be small (< MAX_SEEN), but `pickIds` release-oldest + full-pool fallback prevents empty results.

**3.3** — Grep for other importers of `getQuestions` / `getQuestionsByCategory` / `shuffle` across the repo to confirm no other callers are broken.

### Validation

- `npm run lint` and `npx tsc --noEmit` pass.
- Manual: any screen using `getQuestionsByCategory` returns mapped questions and does not crash on a small category.

---

## Risks and Edge Cases

| Risk | Mitigation |
|------|-----------|
| Empty pool after exclusion | `pickIds` releases oldest seen ids one-by-one, then falls back to entire pool — never returns fewer than `min(limit, poolSize)`. |
| Pagination failure mid-loop | Error bubbles to outer `try/catch` in `getQuestions`/`getQuestionsByCategory`, returning `[]` (existing behavior). Safety cap prevents infinite loops. |
| AsyncStorage unavailable / throws | All helpers catch internally, `console.warn`, and degrade. `loadSeenIds` returns `[]`; `saveSeenIds` no-ops. Game still works, just without cross-game memory — no crash. |
| `Query.equal('$id', [...])` with large array | We only ever pass `limit` (10) ids. `Query.limit(ids.length)` ensures all are returned. |
| Appwrite `$id` ordering for `equal` | Not guaranteed — we explicitly reorder via `docMap`; missing ids filtered out by `.filter(Boolean)`. |
| `Query.select(['$id'])` SDK version compat | If unsupported, full docs are returned; we only read `doc.$id`, so pagination still works correctly. |
| Category pool smaller than MAX_SEEN | Shared seen set could exclude an entire small category; release-oldest + full-pool fallback in `pickIds` prevents empty result. |
| Growing collection (1000+) | Cursor pagination loops 100 at a time; id-only payload keeps this cheap. Cost: ceil(N/100) round trips for id list + one fetch for 10 docs. |
| Seen-id growth | Capped at `MAX_SEEN` (35) via tail-trim in `saveSeenIds`/`appendSeenIds`. |

---

## Validation (overall)

```bash
npm run lint
npx tsc --noEmit
```

### Manual checklist

- [ ] Each game shows exactly 10 unique questions.
- [ ] No heavy repeats across 3–4 consecutive games (seen exclusion working).
- [ ] Over repeated play, all 113+ questions are eventually reachable, including those beyond row 100 (cursor pagination working).
- [ ] `getQuestionsByCategory` returns mapped questions and does not break on a small category.
- [ ] Simulate AsyncStorage failure (temporarily throw in `loadSeenIds`) — game still loads questions without crashing.
- [ ] `quick-game.jsx` call sites unchanged; no import or usage change required.

---

PLAN_READY: thoughts/shared/plans/2026-06-11_question-selection.md
