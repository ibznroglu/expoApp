# Signin Redesign — Implementation Plan

**Date:** 2026-06-09
**Topic:** Auth foundation + signin screen (App Store / Play Store quality)
**Status:** Ready for plan-reviewer
**Author:** design + planning session (acting as planner)

---

## Goal

Rebuild the signin screen to match the dark-purple theme (`constants/theme.ts`),
introduce reusable auth primitives, and add the system support for **guest login
with a nickname** (guests appear on the leaderboard) and an **email-verification
gate**. Google and Apple buttons are designed in and visible, but ship as
"Yakında" (coming soon) — OAuth wiring is a later, separate phase.

This plan establishes the visual + structural foundation that signup,
forgot-password, and verify-email will reuse, so those later redesigns are
composition only.

### Login methods (final decision)
- **Email + password** — core path, gated on email verification.
- **Guest (anonymous)** — pick a nickname, play immediately, appears on
  leaderboard, can convert to a permanent account later (rank preserved).
- **Google / Apple** — buttons render now, fire a "Yakında" toast. No Facebook.

### Verification rule (clean)
Verification gate applies **only** to the email/password path. Guests (no email)
and Google/Apple (provider-verified) skip it.

---

## Conventions (must follow)

- Import alias: `@/*` → repo root (e.g. `@/constants/theme`, `@/context/AuthContext`).
- English identifiers and comments; Turkish UI strings only.
- Shared, non-route components live in a **top-level `components/` directory**,
  NOT under `app/` (expo-router treats every file in `app/` as a route).
- Reuse existing utilities: `validateEmail` from `@/utils/emailValidation`,
  `showToast` from `@/utils/toast`.
- Keep the signin route file as `app/signin.jsx` (`.jsx`, matching its siblings).
  Do not convert to `.tsx` (avoids an expo-router duplicate-route conflict).
- New primitives are `.tsx` with typed props (covered by `tsc --noEmit`).
- Theme is the single source of truth — no hardcoded hex in screens/primitives.

---

## Files to Change

| File | Change |
|------|--------|
| `constants/theme.ts` | Add `Colors.gradients` (`background`, `brandButton`). |
| `context/AuthContext.js` | Add `signinAsGuest`, `resendVerification`; add email-verification gate to `signin`. Additive only — do not alter existing `signup`/`createPasswordRecovery` logic. |
| `app/signin.jsx` | Full rebuild using new primitives; remove the render-time `setState` anti-pattern. |

## Files to Create

| File | Purpose |
|------|---------|
| `components/ThemedText.tsx` | Text that defaults to the correct Nunito family per `weight` prop. |
| `components/auth/AuthInput.tsx` | Themed input: leading icon, cyan focus border + glow, optional show/hide toggle, error state. |
| `components/auth/AuthButton.tsx` | Button with `variant`: `gradient` (brand CTA) \| `social` (translucent) \| `ghost` (dashed accent). Supports `loading`, `disabled`, `icon`. |
| `components/auth/BrandMark.tsx` | Gradient badge (Ionicons `flash`) + "Bilgi Arenası" wordmark + subtitle. `size` prop. |
| `components/auth/GuestNicknameSheet.tsx` | Bottom sheet: nickname input (prefilled w/ random suggestion), refresh-to-reroll, "Oyna", "Vazgeç". |
| `utils/nicknameSuggest.js` | `randomNickname()` → fun Turkish adjective+noun (e.g. "Bilge Kâşif"). |
| `assets/styles/authStyles.ts` | Shared screen-level layout for auth screens (bg, scroll container, brand block, divider, social row, footer). Reused by later auth redesigns. |

> Old `assets/styles/signinStyle.js` stays untouched — signup/forgot/verify still
> import it until their own redesigns. The new signin uses `authStyles.ts`.

---

## Implementation Steps

The coder implements **one phase per invocation**, then we compact context
(max 60%) before the next. Each phase ends with the validation commands.

### Phase 1 — Theme gradient tokens
1. In `constants/theme.ts`, add to `Colors`:
   ```ts
   gradients: {
     background: ['#2D1B69', '#1A0A4A', '#0D0527'] as const, // matches home BG_GRADIENT
     brandButton: ['#FF6B35', '#FFB800'] as const,
   },
   ```
