# Auth Service Extraction (Behavior-Preserving)

Date: 2026-06-13
Scope: Extract raw Appwrite `account.*` calls out of `context/AuthContext.js` into a new
`services/authService.js` of pure, stateless async functions. NO functional change.

## Goal

Extract all Appwrite-backed authentication logic out of `context/AuthContext.js`
into a dedicated `services/authService.js` module. After extraction,
`AuthContext.js` becomes a thin React state/provider layer that delegates every
network call to the service. This isolates side effects, makes the auth logic
unit-testable independently of React, and aligns auth with the existing
`services/questionService.js` pattern.

Behavior must remain identical: the email-verification gate, orphaned-session
cleanup, guest sign-in naming, and resend-verification temporary-session
cleanup all continue to work exactly as today.

## Files to Change

- `context/AuthContext.js` — strip Appwrite calls, delegate to authService,
  keep React state, the provider, `isGuest` derivation, loading gate, and styles.

## Files to Create

- `services/authService.js` — pure async functions wrapping `account` (Appwrite).

## Service API (services/authService.js)

All functions are `async` and exported as NAMED exports. They wrap `account`
from `../lib/appwrite` and throw on error (callers handle state). The service
holds NO React state.

- `signIn({ email, password })`
  - createEmailPasswordSession, then nested-try `account.get()` with
    deleteSession-on-failure, then the `emailVerification` gate
    (deleteSession + throw `Error("Email not verified")` with
    `code: "EMAIL_NOT_VERIFIED"`).
  - Returns `{ session, user }` so the context can `setSession`/`setUser`.
- `signUp({ email, password, name })`
  - create → createEmailPasswordSession → best-effort updateName →
    best-effort createVerification(VERIFICATION_URL) → deleteSession(session.$id).
  - Returns `{ success: true, requiresVerification: true, verificationSent }`.
  - DROP all the Turkish emoji `console.log` debug lines. Keep a single
    `console.error("signUp error:", error)` before rethrow (English).
- `signOut()`
  - deleteSession("current"). On error: `console.error("signOut error:", error)`
    then rethrow. (Single log + throw.)
- `getCurrentSession()`
  - returns `account.getSession("current")`.
- `getCurrentUser()`
  - returns `account.get()`.
- `createPasswordRecovery(email)`
  - createRecovery(email, resetUrl). Returns `{ success }` / `{ success, error }`
    exactly as today (keep `console.error("Password recovery error:", error)`).
  - `error` field is `error.message` (string) — do NOT change to the raw object.
- `resendVerification({ email, password })`
  - createEmailPasswordSession → try createVerification(VERIFICATION_URL) →
    finally deleteSession with swallowed cleanup error
    (`console.warn("resendVerification: deleteSession cleanup failed", ...)`).
    Returns `{ success }` / `{ success, error }`. Keep
    `console.error("Resend verification error:", error)`.
  - `error` field is the raw error object (NOT `.message`) — preserves existing asymmetry
    with createPasswordRecovery. Do NOT normalize.
- `signInAsGuest()`
  - createAnonymousSession → first get() (name derivation) → build
    `MS-<tail4><rand3>` name → best-effort updateName → second get() (load-bearing,
    picks up updated name) → getSession("current").
  - Returns `{ session, user }`.
  - TWO `account.get()` calls — do NOT collapse to one.

Move the `VERIFICATION_URL` constant (env-or-default) into authService and use
it in both `signUp` and `resendVerification`. The recovery reset URL is a
DIFFERENT literal (`https://reset-expo.vercel.app/reset-password`) and stays
local to `createPasswordRecovery` — do NOT merge them.

## Implementation Steps

### Phase 1 — Create services/authService.js

No changes to AuthContext in this phase. After Phase 1 the service exists,
lints, and compiles but is not yet wired in.

1. Create `services/authService.js`.
2. Add `import { account } from "../lib/appwrite";`
3. Add the single `VERIFICATION_URL` constant:
   ```js
   const VERIFICATION_URL =
     process.env.EXPO_PUBLIC_VERIFICATION_URL ||
     "https://reset-expo.vercel.app/verify-email";
   ```
