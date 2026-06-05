## Goal

Apply a premium neon visual overhaul to the quick-game playing screen. Five areas are upgraded: background gradient, timer circle glow + urgent pulse animation, category icon block gradient, answer button neon borders and glow, and per-joker color theming. No timer logic, no new packages, no theme file changes.

---

## Files to Change

- `app/game/quick-game.jsx`
- `assets/styles/quickGameStyle.js`

---

## Implementation Steps

### Step 1 — Background: upgrade BG_GRADIENT and add cyan radial overlay (quick-game.jsx)

**1a.** Replace BG_GRADIENT at line 26:
```js
const BG_GRADIENT = ['#4A1E8A', '#2D1280', '#150960', '#080325', '#030115'];
```

**1b.** In the main playing branch return block, add a second LinearGradient after the existing one:
```jsx
<LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
<LinearGradient
  colors={['rgba(0,212,255,0.07)', 'transparent']}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 0.5 }}
  style={StyleSheet.absoluteFill}
  pointerEvents="none"
/>
```

### Step 2 — Timer pulse animation (quick-game.jsx)

**2a.** After scaleAnims ref (line 55), add:
```js
const pulseAnim = useRef(new Animated.Value(1)).current;
const pulseLoopRef = useRef(null);
```

**2b.** Add useEffect after the two timer effects (after line 166):
```js
useEffect(() => {
  if (timeLeft <= 5 && timeLeft > 0 && selectedAnswer === null && !gameCompleted) {
    pulseLoopRef.current?.stop();
    pulseLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 300, useNativeDriver: true }),
      ])
    );
    pulseLoopRef.current.start();
  } else {
    if (pulseLoopRef.current) {
      pulseLoopRef.current.stop();
      pulseLoopRef.current = null;
    }
    pulseAnim.setValue(1);
  }
}, [timeLeft, selectedAnswer, gameCompleted]);
```

**2c.** In the JSX header, replace the `<View style={[s.timerCircle, ...]}>` block (line 331) with an `Animated.View` — preserve the inner TextCustom exactly:
```jsx
<Animated.View
  style={[
    s.timerCircle,
    timeLeft <= 5 && s.timerCircleUrgent,
    { transform: [{ scale: pulseAnim }] },
  ]}
>
  <TextCustom
    style={[s.timerText, timeLeft <= 5 && s.timerTextUrgent]}
    fontSize={22}
  >
    {timeLeft}
  </TextCustom>
</Animated.View>
```

### Step 3 — Timer circle glow shadow (quickGameStyle.js)

Update `timerCircle`:
```js
timerCircle: {
  width: 56,
  height: 56,
  borderRadius: 28,
  borderWidth: 3,
  borderColor: Colors.accent.cyan,
  backgroundColor: Colors.bg.elevated,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#00D4FF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 16,
  elevation: 12,
},
```

Update `timerCircleUrgent`:
```js
timerCircleUrgent: {
  borderColor: Colors.wrong,
  shadowColor: Colors.wrong,
},
```

### Step 4 — Category icon block: LinearGradient wrapper

**4a.** In quickGameStyle.js, update `categoryIconCircle` (remove backgroundColor, add border + glow + overflow hidden):
```js
categoryIconCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: '#00D4FF',
  shadowColor: '#00D4FF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 14,
  elevation: 10,
  overflow: 'hidden',
},
```

Add new `categoryIconGradient` style:
```js
categoryIconGradient: {
  width: 80,
  height: 80,
  borderRadius: 40,
  justifyContent: 'center',
  alignItems: 'center',
},
```

**4b.** In quick-game.jsx, replace the `categoryIconCircle` View with a two-layer structure to avoid iOS shadow clipping. The outer `View` carries the shadow/border/glow; the inner `LinearGradient` clips the gradient to the circle via `overflow: 'hidden'`:

```jsx
{/* Outer view carries border + glow shadow (no overflow:hidden so iOS shadow renders) */}
<View style={s.categoryIconOuter}>
  {/* Inner gradient clips to circle */}
  <LinearGradient
    colors={['rgba(0,212,255,0.25)', 'rgba(155,89,245,0.35)']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={s.categoryIconGradient}
  >
    <Ionicons
      name={getCategoryIcon(currentQuestion.category)}
      size={48}
      color={Colors.text.primary}
    />
  </LinearGradient>
</View>
```

