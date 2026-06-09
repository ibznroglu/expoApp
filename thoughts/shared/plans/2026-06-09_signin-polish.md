# Signin Polish — Implementation Plan

**Date:** 2026-06-09
**Topic:** Verification gate correctness, keyboard reliability, console noise, neutral input redesign, signup password hint
**Status:** Revised x2 after plan-reviewer (2026-06-10)

---

## Goal

Fix the issues found in the second on-device test pass and apply the input
restyle. Highest priority: the email-verification gate must **provably** block
unverified email/password logins and show the user a visible warning.

---

## Phase 1 — Verification gate: correctness + proof (HIGHEST PRIORITY)

### Problem
The gate in `context/AuthContext.js` uses a strict equality check
`if (responseUser.emailVerification === false)`. If Appwrite ever returns this
field as `undefined`, missing, or a non-boolean, the strict check is `false`, the
gate is skipped, and an unverified user logs in with no warning.

### Fix
1. Change the gate to a truthy check so any non-verified state blocks:
   `if (!responseUser.emailVerification) { await account.deleteSession("current"); throw Object.assign(new Error("Email not verified"), { code: "EMAIL_NOT_VERIFIED" }); }`
2. **Remove the `console.error` line in the `signin` catch entirely — keep the
   `throw`.** Evidence: a wrong-password attempt still logs "Error during sign-in",
   proving the existing `isExpected` guard does not match the real error shape
   Appwrite returns (the actual `error.code` / `error.type` / `error.message` for
   wrong password are unknown until the proof script runs — see Proof step 2b).
   The fix is: delete the `if (!isExpected) { console.error(...) }` block
   completely. The `throw` stays so the screen continues to show its toast. The
   `isExpected` variable and the check can both be removed since nothing else
   uses them.
3. Do not touch `signup`, `signout`, `createPasswordRecovery`, `resendVerification`,
   `signinAsGuest`.

### Proof (rigorous test — required, NOT committed)
The coder must verify the gate with a real unverified account, not assume:
1. Use the Appwrite MCP to confirm/create a test user whose `emailVerification`
   is `false` (read the user record and report the exact value AND its JS type).
2. Before creating the script, add `scripts/_verify-test.mjs` to `.gitignore`
   (the file is NOT currently covered by any gitignore pattern). Then write the
   temporary throwaway Node script `scripts/_verify-test.mjs` using
   `react-native-appwrite` or `node-appwrite` with two test sequences:
   - **2a — Unverified gate proof:** `createEmailPasswordSession` on the unverified
     test account → `account.get()` → log `typeof user.emailVerification` and its
     value → `deleteSession`. This proves whether the field is a real boolean
     `false` and whether the truthy gate fires.
   - **2b — Wrong-password shape probe:** attempt `createEmailPasswordSession` with
     a deliberately wrong password on any account → catch and log
     `error.code`, `error.type`, `error.message` verbatim. This captures the
     real error shape Appwrite returns so we can confirm the old `isExpected` guard
     would (or would not) have matched it, and validate that removing the log is
     the correct fix.
   Report all output.
3. Delete the temp script after reporting. Optionally remove the `.gitignore`
   entry (or leave it — either is fine). Confirm `git status` shows the script
   gone and no unintended files staged.

### Manual test (human, after Phase 2 toast is in)
- Register a fresh account, do NOT click the email link → try to sign in →
  must be blocked AND show a visible warning (toast).
- Click the email verification link (Vercel page) → sign in again → must succeed.
- Confirm in Appwrite the record flips `emailVerification` to `true` only after
  the link is clicked, never from a login attempt.

---

## Phase 2 — signin.jsx: keyboard reliability + verification feedback

### Keyboard
Root cause: `KeyboardAvoidingView behavior="padding"` wrapping a `ScrollView` is
unreliable on iOS (tap-to-focus flaps) and on Android `padding` fights the default
`adjustResize`.
1. Set `behavior={Platform.OS === "ios" ? "padding" : undefined}` (import `Platform`).
2. Keep `ScrollView keyboardShouldPersistTaps="handled"`.
3. If iOS still shifts, add `keyboardVerticalOffset` rather than reverting.

### Verification feedback (always visible)
The in-page banner can sit below the fold / under the keyboard. In the
`handleEmailSignin` catch, when `error.code === "EMAIL_NOT_VERIFIED"`:
1. Also call `showToast.info("E-postanı doğrula", "Giriş yapmadan önce e-postandaki doğrulama linkine tıkla.")` so the user always sees why login failed.
2. Keep `setNotVerified(true)` so the in-page banner + resend button still render.