4. Implement and export each function from the Service API above.
   Exact `signIn` control flow:
   ```js
   export async function signIn({ email, password }) {
     const session = await account.createEmailPasswordSession(email, password);
     let user;
     try {
       user = await account.get();
     } catch (err) {
       await account.deleteSession("current");
       throw err;
     }
     if (!user.emailVerification) {
       await account.deleteSession("current");
       throw Object.assign(new Error("Email not verified"), { code: "EMAIL_NOT_VERIFIED" });
     }
     return { session, user };
   }
   ```
   Exact `signUp` control flow (note the `if (name)` guard — must fire only when name is truthy):
   ```js
   export async function signUp({ email, password, name }) {
     await account.create("unique()", email, password, name || undefined);
     const session = await account.createEmailPasswordSession(email, password);
     if (name) {
       try { await account.updateName(name); } catch { /* non-blocking */ }
     }
     let verificationSent = false;
     try {
       await account.createVerification(VERIFICATION_URL);
       verificationSent = true;
     } catch { /* non-blocking */ }
     try {
       await account.deleteSession(session.$id);
     } catch (deleteError) {
       console.warn("signUp: deleteSession failed", deleteError);
     }
     return { success: true, requiresVerification: true, verificationSent };
   }
   ```
   Exact `signInAsGuest` control flow:
   ```js
   export async function signInAsGuest() {
     await account.createAnonymousSession();
     const u = await account.get();                     // first get: name derivation
     const tail = String(u.$id).slice(-4).toUpperCase();
     const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
     const guestName = `MS-${tail}${rand}`;
     try { await account.updateName(guestName); } catch { /* non-blocking */ }
     const user = await account.get();                  // second get: picks up updated name
     const session = await getCurrentSession();
     return { session, user };
   }
   ```
5. Conventions: no React imports, no module-level state, English identifiers,
   `console.error`/`console.warn` for real failures only.

**Phase 1 validation:**
```bash
npm run lint
npx tsc --noEmit
```
Expect: no errors. authService is unreferenced — no consumers yet.

---

### Phase 2 — Refactor context/AuthContext.js

**Pre-edit check (Platform):** Grep `Platform` in `context/AuthContext.js`.
Confirmed: `Platform` appears only on the import line and in the dropped signup
debug log (`platform: Platform.OS`). After dropping the debug log it has zero
remaining uses → REMOVE from the react-native import. If a re-check finds any
other `Platform` use outside the debug log, KEEP the import instead.

1. Remove `Platform` from the `react-native` import (confirmed unused after
   debug log removal).
2. Remove `import { account } from "../lib/appwrite";` — no direct `account`
   calls remain in the context after this phase.
3. Remove the module-level `VERIFICATION_URL` constant (lines 12–14) — it now
   lives in authService.
4. Add named import from authService:
   ```js
   import {
     signIn,
     signUp,
     signOut,
     getCurrentSession,
     getCurrentUser,
     createPasswordRecovery,
     resendVerification,
     signInAsGuest,
   } from "../services/authService";
   ```
5. **`checkAuth`** — replace direct `account.*` calls:
   ```js
   const responseSession = await getCurrentSession();
   setSession(responseSession);
   const responseUser = await getCurrentUser();
   setUser(responseUser);
   ```
   Keep the existing `catch` block verbatim (isExpectedAuthState branching,
   `setSession(null)/setUser(null)`) and `finally { setLoading(false); }`.

6. **`signin` wrapper** (keep public name `signin`, lowercase; plain async function — no useCallback):
   ```js
   const signin = async ({ email, password }) => {
     setLoading(true);
     try {
       const { session, user } = await signIn({ email, password });
       setSession(session);
       setUser(user);
     } catch (error) {
       throw error;
     } finally {
       setLoading(false);
     }
   };
   ```

7. **`signout` wrapper** (keep public name `signout`, lowercase; plain async function — no useCallback):
   ```js
   const signout = async () => {
     setLoading(true);
     try {
       await signOut();
       setSession(null);
       setUser(null);
     } catch (error) {
       throw error;
     } finally {
       setLoading(false);
     }
   };
   ```
   DROP the Turkish `console.error("Çıkış yapılırken hata:", error)` — authService
   already logs once. Net: one log + throw (unchanged behavior).

8. **`signup` wrapper** (keep public name `signup`, lowercase; plain async function — no useCallback):
   ```js
   const signup = async ({ email, password, name }) => {
     setLoading(true);
     try {
       return await signUp({ email, password, name });
     } catch (error) {
       throw error;
     } finally {
       setLoading(false);
     }
   };
   ```
   All emoji/Turkish debug logs are dropped (they exist nowhere after this).

9. **`createPasswordRecovery`** — no React state interaction; expose the imported
   function directly in contextData. Remove the local function definition and
   reference the import in contextData:
   ```js
   // No local wrapper — imported createPasswordRecovery used directly
   ```
   Watch for name shadowing: the imported symbol is `createPasswordRecovery` —
   do not define a local with the same name.

