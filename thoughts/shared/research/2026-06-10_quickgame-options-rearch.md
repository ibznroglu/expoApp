# Quick-Game Options Entrance — Reanimated Migration Research

**Date:** 2026-06-10
**Files:** `app/game/quick-game.jsx`, `utils/sound.js`, `babel.config.js`, `app/_layout.tsx`, `package.json`, `app.json`

---

## 1. Reanimated Setup Viability

### babel.config.js — MISSING

`babel.config.js` does **NOT** exist at `c:\projects\expoApp\babel.config.js`.

Without it, Reanimated's babel plugin cannot be registered. Reanimated v4 requires the plugin to compile worklet code. The minimal required file:

```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
};
```

The plugin MUST be last in the `plugins` array per Reanimated v4 requirements.

### Entry Point Import — MISSING

`app/_layout.tsx` (lines 1–42) does NOT contain `import 'react-native-reanimated'`. This import must appear at the very top of the file (before any other imports) to initialize Reanimated's native modules on app start.

### Installed Version

`package.json` line 41: `"react-native-reanimated": "~4.1.1"` — actual installed: v4.1.5.

### New Architecture

`app.json` line 10: `"newArchEnabled": true` — Reanimated v4 requires New Architecture; this project meets the requirement.

### Existing Reanimated Usage

Zero files use `useAnimatedStyle`, `useSharedValue`, `entering=`, or `Animated` from reanimated. Reanimated is installed but completely unused — this is a greenfield integration.

### FadeInDown API in v4.1.5

`FadeInDown` is exported from `react-native-reanimated` (confirmed in `node_modules/react-native-reanimated/src/index.ts:185` and implemented in `src/layoutReanimation/defaultAnimations/Fade.ts:205–242`).

- **Import:** `import { FadeInDown } from 'react-native-reanimated';`
- **Chainable API:** `FadeInDown.delay(index * 120).duration(220)` — `.delay(ms)` and `.duration(ms)` are available on all `ComplexAnimationBuilder` subclasses.
- **What it does:** Fades from `opacity: 0` + `translateY: 25` to `opacity: 1` + `translateY: 0`. Duration defaults to 300ms if not overridden.
- **v4 vs v3 difference:** v4 does not export `Animated` as the main reanimated export. For entering animations, wrap in Reanimated's `Animated.View` (imported as `import Animated from 'react-native-reanimated'` — a separate Animated from react-native's). The entering animations are still classes, not functions — used as `entering={FadeInDown.delay(...).duration(...)}` (no `new` keyword).

### Summary

**Project is NOT ready yet.** Two setup steps are missing before entering animations can work:
1. Create `babel.config.js` with the reanimated plugin (last in plugins).
2. Add `import 'react-native-reanimated'` as the first import in `app/_layout.tsx`.

---

## 2. Current Option Entrance — Exact Map

### entranceOptionAnims Declaration (quick-game.jsx:118–123)

```javascript
const entranceOptionAnims = useRef([
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0),
]).current;
```

- Type: Array of 4 `react-native` `Animated.Value` instances.
- Initialized once; never re-created.
- Initial state: all values = 0.

### Entrance Effect (quick-game.jsx:236–278)

- **Dependencies:** `currentQuestionIndex`, `questions.length` (line 278).
- **Phase 1 changes already applied:**
  - Line 244: `entranceOptionAnims.forEach(a => { a.stopAnimation(); a.setValue(0); });`
  - Lines 267–271: `Animated.stagger(120, entranceOptionAnims.map(anim => Animated.timing(anim, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true })))`
  - Lines 274–276: cleanup `return () => { clearTimeout(answerTimeoutRef.current); };`

### Option Wrapper — Animated Style Props (quick-game.jsx:639–655)

