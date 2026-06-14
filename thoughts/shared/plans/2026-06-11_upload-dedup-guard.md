# Upload Dedup Guard — Implementation Plan

Date: 2026-06-11
Topic: Strengthen the duplicate guard in `utils/uploadQuestions.js`

## Goal

Strengthen the insert guard in `utils/uploadQuestions.js` so that uploading a
batch of questions never creates duplicates — neither exact/spelling/punctuation
variants nor semantic twins (same category + same answer + high word overlap).
The guard must:
- Fetch ALL existing questions once (cursor pagination), not per-question queries.
- Normalize Turkish text correctly (the `ı` vs `i` fold is critical).
- Skip-and-report: automatically skip duplicates and suspects, never insert them.
- Deduplicate within the incoming batch itself.
- Return `{ added, skippedExact, skippedSuspectedStrong, skippedReview }` and print a Turkish report.
- Preserve the `isUploading` lock, `createDocument("unique()")`, and try/catch/finally.

This must scale: DB currently has ~111 docs, design for 1000+.

## Files to Change

| Path | What changes |
| --- | --- |
| `utils/uploadQuestions.js` | Replace per-question `Query.equal` lookup with a one-time fetch-all + in-memory two-layer guard. Add intra-batch dedup. Change return shape to `{ added, skippedExact, skippedSuspectedStrong, skippedReview }`. Keep `alreadyRunning` early return, `isUploading` lock, hardcoded `"expoAppNew"`/`"questions"` ids, `createDocument("unique()")`, and try/catch/finally. Import helpers from new file. |

## Files to Create

| Path | What it contains |
| --- | --- |
| `utils/uploadDedupHelper.js` | Pure helper functions: `normalize(text)`, `tokenize(text)`, `jaccard(aTokens, bTokens)`, `resolveAnswer(question)`, `fetchAllExisting(database)`, `buildExistingIndex(docs)`. No Appwrite writes; only the read-pagination helper touches `database`. Extracting these keeps the main file readable and makes the pure functions independently testable. |

Decision: YES, extract. The normalization/Jaccard logic is pure and self-contained;
isolating it keeps `uploadQuestions.js` focused on orchestration and makes the
load-bearing logic (Turkish folding, threshold) easy to find and reason about.

## Notes on Existing Code (load-bearing constraints)

- `lib/appwrite.js` exports `{ account, client, config, database }`. `config.db === "expoAppNew"`,
  `config.col.questions === "questions"`.
- BUT `uploadQuestions.js` currently imports only `database` and hardcodes
  `"expoAppNew"` / `"questions"` as string literals. Replicate this exact pattern —
  do NOT switch `uploadQuestions.js` to use `config`. Keep the literals.
- `services/questionService.js` has the canonical cursor-pagination loop `fetchAllIds`
  (lines 16–30). Reuse the SAME shape in `fetchAllExisting`, but `Query.select`
  the fields we need instead of only `$id`. Do NOT modify `questionService.js`.
- `react-native-appwrite` exports `Query`. `Query.select([...])`, `Query.limit(n)`,
  `Query.cursorAfter(id)` are all in use already (proven by `fetchAllIds`).
- Question schema: `{ question, options[], correctAnswer (index into options), category, difficulty, explanation }`.
- All identifiers/comments in English. User-facing console.log strings in Turkish.

## Phase 1 — Create the pure helper module

### Step 1.1 — `utils/uploadDedupHelper.js`: `normalize(text)`

Pure function. Lowercase with Turkish-aware folding, fold Turkish letters to ASCII,
strip punctuation, collapse whitespace, trim.

CRITICAL: Do the Turkish fold BEFORE/INSTEAD of relying on `String.toLowerCase()`
for the dotless-i. JS `"I".toLowerCase()` → `"i"` and `"İ".toLowerCase()` → `"i̇"`
(i + combining dot), which is wrong for Turkish but actually convenient here because
we fold everything to plain `i` anyway. The safe approach: replace the Turkish
letters explicitly (both cases) THEN lowercase the rest.

```js
// Map Turkish-specific letters (both cases) to ASCII before generic lowercasing.
const TR_FOLD = {
  "ı": "i", "İ": "i", "I": "i", "i": "i",
  "ş": "s", "Ş": "s",
  "ç": "c", "Ç": "c",
  "ğ": "g", "Ğ": "g",
  "ö": "o", "Ö": "o",
  "ü": "u", "Ü": "u",
};

export const normalize = (text) => {
  if (!text) return "";
  let out = "";
  for (const ch of String(text)) {
    out += TR_FOLD[ch] ?? ch;
  }
  return out
    .toLowerCase()                 // handle remaining ASCII/Latin letters
    .replace(/[^a-z0-9\s]/g, " ")  // strip punctuation (Turkish letters already folded to a-z)
    .replace(/\s+/g, " ")          // collapse whitespace
    .trim();
};
```

