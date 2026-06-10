# Quick-Game Fixes — Implementation Plan

**Date:** 2026-06-10
**Research:** thoughts/shared/research/2026-06-10_quickgame-bugs.md
**Scope:** Three phases — options glitch fix, Android question-text overflow fix, option restyle (gold→orange gradient).

> NOTE ON PATHS: The research file references `app/(app)/game/quick-game.jsx`, but the actual file on disk is `app/game/quick-game.jsx`. All line numbers below were re-verified against the real file.

---

## Goal

Eliminate the intermittent options-glitch on quick-game questions (stagger pop-in plus the disappear-on-wrong-answer race), fix question text being clipped on Android due to a too-tight fixed `lineHeight`, and restyle the answer options from a hardcoded purple border/badge to a gold→orange gradient border with a gold gradient letter badge — while strictly preserving the green (correct) and red (wrong) feedback states and the existing entrance animations.

---

## Files to Change

| File | Purpose of change |
|---|---|
| `app/game/quick-game.jsx` | Phase 1: stop running anims before reset, swap option stagger spring→timing, add a timeout ref with effect cleanup, stable option key. Phase 3: replace the option flat-color markup with a `LinearGradient` gradient-border wrapper + gradient letter badge, preserving correct/wrong overrides. |
| `assets/styles/quickGameStyle.js` | Phase 2: platform-specific `lineHeight` for `questionText` (import `Platform`). Phase 3: add/adjust option styles for the gradient-border pattern (inner fill, badge gradient container, selected glow, and correct/wrong flat overrides). |
| `constants/theme.ts` | Phase 3: add `option: ['#FFD700', '#FF8C00'] as const` to `Colors.gradients`. No existing token is modified. |

## Files to Create

None.

---

## Implementation Steps

### Phase 1 — Fix options glitch (`app/game/quick-game.jsx`)

All four changes are in `app/game/quick-game.jsx`. `Easing` is already imported (line 6) and `LinearGradient` is already imported (line 14) — no new imports needed.

**Step 1a — Add a timeout ref.**
Near the other refs (after `wooshPlayedForRef` around line 127), add:
```js
const answerTimeoutRef = useRef(null);
```

**Step 1b — Store the advance timeout in the ref.**
In `handleAnswerSelect`, at the `setTimeout(() => { handleNextQuestion(); }, 1000)` block (lines 198–200), assign it:
```js
answerTimeoutRef.current = setTimeout(() => { handleNextQuestion(); }, 1000);
```

**Step 1c — Stop running anims before reset + add cleanup in the entrance effect.**
In the entrance-animation `useEffect` (starts around line 236):
- Change `entranceOptionAnims.forEach(a => a.setValue(0));` (line 243) to:
  ```js
  entranceOptionAnims.forEach(a => { a.stopAnimation(); a.setValue(0); });
  ```
- Add a cleanup return after the `.start()` call (before the closing brace):
  ```js
  return () => {
    clearTimeout(answerTimeoutRef.current);
  };
  ```

**Step 1d — Swap the option stagger from spring to timing.**
In the same effect, replace the `Animated.stagger` block (lines 266–270):
```js
// Before:
Animated.stagger(120,
  entranceOptionAnims.map(anim =>
    Animated.spring(anim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true })
  )
),
// After:
Animated.stagger(120,
  entranceOptionAnims.map(anim =>
    Animated.timing(anim, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true })
  )
),
```

**Step 1e — Stable option key.**
In the options map (line 635), replace `key={index}` with:
```jsx
key={(currentQuestion?.$id ?? currentQuestionIndex) + '-' + index}
```
Note: The questions schema has no `id` field; `currentQuestion?.$id` uses the Appwrite document id. Falls back safely to `currentQuestionIndex`.

---

### Phase 2 — Fix Android question-text overflow (`assets/styles/quickGameStyle.js`)

**Step 2a — Import `Platform`.**
At line 1 of `assets/styles/quickGameStyle.js`, change:
```js
import { StyleSheet } from "react-native";
```
to:
```js
import { Platform, StyleSheet } from "react-native";
```

**Step 2b — Platform-specific lineHeight.**
In the `questionText` style (lines 202–207), replace `lineHeight: 26,` with:
```js
...Platform.select({ ios: { lineHeight: 26 }, android: { lineHeight: 30 } }),
```
Result:
```js
questionText: {
  color: Colors.text.primary,
  fontFamily: Typography.family.bold,
  textAlign: 'center',
  ...Platform.select({ ios: { lineHeight: 26 }, android: { lineHeight: 30 } }),
},
```

