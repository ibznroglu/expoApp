# Home Screen Rewrite v3 — Light Theme, 4-Mode Grid

## Goal

Full rewrite of `app/(app)/index.tsx` and `assets/styles/homeStyle.js` replacing the dark-purple v2 design (single PLAY button, 3-tab row, 3 stats cards, 2-icon nav) with the reference v3 design: light gradient background, dark-purple user card with avatar/XP/3 stat boxes, 2×2 game-mode card grid with LinearGradient cards and per-card "Oyna" buttons, and a 4-tab bottom nav.

---

## Layout Sketch

```
┌────────────────────────────────────────────────┐
│  STATUS BAR (safe area top)                    │
├────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐   │  ← USER CARD (dark purple #3B1F8C)
│ │ [IB]  Kullanici Adi           ┌────────┐ │   │
│ │       [★ Sv.12]               │🪙1.250 │ │   │
│ │ ████████████░  340/500 XP     │❤5      │ │   │
│ │                               │🔥7     │ │   │
│ └──────────────────────────────────────────┘   │
│                                                │
│  🎮 Oyun Modları          Hepsini Gör >        │  ← SECTION HEADER
│                                                │
│ ┌───────────────┐  ┌───────────────┐           │  ← GAME MODE GRID ROW 1
│ │ ⚡ Hızlı Oyun │  │ 📅 Günlük    │           │
│ │ Rastgele...   │  │ Her gün yeni  │           │
│ │  [▶ Oyna]     │  │  [▶ Oyna]    │           │
│ └───────────────┘  └───────────────┘           │
│ ┌───────────────┐  ┌───────────────┐           │  ← GAME MODE GRID ROW 2
│ │ 👥 Arkadaşlar │  │ 🏆 Turnuvalar │           │
│ │ Arkadaşlarını │  │ Diğer oyuncu  │           │
│ │  [▶ Oyna]     │  │  [▶ Keşfet]  │           │
│ └───────────────┘  └───────────────┘           │
│                                                │
├────────────────────────────────────────────────┤
│[🏠 Ana Sayfa][🏆 Sıralama][🎁 Görevler][👤 Profil]│  ← BOTTOM NAV (4 tabs)
│  SAFE AREA BOTTOM                              │
└────────────────────────────────────────────────┘
```

---

## Files to Change

| File | Action |
|---|---|
| `app/(app)/index.tsx` | Full rewrite |
| `assets/styles/homeStyle.js` | Full replacement |

No new packages needed — `expo-linear-gradient`, `@expo/vector-icons`, `react-native-safe-area-context`, `expo-router` already installed.

---

## Token Audit — Theme Values vs Raw Overrides

**Reused from `constants/theme.ts`:**

| Usage | Token |
|---|---|
| Daily mode gradient | `Colors.modes.daily.from / .to` |
| Tournament mode gradient | `Colors.modes.tournament.from / .to` |
| Gold XP fill / coin icon | `Colors.accent.gold` |
| Red heart icon | `Colors.wrong` |
| Orange flame icon | `Colors.brand.secondary` |
| Level badge background | `Colors.accent.purple` |
| Active nav color | `Colors.accent.purple` |
| Card text primary | `Colors.text.primary` |
| Spacing, Radius, Typography | all tokens |

**Raw values required (no theme token):**

| Value | Reason |
|---|---|
| `['#F8F0FF', '#EDE0FF', '#E8D5FF']` | Theme has only dark bg tokens |
| `'#3B1F8C'` | User card bg — no theme light-card token |
| `'rgba(0,0,0,0.25)'` | Stat box area overlay |
| `'rgba(255,255,255,0.08)'` | Individual stat box tint |
| `'rgba(0,0,0,0.3)'` | XP bar track (dark inside user card) |
| `'#1A1035'` | Section header text (dark on light bg) |
| `'#FF6B35'` / `'#FFB800'` | Quick mode override — theme `#FF4500` is darker than spec |
| `'#1565C0'` / `'#42A5F5'` | Friends mode override — theme has teal, spec wants blue |
| `'#FFFFFF'` | Bottom nav background (light theme) |
| `'rgba(0,0,0,0.08)'` | Bottom nav border |
| `'#9CA3AF'` | Inactive nav color (light-mode gray) |
| `'rgba(255,255,255,0.15)'` | Decorative star tint on cards |
| `'rgba(255,255,255,0.25)'` | "Oyna" button tint |
| `'rgba(255,255,255,0.75)'` | Card subtitle text |

