# Signin Polish 3 — Offline Errors + tsconfig Cleanup

**Date:** 2026-06-10
**Topic:** Distinct offline/network error message in auth, silence guest console error, clear inherited TS deprecation warnings
**Status:** Ready for plan-reviewer
**Research:** thoughts/shared/research/2026-06-10_offline-auth.md

---

## Phase 1 — Offline-aware auth errors

### Problem (from device test, airplane mode)
- Email signin offline → generic "giriş başarısız"; user can't tell it's a network issue.
- Guest signin offline → same, PLUS a leaked `console.error` (the guest catch was never cleaned like `signin`).

### Network detection
react-native-appwrite wraps a failed fetch as `AppwriteException` with `.code === 0`
(no HTTP status) and a "Network request failed" message. Detect with the SAME
condition already used in `signup.jsx` / `forgot-password.jsx`:
`error?.code === 0 || error?.message?.toLowerCase().includes("network")`.

### Reuse existing Turkish strings (consistency)
Match signup/forgot-password exactly: title **"Ağ Hatası"**, description
**"İnternet bağlantınızı kontrol edin."** Do not invent new copy.

### Changes
1. `context/AuthContext.js` — in `signinAsGuest`'s catch, remove the
   `console.error("Error during guest sign-in:", error)` line (the error is
   already re-thrown and surfaced by the caller's toast). Keep the `throw`.
2. `app/signin.jsx` `handleEmailSignin` catch — add a network branch BETWEEN the
   `EMAIL_NOT_VERIFIED` branch and the final else:
   `else if (error?.code === 0 || error?.message?.toLowerCase().includes("network")) { showToast.error("Ağ Hatası", "İnternet bağlantınızı kontrol edin."); }`
3. `app/signin.jsx` guest inline handler — change `catch {` → `catch (error) {`
   and add the same network branch before the generic error toast.

No new imports or tokens.

---

## Phase 2 — Silence inherited TS deprecation warnings

### Problem
`npx tsc` prints two deprecations for `baseUrl` and `moduleResolution=node10`.
These come from the inherited `expo/tsconfig.base` (in node_modules), not our
own `tsconfig.json`. We cannot edit node_modules.

### Fix
In `tsconfig.json` `compilerOptions`, add:
```json
"ignoreDeprecations": "6.0"
```
This is exactly what the TS warning instructs. Do not change any other compiler
option (keep `moduleResolution: "bundler"`, `paths`, `extends`, etc.).

---

## Risks and Edge Cases
| Case | Handling |
|------|----------|
| Network branch also catches non-network errors | Condition is narrow (code 0 / "network"); wrong-credentials is 401 and still hits the generic branch. |
| ignoreDeprecations value mismatch | TS warning explicitly says "6.0"; use that string. If the TS version rejects it, report — do not guess another value. |
| Guest console removal hides real errors | The error is still thrown and shown via toast; only the console noise is removed. |

---

## Validation Commands (every phase)
```bash
npm run lint
npx tsc --noEmit
```
After Phase 2, `npx tsc --noEmit` should print NO deprecation warnings.
Manual device check (airplane mode, iOS + Android):
- [ ] Email signin offline → "Ağ Hatası / İnternet bağlantınızı kontrol edin." toast, no console error.
- [ ] Guest signin offline → same network toast, no console error.
- [ ] Wrong password (online) → still the credentials error, not the network one.

---

## Running with Claude Code
Human drives transitions; one delegated step per turn; commit only when told.

```
@coder @thoughts/shared/plans/2026-06-10_signin-polish-3.md implement ONLY Phase 1. In context/AuthContext.js remove the guest-signin console.error (keep throw). In app/signin.jsx add a network-error branch (error.code === 0 || message includes "network") to BOTH the handleEmailSignin catch and the guest inline handler (change `catch {` to `catch (error) {`), using showToast.error("Ağ Hatası","İnternet bağlantınızı kontrol edin.") to match signup. Run npm run lint && npx tsc --noEmit. STOP. No review/test/commit. Output PHASE_COMPLETE.
```
Then `@code-reviewer`, `@tester`, human commits. Repeat for Phase 2.
