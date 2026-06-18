# Profile Redesign — Game-UI Ornate Identity Card

## Goal
Replace the flat dark profile screen with a game-styled layout: a light peachy/cream gradient background and an ornate cut-corner (octagon) coral-framed identity card with a dashed gold inner border, gold corner studs, gold side diamonds, a dark inner panel, a hexagon coral avatar with initials, name, member/guest badge, and two "Yakında" stat chips. Below the card, two action buttons (`Hesabını Kaydet` gold gradient, guest-only and disabled with a `Yakında` tag; `Çıkış Yap` coral). Remove the old `Ad`/`E-posta` info rows. Preserve the logout/ConfirmModal flow exactly.

## Existing assets confirmed (do not re-derive)
- `Colors.brand.gradient = ['#FF6B35','#FF9500']` (2-stop, coral→orange). Usable for the frame.
- `Colors.gradients.brandButton = ['#FF6B35','#FFB800']` (gold-leaning coral). Used by AuthButton `gradient` variant today.
- `Colors.gradients.modalFill = ['#0E3A44','#0A1430']` (dark teal→navy) — reuse for the dark inner panel.
- `Colors.accent.gold = '#FFD700'`, `Colors.accent.goldDark = '#E5B800'`, `Colors.accent.teal = '#00E5CC'` — all exist; no new accent tokens needed.
- `Colors.correct = '#22C55E'` (used for member badge today), `Colors.wrong = '#EF4444'` (guest badge).
- `octagonPath({width,height,cut})` and `octagonInnerPath(params, border)` in `utils/octagonPath.ts`. `clampCut` already guards small dimensions.
- `ConfirmModal` pattern: `useState(DEFAULT_CARD)` seed, `onLayout` handler guards `width>0 && height>0` and equality-checks before `setState`, absolute `<Svg>` behind a relative content `<View>`. We mirror this.
- `react-native-svg ^15.15.5` and `expo-linear-gradient ~15.0.8` installed.
- `AuthButton` usages: `app/signin.jsx` (gradient/ghost/social ×5), `components/ConfirmModal.tsx` (gradient/ghost ×3), `app/(app)/profile.tsx` (gradient/ghost ×2). None pass color overrides today, so additive optional props are safe.
- `useAuth()` exposes `isGuest` (boolean), `user`, `session`, `signout`, `signinAsGuest`. `isGuest` is the correct guest signal — use it (NOT `!session`).

## Files to Change
- `constants/theme.ts` — add gradient tokens only (Phase 1).
- `components/auth/AuthButton.tsx` — additive optional color props (Phase 2).
- `app/(app)/profile.tsx` — full screen redesign (Phase 4 + 5).
- `assets/styles/profileStyle.ts` — rewrite (Phase 6).

## Files to Create
- `components/ProfileCard.tsx` — ornate SVG identity card (Phase 3).
- `assets/styles/profileCardStyle.ts` — content-layer styles for the card (Phase 3).

---

## Phase 1 — `constants/theme.ts`: token additions only

**Edit** `Colors.gradients` object. Add three entries; do NOT modify existing ones.

```ts
// inside Colors.gradients, after modalFill:
profileBg: ['#FFF5EE', '#FFE8D6'] as const,        // light cream -> warm peach screen bg
profileFrame: ['#FF8A5B', '#FF6B35'] as const,     // coral frame (light->deep), top-left to bottom-right
profileCardFill: ['#0E3A44', '#0A1430'] as const,  // dark inner panel (reuses modalFill values; named separately for intent)
```

Also add to `Colors.text`:
```ts
dark: '#2A1240' as const,         // dark text for light-bg screens
darkMuted: '#6B5A8A' as const,    // muted dark text for subtitles on light-bg screens
```

Also add to `Colors.ui`:
```ts
chipBg: 'rgba(255,255,255,0.06)' as const,  // translucent chip bg on dark card panel
```

