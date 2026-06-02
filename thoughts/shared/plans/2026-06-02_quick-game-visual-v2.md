## Goal

Apply three visual improvements to the playing state of `app/game/quick-game.jsx`:

1. Move the exit button out of the header row into its own dedicated top row (left-aligned, circle background, `arrow-back` icon).
2. Add a large category icon (Ionicons, 48px) in a circular container above the question card, with the existing category badge text underneath it.
3. Add a disabled joker row at the bottom of `gameContent` (50/50, 2x puan, Pas geç), all at opacity 0.5, with a "Yakında" label.

No logic changes. Only the playing state JSX and its style keys in `quickGameStyle.js` are affected. Loading, error, and game-over states are untouched.

---

## Files to Change

| File | What changes |
|---|---|
| `c:\projects\expoApp\app\game\quick-game.jsx` | Playing-state JSX: split header, add category icon block, add joker row |
| `c:\projects\expoApp\assets\styles\quickGameStyle.js` | Add new style keys; adjust existing `header` and `exitButton` keys |

## Files to Create

None.

---

## Implementation Steps

### Step 1 — Add `CATEGORY_ICON_MAP` constant in `quick-game.jsx`

Insert this pure constant immediately before the `export default function QuickGame()` line (after the `BG_GRADIENT` constant, line 26):

```js
const CATEGORY_ICON_MAP = {
  'coğrafya':    'earth-outline',
  'tarih':       'book-outline',
  'bilim':       'flask-outline',
  'spor':        'football-outline',
  'edebiyat':    'library-outline',
};

function getCategoryIcon(category) {
  if (!category) return 'bulb-outline';
  const key = category.toLowerCase().trim();
  return CATEGORY_ICON_MAP[key] ?? 'bulb-outline';
}
```

### Step 2 — Restructure the playing-state JSX in `quick-game.jsx`

The playing-state return (lines 297–453) currently has this structure inside `<SafeAreaView>`:

```
<View style={s.header}>          ← contains exitButton + scoreBadge + timerCircle + counterBadge
<View style={s.progressTrack}>
<View style={s.categoryBadgeWrap}>
<View style={s.gameContent}>
  <View style={s.questionCard}>
  <View style={s.optionsContainer}>
```

Replace it with:

```
{/* Exit row — standalone, above everything */}
<View style={s.exitRow}>
  <TouchableOpacity onPress={handleExitPress} style={s.exitBtn} activeOpacity={0.75}>
    <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
  </TouchableOpacity>
</View>

{/* Header row — score | timer | counter (no exit button) */}
<View style={s.header}>
  <View style={s.scoreBadge}>
    <TextCustom style={s.scoreBadgeText} fontSize={14}>
      {score} Puan
    </TextCustom>
  </View>
  <View style={[s.timerCircle, timeLeft <= 5 && s.timerCircleUrgent]}>
    <TextCustom style={[s.timerText, timeLeft <= 5 && s.timerTextUrgent]} fontSize={22}>
      {timeLeft}
    </TextCustom>
  </View>
  <View style={s.counterBadge}>
    <TextCustom style={s.counterText} fontSize={14}>
      {currentQuestionIndex + 1}/{questions.length}
    </TextCustom>
  </View>
</View>

{/* Progress bar */}
<View style={s.progressTrack}>
  <View style={[s.progressFill, { width: `${(currentQuestionIndex / questions.length) * 100}%` }]} />
</View>

{/* Category icon + badge */}
<View style={s.categoryBlock}>
  <View style={s.categoryIconCircle}>
    <Ionicons
      name={getCategoryIcon(currentQuestion.category)}
      size={48}
      color={Colors.text.primary}
    />
  </View>
  <View style={s.categoryBadge}>
    <TextCustom style={s.categoryBadgeText} fontSize={11}>
      {currentQuestion.category?.toLocaleUpperCase('tr-TR') ?? 'GENEL KÜLTÜR'}
    </TextCustom>
  </View>
</View>

{/* Question + Options + Jokers */}
<View style={s.gameContent}>

  {/* Question card */}
  <View style={s.questionCard}>
    <TextCustom style={s.questionText} fontSize={19}>
      {currentQuestion.question}
    </TextCustom>
  </View>

  {/* Answer options */}
  <View style={s.optionsContainer}>
    {/* ... unchanged option map ... */}
  </View>

  {/* Joker row */}
  <View style={s.jokerSection}>
    <TextCustom style={s.jokerSoonLabel} fontSize={11}>
      YAKINDA
    </TextCustom>
    <View style={s.jokerRow}>

      <View style={s.jokerItem}>
        <View style={s.jokerBtn}>
          <Ionicons name="help-circle-outline" size={28} color={Colors.text.primary} />
        </View>
        <TextCustom style={s.jokerLabel} fontSize={10}>50/50</TextCustom>
      </View>

      <View style={s.jokerItem}>
        <View style={s.jokerBtn}>
          <Ionicons name="flash-outline" size={28} color={Colors.text.primary} />
        </View>
        <TextCustom style={s.jokerLabel} fontSize={10}>2x Puan</TextCustom>
      </View>

      <View style={s.jokerItem}>
        <View style={s.jokerBtn}>
          <Ionicons name="play-skip-forward-outline" size={28} color={Colors.text.primary} />
        </View>
        <TextCustom style={s.jokerLabel} fontSize={10}>Pas Geç</TextCustom>
      </View>

    </View>
  </View>

</View>{/* end gameContent */}
```

