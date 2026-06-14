# Modal Polish

Date: 2026-06-14
Author: planner
Status: ready

## Goal

Polish the existing `ConfirmModal` component and its stylesheet, and add new teal theme tokens, delivering five improvements: a smaller/tighter card, a spring entrance animation, a distinct teal accent (instead of purple), button-click sounds on every press path, and a one-shot open sound. All changes are confined to three files. Do NOT touch `app/(app)/profile.tsx` — wiring there is already correct. No hardcoded hex anywhere; all colors go through `constants/theme.ts` tokens. All existing props and behaviors are preserved (guarded backdrop while loading, destructive/singleButton/loading paths, wrapper-Pressable owns sizing).

## Files to Change

- `components/ConfirmModal.tsx` — add Animated entrance, sound wrappers, open sound, swap gradient colors, wrap inner Pressable in Animated.View.
- `assets/styles/confirmModalStyle.ts` — reduce sizes/paddings, swap card shadow to teal glow.
- `constants/theme.ts` — add teal tokens only (new keys; do not edit existing values).

## Context / Confirmed Facts (exact current values from files read)

### `constants/theme.ts`
- `Colors.gradients` currently has: `background: ['#2D1B69', '#1A0A4A', '#0D0527']`, `brandButton`, `option`. The modal currently uses `Colors.gradients.background` for its border gradient.
- `Colors.accent` has `cyan: '#00D4FF'`. `Colors.modes.friends = { from: '#00897B', to: '#00E5CC' }` (existing teal family — reuse hue for consistency).
- `Colors.border.cyanSoft = 'rgba(0,212,255,0.22)'` exists already.
- `Shadows.card` uses `shadowColor: '#9B59F5'` (purple). `Shadows.glow` is purple too.
- `Spacing`: xs:4, sm:8, md:12, lg:16, xl:24, xxl:32. `Radius`: sm:10, md:14, lg:20, xl:28, full:999.

### `assets/styles/confirmModalStyle.ts` (current exact values)
- `overlay`: `flex:1`, `backgroundColor: Colors.ui.overlay`, centered, `paddingHorizontal: Spacing.xl` (24).
- `gradientBorder`: `borderRadius: Radius.lg` (20), `padding: 1.5`, `overflow:'hidden'`, `...Shadows.card`.
- `card`: `borderRadius: Radius.lg` (20), `backgroundColor: Colors.bg.card`, `paddingHorizontal: Spacing.xl` (24), `paddingVertical: Spacing.xxl` (32), `alignItems:'center'`, `gap: Spacing.lg` (16).
- `iconCircle`: `width:64`, `height:64`, `borderRadius: Radius.full`, centered, `backgroundColor: Colors.bg.surface`.
- `iconCircleDestructive`: `backgroundColor: Colors.wrongBg`.
- `message`: `textAlign:'center'`, `lineHeight:22`.
- `buttonRow`: row, `width:'100%'`, `gap: Spacing.md` (12), `marginTop: Spacing.sm` (8).
- `buttonRowSingle`: `width:'100%'`, `marginTop: Spacing.sm` (8).
- `dangerButton`: `height:52`, `flex:1`, `borderRadius: Radius.md` (14), centered, `backgroundColor: Colors.wrong`.

### `components/ConfirmModal.tsx` (current exact facts)
- Inner wrapper Pressable at line 53: `<Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 420 }}>`. This is the element to wrap in `Animated.View` and the `maxWidth` to reduce.
- `LinearGradient` at line 54 uses `colors={Colors.gradients.background}` — this is what gets swapped to teal.
- `handleRequestClose` (lines 39-41): `if (!loading) onCancel();`.
- Button onPress handlers to replace: line 100 (singleButton AuthButton → `onConfirm`), line 111 (cancel ghost AuthButton → `onCancel`), line 120 (destructive TouchableOpacity → `onConfirm`), line 137 (non-destructive confirm AuthButton → `onConfirm`).
- `playUISound` is imported in quick-game from `@/utils/sound`; the `'modal'` cue plays buttonClick then bubble.wav, `'button'` plays buttonClick. (Confirmed in `utils/sound.js`.)

### `utils/sound.js`
- `playUISound('button')` → buttonClick.wav. `playUISound('modal')` → buttonClick then bubble.wav. Both return a Promise; do not await (fire-and-forget).

---

## Phase 1 — Size + Padding

Goal: compact, elegant card. No clipping on small screens.

### `components/ConfirmModal.tsx`
- Inner wrapper `maxWidth: 420` → `maxWidth: 340`. (Sizing moves to `Animated.View` in Phase 3; for now just change the number.)

