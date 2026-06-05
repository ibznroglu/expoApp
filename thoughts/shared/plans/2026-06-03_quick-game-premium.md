## Goal

Upgrade the quick-game screen (`app/game/quick-game.jsx` + `assets/styles/quickGameStyle.js`) to match a premium neon space-blue reference design. Changes: richer background glows, unified dark header card with SVG gradient arc timer, dot progress indicators, brighter question card border, stronger answer button neon borders with cyan selected-state, and larger colored joker buttons with count badges.

## Files to Change

- `app/game/quick-game.jsx` — JSX structure, new imports (Svg/Circle from react-native-svg), new TimerArc component, revised header, dot progress, revised joker section
- `assets/styles/quickGameStyle.js` — add/modify style keys for all changed sections

## Implementation Steps

### Step 1 — Add SVG import to `quick-game.jsx`

After the existing `expo-linear-gradient` import, add:

```js
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
```

Also add `Typography` to the theme import:
```js
import { Colors, Typography } from "../../constants/theme";
```

---

### Step 2 — Create `TimerArc` component (inside file, above `QuickGame`)

SVG math constants:
- Canvas: 96×96, center `cx={48}` `cy={48}`, radius `r={40}`, `strokeWidth={5}`
- `CIRCUMFERENCE = 251.33` (2π×40)
- Arc depletes clockwise from 12-o'clock via `transform="rotate(-90, 48, 48)"`
- `strokeDasharray={CIRCUMFERENCE}`
- `strokeDashoffset={CIRCUMFERENCE * (1 - timeLeft / 15)}`
- Gradient: blue `#4FC3F7` → orange `#FF8C00` → red `#FF4136`
- Urgent (timeLeft ≤ 5): arc stroke solid `#FF4136` (skip gradient)

```jsx
const CIRCUMFERENCE = 251.33;

function TimerArc({ timeLeft }) {
  const offset = CIRCUMFERENCE * (1 - timeLeft / 15);
  const isUrgent = timeLeft <= 5;
  return (
    <View style={s.timerArcWrapper}>
      <Svg width={96} height={96}>
        <Defs>
          <SvgLinearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4FC3F7" />
            <Stop offset="0.5" stopColor="#FF8C00" />
            <Stop offset="1" stopColor="#FF4136" />
          </SvgLinearGradient>
        </Defs>
        {/* track */}
        <Circle cx={48} cy={48} r={40} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={0} />
        {/* arc */}
        <Circle
          cx={48} cy={48} r={40} fill="none"
          stroke={isUrgent ? '#FF4136' : 'url(#timerGrad)'}
          strokeWidth={5}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90, 48, 48)"
        />
      </Svg>
      <View style={s.timerArcCenter}>
        <TextCustom style={s.timerArcNumber} fontSize={26}>{timeLeft}</TextCustom>
        <TextCustom style={s.timerArcLabel} fontSize={9}>saniye</TextCustom>
      </View>
    </View>
  );
}
```

---

### Step 3 — Redesign header JSX in `quick-game.jsx`

Replace `<View style={s.header}>` block with:

```jsx
<View style={s.headerCard}>
  <View style={s.headerSection}>
    <TextCustom style={s.headerLabel} fontSize={10}>PUAN</TextCustom>
    <TextCustom style={s.headerValue} fontSize={22}>{score}</TextCustom>
  </View>

  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
    <TimerArc timeLeft={timeLeft} />
  </Animated.View>

  <View style={[s.headerSection, { alignItems: 'flex-end' }]}>
    <TextCustom style={s.headerLabel} fontSize={10}>SORU</TextCustom>
    <TextCustom style={s.headerValue} fontSize={22}>
      {currentQuestionIndex + 1}
      <TextCustom style={s.headerValueDim} fontSize={16}>/{questions.length}</TextCustom>
    </TextCustom>
  </View>
</View>
```

Remove old `scoreBadge`, `timerCircle` (Animated.View), `counterBadge` blocks.

---

### Step 4 — Replace progress bar with dot row in `quick-game.jsx`

Replace `<View style={s.progressTrack}>` block with:

```jsx
<View style={s.dotProgressRow}>
  {Array.from({ length: questions.length }).map((_, i) => (
    <View
      key={i}
      style={[
        s.progressDot,
        i < currentQuestionIndex && s.progressDotAnswered,
        i === currentQuestionIndex && s.progressDotCurrent,
      ]}
    />
  ))}
</View>
```

---

### Step 5 — Upgrade background glows in `quick-game.jsx`

Replace the second `LinearGradient` overlay (current cyan overlay) with two new overlays in all render branches (playing, loading, gameOver):

```jsx
{/* Purple glow — top-left */}
<LinearGradient
  colors={['rgba(138,43,226,0.35)', 'transparent']}
  start={{ x: 0, y: 0 }}
  end={{ x: 0.7, y: 0.7 }}
  style={StyleSheet.absoluteFill}
  pointerEvents="none"
/>
{/* Blue glow — bottom-right */}
<LinearGradient
  colors={['transparent', 'rgba(0,120,220,0.28)']}
  start={{ x: 0.3, y: 0.3 }}
  end={{ x: 1, y: 1 }}
  style={StyleSheet.absoluteFill}
  pointerEvents="none"
/>
```

---

### Step 6 — New `quickGameStyle.js` header card styles

Add (and remove old `scoreBadge`, `scoreBadgeText`, `timerCircle`, `timerCircleUrgent`, `timerText`, `timerTextUrgent`, `counterBadge`, `counterText`):

```js
headerCard: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(20,10,55,0.85)',
  borderRadius: Radius.lg,
  borderWidth: 1.5,
  borderColor: 'rgba(155,89,245,0.45)',
  paddingHorizontal: Spacing.xl,
  paddingVertical: Spacing.md,
  marginBottom: Spacing.md,
  shadowColor: '#9B59F5',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.35,
  shadowRadius: 16,
  elevation: 8,
},
headerSection: {
  alignItems: 'flex-start',
  minWidth: 64,
},
headerLabel: {
  color: Colors.text.muted,
  fontFamily: Typography.family.bold,
  letterSpacing: 1.5,
  marginBottom: 2,
},
headerValue: {
  color: Colors.accent.gold,
  fontFamily: Typography.family.black,
},
headerValueDim: {
  color: Colors.text.secondary,
  fontFamily: Typography.family.semibold,
},
timerArcWrapper: {
  width: 96,
  height: 96,
  justifyContent: 'center',
  alignItems: 'center',
},
timerArcCenter: {
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
timerArcNumber: {
  color: Colors.text.primary,
  fontFamily: Typography.family.black,
  lineHeight: 30,
},
timerArcLabel: {
  color: Colors.text.muted,
  fontFamily: Typography.family.semibold,
  letterSpacing: 0.5,
},
```

---

### Step 7 — Dot progress styles in `quickGameStyle.js`

Replace `progressTrack` / `progressFill` with:

```js
dotProgressRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 6,
  marginBottom: Spacing.md,
},
progressDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(255,255,255,0.18)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.25)',
},
progressDotAnswered: {
  backgroundColor: Colors.accent.purple,
  borderColor: Colors.accent.purple,
},
progressDotCurrent: {
  backgroundColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  shadowColor: '#FFFFFF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.9,
  shadowRadius: 6,
  elevation: 4,
},
```

---

### Step 8 — Question card brighter neon border in `quickGameStyle.js`

Modify `questionCard`:
```js
questionCard: {
  backgroundColor: Colors.bg.card,
  borderRadius: Radius.lg,
  borderWidth: 1.5,
  borderColor: '#9B59F5',
  padding: Spacing.xl,
  minHeight: 110,
  justifyContent: 'center',
  shadowColor: '#9B59F5',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 14,
  elevation: 10,
},
```

---

### Step 9 — Answer button styles in `quickGameStyle.js` + JSX

Modify `optionButton`:
```js
borderWidth: 2,
borderColor: 'rgba(155,89,245,0.8)',
```

Modify `optionLetter`:
```js
backgroundColor: 'rgba(155,89,245,0.6)',
```

Add new key:
```js
optionButtonSelected: {
  borderColor: '#00D4FF',
  borderWidth: 2,
},
```

In `quick-game.jsx`, update the `TouchableOpacity` style array:
```jsx
style={[
  s.optionButton,
  isSelected && !isCorrect && !isWrong && s.optionButtonSelected,
  isCorrect && s.optionCorrect,
  isWrong && s.optionWrong,
]}
```

