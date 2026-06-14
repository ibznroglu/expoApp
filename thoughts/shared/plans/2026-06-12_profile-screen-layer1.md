# Profile Screen — Layer 1 (Skeleton + Real Logout + isGuest)

Date: 2026-06-14
Author: planner
Status: ready

## Goal

Ship a full-screen, auth-protected profile page at `app/(app)/profile.tsx` that:
- Shows the current user's display name with a `Misafir` vs `Üye` badge driven by a new `isGuest` flag from `AuthContext`.
- For guests: shows a primary `Hesabını Kaydet` CTA (navigates to `/signup` for now) plus a `Çıkış Yap` button.
- For registered users: shows profile info (name, email if available) plus a `Çıkış Yap` button.
- Calls the existing `signout()` with an `Alert.alert` confirmation, disabling the button while signout runs.
- Is wired from the home screen's `profile` bottom-nav item.

Layer 1 explicitly EXCLUDES guest→account conversion and account deletion (later layers).

## Files to Change

- `context/AuthContext.js` — add a derived `isGuest` boolean and export it in `contextData`. Fully backward compatible.
- `app/(app)/index.tsx` — change ONLY the `profile` nav item's `onPress` (line 160) to `router.push('/profile')`.

## Files to Create

- `app/(app)/profile.tsx` — the profile screen (TypeScript).
- `assets/styles/profileStyle.ts` — `StyleSheet` object `profileStyles`, theme-token only.

## Files to Remove

- None.

## Context / Confirmed Facts

- `@/` alias maps to the repo ROOT. Therefore:
  - `@/context/AuthContext`, `@/constants/theme`, `@/utils/...` resolve to top-level folders.
  - `@/components/...` resolves to top-level `components/` (NOT `app/components/`). Reusable primitives: `ThemedText.tsx`, `auth/AuthButton.tsx`, `auth/BrandMark.tsx`.
  - `@/assets/styles/...` resolves to top-level `assets/styles/`.
- Theme tokens in `constants/theme.ts`: `Colors`, `Spacing`, `Radius`, `Typography`, `Shadows`. The home BG gradient is `Colors.gradients.background` (`['#2D1B69', '#1A0A4A', '#0D0527']`). Use this token, NOT a re-declared literal.
- `app/(app)/_layout.tsx` guards every file in `(app)` by redirecting to `/signin` when `!session`. `profile.tsx` placed under `(app)` is auto-protected.
- `AuthContext.js` provider value currently: `{ session, user, signin, signout, signup, createPasswordRecovery, resendVerification, signinAsGuest }`. Note: `loading` is NOT currently exported — do not add it in this layer.
- Guest identity facts: an anonymous session is created via `account.createAnonymousSession()`, then the user name is set to `MS-XXXXYYY`. Anonymous Appwrite users have `email === ""`. The `MS-` name prefix is best-effort (the `updateName` call is wrapped in try/catch and may fail), so name alone is NOT reliable. Most reliable primary signal: `email === ""`. Use both for safety.
- `user` state is `false` initially, `null` when logged out, and the Appwrite user object when present. Guard with `user && typeof user !== 'boolean'` (matches the pattern in home screen).
- `ThemedText` props: `weight` ('regular'|'semibold'|'bold'|'extrabold'|'black'), `size` (number), `color` (string), `style`, `numberOfLines`.
- `AuthButton` variants: `gradient` (brand CTA), `social`, `ghost`. Props: `label`, `onPress`, `variant`, `icon?`, `loading?`, `disabled?`. Use `gradient` for `Hesabını Kaydet`, `ghost` for `Çıkış Yap`.
- Icons: `@expo/vector-icons` `Ionicons`. Navigation: `expo-router` `useRouter`.

---

## Phase 1 — AuthContext: add `isGuest`

### Step 1.1 — Compute the derived flag

In `context/AuthContext.js`, inside `AuthProvider`, before the `contextData` object (around line 248), add:

```js
// Anonymous (guest) sessions have no email. signinAsGuest also sets an
// "MS-" display name but that updateName call is best-effort and may fail,
// so the empty-email check is the reliable primary signal.
const isUserObject = user && typeof user === "object";
const isGuest = Boolean(
  isUserObject &&
    (user.email === "" ||
      (typeof user.name === "string" && user.name.startsWith("MS-")))
);
```

No new state, no new effect — purely derived from the existing `user` state.

### Step 1.2 — Export it

Add `isGuest` to the `contextData` object, preserving all existing keys:

```js
const contextData = {
  session,
  user,
  isGuest,
  signin,
  signout,
  signup,
  createPasswordRecovery,
  resendVerification,
  signinAsGuest,
};
```

### Phase 1 — Do NOT

