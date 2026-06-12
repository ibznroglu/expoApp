# Plan: QuickGame Option Restyle + Joker Count Badge Relocation

Date: 2026-06-11
Research basis: direct read of `app/game/quick-game.jsx`, `assets/styles/quickGameStyle.js`, `constants/theme.ts`

## Goal

Two visual restyles on the quick-game screen, with zero regression to the existing answer-feedback (correct/wrong) appearance and to all existing animations:

1. **Option restyle** — replace the hardcoded purple option border and purple letter badge with a gold→orange `LinearGradient` border + gradient letter badge (matching the existing `questionCardGradientBorder` structural pattern). Correct/wrong feedback states must remain pixel-identical to today.
2. **Joker count badge relocation** — move the "2" count badge from below each joker label to the top-right corner of the `jokerBtn`, using a vivid distinct color (red-orange) so it stands out from the three joker accent colors (purple / gold / cyan).

## Files to Change

| File | Change |
|------|--------|
| `constants/theme.ts` | Add `Colors.gradients.option` and `Colors.accent.badge` tokens. No existing token modified. |
| `assets/styles/quickGameStyle.js` | Add option gradient-border + gradient letter-badge styles; restructure `jokerBtn`/`jokerCountBadge` for top-right absolute positioning; adjust letter text color. |
| `app/game/quick-game.jsx` | Wrap each option in a conditional `LinearGradient` border (default/selected only) + gradient letter badge; move joker count badge inside `jokerBtn`. |

### Files NOT to Change
- `services/questionService.js`, `utils/sound.js`, `context/AuthContext.js`, `lib/appwrite.js`
- Any other screen or style file.
- Do NOT modify existing theme tokens — only append two new ones.
- Do NOT change game logic, timers, animation timing, or the answer-handling callbacks.

### Important environment note
The theme file is **`constants/theme.ts`** (TypeScript), not `theme.js`. The `as const` assertions are valid TS and match the existing `gradient` / `brandButton` token style already in the file.

---

## Phase 1 — Add theme tokens

**File:** `constants/theme.ts`

**Step 1.1** — Inside the existing `gradients` object, append a new key after `brandButton`:
```ts
option: ['#FFD700', '#FF8C00'] as const,
```
Result:
```ts
gradients: {
  background: ['#2D1B69', '#1A0A4A', '#0D0527'] as const,
  brandButton: ['#FF6B35', '#FFB800'] as const,
  option: ['#FFD700', '#FF8C00'] as const,
},
```

**Step 1.2** — Inside the existing `accent` object, append:
```ts
badge: '#FF4500',
```
Result:
```ts
accent: {
  purple: '#9B59F5',
  purpleLight: '#B47EFF',
  cyan: '#00D4FF',
  gold: '#FFD700',
  goldDark: '#E5B800',
  badge: '#FF4500',
},
```

**Token overlap note:** `#FF4500` and `#FF8C00` also appear in `Colors.modes.quick` (line 53 of `constants/theme.ts`) as `from`/`to` mode-indicator colors. The new tokens are intentionally separate: `gradients.option` drives horizontal option borders (a different UI role), and `accent.badge` drives a count badge (different role). They may diverge in a future restyle. Do not replace with `Colors.modes.quick.*` references — the semantic split is intentional. The hardcoded `'#FF8C00'` at `app/game/quick-game.jsx` line 71 (inside `TimerArc` SVG gradient) shares the same value; replacing it is out of scope for this restyle.

**Phase 1 validation:** `npx tsc --noEmit` passes; no existing token altered.

---

## Phase 2 — Option gradient border restyle

### 2A. Style changes — `assets/styles/quickGameStyle.js`

Current structure: `optionWrapper` (Animated.View, height + shadow) → `optionButton` (TouchableOpacity, dark fill + purple border) → `optionLetter` + `optionText`.

New structure for default/selected: `optionWrapper` (Animated.View, unchanged) → **`optionGradientBorder`** (LinearGradient, padding varies by state) → `optionButtonInner` (TouchableOpacity, dark fill, NO border). For correct/wrong: keep using the existing `optionButton` with its solid border (no gradient wrapper).

