# Modal No-Spring + BackButton Size Increase

- Date: 2026-06-12
- Plan path: thoughts/shared/plans/2026-06-12_modal-noanim-backbutton-bigger.md

## Goal

Two visual fixes:

1. **ConfirmModal** must open with zero bounce/stutter on both usages (profile logout, quick-game exit). Root cause is `Animated.spring(scale 0.9→1)` in the `useEffect` on `visible`.
2. **BackButton** arrow is too small/subtle on device — make it bigger and the comic outline bolder/more prominent.

Both are presentation-only changes. No logic, props, sounds, or callbacks change.

## Files to Change

- `components/ConfirmModal.tsx`
- `components/BackButton.tsx`

## Files to Create

None.

## Context / Container Constraints (verified)

- **quick-game exit row** — `app/(app)/game/quick-game.jsx` line 511-513: `<View style={s.exitRow}><BackButton onPress={handleExitPress} /></View>`. Style `exitRow` (`assets/styles/quickGameStyle.js` ~line 56): `flexDirection: 'row'`, `alignItems: 'center'`, `marginBottom: Spacing.sm`, `flexShrink: 0`. No fixed height — a taller button grows the row naturally.
- **profile header** — `app/(app)/profile.tsx` line 64-66: `<View style={profileStyles.header}><BackButton /><ThemedText>Profil</ThemedText></View>`. Style `header` (`assets/styles/profileStyle.ts` line 18): `flexDirection: 'row'`, `alignItems: 'center'`, `paddingVertical: Spacing.md`, `gap: Spacing.md`. No fixed height — a taller button is centered and fits.

Conclusion: neither container constrains height/width, so 68×50 is safe. No screen/style edits needed.

---

## PHASE 1 — Remove spring entrance from ConfirmModal

**File:** `components/ConfirmModal.tsx`

### Fade decision

Drop the manual `opacity` animation entirely and rely solely on the Modal's built-in `animationType="fade"` (already present). Rationale: the Modal already fades its whole transparent surface on visible toggle; a second JS-driven opacity timing is redundant and is the remaining source of any first-frame flicker once scale is gone. Removing it makes the open path purely declarative (no `useEffect`-driven animation at all), which is the simplest possible "no bounce, no stutter" result. The `playUISound('modal')` call still needs a `useEffect`, but it no longer touches any `Animated.Value`.

### Specific edits

1. **React import** — remove `useRef` (becomes unused); keep `useEffect`:
   ```ts
   import React, { useEffect } from 'react';
   ```

2. **react-native import** — remove `Animated` (becomes unused after step 5). Keep: `ActivityIndicator, Modal, Pressable, TouchableOpacity, View`.

3. **Delete both `Animated.Value` refs** (lines ~40-41):
   ```ts
   // DELETE these two lines:
   const scale = useRef(new Animated.Value(0.9)).current;
   const opacity = useRef(new Animated.Value(0)).current;
   ```

4. **Replace the animation `useEffect` body** with a sound-only effect (lines ~43-66):
   ```ts
   useEffect(() => {
     if (visible) {
       playUISound('modal');
     }
   }, [visible]);
   ```
   Remove the `eslint-disable react-hooks/exhaustive-deps` comment — `visible` is now listed, no missing deps.

5. **Replace `Animated.View` wrapper** with a plain `View`, keeping only sizing:
   - From: `<Animated.View style={{ width: '100%', maxWidth: 340, transform: [{ scale }], opacity }}>`
   - To:   `<View style={{ width: '100%', maxWidth: 340 }}>`
   - Change the closing `</Animated.View>` to `</View>`.

### Must stay intact

`playUISound('modal')` fires once per open; backdrop `Pressable` `handleRequestClose` (loading guard); inner `Pressable` that stops propagation; `width: '100%'` / `maxWidth: 340` sizing; all props (`visible`, `onConfirm`, `onCancel`, `title`, `message`, `destructive`, `singleButton`, `loading`, `icon`, `confirmLabel`, `cancelLabel`); `handleConfirm`/`handleCancel` with `playUISound('button')`.

**Result:** Both modals open with the Modal's plain fade only — no scale, no spring, no JS-thread opacity timing.

---

## PHASE 2 — Make BackButton bigger and bolder

**File:** `components/BackButton.tsx`

