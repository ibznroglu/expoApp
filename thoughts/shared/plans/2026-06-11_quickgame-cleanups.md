# Quick-Game Cleanups: Dead Fallback Removal + Route Protection

Date: 2026-06-11
Author: planner
Status: ready

## Goal

Two independent, low-risk cleanups to the quick-game feature:

1. Remove unreachable dead-code fallbacks in `quick-game.jsx` where `getQuestions(10)`
   is called a second time inside a catch block, even though `getQuestions` already
   catches internally and returns `[]` on error.
2. Move the quick-game route under the protected `app/(app)` route group so it inherits
   the auth guard in `app/(app)/_layout.tsx`, fixing the gap where the game screen is
   currently reachable without a session.

No change to `getQuestions` itself, no change to external/URL behavior, no UI redesign.

## Files to Change

- `app/game/quick-game.jsx` (Phase 1: edit; Phase 2: git mv + import path updates)

## Files to Create

- None. (Phase 2 moves a file; it does not create new source files.)

## Files/Directories to Remove

- `app/game/` directory (Phase 2, after the move leaves it empty)

## Context / Confirmed Facts

- `getQuestions(limit)` in `services/questionService.js` wraps its whole body in
  `try/catch` and `return []` on error. It never throws to the caller. Therefore any
  `catch` around an `await getQuestions(...)` call is unreachable for that call's own
  errors, and a second `getQuestions(...)` inside such a catch is dead code.
- `app/(app)/_layout.tsx` is the auth guard:
  `return !session ? <Redirect href="/signin"/> : <Slot/>`. It uses `<Slot/>`, so any
  screen placed under `app/(app)/` renders inside this guard with no extra Stack config
  required. The moved screen will be wrapped and gated by session.
- `(app)` is an Expo Router GROUP segment: it is a real directory on disk but does NOT
  appear in the URL. So `app/(app)/game/quick-game.jsx` resolves to URL `/game/quick-game`,
  identical to today. The caller `router.push('/game/quick-game')` in
  `app/(app)/index.tsx` (line 125) needs NO change.
- `TextCustom` is at `app/components/TextCustom.tsx` — NOT under `(app)`, so its relative
  path from the moved file must climb out of `(app)` back to `app/`.

---

## Phase 1 — Remove dead fallback in `quick-game.jsx`

### Step 1.1 — Simplify `loadQuestions` (current lines 128–145)

Replace the nested try/catch fallback with a single call and a clean catch that sets the
empty/error state. The existing UI already handles `questions.length === 0` via the
"Sorular yüklenemedi" + "Tekrar Dene" screen.

Target shape:

```js
const loadQuestions = useCallback(async () => {
  try {
    setLoading(true);
    const randomQuestions = await getQuestions(10);
    setQuestions(randomQuestions);
  } catch (error) {
    console.error("Sorular yüklenirken hata:", error);
    setQuestions([]);
  } finally {
    setLoading(false);
  }
}, []);
```

Notes:
- The inner `try { const fallbackQuestions = await getQuestions(10); ... } catch (e) {...}`
  block is deleted entirely — it is unreachable because `getQuestions` cannot reject.
- Keep the outer `try/catch/finally`: although `getQuestions` won't throw, the catch is
  defensive and guarantees `setLoading(false)` always runs via `finally`.
- When `getQuestions` internally fails it returns `[]`, so `setQuestions([])` happens on
  the success path too → the "Sorular yüklenemedi" UI still shows on backend failure.
  Behavior is preserved.

### Step 1.2 — Fix missing error-state reset in `restartGame` (current lines 302–323)

`restartGame` has a single `getQuestions(10)` call with no nested fallback (no dead code
to remove), but its catch does not reset game state — a backend failure leaves stale
questions on screen. Add `setQuestions([])` so a backend failure routes to the same
empty/error UI as `loadQuestions`, instead of leaving stale state:

- On error, set `setQuestions([])` (and keep the existing console.error).
- Keep `setLoading(true)` / `finally setLoading(false)` as-is.
- Do not change the state-reset logic on the success path.

Target catch block:

```js
} catch (error) {
  console.error("Oyun yeniden başlatılırken hata:", error);
  setQuestions([]);
} finally {
  setLoading(false);
}
```

### Phase 1 — Do NOT

- Do not modify `getQuestions` or `getQuestionsByCategory` in `services/questionService.js`.
- Do not change the loading/empty/error JSX.
- Do not change the `loadQuestions` dependency array (stays `[]`) or `restartGame` deps.

### Phase 1 — Validation