- Touch any other logic in `AuthContext.js`.
- Add, remove, or modify any other exported value.

### Phase 1 — Validation

- `npx tsc --noEmit` (AuthContext is JS but TypeScript checks imports from it).
- Sign in as registered → `isGuest` should be `false`.
- Sign in as guest → `isGuest` should be `true`.

---

## Phase 2 — Stylesheet: `assets/styles/profileStyle.ts`

### Step 2.1 — Create the stylesheet

Mirror the structure/imports of `assets/styles/authStyles.ts`. Import `{ Colors, Spacing, Radius, Typography, Shadows }` from `@/constants/theme`. Export `const profileStyles = StyleSheet.create({ ... })`.

Required style keys (NO hex literals — only theme tokens):

```ts
container: { flex: 1, backgroundColor: Colors.bg.primary }
safeArea: { flex: 1 }
scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl }
header: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md }
backButton: { width: 48, height: 48, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg.input }
identityCard: { alignItems: 'center', padding: Spacing.xl, borderRadius: Radius.lg, backgroundColor: Colors.bg.card, borderWidth: 1, borderColor: Colors.border.default, marginTop: Spacing.lg, ...Shadows.card }
avatarCircle: { width: 88, height: 88, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg.surface, marginBottom: Spacing.md }
displayName: { textAlign: 'center', marginTop: Spacing.xs }
badge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, marginTop: Spacing.sm }
badgeGuest: { backgroundColor: Colors.wrongBg, borderWidth: 1, borderColor: Colors.wrong }
badgeMember: { backgroundColor: Colors.correctBg, borderWidth: 1, borderColor: Colors.correct }
infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border.white, width: '100%' }
infoLabel: { flex: 1 }
infoValue: { flex: 2 }
section: { marginTop: Spacing.xl, gap: Spacing.md }
guestHint: { textAlign: 'center', marginBottom: Spacing.xs }
```

---

## Phase 3 — Profile screen: `app/(app)/profile.tsx`

### Step 3.1 — Imports

```ts
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthButton from '@/components/auth/AuthButton';
import { profileStyles } from '@/assets/styles/profileStyle';
import { showToast } from '@/utils/toast';
```

### Step 3.2 — Component body

```ts
export default function ProfileScreen() {
  const { user, isGuest, signout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const typedUser = user && typeof user !== 'boolean' ? user : null;
  const displayName: string = (typedUser?.name as string | undefined) ?? 'Oyuncu';
  const email: string = (typedUser?.email as string | undefined) ?? '';

  const avatarInitials = useMemo(() => {
    if (!displayName) return '??';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return displayName.substring(0, 2).toUpperCase();
  }, [displayName]);
  ...
}
```

### Step 3.3 — Logout handler

```ts
const handleSignout = () => {
  Alert.alert(
    'Çıkış Yap',
    'Hesabından çıkmak istediğine emin misin?',
    [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await signout();
            // Session becomes null → app/(app)/_layout.tsx redirects to /signin automatically.
            // Do NOT reset signingOut here — component unmounts.
          } catch {
            setSigningOut(false);
            showToast.error('Hata', 'Çıkış yapılamadı, tekrar dene');
          }
        },
      },
    ],
    { cancelable: true },
  );
};
```

### Step 3.4 — Render structure

