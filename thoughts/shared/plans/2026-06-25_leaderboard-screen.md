# Leaderboard Screen — Implementation Plan

**Date:** 2026-06-25
**Status:** READY
**Scope:** UI screen only. The data layer (userStats collection + `scoreService.getLeaderboard` / `getUserStats`) is ALREADY shipped. Do NOT plan any Appwrite / data-model / submitScore work.

> Note on the old spec: `thoughts/shared/plans/leaderboard-spec.md` describes a per-category, avg-score design with `leaderboardService.js`. That spec is STALE. The shipped service is GLOBAL (single `totalScore` leaderboard via `@/services/scoreService`). This plan follows the shipped service, not the old spec.

---

## Goal

Add a standalone, scrollable global leaderboard screen at `app/(app)/leaderboard.tsx`:
- Dark "arena" background (`Colors.gradients.background`).
- Full Olympic podium (top 3) as a `FlatList` `ListHeaderComponent` (scrolls with list).
- `FlatList` of ranks 4+ — project's first FlatList (establishes the convention; no ScrollView+.map).
- Current-user row highlight (cyan, not gold — no semantic collision with rank 1).
- Persistent bottom self-row pin when the logged-in non-guest user's rank exceeds 50.
- Guests see the full leaderboard; no highlight, no pin, optional hint.
- Empty state ONLY when `leaderboard.length === 0` (not ≤ 3).
- Wire the Home `NAV_ITEMS` `leaderboard` entry to navigate here.

---

## Confirmed Facts (from reading the codebase)

**Dark screen background:** `Colors.gradients.background` = `['#2D1B69', '#1A0A4A', '#0D0527']` (`constants/theme.ts` line 65).

**`Colors.modes.leaderboard` EXISTS** at line 60: `{ from: '#B7791F', to: '#FFD700' }`. It is a plain `{from, to}` object, NOT a gradient array. To pass to `<LinearGradient>`: `[Colors.modes.leaderboard.from, Colors.modes.leaderboard.to]`. Use this for the rank-1 pedestal block and rank-1 medallion background (gold gradient accent). **`Colors.gradients.leaderboard` does NOT exist** — never reference it.

**No existing cyan-tinted surface fill token.** `bg.*` tokens are all purple. `border.cyanSoft = 'rgba(0,212,255,0.22)'` is semantically a border, not a fill. → Phase 1 adds `Colors.ui.selfRowBg = 'rgba(0,212,255,0.12)'`.

**`Colors.accent.cyan = '#00D4FF'`** — the leaderboard nav's identity color; use for self-row border + "Sen" podium indicator.

**`Colors.rank` does not exist yet** — Phase 1 adds it. Silver/bronze hex accepted: `#C0C0C0` / `#CD7F32`.

**scoreService (shipped, JS, `@/services/scoreService`):**
- `getLeaderboard({ limit = 50, offset = 0 } = {})` → `Promise<LeaderboardEntry[]>`. Returns `[]` on error (never throws). `rank` is `offset + i + 1`.
- `getUserStats(userId)` → `LeaderboardEntry | null`. Returns `null` when no doc or on error.
- `accuracy: number | null` — null when `totalQuestions === 0`.

**`useAuth()`** (`@/context/AuthContext`): `{ user, isGuest, ... }`. `user` is `false` until loaded, then Appwrite account object.

**User narrowing (copy from profile.tsx):** `const typedUser = user && typeof user !== 'boolean' ? user : null;`

**`avatarInitials` logic (copy from index.tsx):** `'??'` fallback; single word → first char upper; else first chars of first two words upper.

**Score formatting:** `totalScore.toLocaleString('tr-TR')` — use consistently across podium, rows, and pin bar.

**`LoadingSpinner`** props: `{ size?, label?, fullscreen? }`. Use `<LoadingSpinner fullscreen label="Yükleniyor..." />`.

**`BackButton`** — defaults to `router.back()`, plays UI sound internally.

