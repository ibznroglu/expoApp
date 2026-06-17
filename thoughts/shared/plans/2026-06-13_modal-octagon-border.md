# Plan: ConfirmModal Cut-Corner (Octagon) Frame Redesign

Date: 2026-06-13
Topic: Replace ConfirmModal's rounded LinearGradient border + flat card fill with an SVG cut-corner octagon frame (glowing teal border + dark teal→navy diagonal gradient fill).

## Goal

Visual-only redesign of `components/ConfirmModal.tsx`:
- Outer octagon = glowing teal gradient frame (the "border").
- Inner octagon = dark teal→navy diagonal gradient fill (the "background").
- Content (icon / title / message / buttons) renders in a normal transparent View on top of an absolutely-positioned SVG.

All existing behavior, props, and sounds preserved exactly. Modal still opens instantly via `animationType="fade"` — no spring/scale entrance.

## Files to Change

- `constants/theme.ts` — add inner-fill gradient tokens (Phase 1).
- `components/ConfirmModal.tsx` — add SVG octagon background, onLayout measurement, content wrapper (Phases 3–4).
- `assets/styles/confirmModalStyle.ts` — remove `gradientBorder` + `card`, add `cardOuter` / `cardWrapper` / `svgBackground` / `content` styles (Phases 4–5).

## Files to Create

- `utils/octagonPath.ts` — pure TS helper returning octagon SVG path strings (Phase 2).

## Current-Code Reference (preserve all of this)

From `components/ConfirmModal.tsx`:
- Props interface: `ConfirmModal.tsx:13-25` (`visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, icon, destructive, singleButton, loading`).
- `playUISound('modal')` on open: `ConfirmModal.tsx:40-44` (`useEffect [visible]`).
- `playUISound('button')` in `handleConfirm`: `ConfirmModal.tsx:46-49`.
- `playUISound('button')` in `handleCancel`: `ConfirmModal.tsx:50-53`.
- `handleRequestClose` with `if (loading) return;` guard: `ConfirmModal.tsx:55-58`.
- `Modal ... animationType="fade"`: `ConfirmModal.tsx:61-66`.
- Backdrop `Pressable` -> `handleRequestClose`: `ConfirmModal.tsx:68`.
- Inner `Pressable onPress={() => {}}` (stops propagation): `ConfirmModal.tsx:71`.
- Icon circle + destructive variant: `ConfirmModal.tsx:80-93`.
- Title / message ThemedText: `ConfirmModal.tsx:96-110`.
- Single-button branch (gradient AuthButton): `ConfirmModal.tsx:113-121`.
- Two-button branch: ghost `AuthButton` cancel + destructive `TouchableOpacity`/`dangerButton` OR gradient `AuthButton` confirm, with `ActivityIndicator` when loading: `ConfirmModal.tsx:122-161`.

The pieces being REPLACED are only the wrapper visuals:
- `LinearGradient ... style={styles.gradientBorder}`: `ConfirmModal.tsx:72-77` (deleted).
- `<View style={styles.card}>`: `ConfirmModal.tsx:78` (replaced by `styles.content` wrapper).
- `gradientBorder` style: `confirmModalStyle.ts:12-17` (deleted).
- `card` style: `confirmModalStyle.ts:18-25` (deleted).

`confirmModalStyle.ts` is imported ONLY by `ConfirmModal.tsx` (grep-confirmed), so style removals are safe.

`react-native-svg` is installed at `^15.15.5` (package.json) and already used in `components/BackButton.tsx` via `import Svg, { Path } from 'react-native-svg';`. We additionally need `Defs`, `LinearGradient` (as `SvgLinearGradient`), and `Stop` from the same package for SVG-internal gradients — standard exports in react-native-svg 15.x.

---

## Phase 1 — Token additions (`constants/theme.ts`)

Add to `Colors.gradients` (after the existing `modal` entry):

```ts
// Outer octagon frame — glowing teal diagonal
modalFrame: ['#00E5CC', '#0091A7'] as const,
// Inner octagon fill — dark teal -> navy diagonal
modalFill: ['#0E3A44', '#0A1430'] as const,
```

Rationale:
- `modalFrame` stops equal `Colors.accent.teal` and `Colors.gradients.modal[2]` — preserves the existing glowing-teal identity.
- `modalFill` dark teal `#0E3A44` → navy `#0A1430`: dark enough that `Colors.text.primary` (`#FFFFFF`) and `Colors.text.secondary` (`rgba(255,255,255,0.7)`) stay legible (high contrast against dark backgrounds).

No other token changes. Keep `Shadows.modalGlow` — reused on `cardOuter` for the teal drop-shadow halo.

Validation:
- `npx tsc --noEmit` passes (same shape as existing gradient arrays).
- `npm run lint` passes.

---

## Phase 2 — Octagon path helper (`utils/octagonPath.ts`)

Create `utils/octagonPath.ts` (pure TS, no React imports):