**Exact default vs selected distinction — same gold→orange colors in both states:**
| | Default | Selected |
|---|---|---|
| Gradient border thickness | `padding: 1.5` | `padding: 2.5` (via `optionGradientBorderSelected` override) |
| `Animated.View` shadow | existing purple (`#9B59F5`, opacity 0.5, radius 8) from `optionWrapper` | gold glow (`Colors.accent.gold`, opacity 0.85, radius 14) via `optionWrapperSelected` |
| Option text | `optionText` (regular, secondary color) | `optionTextSelected` (bold, white) — already exists |
| Gradient colors | `Colors.gradients.option` | `Colors.gradients.option` — **no color change** |

**Step 2A.1** — Add base gradient-border style (default, 1.5px thickness):
```js
optionGradientBorder: {
  height: '100%',
  padding: 1.5,
  borderRadius: Radius.md,
  overflow: 'hidden',
},
```

**Step 2A.1b** — Add selected override style (2.5px thickness, applied alongside `optionGradientBorder` in a style array):
```js
optionGradientBorderSelected: {
  padding: 2.5,
},
```
The inner button uses `borderRadius: Radius.md - 2` — a value that works cleanly for both 1.5px and 2.5px border thicknesses (the 0.5px rounding difference is invisible at this scale).

**Step 2A.2** — Add `optionButtonInner` — same as `optionButton` but WITHOUT `borderWidth`/`borderColor` (the gradient supplies the border):
```js
optionButtonInner: {
  flexDirection: 'row',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  backgroundColor: Colors.bg.surface,
  borderRadius: Radius.md - 2,
  paddingHorizontal: Spacing.md,
  gap: Spacing.md,
},
```

**Step 2A.3** — Keep `optionButton`, `optionButtonSelected`, `optionCorrect`, `optionWrong`, `optionLetterCorrect`, `optionLetterWrong` exactly as-is. These remain the correct/wrong solid path.

**Step 2A.4** — Add `optionWrapperSelected` gold glow (applied to the `Animated.View`, matching the same slot `optionWrapperCorrect`/`optionWrapperWrong` use):
```js
optionWrapperSelected: {
  shadowColor: Colors.accent.gold,
  shadowOpacity: 0.85,
  shadowRadius: 14,
  elevation: 12,
},
```

**Step 2A.5** — Add a gradient letter-badge container style (keep existing `optionLetter` for the correct/wrong path):
```js
optionLetterGradient: {
  width: 32,
  height: 32,
  borderRadius: 16,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
},
```

**Step 2A.6** — Add dark-text variant for the gradient badge letter (contrast against gold/orange):
```js
optionLetterTextOnGradient: {
  color: Colors.bg.primary,
  fontFamily: Typography.family.bold,
},
```

### 2B. Render changes — `app/game/quick-game.jsx` (the `.map` block)

**Step 2B.1** — Keep the `Animated.View` outer wrapper and its computed flags (`isSelected`, `isCorrect`, `isWrong`, `isDimmed`, `letterLabel`) unchanged. Add `isSelected && !isFeedback && s.optionWrapperSelected` to the wrapper's style array alongside the existing `optionWrapperCorrect` / `optionWrapperWrong` entries (define `isFeedback` first — see Step 2B.2). The entrance/scale animation stays exactly as-is.

**Step 2B.2** — Introduce a boolean inside the map body:
```jsx
const isFeedback = isCorrect || isWrong;
```

**Step 2B.3** — Branch the render:

**When `isFeedback` is true** — render the EXISTING markup unchanged: the `TouchableOpacity` with `s.optionButton` + `s.optionCorrect`/`s.optionWrong`, the `View` with `s.optionLetter` + `s.optionLetterCorrect`/`s.optionLetterWrong`, and `s.optionLetterText`. Pixel-identical feedback path. Keep `{ opacity: isDimmed ? 0.5 : 1 }` on the `TouchableOpacity` as before.