**`ThemedText`** — default color `Colors.text.primary` (white), correct on dark bg; no `color` override needed for titles.

**Style convention:** `assets/styles/profileStyle.ts` → named const `profileStyles = StyleSheet.create({...})`. New file is `.ts`, named `leaderboardStyle.ts`, export `leaderboardStyles`. (All recently added style files are TypeScript; `.ts` enables `npx tsc --noEmit` to catch token spelling errors in the style file.)

**Auth guard:** any file at `app/(app)/` automatically gets the auth guard from `app/(app)/_layout.tsx`. No additional code needed.

**Nav entry to change (`app/(app)/index.tsx` line ~158):**
```js
{ id: 'leaderboard', ..., activeColor: '#00D4FF',
  onPress: () => showToast.info('Yakında', 'Sıralama yakında geliyor!') }
```

---

## Files to Change

1. `constants/theme.ts` — add `Colors.rank` group; add `Colors.ui.selfRowBg`.
2. `app/(app)/index.tsx` — change ONE line: `leaderboard` `NAV_ITEMS` `onPress`.

## Files to Create

1. `assets/styles/leaderboardStyle.ts` — `leaderboardStyles` StyleSheet object.
2. `app/(app)/leaderboard.tsx` — the screen.

---

## Theme Tokens to Add (Phase 1)

In `constants/theme.ts`:

**`Colors.rank`** — add after the `accent` group:
```typescript
rank: {
  gold:   '#FFD700' as const,  // 1st — matches accent.gold
  silver: '#C0C0C0' as const,  // 2nd
  bronze: '#CD7F32' as const,  // 3rd
},
```

**`Colors.ui.selfRowBg`** — add inside the existing `ui` object:
```typescript
selfRowBg: 'rgba(0,212,255,0.12)' as const,  // cyan tint for current-user row fill
```

No other tokens added. All other references use existing tokens by their real accessors.

---

## Style Keys — `assets/styles/leaderboardStyle.ts`

Theme tokens only. No raw hex, no raw numbers outside `Spacing.*` / `Radius.*` / `Typography.*`.

Pedestal heights derived from `Spacing` multiples, ratio gold : silver : bronze ≈ 1 : 0.8 : 0.65 (device-verified in Phase 3).

