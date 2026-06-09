# Signin Fixes + Guest Auto-Name — Implementation Plan

**Date:** 2026-06-09
**Topic:** Post-test bug fixes, strong password validation, guest auto-name
**Status:** Ready for plan-reviewer
**Research:** thoughts/shared/research/2026-06-09_signin-bugs.md

---

## Goal

Fix the issues found during on-device testing and apply two product decisions:
strong password validation at signup, and guest login with an auto-generated
unique `MS-` name (no nickname prompt). Must work identically on iOS and Android.

### Scope (from research)
- **Keyboard dismiss bug** (signin inputs): fix `KeyboardAvoidingView` behavior.
- **Console error on wrong password**: stop leaking it to the user.
- **Strong password**: new `validatePassword`, enforced at signup only.
- **Guest**: remove the nickname sheet; generate `MS-` auto-name on tap; restyle
  the guest button (drop dashed) and add spacing above it.

### Explicitly deferred (not in this plan)
- Email-verification gate is **already correct** (research confirmed; the dev
  account was already verified). No code change — just test with a fresh
  unverified account.
- Guest display-name **uniqueness query**: the leaderboard collections don't
  exist in Appwrite yet, so there is nothing to query against. The `MS-` name
  uses the anonymous `userId` (already unique). The collision check + suffix
  fallback are deferred to the leaderboard feature.

---

## Conventions
- Alias `@/*`; English identifiers/comments, Turkish UI strings.
- Theme tokens only — no hardcoded hex.
- New util follows `utils/emailValidation.js` shape: `{ valid, error? }`, Turkish messages.

---

## Files to Change

| File | Change |
|------|--------|
| `context/AuthContext.js` | `signinAsGuest()` generates an `MS-` name itself (no `nickname` arg); gate the wrong-password `console.error` like the existing `checkAuth` suppression. |
| `context/AuthContext.js` (signup) | Enforce `validatePassword` before `account.create` (Phase 2). |
| `app/signin.jsx` | Fix `KeyboardAvoidingView` behavior; remove `GuestNicknameSheet` usage; guest button calls `signinAsGuest()` directly; add spacing above guest button. |
| `components/auth/AuthButton.tsx` | Restyle `ghost` variant: solid thin border + translucent purple background (drop dashed). |

## Files to Create
| File | Purpose |
|------|---------|
| `utils/passwordValidation.js` | `validatePassword(password)` → `{ valid, error? }`. |

## Files to Delete
| File | Reason |
|------|--------|
| `components/auth/GuestNicknameSheet.tsx` | No nickname step anymore. |
| `utils/nicknameSuggest.js` | Used by `GuestNicknameSheet.tsx` (deleted) and `AuthContext.js` (import removed in Phase 1). |

---

## Implementation Steps

### Phase 1 — AuthContext: guest auto-name + console gate
1. Add a guest-name helper (inline in AuthContext or a tiny local function):
   `MS-` + the anonymous session's `userId` shortened (e.g. first 6 chars,
   uppercased). The anonymous `userId` is already unique, so no query is needed.
2. Change `signinAsGuest` to take **no argument**:
   - Remove the `import { randomNickname } from "@/utils/nicknameSuggest"` line
     at the top of `context/AuthContext.js` — the new implementation does not use it.
   - `await account.createAnonymousSession()`,
   - `const u = await account.get()`,
   - `const guestName = "MS-" + String(u.$id).slice(0, 6).toUpperCase()`,
   - `try { await account.updateName(guestName) } catch { /* non-blocking */ }`,
   - re-fetch user, `setSession(await account.getSession("current"))` + `setUser`,
   - keep `setLoading` in `finally`.
3. Wrong-password console gate: in the `signin` `catch`, suppress logging for
   expected failures the same way `checkAuth` does — skip `console.error` when
   `error.code === 401`, `error.code === "EMAIL_NOT_VERIFIED"`, or the message
   indicates invalid credentials. Still `throw` so the screen shows its toast.
4. Do not touch `signup` here, `signout`, `createPasswordRecovery`, or
   `resendVerification`.

