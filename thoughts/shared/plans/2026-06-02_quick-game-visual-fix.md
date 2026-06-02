## Goal

Three targeted visual fixes to `app/game/quick-game.jsx` and `assets/styles/quickGameStyle.js`.
The full redesign (see `2026-06-02_quick-game-redesign.md`) is already live. These are incremental
corrections on top of it — no structural rewrites, no logic changes.

1. **Bottom spacing / layout balance** — `optionsContainer` has `flex: 1` but the answer buttons
   are naturally small (paddingVertical 12), so the 4 options never fill the available space and
   leave a large white gap between the last option and the progress bar. Fix: constrain option
   height so options are evenly distributed, and pin the progress bar to the bottom with correct
   margin.

2. **Exit button redesign** — Current: bare `Ionicons close-circle` at 28 px, `Colors.text.secondary`
   (70% white), tiny tap area. Target: circular filled button, `Colors.wrong` (#EF4444) background,
   white "close" icon, fixed 36×36 size, clearly tappable without changing its position in the
   header row.

3. **Background gradient upgrade** — Current: `['#2D1B69', '#1A0A4A', '#0D0527']` (muted
   dark-purple to near-black). Target: add a warm indigo mid-stop for more visual depth and
   game-feel vibrancy: `['#3D1A7A', '#22107A', '#130850', '#080320']`.

---

## Files to Change

| File | Changes |
|---|---|
| `c:\projects\expoApp\assets\styles\quickGameStyle.js` | `exitButton`, `exitButtonCircle` (new), `optionWrapper`, `optionButton`, `optionsContainer` |
| `c:\projects\expoApp\app\game\quick-game.jsx` | `BG_GRADIENT` constant, exit button JSX |

## Files to Create

None.

---

## Implementation Steps

### Step 1 — Update `BG_GRADIENT` in `app/game/quick-game.jsx`

Line 26 of the current file:
```js
const BG_GRADIENT = ['#2D1B69', '#1A0A4A', '#0D0527'];
```

Replace with a 4-stop gradient:
```js
const BG_GRADIENT = ['#3D1A7A', '#22107A', '#130850', '#080320'];
```

This single constant is already consumed identically in all four render branches (loading, error,
gameCompleted, playing) via `<LinearGradient colors={BG_GRADIENT} ...>`, so no other JSX change
is needed for this fix.

The stops progress from saturated violet-purple → deep indigo → dark navy → near-black, giving a
richer depth gradient that reads as "game" without becoming unreadably dark.

---

### Step 2 — Redesign exit button JSX in `app/game/quick-game.jsx`

Locate the header row exit button block (lines 305–307):
```jsx
<TouchableOpacity onPress={handleExitPress} style={s.exitButton} activeOpacity={0.7}>
  <Ionicons name="close-circle" size={28} color={Colors.text.secondary} />
</TouchableOpacity>
```

Replace with:
```jsx
<TouchableOpacity onPress={handleExitPress} style={s.exitButton} activeOpacity={0.75}>
  <View style={s.exitButtonCircle}>
    <Ionicons name="close" size={18} color={Colors.text.primary} />
  </View>
</TouchableOpacity>
```

Key changes:
- Icon switches from `"close-circle"` (self-contained icon with built-in circle) to `"close"`
  (plain X), because the circle is now provided by the `exitButtonCircle` View.
- Icon size reduced from 28 to 18 (the surrounding circle is 36 px, giving 9 px padding on each
  side which feels balanced).
- Icon color changes from `Colors.text.secondary` (70% white, low contrast) to
  `Colors.text.primary` (pure white), since it now sits on a colored background.
- No import changes needed — `Ionicons` and `Colors` are already imported.

---

### Step 3 — Update `exitButton` and add `exitButtonCircle` in `quickGameStyle.js`

Current `exitButton` (line 61–63):
```js
exitButton: {
  padding: Spacing.xs,
},
```

Replace `exitButton` with a minimal hit-target wrapper, and add `exitButtonCircle` as a new key
directly after it:

```js
exitButton: {
  // Outer touchable — keeps the 44 px minimum hit area via padding around the circle
  padding: Spacing.xs,          // 4 px — keeps total tap area ~44 px
},
exitButtonCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: Colors.wrong,          // #EF4444
  justifyContent: 'center',
  alignItems: 'center',
},
```

No other style keys in the header section need to change. The circle sits in the same flex slot
(leftmost item in the `flexDirection: 'row'` header, before `scoreBadge` which has `flex: 1`).

---

### Step 4 — Fix `optionsContainer` to avoid bottom gap

**Root cause**: `optionsContainer` has `flex: 1`, which gives all remaining vertical space to the
options list. With only 4 options of fixed natural height (~52 px each + 8 px gap), the remaining
space inside the flex container sits unused below the last option. The progress bar immediately
below has its own `marginBottom: Spacing.lg` already absorbed into `safeArea.paddingBottom`.

**Fix strategy**: Remove `flex: 1` from `optionsContainer` and instead give each `optionWrapper`
equal vertical expansion using `flex: 1` + a `justifyContent: 'center'` on the button. This
distributes the available height evenly across 4 options without overflow.

Change `optionsContainer` in `quickGameStyle.js`:
```js
optionsContainer: {
  // Remove flex: 1
  flexGrow: 1,          // still takes available space
  gap: Spacing.sm,      // 8 px between options — keep
  marginBottom: Spacing.md,   // reduce from Spacing.lg (16) to Spacing.md (12)
  // justifyContent: 'space-between' NOT needed — flex:1 children distribute evenly
},
```

Change `optionWrapper` (currently empty `{}`):
```js
optionWrapper: {
  flex: 1,              // each option takes equal share of container height
  // Note: this style is applied directly to the Animated.View element via style prop
},
```

Change `optionButton` — add `flex: 1` so the touchable fills the wrapper height:
```js
optionButton: {
  flex: 1,              // ADD — fills optionWrapper height
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.bg.surface,
  borderWidth: 1.5,
  borderColor: Colors.border.default,
  borderRadius: Radius.md,
  paddingVertical: Spacing.md,
  paddingHorizontal: Spacing.md,
  gap: Spacing.md,
},
```

**Result**: The 4 option buttons together now fill the entire remaining screen height between the
question card and the progress bar, with equal spacing. Options are never shorter than their
content because `paddingVertical: Spacing.md` provides a minimum internal height.

**Progress bar position**: The progress bar (`progressTrack`) is the last element in `SafeAreaView`
before close. It has no explicit margin — it sits after `optionsContainer`. With
`safeArea.paddingBottom: Spacing.sm` (8 px) the bar has 8 px clearance from the screen bottom
edge. No change needed to `progressTrack` itself.

---

### Step 5 — Reduce `safeArea` bottom padding for tighter progress-bar pinning

Current `safeArea.paddingBottom: Spacing.sm` (8 px) is already minimal. Verify it is not
`Spacing.lg` (16) or larger in the actual file. If it is larger, reduce to `Spacing.sm` (8).
No change needed if it is already `Spacing.sm`.

---

## Risks and Edge Cases

| Risk | Mitigation |
|---|---|
| `optionWrapper: { flex: 1 }` on an `Animated.View` — RN may not distribute flex correctly inside a non-flex parent | `optionsContainer` uses `flexGrow: 1` which makes it a flex container; its direct children (`Animated.View` wrapping `optionWrapper`) inherit flex correctly in RN New Architecture. |
| Very long question text expanding `questionCard` and causing `optionsContainer` to shrink below readable height | `questionCard` has `minHeight: 110` but no `maxHeight`. On small screens this could squeeze options. Acceptable for this sprint — no data validation change is in scope. |
| 4-stop `LinearGradient` on older Android (API < 26) | `expo-linear-gradient` handles multi-stop gradients down to API 21. No issue. |
| Exit button circle clips content on very small screens | The circle is fixed 36×36 inside a flex row; the `scoreBadge` with `flex: 1` absorbs remaining width. The circle will never be compressed. |
| `Ionicons name="close"` vs `"close-outline"` — both exist | Use `"close"` (filled/bold weight). `"close-outline"` is thinner and less visible on a colored background. |
| `Colors.wrong` (#EF4444) for exit button may be confused with "wrong answer" feedback | This is a known UX tension. The red circle is a universal "close/exit" signal (iOS nav pattern). The wrong-answer state is communicated by border + background on the option card, not by isolated red circles in the header. Acceptable. |

---

## Validation Commands

Run from `c:\projects\expoApp` after implementation:

```powershell
# Lint
npx expo lint

# Type check (catches cross-file issues)
npx tsc --noEmit

# Start dev server
npm run android
```

Manual visual checklist:

- [ ] Gradient is noticeably more vibrant (visible purple mid-stop) in all 4 screen states
- [ ] Exit button is a filled red circle with white X, clearly visible against the gradient header
- [ ] Tapping the exit button area (including 4 px padding) opens the confirm modal reliably
- [ ] 4 answer options fill the vertical space between question card and progress bar with no large blank gap below
- [ ] Progress bar sits at the bottom of the safe area with ~8 px clearance, not floating mid-screen
- [ ] Options do not overflow or clip — all text is visible even on 5.5" screen (iPhone SE / small Android)
- [ ] Game-over, loading, and error screens all share the updated gradient (single `BG_GRADIENT` constant)
