# Home Screen Redesign Plan

**Date:** 2026-05-21
**Research input:** thoughts/shared/research/2026-05-21_ui-audit.md

---

## Overview

Full rewrite of `app/(app)/index.tsx` from the existing image-background / plain-card layout to a polished screen with:
- LinearGradient full-screen background
- Top currency/lives bar
- User card with initials avatar, XP progress bar, level badge
- Streak widget with 7-day circle row
- 2x2 game mode grid with per-card LinearGradient
- Daily challenge banner
- Custom bottom navigation bar (4 tabs, no react-navigation tab bar)

Simultaneously, `assets/styles/homeStyle.js` is fully replaced so every dimension, color, font, and shadow references only `constants/theme.ts` tokens.

---

## Files to Change

| File | Change |
|------|--------|
| `app/(app)/index.tsx` | Full rewrite — new component `HomeScreen` |
| `assets/styles/homeStyle.js` | Full replacement — all 24 old keys removed, ~50 new keys |

## Files to Create

None.

---

## Phase 1 — New `assets/styles/homeStyle.js`

### Step 1.1 — File header

```js
import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;
```

### Step 1.2 — Export `export const homeStyles = StyleSheet.create({ ... })`

**Layout group:**
- `container` — `{ flex: 1 }`
- `safeArea` — `{ flex: 1 }`
- `scrollContent` — `{ paddingBottom: 120 }`

**Top bar group:**
- `topBar` — `{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md }`
- `topBarSlot` — `{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }`
- `topBarIcon` — `{ fontSize: Typography.size.xl }`
- `topBarValue` — `{ fontFamily: Typography.family.black, fontSize: Typography.size.lg, color: Colors.accent.gold }`
- `topBarLives` — `{ fontFamily: Typography.family.black, fontSize: Typography.size.lg, color: Colors.wrong }`

**User card group:**
- `userCard` — `{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bg.surface, borderRadius: Radius.lg, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderWidth: 1, borderColor: Colors.border.default, ...Shadows.card }`
- `avatarCircle` — `{ width: 52, height: 52, borderRadius: Radius.full, backgroundColor: Colors.brand.primary, alignItems: 'center', justifyContent: 'center' }`
- `avatarInitials` — `{ fontFamily: Typography.family.black, fontSize: Typography.size.xl, color: Colors.text.primary }`
- `userInfo` — `{ flex: 1 }`
- `userName` — `{ fontFamily: Typography.family.bold, fontSize: Typography.size.lg, color: Colors.text.primary, marginBottom: Spacing.xs }`
- `levelBadge` — `{ alignSelf: 'flex-start', backgroundColor: Colors.accent.purple, paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full, marginBottom: Spacing.xs }`
- `levelBadgeText` — `{ fontFamily: Typography.family.bold, fontSize: Typography.size.xs, color: Colors.text.primary }`
- `xpBarTrack` — `{ height: 6, backgroundColor: Colors.border.white, borderRadius: Radius.full, overflow: 'hidden' }`
- `xpBarFill` — `{ height: 6, backgroundColor: Colors.brand.primary, borderRadius: Radius.full }` (width set via inline dynamic style)
- `xpLabel` — `{ fontFamily: Typography.family.regular, fontSize: Typography.size.xs, color: Colors.text.muted, marginTop: 3 }`

**Streak card group:**
- `streakCard` — `{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.bg.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border.default, ...Shadows.card }`
- `streakHeader` — `{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.md }`
- `streakIcon` — `{ fontSize: Typography.size.xl }`
- `streakTitle` — `{ fontFamily: Typography.family.extrabold, fontSize: Typography.size.lg, color: Colors.text.primary }`
- `streakDaysRow` — `{ flexDirection: 'row', justifyContent: 'space-between' }`
- `dayCircle` — `{ width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.bg.elevated, alignItems: 'center', justifyContent: 'center' }`
- `dayCircleActive` — `{ backgroundColor: Colors.brand.primary, ...Shadows.button }`
- `dayLabel` — `{ fontFamily: Typography.family.semibold, fontSize: Typography.size.xs, color: Colors.text.muted }`
- `dayLabelActive` — `{ color: Colors.text.primary }`