---

## New Style Keys for `assets/styles/homeStyle.js`

Imports: `StyleSheet` from `react-native`; `Colors, Spacing, Radius, Typography, Shadows` from `@/constants/theme`.

### Layout
```
container       — { flex: 1, backgroundColor: '#F8F0FF' }
safeArea        — { flex: 1 }
scrollContent   — { paddingBottom: 16 }
```

### User Card
```
userCard        — { mx:Spacing.lg, mt:Spacing.sm, borderRadius:Radius.lg, backgroundColor:'#3B1F8C', padding:Spacing.md, ...Shadows.button }
userCardTop     — { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between' }
userCardLeft    — { flex:1, marginRight:Spacing.sm }
avatarRow       — { flexDirection:'row', alignItems:'center', gap:Spacing.sm, marginBottom:Spacing.xs }
avatarCircle    — { width:44, height:44, borderRadius:Radius.full, backgroundColor:'#FF8C42', alignItems:'center', justifyContent:'center' }
avatarInitials  — { fontFamily:Typography.family.black, fontSize:Typography.size.lg, color:Colors.text.primary }
userNameText    — { fontFamily:Typography.family.bold, fontSize:Typography.size.md, color:Colors.text.primary, maxWidth:120 }
levelBadge      — { flexDirection:'row', alignItems:'center', gap:3, backgroundColor:Colors.accent.purple, paddingHorizontal:Spacing.sm, paddingVertical:2, borderRadius:Radius.full, alignSelf:'flex-start', marginTop:4 }
levelBadgeText  — { fontFamily:Typography.family.bold, fontSize:Typography.size.xs, color:Colors.text.primary }
xpRow           — { marginTop:Spacing.sm, gap:4 }
xpBarTrack      — { height:6, backgroundColor:'rgba(0,0,0,0.3)', borderRadius:Radius.full, overflow:'hidden' }
xpBarFill       — { height:6, backgroundColor:Colors.accent.gold, borderRadius:Radius.full }
xpLabel         — { fontFamily:Typography.family.regular, fontSize:Typography.size.xs, color:'rgba(255,255,255,0.6)', textAlign:'right' }
```

### User Card Stat Boxes (right side)
```
statBoxArea     — { backgroundColor:'rgba(0,0,0,0.25)', borderRadius:Radius.md, padding:Spacing.sm, gap:Spacing.xs }
statBox         — { backgroundColor:'rgba(255,255,255,0.08)', borderRadius:Radius.sm, paddingVertical:6, paddingHorizontal:Spacing.sm, alignItems:'center', minWidth:64 }
statBoxValue    — { fontFamily:Typography.family.black, fontSize:Typography.size.sm, color:Colors.text.primary }
statBoxLabel    — { fontFamily:Typography.family.regular, fontSize:Typography.size.xs, color:'rgba(255,255,255,0.6)' }
```

### Section Header
```
sectionHeader       — { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:Spacing.lg, marginTop:Spacing.xl, marginBottom:Spacing.md }
sectionHeaderLeft   — { flexDirection:'row', alignItems:'center', gap:Spacing.xs }
sectionHeaderTitle  — { fontFamily:Typography.family.bold, fontSize:Typography.size.lg, color:'#1A1035' }
sectionHeaderLink   — { fontFamily:Typography.family.semibold, fontSize:Typography.size.sm, color:Colors.accent.purple }
```