**Step 2c — Verify layout hierarchy (no change needed).**
`questionCardGradientBorder` (`quickGameStyle.js:189–194`) has `overflow: 'hidden'` at line 193 — this IS present in the hierarchy but does NOT cause additional clipping because both `questionCardGradientBorder` and `questionCard` use `flex: 1`, meaning the inner card cannot overflow the wrapper's bounds. The actual clip source is the tight `lineHeight` only. `questionCard` (lines 195–201) has no fixed `height` or `maxHeight`. Leave both unchanged.

---

### Phase 3 — Option restyle: gold→orange gradient border + badge

#### 3a — Token addition (`constants/theme.ts`)

In `Colors.gradients` (lines 60–63), add ONE new key without touching `background` or `brandButton`:
```ts
option: ['#FFD700', '#FF8C00'] as const,
```

#### 3b — Style adjustments (`assets/styles/quickGameStyle.js`)

1. **Add `optionGradientBorder`** (new style):
   ```js
   optionGradientBorder: {
     flex: 1,
     borderRadius: Radius.md,
     padding: 2,
     overflow: 'hidden',
   },
   ```

2. **Add `optionGradientBorderSelected`** (new style — thicker border for selected state):
   ```js
   optionGradientBorderSelected: {
     padding: 3,
   },
   ```

3. **Adjust `optionButton`** (lines 239–249) — becomes the opaque inner fill; remove the hardcoded purple border:
   - Remove `borderWidth: 2,` and `borderColor: 'rgba(155,89,245,0.8)',`
   - Keep `backgroundColor: Colors.bg.surface,`
   - Add `borderRadius: Radius.md - 2,` so the inner fill nests cleanly inside the 2px gradient border
   - Keep all other properties unchanged

4. **Remove `optionButtonSelected`** (lines 250–253) — cyan border styling is replaced by `optionGradientBorderSelected`. Delete this style (and its usage in JSX per 3c step 3).

5. **Preserve correct/wrong overrides (CRITICAL).** Add `borderWidth: 2,` to both `optionCorrect` (lines 254–257) and `optionWrong` (lines 258–261) so the flat semantic border is visible when the gradient wrapper is absent:
   ```js
   optionCorrect: {
     backgroundColor: Colors.correctBg,
     borderColor: Colors.correct,
     borderWidth: 2,          // ADD THIS
   },
   optionWrong: {
     backgroundColor: Colors.wrongBg,
     borderColor: Colors.wrong,
     borderWidth: 2,          // ADD THIS
   },
   ```

6. **Letter badge — `optionLetter`** (lines 262–269): remove `backgroundColor: 'rgba(155,89,245,0.6)'`, add `overflow: 'hidden'`. The gradient is provided by a `LinearGradient` wrapper in JSX.

7. **Add `optionLetterTextOnGold`** (new style — dark text for gold badge contrast):
   ```js
   optionLetterTextOnGold: {
     color: Colors.bg.primary,
   },
   ```
   `optionLetterText` (white + bold, lines 276–279) stays for correct/wrong badge states.

#### 3c — JSX changes in the options map (`app/game/quick-game.jsx`, lines 633–681)

1. **Add a `renderGradientBorder` flag** at the top of the map callback:
   ```js
   const renderGradientBorder = !isCorrect && !isWrong;
   ```

2. **Wrap the `TouchableOpacity` conditionally.**
   Apply `isDimmed` opacity to the `LinearGradient` wrapper (not the inner `TouchableOpacity`) so the entire option — border and fill — dims uniformly, matching the current behavior where the whole button fades:
   ```jsx
   {renderGradientBorder ? (
     <LinearGradient
       colors={Colors.gradients.option}
       start={{ x: 0, y: 0 }}
       end={{ x: 1, y: 1 }}
       style={[s.optionGradientBorder, isSelected && s.optionGradientBorderSelected, isDimmed && { opacity: 0.5 }]}
     >
       <TouchableOpacity style={s.optionButton} ...>
         {/* badge + text */}
       </TouchableOpacity>
     </LinearGradient>
   ) : (
     <TouchableOpacity style={[s.optionButton, isCorrect && s.optionCorrect, isWrong && s.optionWrong]} ...>
       {/* badge + text */}
     </TouchableOpacity>
   )}
   ```
   Keep `onPress`, `disabled={selectedAnswer !== null}`, `activeOpacity={0.85}` in BOTH branches. In the correct/wrong branch there is no `isDimmed` case (feedback states are mutually exclusive with dimmed).