### `assets/styles/confirmModalStyle.ts` — exact old→new
- `overlay.paddingHorizontal`: `Spacing.xl` (24) → **keep** (prevents clipping). No change.
- `card.paddingHorizontal`: `Spacing.xl` (24) → `Spacing.lg` (16).
- `card.paddingVertical`: `Spacing.xxl` (32) → `Spacing.xl` (24).
- `card.gap`: `Spacing.lg` (16) → `Spacing.md` (12).
- `iconCircle.width`: `64` → `56`.
- `iconCircle.height`: `64` → `56`.
- `dangerButton.height`: **keep 52** (matches AuthButton fixed height; changing would cause row misalignment).
- `buttonRow.gap`: `Spacing.md` (12) → `Spacing.sm` (8).
- `buttonRow.marginTop`: `Spacing.sm` (8) → **keep**.
- `message.lineHeight`: `22` → `20`.

Net effect: card max width 420→340, vertical padding 32→24, horizontal padding 24→16, content gap 16→12, icon 64→56, button gap 12→8.

Validate: `npm run lint`, `npx tsc --noEmit`.

---

## Phase 2 — Teal Color Tokens

Goal: modal reads teal/cyan, distinct from app purple. Tokens only; no hex in component or stylesheet.

### `constants/theme.ts` — add NEW keys only (do not edit existing)

1. In `Colors.gradients`, add:
   ```ts
   modal: ['#00E5CC', '#00B8D4', '#0091A7'] as const,
   ```
   (Teal-to-cyan, consistent with `modes.friends` hue family and `accent.cyan`.)

2. In `Colors.accent`, add:
   ```ts
   teal: '#00E5CC',
   ```

3. In `Shadows`, add:
   ```ts
   modalGlow: {
     shadowColor: '#00E5CC',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.35,
     shadowRadius: 16,
     elevation: 10,
   },
   ```

### `assets/styles/confirmModalStyle.ts`
- `gradientBorder`: replace `...Shadows.card` → `...Shadows.modalGlow`.
- `Shadows` is already imported (line 2). No import change needed.

### `components/ConfirmModal.tsx`
- `LinearGradient colors={Colors.gradients.background}` → `colors={Colors.gradients.modal}`.
- `start`/`end` unchanged.
- Destructive button stays `Colors.wrong`. Cancel stays ghost. Card background stays `Colors.bg.card`. Icon colors unchanged.

The `as const` on `gradients.modal` keeps the `LinearGradient` `colors` prop type matching the existing tuple shape — required for `tsc`.

Validate: `npm run lint`, `npx tsc --noEmit`.

---

## Phase 3 — Entrance Animation

Goal: spring pop + fade on open. React Native `Animated` only (no reanimated). `useNativeDriver: true`.

### `components/ConfirmModal.tsx`

1. **Update imports**:
   - `react-native`: add `Animated` → `{ ActivityIndicator, Animated, Modal, Pressable, TouchableOpacity, View }`.
   - `react`: add `useEffect`, `useRef` → `import React, { useEffect, useRef } from 'react';`.

2. **Declare Animated values** inside component body:
   ```ts
   const scale = useRef(new Animated.Value(1)).current;
   const opacity = useRef(new Animated.Value(1)).current;
   ```

3. **Add `useEffect` keyed on `[visible]`**:
   ```ts
   useEffect(() => {
     if (visible) {
       scale.setValue(0.9);
       opacity.setValue(0);
       Animated.parallel([
         Animated.spring(scale, {
           toValue: 1,
           friction: 8,
           tension: 100,
           useNativeDriver: true,
         }),
         Animated.timing(opacity, {
           toValue: 1,
           duration: 200,
           useNativeDriver: true,
         }),
       ]).start();
     } else {
       scale.setValue(0.9);
       opacity.setValue(0);
     }
   }, [visible]);
   ```
   The `setValue` at the top of the `if (visible)` branch guarantees a clean start even after rapid open/close. The `else` reset is masked by the Modal's native `animationType="fade"` — the brief reset is invisible.

4. **Wrap inner Pressable in `Animated.View`**:

   Current structure:
   ```tsx
   <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 340 }}>
     <LinearGradient ...>...</LinearGradient>
   </Pressable>
   ```

   New structure:
   ```tsx
   <Animated.View style={{ width: '100%', maxWidth: 340, transform: [{ scale }], opacity }}>
     <Pressable onPress={() => {}} style={{ width: '100%' }}>
       <LinearGradient ...>...</LinearGradient>
     </Pressable>
   </Animated.View>
   ```

   `Animated.View` owns `maxWidth` + transform/opacity; inner `Pressable` keeps `width:'100%'` and still stops tap propagation. `transform` and `opacity` are native-driver-supported — no layout props are animated, so `useNativeDriver: true` is safe.

Validate: `npm run lint`, `npx tsc --noEmit`, device check (pop on open).

---

## Phase 4 — Button + Open Sounds

Goal: click on every button path; one-shot open cue. Lives inside ConfirmModal so all future usages inherit it automatically.

### `components/ConfirmModal.tsx`