Decisions documented:
- `profileFrame` is a NEW 2-stop token (not reusing `brand.gradient`) so the frame reads coral→deeper-coral diagonally rather than coral→orange; keeps it distinct from buttons.
- `profileCardFill` duplicates `modalFill` values intentionally so a future panel tweak won't change modals.
- No new accent tokens: `Colors.accent.gold` and `Colors.accent.teal` already exist.
- `text.dark` / `text.darkMuted` added so no hardcoded colors appear in components on the light screen bg.
- `ui.chipBg` added so no rgba literal appears in styles.

**Validation:** `npx tsc --noEmit` then `npm run lint`.

---

## Phase 2 — `components/auth/AuthButton.tsx`: backward-compatible color override

**Approach (documented decision):** Keep the existing 3 variants. Add a new `'solid'` variant for the coral `Çıkış Yap` button (cleaner than overloading `ghost`), plus an optional `gradientColors` override for the gold `Hesabını Kaydet` button. Both changes are additive; existing call sites are byte-for-byte unchanged at runtime.

**Edit 1 — type union:** extend the variant type to include `'solid'`.

**Edit 2 — props interface** — add after existing props:
```ts
gradientColors?: readonly [string, string]; // overrides default brandButton colors for variant='gradient'
solidColor?: string;                         // fill color for variant='solid'
```

**Edit 3 — `VARIANT_ICON_COLOR` record:** add `solid: Colors.text.primary`.

**Edit 4 — destructure new props** in component signature: `gradientColors`, `solidColor`.

**Edit 5 — gradient branch colors:**
```ts
colors={gradientColors ?? Colors.gradients.brandButton}
```
(When omitted, identical to today.)

**Edit 6 — solid branch.** Before the final return, add:
```tsx
if (variant === 'solid') {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, styles.solid, isDisabled && styles.disabled, { backgroundColor: solidColor ?? Colors.brand.primary }]}
    >
      {content}
    </TouchableOpacity>
  );
}
```

**Edit 7 — `styles`:** add `solid: { ...Shadows.button }` so the coral button gets a drop shadow.

Verify the existing trailing return (social/ghost) is untouched.

**Validation:**
- `npx tsc --noEmit`, `npm run lint`.
- Confirm no regressions: existing call sites in `app/signin.jsx`, `components/ConfirmModal.tsx`, and the old `profile.tsx` pass none of the new props.

---

## Phase 3 — `components/ProfileCard.tsx` + `assets/styles/profileCardStyle.ts`

**Create** `components/ProfileCard.tsx`.

### Imports (top of file — include all; `Circle` is easy to miss)
```ts
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import { octagonPath, octagonInnerPath } from '@/utils/octagonPath';
import { profileCardStyles as cardStyles } from '@/assets/styles/profileCardStyle';
```

### Props
```ts
interface ProfileCardProps {
  name: string;
  email: string;
  isGuest: boolean;
}
```
Initials derivation inside the card via `useMemo`:
```ts
const source = name?.trim() || email?.trim() || '';
const parts = source.split(/\s+/);
const initials = parts.length >= 2
  ? (parts[0][0] + parts[1][0]).toUpperCase()
  : source.slice(0, 2).toUpperCase() || '?';
```

### Constants (top of file)
```ts
const CORNER_CUT = 22;        // outer octagon cut (larger than modal's 16 — more ornate)
const FRAME_THICKNESS = 10;   // coral frame band width
const DASH_INSET = 8;         // gold dashed border inset from inner panel edge
const STUD_RADIUS = 4;        // gold corner stud circle radius
const DIAMOND_SIZE = 9;       // gold side diamond half-diagonal
const HEX_RADIUS = 34;        // avatar hexagon circumradius
const DEFAULT_CARD = { width: 320, height: 240 };
```

### Measurement (mirror ConfirmModal pattern exactly)
```ts
const [cardSize, setCardSize] = useState(DEFAULT_CARD);
const handleCardLayout = (e: LayoutChangeEvent) => {
  const { width, height } = e.nativeEvent.layout;
  if (width > 0 && height > 0) {
    setCardSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }
};
```
Outer wrapper: `<View onLayout={handleCardLayout} style={cardStyles.cardWrapper}>`.

### Local geometry helper
Define `localClamp` inline (byte-identical to `clampCut` in `octagonPath.ts`):
```ts
function localClamp(w: number, h: number, cut: number): number {
  return Math.max(0, Math.min(cut, Math.min(w, h) / 2));
}
```