### Game Mode Grid
```
gameModeGrid      — { flexDirection:'row', flexWrap:'wrap', paddingHorizontal:Spacing.lg, gap:Spacing.md }
gameModeCard      — { width:'47%', borderRadius:Radius.lg, overflow:'hidden', ...Shadows.button }
gameModeGradient  — { minHeight:160, padding:Spacing.md, justifyContent:'space-between' }
gameModeIcon      — { marginBottom:Spacing.xs }
gameModeTitle     — { fontFamily:Typography.family.black, fontSize:Typography.size.md, color:Colors.text.primary, marginBottom:2 }
gameModeSubtitle  — { fontFamily:Typography.family.regular, fontSize:Typography.size.xs, color:'rgba(255,255,255,0.75)', marginBottom:Spacing.sm }
gameModePlayBtn   — { backgroundColor:'rgba(255,255,255,0.25)', borderRadius:Radius.full, paddingVertical:6, paddingHorizontal:Spacing.md, alignSelf:'flex-start', flexDirection:'row', alignItems:'center', gap:4 }
gameModePlayText  — { fontFamily:Typography.family.bold, fontSize:Typography.size.xs, color:Colors.text.primary }
gameModeStar      — { position:'absolute', color:'rgba(255,255,255,0.15)', fontSize:28 }
```

### Bottom Nav
```
bottomNav           — { flexDirection:'row', backgroundColor:'#FFFFFF', borderTopWidth:1, borderTopColor:'rgba(0,0,0,0.08)', paddingTop:Spacing.sm }
navItem             — { flex:1, alignItems:'center', justifyContent:'center', gap:3, paddingBottom:Spacing.sm }
navLabel            — { fontFamily:Typography.family.semibold, fontSize:Typography.size.xs, color:'#9CA3AF' }
navLabelActive      — { color:Colors.accent.purple }
navActiveIndicator  — { position:'absolute', top:0, width:28, height:3, borderRadius:Radius.full, backgroundColor:Colors.accent.purple }
```

---

## Component Structure — `app/(app)/index.tsx`

### Imports
```typescript
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { initSounds, playSound } from '@/utils/sound';
import { homeStyles } from '@/assets/styles/homeStyle';
import { Colors } from '@/constants/theme';
```

Removed vs v2: `Animated`, `useRef`. Added: `ScrollView`, `initSounds`, `playSound`.

### Interfaces and Types
```typescript
type NavId = 'home' | 'leaderboard' | 'quests' | 'profile';

interface NavItem {
  id: NavId;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconNameActive: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}

interface GameMode {
  id: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  gradientColors: readonly [string, string];
  buttonLabel: string;
  onPress: () => void;
}
```

### Local Gradient Constants (before component or inside, documented)
```typescript
// Light background — no light-theme tokens in Colors.bg
const BG_GRADIENT = ['#F8F0FF', '#EDE0FF', '#E8D5FF'] as const;
// Quick mode: spec uses #FF6B35; theme has darker #FF4500
const QUICK_GRADIENT = ['#FF6B35', '#FFB800'] as const;
// Friends mode: spec uses blue; theme has teal (#00897B→#00E5CC)
const FRIENDS_GRADIENT = ['#1565C0', '#42A5F5'] as const;
```

### Inside Component — State and Hooks
```typescript
const { user } = useAuth();
const router = useRouter();
const insets = useSafeAreaInsets();
const [activeNav, setActiveNav] = useState<NavId>('home');

const typedUser = user && typeof user !== 'boolean' ? user : null;
```

### Constants (after user guard)
```typescript
const HARDCODED_COINS = 1250;
const HARDCODED_LIVES = 5;
const HARDCODED_STREAK =
  (typedUser?.prefs as { streakCount?: number } | undefined)?.streakCount ?? 7;
const XP_CURRENT = 340;
const XP_MAX = 500;
const LEVEL = 12;
const xpPercent = (XP_CURRENT / XP_MAX) * 100;
```

### useEffect — Sound Init
```typescript
useEffect(() => {
  initSounds().catch(() => {});
}, []);
```

### avatarInitials — useMemo
```typescript
const avatarInitials = useMemo<string>(() => {
  if (!typedUser?.name) return '??';
  const parts = (typedUser.name as string).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}, [typedUser?.name]);
```