1. `npm run lint` — expect no new warnings/errors in `quick-game.jsx`.
2. `npx tsc --noEmit` — expect clean.
3. Manual device test:
   - Happy path: launch quick-game → "Sorular yükleniyor..." → questions render, playable.
   - Error path: simulate failure (temporarily point Appwrite env at a bad endpoint, or
     disable network) → "Sorular yüklenemedi" + "Tekrar Dene" screen appears; tapping
     "Tekrar Dene" re-runs `loadQuestions`. Restore env after.
   - Restart path: finish a game → "Tekrar Oyna" → new questions load (or error screen on
     forced failure).

### Phase 1 — Commit

`refactor(game): remove dead loadQuestions fallback; reset state on restartGame error`

---

## Phase 2 — Move quick-game under the protected `(app)` group

Do Phase 2 only after Phase 1 is committed.

### Step 2.1 — Move the file with git

From repo root:

```
git mv "app/game/quick-game.jsx" "app/(app)/game/quick-game.jsx"
```

This creates the directory `app/(app)/game/` and preserves git history.

### Step 2.2 — Update every relative import in the moved file

The file moves from `app/game/` (2 levels below repo root) to `app/(app)/game/` (3 levels
below repo root). Every import that climbs to a repo-root sibling gains one `../`. The
`TextCustom` import climbs to `app/` (not repo root) so it changes from `../` to `../../`.

| Line | Import target               | OLD path                              | NEW path                                |
|------|-----------------------------|---------------------------------------|-----------------------------------------|
| 18   | quickGameStyle (assets)     | `../../assets/styles/quickGameStyle`  | `../../../assets/styles/quickGameStyle` |
| 19   | questionService (services)  | `../../services/questionService`      | `../../../services/questionService`     |
| 26   | sound (utils)               | `../../utils/sound`                   | `../../../utils/sound`                  |
| 27   | TextCustom (app/components) | `../components/TextCustom`            | `../../components/TextCustom`           |
| 28   | theme (constants)           | `../../constants/theme`               | `../../../constants/theme`              |

Path-resolution reasoning:
- `assets`, `services`, `utils`, `constants` are repo-root directories.
  - From `app/game/`: `../../X` reaches repo root then `X`. After move: `../../../X`. ✓
- `TextCustom` is at `app/components/`.
  - From `app/game/`: `../components` = `app/components`. ✓
  - From `app/(app)/game/`: `../../` reaches `app/`, then `components/TextCustom`. ✓

Package imports (`expo-router`, `react`, `react-native`, `expo-linear-gradient`, etc.)
and any `@/` alias imports are unchanged.

### Step 2.3 — Remove the now-empty `app/game/` directory

After the git mv, if `app/game/` is empty, remove it:

```powershell
Remove-Item "app\game" -Recurse -ErrorAction SilentlyContinue
```

Verify there are no other files under `app/game/` before removing — it currently contains
only `quick-game.jsx`.

### Step 2.4 — Confirm the caller needs no change

`app/(app)/index.tsx` line 125: `router.push('/game/quick-game')` — leave unchanged.
Because `(app)` is a group segment, URL `/game/quick-game` resolves to
`app/(app)/game/quick-game.jsx`.

### Phase 2 — Validation

1. `npm run lint` — confirms no broken/unused imports after path edits.
2. `npx tsc --noEmit` — will surface any unresolved relative import path.
3. Restart Metro with cache clear before manual test: `npx expo start -c`
   (route tree and module resolution are cached; a stale cache can mask or fake errors).
4. Manual device test:
   - From Home, tap "Hızlı Oyun ▶ Oyna" → quick-game launches at `/game/quick-game`
     and renders (header, timer, question, options, jokers) exactly as before.
   - Auth gate: sign out (or clear session) and attempt to reach `/game/quick-game`
     → redirected to `/signin` by `app/(app)/_layout.tsx`. Confirms protection.
   - Back/exit modal still works (`router.back()` returns to Home).

### Phase 2 — Commit

`refactor(routing): move quick-game under protected (app) group`

---

## Risks and Edge Cases

- **Relative-path breakage** (HIGH likelihood if any path missed): the explicit OLD→NEW
  table in Step 2.2 covers all 5 relative imports; `tsc --noEmit` and lint will catch
  any miss.
- **TextCustom easy-to-miss**: `../components` → `../../components` (NOT `../../../` —
  that would overshoot). Verify it resolves to `app/components/TextCustom`.
- **Metro cache staleness**: always `npx expo start -c` after the move before judging
  the result.
- **Phase 1 behavioral equivalence**: `getQuestions` returns `[]` on internal failure, so
  the success path already produces empty state — the removed fallback never added value.
- **restartGame change**: error now routes to empty-state UI instead of stale game.
  This is a small behavior improvement that matches `loadQuestions`.
- **Scope**: do not convert relative imports to `@/` alias in this PR.

## Validation Commands (both phases)

```
npm run lint
npx tsc --noEmit
npx expo start -c     # then manual device test per phase
```

PLAN_READY: thoughts/shared/plans/2026-06-11_quickgame-cleanups.md