**When `isFeedback` is false** — render the new gradient path. `isSelected` is applied by adding `s.optionGradientBorderSelected` to the wrapper's style array (thicker border) and `s.optionWrapperSelected` to the outer `Animated.View` (gold glow). Same `Colors.gradients.option` in both states:
```jsx
<LinearGradient
  colors={Colors.gradients.option}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={[
    s.optionGradientBorder,
    isSelected && s.optionGradientBorderSelected,
    { opacity: isDimmed ? 0.5 : 1 },
  ]}
>
  <TouchableOpacity
    style={s.optionButtonInner}
    onPress={() => handleAnswerSelect(index)}
    disabled={selectedAnswer !== null}
    activeOpacity={0.85}
  >
    <LinearGradient
      colors={Colors.gradients.option}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={s.optionLetterGradient}
    >
      <TextCustom style={s.optionLetterTextOnGradient} fontSize={13}>
        {letterLabel}
      </TextCustom>
    </LinearGradient>
    <TextCustom
      style={[s.optionText, isSelected && s.optionTextSelected]}
      fontSize={15}
    >
      {option}
    </TextCustom>
  </TouchableOpacity>
</LinearGradient>
```

**Step 2B.4** — `isDimmed` handling: apply `opacity: 0.5` to the **outermost gradient wrapper** (`optionGradientBorder`) so the gradient border + dark fill dim together. In the feedback path keep `{ opacity: isDimmed ? 0.5 : 1 }` on the `TouchableOpacity` as before.

**Step 2B.5** — Selected state is conveyed by three layered signals, all within gold→orange:
1. **Thicker border**: `optionGradientBorderSelected` (`padding: 2.5`) merged into the gradient wrapper style array — the gradient strip is visibly wider.
2. **Gold glow**: `optionWrapperSelected` shadow on the `Animated.View` — the entire option card radiates gold.
3. **Bold white text**: `optionTextSelected` on the option text — already exists, no change needed.

The old cyan `optionButtonSelected` border is not used in the gradient path (it lives in the `isFeedback` branch for backward compatibility only, where it is also not referenced — harmless). Green/red remain the only color departure from gold→orange.

**Phase 2 validation:** Manual — (a) default options show gold→orange border at 1.5px thickness + gradient letter badge with dark letter text; (b) selected option shows visibly thicker 2.5px gold→orange border + gold glow shadow + bold white text, still the same gold→orange color; (c) tapping a wrong/correct answer renders the exact green/red solid border + solid badge as before (pixel-identical, no gradient); (d) non-selected options dim to 0.5 (border + fill together); (e) entrance slide-up + press scale animate unchanged.

---

## Phase 3 — Joker count badge relocation

### 3A. Style changes — `assets/styles/quickGameStyle.js`

**Step 3A.1** — Add `position: 'relative'` to `jokerBtn`:
```js
jokerBtn: {
  position: 'relative',
  width: Math.max(screenHeight * 0.085, 48),
  height: Math.max(screenHeight * 0.085, 48),
  borderRadius: Radius.md,
  borderWidth: 1.5,
  justifyContent: 'center',
  alignItems: 'center',
},
```
Keep the proportional sizing intact.

**Step 3A.2** — Replace the `jokerCountBadge` style with top-right absolute positioning + vivid color:
```js
jokerCountBadge: {
  position: 'absolute',
  top: -6,
  right: -6,
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: Colors.accent.badge,
  borderWidth: 1.5,
  borderColor: Colors.bg.primary,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
},
```
(`borderColor: Colors.bg.primary` gives a thin dark outline so the badge separates cleanly from the joker border underneath. Remove `marginTop: 2`.)

**Step 3A.3** — Verify `jokerCountText` uses white text (`Colors.text.primary`). No change needed if already correct.

**Step 3A.4** — `jokerItem` stays as-is (`alignItems: 'center'`, `gap: Spacing.xs`). With the badge absolutely positioned inside `jokerBtn`, the item only contains `jokerBtn` + `jokerLabel`; no vertical-alignment break.

### 3B. Render changes — `app/game/quick-game.jsx` (three joker item blocks)

For each of the three `jokerItem` blocks, **move** the `jokerCountBadge` `View` from below `jokerLabel` to **inside** the `jokerBtn` `View` (as its last child). Example for the x2 joker:
```jsx
<View style={s.jokerItem}>
  <View style={[s.jokerBtn, { backgroundColor: 'rgba(155,89,245,0.25)', borderColor: Colors.accent.purple }]}>
    <TextCustom style={{ color: Colors.accent.purple, fontFamily: Typography.family.black }} fontSize={20}>x2</TextCustom>
    <View style={s.jokerCountBadge}>
      <TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom>
    </View>
  </View>
  <TextCustom style={s.jokerLabel} fontSize={10}>ÇİFTE ŞANS</TextCustom>
</View>
```
Apply the identical move to the 50:50 joker and the SORU GEÇ joker: `jokerCountBadge` becomes a child of its `jokerBtn`, removed from after `jokerLabel`.