```
container        — { flex: 1, backgroundColor: Colors.gradients.background[0] }
safeArea         — { flex: 1 }
header           — row, alignItems:'center', paddingHorizontal:Spacing.xl, paddingVertical:Spacing.lg, gap:Spacing.md
listContent      — { paddingHorizontal:Spacing.xl, paddingBottom:Spacing.xxl }

// Podium
podiumWrap       — row, alignItems:'flex-end', justifyContent:'center', gap:Spacing.md, marginVertical:Spacing.xl
pedestal         — column, alignItems:'center', flex:1
pedestalFirst    — height modifier (tallest, ~Spacing.xxxl * 1.0 equivalent)
pedestalSecond   — height modifier (medium, ~0.8 ratio)
pedestalThird    — height modifier (shortest, ~0.65 ratio)
podiumAvatar     — circle, Radius.full; borderColor applied inline from Colors.rank.*
podiumAvatarText — initials text
podiumName       — Typography.size.sm, Colors.text.primary
podiumScore      — Typography.size.md, bold, Colors.text.primary
podiumBlock      — pedestal step below avatar, borderRadius:Radius.md (rank-1 uses LinearGradient with Colors.modes.leaderboard; rank-2/3 use bg Colors.bg.card)
podiumRankBadge  — small circle, rank number (rank-1 uses Colors.modes.leaderboard gradient bg; rank-2/3 use Colors.rank.silver/bronze as bg)
podiumSenBadge   — tiny cyan "Sen" label below name, Colors.accent.cyan, Typography.size.xs (current-user only, optional)

// List row
row              — row, alignItems:'center', paddingVertical:Spacing.md, paddingHorizontal:Spacing.lg,
                   gap:Spacing.md, borderRadius:Radius.md, marginBottom:Spacing.sm,
                   backgroundColor:Colors.bg.card
rowSelf          — { backgroundColor:Colors.ui.selfRowBg, borderWidth:1, borderColor:Colors.accent.cyan }
rowRank          — fixed width (~Spacing.xxl), Typography.size.md, Colors.text.secondary
rowAvatar        — small circle, Radius.full, bg Colors.bg.surface
rowAvatarText    — initials, Typography.size.sm, Colors.text.primary
rowNameWrap      — { flex:1 }
rowName          — Typography.size.md, Colors.text.primary
rowAccuracy      — Typography.size.xs, Colors.text.muted
rowScore         — Typography.size.lg, bold, Colors.accent.gold

// Empty state
emptyWrap        — { flex:1, alignItems:'center', justifyContent:'center',
                     paddingHorizontal:Spacing.xl, paddingTop:Spacing.xxxl }
emptyText        — centered, Colors.text.secondary, Typography.size.md

// Self-row pin bar (non-guest, rank > 50)
pinBar           — row, paddingHorizontal:Spacing.xl, paddingVertical:Spacing.lg, gap:Spacing.md,
                   alignItems:'center', backgroundColor:Colors.bg.secondary,
                   borderTopWidth:1, borderTopColor:Colors.border.default
pinRank          — Typography.size.md, Colors.text.secondary
pinAvatar        — small circle, Radius.full, bg Colors.bg.surface
pinAvatarText    — initials, Typography.size.sm, Colors.text.primary
pinNameWrap      — { flex:1 }
pinName          — Typography.size.md, Colors.text.primary
pinScore         — Typography.size.lg, bold, Colors.accent.gold

// Guest hint (optional, bottom of screen when isGuest)
guestHint        — centered, Typography.size.xs, Colors.text.muted, paddingVertical:Spacing.md
```

---

## Identifiers in `app/(app)/leaderboard.tsx`

```typescript
// TypeScript type (service is JS; type lives in screen)
type LeaderboardEntry = {
  id: string; userId: string; userName: string;
  totalScore: number; gamesPlayed: number; bestScore: number;
  totalCorrect: number; totalQuestions: number; lastPlayedAt: string;
  accuracy: number | null; rank: number;
};

// State
const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
const [selfStats, setSelfStats] = useState<LeaderboardEntry | null>(null);
const [loading, setLoading] = useState(true);

// Auth
const { user, isGuest } = useAuth();
const typedUser = user && typeof user !== 'boolean' ? user : null;
const currentUserId: string | undefined = typedUser?.$id as string | undefined;

// Derived
const podiumEntries = entries.slice(0, 3);   // up to 3; may be 0–3
const listEntries = entries.slice(3);         // ranks 4+; may be empty

// Self-pin logic
const selfInList = currentUserId
  ? entries.some(e => e.userId === currentUserId)
  : false;
const showPin = !isGuest && !!selfStats && !selfInList;

// Helper (module-scope)
function getInitials(name?: string): string { ... }  // copy from index.tsx avatarInitials

// In-file components
function EmptyState(): JSX.Element { ... }
function Podium({ entries, currentUserId }: { entries: LeaderboardEntry[]; currentUserId?: string }): JSX.Element | null { ... }
function LeaderboardRow({ entry, isSelf }: { entry: LeaderboardEntry; isSelf: boolean }): JSX.Element { ... }
function SelfPinBar({ stats }: { stats: LeaderboardEntry }): JSX.Element { ... }
```

---

## Implementation Phases

> Coder runs ONE phase per turn. Each phase ends with PHASE_COMPLETE. Never commits. Never runs other agents.

### Phase 1 — Theme tokens + style-file scaffold

**Files changed:** `constants/theme.ts`
**Files created:** `assets/styles/leaderboardStyle.ts`

