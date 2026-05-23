# Home Screen Rewrite v4 — Dark BG, 2 Stat Boxes, No Scroll, Reward Banner + Modal

## Goal

Incrementally update `app/(app)/index.tsx` and `assets/styles/homeStyle.js` to implement six discrete
changes to the v3 home screen: reduce stat boxes from 3 to 2, darken the gradient background, remove
the "Hepsini Gör" link, replace ScrollView with a fixed flex layout, add a Daily Reward banner with
animated shimmer and a 7-day reward Modal, and reference `constants/theme.ts` tokens wherever applicable.

---

## Files to Change

| File | Nature of change |
|---|---|
| `app/(app)/index.tsx` | Remove stat box, change gradient constant, remove link JSX, replace ScrollView, add banner + modal JSX, add state/refs/animation, add new imports |
| `assets/styles/homeStyle.js` | Remove `sectionHeaderLink` and `scrollContent`, modify font size keys and colors, add 20 new keys for banner and modal |

## Files to Create

None.

---

## Implementation Steps

### Step 1 — Update imports in `index.tsx`

**Current:**
```tsx
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
```

**Replace with:**
```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
```

- Remove `ScrollView` (no longer used after Change 4).
- Add `Animated` and `useRef` (for shimmer animation, Change 5).
- Add `Modal` (for reward modal, Change 5).

Also update the theme import to add `Spacing`:
```tsx
import { Colors, Spacing } from '@/constants/theme';
```

---

### Step 2 — Change `BG_GRADIENT` and add `REWARD_GRADIENT` / `DAY_REWARDS` at module level in `index.tsx`

**Current:**
```tsx
const BG_GRADIENT = ['#F8F0FF', '#EDE0FF', '#E8D5FF'] as const;
```

**Replace with:**
```tsx
const BG_GRADIENT = ['#2D1B69', '#1A0A4A', '#0D0527'] as const;
```

After the existing `FRIENDS_GRADIENT` constant, add:
```tsx
// Daily reward banner gradient — not in theme.ts
const REWARD_GRADIENT = ['#F59E0B', '#F97316'] as const;
// Coin rewards per streak day
const DAY_REWARDS = [50, 100, 140, 170, 190, 200, 300];
```

---

### Step 3 — Add `RewardCell` component above `HomeScreen` in `index.tsx`

Place immediately before the `export default function HomeScreen()` line:

```tsx
interface RewardCellProps {
  day: number;
  coins: number;
  currentDay: number;
}

function RewardCell({ day, coins, currentDay }: RewardCellProps) {
  const isPast = day < currentDay;
  const isToday = day === currentDay;
  const boxEmoji = isPast ? '📭' : isToday ? '🎁' : '📦';
  const cellOpacity = day > currentDay ? 0.6 : 1;
  return (
    <View style={[homeStyles.rewardCell, isToday && homeStyles.rewardCellToday, { opacity: cellOpacity }]}>
      <Text style={homeStyles.rewardCellEmoji}>{boxEmoji}</Text>
      <Text style={homeStyles.rewardCellDay}>Gün {day}</Text>
      <View style={homeStyles.rewardCoinBadge}>
        <Text style={homeStyles.rewardCoinText}>🪙 {coins}</Text>
      </View>
    </View>
  );
}
```

---

### Step 4 — Add state, refs, and derived values inside `HomeScreen` in `index.tsx`

After existing `const [activeNav, setActiveNav] = useState<NavId>('home');`, add:
```tsx
const [rewardModalVisible, setRewardModalVisible] = useState(false);
const shimmerAnim = useRef(new Animated.Value(0)).current;
```

After existing `const HARDCODED_STREAK = ...` declaration, add:
```tsx
const currentDay = Math.min(Math.max(HARDCODED_STREAK, 1), 7);
```

---

### Step 5 — Add shimmer animation `useEffect` in `index.tsx`

After existing `useEffect(() => { initSounds().catch(() => {}); }, []);`, add:
```tsx
useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ])
  ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

### Step 6 — Remove the third stat box (Günlük Seri) from user card JSX in `index.tsx`

Delete the entire third `<View style={homeStyles.statBox}>` block:
```tsx
// DELETE THIS ENTIRE BLOCK:
<View style={homeStyles.statBox}>
  <Ionicons name="flame" size={16} color={Colors.brand.secondary} />
  <Text style={homeStyles.statBoxValue}>{HARDCODED_STREAK}</Text>
  <Text style={homeStyles.statBoxLabel}>Günlük Seri</Text>