The existing inline `backgroundColor`/`borderColor` rgba on each `jokerBtn` stays as-is.

**Phase 3 validation:** Manual — each joker shows its count "2" as a red-orange circle overlapping the top-right corner of the button; color is clearly distinct from purple/gold/cyan; badge does not clip out of the scroll area; labels still center under buttons.

---

## Risks and Edge Cases

| Risk | Mitigation |
|------|-----------|
| Gradient wrapper breaks the grouped entrance/scale animation | The `Animated.View` (`optionWrapper`) stays the OUTERMOST element and still hosts `optionsEntranceAnim` + `scaleAnims`. The new `LinearGradient` is a static child inside it — animation untouched. |
| `LinearGradient` not imported in `quick-game.jsx` | Already imported at line 15 (`import { LinearGradient } from "expo-linear-gradient"`). No new import needed. |
| Feedback state accidentally wrapped in gradient | The `isFeedback` branch renders original `optionButton`/`optionCorrect`/`optionWrong` markup with NO gradient wrapper. Verify visually that green/red looks identical to pre-restyle. |
| Inner radius gap (gradient border bleeds at corners) | `optionButtonInner.borderRadius = Radius.md - 2` and `optionGradientBorder.overflow: 'hidden'` mirror the proven `questionCard`/`questionCardGradientBorder` pattern. (`Radius.md - 2` matches Step 2A.2's code block; the 0.5px difference from a 2.5px border is invisible at this scale.) |
| `isDimmed` opacity applied in wrong place | Gradient path: dim on outermost gradient wrapper. Feedback path: dim on `TouchableOpacity`. Both match prior behavior for their respective states. |
| Badge clipped by `jokerBtn` or scroll | `jokerBtn` has no `overflow: 'hidden'`; badge uses `zIndex: 2` and negative `top/right`. The joker row sits inside the ScrollView content with surrounding gap, so -6px overflow stays within bounds. Verify on small screens. |
| Badge color collides with joker accents | `Colors.accent.badge = '#FF4500'` (red-orange) is distinct from purple `#9B59F5`, gold `#FFD700`, cyan `#00D4FF`. Dark `bg.primary` outline further separates it. The same hex exists as `Colors.modes.quick.from` — intentional semantic split; see Phase 1 token overlap note. |
| `theme.ts` vs `theme.js` confusion | Tokens go in the existing `constants/theme.ts`. Both style file and screen already import from `../../constants/theme`. |
| Selected state indistinguishable from default | Three simultaneous signals prevent this: thicker gradient border (1.5→2.5px), gold glow shadow, bold white text. All three trigger together via `isFeedback` guard. |

---

## Validation Commands

```bash
npx tsc --noEmit
npm run lint
```

### Manual checklist (iOS + Android)
- [ ] Default options: gold→orange gradient border, gradient circular letter badge (A/B/C/D) with dark letter text.
- [ ] Tap an option: selected option shows visibly thicker gold→orange border (2.5px vs 1.5px) + gold glow shadow + bold white text. Same gold→orange gradient — no color change from default.
- [ ] Correct answer reveal: correct option shows the SAME green solid border + green solid badge + white letter as before restyle (pixel-identical).
- [ ] Wrong answer: chosen-wrong option shows the SAME red solid border + red solid badge as before.
- [ ] Non-selected options dim to ~0.5 (border + fill together) after an answer is locked.
- [ ] Entrance animation: options slide up + fade in on each new question (unchanged).
- [ ] Press feedback: options scale on tap (unchanged).
- [ ] Jokers: count "2" sits at top-right corner of each button as a red-orange circle, distinct from purple/gold/cyan, white text, not clipped.
- [ ] Joker labels still centered under their buttons; no vertical misalignment.
- [ ] Small-screen devices (`screenHeight < 700`): nothing clips, badges fully visible.
- [ ] `signup` and `verify-email` screens render unchanged.

---

## Running with Claude Code

Human drives phase transitions; one delegated step per turn; commit only when explicitly instructed.

PLAN_READY: thoughts/shared/plans/2026-06-11_quickgame-option-joker-restyle.md
