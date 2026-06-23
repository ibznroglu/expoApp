# Loading Spinner — Implementation Plan

**Date:** 2026-06-23
**Status:** READY

---

## Goal

Create one shared, themed, animated `<LoadingSpinner>` component — a rotating coral-to-gold arc ring with a bright gold leading dot, empty center reserved for a future logo — and use it to replace all inconsistent ad-hoc full-screen loaders across the app. Native `ActivityIndicator` usage at the button level (`AuthButton`) is intentionally left untouched.

---

## Files to Change

| File | Change |
|------|--------|
| `context/AuthContext.js` | Replace `SafeAreaView` + `ActivityIndicator` loading gate (~133-140) with `<LoadingSpinner fullscreen label="Yükleniyor…" />`. Remove now-unused `ActivityIndicator`, `SafeAreaView`, `StyleSheet` imports and the `styles` block. |
| `app/(app)/game/quick-game.jsx` | Replace the full-screen loading JSX block (~359-389) with `<LoadingSpinner fullscreen label="Sorular yükleniyor…" />`. |
| `app/verify-email.jsx` | Replace `ActivityIndicator size="large" color="#007AFF"` (~83) with `<LoadingSpinner />` inline. Remove hardcoded color. |

## Files to Create

| File | Purpose |
|------|---------|
| `components/LoadingSpinner.tsx` | Shared reusable spinner component (TypeScript). |

---

## Component Design — `components/LoadingSpinner.tsx`

### Props

```ts
interface LoadingSpinnerProps {
  size?: number;        // diameter in px; default 64
  label?: string;       // optional Turkish text below the spinner
  fullscreen?: boolean; // true = absolute full-screen overlay on Colors.bg.primary
}
```

### Visual design

- **Track ring** (static, behind arc): a full-circle `Circle` in the SVG with no fill, `stroke={Colors.border.white}` (`rgba(255,255,255,0.1)` — the closest existing token to the `rgba(255,255,255,0.08)` used by the inline `TimerArc` in `quick-game.jsx`). `strokeWidth` same as the arc. Renders first (behind) in the SVG child order so the animated arc paints on top. **Note: `TimerArc` is NOT a standalone component file — it is defined inline in `app/(app)/game/quick-game.jsx` lines 64-94.**
- **Arc ring** (animated, on top of track): SVG partial arc ~270° sweep (leaving a 90° gap at the bottom).
- **Gradient**: `SvgLinearGradient` — Stop 0 → `Colors.brand.primary` ('#FF6B35' coral), Stop 1 → `Colors.accent.gold` ('#FFD700' gold).
- **Leading tip dot**: small filled `Circle` at the arc's leading end, `fill={Colors.accent.gold}`, radius ≈ `strokeWidth * 0.6`. `strokeLinecap="round"` on the arc softens the tail.
- **Center**: empty — reserved for future logo drop-in.
- **Animation**: continuous clockwise rotation via `react-native-reanimated ~4.1.1`. `withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false)`.

### Geometry (derived from `size` — no hardcoded hex or raw px outside these)

```ts
const strokeWidth = Math.max(2, Math.round(size / 12));
const radius = (size - strokeWidth) / 2;
const center = size / 2;
const circumference = 2 * Math.PI * radius;
// 270° arc: dashoffset = 25% of circumference
const strokeDashoffset = circumference * 0.25;
```

### Implementation notes

- `react-native-svg ^15.15.5` is installed and already used in this codebase (`TimerArc`). SVG arc is the chosen approach; no View-border fallback needed.
- `react-native-reanimated ~4.1.1` is installed.
- Wrap `Svg` in `Animated.View` (reanimated); rotation `useSharedValue` → `useAnimatedStyle` → `transform: [{ rotate: '${rotation.value}deg' }]`.
- `useEffect` starts animation; cleanup calls `cancelAnimation(rotation)` explicitly (Reanimated 4 auto-cancels on unmount, but explicit call prevents any edge-case console warnings).
- SVG gradient id: `"loadingSpinnerGrad"` — static id acceptable for current single-instance usage (note as future consideration if multiple spinners mount simultaneously).

### Layout modes

**INLINE (default):**
```
[Animated.View — size × size]
  └── [Svg — gradient arc + leading dot]
[Text label — Typography.size.sm, Colors.text.secondary, marginTop: Spacing.sm]  (optional)
```