Rationale for mapping `I → i` and `İ → i`: in Turkish, dotless `I` lowercases to
`ı` and dotted `İ` to `i`. By folding both `I`, `ı`, `İ`, `i` all to `i` we make
"Istanbul", "İstanbul", "istanbul", "ıstanbul" all normalize identically. This is
the intended behavior for duplicate detection (we want variants to collapse).

### Step 1.2 — `tokenize` and `jaccard`

```js
export const tokenize = (text) => {
  const norm = normalize(text);
  if (!norm) return new Set();
  return new Set(norm.split(" ").filter(Boolean));
};

export const jaccard = (aSet, bSet) => {
  if (aSet.size === 0 && bSet.size === 0) return 0;
  let intersection = 0;
  for (const t of aSet) if (bSet.has(t)) intersection++;
  const union = aSet.size + bSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
};
```

### Step 1.3 — `resolveAnswer(q)`

Resolve a question's correct answer to its TEXT (normalized), so semantic compare
matches on answer meaning not index. Guard against bad indexes.

```js
export const resolveAnswer = (q) => {
  const opts = Array.isArray(q?.options) ? q.options : [];
  const idx = q?.correctAnswer;
  if (typeof idx !== "number" || idx < 0 || idx >= opts.length) return "";
  return normalize(opts[idx]);
};
```

### Step 1.4 — `fetchAllExisting(database)` (cursor pagination, mirrors `fetchAllIds`)

```js
import { Query } from "react-native-appwrite";

const DB_ID = "expoAppNew";
const COL_ID = "questions";

export const fetchAllExisting = async (database) => {
  const docs = [];
  let cursor = null;
  while (true) {
    const queries = [
      Query.select(["$id", "question", "options", "correctAnswer", "category"]),
      Query.limit(100),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const res = await database.listDocuments(DB_ID, COL_ID, queries);
    if (res.documents.length === 0) break;
    for (const doc of res.documents) docs.push(doc);
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
    if (docs.length > 100_000) break; // safety cap, same spirit as fetchAllIds
  }
  return docs;
};
```

### Step 1.5 — `buildExistingIndex(docs)`

Pre-compute per existing doc: normalized question string, token set, category,
resolved answer text. This avoids recomputing inside the N×M loop.

```js
export const buildExistingIndex = (docs) =>
  docs.map((d) => ({
    id: d.$id,
    question: d.question,
    normQuestion: normalize(d.question),
    tokens: tokenize(d.question),
    category: d.category,
    answer: resolveAnswer(d),
  }));
```

### Validation (Phase 1)

- `npm run lint`
- `npx tsc --noEmit`

## Phase 2 — Rewrite `utils/uploadQuestions.js` orchestration

### Step 2.1 — Imports and constants

Keep the existing literal pattern. Add helper import via relative path (matches
existing `../lib/appwrite` style; `@/` alias also valid but relative is consistent here).

```js
import { database } from "../lib/appwrite";
import {
  normalize,
  tokenize,
  jaccard,
  resolveAnswer,
  fetchAllExisting,
  buildExistingIndex,
  JACCARD_THRESHOLD,
} from "./uploadDedupHelper";

const questions = [ /* unchanged hardcoded seed batch */ ];

let isUploading = false;
```

Note: `Query` import is no longer needed in `uploadQuestions.js` (all DB reads moved
to the helper). Remove the now-unused `Query` import to keep lint clean.

### Step 2.2 — Intra-batch dedup (before touching DB)

Deduplicate the incoming `questions` array against itself using LAYER-1 normalization
only (exact/normalized). First occurrence wins; later collisions counted as
`skippedExact`. (Intra-batch semantic suspicion is intentionally NOT applied to
avoid dropping legitimately distinct same-category questions in one seed.)

```js
const dedupeBatch = (batch) => {
  const seen = new Set();
  const unique = [];
  let intraSkipped = 0;
  for (const q of batch) {
    const key = normalize(q.question);
    if (seen.has(key)) { intraSkipped++; continue; }
    seen.add(key);
    unique.push(q);
  }
  return { unique, intraSkipped };
};
```

### Step 2.3 — Main flow