---

## Phase 3 — Neutral input restyle (drop purple-on-purple)

### components/auth/AuthInput.tsx
1. Field background: change from `Colors.bg.surface` to a neutral translucent
   surface matching the social buttons (reuse `Colors.ui.socialBg`); default
   border `Colors.ui.socialBorder` (or `Colors.border.white`).
2. Focus state: border `Colors.accent.cyan` (keep cyan as the single accent).
3. **Remove `elevation` from `focusGlow`** (Android redraw flicker on focus);
   keep only the iOS shadow, or drop the glow shadow entirely if it still flickers.
4. Text stays `Colors.text.primary` (white); placeholder `Colors.text.muted`.

### app/signin.jsx / authStyles
1. Guest button: keep neutral (it already uses `ghost`), but ensure it reads as
   distinct from Google/Apple — slightly stronger border (`Colors.border.white`
   at higher opacity) is fine; no purple text. (Coordinate with the ghost variant.)
2. No new theme tokens — reuse existing `Colors.ui.*` / `Colors.border.*`.

> Note: if a needed token is missing, STOP and report — do not invent one.

---

## Phase 4 — signup: password requirement hint

### app/signup.jsx
`signup.jsx` uses the legacy `SignInStyles` system (`assets/styles/signinStyle.js`),
not `authStyles` or `ThemedText`. Do not add new imports.
1. Below the closing tag of the password `TextInput` (before the confirmPassword
   input), insert:
   ```jsx
   <Text style={SignInStyles.forgotPasswordText}>
     En az 8 karakter; büyük harf, küçük harf, rakam ve özel karakter içermeli.
   </Text>
   ```
   `SignInStyles.forgotPasswordText` is already imported. Adjust font size/color
   inline only if the existing style is clearly unreadable — otherwise leave as-is.
2. Pure UI text; no logic change. `validatePassword` already enforces the rule.

---

## Risks and Edge Cases
| Case | Handling |
|------|----------|
| Truthy gate over-blocks verified users | Verified accounts have `emailVerification: true` → `!true` is false → not blocked. Confirmed by the Phase 1 proof. |
| Guests / Google-Apple affected | Guests use `signinAsGuest` (no gate); social not wired. Gate only touches email/password `signin`. |
| `behavior=undefined` Android regression | Default `adjustResize` handles it; verify on a real Android device. |
| Temp test script committed by mistake | Add `scripts/_verify-test.mjs` to `.gitignore` before creating it; delete after running; confirm via `git status`. |
| Removing focus elevation dulls the input | Acceptable; cyan border still signals focus clearly. |

---

## Validation Commands (every phase)
```bash
npm run lint
npx tsc --noEmit
```
Plus the Phase 1 proof output, and the manual device checklist (iOS + Android):
- [ ] Unverified signin → blocked + visible toast warning.
- [ ] Verified signin → success.
- [ ] Keyboard opens on first tap every time, text visible, no blur (both inputs).
- [ ] Wrong password → toast only, no console error.
- [ ] Inputs render neutral (not purple), cyan focus, white text.
- [ ] Signup shows the password requirement hint.

---

## Running with Claude Code
Human drives transitions; one delegated step per turn; commit only when told.

```
@coder @thoughts/shared/plans/2026-06-09_signin-polish.md implement ONLY Phase 1. In context/AuthContext.js: (1) change the emailVerification gate from === false to !responseUser.emailVerification; (2) in the signin catch remove the entire isExpected block and the console.error — keep only the throw. Then run the rigorous proof: add scripts/_verify-test.mjs to .gitignore first, use the Appwrite MCP to confirm a test user with emailVerification false (report exact value + JS type), write scripts/_verify-test.mjs with two sequences — (2a) unverified signin: createEmailPasswordSession -> account.get() -> log typeof+value -> deleteSession; (2b) wrong-password probe on any account: attempt createEmailPasswordSession with a bad password, catch and log error.code, error.type, error.message verbatim — report all output, then DELETE the script and confirm git status is clean of it. Run npm run lint && npx tsc --noEmit. STOP. Do not review/test/commit. Output PHASE_COMPLETE with the full proof output included.
```
Then `@code-reviewer`, `@tester`, human commits. Repeat for Phases 2–4. `/compact` when context nears 60%.
