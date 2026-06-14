# Reusable ConfirmModal + Profile Logout Wiring

Date: 2026-06-14
Author: planner
Status: ready

## Goal

Create a reusable, theme-tokenized `ConfirmModal` component styled in the app's game UI
language, then replace the native `Alert.alert` in the profile logout flow with it.
The component must be flexible (confirm/cancel, destructive, single-button info mode,
optional icon) but not over-engineered (no `children` / custom-content slot yet — YAGNI).

## Files to Change

- `app/(app)/profile.tsx` — replace `Alert.alert` in `handleSignout` with `ConfirmModal`
  + visibility state.

## Files to Create

- `components/ConfirmModal.tsx` — the reusable modal component.
- `assets/styles/confirmModalStyle.ts` — token-only stylesheet (matches
  `profileStyle.ts` convention: named export, `StyleSheet.create`, theme imports).

## Context / Confirmed Facts

- **Theme tokens** (`constants/theme.ts`):
  - `Colors.ui.overlay = 'rgba(0,0,0,0.6)'` exists — use for backdrop (no hardcoded hex).
  - `Colors.bg.card`, `Colors.border.bright`, `Colors.wrong`, `Colors.text.*`,
    `Colors.gradients.brandButton`, `Colors.gradients.background`.
  - `Spacing` (xs=4 sm=8 md=12 lg=16 xl=24 xxl=32), `Radius` (sm=10 md=14 lg=20 xl=28 full=999),
    `Typography.size`, `Typography.family.*` (Nunito), `Shadows.card/button/glow`.
- **AuthButton** (`components/auth/AuthButton.tsx`):
  - Props: `{ label, onPress, variant: 'gradient'|'social'|'ghost', icon?, loading?, disabled? }`.
  - `gradient` = brand CTA, `ghost` = translucent bordered secondary. Fixed `height: 52`
    (≥48 touch target satisfied). No `destructive` variant exists — see Risks.
  - `icon` type is `React.ComponentProps<typeof Ionicons>['name']`.
- **ThemedText** (`components/ThemedText.tsx`):
  - Props: `{ weight?, size?, color?, style?, numberOfLines?, children }`. Default weight
    `regular`, default size `Typography.size.md`. Use for all text.
- **quick-game modal** (`app/(app)/game/quick-game.jsx` lines 759–793) is the visual
  reference: `<Modal transparent animationType="fade" onRequestClose={cancel}>` →
  overlay `View` → card `View` → title + row of two buttons.
  - Its styles (`quickGameStyle.js`): `modalOverlay` (`rgba(0,0,0,0.65)`, centered,
    `paddingHorizontal: Spacing.xl`), `modalCard` (`bg.card`, `Radius.lg`, border
    `border.bright`, `padding: Spacing.xxl`, `width:'100%'`, `gap: Spacing.xl`),
    `questionCardGradientBorder` (padding 1.5, `Radius.lg`, `overflow:'hidden'`) is the
    gradient-border pattern to echo.
  - This is the OLD modal — we do NOT migrate it in this plan.
- **profile.tsx** current logout: `handleSignout` uses `Alert.alert` with Vazgeç (cancel)
  + Çıkış Yap (destructive). On confirm: `setSigningOut(true)` → `await signout()` (no
  reset on success, component unmounts via `(app)/_layout.tsx` redirect) → catch resets
  `signingOut` + `showToast.error`. The "Çıkış Yap" `AuthButton` (ghost) uses
  `loading={signingOut}`.
