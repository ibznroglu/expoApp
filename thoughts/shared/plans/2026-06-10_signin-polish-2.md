# Signin Polish 2 — Implementation Plan

**Date:** 2026-06-10
**Topic:** Keyboard reliability, vivid non-purple inputs, unique guest names
**Status:** Ready for plan-reviewer

> Verification gate: confirmed working (3 probes + 2 real-email device tests). No change.

---

## Phase 1 — Keyboard: open reliably on first tap (no library)

### Problem
`KeyboardAvoidingView behavior="padding"` wrapping a `ScrollView` in
`app/signin.jsx` causes a layout shift on focus that cancels the first tap on
iOS ("must tap several times"). Per-platform behavior did not fix it.

### Fix (Expo Go compatible, no new dependency)
1. In `app/signin.jsx`, remove the `KeyboardAvoidingView` wrapper entirely
   (and its `Platform` import if it becomes unused after removal).
2. On the `ScrollView`, add `automaticallyAdjustKeyboardInsets={true}` (iOS
   handles the inset automatically; Android relies on the default `adjustResize`).
3. Keep `keyboardShouldPersistTaps="handled"` and `contentContainerStyle={authStyles.scrollContent}`.

> Scope: signin only. signup/forgot/verify get the same treatment in their own
> redesigns. If `react-native-keyboard-controller` is ever needed it requires a
> dev build (not Expo Go) — not used here.

---

## Phase 2 — Vivid, non-purple input surfaces

### Problem
`AuthInput` field bg is `Colors.ui.socialBg` = `rgba(255,255,255,0.08)` —
translucent white over the purple gradient still reads as purple. Needs an
**opaque**, slightly lighter, cooler (non-purple) fill that pops like game UI.

### New tokens (constants/theme.ts) — required, justified
Add under `Colors`:
```ts
// add inside Colors.bg
input: '#1C1640',          // opaque, cooler indigo — distinct from the purple gradient (tune on device)
// add inside Colors.border
cyanSoft: 'rgba(0,212,255,0.22)',  // subtle neon-cyan resting border for inputs
```
Do not change existing token values.

### components/auth/AuthInput.tsx
1. Field `backgroundColor`: `Colors.ui.socialBg` → `Colors.bg.input` (opaque).
2. Default border: `Colors.ui.socialBorder` → `Colors.border.cyanSoft`
   (subtle cyan resting state — vivid game feel).
3. Focus border stays `Colors.accent.cyan` + keep the iOS-only glow (no elevation).
4. Text `Colors.text.primary`, placeholder `Colors.text.muted` (unchanged).

### components/auth/AuthButton.tsx (consistency)
1. `social` variant background: `Colors.ui.socialBg` → `Colors.bg.input`;
   border `Colors.ui.socialBorder` → `Colors.border.cyanSoft`.
2. `ghost` variant (guest): background `Colors.bg.input`, border
   `Colors.border.cyanSoft`, label/icon stay `Colors.text.primary`.
   So inputs + social + guest all share the same opaque vivid surface.

> The exact `#1C1640` value is a starting point; we will fine-tune brightness on
> device. Coder should use the token everywhere so one change re-tunes all.

---

## Phase 3 — Unique guest names

### Problem
`signinAsGuest` builds the name as `"MS-" + String(u.$id).slice(0, 6)`.
Appwrite `unique()` IDs are timestamp-prefixed, so guests created close together
share the same first 6 chars → identical names (`MS-6A28A5` x3 observed).

### Fix (context/AuthContext.js)
1. Use the random tail instead of the timestamp prefix, plus a short random
   suffix for safety:
   ```js
   const tail = String(u.$id).slice(-4).toUpperCase();
   const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
   const guestName = `MS-${tail}${rand}`;
   ```
2. Everything else in `signinAsGuest` unchanged (anonymous session, non-blocking
   updateName, setSession/setUser).
3. Note: each guest login still creates a new anonymous user — that is correct;
   true logout/convert behavior belongs to the future profile screen.

---

## Risks and Edge Cases
| Case | Handling |
|------|----------|
| Removing KeyboardAvoidingView breaks Android | Android uses `adjustResize` by default; `automaticallyAdjustKeyboardInsets` is iOS-only and ignored on Android. Verify on both. |
| `Platform` import left unused | Remove it if no longer referenced (lint will flag). |
| New token too dark/light | Tune `Colors.bg.input` on device; single token drives inputs + buttons. |
| Guest name still collides | `slice(-4)` (random tail) + 3 random chars makes collision effectively impossible. |
| Other auth screens still flap on keyboard | Out of scope; fixed in their redesigns. |

---

## Validation Commands (every phase)
```bash
npm run lint
npx tsc --noEmit
```
Manual device checks (iOS + Android):
- [ ] Tap email/password → keyboard opens on the FIRST tap, every time; text visible.
- [ ] Inputs + social + guest buttons render opaque and non-purple, vivid; cyan focus.
- [ ] Two guest logins in a row produce two DIFFERENT MS- names.

---

## Running with Claude Code
Human drives transitions; one delegated step per turn; commit only when told.

```
@coder @thoughts/shared/plans/2026-06-10_signin-polish-2.md implement ONLY Phase 1. Remove KeyboardAvoidingView from app/signin.jsx (and unused Platform import), add automaticallyAdjustKeyboardInsets to the ScrollView, keep keyboardShouldPersistTaps. Run npm run lint && npx tsc --noEmit. STOP — no review/test/commit. Output PHASE_COMPLETE.
```
Then `@code-reviewer`, `@tester`, human commits. Repeat for Phases 2–3. `/compact` near 60%.