```js
export const uploadQuestions = async () => {
  if (isUploading) {
    return { added: 0, skippedExact: 0, skippedSuspectedStrong: 0, skippedReview: 0, alreadyRunning: true };
  }
  isUploading = true;

  try {
    const existingDocs = await fetchAllExisting(database);
    console.log("📊 Veritabanındaki toplam soru sayısı:", existingDocs.length);

    const existingIndex = buildExistingIndex(existingDocs);
    const existingNormSet = new Set(existingIndex.map((e) => e.normQuestion));

    const { unique, intraSkipped } = dedupeBatch(questions);

    let added = 0;
    let skippedExact = intraSkipped;
    let skippedSuspectedStrong = 0;
    let skippedReview = 0;

    for (const q of unique) {
      const normQ = normalize(q.question);

      // LAYER 1 — exact / normalized duplicate
      if (existingNormSet.has(normQ)) {
        skippedExact++;
        console.log("⏭️  Birebir kopya, atlandı:", q.question);
        continue;
      }

      // LAYER 2 — semantic suspect (same category + same resolved answer)
      const qTokens = tokenize(q.question);
      const qAnswer = resolveAnswer(q);
      const semanticMatch = existingIndex.find(
        (e) =>
          e.category === q.category &&
          e.answer !== "" &&
          e.answer === qAnswer
      );
      if (semanticMatch) {
        const score = jaccard(qTokens, semanticMatch.tokens);
        if (score >= JACCARD_THRESHOLD) {
          // Layer 2a — strong suspect: high token overlap
          skippedSuspectedStrong++;
          console.log("⚠️  Güçlü şüpheli benzer soru, atlandı:");
          console.log("    Yeni soru   :", q.question);
          console.log(`    Mevcut soru : [${semanticMatch.id}] ${semanticMatch.question}`);
        } else {
          // Layer 2b — review: same category+answer but low token overlap (e.g. Mona Lisa pair)
          skippedReview++;
          console.log("🔍  İnceleme gerekli (aynı kategori+cevap, düşük kelime örtüşmesi):");
          console.log("    Yeni soru   :", q.question);
          console.log(`    Mevcut soru : [${semanticMatch.id}] ${semanticMatch.question}`);
          console.log(`    Jaccard skoru: ${score.toFixed(3)}`);
        }
        continue;
      }

      await database.createDocument("expoAppNew", "questions", "unique()", q);
      // keep in-memory index fresh so later batch items dedupe against just-inserted ones
      existingNormSet.add(normQ);
      existingIndex.push({
        id: "(yeni)",
        question: q.question,
        normQuestion: normQ,
        tokens: qTokens,
        category: q.category,
        answer: qAnswer,
      });
      added++;
    }

    console.log("✅ Yükleme tamamlandı.");
    console.log(`   Eklenen                        : ${added}`);
    console.log(`   Birebir kopya                  : ${skippedExact}`);
    console.log(`   Güçlü şüpheli (jaccard>=${JACCARD_THRESHOLD}): ${skippedSuspectedStrong}`);
    console.log(`   İnceleme gerekli               : ${skippedReview}`);

    return { added, skippedExact, skippedSuspectedStrong, skippedReview };
  } catch (error) {
    console.error("❌ Soru yükleme hatası:", error);
    throw error;
  } finally {
    isUploading = false;
  }
};
```

Key preserved behaviors: `isUploading` lock + `alreadyRunning` early return,
`createDocument(..., "unique()", q)`, try/catch/finally, hardcoded ids.

Note: `JACCARD_THRESHOLD` is imported from `uploadDedupHelper.js` (not redefined here).

### Validation (Phase 2)

- `npm run lint`
- `npx tsc --noEmit`

## Risks and Edge Cases

### False positives (2a/2b split rationale)

- Layer 2 now fires whenever category AND resolved-answer text match (regardless of
  Jaccard). The Jaccard score then determines the bucket: ≥ 0.6 → `skippedSuspectedStrong`
  (high confidence duplicate), < 0.6 → `skippedReview` (same fact, different wording —
  e.g. the Mona Lisa pair with Jaccard 0.25).
- `skippedReview` entries are intentionally conservative: false positives
  (legitimately distinct questions that share category+answer but differ in WHAT they
  ask) land here and can be manually force-inserted after review, rather than being
  silently inserted as duplicates or silently dropped.