```ts
export interface OctagonParams {
  width: number;
  height: number;
  cut: number;
}

function clampCut(width: number, height: number, cut: number): number {
  const maxCut = Math.min(width, height) / 2;
  return Math.max(0, Math.min(cut, maxCut));
}

export function octagonPath({ width: W, height: H, cut }: OctagonParams): string {
  const C = clampCut(W, H, cut);
  return `M ${C},0 L ${W - C},0 L ${W},${C} L ${W},${H - C} L ${W - C},${H} L ${C},${H} L 0,${H - C} L 0,${C} Z`;
}

export function octagonInnerPath(
  { width: W, height: H, cut }: OctagonParams,
  border: number,
): string {
  const innerW = W - 2 * border;
  const innerH = H - 2 * border;
  const innerCut = clampCut(innerW, innerH, Math.max(0, cut - border));
  const o = border;
  return `M ${o + innerCut},${o} L ${o + innerW - innerCut},${o} L ${o + innerW},${o + innerCut} L ${o + innerW},${o + innerH - innerCut} L ${o + innerW - innerCut},${o + innerH} L ${o + innerCut},${o + innerH} L ${o},${o + innerH - innerCut} L ${o},${o + innerCut} Z`;
}
```

Constants (defined in the component, not here):
- `CORNER_CUT = 16` — balanced for 340px wide card; clamped by helper on small cards.
- `BORDER_THICKNESS = 3` — border between outer and inner octagon.

Validation:
- `npx tsc --noEmit` passes.
- Manual sanity: `octagonPath({width:340,height:200,cut:16})` produces 8 line segments + close, no NaN.

---

## Phase 3 — SVG octagon background in ConfirmModal (`components/ConfirmModal.tsx`)

### Imports

Add to React import (line 1):
```ts
import React, { useEffect, useState } from 'react';
```

Add to react-native import (line 2) — add `LayoutChangeEvent`:
```ts
import { ActivityIndicator, LayoutChangeEvent, Modal, Pressable, TouchableOpacity, View } from 'react-native';
```

Remove the `expo-linear-gradient` import (line 3) — it becomes unused after Phase 4. Confirm via grep no remaining `LinearGradient` reference in the file before deleting.

Add new imports after existing imports:
```ts
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { octagonPath, octagonInnerPath } from '@/utils/octagonPath';
```

### Module-level constants (after imports, before component)

```ts
const CORNER_CUT = 16;
const BORDER_THICKNESS = 3;
const DEFAULT_CARD = { width: 340, height: 200 };
```

### Inside component body

Add measurement state:
```ts
const [cardSize, setCardSize] = useState(DEFAULT_CARD);

const handleCardLayout = (e: LayoutChangeEvent) => {
  const { width, height } = e.nativeEvent.layout;
  if (width > 0 && height > 0) {
    setCardSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }
};
```

### JSX replacement

Replace the `<View style={{ width: '100%', maxWidth: 340 }}>` wrapper through `</View>` (lines 70–165 approximately) with:

```tsx
<View style={styles.cardOuter}>
  <Pressable onPress={() => {}} style={styles.cardWrapper} onLayout={handleCardLayout}>
    <Svg
      width={cardSize.width}
      height={cardSize.height}
      style={styles.svgBackground}
      pointerEvents="none"
    >
      <Defs>
        <SvgLinearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={Colors.gradients.modalFrame[0]} />
          <Stop offset="1" stopColor={Colors.gradients.modalFrame[1]} />
        </SvgLinearGradient>
        <SvgLinearGradient id="fillGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={Colors.gradients.modalFill[0]} />
          <Stop offset="1" stopColor={Colors.gradients.modalFill[1]} />
        </SvgLinearGradient>
      </Defs>
      <Path
        d={octagonPath({ width: cardSize.width, height: cardSize.height, cut: CORNER_CUT })}
        fill="url(#frameGrad)"
      />
      <Path
        d={octagonInnerPath(
          { width: cardSize.width, height: cardSize.height, cut: CORNER_CUT },
          BORDER_THICKNESS,
        )}
        fill="url(#fillGrad)"
      />
    </Svg>

    <View style={styles.content}>
      {/* icon, title, message, buttons — moved verbatim from ConfirmModal.tsx:79-161 */}
    </View>
  </Pressable>
</View>
```

**Overflow decision:** Do NOT set `overflow: 'hidden'` on `cardWrapper`. The SVG is drawn at exactly the measured card size, so it never extends past the wrapper. `overflow: 'hidden'` would clip the `Shadows.modalGlow` teal halo on `cardOuter`. The shadow renders around the rectangular view bounds; the visible octagon shape comes from the SVG fill path — accepted, matches prior `gradientBorder` rounded-rect glow behavior.

Validation:
- `npm run lint`, `npx tsc --noEmit` pass.
- Open quick-game exit dialog — octagon frame visible with teal border and dark fill at correct size after first layout.

---

## Phase 4 — Content wrapper layout (`assets/styles/confirmModalStyle.ts`)

Add styles (keep all existing styles; additions only in this phase):

