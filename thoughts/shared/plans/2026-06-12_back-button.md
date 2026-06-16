# Reusable Game-Styled BackButton — Implementation Plan

Date: 2026-06-12
Plan file: thoughts/shared/plans/2026-06-12_back-button.md

## Goal

Create one reusable, distinctive game-styled `BackButton` component (teal, tactile,
3D/raised, press animation + click sound) and apply it to two screens:
`app/(app)/profile.tsx` and `app/(app)/game/quick-game.jsx`.

> **Out of scope**: `app/forgot-password.jsx` — its "Giriş Sayfasına Dön" is a
> meaningful auth-flow text link (not a corner back button) and its styles are shared
> with `signup.jsx`. Will be handled in the auth/signup redesign.

## Context (verified facts — file:line)

- **Profile back button**: `app/(app)/profile.tsx` lines 64-70 — a `TouchableOpacity`
  styled with `profileStyles.backButton`, containing `Ionicons name="arrow-back"
  size={24} color={Colors.text.primary}`, `onPress={() => router.back()}`.
  - Style `profileStyles.backButton` defined at `assets/styles/profileStyle.ts`
    lines 24-31. Grep confirms `backButton` referenced ONLY in `profile.tsx` and
    `profileStyle.ts`. Safe to remove after swap.

- **Quick-game exit button**: `app/(app)/game/quick-game.jsx` line 511 — a
  `TouchableOpacity onPress={handleExitPress} style={s.exitBtn} activeOpacity={0.75}`
  containing `Ionicons name="arrow-back" size={22} color={Colors.text.primary}`.
  Wrapped in `<View style={s.exitRow}>` (line 510).
  - `handleExitPress` (lines 320-322) only calls `setExitModalVisible(true)` — it
    does NOT navigate back and does NOT call `playUISound`. Exit flow is handled by
    `confirmExit` (324-329 → `router.back()` after 200ms) / `cancelExit` (331-333),
    rendered by `<ConfirmModal visible={exitModalVisible} ...>` (line 758).
  - **No existing click sound** on the exit button press path → BackButton's internal
    `playUISound('button')` introduces ONE sound, not a double-fire.
  - Style `s.exitBtn` defined at `assets/styles/quickGameStyle.js` lines 62-69. Safe
    to remove after re-grep confirms no other usage. `exitRow` (lines 56-61) STAYS.

- **Sound API**: `utils/sound.js` — `playUISound('button')` plays `buttonClick`.
  Already used throughout (quick-game, ConfirmModal, etc.).

- **Theme tokens** (`constants/theme.ts`):
  - `Colors.accent.teal = '#00E5CC'`
  - `Colors.gradients.modal = ['#00E5CC', '#00B8D4', '#0091A7'] as const`
  - `Shadows.modalGlow` — teal glow shadow
  - `Shadows.button`
  - `Radius.full = 999`
  - `Colors.text.primary`

- **Import alias**: `@/` maps to repo root (`tsconfig.json`). New component lives at
  `components/BackButton.tsx` → import as `@/components/BackButton`.

---

## Phase 1 — Create `components/BackButton.tsx`

Create `components/BackButton.tsx` (TypeScript). Token-only styling, English
identifiers, Turkish accessibility label.

### Behavior

- Default `onPress` = `router.back()` via `useRouter()`.
- On `pressIn`: scale to 0.92 (`Animated.timing`, 90ms).
- On `pressOut`: spring back to 1.0 (`Animated.spring`, friction 5, tension 140).
  Always fires so the button never sticks at 0.92.
- On press: call `playUISound('button')` BEFORE invoking `onPress`.
- Touch target >= 48px: `hitSlop={8}` around 44px visual (default `size = 44`).

### Exact component code

```tsx
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Radius, Shadows } from '@/constants/theme';
import { playUISound } from '@/utils/sound';

interface BackButtonProps {
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function BackButton({ onPress, size = 44, style }: BackButtonProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    playUISound('button');
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  const iconSize = Math.round(size * 0.5);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Geri"
      style={style}
    >
      <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
        {/* Depth layer — sits behind, offset down 3px, gives raised/puffy 3D feel */}
        <View
          style={[
            styles.depth,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
        <LinearGradient
          colors={Colors.gradients.modal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.face,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Ionicons name="chevron-back" size={iconSize} color={Colors.text.primary} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent.teal,
    ...Shadows.modalGlow,
  },
  // Bottom depth shim — darkest teal from gradient, nudged 3px down, behind the face
  depth: {
    position: 'absolute',
    top: 3,
    backgroundColor: Colors.gradients.modal[2],
  },
});
```

