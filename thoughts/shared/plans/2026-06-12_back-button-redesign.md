# BackButton Comic-Arrow Redesign + Modal-Stutter Fix

- Date: 2026-06-12
- Plan path: thoughts/shared/plans/2026-06-12_back-button-redesign.md

## Goal

Replace the current teal round chevron `BackButton` with a comic-style left-pointing
arrow-bullet silhouette drawn in `react-native-svg`, keeping all existing behavior
(sound, `onPress` default to `router.back()`, accessibility, press feedback). Separately,
fix a visible stutter that occurs in quick-game when pressing the back button opens the
exit `ConfirmModal`: the cause is JS-thread contention between BackButton's pressOut
`Animated.spring` and ConfirmModal's mount/entrance spring firing in the same frame
window. The fix replaces the pressOut spring with a fast native-driven `Animated.timing`
so press feedback completes well before the modal's entrance animation starts.

## Context (verified facts)

- `components/BackButton.tsx:22-86` — current component. Props: `onPress?`, `size = 44`,
  `style?`. Renders a round `LinearGradient` (`Colors.gradients.modal`) face with a
  `chevron-back` Ionicon plus a behind-offset depth `View`. Press feedback:
  - pressIn: `Animated.timing` scale → 0.92, 90ms, `useNativeDriver: true` (`:26-32`)
  - pressOut: `Animated.spring` scale → 1, friction 5, tension 140, native (`:34-41`)
  - press: `playUISound('button')` then `onPress?.()` else `router.back()` (`:43-50`)
  - `hitSlop={8}`, `accessibilityRole="button"`, `accessibilityLabel="Geri"` (`:59-61`)
- `app/(app)/game/quick-game.jsx:15` — `react-native-svg` already imported
  (`Svg, Circle, Defs, LinearGradient as SvgLinearGradient, Stop`) for TimerArc.
  Confirms the dependency renders in this app. Installed version ^15.15.5.
- `app/(app)/game/quick-game.jsx:321-323` — `handleExitPress` simply calls
  `setExitModalVisible(true)`. This synchronous state update is what mounts ConfirmModal.
- `app/(app)/game/quick-game.jsx:511-513` — `<BackButton onPress={handleExitPress} />`
  inside the exit row. This is the only BackButton whose `onPress` opens a modal.
- `app/(app)/game/quick-game.jsx:756-765` — `<ConfirmModal visible={exitModalVisible} ...>`.
- `components/ConfirmModal.tsx:43-66` — on `visible` becoming true it runs
  `playUISound('modal')` and an `Animated.parallel` of `Animated.spring(scale 0.9→1,
  friction 8, tension 100, native)` + `Animated.timing(opacity, 200ms, native)`. This
  spring is the competing animation. Modal uses `animationType="fade"`.
- `app/(app)/profile.tsx:65` — `<BackButton />` with no `onPress`, so it defaults to
  `router.back()` and unmounts the screen. No modal involved → no stutter to fix there,
  but the redesign must not regress its visual/behavior.
- `constants/theme.ts:27` — `Colors.accent.teal = '#00E5CC'` (matches the requested
  highlight color exactly).
- `constants/theme.ts:66` — `Colors.gradients.modal = ['#00E5CC', '#00B8D4', '#0091A7']`.
  So: `modal[1] = '#00B8D4'` (main fill) and `modal[2] = '#0091A7'` (shadow).
  All three target colors already exist as theme tokens — no hardcoding needed except
  the comic black stroke.

## Files to Change

- `components/BackButton.tsx` — full rewrite of render body (SVG arrow shape) + pressOut
  animation (spring → fast timing). Props signature preserved.

No other files change. `app/(app)/game/quick-game.jsx` and `app/(app)/profile.tsx` already
consume `<BackButton onPress={...} />` / `<BackButton />` and need no edits.

## Files to Create

None.

---

## PHASE 1 — Redesign BackButton.tsx as a comic-style arrow-bullet

### 1.1 Imports

Remove `LinearGradient` (expo-linear-gradient), `View`, `Ionicons`. Add `Svg, { Path }`
from `react-native-svg`. Add `Easing` from `react-native` (needed for Phase 2). Keep
`Animated, Pressable, StyleProp, ViewStyle`, `useRouter`, `Colors`, `playUISound`.

```ts
import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { playUISound } from '@/utils/sound';
```

### 1.2 Named color constants (module scope, above the component)

Map every color to an existing theme token; only the comic outline is a literal:

```ts
const ARROW_FILL      = Colors.gradients.modal[1]; // '#00B8D4' — mid-teal body
const ARROW_HIGHLIGHT = Colors.accent.teal;        // '#00E5CC' — leading-edge highlight
const ARROW_SHADOW    = Colors.gradients.modal[2]; // '#0091A7' — trailing-edge shadow
const COMIC_STROKE    = '#000000';                 // thick comic outline
```

### 1.3 Props interface and dimensions

