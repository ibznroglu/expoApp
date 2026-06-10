# Quick-Game Bug Research

**Date:** 2026-06-10
**Files:** `app/(app)/game/quick-game.jsx`, `assets/styles/quickGameStyle.js`, `constants/theme.ts`

---

## Issue 1 — Options Glitch (intermittent)

### Symptom A — stagger pop-in (new question shows one option, rest pop in)

**Root cause:** The entrance animation array (`entranceOptionAnims`, 4 `Animated.Value`s initialized at `quick-game.jsx:118–123`) resets to 0 on every `currentQuestionIndex` change (`quick-game.jsx:243`: `entranceOptionAnims.forEach(a => a.setValue(0))`). The stagger then fires each value with a 120ms delay (`quick-game.jsx:266–270`) using `Animated.spring` (`friction: 5, tension: 60`). On fast renders or batched state updates the spring's overshoot combined with the stagger delay is visible: option 0 appears, then 120ms later option 1, etc. Additionally, **no `.stop()` call precedes the reset**, so a previously running spring may fight the new `setValue(0)`.

**Fix direction:** Stop all running animations before resetting (`entranceOptionAnims.forEach(a => { a.stopAnimation(); a.setValue(0); })`). Consider switching stagger from `Animated.spring` (overshoots) to `Animated.timing` with `easing: Easing.out(Easing.quad)` for a clean fade/slide-in without bounce.

**Key lines:**
- `quick-game.jsx:118–123` — `entranceOptionAnims` init
- `quick-game.jsx:236–273` — entrance animation effect (reset + stagger)
- `quick-game.jsx:266–270` — stagger spring definition

### Symptom B — option disappears on wrong answer then advances

**Root cause:** Race condition between the 1000ms `setTimeout` in `handleAnswerSelect` (`quick-game.jsx:198–200`) and the `currentQuestionIndex` change effect (`quick-game.jsx:236`). If anything triggers `currentQuestionIndex` to increment before the timeout fires, the entrance effect's `entranceOptionAnims.forEach(a => a.setValue(0))` runs first, instantly hiding all options. Only happens on wrong answer because correct-answer handling may have a different code path or the timer window differs. The options use `entranceOptionAnims[index]` as their opacity driver (line 639) so a reset to 0 makes them invisible.

**Fix direction:** Clear the timeout in the effect cleanup (`useEffect` return). Keep a `timeoutRef = useRef(null)` and call `clearTimeout(timeoutRef.current)` before advancing. This ensures the 1000ms pause completes (and options stay visible) before any index change triggers an anim reset.

**Key lines:**
- `quick-game.jsx:182–203` — `handleAnswerSelect` (sets selectedAnswer, schedules 1000ms advance)
- `quick-game.jsx:236–273` — entrance animation effect that resets anims on index change
- `quick-game.jsx:635` — options map uses `key={index}` (index-based — unstable if options array length/order changes across questions; contributes to reconciliation mismatches)

---

## Issue 2 — Question Text Overflow on Android

**Root cause:** `questionText` style has a fixed `lineHeight: 26` (`quickGameStyle.js:202–207`). Android calculates `lineHeight` differently from iOS — on Android a fixed pixel `lineHeight` that is close to the font size can cause text to be clipped at the bottom of each line. Combined with the `flex: 1` chain (`gameContent → questionCardWrapper → questionCardGradientBorder → questionCard`), the question card expands to fill available space but the text inside it can still clip if `lineHeight` is too tight for Android's metrics.

No `numberOfLines` prop is set, no `overflow: 'hidden'` is explicit, no `Platform.select` exists — the same style fires on both platforms.

**Exact style causing the clip — `quickGameStyle.js:202–207`:**
```js
questionText: {
  color: Colors.text.primary,
  fontFamily: Typography.family.bold,
  textAlign: 'center',
  lineHeight: 26,   // <-- fixed px, clips on Android for long strings
}
```

**Fix direction:** Remove `lineHeight: 26` entirely and let the platform compute natural line height, OR use `Platform.select({ android: { lineHeight: 30 }, ios: { lineHeight: 26 } })` to give Android extra breathing room.

**Key lines:**
- `quickGameStyle.js:202–207` — `questionText` style with fixed `lineHeight`
- `quickGameStyle.js:195–201` — `questionCard` (flex: 1, no max height)

---

## Issue 3 — Option Styling Map (for future orange-gradient restyle)

All option styles are in `assets/styles/quickGameStyle.js`. No `LinearGradient` — flat colors only.

| What | Value | File:Line |
|---|---|---|
| Background (default) | `Colors.bg.surface` = `#2A1960` | `quickGameStyle.js:243` |
| Background (correct) | `Colors.correctBg` = `rgba(34,197,94,0.15)` | `quickGameStyle.js:255` |
| Background (wrong) | `Colors.wrongBg` = `rgba(239,68,68,0.12)` | `quickGameStyle.js:259` |
| Border color (default) | `rgba(155,89,245,0.8)` (purple, hardcoded) | `quickGameStyle.js:245` |
| Border width (default) | `2` | `quickGameStyle.js:246` |
| Border color (selected) | `#00D4FF` (cyan) | `quickGameStyle.js:251` |
| Border color (correct) | `Colors.correct` = `#22C55E` | `quickGameStyle.js:256` |
| Border color (wrong) | `Colors.wrong` = `#EF4444` | `quickGameStyle.js:260` |
| Text color (default) | `Colors.text.secondary` = `rgba(255,255,255,0.7)` | `quickGameStyle.js:281` |
| Text color (selected/correct) | `Colors.text.primary` = `#FFFFFF` + bold | `quickGameStyle.js:287` |
| Letter badge bg (default) | `rgba(155,89,245,0.6)` (purple, hardcoded) | `quickGameStyle.js:266` |
| Letter badge bg (correct) | `Colors.correct` | `quickGameStyle.js:271` |
| Letter badge bg (wrong) | `Colors.wrong` | `quickGameStyle.js:274` |

The default purple border (`rgba(155,89,245,0.8)`) and letter badge (`rgba(155,89,245,0.6)`) are hardcoded inline — not using a theme token. A restyle to orange-gradient should target these two inline values plus `Colors.bg.surface` as the background starting point.

---

**RESEARCH_READY**
