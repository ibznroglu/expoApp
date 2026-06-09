# Signin Bug Research — 2026-06-09

## 1. Keyboard Dismiss Bug

### Root Cause

`AuthInput.tsx` is clean: `TextInput` is defined at the stable top level (line 68), `focused`
state is component-local (line 47), and `onFocus`/`onBlur` only update that local state —
they never cause a parent re-render or unmount the input.

**Two separate causes, one per site:**

**app/signin.jsx (Android)** — `KeyboardAvoidingView` uses `behavior="height"` on Android
(`signin.jsx:148`). With this mode the KAV shrinks its own height when the keyboard appears.
The inner `ScrollView` has `contentContainerStyle` with `justifyContent: "center"`
(`authStyles.ts:37`). When the KAV shrinks, `justifyContent: "center"` re-centers the
content in the smaller space, which triggers a re-layout that can reposition the focused
TextInput. On some Android builds the OS interprets the positional shift as a tap outside
the input, immediately dismissing the keyboard.

**components/auth/GuestNicknameSheet.tsx (both platforms)** — The outer `Pressable` overlay
(`GuestNicknameSheet.tsx:53`) has `onPress={onClose}`. An inner `Pressable` at line 54 is
supposed to stop propagation via `onPress={() => {}}`, but React Native's Pressable does not
guarantee event cancellation inside a transparent `Modal` on Android. When the keyboard
causes the modal to reposition, a stray touch event can reach the outer overlay, calling
`onClose()`, which sets `visible=false`, collapsing the sheet and keyboard together.

### Proposed Fix (minimal, cross-platform)

**Fix 1 — `app/signin.jsx:148`:** Use `"padding"` on both platforms:
```jsx
// before
behavior={Platform.OS === "ios" ? "padding" : "height"}
// after
behavior="padding"
```
`"padding"` grows the bottom inset on both iOS and Android; it does not shrink the KAV
height, so `justifyContent: "center"` never re-centers mid-interaction.

**Fix 2 — `components/auth/GuestNicknameSheet.tsx:53-54`:** Replace the nested Pressable
propagation-stop pattern with a single `TouchableWithoutFeedback` overlay that explicitly
dismisses the keyboard instead of closing the sheet:
```tsx
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.overlay}>
      <Pressable style={styles.sheetWrapper}>
        {/* sheet content */}
      </Pressable>
    </View>
  </TouchableWithoutFeedback>
</Modal>
```
This means tapping the dark backdrop dismisses the keyboard (not the sheet), which is
standard UX for bottom sheets. A separate "Vazgeç" button still closes the sheet explicitly.
If closing-on-backdrop-tap is desired, add it to `TouchableWithoutFeedback.onPress` after
`Keyboard.dismiss`, or keep a second `Pressable` with a pressed-state guard.

---

## 2. Verification Gate

### Code Path

`context/AuthContext.js:75-83`:
```js
if (responseUser.emailVerification === false) {
  await account.deleteSession("current");
  throw Object.assign(new Error("Email not verified"), {
    code: "EMAIL_NOT_VERIFIED",
  });
}
```
The gate checks the strict boolean `=== false`. The session is deleted before throwing, so
`checkAuth` cannot auto-login on next mount. The `catch` in `signin` (line 87) re-throws,
which propagates `code: "EMAIL_NOT_VERIFIED"` to the UI.

### Appwrite Account State

Queried via MCP (`users_list` with `search: "ibznroglu@gmail.com"`):

```
emailVerification: true
```

The dev account is **already verified**. The gate is correct; it simply never fires for this
account. To test the gate, create a fresh account and attempt signin before clicking the
verification email link.

### Verdict

Gate logic is sound. No code change needed for the gate itself.

---

## 3. Console Error on Wrong Password

### Location

`context/AuthContext.js:88`:
```js
console.error("Error during sign-in:", error);
```

This line is in the outer `catch` and fires for **every** signin failure including:
- Wrong password (Appwrite 401 — expected, normal user error)
- Account not found (401 or 404)
- `EMAIL_NOT_VERIFIED` (thrown by the gate above — also expected)

A typo in the password field therefore pollutes the console with a red error, which is
misleading during development.

### Proposed Fix

Gate the log on unexpected errors only (file: `context/AuthContext.js:87-90`):
```js
} catch (error) {
  const isExpected =
    error?.code === 401 ||
    error?.code === "EMAIL_NOT_VERIFIED" ||
    String(error?.message).toLowerCase().includes("invalid credentials");
  if (!isExpected) {
    console.error("Error during sign-in:", error);
  }
  throw error;
}
```
Pattern matches the existing `checkAuth` error-suppression logic at `AuthContext.js:38-43`.