```ts
interface BackButtonProps {
  onPress?: () => void;
  size?: number;    // backward compat — sets width; height scales to keep ratio
  width?: number;   // explicit width override
  height?: number;  // explicit height override
  style?: StyleProp<ViewStyle>;
}
```

Resolution order inside the component:
```ts
const w = width ?? size ?? 52;
const h = height ?? (size ? Math.round(size * 40 / 56) : 38);
```
ViewBox: `"0 0 56 40"`. Default 52×38 — wide left-pointing arrow that reads clearly
as "back". Height 38 is below 48px, so the Pressable carries `minHeight: 48` to satisfy
the touch-target requirement.

### 1.4 SVG path strings (the arrow-bullet silhouette)

Three stacked `<Path>` elements drawn back-to-front in the viewBox `0 0 56 40`:

```ts
// Solid left-pointing arrow: tip at (4,20), shaft to right edge x=52
const ARROW_BODY_PATH =
  'M4 20 L20 6 L20 14 L52 14 L52 26 L20 26 L20 34 Z';

// Bright leading-edge highlight — a wedge hugging the pointed left tip
const ARROW_HIGHLIGHT_PATH =
  'M4 20 L20 6 L20 12 L9 20 L20 28 L20 34 Z';

// Dark shadow sliver along the bottom/right of the shaft
const ARROW_SHADOW_PATH =
  'M20 26 L52 26 L52 28 L20 28 Z M20 26 L20 34 L17 31 Z';
```

Geometry of `ARROW_BODY_PATH`:
- `M4 20` — left tip (pointed, vertically centered at y=20)
- `L20 6` — up-right to top of arrowhead
- `L20 14` — down to top of shaft
- `L52 14` — right along shaft top to flat right edge
- `L52 26` — down the right edge
- `L20 26` — left along shaft bottom
- `L20 34` — down to bottom of arrowhead
- `Z` — close back to tip

Body coordinates stay inset from the 0–56/0–40 bounds (min x=4, max x=52, min y=6,
max y=34) so `strokeWidth 3.5` stays fully inside the viewBox with no clipping.

Implementer may nudge highlight/shadow Y values ±2 for visual balance but must keep the
body silhouette (`4 20` tip, `x=52` right edge) unchanged.

### 1.5 Render structure

```tsx
export default function BackButton({ onPress, size, width: widthProp, height: heightProp, style }: BackButtonProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const w = widthProp ?? size ?? 52;
  const h = heightProp ?? (size ? Math.round(size * 40 / 56) : 38);

  // ... handlePressIn, handlePressOut (Phase 2), handlePress (unchanged) ...

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Geri"
      style={[{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={w} height={h} viewBox="0 0 56 40">
          {/* trailing shadow (rendered first / behind) */}
          <Path d={ARROW_SHADOW_PATH} fill={ARROW_SHADOW} />
          {/* main body with comic outline */}
          <Path
            d={ARROW_BODY_PATH}
            fill={ARROW_FILL}
            stroke={COMIC_STROKE}
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          {/* leading-edge highlight (on top) */}
          <Path d={ARROW_HIGHLIGHT_PATH} fill={ARROW_HIGHLIGHT} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
```

Touch-target: Pressable `minWidth: 48, minHeight: 48` guarantees the tappable area
≥ 48×48 even though the visible SVG is 52×38. `hitSlop={8}` adds further buffer.
`strokeLinejoin="round"` prevents spiked corners on the comic outline.

No `StyleSheet.create` block needed — all style is inline on the Pressable wrapper.

### 1.6 Behavior preserved from prior design

- `handlePress`: `playUISound('button')` then `onPress ? onPress() : router.back()`.
  Unchanged.
- `handlePressIn`: `Animated.timing` scale → 0.92, 90ms, `useNativeDriver: true`.
  Unchanged.
- `handlePressOut`: replaced in Phase 2.

---

## PHASE 2 — Fix the modal-stutter regression

### Root cause

Press chain in quick-game:
1. `onPressIn` → scale down to 0.92 (Animated.timing, 90ms, native)
2. `onPressOut` → **`Animated.spring` back to 1.0** (friction 5, tension 140, native) —
   this spring takes 200–400ms to settle; still running when…
3. `onPress` fires → `handleExitPress` → `setExitModalVisible(true)` (quick-game.jsx:321)
4. React reconciles, ConfirmModal mounts, fires `Animated.parallel(spring + timing)`
   (ConfirmModal.tsx:48-60) simultaneously with the still-running BackButton spring.

Both springs use `useNativeDriver: true` but the JS thread still pays the cost of
scheduling, React reconciliation on mount, and `playUISound('modal')`. The overlap of
two concurrent spring animations plus React mount work in the same frame window drops
frames → visible stutter.

### 2.1 Fix: replace pressOut spring with fast `Animated.timing`

In `components/BackButton.tsx`, change `handlePressOut`:

**Before:**
```ts
const handlePressOut = () => {
  Animated.spring(scale, {
    toValue: 1,
    friction: 5,
    tension: 140,
    useNativeDriver: true,
  }).start();
};
```