```ts
cardOuter: {
  width: '100%',
  maxWidth: 340,
  alignSelf: 'center' as const,
  ...Shadows.modalGlow,
},
cardWrapper: {
  width: '100%',
  position: 'relative' as const,
},
svgBackground: {
  position: 'absolute' as const,
  top: 0,
  left: 0,
},
content: {
  position: 'relative' as const,
  backgroundColor: 'transparent',
  paddingHorizontal: 24,
  paddingVertical: 24,
  alignItems: 'center' as const,
  gap: Spacing.md,
},
```

Notes:
- `paddingHorizontal: 24` / `paddingVertical: 24` keeps all content clear of the 16px cut corners (24 > 16 on both axes).
- `gap: Spacing.md` preserves prior card spacing.
- Height is content-driven — no fixed height. `onLayout` on `cardWrapper` captures the actual rendered height.
- `maxWidth: 340` + `alignSelf: 'center'` now live on `cardOuter` (was inline `style={{ width: '100%', maxWidth: 340 }}`).
- Ensure `Shadows` is imported in `confirmModalStyle.ts` (check current imports before editing).

Validation:
- White title + secondary message legible over `modalFill` dark gradient.
- Buttons full-width inside content, not overlapping corners.
- `npm run lint`, `npx tsc --noEmit` pass.

---

## Phase 5 — Style cleanup

### `assets/styles/confirmModalStyle.ts`

- **DELETE** `gradientBorder` style block — replaced by SVG frame path.
- **DELETE** `card` style block — replaced by `content`.
- **KEEP**: `overlay`, `iconCircle`, `iconCircleDestructive`, `title`, `message`, `buttonRow`, `buttonRowSingle`, `buttonFlex`, `dangerButton`.
- **KEEP** `Radius` import — still used by `dangerButton` (`Radius.md`).
- **KEEP** `Shadows` import — now used by `cardOuter`.
- **KEEP** `Colors`, `Spacing` imports — still used.

### `components/ConfirmModal.tsx`

- Grep for `LinearGradient` — if zero remaining occurrences, remove `import { LinearGradient } from 'expo-linear-gradient';`.
- Confirm no reference to `styles.gradientBorder` or `styles.card` remains.

Validation:
- `npm run lint` (no unused-import errors).
- `npx tsc --noEmit` (no missing-style-key errors).
- `grep -n "gradientBorder\|styles\.card\b" components/ConfirmModal.tsx` returns nothing.

---

## Risks and Edge Cases

1. **First render 0×0** — Guarded: `handleCardLayout` ignores `width/height <= 0`; SVG draws at `DEFAULT_CARD` (340×200) then snaps to real size on first layout. One-frame mismatch is hidden by `animationType="fade"`. Fallback if flicker observed: gate SVG behind a `measured` boolean — only render `<Svg>` after `handleCardLayout` has fired once with real dimensions.
2. **Short card (~140px tall)** — `clampCut` caps `cut` at `min(W,H)/2`; inner cut reduced by border then re-clamped — no corner overlap.
3. **Tall card (~400px tall)** — `CORNER_CUT` constant; octagon scales via W/H — corners stay proportional.
4. **Width ~340 (maxWidth hit)** — `cardOuter maxWidth:340` + `paddingHorizontal:24` keeps buttons within bounds; SVG measures actual (≤340) width.
5. **Loading height shift** — `dangerButton` fixed height and AuthButton fixed height keep button rows constant; minimal height change. `onLayout` re-fires and SVG redraws. No fixed card height → no clipping.
6. **Box-shadow is rectangular** — accepted; matches prior `gradientBorder` glow behavior. The teal glow reads as a soft halo; the crisp octagon edge is the SVG fill.
7. **react-native-svg Defs/Stop on Android New Architecture** — react-native-svg 15.x supports Fabric; `BackButton` already renders SVG successfully in this app. SVG gradient defs are standard — low risk.

## Open Questions

- `CORNER_CUT = 16` and `BORDER_THICKNESS = 3` are initial values; tune visually during Phase 3 check.
- `modalFill` hex (`#0E3A44` → `#0A1430`) may be tuned for contrast against the teal frame — adjust only in `constants/theme.ts`.

---

## Validation Commands

```powershell
npm run lint
npx tsc --noEmit
```

Manual device checklist:
- [ ] Octagon teal frame renders crisply on quick-game exit modal
- [ ] Dark teal→navy fill renders with diagonal gradient
- [ ] White title + secondary text legible over dark fill
- [ ] AuthButton ghost cancel + destructive red confirm + gradient confirm all visible/functional
- [ ] Modal opens instantly (no bounce, no scale) via native fade
- [ ] `modal` sound plays once on open; `button` sound on confirm/cancel
- [ ] Backdrop dismiss works (guarded while loading)
- [ ] Profile logout modal looks identical
- [ ] No layout overflow on small screens; no clipped corners
- [ ] Content-driven height: short message card and long message card both correct

PLAN_READY: thoughts/shared/plans/2026-06-13_modal-octagon-border.md