### Phase 2 — Strong password validation
1. Create `utils/passwordValidation.js`:
   ```js
   export const validatePassword = (password) => {
     if (!password || typeof password !== "string")
       return { valid: false, error: "Şifre gerekli" };
     if (password.length < 8)
       return { valid: false, error: "Şifre en az 8 karakter olmalı" };
     if (!/[a-z]/.test(password))
       return { valid: false, error: "Şifre en az bir küçük harf içermeli" };
     if (!/[A-Z]/.test(password))
       return { valid: false, error: "Şifre en az bir büyük harf içermeli" };
     if (!/[0-9]/.test(password))
       return { valid: false, error: "Şifre en az bir rakam içermeli" };
     if (!/[^A-Za-z0-9]/.test(password))
       return { valid: false, error: "Şifre en az bir özel karakter içermeli" };
     return { valid: true };
   };
   ```
2. Enforce at signup: in `app/signup.jsx`, before calling `signup(...)`, run
   `validatePassword(password)`; if `!valid`, show the `.error` inline/toast and
   stop. (Keep the existing confirm-password match check.)
3. Do **not** add this to signin — signin keeps its existing non-empty check, so
   existing users with older passwords can still log in.

### Phase 3 — Signin screen: keyboard fix + guest + restyle
1. `KeyboardAvoidingView`: use `behavior="padding"` for both platforms (research
   found Android `behavior="height"` + centered `scrollContent` causes the blur).
   Ensure `scrollContent` does not force `justifyContent: "center"` in a way that
   shifts on keyboard open — let it grow naturally (`flexGrow: 1`, top-aligned).
2. Remove `GuestNicknameSheet`: delete its import, its `visible` state, and the
   `<GuestNicknameSheet .../>` element. The guest `AuthButton` `onPress` becomes
   `async () => { try { await signinAsGuest(); } catch { showToast.error(...) } }`.
3. Delete `components/auth/GuestNicknameSheet.tsx` and `utils/nicknameSuggest.js`.
4. Restyle `AuthButton` `ghost` variant in `components/auth/AuthButton.tsx`:
   replace the dashed border with a 1.5px solid `Colors.border.bright`, add a
   translucent purple background (use the existing `Colors.ui.socialBg` or a
   purple-tinted token if one exists; if not, reuse `Colors.ui.socialBg` to avoid
   a new token), keep the icon/label in `Colors.accent.purpleLight`.
5. Spacing: add `marginTop: Spacing.lg` above the guest button (in `authStyles`
   or inline) so it is not glued to the social row.
6. The resend-verification button also uses `ghost`; confirm the new ghost style
   still reads well there (it should — same purple secondary action).

---

## Risks and Edge Cases
| Case | Handling |
|------|----------|
| `behavior="padding"` regressions on Android | Verify on a real Android device; if the header is pushed oddly, add a `keyboardVerticalOffset` rather than reverting to `height`. |
| `updateName` fails for guest | Non-blocking; guest still enters with default/empty name. |
| Existing users with weak passwords | Unaffected — validatePassword runs at signup only. |
| Removing the sheet breaks an import elsewhere | Grep for `GuestNicknameSheet` and `nicknameSuggest` before deleting; only signin should reference them. |
| Ghost restyle affects resend button | Intentional and consistent; just verify visually. |

---

## Validation Commands
Run after every phase:
```bash
npm run lint
npx tsc --noEmit
```
Manual device checks (iOS **and** Android), after Phase 3:
- [ ] Tap email / password → keyboard stays open, typed text is visible, no blur.
- [ ] Wrong password → toast only, no red console error.
- [ ] Guest button → enters immediately as "MS-XXXXXX", lands on home; reopen app → same guest.
- [ ] Signup with a weak password → blocked with the specific Turkish error.
- [ ] Fresh unverified account signin → EMAIL_NOT_VERIFIED banner + working resend.

---

## Running with Claude Code
Human drives transitions; one delegated step per turn; commit only when told.

```
@coder @thoughts/shared/plans/2026-06-09_signin-fixes.md implement ONLY Phase 1. Then run npm run lint && npx tsc --noEmit and STOP. Do not review, test, or commit. Output PHASE_COMPLETE.
```
Then `@code-reviewer ... review Phase 1` → `@tester ...` → human commits. `/compact` when context nears 60%. Repeat for Phase 2 and Phase 3.