**FULLSCREEN (`fullscreen={true}`):**
```
[View — StyleSheet.absoluteFillObject, backgroundColor: Colors.bg.primary, zIndex: 999]
  └── [alignItems: 'center', justifyContent: 'center']
       ├── [Animated.View + Svg]
       └── [Text label]  (optional)
```

### Token usage

| Token | Used for |
|-------|----------|
| `Colors.border.white` | Track ring stroke (`rgba(255,255,255,0.1)`) |
| `Colors.brand.primary` | Arc gradient start (coral) |
| `Colors.accent.gold` | Arc gradient end + leading dot (gold) |
| `Colors.bg.primary` | Fullscreen overlay background |
| `Colors.text.secondary` | Label text color |
| `Typography.size.sm` | Label font size |
| `Spacing.sm` | Gap between spinner and label |

---

## Phases

Each phase is independently verifiable: `npm run lint` + `npx tsc --noEmit`.

---

### Phase 1 — Create `components/LoadingSpinner.tsx`

**Goal:** Build the component with correct animation, SVG arc, fullscreen/inline modes, theme tokens.

**Steps:**
1. Create `components/LoadingSpinner.tsx`.
2. Import: `Animated`, `useSharedValue`, `useAnimatedStyle`, `withRepeat`, `withTiming`, `Easing`, `cancelAnimation` from `react-native-reanimated`.
3. Import: `Svg`, `Circle`, `Defs`, `LinearGradient as SvgLinearGradient`, `Stop` from `react-native-svg`.
4. Import: `Colors`, `Spacing`, `Typography` from `@/constants/theme`.
5. Implement geometry (strokeWidth, radius, center, circumference, dashOffset).
6. **Track ring first**: render a static full-circle `Circle` as the first SVG child (no fill, `stroke={Colors.border.white}` — this is `rgba(255,255,255,0.1)`, matching the pattern of the inline `TimerArc` in `quick-game.jsx:77`). This renders behind the animated arc. Add `Colors.border.white` to the theme import.
7. **Animated arc on top**: render the `SvgLinearGradient` arc + leading dot `Circle` as subsequent SVG children. They paint over the track.
8. **Animation loop + cleanup**: start `withRepeat(withTiming(360, …), -1, false)` in a `useEffect`. The `useEffect` cleanup **must** call `cancelAnimation(rotation)` — this is the main technical risk (animation leak / "state update on unmounted component" warning). Even though Reanimated 4 auto-cancels on unmount, explicit cleanup is required here to guarantee no warnings in all fast-unmount scenarios (e.g. auth redirect during game load).
9. Implement INLINE vs FULLSCREEN layout modes.
10. Render optional `label` below spinner using `Typography.size.sm` / `Colors.text.secondary`.
11. `export default LoadingSpinner`.

**Validation:** `npm run lint` + `npx tsc --noEmit`.

---

### Phase 2 — Wire AuthContext loading gate

**Goal:** Replace the inconsistent native gray ActivityIndicator in the provider gate with `<LoadingSpinner fullscreen label="Yükleniyor…" />`.

**Steps:**
1. In `context/AuthContext.js`, import `LoadingSpinner` from `@/components/LoadingSpinner`.
2. Replace the `loading ? <SafeAreaView ...><ActivityIndicator size="large" /></SafeAreaView> : children` block (~133-140) with:
   ```js
   if (loading) return <LoadingSpinner fullscreen label="Yükleniyor…" />;
   return children;
   ```
3. Remove now-unused imports: `ActivityIndicator`, `StyleSheet` from `react-native`; `SafeAreaView` from `react-native-safe-area-context`. Delete the `styles` StyleSheet block (confirm `styles.container` is the only consumer — it is).
4. **Do NOT change the `loading` state logic** — only the rendered JSX changes.

**Validation:** `npm run lint` + `npx tsc --noEmit`.

---

### Phase 3 — Wire quick-game question-load screen

**Goal:** Replace the bespoke gradient + text loading screen with `<LoadingSpinner fullscreen label="Sorular yükleniyor…" />`.

**Steps:**
1. In `app/(app)/game/quick-game.jsx`, import `LoadingSpinner` from `@/components/LoadingSpinner`.
2. Locate the `if (loading) { return ( ... ) }` block (~359-389). Replace the entire return block with:
   ```js
   if (loading) return <LoadingSpinner fullscreen label="Sorular yükleniyor…" />;
   ```
