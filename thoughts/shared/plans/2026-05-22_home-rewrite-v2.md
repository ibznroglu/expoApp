# Home Screen Rewrite v2 — No-Scroll Layout

## Goal

Full no-scroll redesign of the Bilgi Arenasi home screen (`app/(app)/index.tsx` and `assets/styles/homeStyle.js`). The new layout fits entirely within the device viewport without a ScrollView. It introduces a compact top bar (avatar + username + level badge on the left; coins + lives + streak on the right), a thin full-width XP bar, a three-tab game mode selector ("Hızlı", "Günlük", "Arkadaşlar"), a dominant animated PLAY button with LinearGradient and glow pulse, a three-card stats row, and a two-icon bottom nav (trophy + person). A streak persistence strategy using Appwrite user preferences (`account.updatePrefs`) is specified. No new third-party libraries are introduced.

---

## Layout Sketch

```
┌─────────────────────────────────────────────────────────┐
│  STATUS BAR (safe area top)                             │
├─────────────────────────────────────────────────────────┤
│  [AVATAR][username][Seviye 12]   [🪙1.250][❤5][🔥7]    │  ← TOP BAR ROW
├─────────────────────────────────────────────────────────┤
│  ████████████████████░░░░░░░░░░  340/500 XP             │  ← XP BAR
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [ Hızlı ]  [ Günlük ]  [ Arkadaşlar ]                 │  ← MODE TABS
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │          ▶  OYNA   (glow pulse anim)            │   │  ← PLAY BUTTON ~110px tall
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │ Bugün    │   │ En İyi   │   │ Toplam   │            │  ← STATS ROW
│  │  2.450   │   │  7 gün   │   │  24 oyun │            │
│  └──────────┘   └──────────┘   └──────────┘            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [  🏆 Sıralama  ]        [  👤 Profil  ]               │  ← BOTTOM NAV (2 icons)
│  SAFE AREA BOTTOM                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Change

| File | Action |
|---|---|
| `app/(app)/index.tsx` | Full rewrite |
| `assets/styles/homeStyle.js` | Full replacement |

## Files to Create

None. All required packages (`expo-linear-gradient`, `@expo/vector-icons`, `react-native-safe-area-context`, `expo-router`) are already installed.

---

## Appwrite Streak Decision

**Recommended: `account.updatePrefs` (Appwrite user preferences)**

Appwrite's `account.updatePrefs(prefs: object)` stores an arbitrary JSON object on the authenticated user record. No new collection, no new database document, no extra permissions needed.

Store two keys:
```json
{
  "lastPlayedDate": "2026-05-22",
  "streakCount": 7
}
```

Read with `account.get()` — the `prefs` field is already returned in the `user` object from `AuthContext`. Access as `user.prefs?.streakCount` and `user.prefs?.lastPlayedDate`.

**Trade-offs vs a dedicated `profiles` collection:**

| | `account.updatePrefs` | `profiles` collection |
|---|---|---|
| Setup effort | Zero — no schema changes | New collection + document per user + permissions |
| Query capability | Cannot query across users | Queryable (leaderboards possible) |
| Data size limit | 64 KB per user prefs object | Document size limit (64 KB+) |
| Access | Only the authenticated user | Can grant other users read access |
| Correct for now | Yes — streak is personal, private | Overkill for a single counter |

For the current scope (personal streak display only), `updatePrefs` is sufficient. If a global leaderboard by streak is needed later, migrate to a `profiles` collection at that point.

**`AuthContext.js` does NOT need changes for Phase 1.** The `user.prefs` field is already present on the object returned by `account.get()`. The home screen reads it directly. A future `updateStreak` helper can be added to `AuthContext` in Phase 4.

---

## Animation Spec

The PLAY button uses the React Native core `Animated` API only (no Reanimated required).

**Variables declared inside the component:**
```typescript
const glowOpacity = useRef(new Animated.Value(0.4)).current;
const glowScale   = useRef(new Animated.Value(1.0)).current;
```

**Animation loop started in `useEffect` (mount once, cleanup on unmount):**
```typescript
const loop = Animated.loop(
  Animated.sequence([
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      Animated.timing(glowScale,   { toValue: 1.06, duration: 900, useNativeDriver: true }),
    ]),
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      Animated.timing(glowScale,   { toValue: 1.0, duration: 900, useNativeDriver: true }),
    ]),
  ])
);
loop.start();
return () => { loop.stop(); };
```

**JSX usage:** Wrap play button in `<Animated.View style={{ opacity: glowOpacity, transform: [{ scale: glowScale }] }}>`. Apply `Shadows.button` to this wrapper for glow effect (static on Android, animated on iOS).

**Constraint:** Only animate `opacity` and `transform` with `useNativeDriver: true`. Do NOT animate layout properties or shadows via native driver.

---

## TypeScript Notes

1. **`Animated.Value` refs** — use `useRef(new Animated.Value(0.4)).current` pattern (`.current` at declaration site keeps the reference stable).

2. **`user` type from `AuthContext`** — `AuthContext.js` initializes `user` as the boolean `false` (not `null`). TypeScript infers the type as `false | Models.User<Preferences>`. Accessing `user?.name` or `user?.prefs` in a strict `.tsx` file will cause a type error because `false` does not have those properties. **Required guard before accessing user fields:**
   ```typescript
   const typedUser = user && typeof user !== 'boolean' ? user : null;
   ```
   Then use `typedUser?.name`, `typedUser?.prefs` throughout. This also serves as a loading/logged-out guard.

3. **`user.prefs` typing** — `react-native-appwrite` types prefs as `Record<string, unknown>`. Cast inline: `(typedUser?.prefs as { streakCount?: number } | undefined)?.streakCount ?? 7`.

3. **`GameModeTab` union** — `type GameModeTab = 'quick' | 'daily' | 'friends'` for `useState`.

4. **`NavItem` interface** — keep same shape as current file: `iconName` and `iconNameActive` typed as `React.ComponentProps<typeof Ionicons>['name']`.

5. **`xpPercent` inline style** — `{ width: \`${xpPercent}%\` as \`${number}%\` }` — required cast for strict TypeScript.

6. **`useEffect` cleanup** — return `() => { loop.stop(); }` from the effect.

7. **Return type** — both `React.JSX.Element` and `JSX.Element` work with the project's `"jsx": "react-native"` tsconfig. Omit the return type annotation entirely (already validated in prior commits).

8. **`Colors.brand.gradient`** — already typed `readonly ['#FF6B35', '#FF9500']`, directly usable in `LinearGradient colors` prop without cast.

---

## Implementation Phases

### Phase 1 — Replace `assets/styles/homeStyle.js`

Full replacement with new style keys organized by section. All keys reference `constants/theme` tokens — no raw hex values except where theme has no equivalent.

**New style keys:**

Layout: `container`, `safeArea`

Top bar: `topBar`, `topBarLeft`, `topBarRight`, `avatarCircle`, `avatarInitials`, `usernameText`, `levelBadge`, `levelBadgeText`, `statChip`, `statChipValueGold`, `statChipValueRed`, `statChipValueFire`

XP bar: `xpRow`, `xpBarTrack`, `xpBarFill`, `xpLabel`

Mode tabs: `tabRow`, `tabButton`, `tabButtonActive`, `tabLabel`, `tabLabelActive`

Play button: `playWrapper`, `playGradient`, `playLabel`

Stats row: `statsRow`, `statCard`, `statCardValue`, `statCardLabel`

Bottom nav: `bottomNav`, `navItem`, `navLabel`, `navLabelActive`, `navActiveIndicator`

Key values (representative):
- `avatarCircle`: `{ width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.brand.primary }`
- `usernameText`: `{ fontFamily: Typography.family.bold, fontSize: Typography.size.sm, color: Colors.text.primary, maxWidth: 90 }`
- `playGradient`: `{ height: 110, minHeight: 90, borderRadius: Radius.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md }`
- `playLabel`: `{ fontFamily: Typography.family.black, fontSize: Typography.size.xxxl, color: Colors.text.primary, letterSpacing: 3 }`
- `tabButton`: `{ flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.full, alignItems: 'center', backgroundColor: Colors.bg.surface, borderWidth: 1, borderColor: Colors.border.default }`
- `tabButtonActive`: `{ backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary }`
- `bottomNav`: `{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: Colors.bg.card, borderTopWidth: 1, borderTopColor: Colors.border.default, paddingTop: Spacing.sm }`

**Commit:** `refactor(home): replace homeStyle.js with no-scroll layout tokens`

---

### Phase 2 — Rewrite `app/(app)/index.tsx`

Full component rewrite. Remove `ScrollView`. Add `Animated`, `useEffect`, `useRef` imports.

**Component structure:**

```
<View style={homeStyles.container}>
  <LinearGradient colors={[bg.primary, bg.secondary, bg.card]} style={absoluteFill} />
  <SafeAreaView style={homeStyles.safeArea} edges={['top']}>
    <TopBarRow />         ← avatar + username + level + coins + lives + streak
    <XPBar />             ← thin track + fill + label
    <View flex:1 justifyContent:'space-evenly'>
      <TabRow />          ← Hızlı / Günlük / Arkadaşlar
      <Animated.View>     ← glow wrapper
        <TouchableOpacity onPress={handlePlay}>
          <LinearGradient style={homeStyles.playGradient}>
            <Ionicons name="play-circle" size={48} />
            <Text style={homeStyles.playLabel}>OYNA</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      <StatsRow />        ← 3 stat cards
    </View>
    <BottomNav />         ← 2 icons, paddingBottom={insets.bottom || 8}
  </SafeAreaView>
</View>
```

**Static data inside component:**

TABS array:
```typescript
const TABS = [
  { id: 'quick',   label: 'Hızlı',     onPlay: () => router.push('/game/quick-game') },
  { id: 'daily',   label: 'Günlük',    onPlay: () => showToast.info('Yakında', 'Günlük mod yakında geliyor!') },
  { id: 'friends', label: 'Arkadaşlar', onPlay: () => showToast.info('Yakında', 'Arkadaşlar modu yakında geliyor!') },
] as const;
```

NAV_ITEMS — 2 items:
- `{ id: 'leaderboard', iconName: 'trophy-outline', iconNameActive: 'trophy', label: 'Sıralama', onPress: ... }`
- `{ id: 'profile', iconName: 'person-outline', iconNameActive: 'person', label: 'Profil', onPress: ... }`

STATS — 3 items:
- `{ label: 'Bugünkü Skor', value: '2.450' }`
- `{ label: 'En İyi Seri', value: '7 gün' }`
- `{ label: 'Toplam Oyun', value: '24' }`

**User guard (required for TypeScript):** immediately after hooks, before any data derivations:
```typescript
const typedUser = user && typeof user !== 'boolean' ? user : null;
```
Use `typedUser` everywhere instead of `user` when accessing `.name` or `.prefs`.

**Initial state:** `activeNav` initialized to `''` (empty string) so neither bottom nav tab appears active on mount — the home screen is not itself a nav destination.

**Commit:** `feat(home): no-scroll home screen v2 with animated play button and mode tabs`

---

### Phase 3 — Streak read from `user.prefs` (included in Phase 2 or separate)

`HARDCODED_STREAK` reads from `user.prefs` with fallback:
```typescript
const HARDCODED_STREAK =
  (user?.prefs as { streakCount?: number } | undefined)?.streakCount ?? 7;
```

No Appwrite schema changes needed. `account.get()` already returns `prefs`.

**Commit:** (can be part of Phase 2 commit or separate `feat(home): read streakCount from appwrite user prefs`)

---

### Phase 4 — Streak write helper (FUTURE — out of scope for this ticket)

Add `updateStreak()` to `AuthContext.js` and call it at game-over in `app/game/quick-game.jsx`.

Logic:
1. Read `user.prefs.lastPlayedDate` and `user.prefs.streakCount`
2. Compute today as `new Date().toISOString().slice(0, 10)`
3. If `lastPlayedDate === yesterday` → `streakCount + 1`
4. If `lastPlayedDate === today` → no change (already played today)
5. Otherwise → reset `streakCount` to 1
6. Call `account.updatePrefs({ lastPlayedDate: today, streakCount: newCount })`
7. Refresh `user` in AuthContext state

---

## Risks and Edge Cases

1. **Small screens (iPhone SE, 375×667pt):** use `minHeight: 90` instead of fixed `height: 110` on `playGradient` so the button compresses gracefully.

2. **SafeAreaView bottom edge:** use `edges={['top']}` only; apply bottom padding manually via `insets.bottom`. Do NOT add `'bottom'` to edges (double-padding risk).

3. **`useNativeDriver: true` constraint:** only `opacity` and `transform` are native-driver compatible. Shadows and layout properties are static.

4. **`user.prefs` is `Record<string, unknown>`:** always use optional chaining + nullish coalescing when reading prefs values to avoid runtime errors on new users with empty prefs.

5. **`activeNav` initial value:** initialize to `''` so no tab is pre-selected. The user is on the home screen, which is not represented in the bottom nav.

6. **`loop.stop()` cleanup:** `Animated.CompositeAnimation` exposes `.stop()`. Store loop reference and call in useEffect cleanup to prevent state-update-after-unmount warnings.

7. **`database` vs `databases`:** `lib/appwrite.js` exports `database` (not `databases` as mentioned in CLAUDE.md). Does not affect this home screen plan but relevant for Phase 4 if database reads are added.

---

## Acceptance Criteria

**Phase 1:**
- [ ] `npm run lint` passes on `assets/styles/homeStyle.js`
- [ ] No raw hex strings in homeStyle.js (all colors from theme tokens)

**Phase 2:**
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes on `app/(app)/index.tsx`
- [ ] Background is deep purple LinearGradient
- [ ] Top bar fits single row on 375pt-wide screen without wrapping
- [ ] Avatar shows correct initials; fallback "??" when no name
- [ ] Coins: "1.250" (Turkish locale), Lives: red "5", Streak: orange "7"
- [ ] XP bar filled to 68%
- [ ] Three tabs render; "Hızlı" active on mount (orange bg)
- [ ] Tapping tabs changes active highlight
- [ ] PLAY button is full-width minus margins, ~110px tall
- [ ] PLAY button has visible glow pulse animation
- [ ] PLAY with "Hızlı" active → navigates to `/game/quick-game`
- [ ] PLAY with "Günlük" or "Arkadaşlar" → "Yakında" toast
- [ ] Three stat cards render in a row
- [ ] Bottom nav shows exactly 2 icons (trophy + person)
- [ ] No content cut off on iPhone SE (375×667pt)
- [ ] No ScrollView — pinch-to-scroll does nothing
- [ ] Bottom nav respects device safe area

**Phase 3:**
- [ ] User with `prefs.streakCount = 14` sees "14" in top bar
- [ ] User with no `prefs.streakCount` sees fallback "7"

---

## Validation Commands

```powershell
cd c:\projects\expoApp
npx tsc --noEmit
npm run lint
npm run android   # or: npm run ios
```