### SVG layers (absolute, pointerEvents="none")
`<Svg width={W} height={H} style={cardStyles.svgBackground} pointerEvents="none">`:

1. **`<Defs>`** — two `SvgLinearGradient`s:
   - `id="profileFrameGrad"` x1=0 y1=0 x2=1 y2=1, stops from `Colors.gradients.profileFrame[0..1]`.
   - `id="profileCardFill"` x1=0 y1=0 x2=1 y2=1, stops from `Colors.gradients.profileCardFill[0..1]`.

2. **Outer frame path** — `octagonPath({width:W, height:H, cut:CORNER_CUT})` fill `url(#profileFrameGrad)`.

3. **Inner dark panel path** — `octagonInnerPath({width:W, height:H, cut:CORNER_CUT}, FRAME_THICKNESS)` fill `url(#profileCardFill)`.

4. **Dashed gold border:**
   ```ts
   const dashBorder = FRAME_THICKNESS + DASH_INSET;
   const dashPathD = octagonInnerPath({ width: W, height: H, cut: CORNER_CUT }, dashBorder);
   ```
   `<Path d={dashPathD} fill="none" stroke={Colors.accent.gold} strokeWidth={1.5} strokeDasharray="4 4" />`

5. **Corner studs (8):** Let `o = dashBorder`, `innerW = W - 2*o`, `innerH = H - 2*o`, `c = localClamp(innerW, innerH, Math.max(0, CORNER_CUT - dashBorder))`. The 8 vertices:
   ```
   (o+c, o), (o+innerW-c, o), (o+innerW, o+c), (o+innerW, o+innerH-c),
   (o+innerW-c, o+innerH), (o+c, o+innerH), (o, o+innerH-c), (o, o+c)
   ```
   Map to `<Circle cx={x} cy={y} r={STUD_RADIUS} fill={Colors.accent.gold} />`.

6. **Side diamonds (4):** Centers at `(o+innerW/2, o)`, `(o+innerW/2, o+innerH)`, `(o, o+innerH/2)`, `(o+innerW, o+innerH/2)`. Each:
   ```
   M cx,(cy-DIAMOND_SIZE) L (cx+DIAMOND_SIZE),cy L cx,(cy+DIAMOND_SIZE) L (cx-DIAMOND_SIZE),cy Z
   ```
   `fill={Colors.accent.gold}`.

7. **Hexagon avatar** — flat-top regular hexagon centered at `cx=W/2`, `cy=FRAME_THICKNESS+DASH_INSET+8+HEX_RADIUS`. 6 points:
   ```ts
   Array.from({length:6}, (_, i) => {
     const angle = ((60 * i - 30) * Math.PI) / 180;
     return { x: cx + HEX_RADIUS * Math.cos(angle), y: cy + HEX_RADIUS * Math.sin(angle) };
   })
   ```
   `<Path d="M x0,y0 L x1,y1 ... Z" fill={Colors.brand.primary} stroke={Colors.accent.gold} strokeWidth={1.5} />`

   Overlay initials as SVG `<SvgText>` (import `Text as SvgText` from `react-native-svg`):
   `<SvgText x={cx} y={cy} textAnchor="middle" dy="0.35em" fill={Colors.text.primary} fontSize={22} fontWeight="bold">{initials}</SvgText>`
   (Use `dy="0.35em"` rather than `alignmentBaseline` for cross-platform Android compatibility.)