**Steps:**
1. In `constants/theme.ts`: add `rank: { gold, silver, bronze }` after the `accent` group. Add `selfRowBg: 'rgba(0,212,255,0.12)' as const` inside the existing `ui` object. No other changes.
2. Create `assets/styles/leaderboardStyle.ts`: `import { StyleSheet } from 'react-native'`; `import { Colors, Spacing, Radius, Typography } from '@/constants/theme'`; `export const leaderboardStyles = StyleSheet.create({ ... })` with all keys above. Theme tokens only.

**Validation:** `npm run lint && npx tsc --noEmit`. App must still boot with no red screen (no UI change yet).

---

### Phase 2 — Screen skeleton: route + scaffolding + data fetch + LoadingSpinner + empty state

**Files created:** `app/(app)/leaderboard.tsx`

**Steps:**
1. `export default function LeaderboardScreen()`.
2. Imports: `React, { useEffect, useState }` / `{ View, FlatList, StyleSheet }` from `'react-native'` / `{ SafeAreaView }` from `'react-native-safe-area-context'` / `{ LinearGradient }` from `'expo-linear-gradient'` / `{ useAuth }` from `'@/context/AuthContext'` / `{ Colors, Typography }` from `'@/constants/theme'` / `ThemedText` / `BackButton` / `LoadingSpinner` / `{ leaderboardStyles }` from `'@/assets/styles/leaderboardStyle'` / `{ getLeaderboard, getUserStats }` from `'@/services/scoreService'`. (Import path omits extension; TypeScript resolves `.ts` automatically.)
3. Scaffolding (clone profile.tsx structure, dark bg):
   ```tsx
   <View style={leaderboardStyles.container}>
     <LinearGradient colors={Colors.gradients.background} style={StyleSheet.absoluteFill} />
     <SafeAreaView edges={['top']} style={leaderboardStyles.safeArea}>
       <View style={leaderboardStyles.header}>
         <BackButton />
         <ThemedText weight="bold" size={Typography.size.xxl}>Sıralama</ThemedText>
       </View>
       {/* content */}
     </SafeAreaView>
   </View>
   ```
4. Auth narrowing: `typedUser`, `currentUserId`, `isGuest` as above.
5. Data fetch (profile.tsx cancelled-flag pattern):
   ```typescript
   useEffect(() => {
     let cancelled = false;
     Promise.all([
       getLeaderboard({ limit: 50 }),
       isGuest || !currentUserId
         ? Promise.resolve(null)
         : getUserStats(currentUserId),
     ]).then(([board, self]) => {
       if (cancelled) return;
       setEntries(board);
       setSelfStats(self);
       setLoading(false);
     });
     return () => { cancelled = true; };
   }, [isGuest, typedUser]);
   ```
6. While `loading`: `return <LoadingSpinner fullscreen label="Yükleniyor..." />;` (both promises resolve first).
7. Empty state: `EmptyState` renders "Henüz kimse oynamamış.\nİlk oyunu sen oyna!" centered. Triggered ONLY when `entries.length === 0` after loading — not when ≤ 3 (a 1–3 user board is populated, not empty).
8. Wire the FlatList with live data and the correct gate from the start (do NOT use a hardcoded `data={[]}`placeholder):
   - `data={listEntries}` (where `listEntries = entries.slice(3)`)
   - `keyExtractor={(item) => item.id}`
   - `renderItem={null}` (rows arrive in Phase 4 — acceptable placeholder; FlatList renders nothing without renderItem)
   - `ListHeaderComponent={null}` (podium arrives in Phase 3)
   - `ListEmptyComponent={entries.length === 0 ? <EmptyState /> : null}` — gated so 1–3 user boards (podium-only) never trigger the empty state
   - `contentContainerStyle={leaderboardStyles.listContent}`, `showsVerticalScrollIndicator={false}`

**Validation:** `npm run lint && npx tsc --noEmit`. Device check: dark gradient bg + "Sıralama" header visible; spinner shows then resolves to: (a) EmptyState when board is genuinely empty, (b) blank content area when board has 1–50 entries (empty state correctly suppressed).