```
<View style={profileStyles.container}>
  <LinearGradient colors={Colors.gradients.background} style={StyleSheet.absoluteFill} />
  <SafeAreaView style={profileStyles.safeArea} edges={['top']}>
    <ScrollView
      contentContainerStyle={profileStyles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={profileStyles.header}>
        <TouchableOpacity
          style={profileStyles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <ThemedText weight="bold" size={Typography.size.xl}>Profil</ThemedText>
      </View>

      {/* Identity Card */}
      <View style={profileStyles.identityCard}>
        <View style={profileStyles.avatarCircle}>
          <ThemedText weight="black" size={Typography.size.xxl} color={Colors.text.primary}>
            {avatarInitials}
          </ThemedText>
        </View>
        <ThemedText
          weight="bold"
          size={Typography.size.xl}
          numberOfLines={1}
          style={profileStyles.displayName}
        >
          {displayName}
        </ThemedText>
        <View style={[profileStyles.badge, isGuest ? profileStyles.badgeGuest : profileStyles.badgeMember]}>
          <Ionicons
            name={isGuest ? 'person-outline' : 'shield-checkmark'}
            size={14}
            color={isGuest ? Colors.wrong : Colors.correct}
          />
          <ThemedText
            weight="semibold"
            size={Typography.size.xs}
            color={isGuest ? Colors.wrong : Colors.correct}
          >
            {isGuest ? 'Misafir' : 'Üye'}
          </ThemedText>
        </View>

        {/* Registered-only: info rows */}
        {!isGuest && (
          <>
            <View style={profileStyles.infoRow}>
              <ThemedText weight="semibold" size={Typography.size.sm} color={Colors.text.muted} style={profileStyles.infoLabel}>Ad</ThemedText>
              <ThemedText weight="regular" size={Typography.size.sm} style={profileStyles.infoValue}>{displayName}</ThemedText>
            </View>
            {email !== '' && (
              <View style={profileStyles.infoRow}>
                <ThemedText weight="semibold" size={Typography.size.sm} color={Colors.text.muted} style={profileStyles.infoLabel}>E-posta</ThemedText>
                <ThemedText weight="regular" size={Typography.size.sm} numberOfLines={1} style={profileStyles.infoValue}>{email}</ThemedText>
              </View>
            )}
          </>
        )}
      </View>

      {/* Actions */}
      <View style={profileStyles.section}>
        {isGuest && (
          <>
            <ThemedText
              size={Typography.size.sm}
              color={Colors.text.secondary}
              style={profileStyles.guestHint}
            >
              Misafir olarak oynuyorsun. İlerlemeni kaydetmek için hesap oluştur.
            </ThemedText>
            <AuthButton
              variant="gradient"
              label="Hesabını Kaydet"
              icon="person-add"
              onPress={() => router.push('/signup')}
              disabled={signingOut}
            />
          </>
        )}
        <AuthButton
          variant="ghost"
          label="Çıkış Yap"
          icon="log-out-outline"
          onPress={handleSignout}
          loading={signingOut}
        />
      </View>
    </ScrollView>
  </SafeAreaView>
</View>
```

### Phase 3 — Do NOT

- Hardcode any hex color.
- Import from `app/components/` — use `@/components/`.
- Add account deletion or guest→account conversion (later layers).

---

## Phase 4 — Home wiring

### Step 4.1 — Replace the profile nav onPress

In `app/(app)/index.tsx`, find the `profile` entry in `NAV_ITEMS` (line ~160). Its current `onPress` calls `showToast.info(...)`. Change ONLY `onPress`:

```ts
onPress: () => router.push('/profile'),
```

Keep `id`, `iconName`, `iconNameActive`, `label`, `activeColor` unchanged. `router` is already in scope (declared at the top of the component). The nav handler at line ~282 already calls `playUISound('button')` and `setActiveNav(item.id)` before `item.onPress()` — no extra wiring needed.

### Phase 4 — Do NOT

- Change any other `NAV_ITEMS` entry.
- Remove `showToast` import if it's used elsewhere in the file.

---

## Risks and Edge Cases

- **`user` initial state**: `user` can be `false` (initial) or `null` (logged out). The `(app)` guard means an unauthenticated user never reaches this screen, but still guard with `typedUser` defensively.
- **`isGuest` reliability**: `email === ""` is the primary Appwrite anonymous signal; `MS-` name is a secondary fallback. Both checked.
- **Guest avatar initials**: a `MS-XXXX` name yields `'MS'` — acceptable for Layer 1.
- **Signout state leak**: after successful signout the component unmounts; do NOT reset `signingOut` on the success path to avoid "setState on unmounted component" warnings.
- **`Alert.alert` on web**: works via RN Web but native-styled. App is mobile-first; acceptable.
- **`loading` not exported from AuthContext**: intentional — do not add it. Use local `signingOut` state.
- **`@/` alias correctness**: all imports must use `@/components/...` (top-level), NOT `app/components/...`. This is the most likely build error.
- **No hex literals**: `profile.tsx` and `profileStyle.ts` must use only theme tokens. Do NOT copy the home screen's local `BG_GRADIENT` literal — use `Colors.gradients.background`.
- **`Spacing.xxl` / `Radius.full`**: verify these token keys exist in `constants/theme.ts` before using. If missing, use the next available key.

## Validation

1. `npm run lint`
2. `npx tsc --noEmit`
3. Manual device test:
   - `Profil` bottom-nav tab on home → navigates to profile screen (no toast).
   - Registered user: shows `Üye` badge, name, email (if present); no `Hesabını Kaydet` CTA.
   - Guest user (signed in via "Misafir olarak oyna"): shows `Misafir` badge, guest hint text, `Hesabını Kaydet` CTA (navigates to signup screen), and `Çıkış Yap`.
   - `Çıkış Yap` shows Alert confirmation; confirming logs out and lands on sign-in screen; button shows loading state while in progress.
   - Back button (`←`) returns to home.
   - Nothing clips on a small screen (content scrollable; safe-area respected; touch targets ≥48px).

PLAN_READY: thoughts/shared/plans/2026-06-12_profile-screen-layer1.md