### Content `<View>` (in normal flow, on top of SVG)
```tsx
<View style={cardStyles.content}>
  {/* spacer to clear the SVG avatar */}
  <View style={{ height: cy + HEX_RADIUS + 12 }} />
  <ThemedText weight="bold" size={Typography.size.xl} numberOfLines={1} color={Colors.text.primary} style={cardStyles.name}>
    {name || 'Oyuncu'}
  </ThemedText>
  <View style={[cardStyles.badge, isGuest ? cardStyles.badgeGuest : cardStyles.badgeMember]}>
    <Ionicons name={isGuest ? 'person-outline' : 'shield-checkmark'} size={14}
      color={isGuest ? Colors.brand.primary : Colors.accent.teal} />
    <ThemedText weight="bold" size={Typography.size.sm}
      color={isGuest ? Colors.brand.primary : Colors.accent.teal}>
      {isGuest ? 'Misafir' : 'Üye'}
    </ThemedText>
  </View>
  <View style={cardStyles.chipRow}>
    {[{ label: 'Skor' }, { label: 'Doğruluk' }].map(({ label }) => (
      <View key={label} style={cardStyles.chip}>
        <ThemedText weight="bold" size={Typography.size.xs} color={Colors.accent.gold}>{label}</ThemedText>
        <ThemedText weight="regular" size={Typography.size.xs} color={Colors.text.secondary}>Yakında</ThemedText>
      </View>
    ))}
  </View>
</View>
```

### `assets/styles/profileCardStyle.ts` (create)
```ts
import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

export const profileCardStyles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    position: 'relative',
    maxWidth: 380,
    alignSelf: 'center',
    ...Shadows.modalGlow,   // teal halo; must NOT be clipped by overflow:hidden
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    position: 'relative',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  badgeGuest: {
    backgroundColor: Colors.wrongBg,
    borderColor: Colors.brand.primary,
  },
  badgeMember: {
    backgroundColor: Colors.correctBg,
    borderColor: Colors.accent.teal,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    width: '100%',
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.ui.chipBg,
    borderWidth: 1,
    borderColor: Colors.border.white,
    gap: Spacing.xs,
  },
});
```

**Validation:** `npx tsc --noEmit`, `npm run lint`. Render on device; confirm card draws correctly with glow shadow visible.

---

## Phase 4 — `app/(app)/profile.tsx`: full screen redesign

**Imports to add:**
```ts
import ProfileCard from '@/components/ProfileCard';
```

**Imports to remove:** _(none in Phase 4 — `useRouter` is still needed by the surviving `router.push('/signup')` call which is replaced in Phase 5; remove `useRouter` in Phase 5.)_

**Edits:**
1. Replace screen `LinearGradient colors` with `Colors.gradients.profileBg`.
2. Header title: `color={Colors.text.dark}` (new token from Phase 1).
3. Replace the entire `identityCard` block with `<ProfileCard name={displayName} email={email} isGuest={isGuest} />`.
4. Remove `avatarInitials` `useMemo` (moved inside ProfileCard).
5. Remove old `Ad`/`E-posta` info rows.
6. `Çıkış Yap` button becomes:
   ```tsx
   <AuthButton
     variant="solid"
     solidColor={Colors.brand.primary}
     label="Çıkış Yap"
     icon="log-out-outline"
     onPress={handleSignout}
     loading={signingOut}
   />
   ```
7. `guestHint` text color → `Colors.text.darkMuted` (new token, readable on cream).

**MUST NOT CHANGE (preserve exactly):**
- `const { user, isGuest, signout } = useAuth();`
- `signingOut`, `logoutModalVisible` state.
- `typedUser`, `displayName`, `email` derivation.
- `handleSignout`, `handleConfirmLogout` (including `try { await signout() } catch`), `handleCancelLogout`.
- The entire `<ConfirmModal …>` block.
- No `router.push` / `router.replace` added anywhere.

**Validation:** `npx tsc --noEmit`, `npm run lint`.

---

## Phase 5 — BUG FIX: disable `Hesabını Kaydet` for guests

Replace the guest `<AuthButton variant="gradient" label="Hesabını Kaydet" …>` with:
```tsx
{isGuest && (
  <View style={profileStyles.saveWrap}>
    <AuthButton
      variant="gradient"
      gradientColors={Colors.gradients.option}
      label="Hesabını Kaydet"
      icon="person-add"
      onPress={() => {}}
      disabled
    />
    <View style={profileStyles.soonBadge}>
      <ThemedText weight="bold" size={Typography.size.xs} color={Colors.bg.primary}>
        Yakında
      </ThemedText>
    </View>
  </View>
)}
```

`Colors.gradients.option` is confirmed `['#FFD700', '#FF8C00']` (gold → dark orange) — use it directly. No `profileSave` token needed.

Also **remove** `useRouter` import in this phase (now unused after removing `router.push('/signup')`).

