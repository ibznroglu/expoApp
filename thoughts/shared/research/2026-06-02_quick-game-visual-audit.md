# Quick-Game Screen Visual Audit

**Date:** 2026-06-06  
**Files audited:** `app/game/quick-game.jsx`, `assets/styles/quickGameStyle.js`, `constants/theme.ts`, `package.json`

---

## 1. Current Visual Elements & Styles

### Background
- `LinearGradient` with `BG_GRADIENT = ['#3D1A7A', '#22107A', '#130850', '#080320']`
- 4-stop deep purple-to-black, covers full screen via `StyleSheet.absoluteFill`
- **Issue:** Monotone dark gradient, no visual texture or depth variation

### Exit Button
- 44×44 circle, `rgba(255,255,255,0.15)` background
- Ionicons `arrow-back` at size 22
- **Issue:** Acceptable; could get a subtle border

### Score / Counter Badges
- Score: `Colors.brand.primary` (#FF6B35 orange), `Radius.full`
- Counter: `Colors.bg.elevated` (#321F72), `Radius.full`
- **Issue:** Score badge solid orange is fine; counter is very plain dark

### Timer Circle
- 56×56, `borderWidth: 3`, `borderColor: Colors.accent.cyan` (#00D4FF)
- Urgent state (≤5s): border/text switches to `Colors.wrong` (#EF4444)
- `backgroundColor: Colors.bg.elevated`
- **No shadow/glow at all** — looks flat against the background
- **Issue:** No glow, no pulsing — the most important UI element looks flat

### Progress Bar
- 6px height track (`rgba(255,255,255,0.15)`) with `Colors.brand.primary` fill
- **Issue:** Acceptable as-is; brand orange fill reads clearly

### Category Block
- `categoryIconCircle`: 80×80, `rgba(255,255,255,0.1)` background, `borderRadius: 40`
- Ionicons at size 48, `Colors.text.primary` (white)
- `categoryBadge`: `Colors.accent.purple` (#9B59F5) pill
- **Issue:** Icon circle is near-transparent with no border or glow — looks like a ghost circle. The icon floats without visual containment. Too plain.

### Question Card
- `Colors.bg.card` (#231450), `borderColor: Colors.border.bright` (rgba purple 0.4), `borderWidth: 1`
- `minHeight: 110`, `Radius.lg`
- **Issue:** Acceptable; question card reads well

### Answer Option Buttons
- Height 64, `Colors.bg.surface` (#2A1960) background
- `borderWidth: 1.5`, `borderColor: Colors.border.default` (rgba purple 0.2)
- Letter circle: 32×32, `Colors.bg.elevated`
- Correct state: `Colors.correctBg` bg + `Colors.correct` (#22C55E) border
- Wrong state: `Colors.wrongBg` bg + `Colors.wrong` (#EF4444) border
- Scale animation on press (0.97 → 1.0 via `Animated`)
- **Issue:** `Colors.border.default` is nearly invisible (rgba purple 0.2). Buttons look flat and indistinguishable from the background. No neon/glow treatment.

### Joker Buttons (visual only, disabled)
- Section `opacity: 0.5`
- All three joker btns: 56×56, `Colors.bg.elevated` bg, `borderColor: Colors.border.bright`, `Radius.md`
- Ionicons at 28, white
- **Issue:** All identical dark purple — no per-joker color differentiation. Boring even for a "coming soon" preview.

---

## 2. Timer Implementation

Two-effect pattern (fixes async state race on New Architecture):

```js
// Effect 1: Tick — decrements to 0
setInterval → setTimeLeft(prev => prev <= 1 ? 0 : prev - 1)
// plays 'tick' sound when prev <= 6

// Effect 2: Timeout detection — watches timeLeft === 0
useEffect([timeLeft]) → if (timeLeft === 0) handleNextQuestion()
```

Timer resets to 15 on each new question. Pauses when `selectedAnswer !== null` or `gameCompleted`.

---

## 3. Available Libraries (not yet used in quick-game)

| Library | Use case for visual upgrade |
|---|---|
| `expo-blur` (`BlurView`) | Frosted glass on option buttons or category block |
| `react-native-reanimated` v4 | Smooth glow pulse on timer, spring animations |
| `react-native-svg` | Custom SVG ring for timer, star/glow decorations |
| `expo-haptics` | Haptic feedback on answer select (tactile polish) |
| `expo-linear-gradient` | Already imported; can wrap individual buttons/jokers |
| RN shadow props | `shadowColor`/`shadowRadius`/`elevation` — glow on any View |

---

## 4. Enhancement Opportunities (no functionality broken)

### High Impact

**A. Answer buttons — neon border glow**
- Increase `borderColor` to `Colors.border.bright` (rgba purple 0.4) or higher
- Add `shadowColor: Colors.accent.purple`, `shadowRadius: 8–12`, `elevation: 6`
- Letter circle: give it a subtle `Colors.accent.purple` bg instead of plain elevated
- Result: buttons pop off the dark background

**B. Timer circle — glowing ring**
- Add shadow/glow: `shadowColor: Colors.accent.cyan`, `shadowRadius: 16`, `shadowOpacity: 0.7`, `elevation: 12`
- Urgent state: glow switches to `Colors.wrong` red
- Optional: inner background as a radial from semi-transparent cyan to elevated
- Result: timer becomes the focal point it should be

**C. Category icon block — premium treatment**
- Replace `rgba(255,255,255,0.1)` with a `LinearGradient` wrapper (cyan-to-purple radial-ish via `start`/`end`)
- Add a colored border: `borderWidth: 2`, `borderColor: Colors.accent.cyan`
- Add glow shadow matching the border color
- Result: icon block becomes a distinct visual anchor

**D. Joker buttons — per-joker color**
- 50/50: teal/cyan accent (`#00BCD4`)
- 2x Puan: gold/amber (`Colors.accent.gold`)
- Pas Geç: brand orange (`Colors.brand.primary`)
- Each gets its own `borderColor` and subtle `backgroundColor` (10–15% opacity tint of that color)
- Keep overall `opacity: 0.5` on the section (still disabled/coming-soon)

### Medium Impact

**E. Background — richer gradient**
- Add a 5th stop or shift midpoints: `['#4A1E8A', '#2D1280', '#150960', '#080325', '#030115']`
- Or add a subtle radial highlight at top-center by layering an extra `LinearGradient` with `start={x:0.5, y:0}` → `end={x:0.5, y:0.4}` in cyan at low opacity (0.05–0.08)

**F. Question card — subtle glow border**
- Add `shadowColor: Colors.accent.purple`, `shadowRadius: 10`, `elevation: 8` to `questionCard`
- Increases depth hierarchy between card and background

### Low Impact

**G. Score badge — gradient fill instead of flat orange**
- Wrap score badge content in `LinearGradient colors={Colors.brand.gradient}`
- Matches the primary button treatment already used on game-over screen

**H. Progress bar fill — gradient**
- Replace solid `Colors.brand.primary` with `LinearGradient` (horizontal, orange→gold)

---

## 5. Constraints & Risks

- **New Architecture (Fabric):** `elevation` works on Android; shadow props work on iOS. Both needed for cross-platform glow.
- **`expo-blur`:** Works on iOS natively; on Android requires Expo SDK 54+ (current: 54.0.25) — check Android behavior.
- **`react-native-reanimated` v4:** Breaking changes vs v3; only use if needed — existing `Animated` is fine for scale.
- **Overflow:** Adding glow shadows (`elevation`) to option buttons requires removing `overflow: 'hidden'` from parent containers.
- **Performance:** Shadow on 4 buttons × repeated renders is fine; avoid adding shadows to items inside `FlatList` at high scroll velocity.
- **Joker section opacity:** The entire `jokerSection` has `opacity: 0.5`. Per-joker colors still show through (opacity applies to the rendered output, not individual fills).
