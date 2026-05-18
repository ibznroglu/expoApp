# Plan: Tick Sound Bug Fix

**Date:** 2026-05-19
**Research:** thoughts/shared/research/2026-05-19_sound-system.md

## Problem

`app/game/quick-game.jsx` lines 104-129: the timer `setInterval` is only torn down
when `currentQuestion`, `gameCompleted`, or `loading` changes. `selectedAnswer` is not
in the dependency array. After the user selects an answer, a 1-second `setTimeout`
delays the call to `handleNextQuestion`. During that 1-second window the interval keeps
firing and triggers `playSound("tick")` if `timeLeft <= 6`.

Secondary issue: even if we stop new ticks from starting, a tick that is already
mid-playback when the answer is selected has no way to be interrupted — `stopSound`
does not exist.

## Files to Change

| File | Why |
|------|-----|
| `app/game/quick-game.jsx` | Add `selectedAnswer` dependency + early-return guard to timer effect; call `stopSound("tick")` on answer select |
| `utils/sound.js` | Export new `stopSound(key)` function |

---

## Phase 1 — Stop new ticks from firing after answer is selected

**File:** `app/game/quick-game.jsx`

Add `selectedAnswer !== null` guard to the timer effect (line 105):

```js
// BEFORE
if (!currentQuestion || gameCompleted || loading) return;

// AFTER
if (!currentQuestion || gameCompleted || loading || selectedAnswer !== null) return;
```

Add `selectedAnswer` to the dependency array (line 122-129):

```js
// BEFORE
}, [currentQuestion, gameCompleted, loading, soundsReady, handleNextQuestion]);

// AFTER
}, [currentQuestion, gameCompleted, loading, soundsReady, handleNextQuestion, selectedAnswer]);
```

**Why this works:** when the user selects an answer React re-runs the effect, the
cleanup (`clearInterval`) fires, and the `selectedAnswer !== null` guard prevents a new
interval from being set. No more tick sounds during the 1-second delay.

**Success criterion:** selecting an answer at timeLeft <= 6 no longer triggers additional
tick sounds.

**Validation:** `npm run lint`

---

## Phase 2 — Stop a mid-playback tick immediately on answer select

**File:** `utils/sound.js`

Export a `stopSound(key)` function after `playSound`:

```js
export const stopSound = (key) => {
  try {
    const p = players[key];
    if (!p) return;
    p.pause?.();
    p.seekTo(0);
  } catch (e) {
    console.warn("stopSound error", e);
  }
};
```

**File:** `app/game/quick-game.jsx`

Add `stopSound` to the import line:

```js
import { initSounds, playSound, stopSound, unloadSounds } from "../../utils/sound";
```

Call it in `handleAnswerSelect` immediately after `setSelectedAnswer` (line ~87):

```js
setSelectedAnswer(answerIndex);
if (soundsReady) stopSound("tick");
```

**Success criterion:** a tick sound that is already playing stops the moment the user
taps an answer.

**Validation:** `npm run lint`

---

## Risks and Edge Cases

- Adding `selectedAnswer` to the effect dependency list causes the effect to re-run on
  every answer selection. The `selectedAnswer !== null` guard ensures no new interval is
  created — no infinite loop risk.
- `stopSound` uses the same `pause + seekTo(0)` pattern already present in `playSound`,
  so it is safe with the current `expo-audio` API.
- Phase 1 alone is sufficient to prevent new ticks. Phase 2 improves UX by stopping
  an already-playing tick. Both phases should be applied together.

## Usage

Run `/implement_plan thoughts/shared/plans/2026-05-19_tick-sound-fix.md`.
Apply Phase 1 first, lint, then Phase 2, lint.