- Example of a legitimate `skippedReview` pair: "Hangi gezegen en büyüktür?" and
  "Hangi gezegenin en fazla uydusu vardır?" — both may answer "Jüpiter" in
  "astronomi", but they ask different things. The user reviews and force-inserts if needed.
- `JACCARD_THRESHOLD = 0.6` now serves only as the 2a/2b boundary (not a gate). It
  remains a single exported constant from `uploadDedupHelper.js` and can be tuned if
  real data shows the 2a/2b split is mis-bucketing.
- All suspects (2a and 2b) are SKIPPED automatically per spec, but each is logged with
  the new text AND matching existing `$id` + text (and, for 2b, the Jaccard score) so
  the user can manually review and force-insert later.

### Performance

- Algorithm is O(N×M) where N = new batch size, M = existing docs (Layer 2 scans
  `existingIndex` per new question). Normalization/tokenization is done ONCE up front
  (`buildExistingIndex`), so the inner loop is only set comparisons.
- Acceptable for N ≤ 200, M ≤ 1000 (≤ 200k cheap set ops). Fine for current M ≈ 111.
- If M ever grows to ~10k, a pre-built bucket index keyed by `${category}|${answer}`
  would cut the Layer-2 scan to only same-category/same-answer candidates. Not needed now.

### Turkish normalization correctness

- The `ı` vs `i` fold is the critical correctness point. We fold `I`, `ı`, `İ`, `i`
  ALL to `i` explicitly via `TR_FOLD` BEFORE generic `.toLowerCase()`, avoiding the
  JS locale-insensitive lowercasing bug (`"İ".toLowerCase()` produces `i` +
  combining dot U+0307). Because we map the Turkish letters first and then strip
  anything outside `[a-z0-9\s]`, any stray combining marks are also removed.
- Other folds (ş→s, ç→c, ğ→g, ö→o, ü→u) applied for both cases.
- Punctuation strip uses `[^a-z0-9\s]` AFTER folding, so Turkish letters are already
  ASCII by then and are not accidentally removed.

### Other edge cases

- `correctAnswer` index out of range or non-number → `resolveAnswer` returns `""`;
  Layer 2 explicitly skips when `e.answer === ""` so empty-answer docs never match.
- Empty/missing `question` → `normalize` returns `""`; would only collide with another
  empty question.
- In-memory index is updated after each insert so two items in the same batch that
  would be duplicates of each other still dedupe (defense in depth after `dedupeBatch`).

## Validation

### Static

```bash
npm run lint
npx tsc --noEmit
```

### Manual test scenarios

1. **Exact match** — Seed batch = `[{ question: "Hangi gezegenin etrafında en fazla uydu bulunur?", options: ["Uranüs","Neptün","Satürn","Jüpiter"], correctAnswer: 3, category: "astronomi", difficulty: "kolay" }]`.
   - Expect return `{ added: 0, skippedExact: 1, skippedSuspectedStrong: 0, skippedReview: 0 }`.
   - Console shows `⏭️  Birebir kopya, atlandı: ...`.

2a. **Strong suspect (Jaccard ≥ 0.6)** — e.g. `"Hangi gezegenin etrafında en fazla sayıda uydu bulunmaktadır?"` same answer Jüpiter, same category astronomi — Jaccard with the existing question ≥ 0.6.
   - Expect `{ added: 0, skippedExact: 0, skippedSuspectedStrong: 1, skippedReview: 0 }`.
   - Console shows `⚠️  Güçlü şüpheli benzer soru, atlandı:` with the existing `$id` + text.

2b. **Review (Jaccard < 0.6)** — e.g. `"Mona Lisa tablosunun ressamı kimdir?"` same category sanat, same answer Leonardo da Vinci — Jaccard with `"Mona Lisa tablosu kime aittir?"` = 0.25.
   - Expect `{ added: 0, skippedExact: 0, skippedSuspectedStrong: 0, skippedReview: 1 }`.
   - Console shows `🔍  İnceleme gerekli` with the existing `$id` + text and the Jaccard score.

3. **Genuinely new** — e.g. `"Türkiye'nin başkenti neresidir?"` category `"cografya"`.
   - Expect `{ added: 1, skippedExact: 0, skippedSuspectedStrong: 0, skippedReview: 0 }`. DB total increases by 1.

4. **Concurrency** — call `uploadQuestions()` twice without awaiting the first.
   - Second call returns `{ added: 0, skippedExact: 0, skippedSuspectedStrong: 0, skippedReview: 0, alreadyRunning: true }`.

---

PLAN_READY: thoughts/shared/plans/2026-06-11_upload-dedup-guard.md