**Game mode grid group:**
- `sectionTitle` — `{ fontFamily: Typography.family.extrabold, fontSize: Typography.size.lg, color: Colors.text.primary, marginHorizontal: Spacing.lg, marginBottom: Spacing.md }`
- `gridContainer` — `{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.md }`
- `modeCard` — `{ width: CARD_WIDTH, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', justifyContent: 'center', minHeight: 130, ...Shadows.card }`
- `modeIcon` — `{ fontSize: 32, marginBottom: Spacing.sm }`
- `modeTitle` — `{ fontFamily: Typography.family.extrabold, fontSize: Typography.size.md, color: Colors.text.primary, textAlign: 'center', marginBottom: Spacing.xs }`
- `modeSubtitle` — `{ fontFamily: Typography.family.regular, fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }`

**Daily challenge banner group:**
- `challengeBanner` — `{ marginHorizontal: Spacing.lg, borderRadius: Radius.lg, padding: Spacing.xl, marginBottom: Spacing.md, ...Shadows.glow }`
- `challengeBannerTitle` — `{ fontFamily: Typography.family.black, fontSize: Typography.size.xl, color: Colors.text.primary, marginBottom: Spacing.xs }`
- `challengeBannerDesc` — `{ fontFamily: Typography.family.regular, fontSize: Typography.size.md, color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.lg, lineHeight: 22 }`
- `challengeCtaButton` — `{ alignSelf: 'flex-start', backgroundColor: Colors.text.primary, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, borderRadius: Radius.full, ...Shadows.button }`
- `challengeCtaText` — `{ fontFamily: Typography.family.extrabold, fontSize: Typography.size.md, color: Colors.modes.daily.from }`

**Bottom nav group:**
- `bottomNav` — `{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 68, backgroundColor: Colors.bg.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: Colors.border.default }`
- `navItem` — `{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.sm }`
- `navIcon` — `{ fontSize: 22, marginBottom: 2 }`
- `navLabel` — `{ fontFamily: Typography.family.semibold, fontSize: Typography.size.xs, color: Colors.text.muted }`
- `navLabelActive` — `{ color: Colors.brand.primary }`
- `navActiveIndicator` — `{ position: 'absolute', top: 0, width: 24, height: 3, borderRadius: Radius.full, backgroundColor: Colors.brand.primary }`

---

## Phase 2 — Rewrite `app/(app)/index.tsx`

### Step 2.1 — Imports (exact order)

```typescript
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { homeStyles } from '@/assets/styles/homeStyle';
import { Colors } from '@/constants/theme';
```

### Step 2.2 — TypeScript interfaces (after imports, before component)

```typescript
interface GameMode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradientColors: readonly [string, string];
  onPress: () => void;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}
```

### Step 2.3 — Component signature

```typescript
export default function HomeScreen(): JSX.Element {
```

### Step 2.4 — Hooks (first lines of body)

```typescript
const { user } = useAuth();
const router = useRouter();
const insets = useSafeAreaInsets();
const [activeTab, setActiveTab] = useState<string>('home');
```

### Step 2.5 — Hardcoded constants

```typescript
const HARDCODED_COINS = 1250;
const HARDCODED_LIVES = 5;
const HARDCODED_STREAK = 7;
const XP_CURRENT = 340;
const XP_MAX = 500;
const LEVEL = 12;
const DAYS = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'];
const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
const xpPercent = (XP_CURRENT / XP_MAX) * 100;
```

### Step 2.6 — Derived values

```typescript
const avatarInitials = useMemo(() => {
  if (!user?.name) return '??';
  const parts = (user.name as string).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}, [user?.name]);
```

### Step 2.7 — GAME_MODES array

```typescript
const GAME_MODES: GameMode[] = [
  {
    id: 'quick',
    title: 'Hızlı Oyun',
    subtitle: '10 Soru · 15 sn',
    icon: '⚡',
    gradientColors: [Colors.modes.quick.from, Colors.modes.quick.to],
    onPress: () => router.push('/game/quick-game'),
  },
  {
    id: 'friends',
    title: 'Arkadaşlar',
    subtitle: 'Arkadaşlarla Oyna',
    icon: '👥',
    gradientColors: [Colors.modes.friends.from, Colors.modes.friends.to],
    onPress: () => showToast.info('Yakında', 'Bu mod yakında geliyor!'),
  },
  {
    id: 'daily',
    title: 'Günlük Görev',
    subtitle: 'Günlük Mücadele',
    icon: '📅',
    gradientColors: [Colors.modes.daily.from, Colors.modes.daily.to],
    onPress: () => showToast.info('Yakında', 'Bu mod yakında geliyor!'),
  },
  {
    id: 'tournament',
    title: 'Turnuva',
    subtitle: 'Turnuvaya Katıl',
    icon: '🏆',
    gradientColors: [Colors.modes.tournament.from, Colors.modes.tournament.to],
    onPress: () => showToast.info('Yakında', 'Bu mod yakında geliyor!'),
  },
];
```