---

## 4. Password Validation — New Feature Scope

### Current emailValidation shape

`utils/emailValidation.js:93-115` — `validateEmail(email)` returns:
```js
{ valid: true }                      // success — no error key
{ valid: false, error: "Turkish message" }  // failure — specific Turkish message
```
`error` key is absent (not `undefined`) on success. Each error is a specific Turkish sentence
covering format, disposable domain, etc.

### Proposed validatePassword spec

New file: `utils/passwordValidation.js`

```js
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { valid: false, error: 'Şifre gerekli' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Şifre en az 8 karakter olmalıdır' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir büyük harf içermelidir' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir küçük harf içermelidir' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir rakam içermelidir' };
  }
  if (!/[!@#$%^&*()\-_=+\[\]{};':",.<>/?\\|`~]/.test(password)) {
    return { valid: false, error: 'Şifre en az bir özel karakter içermelidir (!@#$% vb.)' };
  }
  return { valid: true };
};
```

Rules fire in order; first failure wins and returns a single specific message (not an array).
Same shape as `validateEmail`: `{ valid, error? }`.

### Enforcement points

| Screen | Check | Reason |
|--------|-------|--------|
| `app/signup.jsx` | Full `validatePassword(password)` — all 5 rules | Primary enforcement; Appwrite enforces min-length server-side but not complexity |
| `app/signin.jsx` | Non-empty only: `!password.trim()` | Wrong password is a backend error, not a format error. Running full validation at signin would reject valid passwords the user forgot to make complex |

Current `app/signin.jsx` already implements the non-empty check at line 84 — no change
needed there. Signup screen will need the full call replacing whatever check it currently
has.

---

## 5. Guest Unique Display Name

### leaderboard-spec.md status

EXISTS at `thoughts/shared/plans/leaderboard-spec.md`. The spec's "Display name fallback"
decision (line 31): "Force name on signup — fix at source." This means the spec expects all
authenticated users to have a non-empty name; it does not explicitly cover guests on the
leaderboard.

Per the spec the leaderboard is per-category and only shows users who have completed ≥ 5
games. Guest sessions may or may not be expected to appear.

### Appwrite collection state

Queried via MCP (`tables_db_list_tables` on `expoAppNew`):

| Collection | Status |
|------------|--------|
| `questions` | EXISTS — the only collection in the database |
| `game_results` | **DOES NOT EXIST** |
| `leaderboard_stats` | **DOES NOT EXIST** |
| `categories` | **DOES NOT EXIST** |

The leaderboard feature has not been set up in Appwrite yet. All three collections from the
spec are missing. The spec notes these require manual Appwrite console setup (schema +
indexes + scheduled Function).

### Proposed strategy

`utils/nicknameSuggest.js` currently generates `randomNickname()` with 14 adjectives × 14
nouns = 196 combinations — a small pool with meaningful collision risk once even ~20 guests
appear simultaneously on the leaderboard.

Proposed uniqueness strategy (to implement when `leaderboard_stats` is created):

1. **Prefix**: `"MS-"` + adjective + noun from existing pool (e.g. `"MS-Bilge Kâşif"`).
   Separates guests visually from registered users on the leaderboard.

2. **Uniqueness check** (in a new `utils/guestName.js`, not in the pure suggestor):
   ```js
   // pseudocode — real impl uses Appwrite databases.listDocuments
   async function uniqueGuestNickname(databases) {
     for (let i = 0; i < 3; i++) {
       const candidate = "MS-" + randomNickname();
       const { total } = await databases.listDocuments(
         "expoAppNew", "leaderboard_stats",
         [Query.equal("userName", candidate)]
       );
       if (total === 0) return candidate;
     }
     // Fallback after 3 collisions: append 3-digit random suffix
     return "MS-" + randomNickname() + "-" + String(Math.floor(Math.random() * 900) + 100);
   }
   ```

3. **Where it runs**: Inside `signinAsGuest` in `context/AuthContext.js`, before
   `account.updateName`. The current flow already has `randomNickname()` as a fallback
   (line 244) — replace that specific call with `uniqueGuestNickname(databases)`.

4. **Prerequisites**: `leaderboard_stats` collection must exist with a `userName` field.
   No unique index on `userName` is needed (or desirable — registered users can share
   display names), so the uniqueness check is application-level, not a DB constraint.

5. **Timing**: Implement this only when the leaderboard feature is being built. The current
   `randomNickname()` call is fine as a placeholder until the collection exists.

---

RESEARCH_READY