</View>
```

`statBoxArea` retains exactly two children: Puan and Can.

Then on each of the two remaining `<Text style={homeStyles.statBoxValue}>` nodes (Puan count and Can count), add overflow-guard props:
```tsx
<Text style={homeStyles.statBoxValue} numberOfLines={1} adjustsFontSizeToFit>
  {HARDCODED_COINS.toLocaleString('tr-TR')}
</Text>
```
and the Can box:
```tsx
<Text style={homeStyles.statBoxValue} numberOfLines={1} adjustsFontSizeToFit>
  {HARDCODED_LIVES}
</Text>
```
This prevents the `"1.250"` coin string from overflowing the 72pt `minWidth` box at the new 24px font size.

---

### Step 7 — Remove "Hepsini Gör >" TouchableOpacity from section header JSX in `index.tsx`

Delete the link block:
```tsx
// DELETE THIS ENTIRE BLOCK:
<TouchableOpacity activeOpacity={0.7}>
  <Text style={homeStyles.sectionHeaderLink}>Hepsini Gör {'>'}</Text>
</TouchableOpacity>
```

Also update the `Ionicons` icon color in the section header from the hardcoded `color="#1A1035"` to `color={Colors.text.primary}` (dark value is invisible on the new dark background).

---

### Step 8 — Replace `ScrollView` with fixed `View` layout in `index.tsx`

**Before:**
```tsx
<ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
>
  {/* user card, section header, game mode grid */}
</ScrollView>
```

**After:**
```tsx
<View style={homeStyles.mainContent}>
  {/* user card, section header, game mode grid */}
  {/* daily reward banner — Step 9 */}
</View>
```

The outer `<SafeAreaView style={homeStyles.safeArea}>` already has `flex: 1`. `mainContent` takes `flex: 1` with `justifyContent: 'space-between'`. Remove `insets.bottom + 80` paddingBottom.

---

### Step 9 — Add Daily Reward banner JSX in `index.tsx` (inside `mainContent`, after game grid)

After the `gameModeGrid` closing `</View>` tag:

```tsx
{/* Daily reward banner */}
<TouchableOpacity
  activeOpacity={0.85}
  onPress={() => setRewardModalVisible(true)}
  style={{ marginHorizontal: Spacing.lg, marginTop: Spacing.md }}
>
  <LinearGradient
    colors={REWARD_GRADIENT}
    style={homeStyles.rewardBanner}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <View style={homeStyles.rewardBannerLeft}>
      <Text style={homeStyles.rewardBannerIcon}>🎁</Text>
      <View>
        <Text style={homeStyles.rewardBannerTitle}>Günlük Ödül</Text>
        <Text style={homeStyles.rewardBannerSubtitle}>Bugün oyna, ödülünü kazan!</Text>
      </View>
    </View>
    <Animated.View
      style={[
        homeStyles.rewardBannerGlow,
        {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1.0],
          }),
        },
      ]}
    />
  </LinearGradient>
</TouchableOpacity>
```

---

### Step 10 — Add Daily Reward Modal JSX in `index.tsx` (before closing `</SafeAreaView>`)

Place immediately before `</SafeAreaView>`, outside both `mainContent` View and the bottom nav:

```tsx
<Modal
  visible={rewardModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setRewardModalVisible(false)}
>
  <View style={homeStyles.modalOverlay}>
    <View style={homeStyles.modalCard}>
      <TouchableOpacity
        style={homeStyles.modalCloseBtn}
        onPress={() => setRewardModalVisible(false)}
      >
        <Text style={homeStyles.modalCloseBtnText}>×</Text>
      </TouchableOpacity>
      <Text style={homeStyles.modalTitle}>GÜNLÜK ÖDÜL</Text>
      <View style={homeStyles.rewardGrid}>
        <View style={homeStyles.rewardRow}>
          {DAY_REWARDS.slice(0, 3).map((coins, idx) => (
            <RewardCell key={idx + 1} day={idx + 1} coins={coins} currentDay={currentDay} />
          ))}
        </View>
        <View style={homeStyles.rewardRow}>
          {DAY_REWARDS.slice(3, 6).map((coins, idx) => (
            <RewardCell key={idx + 4} day={idx + 4} coins={coins} currentDay={currentDay} />
          ))}
        </View>
        <View style={[homeStyles.rewardRow, { justifyContent: 'center' }]}>
          <RewardCell day={7} coins={DAY_REWARDS[6]} currentDay={currentDay} />
        </View>
      </View>
    </View>
  </View>