---

### Phase 3 — Podium header (top-3 Olympic layout)

**Files changed:** `app/(app)/leaderboard.tsx`, `assets/styles/leaderboardStyle.js` (pedestal height keys if missed)

**Steps:**
1. `const podiumEntries = entries.slice(0, 3)`.
2. `Podium` component: if `podiumEntries.length === 0`, return `null`. Otherwise build only the present slots — no empty placeholder pedestals:
   - 1 user → `[entries[0]]` only (center gold).
   - 2 users → `[entries[1], entries[0]]` (silver-left, gold-center).
   - 3 users → `[entries[1], entries[0], entries[2]]` (silver-left, gold-center, bronze-right).
3. Each pedestal: avatar circle with `getInitials(entry.userName)` and a `borderColor` from `Colors.rank.*`; `entry.userName numberOfLines={1}`; `entry.totalScore.toLocaleString('tr-TR')`; rank medallion showing `entry.rank`.
4. **Rank-1 pedestal block** and **rank-1 medallion**: use `<LinearGradient colors={[Colors.modes.leaderboard.from, Colors.modes.leaderboard.to]}>` for the gold gradient. Rank-2 and rank-3 use flat `backgroundColor: Colors.bg.card`.
5. **"Sen" indicator**: if `entry.userId === currentUserId`, render a small `<ThemedText size={Typography.size.xs} color={Colors.accent.cyan}>Sen</ThemedText>` label below the name (consistent with in-list cyan highlight + pin bar identity). Renders for top-3 users too.
6. Pedestal heights (Spacing-derived, ratio ≈ 1 : 0.8 : 0.65): spec as `pedestalFirst`, `pedestalSecond`, `pedestalThird` style keys; coder picks Spacing multiples and verifies on device.
7. Attach `Podium` as FlatList `ListHeaderComponent`.

**Validation:** `npm run lint && npx tsc --noEmit`. Device check: ≥ 3 users → silver-left, gold-center (tallest + LinearGradient block), bronze-right; rank-1 taller than rank-2 taller than rank-3. Test 1-user: only center gold, no empty slots. Test 2-user: silver-left + gold-center only.

---

### Phase 4 — FlatList rows (ranks 4+) + current-user highlight

**Files changed:** `app/(app)/leaderboard.tsx`

**Steps:**
1. `const listEntries = entries.slice(3)`.
2. Wire FlatList fully:
   - `data={listEntries}`
   - `keyExtractor={(item) => item.id}`
   - `renderItem={({ item }) => <LeaderboardRow entry={item} isSelf={item.userId === currentUserId} />}`
   - `ListHeaderComponent={podiumEntries.length > 0 ? <Podium entries={podiumEntries} currentUserId={currentUserId} /> : null}`
   - `ListEmptyComponent` only when `entries.length === 0` (i.e. no podium AND no rows) → `<EmptyState />`. When `entries.length` is 1–3: podium renders, list is empty but `ListEmptyComponent` must NOT fire — gate it: `ListEmptyComponent={entries.length === 0 ? <EmptyState /> : null}`.
   - `contentContainerStyle={leaderboardStyles.listContent}`, `showsVerticalScrollIndicator={false}`.
3. `LeaderboardRow`: rank (`entry.rank`), avatar (`getInitials`), name `numberOfLines={1}`, optional accuracy `entry.accuracy != null ? \`%${entry.accuracy}\` : null`, score `entry.totalScore.toLocaleString('tr-TR')`. `isSelf ? [leaderboardStyles.row, leaderboardStyles.rowSelf] : leaderboardStyles.row`. Cyan accent conveys "you" — no gold collision.

**Validation:** `npm run lint && npx tsc --noEmit`. Device check: ranks 4–50 render; logged-in user's own row (rank ≥ 4) shows cyan highlight; 1–3 users → podium only, no empty state fires; 0 users → empty state.