1. **Add import**: `import { playUISound } from '@/utils/sound';`

2. **Wrapper handlers** (in component body, after the Animated values):
   ```ts
   const handleConfirm = () => {
     playUISound('button');
     onConfirm();
   };
   const handleCancel = () => {
     playUISound('button');
     onCancel();
   };
   ```
   Fire-and-forget — do not await. Navigation/state is not blocked.

3. **Update `handleRequestClose`** (backdrop + Android back):
   ```ts
   const handleRequestClose = () => {
     if (loading) return;
     playUISound('button');
     onCancel();
   };
   ```
   Backdrop tap and Android back are user-initiated dismissals equivalent to Cancel — consistent feedback requires the click. The `loading` guard suppresses both sound and dismissal while an action is in flight.

4. **Replace all onPress wiring**:
   - singleButton AuthButton (line ~100): `onPress={onConfirm}` → `onPress={handleConfirm}`.
   - cancel ghost AuthButton (line ~111): `onPress={onCancel}` → `onPress={handleCancel}`.
   - destructive TouchableOpacity (line ~120): `onPress={onConfirm}` → `onPress={handleConfirm}`.
   - non-destructive confirm AuthButton (line ~137): `onPress={onConfirm}` → `onPress={handleConfirm}`.

5. **Open sound** — extend the Phase 3 `useEffect`:
   ```ts
   useEffect(() => {
     if (visible) {
       playUISound('modal');      // bubble.wav cue, once per open
       scale.setValue(0.9);
       opacity.setValue(0);
       Animated.parallel([...]).start();
     } else {
       scale.setValue(0.9);
       opacity.setValue(0);
     }
   }, [visible]);
   ```
   `if (visible)` guard: fires only on opening. Effect runs only when `visible` changes value (not on every render). On initial mount with `visible=false`, only the `else` branch runs — no spurious sound. Do NOT add a second `playUISound('button')` here; `'modal'` already includes the click.

Validate: `npm run lint`, `npx tsc --noEmit`, device check (click on confirm+cancel, bubble on open).

---

## Risks and Edge Cases

1. **Animation reset correctness** — `setValue` vs effect timing.
   The reset in the `else` branch runs when `visible` flips to `false`, masked by `Modal`'s native `animationType="fade"`. The redundant `setValue(0.9/0)` at the top of the `if (visible)` branch guarantees a clean start even if the close-reset was skipped (e.g. rapid open/close). This double-guard avoids "no pop on second open" bugs.

2. **Sound firing exactly once per open** — not on mount, not on every render.
   `useEffect` with `[visible]` runs only when `visible` changes. The `if (visible)` guard restricts the sound to the `false→true` transition. Unrelated re-renders (e.g. `loading` changing mid-flight) do not re-run the effect. Result: one `playUISound('modal')` call per open.

3. **Expo Go safety** — no reanimated.
   Only `Animated` from `react-native`. No `react-native-reanimated` import. Compatible with Expo Go and consistent with quick-game's existing `Animated` usage.

4. **`useNativeDriver: true`** compatibility.
   `transform: [{ scale }]` and `opacity` are native-driver-supported. No `width`/`height`/layout props are animated. Safe to enable.

5. **Row height alignment** — `dangerButton.height`.
   Kept at 52 (matching AuthButton's fixed height) to prevent jagged button row. Do not reduce to 48.

6. **Gradient type safety** — `as const`.
   `Colors.gradients.modal` must be `as const` (readonly tuple) to match the `LinearGradient` `colors` prop type. Without it, `tsc` widens to `string[]` and errors.

7. **Profile screen untouched**.
   Component API (props) is unchanged. Existing consumers keep working; only internal behavior (sounds, animation, colors, size) changes.

---

## Validation

Commands (run from repo root after all phases):
- `npm run lint` — clean.
- `npx tsc --noEmit` — no errors (watch `as const` on `gradients.modal`).

Manual device test checklist (Expo Go):
- [ ] Card is visibly smaller (teal border, ~340 max width) and compact.
- [ ] Spring pop (scale 0.9→1) plays on every open, including re-opens.
- [ ] bubble.wav plays once on open (`playUISound('modal')`); does NOT fire on close.
- [ ] button click plays on confirm button (all paths: destructive, non-destructive, singleButton).
- [ ] button click plays on cancel button.
- [ ] button click plays on backdrop tap (when not loading).
- [ ] Backdrop and Android back are suppressed while `loading=true` (no sound, no dismiss).
- [ ] Logout flow end-to-end: open modal → confirm → signed out → redirected to /signin.
- [ ] No clipping on small screen (overlay `paddingHorizontal: Spacing.xl` preserved).
- [ ] Teal gradient border visually distinct from the app's purple UI.
- [ ] destructive, singleButton, and loading paths all render correctly with new sizes.

PLAN_READY: thoughts/shared/plans/2026-06-12_modal-polish.md