2. Do not change any existing token values (home/quick-game depend on them).
3. (Optional, non-breaking) In `app/(app)/index.tsx`, the local `BG_GRADIENT`
   may later be replaced with `Colors.gradients.background` — leave for a
   separate cleanup, NOT this phase.

### Phase 2 — Primitives + nickname util
1. `components/ThemedText.tsx`: props `{ weight?: 'regular'|'semibold'|'bold'|'extrabold'|'black'; size?: number; color?: string; style?; children }`.
   Maps `weight` → `Typography.family.*`, defaults `regular`/`Typography.size.md`/`Colors.text.primary`.
2. `components/auth/AuthInput.tsx`: props `{ icon: Ionicons name; placeholder; value; onChangeText; secureToggle?: boolean; keyboardType?; autoCapitalize?; error?: string; editable? }`.
   - Default border `Colors.border.bright`; on focus, border `Colors.accent.cyan` + glow shadow (`shadowColor: Colors.accent.cyan`).
   - Leading icon: muted default, cyan when focused.
   - If `secureToggle`, trailing eye icon toggles `secureTextEntry`.
   - If `error`, border `Colors.wrong` + small error text below.
   - Surface `Colors.bg.surface`, radius `Radius.md`, height 52.
3. `components/auth/AuthButton.tsx`: props `{ label; onPress; variant: 'gradient'|'social'|'ghost'; icon?; loading?; disabled? }`.
   - `gradient`: `LinearGradient` `Colors.gradients.brandButton`, white bold label, `Shadows.button`.
   - `social`: translucent `rgba(255,255,255,0.08)`, 1px `rgba(255,255,255,0.15)` border, icon + label.
   - `ghost`: transparent, dashed `Colors.border.bright` border, accent (`Colors.accent.purpleLight`) icon + label.
   - `loading` → `ActivityIndicator` replaces label; `disabled` → 0.6 opacity, no press.
4. `components/auth/BrandMark.tsx`: gradient badge (radius `Radius.lg`, `Colors.gradients.brandButton`, Ionicons `flash` white) + `ThemedText` wordmark (`black`, 25–27) + subtitle ("Zekânı yarıştır", muted). `size?: 'sm'|'md'`.
5. `components/auth/GuestNicknameSheet.tsx`: props `{ visible; onClose; onSubmit(nickname: string) }`.
   - `Modal` (transparent, slide), dimmed overlay, bottom card (`Colors.bg.card`→`Colors.bg.secondary`, top radius `Radius.xl`, top border `Colors.border.bright`).
   - Header: person icon badge + "Bir takma ad seç" + "Sıralama tablosunda bu isimle görüneceksin".
   - `AuthInput` (icon `sparkles`) prefilled from `randomNickname()`, trailing `refresh` icon re-rolls.
   - Validate `nickname.trim().length >= 2`; else inline error "En az 2 karakter".
   - `AuthButton variant="gradient" label="Oyna"` → `onSubmit(nickname.trim())`.
   - Footer "Vazgeç" → `onClose`.
6. `utils/nicknameSuggest.js`: export `randomNickname()` picking one adjective +
   one noun from two Turkish arrays (≥12 each), e.g. `['Bilge','Çevik','Atik',...]`
   + `['Kâşif','Kartal','Düşünür',...]`. Pure function, no deps.