---

### Phase 5 — Self-row pin (persistent bottom bar)

**Files changed:** `app/(app)/leaderboard.tsx`

**Steps:**
1. `selfInList` and `showPin` as defined above.
2. `SelfPinBar`: render rank, avatar (initials), name, `selfStats.totalScore.toLocaleString('tr-TR')` styled with `pinBar`/`pinRank`/`pinAvatar`/`pinAvatarText`/`pinName`/`pinScore`.
3. Place `{showPin && <SelfPinBar stats={selfStats!} />}` as a sibling AFTER the FlatList inside `SafeAreaView` — NOT as `ListFooterComponent` (must be a persistent pinned bar, not a scrolling footer).
4. Optional guest hint: `{isGuest && <ThemedText style={leaderboardStyles.guestHint}>Sıralamada yer almak için hesap oluştur</ThemedText>}` below the FlatList, only when `!showPin` (guests never have a pin bar).

**Validation:** `npm run lint && npx tsc --noEmit`. Device check: non-guest with rank > 50 → persistent bar at bottom, does NOT scroll; user within fetched list → no bar (cyan in-list highlight only); guest → no bar, optional hint visible.

---

### Phase 6 — Home nav wiring

**Files changed:** `app/(app)/index.tsx`

**Steps:**
1. In `NAV_ITEMS`, change the `id: 'leaderboard'` entry's `onPress`:
   - FROM: `() => showToast.info('Yakında', 'Sıralama yakında geliyor!')`
   - TO: `() => { playUISound('button'); router.push('/leaderboard' as any); }`
   (Matches `profile` nav entry pattern exactly.)
2. Leave `activeColor: '#00D4FF'` unchanged. `showToast` import stays — still used by other entries.

**Validation:** `npm run lint && npx tsc --noEmit`. Device check: tapping "Sıralama" in bottom nav navigates to leaderboard; `BackButton` returns to home.

---

## Risks and Edge Cases

- **`[]` = empty AND error:** `getLeaderboard` returns `[]` on any error (never throws). V1 cannot distinguish. Both are treated as "Henüz kimse oynamamış...". Acceptable for V1.
- **Empty state guard:** trigger is `entries.length === 0` ONLY. `entries.length` 1–3 is a populated board (podium rendered, no list rows) — not an empty state.
- **Podium with < 3 users:** only render present slots, no empty placeholder pedestals, no crash. Filter the slot array from present entries.
- **Guests see the full leaderboard:** `userStats` has `read(any)` permission — guests can read all rows. `isGuest` only gates: getUserStats call, self-row highlight, self-row pin. Do NOT skip the leaderboard fetch for guests.
- **`user` is `false` before auth loads:** `typeof user !== 'boolean'` guard prevents reading `.$id` off a boolean.
- **`accuracy` null:** when `totalQuestions === 0`; render no secondary line.
- **"Sen" indicator for top-3:** small cyan "Sen" label below the podium name — consistent cyan "you" identity across podium / list / pin bar.
- **Score formatting:** `totalScore.toLocaleString('tr-TR')` everywhere (podium, rows, pin bar).
- **FlatList:** ≤ 50 rows; no `getItemLayout` / windowing tuning needed for V1. Project's first FlatList — do NOT fall back to ScrollView+.map.
- **New Architecture:** no animation in V1. If any animation is added later, built-in `Animated` API only (NOT reanimated).
- **Theme guardrail:** no raw hex or raw numbers in screen or style file. New hex values live ONLY in `constants/theme.ts`.
- **No direct Appwrite SDK in the screen:** `@/services/scoreService` only.
- **Route typing:** `router.push('/leaderboard' as any)` — mirrors existing profile nav cast.
- **Pull-to-refresh:** deferred to V1.1.

---

## Validation Commands (all phases)

```bash
npm run lint
npx tsc --noEmit
```

Plus per-phase manual device check as described inline. No automated test runner configured (per CLAUDE.md).