### Phase 1 validation

```bash
npm run lint
npx tsc --noEmit
```

---

## Phase 2 — Apply BackButton to profile and quick-game

### 2.1 — Profile (`app/(app)/profile.tsx`)

Replace lines 64-70.

**Before:**
```tsx
<TouchableOpacity
  style={profileStyles.backButton}
  onPress={() => router.back()}
  activeOpacity={0.7}
>
  <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
</TouchableOpacity>
```

**After:**
```tsx
<BackButton />
```

Additional edits:
- Add import: `import BackButton from '@/components/BackButton';` (near line 13, after other component imports).
- Remove `profileStyles.backButton` (lines 24-31) from `assets/styles/profileStyle.ts`
  ONLY after re-grep confirms no remaining references.
- If `TouchableOpacity` is no longer used in `profile.tsx` after the swap, remove it
  from the `react-native` import. Keep `Ionicons` — still used for the badge icon
  (lines ~90-94).

### 2.2 — Quick-game (`app/(app)/game/quick-game.jsx`)

Replace lines 511-513 (the `TouchableOpacity` inside `exitRow`).

**Before:**
```jsx
<View style={s.exitRow}>
  <TouchableOpacity onPress={handleExitPress} style={s.exitBtn} activeOpacity={0.75}>
    <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
  </TouchableOpacity>
</View>
```

**After:**
```jsx
<View style={s.exitRow}>
  <BackButton onPress={handleExitPress} />
</View>
```

Additional edits:
- Add import: `import BackButton from '@/components/BackButton';` (near top of file,
  with other component imports).
- **CRITICAL**: keep `onPress={handleExitPress}` — it calls `setExitModalVisible(true)`
  to open the exit ConfirmModal. It must NOT become a direct `router.back()`.
- `handleExitPress` has NO existing `playUISound` call. BackButton adds exactly one
  `playUISound('button')`. Do NOT add another sound anywhere in this flow.
- `s.exitRow` container STAYS. Remove `exitBtn` (lines 62-69) from
  `assets/styles/quickGameStyle.js` ONLY after re-grep returns no references.
- Keep `Ionicons` and `TouchableOpacity` imports — both are used elsewhere in the file.

### Phase 2 validation

```bash
npm run lint
npx tsc --noEmit
```

Pre-deletion grep (run before removing each style):
```bash
npx rg -n "backButton" app assets
npx rg -n "exitBtn" app assets
```

---

## Risks and Edge Cases

1. **Quick-game must not navigate directly** — `BackButton onPress={handleExitPress}`
   must open the exit ConfirmModal, NOT call `router.back()`. Always pass the handler
   explicitly; never rely on the default.
2. **Double sound** — Verified: the old exit button had NO `playUISound`. BackButton
   adds exactly one click. Do not add another in `handleExitPress` or elsewhere.
3. **Style deletion safety** — only `profileStyles.backButton` and
   `quickGameStyles.exitBtn` are removal candidates, and only after a fresh grep
   confirms no remaining references.
4. **Press animation reset** — `onPressOut` always fires `Animated.spring(toValue: 1)`,
   so the button cannot stick at 0.92 even when `onPress` opens a modal.
5. **Touch target >= 48px** — `size=44` + `hitSlop={8}` → ~60px effective target.
   Verify on device.
6. **Token-only depth color** — depth layer uses `Colors.gradients.modal[2]` (not a
   hardcoded hex).
7. **Unused imports after swap** — remove `TouchableOpacity` from `profile.tsx` if it
   becomes unused; keep `Ionicons` (badge still uses it).

---

## Validation

### Commands

```bash
npm run lint
npx tsc --noEmit
```

### Manual device test checklist

- [ ] Profile: BackButton shows teal tactile button; press scales down then springs
      back; click sound plays; navigates back correctly.
- [ ] Quick-game: BackButton press scales/springs + plays sound and OPENS the exit
      confirm modal (does NOT immediately leave the game). Confirming exits; cancelling stays.
- [ ] No button sticks at 0.92 scale after rapid taps.
- [ ] Touch target feels comfortable (>= 48px) on a real device.
- [ ] No double sounds anywhere (one click per press, one modal cue on modal open).

PLAN_READY: thoughts/shared/plans/2026-06-12_back-button.md