### Step 2.8 — NAV_ITEMS array

```typescript
const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: '🏠', label: 'Ana Sayfa', onPress: () => {} },
  { id: 'play', icon: '🎮', label: 'Oyna', onPress: () => router.push('/game/quick-game') },
  { id: 'leaderboard', icon: '🏅', label: 'Sıralama', onPress: () => showToast.info('Yakında', 'Bu özellik yakında geliyor!') },
  { id: 'profile', icon: '👤', label: 'Profil', onPress: () => showToast.info('Yakında', 'Bu özellik yakında geliyor!') },
];
```

### Step 2.9 — JSX return block

```
return (
  <View style={homeStyles.container}>
    <LinearGradient
      colors={[Colors.bg.primary, Colors.bg.secondary, Colors.bg.card]}
      style={StyleSheet.absoluteFill}
    />
    <SafeAreaView style={homeStyles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section A: Top Bar */}
        {/* Section B: User Card */}
        {/* Section C: Streak Card */}
        {/* Section D: Section Title + Grid */}
        {/* Section E: Daily Challenge Banner */}
      </ScrollView>
    </SafeAreaView>
    {/* Section F: Bottom Nav — outside ScrollView, pinned at bottom */}
    <View style={[homeStyles.bottomNav, { paddingBottom: insets.bottom || 8 }]}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={homeStyles.navItem}
          onPress={() => { setActiveTab(item.id); item.onPress(); }}
          activeOpacity={0.7}
        >
          {activeTab === item.id && <View style={homeStyles.navActiveIndicator} />}
          <Text style={homeStyles.navIcon}>{item.icon}</Text>
          <Text style={[homeStyles.navLabel, activeTab === item.id && homeStyles.navLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
```

**Section A — Top Bar:**
```jsx
<View style={homeStyles.topBar}>
  <View style={homeStyles.topBarSlot}>
    <Text style={homeStyles.topBarIcon}>🪙</Text>
    <Text style={homeStyles.topBarValue}>{HARDCODED_COINS.toLocaleString('tr-TR')}</Text>
  </View>
  <View style={homeStyles.topBarSlot}>
    <Text style={homeStyles.topBarIcon}>❤️</Text>
    <Text style={homeStyles.topBarLives}>{HARDCODED_LIVES}</Text>
  </View>
</View>
```

**Section B — User Card:**
```jsx
<View style={homeStyles.userCard}>
  <View style={homeStyles.avatarCircle}>
    <Text style={homeStyles.avatarInitials}>{avatarInitials}</Text>
  </View>
  <View style={homeStyles.userInfo}>
    <View style={homeStyles.levelBadge}>
      <Text style={homeStyles.levelBadgeText}>Seviye {LEVEL}</Text>
    </View>
    <Text style={homeStyles.userName}>{user?.name ?? 'Oyuncu'}</Text>
    <View style={homeStyles.xpBarTrack}>
      <View style={[homeStyles.xpBarFill, { width: `${xpPercent}%` as `${number}%` }]} />
    </View>
    <Text style={homeStyles.xpLabel}>{XP_CURRENT} / {XP_MAX} XP</Text>
  </View>
</View>
```

**Section C — Streak Card:**
```jsx
<View style={homeStyles.streakCard}>
  <View style={homeStyles.streakHeader}>
    <Text style={homeStyles.streakIcon}>🔥</Text>
    <Text style={homeStyles.streakTitle}>{HARDCODED_STREAK} günlük seri!</Text>
  </View>
  <View style={homeStyles.streakDaysRow}>
    {DAYS.map((day, index) => (
      <View key={day} style={{ alignItems: 'center' as const, gap: 4 }}>
        <View style={[homeStyles.dayCircle, index <= TODAY_INDEX && homeStyles.dayCircleActive]}>
          <Text style={{ fontSize: 10 }}>{index <= TODAY_INDEX ? '✓' : ' '}</Text>
        </View>
        <Text style={[homeStyles.dayLabel, index <= TODAY_INDEX && homeStyles.dayLabelActive]}>
          {day}
        </Text>
      </View>
    ))}
  </View>
</View>
```

