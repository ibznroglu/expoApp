# Quick-Game Options Glitch — Library-Free Fix

**Date:** 2026-06-10
**Topic:** Eliminate option entrance glitch with a single grouped Animated.Value (no reanimated), plus sound reliability + reveal buffer
**Status:** Ready for plan-reviewer
**Supersedes:** the reanimated approach (abandoned — Expo Go worklets version mismatch)

---

## Root cause (confirmed)
Each option binds its own native-driven `Animated.Value` (`entranceOptionAnims[index]`),
reset per question via `stopAnimation()/setValue(0)` and revealed with a 120ms stagger.
On a native-driven value, `stopAnimation()+setValue(0)` desyncs the JS/native layers,
leaving an option stuck invisible ("disappears"); the stagger makes "one appears, others
late" visible. Phase 1's `stopAnimation()` did not fix it (possibly worsened it).

## Senior fix
Drive ALL options from ONE shared `Animated.Value` (`optionsEntranceAnim`), animated as a
single group (no stagger, no per-option reset). One value + one timing = no desync, no race.
Options fade + slide in together. Keep press feedback (`scaleAnims`) and correct/wrong
states untouched.

All changes are in `app/game/quick-game.jsx` (Phase 1) and the same file (Phase 2).

---

## Phase 1 — Single grouped entrance value

1. **Declaration** (replace the 4-value array at lines ~118-123):
   ```js
   // remove entranceOptionAnims useRef([... 4 values ...])
   const optionsEntranceAnim = useRef(new Animated.Value(0)).current;
   ```
2. **Entrance effect reset** (line ~244): replace
   `entranceOptionAnims.forEach(a => { a.stopAnimation(); a.setValue(0); });`
   with `optionsEntranceAnim.setValue(0);`
   (single value, no stagger → no stopAnimation needed).
3. **Entrance animation** (the `Animated.stagger(120, entranceOptionAnims.map(...))` block,
   lines ~266-270): replace the whole stagger with a single timing inside the existing
   `Animated.parallel`:
   ```js
   Animated.timing(optionsEntranceAnim, {
     toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true,
   }),
   ```
4. **restartGame** (line ~319): `entranceOptionAnims.forEach(a => a.setValue(0));` →
   `optionsEntranceAnim.setValue(0);`. Update the dep array (line ~329):
   swap `entranceOptionAnims` → `optionsEntranceAnim`.
5. **Render binding** (lines ~644 and ~647): replace both
   `entranceOptionAnims[index] ?? entranceOptionAnims[0]` with `optionsEntranceAnim`
   (opacity uses it directly; translateY uses `optionsEntranceAnim.interpolate({inputRange:[0,1], outputRange:[30,0]})`).
6. Keep the stable `key` (question $id + index) — harmless and good for reconciliation.
7. Confirm no remaining reference to `entranceOptionAnims` anywhere (grep).

> Result: all four options appear together with one fade+slide, no stagger, no per-option
> desync. The "stuck/disappearing option" and "late pop-in" both go away.

---

## Phase 2 — Sound reliability + reveal buffer

1. **Sound on fast tap** (`handleAnswerSelect`): the feedback `playSound("correct"/"wrong")`
   can drop when fired on the same tick as `stopSound("tick")`. Defer it one tick:
   ```js
   if (soundsReady) stopSound("tick");
   ...
   setTimeout(() => {
     if (soundsReady) playSound(answerIndex === currentQuestion.correctAnswer ? "correct" : "wrong");
   }, 0);
   ```
   (Keep the score update synchronous; only the sound is deferred.)
2. **Reveal buffer**: change the advance timeout from 1000ms to 1200ms (the single
   `answerTimeoutRef.current = setTimeout(handleNextQuestion, 1200)`), giving feedback +
   sound time to register. Timer already stops on answer (`selectedAnswer !== null`).

---

## Risks and Edge Cases
| Case | Handling |
|------|----------|
| Single value loses the staggered feel | Intentional; a clean simultaneous reveal is the goal and removes the glitch. 280ms still feels animated. |
| translateY interpolate on one value | Same interpolation, just shared — all options slide together. |
| Dangling entranceOptionAnims ref | Grep after edits; all 5 sites (decl, reset, stagger, restartGame + dep, render x2) must be updated. |
| Sound defer changes ordering | setTimeout(0) only defers the feedback sound; score/state unchanged. |
| Correct/wrong feedback | Untouched — still driven by selectedAnswer + styles. |

---

## Validation Commands (every phase)
```bash
npm run lint
npx tsc --noEmit
```
Manual device checks (iOS + Android), after Phase 2:
- [ ] New question: all 4 options appear together, no late pop-in, none stuck invisible.
- [ ] Answer fast on many questions (5+ games): no option ever disappears.
- [ ] correct/wrong sound plays every time, even on very fast taps.
- [ ] ~1.2s feedback pause feels right before next question.
- [ ] Restart game works; options re-enter cleanly.

---

## Running with Claude Code
Human drives transitions; one delegated step per turn; commit only when told. Each phase
prompt ends with: "After PHASE_COMPLETE do not invoke any other agent or commit — wait for me."