Each option is wrapped in:
```javascript
<Animated.View
  key={(currentQuestion?.$id ?? currentQuestionIndex) + '-' + index}
  style={[
    s.optionWrapper,
    {
      opacity: entranceOptionAnims[index] ?? entranceOptionAnims[0],
      transform: [
        { scale: scaleAnims[index] ?? scaleAnims[0] },
        { translateY: (entranceOptionAnims[index] ?? entranceOptionAnims[0]).interpolate({
            inputRange: [0, 1], outputRange: [30, 0]
        }) },
      ],
    },
    isCorrect && s.optionWrapperCorrect,
    isWrong   && s.optionWrapperWrong,
  ]}
>
```

**Animated style props bound to `entranceOptionAnims[index]`:**
- `opacity`: `entranceOptionAnims[index]` (0 → 1 directly, no interpolation).
- `transform[translateY]`: interpolated from 30px (hidden below) to 0px as value goes 0 → 1.

**NOT bound to `entranceOptionAnims`:**
- `transform[scale]`: bound to `scaleAnims[index]` — a separate array of `Animated.Value`s used for press feedback (quick-game.jsx:105–110). This must be preserved independently.

**Safe fallback:** `?? entranceOptionAnims[0]` / `?? scaleAnims[0]` guards if index >= 4.

### What Must Be Removed for Reanimated Migration

| What | Location | Action |
|---|---|---|
| `entranceOptionAnims` declaration | quick-game.jsx:118–123 | Delete entirely |
| `entranceOptionAnims.forEach(...)` reset | quick-game.jsx:244 | Delete |
| `Animated.stagger(...)` block | quick-game.jsx:267–271 | Delete |
| `opacity` from `Animated.View` style | quick-game.jsx:643 | Remove |
| `translateY` from `Animated.View` style | quick-game.jsx:646–649 | Remove |
| `Animated.View` wrapper (if no other anims) | quick-game.jsx:639 | Replace with Reanimated `Animated.View` if scale stays; or keep react-native's `Animated.View` for scale only |

**What Must Stay:**
- `scaleAnims` array and `scaleAnims[index]` in the transform — press feedback animation is independent.
- `answerTimeoutRef` and the `clearTimeout` cleanup — advance timing is unrelated to entrance.
- Stable key `(currentQuestion?.$id ?? currentQuestionIndex) + '-' + index` — this is exactly what triggers Reanimated re-mount and re-play of the entering animation.

### Recommended New Structure

Replace the `Animated.View` wrapper with Reanimated's `Animated.View` (or keep react-native's for scale and nest a Reanimated view inside for entering):

```jsx
import Animated, { FadeInDown } from 'react-native-reanimated';

// In options map:
<Animated.View  // Reanimated's Animated.View
  key={(currentQuestion?.$id ?? currentQuestionIndex) + '-' + index}
  entering={FadeInDown.delay(index * 120).duration(220)}
  style={[s.optionWrapper, isCorrect && s.optionWrapperCorrect, isWrong && s.optionWrapperWrong]}
>
  <Animated.View  // react-native's Animated.View for scale press feedback
    style={{ transform: [{ scale: scaleAnims[index] ?? scaleAnims[0] }] }}
  >
    {/* option content */}
  </Animated.View>
</Animated.View>
```

The outer Reanimated `Animated.View` handles entrance (keyed re-mount → re-play). The inner react-native `Animated.View` handles the press scale. Alternatively, Reanimated's `Animated.View` also accepts native-driver `transform` styles — the two can be merged if preferred.

---

## 3. Sound Race on Fast Tap

### playSound() and stopSound() (sound.js)

```javascript
// sound.js — playSound (lines 47–57)
export const playSound = (key) => {
  try {
    const p = players[key];
    if (!p) return;
    p.pause?.();
    p.seekTo(0);
    p.play();
  } catch (e) { console.warn("playSound error", e); }
};

// sound.js — stopSound (lines 83–92)
export const stopSound = (key) => {
  try {
    const p = players[key];
    if (!p) return;
    p.pause?.();
    p.seekTo(0);
  } catch (e) { console.warn("stopSound error", e); }
};
```