</Modal>
```

---

### Step 11 — Update `homeStyle.js` — remove keys

Delete the following keys from `StyleSheet.create({})`:
1. `scrollContent` — replaced by `mainContent`.
2. `sectionHeaderLink` — its TouchableOpacity was deleted in Step 7.

---

### Step 12 — Update `homeStyle.js` — add `mainContent`

```js
mainContent: {
  flex: 1,
  justifyContent: 'space-between',
  paddingTop: Spacing.sm,
  paddingBottom: Spacing.sm,
},
```

---

### Step 13 — Update `homeStyle.js` — modify existing keys

| Key | Property | Old value | New value | Reason |
|---|---|---|---|---|
| `container` | `backgroundColor` | `'#F8F0FF'` | `'#0D0527'` | Match dark gradient bottom |
| `userNameText` | `fontSize` | `Typography.size.md` (14) | `Typography.size.xl` (20) | Bigger text spec |
| `userNameText` | `maxWidth` | `120` | `130` | Accommodate larger text |
| `levelBadgeText` | `fontSize` | `Typography.size.xs` (10) | `Typography.size.sm` (12) | Bigger text spec |
| `statBox` | `minWidth` | `64` | `72` | Accommodate fontSize 24 number |
| `statBoxValue` | `fontSize` | `Typography.size.sm` (12) | `Typography.size.xxl` (24) | Bigger text spec |
| `statBoxLabel` | `fontSize` | `Typography.size.xs` (10) | `Typography.size.sm` (12) | Bigger text spec |
| `sectionHeader` | `justifyContent` | `'space-between'` | `'flex-start'` | Only one child after link removal |
| `sectionHeaderTitle` | `color` | `'#1A1035'` | `Colors.text.primary` | Invisible on dark background |

---

### Step 14 — Update `homeStyle.js` — add new banner style keys

```js
// Daily reward banner
rewardBanner: {
  borderRadius: Radius.lg,
  padding: Spacing.md,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  overflow: 'hidden',
  minHeight: 64,
},
rewardBannerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.sm,
  flex: 1,
},
rewardBannerIcon: {
  fontSize: 32,
},
rewardBannerTitle: {
  fontFamily: Typography.family.bold,
  fontSize: Typography.size.lg,
  color: Colors.text.primary,
},
rewardBannerSubtitle: {
  fontFamily: Typography.family.regular,
  fontSize: Typography.size.xs,
  color: 'rgba(255,255,255,0.85)', // near-white on gold bg — no theme token
},
rewardBannerGlow: {
  position: 'absolute',
  right: 16,
  width: 48,
  height: 48,
  borderRadius: Radius.full,
  backgroundColor: 'rgba(255,255,255,0.3)', // pulsing white circle — no theme token
},
```

---

### Step 15 — Update `homeStyle.js` — add new modal style keys

```js
// Daily reward modal
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.75)', // dark overlay — no theme token
  justifyContent: 'center',
  alignItems: 'center',
  padding: Spacing.xl,
},
modalCard: {
  backgroundColor: '#FFFFFF', // white card — no theme token (theme has only dark surfaces)
  borderRadius: Radius.lg,
  padding: Spacing.xl,
  width: '100%',
  position: 'relative',
},
modalCloseBtn: {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 32,
  height: 32,
  borderRadius: Radius.full,
  backgroundColor: Colors.accent.purple,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},