### GAME_MODES Array
```typescript
const GAME_MODES: GameMode[] = [
  {
    id: 'quick',
    title: 'Hızlı Oyun',
    subtitle: 'Rastgele sorularla hızını test et!',
    iconName: 'flash',
    gradientColors: QUICK_GRADIENT,
    buttonLabel: '▶ Oyna',
    onPress: () => { playSound('correct'); router.push('/game/quick-game'); },
  },
  {
    id: 'daily',
    title: 'Günlük Challenge',
    subtitle: 'Her gün yeni sorular, özel ödüller!',
    iconName: 'calendar',
    gradientColors: [Colors.modes.daily.from, Colors.modes.daily.to] as [string, string],
    buttonLabel: '▶ Oyna',
    onPress: () => { playSound('correct'); showToast.info('Yakında', 'Günlük mod yakında geliyor!'); },
  },
  {
    id: 'friends',
    title: 'Arkadaşlarla',
    subtitle: 'Arkadaşlarını davet et, bilginizi karşılaştırın!',
    iconName: 'people',
    gradientColors: FRIENDS_GRADIENT,
    buttonLabel: '▶ Oyna',
    onPress: () => { playSound('correct'); showToast.info('Yakında', 'Arkadaşlar modu yakında geliyor!'); },
  },
  {
    id: 'tournament',
    title: 'Turnuvalar',
    subtitle: 'Diğer oyunculara karşı yerini al!',
    iconName: 'trophy',
    gradientColors: [Colors.modes.tournament.from, Colors.modes.tournament.to] as [string, string],
    buttonLabel: '▶ Keşfet',
    onPress: () => { playSound('correct'); showToast.info('Yakında', 'Turnuvalar yakında geliyor!'); },
  },
];
```

### NAV_ITEMS Array
```typescript
const NAV_ITEMS: NavItem[] = [
  { id: 'home',        iconName: 'home-outline',  iconNameActive: 'home',   label: 'Ana Sayfa', onPress: () => {} },
  { id: 'leaderboard', iconName: 'trophy-outline', iconNameActive: 'trophy', label: 'Sıralama',  onPress: () => showToast.info('Yakında', 'Sıralama yakında geliyor!') },
  { id: 'quests',      iconName: 'gift-outline',   iconNameActive: 'gift',   label: 'Görevler',  onPress: () => showToast.info('Yakında', 'Görevler yakında geliyor!') },
  { id: 'profile',     iconName: 'person-outline', iconNameActive: 'person', label: 'Profil',    onPress: () => showToast.info('Yakında', 'Profil yakında geliyor!') },
];
```