Both are **fully synchronous**. No await, no promise, no callback. `playSound` immediately calls `.play()` on the player.

### handleAnswerSelect Sound Sequence (quick-game.jsx:183–204)

```javascript
if (soundsReady) stopSound("tick");          // line 190 — pause + seekTo(0) on tick player
if (answerIndex === currentQuestion.correctAnswer) {
  if (soundsReady) playSound("correct");     // line 194 — pause + seekTo(0) + play() on correct player
} else {
  if (soundsReady) playSound("wrong");       // line 196
}
```

**`soundsReady` guard:** Correct pattern — both calls are guarded. But `soundsReady` only means `initSounds()` resolved; it does NOT guarantee the native audio layer is ready.

### Root Cause of Sound Drop on Fast Tap

The tick and correct/wrong players are **separate instances** in the `players` object — there is no same-player race. The issue is different:

1. **Expo Audio queue saturation:** When the user taps very quickly (e.g., during countdown tick), the native audio queue may be mid-operation. `stopSound("tick")` fires `.pause()` + `.seekTo(0)` synchronously; then milliseconds later `playSound("correct")` fires `.pause()` + `.seekTo(0)` + `.play()` on a different player. If the audio thread is busy, the `.play()` call may be silently dropped.

2. **`soundsReady` false at tap time:** If the user taps before `initSounds()` resolves (fast tapper at app start), all sound calls are skipped entirely. Unlikely in practice but possible.

3. **No error recovery:** `playSound` catches errors and warns but does not retry or queue the play call.

### Minimal Reliability Fix Location

The safest minimal fix is in `handleAnswerSelect` — add a small `setTimeout(0)` (next tick) between `stopSound` and `playSound` to let the audio thread process the stop before playing:

```javascript
if (soundsReady) stopSound("tick");
// Give the audio thread one event-loop tick to process the stop
setTimeout(() => {
  if (soundsReady) {
    if (answerIndex === currentQuestion.correctAnswer) {
      playSound("correct");
    } else {
      playSound("wrong");
    }
  }
}, 0);
```

Alternative: skip `stopSound("tick")` entirely and let the tick player's natural playback end (it's a short ~200ms tick sound). This avoids the race completely at the cost of a brief tick overlap on the first answer tap.

**Recommended:** `setTimeout(0)` wrapper around the feedback `playSound`. Minimal, localized, does not require changing `sound.js`.

---

## 4. Advance Timing

### Current State

`answerTimeoutRef.current = setTimeout(() => { handleNextQuestion(); }, 1000);` (quick-game.jsx:199–201)

The 1000ms starts **at the moment of tap** (when `handleAnswerSelect` runs). The entrance animation for the NEXT question fires when `currentQuestionIndex` increments, which happens inside `handleNextQuestion`. So the 1000ms is the full reveal window for the current question's correct/wrong feedback.

### Is 1200ms Safe?

- **Timer:** The countdown timer is paused during answer feedback? Check: the timer effect (quick-game.jsx:207–226) stops when `selectedAnswer !== null` (line 209: `if (selectedAnswer !== null) return;`). So the timer is already stopped on tap — increasing to 1200ms does NOT burn extra timer time.
- **Score:** Already set at tap time (line 193) — increasing delay has no effect on score.
- **UX:** 200ms extra is imperceptible for most users, and gives the correct/wrong sound more time to play fully before the transition.
- **Verdict:** Increasing to 1200ms is safe and slightly improves sound reliability (less likely to cut off the feedback sound).

---

## Setup Blockers Summary

| Blocker | File | Action |
|---|---|---|
| No babel.config.js | (create at repo root) | Create with `babel-preset-expo` + `react-native-reanimated/plugin` |
| No reanimated import | `app/_layout.tsx:1` | Add `import 'react-native-reanimated'` as first line |

Both must be done BEFORE implementing the Reanimated entering animation. After adding babel.config.js, **clear Expo cache** (`npx expo start --clear`) before testing.

---

**RESEARCH_READY**