Key structural notes:
- The old `s.categoryBadgeWrap` wrapper View is replaced by `s.categoryBlock`.
- The old `s.exitButton` TouchableOpacity is removed from `s.header`; a new `s.exitRow` View + `s.exitBtn` TouchableOpacity replaces it above the header.
- `onPress` for the exit button remains `handleExitPress` (unchanged).
- The option-map block (lines 361–409) is copied verbatim — no changes inside it.

### Step 3 — Update `quickGameStyle.js`: remove old keys, add new keys

#### 3a. Remove / rename existing keys

- `exitButton` → rename to `exitBtn` (new shape: circle, not rounded rectangle).
- `categoryBadgeWrap` → rename to (remove; replaced by `categoryBlock`).

#### 3b. Modify `header` key

Remove left/right padding or `flex:1` assumptions. The header now contains only 3 items: `scoreBadge` (flex:1), `timerCircle`, `counterBadge`. No change to the `flexDirection`/`gap`/`alignItems` values needed — just confirm no hard-coded width expects the exit button.

Current `header`:
```js
header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: Spacing.md,
  gap: Spacing.sm,
},
```
This is fine as-is — no change needed.

#### 3c. Add new style keys after the existing `header`/`exitButton` block

```js
// Exit row (standalone above header)
exitRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: Spacing.sm,
},
exitBtn: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(255,255,255,0.15)',
  justifyContent: 'center',
  alignItems: 'center',
},

// Category block (icon + badge, centered, above question card)
categoryBlock: {
  alignItems: 'center',
  marginBottom: Spacing.md,
  gap: Spacing.sm,
},
categoryIconCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: 'rgba(255,255,255,0.1)',
  justifyContent: 'center',
  alignItems: 'center',
},

// Joker section
jokerSection: {
  alignItems: 'center',
  gap: Spacing.sm,
  opacity: 0.5,
  marginTop: Spacing.sm,
},
jokerSoonLabel: {
  color: Colors.text.muted,
  fontFamily: Typography.family.bold,
  letterSpacing: 1.2,
},
jokerRow: {
  flexDirection: 'row',
  gap: Spacing.xl,
  justifyContent: 'center',
},
jokerItem: {
  alignItems: 'center',
  gap: Spacing.xs,
},
jokerBtn: {
  width: 56,
  height: 56,
  borderRadius: Radius.md,
  backgroundColor: Colors.bg.elevated,
  borderWidth: 1,
  borderColor: Colors.border.bright,
  justifyContent: 'center',
  alignItems: 'center',
},
jokerLabel: {
  color: Colors.text.secondary,
  fontFamily: Typography.family.semibold,
  textAlign: 'center',
},
```

