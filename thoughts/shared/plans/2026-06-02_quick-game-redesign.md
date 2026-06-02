## Goal

Full redesign of `app/game/quick-game.jsx` and `assets/styles/quickGameStyle.js` to:
- Replace `ImageBackground` + Unsplash URL with `LinearGradient` (same palette as home screen)
- Add an exit button (top-left) with a confirm modal
- Apply all `Colors.*`, `Typography.*`, `Radius.*`, `Spacing.*` tokens from `constants/theme.ts`
- Refactor every UI state (loading, error, playing, game-over) with the new design
- Wire `playSound('gameOver')` on timer timeout
- Add `Animated.View` scale feedback on answer press
- Deliver a redesigned game-over screen with score circle, correct count, coins badge, two action buttons

---

## Files to Change

| File | Change type |
|---|---|
| `app/game/quick-game.jsx` | Full rewrite |
| `assets/styles/quickGameStyle.js` | Full rewrite |

## Files to Create

None. All changes land in the two files above.

---

## Implementation Steps

### Step 1 — Update imports in `app/game/quick-game.jsx`

Replace the current import block with:

```js
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { quickGameStyles as s } from "../../assets/styles/quickGameStyle";
import { getQuestions } from "../../services/questionService";
import {
  initSounds,
  playSound,
  playUISound,
  stopSound,
  unloadSounds,
} from "../../utils/sound";
import TextCustom from "../components/TextCustom";
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";
```

Key additions vs current: `Animated`, `Modal`, `StyleSheet`, `LinearGradient`, `Ionicons`, `playUISound`, `Colors`, `Radius`, `Spacing`, `Typography`.
Remove: `ImageBackground`.

---

### Step 2 — Add state variables for exit modal and answer scale animations

Inside `QuickGame()`, after the existing state declarations, add:

```js
// Exit modal
const [exitModalVisible, setExitModalVisible] = useState(false);

// Scale animations — one Animated.Value per option (always 4 options)
const scaleAnims = useRef([
  new Animated.Value(1),
  new Animated.Value(1),
  new Animated.Value(1),
  new Animated.Value(1),
]).current;
```

The `scaleAnims` array is index-matched to the four answer options. Using `useRef` ensures the `Animated.Value` instances are stable across renders.

---

### Step 3 — Add `handleExitPress` and `confirmExit` functions

Place after `restartGame`:

```js
const handleExitPress = useCallback(() => {
  playUISound('button');
  setExitModalVisible(true);
}, []);

const confirmExit = useCallback(() => {
  playUISound('modal');
  setExitModalVisible(false);
  // Small delay so the modal sound can play before unmount
  setTimeout(() => router.back(), 200);
}, [router]);

const cancelExit = useCallback(() => {
  playUISound('button');
  setExitModalVisible(false);
}, []);
```

---

### Step 4 — Modify timer effect to detect timeout vs answer selection

The current timer effect calls `handleNextQuestion()` when `prev <= 1`. We need to distinguish timeout from user-initiated answer.

Replace the `setTimeLeft` updater block inside the interval with:

```js
const timer = setInterval(() => {
  setTimeLeft((prev) => {
    if (prev <= 1) {
      // Timer ran out — play gameOver sound then advance
      if (soundsReady) playSound('gameOver');
      handleNextQuestion();
      return 15;
    }
    if (prev <= 6 && soundsReady) {
      playSound('tick');
    }
    return prev - 1;
  });
}, 1000);
```

This is the only place `playSound('gameOver')` is called. The existing `handleAnswerSelect` path does NOT call `gameOver` — only the timeout path does. No `timedOut` flag is needed; the branching is purely structural.

---

### Step 5 — Add `animateOptionPress` helper

```js
const animateOptionPress = useCallback((index) => {
  Animated.sequence([
    Animated.timing(scaleAnims[index], {
      toValue: 0.97,
      duration: 80,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnims[index], {
      toValue: 1.0,
      duration: 120,
      useNativeDriver: true,
    }),
  ]).start();
}, [scaleAnims]);
```

Call this at the top of `handleAnswerSelect` before the early-return guard:

```js
const handleAnswerSelect = useCallback(
  (answerIndex) => {
    animateOptionPress(answerIndex);     // <-- added
    if (!currentQuestion) return;
    if (selectedAnswer !== null) return;
    // ... rest unchanged
  },
  [currentQuestion, selectedAnswer, soundsReady, handleNextQuestion, animateOptionPress],
);
```

---

### Step 6 — Rewrite the `BG_GRADIENT` constant and shared `LinearGradient` wrapper

At module level (outside the component), declare:

```js
const BG_GRADIENT = ['#2D1B69', '#1A0A4A', '#0D0527'];
```

Every UI state (`loading`, `error`, `gameCompleted`, playing) must render the same top-level structure:

```jsx
<View style={s.root}>
  <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
  <SafeAreaView style={s.safeArea} edges={['top']}>
    {/* state-specific content */}
  </SafeAreaView>
</View>
```

`s.root` is `{ flex: 1 }`. `s.safeArea` is `{ flex: 1, padding: Spacing.xl }` (24px).

This replaces all four `<ImageBackground>` blocks.

---

### Step 7 — Rewrite the Loading state JSX

```jsx
if (loading) {
  return (
    <View style={s.root}>
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <View style={s.centeredFill}>
          <TextCustom style={s.loadingText} fontSize={20}>
            Sorular yükleniyor...
          </TextCustom>
          <TextCustom style={s.loadingSubText} fontSize={15}>
            Bilgi yarışması hazırlanıyor
          </TextCustom>
        </View>
      </SafeAreaView>
    </View>
  );
}
```

No `ImageBackground`, no `overlay` `View`. Font handled by `TextCustom` (uses Nunito).

---

### Step 8 — Rewrite the Error state JSX

```jsx
if (questions.length === 0) {
  return (
    <View style={s.root}>
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <View style={s.centeredFill}>
          <TextCustom style={s.errorText} fontSize={18}>
            Sorular yüklenemedi
          </TextCustom>
          <TouchableOpacity
            style={s.retryButton}
            onPress={() => { playUISound('button'); loadQuestions(); }}
            activeOpacity={0.8}
          >
            <TextCustom style={s.retryButtonText} fontSize={16}>
              Tekrar Dene
            </TextCustom>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
```

`playUISound('button')` added to retry press.

---

### Step 9 — Rewrite the Game Over state JSX

```jsx
if (gameCompleted) {
  const correctCount = score / 10;
  const coinsEarned = score * 2;

  return (
    <View style={s.root}>
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <View style={s.centeredFill}>

          {/* Score circle */}
          <View style={s.scoreCircle}>
            <TextCustom style={s.scoreCircleNumber} fontSize={52}>
              {score}
            </TextCustom>
            <TextCustom style={s.scoreCircleLabel} fontSize={13}>
              PUAN
            </TextCustom>
          </View>

          {/* Correct count */}
          <TextCustom style={s.resultSubtitle} fontSize={18}>
            {correctCount} / {questions.length} Doğru
          </TextCustom>

          {/* Coins earned badge */}
          <View style={s.coinsBadge}>
            <Text style={s.coinsBadgeText}>🪙 {coinsEarned} Jeton Kazandın!</Text>
          </View>

          {/* Action buttons */}
          <View style={s.resultButtons}>
            <TouchableOpacity
              style={s.primaryButton}
              onPress={() => { playUISound('button'); restartGame(); }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.brand.gradient}
                style={s.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TextCustom style={s.primaryButtonText} fontSize={16}>
                  Tekrar Oyna
                </TextCustom>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.secondaryButton}
              onPress={() => { playUISound('button'); router.back(); }}
              activeOpacity={0.8}
            >
              <TextCustom style={s.secondaryButtonText} fontSize={16}>
                Ana Menü
              </TextCustom>
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}
```

`Colors.brand.gradient` is `['#FF6B35', '#FF9500']` from theme. `coinsEarned = score * 2` (100 pts = 200 coins).

---

### Step 10 — Rewrite the Playing state JSX (main game screen)

Complete JSX structure:

```jsx
return (
  <View style={s.root}>
    <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={s.safeArea} edges={['top']}>

      {/* ── Header Row ── */}
      <View style={s.header}>

        {/* Exit button */}
        <TouchableOpacity onPress={handleExitPress} style={s.exitButton} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={28} color={Colors.text.secondary} />
        </TouchableOpacity>

        {/* Score badge */}
        <View style={s.scoreBadge}>
          <TextCustom style={s.scoreBadgeText} fontSize={14}>
            {score} Puan
          </TextCustom>
        </View>

        {/* Timer circle */}
        <View style={[s.timerCircle, timeLeft <= 5 && s.timerCircleUrgent]}>
          <TextCustom
            style={[s.timerText, timeLeft <= 5 && s.timerTextUrgent]}
            fontSize={22}
          >
            {timeLeft}
          </TextCustom>
        </View>

        {/* Question counter badge */}
        <View style={s.counterBadge}>
          <TextCustom style={s.counterText} fontSize={14}>
            {currentQuestionIndex + 1}/{questions.length}
          </TextCustom>
        </View>

      </View>

      {/* ── Category badge ── */}
      <View style={s.categoryBadgeWrap}>
        <View style={s.categoryBadge}>
          <TextCustom style={s.categoryBadgeText} fontSize={11}>
            {currentQuestion.category?.toUpperCase() ?? 'GENEL KÜLTÜR'}
          </TextCustom>
        </View>
      </View>

      {/* ── Question card ── */}
      <View style={s.questionCard}>
        <TextCustom style={s.questionText} fontSize={19}>
          {currentQuestion.question}
        </TextCustom>
      </View>

      {/* ── Answer options ── */}
      <View style={s.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = selectedAnswer !== null && index === currentQuestion.correctAnswer;
          const isWrong =
            selectedAnswer !== null &&
            isSelected &&
            selectedAnswer !== currentQuestion.correctAnswer;
          const isDimmed =
            selectedAnswer !== null && !isSelected && !isCorrect;
          const letterLabel = String.fromCharCode(65 + index); // A B C D

          return (
            <Animated.View
              key={index}
              style={[
                s.optionWrapper,
                { transform: [{ scale: scaleAnims[index] }] },
                isDimmed && s.optionDimmed,
              ]}
            >
              <TouchableOpacity
                style={[
                  s.optionButton,
                  isCorrect && s.optionCorrect,
                  isWrong && s.optionWrong,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.85}
              >
                {/* Letter circle */}
                <View style={[
                  s.optionLetter,
                  isCorrect && s.optionLetterCorrect,
                  isWrong && s.optionLetterWrong,
                ]}>
                  <TextCustom style={s.optionLetterText} fontSize={13}>
                    {letterLabel}
                  </TextCustom>
                </View>

                {/* Option text */}
                <TextCustom
                  style={[s.optionText, (isSelected || isCorrect) && s.optionTextSelected]}
                  fontSize={15}
                >
                  {option}
                </TextCustom>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* ── Progress bar ── */}
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` },
          ]}
        />
      </View>

    </SafeAreaView>

    {/* ── Exit confirm modal ── */}
    <Modal
      visible={exitModalVisible}
      transparent
      animationType="fade"
      onRequestClose={cancelExit}
    >
      <View style={s.modalOverlay}>
        <View style={s.modalCard}>
          <TextCustom style={s.modalTitle} fontSize={17}>
            Oyundan ayrılmak istediğine emin misin?
          </TextCustom>
          <View style={s.modalButtons}>
            <TouchableOpacity
              style={s.modalCancelBtn}
              onPress={cancelExit}
              activeOpacity={0.8}
            >
              <TextCustom style={s.modalCancelText} fontSize={15}>
                Hayır
              </TextCustom>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.modalConfirmBtn}
              onPress={confirmExit}
              activeOpacity={0.8}
            >
              <TextCustom style={s.modalConfirmText} fontSize={15}>
                Evet
              </TextCustom>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

  </View>
);
```

Note: The `<Modal>` is placed OUTSIDE `<SafeAreaView>` but INSIDE the root `<View>` so it renders over the entire screen including safe-area edges. This matches the pattern in `index.tsx`.

---

### Step 11 — Full rewrite of `assets/styles/quickGameStyle.js`

Delete every existing style. Replace with the following (all tokens from `constants/theme.ts`):

```js
import { StyleSheet } from "react-native";
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";