**Section D — Section Title + Grid:**
```jsx
<Text style={homeStyles.sectionTitle}>Oyun Modları</Text>
<View style={homeStyles.gridContainer}>
  {GAME_MODES.map((mode) => (
    <TouchableOpacity key={mode.id} onPress={mode.onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={mode.gradientColors}
        style={homeStyles.modeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={homeStyles.modeIcon}>{mode.icon}</Text>
        <Text style={homeStyles.modeTitle}>{mode.title}</Text>
        <Text style={homeStyles.modeSubtitle}>{mode.subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  ))}
</View>
```

**Section E — Daily Challenge Banner:**
```jsx
<LinearGradient
  colors={[Colors.modes.daily.from, Colors.modes.daily.to]}
  style={homeStyles.challengeBanner}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
>
  <Text style={homeStyles.challengeBannerTitle}>Günün Mücadelesi</Text>
  <Text style={homeStyles.challengeBannerDesc}>
    Bugünkü soruları çöz, bonus XP kazan!
  </Text>
  <TouchableOpacity
    style={homeStyles.challengeCtaButton}
    onPress={() => showToast.info('Yakında', 'Bu özellik yakında geliyor!')}
    activeOpacity={0.85}
  >
    <Text style={homeStyles.challengeCtaText}>Başla →</Text>
  </TouchableOpacity>
</LinearGradient>
```

### Step 2.10 — Remove from component entirely
- All `uploadQuestions` / `handleUpload` references
- `signout` button and its handler
- `ImageBackground` and overlay `View`
- `Image` (logo)
- `TextCustom` imports

---

## Risks and Edge Cases

1. **`user` typed as `false | AppwriteUser | null`** — guard with `user?.name` optional chain. Fallback `'Oyuncu'` for display name, `'??'` for initials.

2. **`expo-linear-gradient` TypeScript strictness** — `gradientColors: readonly [string, string]` satisfies the `colors` prop. Do not widen the type.

3. **`StyleSheet.absoluteFill`** — requires `StyleSheet` in the `react-native` import.

4. **Bottom nav `paddingBottom` is inline-only** — do NOT put `paddingBottom` in the static `bottomNav` style key, only apply it inline with `insets.bottom`.

5. **`gap` in StyleSheet** — supported from RN 0.71+; project runs RN 0.81.5, safe to use.

6. **`scrollContent.paddingBottom: 120`** — 120 exceeds nav height (68) + max safe area inset (34) = 102. Provides 18px clearance.

7. **`Colors.bg.primary/secondary/card` for LinearGradient** — use theme tokens instead of raw hex strings: `[Colors.bg.primary, Colors.bg.secondary, Colors.bg.card]`.

---

## Validation Commands

```bash
npm run lint
```
Expected: 0 errors, 0 warnings for modified files.

```bash
npm run android
```

Manual visual checklist:
- [ ] Deep purple gradient background visible
- [ ] Top bar: coin 🪙 "1.250" left, heart ❤️ "5" right
- [ ] User card: orange avatar circle with initials, "Seviye 12" badge, username, XP bar at 68%, "340 / 500 XP"
- [ ] Streak card: 🔥 "7 günlük seri!", 7 day circles, Mon–today highlighted orange
- [ ] 2x2 grid: 4 distinct gradient cards with icons/titles
- [ ] Quick Game card → navigates to `/game/quick-game`
- [ ] Friends/Daily/Tournament cards → "Yakında" toast
- [ ] Daily challenge banner: purple gradient, "Başla →" button shows toast
- [ ] Bottom nav: 4 tabs, Home active by default (orange indicator + label)
- [ ] Play tab → navigates to `/game/quick-game`
- [ ] Leaderboard/Profile tabs → "Yakında" toast
- [ ] No content hidden under bottom nav on scroll

---

## Files Changed / Created

| Path | Action |
|------|--------|
| `app/(app)/index.tsx` | REPLACE — full rewrite, component `HomeScreen` |
| `assets/styles/homeStyle.js` | REPLACE — 24 old keys removed, ~50 new keys using theme tokens |