Update **4a** styles accordingly — split into two style keys:
```js
categoryIconOuter: {
  width: 80,
  height: 80,
  borderRadius: 40,
  borderWidth: 2,
  borderColor: '#00D4FF',
  shadowColor: '#00D4FF',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.7,
  shadowRadius: 14,
  elevation: 10,
},
categoryIconGradient: {
  width: 76,   // 80 - 2*borderWidth to fill inside the border
  height: 76,
  borderRadius: 38,
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
},
```

Remove `categoryIconCircle` from the stylesheet entirely (replaced by `categoryIconOuter` + `categoryIconGradient`). Update the `categoryBadge` reference in JSX — it follows the icon block, no change needed there.

### Step 5 — Answer buttons: neon border + glow (quickGameStyle.js + quick-game.jsx)

**5a.** Update `optionButton` — change borderColor:
```js
borderColor: Colors.border.bright,   // was Colors.border.default
```

**5b.** Update `optionWrapper` — add purple glow. `backgroundColor: 'transparent'` is required so Android `elevation` renders (elevation is a no-op without a backgroundColor on the same view):
```js
optionWrapper: {
  height: 64,
  borderRadius: Radius.md,
  backgroundColor: 'transparent',
  shadowColor: '#9B59F5',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 8,
  elevation: 6,
},
```

**5c.** Add two new styles:
```js
optionWrapperCorrect: {
  shadowColor: '#22C55E',
  shadowOpacity: 0.7,
  shadowRadius: 12,
  elevation: 10,
},
optionWrapperWrong: {
  shadowColor: '#EF4444',
  shadowOpacity: 0.7,
  shadowRadius: 12,
  elevation: 10,
},
```

**5d.** Update `optionLetter` backgroundColor:
```js
backgroundColor: 'rgba(155,89,245,0.25)',   // was Colors.bg.elevated
```

**5e.** In quick-game.jsx, update Animated.View in options.map():
```jsx
<Animated.View
  key={index}
  style={[
    s.optionWrapper,
    { transform: [{ scale: scaleAnims[index] ?? scaleAnims[0] }] },
    isDimmed && s.optionDimmed,
    isCorrect && s.optionWrapperCorrect,
    isWrong   && s.optionWrapperWrong,
  ]}
>
```

### Step 6 — Joker buttons: per-joker colors (quickGameStyle.js + quick-game.jsx)

**6a.** Strip backgroundColor and borderColor from `jokerBtn` in quickGameStyle.js:
```js
jokerBtn: {
  width: 56,
  height: 56,
  borderRadius: Radius.md,
  borderWidth: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
```

**6b.** In quick-game.jsx replace the three joker View blocks with inline-styled versions:
```jsx
{/* 50/50 — cyan */}
<View style={[s.jokerBtn, { backgroundColor: 'rgba(0,188,212,0.2)', borderColor: '#00BCD4' }]}>
  <Ionicons name="help-circle-outline" size={28} color="#00BCD4" />
</View>

{/* 2x Puan — gold */}
<View style={[s.jokerBtn, { backgroundColor: 'rgba(255,215,0,0.15)', borderColor: Colors.accent.gold }]}>
  <Ionicons name="flash-outline" size={28} color={Colors.accent.gold} />
</View>

{/* Pas Geç — orange */}
<View style={[s.jokerBtn, { backgroundColor: 'rgba(255,107,53,0.2)', borderColor: Colors.brand.primary }]}>
  <Ionicons name="play-skip-forward-outline" size={28} color={Colors.brand.primary} />
</View>
```

---

## Risks and Edge Cases

- `overflow: 'hidden'` on categoryIconCircle clips iOS shadow — if glow is invisible, move shadow to an outer wrapper View.
- `pulseAnim.setValue(1)` resets synchronously in else-branch — safe, no re-render triggered.
- `pointerEvents="none"` on cyan overlay gradient — required so touches pass through.
- BG_GRADIENT change automatically applies to loading/error/gameOver branches (shared constant).

---

## Validation Commands

```powershell
npm run lint
npm run android
```

Manual QA checklist:
1. Richer purple-to-black gradient with faint cyan top glow
2. Timer circle has cyan glow; at ≤5s turns red + pulses (1.0→1.05)
3. Pulse stops when answer is selected
4. Category icon shows cyan-to-purple gradient fill with cyan border + glow
5. Answer buttons show brighter purple border + purple glow
6. Correct answer wrapper glow → green; wrong → red
7. Jokers: 50/50=cyan, 2x=gold, Pas=orange; row still dimmed at 0.5
8. Loading/game-over screens visually consistent (richer BG_GRADIENT)
9. No Animated + useNativeDriver warnings