modalCloseBtnText: {
  fontSize: Typography.size.xl,
  color: Colors.text.primary,
  lineHeight: 22,
},
modalTitle: {
  fontFamily: Typography.family.black,
  fontSize: Typography.size.xl,
  color: Colors.bg.primary, // '#12082E' dark purple text on white card
  textAlign: 'center',
  marginBottom: Spacing.lg,
  marginTop: Spacing.sm,
},
rewardGrid: {
  gap: Spacing.sm,
},
rewardRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: Spacing.sm,
},
rewardCell: {
  flex: 1,
  alignItems: 'center',
  backgroundColor: Colors.bg.secondary,
  borderRadius: Radius.md,
  padding: Spacing.sm,
  gap: 4,
},
rewardCellToday: {
  backgroundColor: Colors.accent.purple,
  transform: [{ scale: 1.05 }],
  ...Shadows.glow,
},
rewardCellEmoji: {
  fontSize: 28,
},
rewardCellDay: {
  fontFamily: Typography.family.semibold,
  fontSize: Typography.size.xs,
  color: Colors.text.secondary,
},
rewardCoinBadge: {
  backgroundColor: Colors.bg.primary,
  borderRadius: Radius.full,
  paddingHorizontal: Spacing.sm,
  paddingVertical: 2,
},
rewardCoinText: {
  fontFamily: Typography.family.bold,
  fontSize: 13, // between Typography.size.sm(12) and .md(14) — no exact token
  color: Colors.accent.gold,
},
```

---

## New Imports Needed in `index.tsx`

Full updated import block:

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'; // added: useRef
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // removed: ScrollView; added: Animated, Modal
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { initSounds, playSound } from '@/utils/sound';
import { homeStyles } from '@/assets/styles/homeStyle';
import { Colors, Spacing } from '@/constants/theme'; // added: Spacing
```

---

## New State and Refs Needed in `index.tsx`

```tsx
const [rewardModalVisible, setRewardModalVisible] = useState(false);
const shimmerAnim = useRef(new Animated.Value(0)).current;
const currentDay = Math.min(Math.max(HARDCODED_STREAK, 1), 7);
```

Module-level constants (after `FRIENDS_GRADIENT`):
```tsx
const REWARD_GRADIENT = ['#F59E0B', '#F97316'] as const;
const DAY_REWARDS = [50, 100, 140, 170, 190, 200, 300];
```

Local component (before `HomeScreen` export):
```tsx
interface RewardCellProps { day: number; coins: number; currentDay: number; }
function RewardCell({ day, coins, currentDay }: RewardCellProps) { ... }
```

---

## Complete Style Key Delta for `homeStyle.js`

### REMOVED (2 keys)
- `scrollContent`
- `sectionHeaderLink`

### MODIFIED (9 keys)
- `container.backgroundColor`: `'#F8F0FF'` → `'#0D0527'`
- `userNameText.fontSize`: `Typography.size.md` → `Typography.size.xl`
- `userNameText.maxWidth`: `120` → `130`
- `levelBadgeText.fontSize`: `Typography.size.xs` → `Typography.size.sm`
- `statBox.minWidth`: `64` → `72`
- `statBoxValue.fontSize`: `Typography.size.sm` → `Typography.size.xxl`
- `statBoxLabel.fontSize`: `Typography.size.xs` → `Typography.size.sm`
- `sectionHeader.justifyContent`: `'space-between'` → `'flex-start'`
- `sectionHeaderTitle.color`: `'#1A1035'` → `Colors.text.primary`

### ADDED (20 keys)
Layout: `mainContent`

Banner: `rewardBanner`, `rewardBannerLeft`, `rewardBannerIcon`, `rewardBannerTitle`, `rewardBannerSubtitle`, `rewardBannerGlow`

Modal: `modalOverlay`, `modalCard`, `modalCloseBtn`, `modalCloseBtnText`, `modalTitle`, `rewardGrid`, `rewardRow`, `rewardCell`, `rewardCellToday`, `rewardCellEmoji`, `rewardCellDay`, `rewardCoinBadge`, `rewardCoinText`

---

## Implementation Order

1. **Edit `assets/styles/homeStyle.js` first**: remove 2 keys, modify 9 keys, add 20 keys.
   Run `npm run lint`. Fix any issues before proceeding.
   Commit: `refactor(home): update homeStyle for v4 redesign`

2. **Edit `app/(app)/index.tsx`**: update imports, add constants/component/state/refs/effects, remove stat box JSX, remove link JSX, replace ScrollView, add banner JSX, add modal JSX, update gradient constant, update icon color.
   Run `npx tsc --noEmit && npm run lint`. Fix any issues.
   Commit: `feat(home): v4 rewrite — dark bg, 2 stats, no scroll, reward banner + modal`

---

## Risks and Edge Cases