**Validation:** Manual — tap `Hesabını Kaydet` as a guest: button is greyed, shows `Yakında`, nothing navigates.

---

## Phase 6 — `assets/styles/profileStyle.ts`: rewrite

**Remove** (no longer referenced): `identityCard`, `avatarCircle`, `displayName`, `badge`, `badgeGuest`, `badgeMember`, `infoRow`, `infoLabel`, `infoValue`.

**Keep:** `container`, `safeArea`, `scrollContent`, `header`, `section`, `guestHint`.

**Update:** `container.backgroundColor` → `Colors.gradients.profileBg[0]` (cream flash instead of navy).

**Add:**
```ts
saveWrap: {
  position: 'relative' as const,
},
soonBadge: {
  position: 'absolute' as const,
  top: -6,
  right: -6,
  paddingHorizontal: Spacing.sm,
  paddingVertical: Spacing.xs,
  borderRadius: Radius.full,
  backgroundColor: Colors.accent.gold,
  borderWidth: 1,
  borderColor: Colors.accent.goldDark,
},
```

**Validation:**
```powershell
npx tsc --noEmit
npm run lint
# ripgrep check — expect zero hits:
rg "identityCard|avatarCircle|infoRow|infoLabel|infoValue" --type ts
```

---

## Risks and Edge Cases

1. **SVG 0×0 on first render:** `useState(DEFAULT_CARD)` seed + `onLayout` guard + equality check — identical to proven ConfirmModal pattern.
2. **Corner clamp on small screens:** `localClamp` must be byte-identical to `clampCut` so studs land exactly on the dashed vertices.
3. **Light-bg contrast:** Screen text uses `Colors.text.dark` / `Colors.text.darkMuted`. Card panel text uses `Colors.text.primary` (white). Never mix.
4. **AuthButton regression:** New props are optional with `??` fallbacks; all existing call sites pass none → runtime identical. `tsc` confirms.
5. **Glow shadow clipping:** `cardWrapper` and all ancestors must NOT have `overflow:'hidden'`. Current profileStyle has none; keep it that way.
6. **Responsive sizing:** `cardWrapper` uses `maxWidth:380, alignSelf:'center'`. Card never over-stretches on tablets.
7. **Logout flow:** Exact lines to preserve — profile.tsx: `useAuth()` destructure, `signingOut`/`logoutModalVisible` state, `handleSignout`, `handleConfirmLogout` (try/catch), `handleCancelLogout`, the entire `<ConfirmModal>` block.
8. **SVG text baseline on Android:** Use `dy="0.35em"` with `textAnchor="middle"` (not `alignmentBaseline="central"`).
9. **`Colors.gradients.option`:** Verify its value before using in Phase 5; if not gold-toned, add `profileSave` token in Phase 1.

---

## Validation Commands

```powershell
npm run lint
npx tsc --noEmit
```

Grep checks:
```
grep "identityCard|avatarCircle|infoRow|infoLabel|infoValue" across repo  # expect zero
grep "router.push|router.replace" in app/(app)/profile.tsx               # expect zero
grep "<AuthButton" in app/signin.jsx                                      # confirm unchanged
```

## Manual Device Checklist
- [ ] Registered user: cream gradient bg; coral octagon frame with gold dashed inner border, 8 gold studs, 4 gold diamonds; hexagon coral avatar with correct initials; name bold on dark panel; teal `Üye` badge; two `Yakında` chips
- [ ] `Çıkış Yap` is coral solid button with `log-out-outline` door icon
- [ ] Tap `Çıkış Yap` → ConfirmModal opens (fade, instant); confirm → signs out → auth layout redirects; cancel → returns to profile
- [ ] Guest user: coral `Misafir` badge; `Hesabını Kaydet` gold but greyed/disabled with `Yakında` badge; tap does nothing
- [ ] No white text on cream screen bg; no dark text on dark card panel
- [ ] Small screen (iPhone SE): no over-cut corners; studs on vertices; glow visible
- [ ] No `Ad`/`E-posta` info rows visible

PLAN_READY: thoughts/shared/plans/2026-06-13_profile-redesign.md