---

### Step 10 — Joker redesign in `quickGameStyle.js` + JSX

Update `jokerSection` opacity from `0.5` → `0.85`. Update `jokerBtn` width/height from 56 → 72. Add `jokerCountBadge` + `jokerCountText` styles:

```js
jokerSection: { alignItems: 'center', gap: Spacing.sm, opacity: 0.85, marginTop: Spacing.sm },
jokerBtn: { width: 72, height: 72, borderRadius: Radius.md, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
jokerCountBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
jokerCountText: { color: Colors.text.primary, fontFamily: Typography.family.bold },
```

JSX — replace joker buttons:
```jsx
{/* x2 CIFTE SANS */}
<View style={s.jokerItem}>
  <View style={[s.jokerBtn, { backgroundColor: 'rgba(155,89,245,0.25)', borderColor: Colors.accent.purple }]}>
    <TextCustom style={{ color: Colors.accent.purple, fontFamily: Typography.family.black }} fontSize={20}>x2</TextCustom>
  </View>
  <TextCustom style={s.jokerLabel} fontSize={10}>ÇİFTE ŞANS</TextCustom>
  <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
</View>

{/* 50:50 */}
<View style={s.jokerItem}>
  <View style={[s.jokerBtn, { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: Colors.accent.gold }]}>
    <Ionicons name="bulb-outline" size={30} color={Colors.accent.gold} />
  </View>
  <TextCustom style={s.jokerLabel} fontSize={10}>50:50</TextCustom>
  <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
</View>

{/* SORU GEC */}
<View style={s.jokerItem}>
  <View style={[s.jokerBtn, { backgroundColor: 'rgba(0,212,255,0.12)', borderColor: Colors.accent.cyan }]}>
    <Ionicons name="play-skip-forward-outline" size={30} color={Colors.accent.cyan} />
  </View>
  <TextCustom style={s.jokerLabel} fontSize={10}>SORU GEÇ</TextCustom>
  <View style={s.jokerCountBadge}><TextCustom style={s.jokerCountText} fontSize={10}>2</TextCustom></View>
</View>
```

---

## Risks and Edge Cases

- **SVG gradient on Android**: `url(#timerGrad)` SVG gradient references work on Android with react-native-svg v13+. Verify the installed version. If gradient fails, fallback to solid `#9B59F5` stroke.
- **`strokeDashoffset` direction**: with `rotate(-90)`, offset=0 → full arc; offset=CIRCUMFERENCE → empty. Formula `CIRCUMFERENCE * (1 - timeLeft/15)` is correct.
- **Header height on small screens**: 96dp timer + padding ≈ 116dp header. On devices < 640dp usable height, jokers may be cut off. Reduce `timerArcWrapper` to 80dp if needed.
- **`pulseAnim` on SVG**: native driver handles the `scale` transform — SVG does not re-render per frame. Safe.
- **`progressTrack`/`progressFill` removal**: grep for references before deleting.
- **`optionButtonSelected` cyan timing**: only briefly visible (wrong answer selection during 1s reveal window). Correct answer immediately gets `optionCorrect` style.
- **`SvgLinearGradient` alias**: must not conflict with `expo-linear-gradient`'s `LinearGradient`. Alias must be declared in the import.
- **`Typography` import**: currently not imported in `quick-game.jsx` — Step 1 adds it.

## Validation Commands

```powershell
npm run lint
npm run android
```

Manual QA:
1. Purple glow top-left, blue glow bottom-right visible on dark bg
2. Header card: dark neon-bordered card, PUAN (gold) left, arc timer center, SORU right
3. Arc depletes clockwise from 12-o'clock; urgent (≤5s) turns solid red; pulses
4. 10 dots below header: current=white glow, answered=purple, remaining=dim
5. Question card has bright purple border + glow shadow
6. Option buttons: strong purple border; tap shows cyan border briefly; correct=green, wrong=red
7. Jokers 72×72, ÇİFTE ŞANS=purple, 50:50=gold, SORU GEÇ=cyan, each has count badge "2"
8. Timer timeout still advances question; exit modal still works; game-over screen renders
9. No useNativeDriver warnings