**After:**
```ts
const handlePressOut = () => {
  Animated.timing(scale, {
    toValue: 1,
    duration: 80,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  }).start();
};
```

`onPress` fires in the same event-dispatch pass immediately after `onPressOut` — NOT
after the animation completes. So the 80ms timing and ConfirmModal's entrance spring
technically overlap during that 80ms window. The fix works by reducing contention: a
deterministic 80ms `Animated.timing` with `useNativeDriver: true` is computationally far
lighter than an indefinitely-settling spring (friction 5, tension 140 can run 200–400ms),
so the native compositor has headroom to run both concurrently without dropping frames.
Eliminating the unpredictable multi-frame spring tail is sufficient to remove the visible
stutter, even though the two animations briefly coexist.

The press feedback (scale down on touch, quick snap back) remains clearly perceptible
at 80ms. We are NOT removing animation.

### 2.2 Why not the alternatives

- **Lighter spring** (higher tension): still non-deterministic multi-frame settling, still
  overlaps the modal mount.
- **Defer onPress** with setTimeout: adds lag before the modal appears — explicitly
  rejected by the plan requirements.
- **Fire onPress on pressIn** (not standard): breaks Pressable semantics, fires before
  finger lift, rejected.
- **Remove animation**: rejected — subtle feedback required.
- **Chosen**: deterministic fixed-duration fast timing. Smallest change, no behavior
  surprises. Also benefits profile (though stutter isn't visible there since
  `router.back()` unmounts the screen immediately).

### 2.3 No changes to quick-game or ConfirmModal

`handleExitPress` (quick-game.jsx:321-323) and ConfirmModal entrance
(ConfirmModal.tsx:48-60) are untouched. The modal flow
(`onPress={handleExitPress}` → `visible={exitModalVisible}`) is fully preserved.

---

## Risks and Edge Cases

1. **SVG path correctness** — paths are hand-authored. Risk: highlight/shadow wedges
   appear off-center. Mitigation: implementer may nudge Y coords ±2 on highlight/shadow
   paths but must keep body silhouette (`tip 4 20`, `right edge x=52`) fixed. Verify on
   device.
2. **Stroke clipping** — `strokeWidth 3.5` on a viewBox edge. Mitigation: body geometry
   is inset (min x=4, max x=52, min y=6, max y=34) so half-stroke stays inside the
   0–56 / 0–40 viewBox. If clipping appears, shrink body coordinates by ~2 on all sides.
3. **Touch target** — visible SVG default height 38 < 48px. Mitigation: Pressable
   `minHeight: 48` + `hitSlop={8}`. Verify taps above/below the visible arrow register.
4. **Double sound** — `playUISound('button')` only in `handlePress`. Never added to
   pressIn/pressOut. Modal separately plays `playUISound('modal')` on open — that is the
   existing intended distinct cue.
5. **Animation contention** — pressOut fix only. Confirm no other `Animated.Value` on
   BackButton uses a spring (there is only `scale`).
6. **quick-game modal path preserved** — `onPress={handleExitPress}` and ConfirmModal
   props (`visible`, `onConfirm={confirmExit}`, `onCancel={cancelExit}`, `destructive`)
   are untouched. Verify the modal still opens, "Evet" calls `confirmExit`,
   "Hayır" calls `cancelExit`.
7. **Backward compat** — `size` prop still accepted; profile (`<BackButton />`) and
   quick-game (`<BackButton onPress={...} />`) compile and render with defaults.
   `style` prop still applies to the outer Pressable.
8. **New Architecture** — `react-native-svg@^15.15.5` already rendering TimerArc in
   quick-game under `newArchEnabled: true`, so the SVG arrow is safe on New Arch.

---

## Validation

### Commands

```bash
npm run lint
npx tsc --noEmit
```

### Manual device checklist

- [ ] New shape visible: profile and quick-game show a left-pointing comic arrow-bullet
      (teal body `#00B8D4`, bright `#00E5CC` leading edge, `#0091A7` trailing shadow,
      thick black outline) — no round button, no chevron icon, no text.
- [ ] Press feedback subtle: pressing the arrow scales down then snaps back quickly
      (~80ms), clearly perceptible but not bouncy.
- [ ] quick-game modal opens instantly: tap the back arrow in quick-game — the
      "Oyundan Ayrıl" ConfirmModal appears with NO stutter/dropped frames.
- [ ] quick-game modal actions: "Evet" exits (`router.back()` after 200ms delay),
      "Hayır" / backdrop dismisses modal, game continues.
- [ ] profile navigates smoothly: tap the back arrow — navigates back with no visual
      glitch.
- [ ] Sound once: exactly one `button` cue per back-arrow press; modal plays its own
      separate `modal` cue on open (two distinct cues total, no double of either).
- [ ] Touch target: taps slightly above/below the visible arrow still register
      (≥48×48 effective hit area).

PLAN_READY: thoughts/shared/plans/2026-06-12_back-button-redesign.md
