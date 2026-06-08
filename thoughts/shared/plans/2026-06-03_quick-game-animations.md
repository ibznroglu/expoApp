# Quick Game Entrance Animations Plan
Date: 2026-06-03

## Goal

Add entrance animations to `app/game/quick-game.jsx`. Header group slides in from top once (first question only). Every question transition: category pops in with scale+fade, question card fades up after 150ms delay, four option buttons stagger in with spring bounce. All `useNativeDriver: true`. No collision with existing `scaleAnims` (press scale) or `pulseAnim` (timer pulse).

---

## Files to Change

- `app/game/quick-game.jsx` — all changes confined here

---

## Step 1 — New Animated.Value refs

Add immediately after the existing `scaleAnims` / `pulseAnim` block:

```js
const headerAnim            = useRef(new Animated.Value(0)).current;
const categoryScaleAnim     = useRef(new Animated.Value(0)).current;
const categoryOpacityAnim   = useRef(new Animated.Value(0)).current;
const questionOpacityAnim   = useRef(new Animated.Value(0)).current;
const questionTranslateAnim = useRef(new Animated.Value(20)).current;
const entranceOptionAnims   = useRef([
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0),
  new Animated.Value(0),
]).current;
```

`headerAnim` drives both `opacity` and `translateY` via `interpolate`. Others are single-purpose.

---

## Step 2 — Entrance trigger useEffect

Place after the woosh effect, deps: `[currentQuestionIndex, questions.length]`.

```js
useEffect(() => {
  if (questions.length === 0) return;

  // Reset per-question values
  categoryScaleAnim.setValue(0);
  categoryOpacityAnim.setValue(0);
  questionOpacityAnim.setValue(0);
  questionTranslateAnim.setValue(20);
  entranceOptionAnims.forEach(a => a.setValue(0));

  // Header only on first question
  if (currentQuestionIndex === 0) {
    headerAnim.setValue(0);
    Animated.timing(headerAnim, {
      toValue: 1, duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  // Per-question content
  Animated.parallel([
    Animated.parallel([
      Animated.timing(categoryScaleAnim,   { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(categoryOpacityAnim, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]),
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(questionOpacityAnim,   { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(questionTranslateAnim, { toValue: 0, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]),
    Animated.stagger(80,
      entranceOptionAnims.map(anim =>
        Animated.spring(anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true })
      )
    ),
  ]).start();
}, [currentQuestionIndex, questions.length]);
```

Import `Easing` — add to the existing `react-native` import.

---

## Step 3 — JSX changes

**3a. Header wrapper** — wrap `exitRow` + `headerCard` + `dotProgressRow` in one `Animated.View`:

```jsx
<Animated.View style={{
  opacity: headerAnim,
  transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-40,0] }) }],
}}>
  {/* exitRow, headerCard, dotProgressRow */}
</Animated.View>
```

**3b. categoryBlock** — change `View` → `Animated.View`:

```jsx
<Animated.View style={[s.categoryBlock, {
  opacity: categoryOpacityAnim,
  transform: [{ scale: categoryScaleAnim.interpolate({ inputRange:[0,1], outputRange:[0.8,1.0] }) }],
}]}>
```

**3c. questionCardWrapper** — change `View` → `Animated.View`:

```jsx
<Animated.View style={[s.questionCardWrapper, {
  opacity: questionOpacityAnim,
  transform: [{ translateY: questionTranslateAnim }],
}]}>
```

**3d. Option Animated.View** — extend existing transform array:

```jsx
<Animated.View
  key={index}
  style={[
    s.optionWrapper,
    {
      opacity: entranceOptionAnims[index] ?? entranceOptionAnims[0],
      transform: [
        { scale: scaleAnims[index] ?? scaleAnims[0] },
        { translateY: (entranceOptionAnims[index] ?? entranceOptionAnims[0]).interpolate({
            inputRange: [0,1], outputRange: [30,0]
        }) },
      ],
    },
    isCorrect && s.optionWrapperCorrect,
    isWrong   && s.optionWrapperWrong,
  ]}
>
```

> **Not:** `isDimmed && s.optionDimmed` bu `Animated.View`'dan kaldırılacak. Dimming yerine inner `TouchableOpacity`'e `style={{ opacity: isDimmed ? 0.5 : 1 }}` ekle — Animated native-driver opacity ile çakışmaz.

---

## Step 4 — restartGame reset

`setCurrentQuestionIndex(0)` çağrısından sonra ekle:

```js
headerAnim.setValue(0);
categoryScaleAnim.setValue(0);
categoryOpacityAnim.setValue(0);
questionOpacityAnim.setValue(0);
questionTranslateAnim.setValue(20);
entranceOptionAnims.forEach(a => a.setValue(0));
```

---

## Risks

| Risk | Fix |
|---|---|
| `optionDimmed` opacity + Animated.Value conflict | Remove `s.optionDimmed` from Animated.View, add `opacity: isDimmed ? 0.5 : 1` to inner TouchableOpacity |
| `questionCardWrapper` flex:1 | Animated.View supports flex; only opacity/transform added |
| Options < 4 or > 4 | Use `entranceOptionAnims[index] ?? entranceOptionAnims[0]` guard |

---

## Validation

```bash
npm run lint
```

Manual test checklist:
1. Q1: header slides in from top, category pops in, question fades up, options A→B→C→D stagger in
2. Q2+: header stays fixed, content animates in again
3. "Tekrar Oyna": new game's Q1 plays header slide-in again
4. Fast tap during entrance: press-scale feedback still works
5. Timer timeout → Q2 transition triggers all animations