### Phase 3 — AuthContext additions
1. Add a module constant for the verification URL (reuse signup's value):
   ```js
   const VERIFICATION_URL =
     process.env.EXPO_PUBLIC_VERIFICATION_URL ||
     "https://reset-expo.vercel.app/verify-email";
   ```
2. **Email-verification gate** in `signin`:
   - After `createEmailPasswordSession` + `account.get()`, if
     `responseUser.emailVerification === false`:
     - `await account.deleteSession("current")` (do not leave a live session;
       otherwise `checkAuth` would auto-login on next mount, bypassing the gate),
     - do NOT `setSession`/`setUser`,
     - throw a typed error: `throw Object.assign(new Error("Email not verified"), { code: "EMAIL_NOT_VERIFIED" })`.
   - Else: `setSession` + `setUser` as today.
3. **`resendVerification({ email, password })`** (used by signin's inline banner):
   - `createEmailPasswordSession` → `createVerification(VERIFICATION_URL)` →
     `deleteSession("current")` → return `{ success: true }`.
   - On failure return `{ success: false, error }`. Never leave a session behind.
4. **`signinAsGuest({ nickname })`**:
   - `await account.createAnonymousSession()`,
   - `try { await account.updateName(nickname) } catch { /* keep going, fallback below */ }`,
   - `const responseUser = await account.get()`,
   - if `!responseUser.name`, attempt `updateName(randomNickname())` once as fallback,
   - `setSession(await account.getSession("current"))` + `setUser(responseUser)`.
   - Wrap in `setLoading(true/false)` like `signin`. Throw on hard failure.
5. Add `signinAsGuest`, `resendVerification` to `contextData`. Do not touch
   `signup`, `signout`, `createPasswordRecovery`.

### Phase 4 — Signin screen rebuild (`app/signin.jsx`)
1. Replace the file's body. Remove the render-time `setState` block; the redirect
   is simply:
   ```jsx
   const { session } = useAuth();
   if (session) return <Redirect href="/" />;
   ```
2. Layout: `View` bg → `LinearGradient colors={Colors.gradients.background}` full-fill
   → two soft ambient radial glows (orange top-left, cyan bottom-right) →
   `SafeAreaView` → `KeyboardAvoidingView` (`behavior` iOS `padding`) →
   `ScrollView` (`keyboardShouldPersistTaps="handled"`, `contentContainerStyle`
   grows to fill). Use `authStyles`.
3. Content order: `BrandMark` → `AuthInput` email (icon `mail-outline`,
   `keyboardType="email-address"`, `autoCapitalize="none"`) → `AuthInput`
   password (icon `lock-closed-outline`, `secureToggle`) → "Şifremi unuttum"
   (right-aligned, gold) → `AuthButton gradient "Giriş yap" loading={submitting}`
   → divider "veya" → row of `AuthButton social` Google + Apple →
   `AuthButton ghost "Misafir olarak oyna"` (icon `person-outline`) → footer
   "Hesabın yok mu? Kayıt ol".
4. Email/password submit:
   - Validate with `validateEmail(email)` + non-empty password (inline errors).
   - `await signin({ email, password })`; on success the `session` change
     redirects automatically.
   - `catch`: if `error.code === "EMAIL_NOT_VERIFIED"`, set local
     `notVerified=true` and render an inline banner: "E-postanı doğrulamadın."
     + an `AuthButton ghost "Doğrulama mailini tekrar gönder"` that calls
     `resendVerification({ email, password })`, shows `showToast.success`/`.error`,
     and disables for a 30s cooldown. Otherwise `showToast.error` with a friendly message.
5. Google / Apple buttons → `showToast.info("Yakında", "Google ile giriş yakında!")`
   (and Apple equivalent). Same pattern as home's coming-soon modes.
6. Guest button → open `GuestNicknameSheet`. On submit:
   `await signinAsGuest({ nickname })` → session change redirects. Handle errors
   with `showToast.error`.
7. Forgot/Kayıt links → `router.push("/forgot-password")` / `router.push("/signup")`.
8. Navigation: `expo-router` `useRouter` + `Redirect`. Forms use `onPress`
   handlers and component state — never an HTML `<form>`.

---

## Risks and Edge Cases

| Case | Handling |
|------|----------|
| `updateName` fails after anonymous session created | Guest stays logged in; fall back to `randomNickname()` once; never block entry. |
| Live session left after a blocked (unverified) signin | `signin` and `resendVerification` always `deleteSession` before returning/throwing — otherwise `checkAuth` auto-logins on next mount and bypasses the gate. |
| Resend spam | Disable the resend button for ~30s after a send; rely on Appwrite's own rate limit as backstop. |
| Keyboard covers inputs on small screens | `KeyboardAvoidingView` + `ScrollView` with `keyboardShouldPersistTaps="handled"`. |
| Social buttons look disabled | They are fully tappable and fire a "Yakında" toast; styled as active `social` variant, not dimmed. |
| Guest nickname impersonation / profanity | Out of scope here; note for a later basic blacklist + the leaderboard "misafir" badge (separate leaderboard work). |
| expo-router duplicate route | Keep `app/signin.jsx`; do NOT create `app/signin.tsx`. |
| Components placed under `app/` | All new shared components go in top-level `components/` to avoid phantom routes. |
| Theme regression | Phase 1 only **adds** `Colors.gradients`; no existing token value changes. |

---

## Validation Commands

Run after **every** phase; both must pass:

```bash
npm run lint          # expo lint
npx tsc --noEmit      # type-check (.tsx primitives + theme.ts)
```

Manual device checks (tester checklist, after Phase 4):
- [ ] Email signin with a verified account → lands on home.
- [ ] Email signin with an unverified account → blocked, inline banner + working resend.
- [ ] Wrong password → friendly error toast, no crash.
- [ ] Guest → nickname sheet → "Oyna" → lands on home; reopen app → still same guest.
- [ ] Refresh icon re-rolls nickname; <2 chars shows inline error.
- [ ] Google/Apple → "Yakında" toast.
- [ ] Keyboard does not cover the password field on a small device.
- [ ] Forgot/Kayıt links navigate correctly.

---

## Out of Scope (separate tasks)

- Game route is unprotected: move `app/game/quick-game.jsx` → `app/(app)/game/quick-game.jsx`
  (independent 1-file fix; `router.push('/game/quick-game')` still works).
- signup / forgot-password / verify-email redesigns (reuse this foundation).
- Real Google/Apple OAuth wiring (provider setup + Apple Developer account first).
- Guest→permanent account conversion UI (profile screen).
- Leaderboard "misafir" badge (part of leaderboard work).

---

## Running with Claude Code (VS Code)

Run phases sequentially. **Compact context between phases** (max 60%). Paste these
prompts as-is.

**0. Review this plan first**
```
Use the plan-reviewer subagent to review thoughts/shared/plans/2026-06-09_signin-redesign.md.
Read every file the plan references and verify import paths, existing patterns,
and that AuthContext changes are additive. Output APPROVED or NEEDS_REVISION.
```

**1. Phase 1 — theme tokens**
```
Use the coder subagent to implement ONLY Phase 1 of
thoughts/shared/plans/2026-06-09_signin-redesign.md. Read constants/theme.ts and
neighboring files first. Add only Colors.gradients; change no existing token
values. Then run: npm run lint && npx tsc --noEmit. Report results and output
PHASE_COMPLETE.
```
```
Use the code-reviewer subagent to review Phase 1 of the plan. Then the tester
subagent to run validation. Stop if NEEDS_REVISION/NEEDS_FIXES.
```
*(/compact, then continue.)*

**2. Phase 2 — primitives + nickname util**
```
Use the coder subagent to implement ONLY Phase 2 of
thoughts/shared/plans/2026-06-09_signin-redesign.md. Create the components under
top-level components/ (NOT under app/). Follow theme tokens — no hardcoded hex.
Read constants/theme.ts and an existing screen (app/(app)/index.tsx) to match
StyleSheet/Nunito/Ionicons/LinearGradient patterns. Run npm run lint && npx tsc
--noEmit. Output PHASE_COMPLETE.
```
```
Use the code-reviewer subagent on Phase 2, then the tester subagent. Fix until APPROVED.
```
*(/compact.)*

**3. Phase 3 — AuthContext additions**
```
Use the coder subagent to implement ONLY Phase 3 of
thoughts/shared/plans/2026-06-09_signin-redesign.md. Edit context/AuthContext.js
additively: add signinAsGuest, resendVerification, and the email-verification
gate in signin. Do NOT alter signup/signout/createPasswordRecovery. Ensure every
unverified/ resend path calls deleteSession before returning. Run npm run lint &&
npx tsc --noEmit. Output PHASE_COMPLETE.
```
```
Use the code-reviewer subagent on Phase 3 (focus: no leaked sessions, gate cannot
be bypassed on remount), then the tester subagent.
```
*(/compact.)*

**4. Phase 4 — signin screen**
```
Use the coder subagent to implement ONLY Phase 4 of
thoughts/shared/plans/2026-06-09_signin-redesign.md. Rebuild app/signin.jsx with
the new primitives and authStyles. Remove the render-time setState anti-pattern;
use `if (session) return <Redirect href="/" />`. Wire email/guest/social per the
plan. No HTML <form>. Run npm run lint && npx tsc --noEmit. Output PHASE_COMPLETE.
```
```
Use the code-reviewer subagent on Phase 4, then the tester subagent. After
READY_TO_PUSH, commit all changed files including this plan, using a conventional
commit message (e.g. "feat(auth): redesign signin + guest login foundation").
```

---

## Notes for later screens
`authStyles.ts` + the four primitives + `BrandMark` are designed to be reused
verbatim by signup, forgot-password, and verify-email. Those redesigns become
composition + screen-specific copy/validation, so they should each be a single
short phase on top of this foundation.