10. **`resendVerification`** — same as step 9: no React state interaction; expose
    the imported function directly in contextData. Remove the local definition.

11. **`signinAsGuest` wrapper** (keep public name `signinAsGuest`, lowercase; plain async function — no useCallback):
    ```js
    const signinAsGuest = async () => {
      setLoading(true);
      try {
        const { session, user } = await signInAsGuest();
        setSession(session);
        setUser(user);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };
    ```

12. Keep `isGuest` derivation (exact condition) unchanged:
    ```js
    const isGuest = Boolean(
      user && typeof user === "object" &&
        (user.email === "" ||
          (typeof user.name === "string" && user.name.startsWith("MS-")))
    );
    ```

13. Keep `contextData` keys and names identical:
    ```js
    const contextData = {
      session, user, isGuest,
      signin, signout, signup,
      createPasswordRecovery, resendVerification, signinAsGuest,
    };
    ```

14. Keep provider JSX, loading ActivityIndicator gate, `useAuth`, and `styles`
    exactly as-is.

**Phase 2 validation:**
```bash
npm run lint
npx tsc --noEmit
```
Then grep for stray `account.` in AuthContext — expect zero matches.

---

### Phase 3 — Manual Smoke Test

Human-run checklist (must behave exactly as before):

- [ ] Sign in with a VERIFIED account → lands in app, session/user set.
- [ ] Sign in with an UNVERIFIED account → EMAIL_NOT_VERIFIED error surfaced to
      screen; no live session after (deleteSession ran inside signIn).
- [ ] Sign up → account created, verification email sent, returns
      `{ success:true, requiresVerification:true, verificationSent }`.
- [ ] Guest login → display name starts with `MS-`; `isGuest` is true in profile.
- [ ] Logout → session/user cleared, redirected to signin.
- [ ] Password recovery → success/failure toast as before (never throws).
- [ ] Resend verification → success/failure as before (never throws), no leftover
      session.

## Risks and Edge Cases

1. **signin verification-gate ordering** — Gate runs BEFORE `return { session, user }`,
   so AuthContext never calls setSession/setUser for an unverified user. Do not
   move the gate after the return.
2. **signup deleteSession by `session.$id`** — Must NOT become `"current"`. The
   session variable at that point holds the createEmailPasswordSession result;
   `session.$id` is its ID.
3. **resendVerification finally-cleanup** — The inner `finally` runs on BOTH
   success and failure of createVerification. Its own deleteSession error must be
   swallowed (console.warn only). Outer catch still returns `{ success:false, error }`.
4. **createPasswordRecovery vs resendVerification error field** — createPasswordRecovery
   returns `error.message` (string); resendVerification returns `error` (object).
   This asymmetry is existing; do NOT unify.
5. **signinAsGuest double get()** — Both load-bearing. First: `$id` for name. Second:
   updated name. Do not collapse to one call.
6. **Name shadowing** — Imported `createPasswordRecovery` and `resendVerification`
   share names with the removed local functions. There should be no local definitions
   with those names after removing the old functions in step 9–10.
7. **Public API names** — `useAuth()` exposes lowercase names (`signin`, `signout`,
   `signinAsGuest`). authService uses camelCase (`signIn`, `signOut`, `signInAsGuest`).
   Never rename the contextData keys — all consumer screens depend on them.
8. **Unused imports after refactor** — `account`, `Platform`, `VERIFICATION_URL` must
   all be removed from AuthContext after Phase 2 to avoid lint failures.
9. **Loading toggle asymmetry** — createPasswordRecovery and resendVerification do NOT
   toggle `loading`. signin/signup/signout/signinAsGuest/checkAuth DO. Preserve this
   asymmetry exactly.

## Consumers (must not break)

| File | useAuth fields |
|---|---|
| `app/(app)/_layout.tsx` | `session` |
| `app/(app)/profile.tsx` | `user`, `isGuest`, `signout` |
| `app/(app)/index.tsx` | `user` (reads `user.prefs?.streakCount`) |
| `app/signin.jsx` | `session`, `signin`, `signinAsGuest`, `resendVerification` |
| `app/signup.jsx` | `session`, `signup` |
| `app/forgot-password.jsx` | `createPasswordRecovery` |

`app/verify-email.jsx` — out of scope; keeps direct `account` import.

## Backlog (not in this work)

`app/verify-email.jsx` could later call a new `authService.verifyEmail(userId, secret)`
instead of importing `account` directly. Out of scope for this extraction.

## Validation Commands

```bash
npm run lint
npx tsc --noEmit
```