### JSX Tree
```tsx
<View style={homeStyles.container}>
  <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
  <SafeAreaView style={homeStyles.safeArea} edges={['top']}>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
    >
      {/* User card */}
      <View style={[homeStyles.userCard, { marginHorizontal: 16, marginTop: 8 }]}>
        <View style={homeStyles.userCardTop}>
          <View style={homeStyles.userCardLeft}>
            <View style={homeStyles.avatarRow}>
              <View style={homeStyles.avatarCircle}>
                <Text style={homeStyles.avatarInitials}>{avatarInitials}</Text>
              </View>
              <View>
                <Text style={homeStyles.userNameText} numberOfLines={1}>
                  {(typedUser?.name as string | undefined) ?? 'Oyuncu'}
                </Text>
                <View style={homeStyles.levelBadge}>
                  <Ionicons name="star" size={10} color={Colors.accent.gold} />
                  <Text style={homeStyles.levelBadgeText}>Sv.{LEVEL}</Text>
                </View>
              </View>
            </View>
            <View style={homeStyles.xpRow}>
              <View style={homeStyles.xpBarTrack}>
                <View style={[homeStyles.xpBarFill, { width: `${xpPercent}%` as `${number}%` }]} />
              </View>
              <Text style={homeStyles.xpLabel}>{XP_CURRENT} / {XP_MAX} XP</Text>
            </View>
          </View>
          <View style={homeStyles.statBoxArea}>
            <View style={homeStyles.statBox}>
              <Ionicons name="cash" size={16} color={Colors.accent.gold} />
              <Text style={homeStyles.statBoxValue}>{HARDCODED_COINS.toLocaleString('tr-TR')}</Text>
              <Text style={homeStyles.statBoxLabel}>Puan</Text>
            </View>
            <View style={homeStyles.statBox}>
              <Ionicons name="heart" size={16} color={Colors.wrong} />
              <Text style={homeStyles.statBoxValue}>{HARDCODED_LIVES}</Text>
              <Text style={homeStyles.statBoxLabel}>Can</Text>
            </View>
            <View style={homeStyles.statBox}>
              <Ionicons name="flame" size={16} color={Colors.brand.secondary} />
              <Text style={homeStyles.statBoxValue}>{HARDCODED_STREAK}</Text>
              <Text style={homeStyles.statBoxLabel}>Günlük Seri</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Section header */}
      <View style={homeStyles.sectionHeader}>
        <View style={homeStyles.sectionHeaderLeft}>
          <Ionicons name="game-controller" size={20} color="#1A1035" />
          <Text style={homeStyles.sectionHeaderTitle}>Oyun Modları</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={homeStyles.sectionHeaderLink}>Hepsini Gör {'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Game mode grid */}
      <View style={homeStyles.gameModeGrid}>
        {GAME_MODES.map((mode) => (
          <View key={mode.id} style={homeStyles.gameModeCard}>
            <LinearGradient
              colors={mode.gradientColors}
              style={homeStyles.gameModeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[homeStyles.gameModeStar, { top: 8, right: 8 }]}>★</Text>
              <View>
                <Ionicons
                  name={mode.iconName}
                  size={28}
                  color={Colors.text.primary}
                  style={homeStyles.gameModeIcon}
                />
                <Text style={homeStyles.gameModeTitle}>{mode.title}</Text>
                <Text style={homeStyles.gameModeSubtitle}>{mode.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={homeStyles.gameModePlayBtn}
                onPress={mode.onPress}
                activeOpacity={0.8}
              >
                <Text style={homeStyles.gameModePlayText}>{mode.buttonLabel}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ))}
      </View>
    </ScrollView>

    {/* Bottom nav — fixed outside ScrollView */}
    <View style={[homeStyles.bottomNav, { paddingBottom: insets.bottom || 8 }]}>
      {NAV_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={homeStyles.navItem}
          onPress={() => { setActiveNav(item.id); item.onPress(); }}
          activeOpacity={0.7}
        >
          {activeNav === item.id && <View style={homeStyles.navActiveIndicator} />}
          <Ionicons
            name={activeNav === item.id ? item.iconNameActive : item.iconName}
            size={activeNav === item.id ? 26 : 22}
            color={activeNav === item.id ? Colors.accent.purple : '#9CA3AF'}
          />
          <Text style={[homeStyles.navLabel, activeNav === item.id && homeStyles.navLabelActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

  </SafeAreaView>
</View>
```

---

## Sound Integration

- `initSounds()` called in `useEffect([], [])` at mount — same pattern as `quick-game.jsx`
- `playSound('correct')` called inside every `onPress` in `GAME_MODES` before the action
- Fire-and-forget — no `await`, errors caught internally in `sound.js`
- Do NOT call `unloadSounds` on unmount — sounds are a module-level singleton

---

## Phase Breakdown

### Phase 1 — Replace `assets/styles/homeStyle.js`

1. Delete all v2 style keys (no `playWrapper`, `playGradient`, `tabRow`, `tabButton`, `statsRow`, etc. remain)
2. Write new `StyleSheet.create({})` with all keys from this plan, organized by section comment blocks
3. All raw hex values have an inline comment explaining why no theme token exists
4. Run `npm run lint` — fix any issues before Phase 2

**Commit:** `refactor(home): replace homeStyle.js with light-theme v3 tokens`

### Phase 2 — Rewrite `app/(app)/index.tsx`

1. Replace imports — remove `Animated`, `useRef`; add `ScrollView`, `initSounds`, `playSound`
2. Remove `GameModeTab` type; add `NavId` type and `GameMode` interface
3. Remove animation refs and `useEffect` loop; add `useEffect` for `initSounds`
4. Change `useState` initial value from `''` to `'home'` (active on mount)
5. Add `GAME_MODES` (4 entries), replace `NAV_ITEMS` (2 → 4 entries)
6. Remove `TABS`, `STATS`, `handlePlay`
7. Replace JSX per structural outline above
8. Run `npx tsc --noEmit` then `npm run lint`

**Commit:** `feat(home): full v3 rewrite with user card, 4-mode grid, 4-tab nav`

---

## TypeScript Notes