#### 3d. Keep all existing keys unchanged

`scoreBadge`, `scoreBadgeText`, `timerCircle`, `timerCircleUrgent`, `timerText`, `timerTextUrgent`, `counterBadge`, `counterText`, `categoryBadge`, `categoryBadgeText`, `gameContent`, `questionCard`, `questionText`, `optionsContainer`, `optionWrapper`, `optionDimmed`, `optionButton`, `optionCorrect`, `optionWrong`, `optionLetter`, `optionLetterCorrect`, `optionLetterWrong`, `optionLetterText`, `optionText`, `optionTextSelected`, `progressTrack`, `progressFill`, `modalOverlay`, `modalCard`, `modalTitle`, `modalButtons`, `modalCancelBtn`, `modalCancelText`, `modalConfirmBtn`, `modalConfirmText`, `scoreCircle`, `scoreCircleNumber`, `scoreCircleLabel`, `resultSubtitle`, `coinsBadge`, `coinsBadgeText`, `resultButtons`, `primaryButton`, `primaryButtonGradient`, `primaryButtonText`, `secondaryButton`, `secondaryButtonText` — all unchanged.

### Step 4 — Verify no orphaned JSX references

After edits, do a quick grep to confirm:
- `s.exitButton` → 0 occurrences in `quick-game.jsx` (replaced by `s.exitBtn`).
- `s.categoryBadgeWrap` → 0 occurrences in `quick-game.jsx` (replaced by `s.categoryBlock`).
- `s.exitRow`, `s.exitBtn`, `s.categoryBlock`, `s.categoryIconCircle`, `s.jokerSection`, `s.jokerSoonLabel`, `s.jokerRow`, `s.jokerItem`, `s.jokerBtn`, `s.jokerLabel` → each referenced exactly once in JSX and defined once in styles.

---

## Risks and Edge Cases

| Risk | Mitigation |
|---|---|
| Vertical overflow on small screens (e.g. 5.4" SE) — adding icon block + joker row increases total height | `gameContent` has `flex:1` and `justifyContent:'flex-start'`; on short screens the joker row may be clipped. If overflow is observed, wrap joker section in `ScrollView` or reduce `jokerBtn` to 48×48 and drop the `jokerSoonLabel`. |
| Category string does not exactly match map keys (e.g. leading/trailing spaces, mixed case) | `getCategoryIcon` calls `.toLowerCase().trim()` before lookup, so this is handled. |
| `currentQuestion.category` is `null` or `undefined` | `getCategoryIcon` returns `'bulb-outline'` for falsy input; the badge text falls back to `'GENEL KÜLTÜR'` via the existing `??` operator — no change needed. |
| Removing `s.exitButton` from styles while it still exists in JSX | The plan renames both JSX ref (`s.exitButton` → `s.exitBtn`) and style key together. Grep validation in Step 4 catches any mismatch. |
| `Ionicons` `play-skip-forward-outline` name validity | This is a valid Ionicons v5/v6 name. If running an older `@expo/vector-icons`, fall back to `arrow-forward-outline`. |

---

## Validation Commands

Run these from `c:\projects\expoApp` in PowerShell after implementation:

```powershell
# 1. Lint — must pass with 0 errors
npm run lint

# 2. Verify no orphaned style references in the game file
# (each should return 0 matches)
rg "s\.exitButton" app/game/quick-game.jsx
rg "s\.categoryBadgeWrap" app/game/quick-game.jsx

# 3. Verify new keys exist in styles file
rg "exitBtn|exitRow|categoryBlock|categoryIconCircle|jokerSection|jokerRow|jokerItem|jokerBtn|jokerLabel|jokerSoonLabel" assets/styles/quickGameStyle.js

# 4. Verify CATEGORY_ICON_MAP and getCategoryIcon exist in component
rg "CATEGORY_ICON_MAP|getCategoryIcon" app/game/quick-game.jsx

# 5. Start dev server and verify on device/emulator
npm start
```