The `viewBox="0 0 56 40"` is unchanged. Only render size, stroke width, and highlight wedge coordinates change.

### Specific edits

1. **Default render size** (lines ~46-47) — increase to 68×50 (keeps ~56:40 ratio):
   ```ts
   // Before:
   const w = widthProp ?? size ?? 52;
   const h = heightProp ?? (size ? Math.round((size * 40) / 56) : 38);
   // After:
   const w = widthProp ?? size ?? 68;
   const h = heightProp ?? (size ? Math.round((size * 40) / 56) : 50);
   ```
   (68 × 40/56 ≈ 48.6, rounded to 50 — preserves aspect ratio.)

2. **Stroke width** (line ~97) — bump from 3.5 to 5:
   ```tsx
   // Before:
   strokeWidth={3.5}
   // After:
   strokeWidth={5}
   ```
   Justification: 5 gives a noticeably bolder comic outline at the larger 68×50 size. Half-stroke = 2.5px; body path is inset (min x=4, min y=6, max x=52, max y=34) so the outermost stroke edge sits at x≈1.5 / y≈3.5 — safely inside the 0–56 × 0–40 viewBox, no clipping.

3. **Highlight wedge** (line ~23) — widen so the bright leading edge is more visible:
   ```ts
   // Before:
   const ARROW_HIGHLIGHT_PATH = 'M4 20 L20 6 L20 12 L9 20 L20 28 L20 34 Z';
   // After:
   const ARROW_HIGHLIGHT_PATH = 'M4 20 L20 6 L20 10 L11 20 L20 30 L20 34 Z';
   ```
   Effect: the wedge tip moves from x=9 to x=11 (deeper toward center, ~2 units wider toward the body) and the top/bottom inner edges open from 12/28 to 10/30, fattening the bright `#00E5CC` stripe. The shared outer vertices (`4 20`, `20 6`, `20 34`) are untouched — highlight stays flush with the body silhouette.

### Must NOT change

`ARROW_BODY_PATH` (tip `4 20`, right edge `x=52`, full silhouette); `ARROW_SHADOW_PATH`; the `viewBox`; fills (`ARROW_FILL`, `ARROW_HIGHLIGHT`, `ARROW_SHADOW`, `COMIC_STROKE` color); `Pressable` `minWidth: 48 / minHeight: 48` touch target; `hitSlop={8}`; `handlePressIn` (0.92 / 90ms) and `handlePressOut` (1 / 80ms, `Easing.out(Easing.quad)`) timing; `playUISound('button')`; `accessibilityRole` / `accessibilityLabel`; all props (`onPress`, `size`, `width`, `height`, `style`).

---

## Risks and Edge Cases

1. **Animated.View → View layout** — the wrapper only carried `width: '100%'` and `maxWidth: 340`; converting to a plain `View` keeps both. The modal card cannot collapse.
2. **Leftover unused imports** — after Phase 1, `Animated` (react-native) and `useRef` (react) become unused in ConfirmModal. Both must be removed or lint/tsc will error. Double-check no other `Animated.*` usage remains in the file.
3. **Bigger BackButton overflow** — both containers are `flexDirection: 'row'` + `alignItems: 'center'` with no fixed height, so 68×50 grows the row and centers fine. No style edits required.
4. **Stroke inside viewBox** — at `strokeWidth={5}`, half-stroke 2.5px keeps the inset body path inside the 0–56 × 0–40 viewBox. No clipping.
5. **Sound double-fire** — the new sound-only `useEffect` keeps the same `[visible]` dependency, so `playUISound('modal')` still fires exactly once per open, never on close.

---

## Validation

```bash
npm run lint
npx tsc --noEmit
```

### Manual device checklist

- [ ] Profile logout modal opens with no bounce, no scale animation
- [ ] Quick-game exit modal opens with no bounce, no stutter
- [ ] Both modals still play the `modal` sound cue once on open
- [ ] BackButton visibly bigger and bolder on both screens
- [ ] No layout overflow (button fits in header / exitRow)
- [ ] Press feedback (pressIn / pressOut timing) still works
- [ ] All modal actions still work (confirm / cancel / backdrop)

PLAN_READY: thoughts/shared/plans/2026-06-12_modal-noanim-backbutton-bigger.md