1. **`typedUser` guard** — mandatory: `const typedUser = user && typeof user !== 'boolean' ? user : null`
2. **`NavId` union type** — `'home' | 'leaderboard' | 'quests' | 'profile'` — catches typos at compile time
3. **`GameMode.gradientColors: readonly [string, string]`** — required for `LinearGradient colors` prop; `Colors.modes.*` values are `string`, not tuple — cast with `as [string, string]`
4. **`BG_GRADIENT as const`** — `readonly [string, string, string]` — satisfies `LinearGradient` 3-color tuple
5. **`xpPercent` inline style** — `{ width: \`${xpPercent}%\` as \`${number}%\` }` — required RN strict cast
6. **`scrollContent` `paddingBottom`** — `insets.bottom + 80` to ensure last card clears the fixed nav bar
7. **`useEffect` return** — `initSounds` effect has no cleanup return (sounds are a singleton)
8. **Removed `Animated` imports** — `Animated`, `useRef` no longer imported; `useMemo`, `useEffect`, `useState` remain

---

## Risks and Edge Cases

1. **Grid card width on narrow screens** — `width: '47%'` with `gap: 12` leaves ~22px gap on 375pt. Acceptable. If overflow is seen, switch to `(screenWidth / 2) - 16 - 6` computed via `useWindowDimensions`.
2. **`overflow: 'hidden'` + shadow conflict** — on Android, `overflow: 'hidden'` clips elevation shadow. The `gameModeCard` wrapper applies shadow and `borderRadius`; `gameModeGradient` fills it with `flex: 1`. This separation preserves shadow on Android.
3. **`Colors.modes.quick.from` mismatch** — theme has `#FF4500` (darker); spec shows `#FF6B35`. Using local `QUICK_GRADIENT` override.
4. **`Colors.modes.friends` mismatch** — theme has teal; spec wants blue. Using local `FRIENDS_GRADIENT` override.
5. **Bottom nav height assumption** — `paddingBottom: insets.bottom + 80` hardcodes ~80px nav height. Acceptable for current scope; measure with `onLayout` in future if needed.
6. **`playSound('correct')` before navigation** — sound may be cut short during navigation transition. Cosmetic tradeoff, acceptable.
7. **Number formatting** — `toLocaleString('tr-TR')` requires Intl in Hermes. Hermes on RN 0.73+ includes full Intl support. If older Hermes: use `String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')`.

---

## Acceptance Criteria

**Phase 1 (homeStyle.js):**
- [ ] `npm run lint` passes with zero errors
- [ ] No raw hex without explanatory comment
- [ ] No v2 keys remain (`playWrapper`, `playGradient`, `tabRow`, `statsRow`, etc.)

**Phase 2 (index.tsx):**
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] Background is light gradient (`#F8F0FF` → `#EDE0FF` → `#E8D5FF`)
- [ ] User card renders with dark purple `#3B1F8C` background
- [ ] Avatar shows orange circle with correct initials; fallback `??`
- [ ] Level badge shows gold star + "Sv.12"
- [ ] XP bar gold fill at 68%; "340 / 500 XP" label right-aligned
- [ ] Three stat boxes: coin/1.250/Puan, heart/5/Can, flame/7/Günlük Seri
- [ ] "Oyun Modları" header with gamepad icon; "Hepsini Gör >" on right
- [ ] 2×2 grid: Hızlı Oyun, Günlük Challenge, Arkadaşlarla, Turnuvalar — each with correct gradient
- [ ] Each card shows icon, title, subtitle, play button
- [ ] Hızlı Oyun "▶ Oyna" → plays sound → navigates to `/game/quick-game`
- [ ] Other mode buttons → plays sound → shows "Yakında" toast
- [ ] Bottom nav: exactly 4 tabs (Ana Sayfa, Sıralama, Görevler, Profil)
- [ ] "Ana Sayfa" tab active (purple) on mount
- [ ] Tapping nav tab changes active highlight
- [ ] ScrollView scrolls past grid
- [ ] Bottom nav fixed — does not scroll
- [ ] Bottom nav respects device safe area
- [ ] No content clipped on iPhone SE (375×667pt)

---

## Validation Commands

```powershell
cd c:\projects\expoApp
npx tsc --noEmit
npm run lint
npm run android
```