- **assets/styles/** existing: `signinStyle.js`, `homeStyle.js`, `authStyles.ts`,
  `quickGameStyle.js`, `profileStyle.ts`. New `.ts` files use named export +
  `import { Colors, Spacing, Radius, Shadows } from '@/constants/theme'`.

---

## Phase 1 — Create `components/ConfirmModal.tsx` + `assets/styles/confirmModalStyle.ts`

### Step 1.1 — Create `assets/styles/confirmModalStyle.ts`

Token-only stylesheet. Named export `confirmModalStyles`. Imports:
```ts
import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';
```

Keys:
```ts
export const confirmModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.ui.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  gradientBorder: {
    borderRadius: Radius.lg,
    padding: 1.5,
    overflow: 'hidden',
    ...Shadows.card,
  },
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg.card,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
  },
  iconCircleDestructive: {
    backgroundColor: Colors.wrongBg,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  buttonRowSingle: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  buttonFlex: {
    flex: 1,
  },
  dangerButton: {
    height: 52,
    flex: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.wrong,
  },
});
```

### Step 1.2 — Create `components/ConfirmModal.tsx`

Imports:
```ts
import React from 'react';
import { ActivityIndicator, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthButton from '@/components/auth/AuthButton';
import { confirmModalStyles as styles } from '@/assets/styles/confirmModalStyle';
```

Props type:
```ts
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;   // default 'Tamam'
  cancelLabel?: string;    // default 'Vazgeç'
  onConfirm: () => void;
  onCancel: () => void;
  icon?: IoniconName;
  destructive?: boolean;
  singleButton?: boolean;
  loading?: boolean;
}
```

### Step 1.3 — Component body

```tsx
export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Tamam',
  cancelLabel = 'Vazgeç',
  onConfirm,
  onCancel,
  icon,
  destructive = false,
  singleButton = false,
  loading = false,
}: ConfirmModalProps) {
  const handleRequestClose = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
    >
      {/* Backdrop — tap to cancel (guarded while loading) */}
      <Pressable style={styles.overlay} onPress={handleRequestClose}>
        {/* Inner card — stops tap propagation to backdrop; owns all sizing so gradientBorder only handles visual border/depth */}
        <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 420 }}>
          <LinearGradient
            colors={Colors.gradients.background}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.card}>
              {/* Optional icon */}
              {icon && (
                <View
                  style={[
                    styles.iconCircle,
                    destructive && styles.iconCircleDestructive,
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={30}
                    color={destructive ? Colors.wrong : Colors.text.primary}
                  />
                </View>
              )}

              {/* Title */}
              <ThemedText weight="bold" size={Typography.size.xl} style={styles.title}>
                {title}
              </ThemedText>

              {/* Message */}
              {message && (
                <ThemedText
                  weight="regular"
                  size={Typography.size.md}
                  color={Colors.text.secondary}
                  style={styles.message}
                >
                  {message}
                </ThemedText>
              )}

              {/* Buttons */}
              {singleButton ? (
                <View style={styles.buttonRowSingle}>
                  <AuthButton
                    variant="gradient"
                    label={confirmLabel}
                    onPress={onConfirm}
                    loading={loading}
                  />
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  {/* Cancel */}
                  <View style={styles.buttonFlex}>
                    <AuthButton
                      variant="ghost"
                      label={cancelLabel}
                      onPress={onCancel}
                      disabled={loading}
                    />
                  </View>

                  {/* Confirm — danger styling when destructive */}
                  {destructive ? (
                    <TouchableOpacity
                      style={styles.dangerButton}
                      onPress={onConfirm}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.text.primary} />
                      ) : (
                        <ThemedText weight="bold" size={Typography.size.md} color={Colors.text.primary}>
                          {confirmLabel}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.buttonFlex}>
                      <AuthButton
                        variant="gradient"
                        label={confirmLabel}
                        onPress={onConfirm}
                        loading={loading}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
```

### Phase 1 — Do NOT

- Do NOT add a `children` / custom-content prop.
- Do NOT edit `AuthButton.tsx` (no new variant needed).
- Do NOT touch `quick-game.jsx` or its modal.
- Do NOT use any hardcoded hex — only `Colors.*` tokens.
- Do NOT import or wire this into any screen in Phase 1.

### Phase 1 — Validation

- `npx tsc --noEmit` passes.
- `npm run lint` clean.
- Grep confirms zero hex literals:
  `rg "#[0-9A-Fa-f]{3,8}" components/ConfirmModal.tsx assets/styles/confirmModalStyle.ts`
  returns nothing.

---

## Phase 2 — Wire `ConfirmModal` into `app/(app)/profile.tsx`

### Step 2.1 — Imports + state

- Remove `Alert` from the `react-native` import (line 2). Verify no other `Alert` usage remains (currently only in `handleSignout`).
- Add: `import ConfirmModal from '@/components/ConfirmModal';`
- Add state: `const [logoutModalVisible, setLogoutModalVisible] = useState(false);`

### Step 2.2 — Replace `handleSignout` and add handlers

Remove the entire existing `handleSignout` function and replace with:

```ts
const handleSignout = () => {
  setLogoutModalVisible(true);
};

const handleConfirmLogout = async () => {
  setSigningOut(true);
  try {
    await signout();
    // Session becomes null → app/(app)/_layout.tsx redirects to /signin automatically.
    // Do NOT reset signingOut here — component unmounts.
  } catch {
    setSigningOut(false);
    setLogoutModalVisible(false);
    showToast.error('Hata', 'Çıkış yapılamadı, tekrar dene');
  }
};

const handleCancelLogout = () => {
  setLogoutModalVisible(false);
};
```

### Step 2.3 — Render the modal

Inside the root `<View style={profileStyles.container}>`, after `</SafeAreaView>` (sibling,
not nested inside SafeAreaView), add:

```tsx
<ConfirmModal
  visible={logoutModalVisible}
  icon="log-out-outline"
  title="Çıkış Yap"
  message="Hesabından çıkmak istediğine emin misin?"
  confirmLabel="Çıkış Yap"
  cancelLabel="Vazgeç"
  destructive
  loading={signingOut}
  onConfirm={handleConfirmLogout}
  onCancel={handleCancelLogout}
/>
```

Keep the existing "Çıkış Yap" `AuthButton` (ghost) with `loading={signingOut}` unchanged —
it continues to show the spinner on the profile screen while the request is in flight.

### Phase 2 — Do NOT

- Do NOT change `signout()` semantics or add manual `router` navigation.
- Do NOT touch the `isGuest` / "Hesabını Kaydet" block.
- Do NOT migrate quick-game's modal.
- Do NOT introduce hardcoded hex.

### Phase 2 — Validation

- `npx tsc --noEmit` passes.
- `npm run lint` clean.
- `rg "Alert" app/(app)/profile.tsx` returns nothing (import + usage fully removed).

---

## Risks and Edge Cases

- **No `destructive` variant on AuthButton**: handled by a local danger `TouchableOpacity`
  in ConfirmModal styled with `Colors.wrong` — mirrors quick-game's `modalConfirmBtn`.
  AuthButton is not touched.
- **`loading` prop forwarded to modal**: added so the modal's confirm button reflects
  the in-flight `signingOut` state and prevents double-taps. Cancel is also `disabled`
  during loading.
- **Backdrop tap during logout**: `handleRequestClose` checks `!loading` before calling
  `onCancel`, so the user cannot accidentally dismiss while `signout()` is running.
- **Android hardware back**: `onRequestClose` is wired with the same loading guard.
- **Pressable bubbling**: inner `<Pressable onPress={() => {}}>` swallows taps on the
  card so they do not propagate to the backdrop Pressable.
- **Small screens**: the inner wrapper `Pressable` owns `width:'100%'` + `maxWidth: 420`;
  the overlay's `paddingHorizontal: Spacing.xl` provides screen-edge clearance so the card
  never touches the sides. Buttons are `height: 52` (≥48). Long Turkish labels wrap within
  `flex:1` halves.
- **Turkish characters**: only in UI string literals. All identifiers/comments English.
- **`dangerButton` flex**: In the two-button row, cancel is `flex:1` via `buttonFlex`
  wrapper (AuthButton). The danger `TouchableOpacity` has `flex:1` directly — both
  buttons split the row width evenly.

---

## Overall Validation

1. `npm run lint` — clean.
2. `npx tsc --noEmit` — no errors.
3. `rg "#[0-9A-Fa-f]{3,8}" components/ConfirmModal.tsx assets/styles/confirmModalStyle.ts`
   — no matches (token-only confirmed).
4. Manual device test:
   - Open Profile → tap "Çıkış Yap" → new styled ConfirmModal appears (dark backdrop,
     gradient-bordered card, icon, title, message, two buttons).
   - Tap "Vazgeç" → modal dismisses, still on Profile.
   - Tap backdrop (outside card) → modal dismisses.
   - Tap backdrop **while loading** → nothing happens (loading guard).
   - Tap "Çıkış Yap" (confirm) → spinner shows in danger button, session clears,
     app auto-returns to /signin via `(app)/_layout.tsx`.
   - Simulate signout failure → error toast shown, modal closes, `signingOut` reset,
     Profile screen remains.
   - Verify layout on a small device (≈360px wide) and a large device — card centered,
     nothing clipped, buttons ≥48px, labels wrap cleanly.

PLAN_READY: thoughts/shared/plans/2026-06-12_confirm-modal.md