3. **Remove `isSelected && !isCorrect && !isWrong && s.optionButtonSelected`** from `optionButton` style arrays (style deleted in 3b step 4).

4. **`LinearGradient` import** — already present (`quick-game.jsx:14`). No new import.

5. **Letter badge JSX** (lines 664–672) — branch by `renderGradientBorder`:
   ```jsx
   {renderGradientBorder ? (
     <LinearGradient colors={Colors.gradients.option} start={{x:0,y:0}} end={{x:1,y:1}} style={s.optionLetter}>
       <TextCustom style={[s.optionLetterText, s.optionLetterTextOnGold]} fontSize={13}>{letterLabel}</TextCustom>
     </LinearGradient>
   ) : (
     <View style={[s.optionLetter, isCorrect && s.optionLetterCorrect, isWrong && s.optionLetterWrong]}>
       <TextCustom style={s.optionLetterText} fontSize={13}>{letterLabel}</TextCustom>
     </View>
   )}
   ```

6. **Option text** (lines 674–679) — UNCHANGED.

---

## Risks and Edge Cases

| Risk / Edge case | Mitigation |
|---|---|
| `currentQuestion.$id` undefined | Falls back to `currentQuestionIndex` — still stable per question. |
| `clearTimeout(null)` on first render | Safe no-op; no guard needed. |
| Removing cyan `optionButtonSelected` loses selection affordance | Selection now expressed by `optionGradientBorderSelected` (thicker border). Verify on device. |
| Gradient border bleeding behind text | Inner `optionButton` keeps opaque `Colors.bg.surface` fill + `borderRadius: Radius.md - 2`. |
| Correct/wrong feedback lost | CRITICAL: correct/wrong branches render WITHOUT gradient wrapper; flat `optionCorrect`/`optionWrong` bg + `borderWidth:2` restore full feedback. |
| `LinearGradient` badge clipping to circle | `optionLetter` gets `overflow: 'hidden'` + `borderRadius: 16`. |
| Android `lineHeight: 30` looks loose on short questions | Acceptable; font size already scales by question length (lines 609–613). |
| Entrance animation broken by extra nesting | Gradient border is INSIDE `optionWrapper` `Animated.View` — opacity/scale/translate still apply. |
| `isDimmed` placed on wrong element | `isDimmed` opacity goes on the `LinearGradient` wrapper (not the inner `TouchableOpacity`) so the full option — gradient border + fill — dims uniformly. In the correct/wrong branch `isDimmed` is never true so no dimming logic needed there. |
| 4× `LinearGradient` per question GPU cost | Matches existing pattern (question card already uses nested LinearGradients). Check on low-end Android. |

---

## Validation Commands

```bash
npm run lint
npx tsc --noEmit
```

Manual device checks (iOS + Android):
- [ ] Options animate in smoothly — clean staggered fade, no spring overshoot pop
- [ ] Wrong answer: selected option stays visible (red) for full ~1s before advancing — does NOT disappear
- [ ] Correct answer: option turns green, stays visible ~1s before advancing
- [ ] Long question text fully visible on Android (no bottom clipping)
- [ ] Default options show gold→orange gradient border, gold gradient letter badge with dark text
- [ ] Selected option shows slightly thicker gold border
- [ ] Green (correct) and red (wrong) feedback states are unambiguous and unchanged
- [ ] Letter badge text is white on correct/wrong, dark on default gold badge
- [ ] Rapid tapping / fast advances do not leave half-faded or invisible options

---

## Running with Claude Code

Human drives phase transitions; one delegated step per turn; commit only when told.

```
@coder implement ONLY Phase 1: in app/game/quick-game.jsx — add answerTimeoutRef, store advance timeout in it, stopAnimation() before setValue(0) reset in entrance effect, add clearTimeout cleanup return, swap spring→timing with Easing.out(Easing.quad) duration 220, stable key with $id. Run npm run lint && npx tsc --noEmit. STOP. Output PHASE_COMPLETE.
```

Then `@code-reviewer`, `@tester`, human commits. Repeat for Phases 2 and 3.

PLAN_READY: thoughts/shared/plans/2026-06-10_quickgame-fixes.md