export const quickGameStyles = StyleSheet.create({
  // ── Layout shells ──────────────────────────────────────────────
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,      // 24
    paddingTop: Spacing.md,             // 12
    paddingBottom: Spacing.sm,          // 8
  },
  centeredFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,                    // 16
  },

  // ── Loading ────────────────────────────────────────────────────
  loadingText: {
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: Typography.family.bold,
    marginBottom: Spacing.sm,
  },
  loadingSubText: {
    color: Colors.text.secondary,
    textAlign: 'center',
    fontFamily: Typography.family.regular,
  },

  // ── Error ──────────────────────────────────────────────────────
  errorText: {
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: Typography.family.semibold,
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  retryButtonText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // ── Header row ─────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,          // 24
    gap: Spacing.sm,                   // 8
  },
  exitButton: {
    padding: Spacing.xs,               // 4 — hit-area padding
  },
  scoreBadge: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.md,     // 12
    paddingVertical: Spacing.xs,       // 4
    borderRadius: Radius.full,
    flex: 1,                           // takes remaining space left of timer
  },
  scoreBadgeText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    textAlign: 'center',
  },
  timerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.accent.cyan,
    backgroundColor: Colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCircleUrgent: {
    borderColor: Colors.wrong,
  },
  timerText: {
    color: Colors.accent.cyan,
    fontFamily: Typography.family.black,
  },
  timerTextUrgent: {
    color: Colors.wrong,
  },
  counterBadge: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  counterText: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
  },

  // ── Category badge ─────────────────────────────────────────────
  categoryBadgeWrap: {
    alignItems: 'center',
    marginBottom: Spacing.md,          // 12
  },
  categoryBadge: {
    backgroundColor: Colors.accent.purple,
    paddingHorizontal: Spacing.lg,     // 16
    paddingVertical: Spacing.xs,       // 4
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    letterSpacing: 0.8,
  },

  // ── Question card ──────────────────────────────────────────────
  questionCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,           // 20
    borderWidth: 1,
    borderColor: Colors.border.bright,
    padding: Spacing.xl,               // 24
    marginBottom: Spacing.xl,          // 24
    minHeight: 110,
    justifyContent: 'center',
  },
  questionText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    textAlign: 'center',
    lineHeight: 28,
  },

  // ── Answer options ─────────────────────────────────────────────
  optionsContainer: {
    flex: 1,
    gap: Spacing.sm,                   // 8 between options
    marginBottom: Spacing.lg,          // 16
  },
  optionWrapper: {
    // wraps Animated.View; opacity controlled by dimmed style
  },
  optionDimmed: {
    opacity: 0.5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 1.5,
    borderColor: Colors.border.default,
    borderRadius: Radius.md,           // 14
    paddingVertical: Spacing.md,       // 12
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,                   // 12
  },
  optionCorrect: {
    backgroundColor: Colors.correctBg,
    borderColor: Colors.correct,
  },
  optionWrong: {
    backgroundColor: Colors.wrongBg,
    borderColor: Colors.wrong,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterCorrect: {
    backgroundColor: Colors.correct,
  },
  optionLetterWrong: {
    backgroundColor: Colors.wrong,
  },
  optionLetterText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },
  optionText: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    flex: 1,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // ── Progress bar ───────────────────────────────────────────────
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border.white,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
  },

  // ── Exit confirm modal ─────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.bright,
    padding: Spacing.xxl,              // 32
    width: '100%',
    alignItems: 'center',
    gap: Spacing.xl,                   // 24
  },
  modalTitle: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,                   // 12
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.semibold,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.wrong,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // ── Game Over ──────────────────────────────────────────────────
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.bg.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreCircleNumber: {
    color: Colors.accent.gold,
    fontFamily: Typography.family.black,
    lineHeight: 56,
  },
  scoreCircleLabel: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    letterSpacing: 1.5,
  },
  resultSubtitle: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  coinsBadge: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent.gold,
    marginBottom: Spacing.xl,
  },
  coinsBadgeText: {
    color: Colors.accent.gold,
    fontFamily: Typography.family.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  resultButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: Spacing.lg,       // 16
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  primaryButtonText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },
  secondaryButton: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
  },
});
```

Export name stays `quickGameStyles` (same as current) so the import alias in `quick-game.jsx` (`as s`) is just for brevity inside the file.

---

### Step 12 — Remove dead code / clean up

Remove from `quick-game.jsx`:
- The old `quickGameStyles.bg`, `quickGameStyles.overlay`, `quickGameStyles.container` references (replaced by `s.root`, `s.safeArea`, `s.centeredFill`)
- Any `ImageBackground` import (already removed in Step 1)

Rename the import alias in `quick-game.jsx` from:
```js
import { quickGameStyles } from "../../assets/styles/quickGameStyle";
```
to:
```js
import { quickGameStyles as s } from "../../assets/styles/quickGameStyle";
```
then use `s.xxx` throughout to keep lines short.

---

### Step 13 — Verify dependency arrays

After all changes, the hook dependency arrays must be updated:

`handleAnswerSelect` deps: `[currentQuestion, selectedAnswer, soundsReady, handleNextQuestion, animateOptionPress]`

`handleNextQuestion` deps: `[currentQuestionIndex, questions.length, soundsReady]` — unchanged.

`restartGame` deps: `[]` — unchanged.

`handleExitPress` deps: `[]`

`confirmExit` deps: `[router]`

`cancelExit` deps: `[]`

`animateOptionPress` deps: `[scaleAnims]`

---

## Risks and Edge Cases

| Risk | Mitigation |
|---|---|
| `scaleAnims` array length mismatch if question has != 4 options | The `useRef` initializes 4 values; if `options.length > 4` the extra options get no scale anim. Acceptable — current data always has 4 options. Add a guard: `scaleAnims[index] ?? new Animated.Value(1)` in the map. |
| `playSound('gameOver')` called inside `setTimeLeft` updater (closure) | `soundsReady` is captured by the interval effect closure; the effect re-runs when `soundsReady` changes, so the closure is always fresh. No stale closure issue. |
| `confirmExit` unmounts component while sounds still playing | `unloadSounds` runs on unmount (existing cleanup). The 200ms `setTimeout` in `confirmExit` gives the `modal` sound time to play before unmount. |
| `exitModalVisible` pausing timer | The exit modal does NOT pause the timer — game continues in the background. This is acceptable for this sprint. A future plan can add a `paused` state. |
| `LinearGradient` `colors` prop type | Must be a tuple with at least 2 strings. `BG_GRADIENT` is a plain `string[]`; if TypeScript complains, cast as `const` or annotate `as [string, string, string]`. Since this is a `.jsx` file, not `.tsx`, no TypeScript annotation is needed. |
| `coinsBadgeText` uses inline `fontSize` (not `TextCustom`) | `coinsBadgeText` contains an emoji (`🪙`). `TextCustom` can render emoji but the font may not display it. Using plain `Text` for `coinsBadgeText` is safer — matches the same pattern used for emoji text in `index.tsx` (`RewardCell` uses plain `Text`). |
| `primaryButton` uses `LinearGradient` inside `TouchableOpacity` | `overflow: 'hidden'` on `primaryButton` is required for `borderRadius` to clip the gradient correctly on Android. The style already includes it. |

---

## Validation Commands

Run these after implementation, from the project root (`c:\projects\expoApp`):

```powershell
# 1. ESLint
npx expo lint

# 2. TypeScript (catches cross-file type errors even from .jsx files via tsconfig paths)
npx tsc --noEmit

# 3. Start dev server and visually check all 4 states on Android emulator
npm run android
```

Manual checklist to verify visually:
- [ ] Loading screen: dark gradient bg, Nunito text, no white image flash
- [ ] Error screen: retry button plays button sound, reloads questions
- [ ] Playing screen: exit button (top-left) opens modal, modal "Hayır" stays in game, "Evet" navigates back
- [ ] Playing screen: timer counts down, turns red at <=5, tick sound at <=6
- [ ] Playing screen: selecting correct answer shows green card + green letter circle
- [ ] Playing screen: selecting wrong answer shows red card + red letter circle + correct answer turns green
- [ ] Playing screen: unselected options dim to 0.5 opacity after selection
- [ ] Playing screen: answer press triggers scale 0.97→1.0 animation
- [ ] Playing screen: timer reaching 0 plays gameOver sound then advances question
- [ ] Game over screen: score circle with gold border, correct count subtitle, coins badge, gradient "Tekrar Oyna" button, elevated "Ana Menü" button
- [ ] Game over screen: both buttons play button sound
- [ ] Progress bar: thin 4px bar, fills with brand.primary color
