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

// Light background — no light-theme tokens in Colors.bg
const BG_GRADIENT = ['#F8F0FF', '#EDE0FF', '#E8D5FF'] as const;
// Quick mode: spec uses #FF6B35; theme has darker #FF4500
const QUICK_GRADIENT = ['#FF6B35', '#FFB800'] as const;
// Friends mode: spec uses blue; theme has teal (#00897B→#00E5CC)
const FRIENDS_GRADIENT = ['#1565C0', '#42A5F5'] as const;

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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeNav, setActiveNav] = useState<NavId>('home');

  const typedUser = user && typeof user !== 'boolean' ? user : null;

  const HARDCODED_COINS = 1250;
  const HARDCODED_LIVES = 5;
  const HARDCODED_STREAK =
    (typedUser?.prefs as { streakCount?: number } | undefined)?.streakCount ?? 7;
  const XP_CURRENT = 340;
  const XP_MAX = 500;
  const LEVEL = 12;
  const xpPercent = (XP_CURRENT / XP_MAX) * 100;

  useEffect(() => {
    initSounds().catch(() => {});
  }, []);

  const avatarInitials = useMemo<string>(() => {
    if (!typedUser?.name) return '??';
    const parts = (typedUser.name as string).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [typedUser?.name]);

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

  const NAV_ITEMS: NavItem[] = [
    { id: 'home',        iconName: 'home-outline',  iconNameActive: 'home',   label: 'Ana Sayfa', onPress: () => {} },
    { id: 'leaderboard', iconName: 'trophy-outline', iconNameActive: 'trophy', label: 'Sıralama',  onPress: () => showToast.info('Yakında', 'Sıralama yakında geliyor!') },
    { id: 'quests',      iconName: 'gift-outline',   iconNameActive: 'gift',   label: 'Görevler',  onPress: () => showToast.info('Yakında', 'Görevler yakında geliyor!') },
    { id: 'profile',     iconName: 'person-outline', iconNameActive: 'person', label: 'Profil',    onPress: () => showToast.info('Yakında', 'Profil yakında geliyor!') },
  ];

  return (
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
  );
}