1. **Dark background makes existing hardcoded `'#1A1035'` values invisible.** Two places in `index.tsx`: the `Ionicons` color on the section header and `sectionHeaderTitle` style. Both must be updated or text/icon will be invisible.

2. **`statBoxValue` at fontSize 24 inside `minWidth: 72`.** If device font scale is above 1.0, the value may overflow. Add `numberOfLines={1}` and `adjustsFontSizeToFit` to stat value Text nodes as a defensive measure.

3. **Fixed layout on short screens (iPhone SE: 375×667pt).** User card (~120px) + section header (~50px) + game grid (~340px) + reward banner (~80px) + bottom nav (~60px) ≈ 650px against 667pt. Very tight. Mitigations: reduce `sectionHeader.marginTop` from Spacing.xl (24) to Spacing.md (12); reduce `gameModeGrid.gap` from Spacing.md (12) to Spacing.sm (8) if needed.

4. **`rewardCellToday` with `transform: [{ scale: 1.05 }]` in a `flex: 1` row.** Scale doesn't affect flexbox layout — the cell visually overflows slightly. Parent `rewardRow` must NOT have `overflow: 'hidden'` to avoid clipping the glow.

5. **`Shadows.glow` on `rewardCellToday`.** Uses purple shadow. On Android, `elevation` will create a visible shadow on the dark cell inside the white card — verify visually on device.

6. **`shimmerAnim` in `useEffect` dependency array.** Ref value is stable so omitting it is safe, but it triggers `react-hooks/exhaustive-deps`. Suppress with `// eslint-disable-next-line react-hooks/exhaustive-deps`.

7. **`HARDCODED_STREAK` default is 7.** Day 7 is displayed as "today" in the modal (highlighted). Days 1–6 render with `isPast` emoji `📭`. This is intentional for demo purposes.

8. **`rewardBanner` `overflow: 'hidden'` clips the glow circle.** The Animated.View glow is positioned `right: 16` inside the banner — `overflow: 'hidden'` prevents it from bleeding outside the rounded corners. This is the desired behavior.

---

## Acceptance Criteria

**Change 1 — Stat boxes reduced to 2:**
- Exactly 2 stat boxes visible: Puan (coin icon) and Can (heart icon). No flame icon, no "Günlük Seri".
- `statBoxValue` numbers appear visually large (24px on default font scale).
- User name renders larger than level badge text.

**Change 2 — Dark gradient background:**
- Background is visibly deep dark purple/navy (not lavender).
- `container` backgroundColor matches gradient bottom (`#0D0527`).
- Section header icon and title are white/light, readable on dark background.

**Change 3 — No "Hepsini Gör" link:**
- Section header contains only the left side (gamepad icon + "Oyun Modları" text). No right-side text.

**Change 4 — No ScrollView:**
- Screen does not scroll.
- All content sections visible without scrolling on a 390×844pt device (iPhone 14).
- Bottom nav stays pinned at screen bottom at all times.

**Change 5 — Daily Reward banner and modal:**
- Banner renders below game grid with gold-to-orange gradient.
- Banner shows 🎁 emoji, bold "Günlük Ödül", subtitle "Bugün oyna, ödülünü kazan!".
- Pulsing white circle glow is visible and animating on the banner right side.
- Tapping banner opens the modal.
- Modal overlay is semi-transparent dark.
- Modal card is white, rounded corners, centered.
- Title is "GÜNLÜK ÖDÜL" in bold dark text.
- Close button is purple circle with "×" top-right.
- 7-day grid renders in 3-3-1 row layout.
- Day 7 cell (currentDay default) is highlighted: purple bg, larger scale, 🎁 emoji.
- Days 1–6 cells show 📭 emoji, correct coin values.
- Each cell has a dark coin badge with gold coin text.
- Close button and Android back button both dismiss the modal.

**Change 6 — Theme token usage:**
- `sectionHeaderTitle` uses `Colors.text.primary` — no hardcoded hex.
- `rewardCellToday.backgroundColor` uses `Colors.accent.purple`.
- `rewardCoinText.color` uses `Colors.accent.gold`.
- `modalTitle.color` uses `Colors.bg.primary`.
- `REWARD_GRADIENT` is a named local constant (not inline).
- `npx tsc --noEmit` — zero errors.
- `npm run lint` — zero errors.

---

## Validation Commands

```powershell
npx tsc --noEmit
npm run lint
npm run android
```