3. The old gradient background + "Bilgi yarışması hazırlanıyor" subtitle text are dropped (fullscreen mode uses `Colors.bg.primary`).
4. `BG_GRADIENT`, `s.loadingText`, `s.loadingSubText` may become orphaned in `quickGameStyle.js` — **do NOT edit `assets/styles/quickGameStyle.js`**; unused stylesheet keys are harmless and lint/tsc do not flag them.
5. Verify `s.centeredFill` and `s.safeArea` are still used by the other render states (error/game-over blocks) before removing any style references.

**Validation:** `npm run lint` + `npx tsc --noEmit`.

---

### Phase 4 — Wire verify-email spinner

**Goal:** Replace the hardcoded iOS-blue ActivityIndicator with `<LoadingSpinner />` inline.

**Steps:**
1. In `app/verify-email.jsx`, import `LoadingSpinner` from `@/components/LoadingSpinner`.
2. Replace `<ActivityIndicator size="large" color="#007AFF" />` (~line 83) with `<LoadingSpinner />`.
3. The surrounding `View` is already `alignItems/justifyContent: 'center'`; inline mode drops in naturally. The "E-posta adresiniz doğrulanıyor..." text below it stays unchanged.
4. Remove `ActivityIndicator` from the `react-native` import.

**Validation:** `npm run lint` + `npx tsc --noEmit`.

---

## What NOT to Touch

- `components/auth/AuthButton.tsx` — inner `ActivityIndicator` is button-level; leave it.
- `app/(app)/profile.tsx` — `getUserStats` is intentionally silent; chips show `"—"` until resolved. No spinner.
- `app/(app)/game/quick-game.jsx` — `submitScore` is fire-and-forget. No spinner.
- `services/`, `lib/`, `.env`, `assets/styles/` — no changes.
- `app/verify-email.jsx` `account.updateVerification()` direct import — do not refactor; only swap the spinner visual.

---

## Risks and Edge Cases

| Risk | Handling |
|------|----------|
| react-native-svg availability | RESOLVED: `^15.15.5` installed, already used by `TimerArc`. SVG arc chosen; no fallback needed. |
| **Reanimated animation leak** ⚠️ | **Main technical risk.** The `withRepeat` loop runs indefinitely. If the component unmounts while the loop is in flight (e.g. auth redirect fires during game question load), Reanimated may emit a "state update on unmounted component" warning or hold a stale animation reference. Fix: `useEffect` cleanup **must** call `cancelAnimation(rotation)` explicitly. Reanimated 4 auto-cancels on unmount, but explicit cancellation is required to guarantee clean behaviour in all fast-unmount paths. Coder must verify no console warnings appear on: (a) game load → immediate back navigation, (b) auth redirect during verify-email. |
| Fullscreen z-index | Use `StyleSheet.absoluteFillObject` + `zIndex: 999`. Quick-game returns the spinner as the sole element when loading; auth gate renders before children — no stacking conflict. |
| Auth gate behavior | Only JSX swapped; `loading` boolean and `setLoading` flow unchanged. |
| Orphaned styles | `loadingText`/`loadingSubText` in `quickGameStyle.js` may go unused after Phase 3. Leave them — harmless, not flagged by lint/tsc. |
| Import alias in `.jsx`/`.js` | `@/` alias works in `.jsx`/`.js` — `quick-game.jsx` already imports `@/components/ConfirmModal`. |
| SVG gradient id collision | Static id `"loadingSpinnerGrad"` is acceptable for current single-instance usage. If multiple spinners ever mount simultaneously, ids could clash — note as future consideration. |

---

## Validation Commands

```bash
npm run lint
npx tsc --noEmit
```

### Device test checklist (after all phases)

- [ ] App launch (auth bootstrap): new coral→gold rotating arc; no native gray ActivityIndicator.
- [ ] Sign-in transition: loading gate shows new spinner.
- [ ] Quick-game load: "Sorular yükleniyor…" with new spinner; old gradient text screen gone.
- [ ] Verify-email: new spinner; no iOS-blue ActivityIndicator.
- [ ] submitScore: no spinner on game-over screen.
- [ ] Profile chips: no spinner; `"—"` until stats load.
- [ ] No reanimated animation-leak warnings in console on unmount (test: navigate away during game question load; navigate away during verify-email; both must be clean).

---

## Out of Scope

- Replacing `AuthButton`'s inner `ActivityIndicator` with `LoadingSpinner` — different concern; leave for a future cleanup pass.
- Adding a loading spinner to `getUserStats` (profile) — intentionally silent.
- Any animation to the `"—"` empty state.
- `getLeaderboard` — not yet wired anywhere in the app.
