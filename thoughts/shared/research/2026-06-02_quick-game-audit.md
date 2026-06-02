# Quick Game Screen Audit
Date: 2026-06-02

## 1. Screen States

| State | Trigger | UI |
|---|---|---|
| `loading=true` | Initial mount, restartGame | Full-screen "Sorular yükleniyor..." text |
| `questions.length===0` | getQuestions returns [] | "Sorular yüklenemedi" + retry button |
| `gameCompleted=true` | Last question answered or timed out | resultCard with score + buttons |
| Playing | Default | Header + question + options + progress bar |

State variables:
- `questions[]` — loaded from Appwrite
- `currentQuestionIndex` — 0-based, drives `currentQuestion`
- `score` — +10 per correct, never decremented
- `timeLeft` — starts 15, counts down per second
- `selectedAnswer` — null or option index; null = unanswered
- `gameCompleted` — boolean
- `loading` — boolean
- `soundsReady` — boolean, true after initSounds resolves

## 2. Timer Logic

```
setInterval every 1000ms
  if prev <= 1 → handleNextQuestion(), reset to 15
  if prev <= 6 && soundsReady → playSound('tick')
  else → prev - 1
```

Timer runs only when: `currentQuestion` exists AND `!gameCompleted` AND `!loading` AND `selectedAnswer === null`.

**Bug**: when time runs out, it calls `handleNextQuestion()` but also returns `15` for the timeLeft state — the next question starts immediately with timeLeft=15 but the timer restarts from the effect dependency change, so this works but the reset is implicit.

**Missing**: no visual urgency (color change only, no animation on timer widget).

## 3. Answer Selection Flow

1. User taps option → `handleAnswerSelect(index)`
2. If `selectedAnswer !== null` → bail (already answered)
3. Set `selectedAnswer = index` → option styles update immediately
4. `stopSound('tick')` 
5. Correct → `score += 10`, `playSound('correct')` | Wrong → `playSound('wrong')`
6. `setTimeout(handleNextQuestion, 1000)` — 1 second delay for user to see result
7. `handleNextQuestion`: if more questions → increment index, reset answer+timer | else → `playSound('completed')`, set `gameCompleted=true`

**Missing**: no explanation shown after answer, no animation on correct/wrong feedback.

## 4. Sound Usage

| Sound key | When played |
|---|---|
| `tick` | Every second when timeLeft ≤ 6 |
| `tick` (stop) | On answer select |
| `correct` | Correct answer |
| `wrong` | Wrong answer |
| `completed` | All questions done (game won) |
| `gameOver` | **NEVER PLAYED** — imported but unused |
| `buttonClick`, `bubble`, `dailyPrize` | Not used in this screen |

`unloadSounds()` called on component unmount (cleanup).  
`initSounds()` called on mount (duplicate-safe due to `ready` flag).

## 5. Navigation Flow

- Entry: `router.push('/game/quick-game')` from home screen
- Exit: `router.back()` from "Ana Menü" button on game-over screen only
- **No exit button during play** — user is trapped unless they use OS back gesture

## 6. All Style Keys (quickGameStyle.js)

```
bg, overlay, container
loadingContainer, loadingText, loadingSubText
errorContainer, errorText, retryButton, retryButtonText
header, scoreContainer, timerContainer, questionCounter
scoreText, timerText, timerWarning, counterText
questionContainer, categoryBadge, questionText
optionsContainer, optionButton, selectedOption, correctOption, wrongOption
optionText, optionTextSelected
progressContainer, progressBar
resultCard, resultTitle, detailText
resultButtons, primaryButton, secondaryButton, buttonText, secondaryButtonText
```

Colors used: raw hex strings (`#FF8C00`, `#00C851`, `#FF4136`, etc.) — no theme tokens.  
Font: plain `fontWeight: 'bold'`, no Nunito family specified.  
Background: `ImageBackground` with remote Unsplash URL (network dependency, no fallback).

## 7. Missing UX Elements

| Missing | Priority |
|---|---|
| **Exit button + confirm modal** | Critical — user is trapped during play |
| **gameOver sound** — imported but never called | High — wasted asset |
| **LinearGradient background** — uses ImageBackground (URL) | High — fragile, no offline support |
| **Theme token usage** — all raw hex | Medium — inconsistency |
| **Nunito font** — not applied to game texts | Medium |
| **Timer animation** — no pulse/shake on urgency | Medium |
| **Answer feedback animation** — no scale/flash | Low |
| **Explanation panel** — currentQuestion.explanation exists but unused | Low |
| **Game over redesign** — plain card, no score breakdown, no visual celebration | High |
| **Progress bar animation** — instant width jump, no transition | Low |
| **Category badge styling** — plain text, no pill background | Low |

## 8. Available But Unused

- `currentQuestion.explanation` — returned by mapDoc, never displayed
- `playSound('gameOver')` — sound asset loaded, never called
- `TextCustom` — used only for question text; options use plain `Text`
- `expo-linear-gradient` — installed but not imported in this file
- `Ionicons` — not imported
- `constants/theme.ts` — not imported

## 9. Redesign Target

Replace `ImageBackground` + Unsplash URL with `LinearGradient` (theme bg colors).  
Add exit `Ionicons` button top-left → confirm modal (same pattern as reward modal in index.tsx).  
Apply `Typography.family` (Nunito) to all text.  
Use `Colors.*` tokens throughout.  
Wire `playSound('gameOver')` on timeout (time ran out without answering).  
Redesign game-over screen: large score circle, correct count, coins earned badge, two action buttons.
