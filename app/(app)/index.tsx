import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { homeStyles } from '@/assets/styles/homeStyle';
import { Colors } from '@/constants/theme';

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
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconNameActive: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('home');

  const HARDCODED_COINS = 1250;
  const HARDCODED_LIVES = 5;
  const HARDCODED_STREAK = 7;
  const XP_CURRENT = 340;
  const XP_MAX = 500;
  const LEVEL = 12;
  const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const TODAY_INDEX = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const xpPercent = (XP_CURRENT / XP_MAX) * 100;

  const avatarInitials = useMemo(() => {
    if (!user?.name) return '??';
    const parts = (user.name as string).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [user?.name]);

  const GAME_MODES: GameMode[] = [
    {
      id: 'quick',
      title: 'Hızlı Oyun',
      subtitle: '10 Soru · 15 sn',
      icon: '⚡',
      gradientColors: ['#FF4500', '#FF8C00'] as const,
      onPress: () => router.push('/game/quick-game'),
    },
    {
      id: 'friends',
      title: 'Arkadaşlar',
      subtitle: 'Arkadaşlarla Oyna',
      icon: '👥',
      gradientColors: ['#00897B', '#00E5CC'] as const,
      onPress: () => showToast.info('Yakında', 'Bu mod yakında geliyor!'),
    },
    {
      id: 'daily',
      title: 'Günlük Görev',
      subtitle: 'Günlük Mücadele',
      icon: '📅',
      gradientColors: ['#6B21D4', '#C084FC'] as const,
      onPress: () => showToast.info('Yakında', 'Bu mod yakında geliyor!'),
    },
    {
      id: 'tournament',
      title: 'Turnuva',
      subtitle: 'Turnuvaya Katıl',
      icon: '🏆',
      gradientColors: ['#1565C0', '#42A5F5'] as const,
      onPress: () => showToast.info('Yakında', 'Bu mod yakında geliyor!'),
    },
  ];

  const NAV_ITEMS: NavItem[] = [
    { id: 'home', iconName: 'home-outline', iconNameActive: 'home', label: 'Ana Sayfa', onPress: () => {} },
    { id: 'play', iconName: 'game-controller-outline', iconNameActive: 'game-controller', label: 'Oyna', onPress: () => router.push('/game/quick-game') },
    { id: 'leaderboard', iconName: 'trophy-outline', iconNameActive: 'trophy', label: 'Sıralama', onPress: () => showToast.info('Yakında', 'Bu özellik yakında geliyor!') },
    { id: 'profile', iconName: 'person-outline', iconNameActive: 'person', label: 'Profil', onPress: () => showToast.info('Yakında', 'Bu özellik yakında geliyor!') },
  ];

  return (
    <View style={homeStyles.container}>
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary, Colors.bg.card]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={homeStyles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={[homeStyles.scrollContent, { paddingBottom: 68 + (insets.bottom || 8) + 16 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
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

          {/* User Card */}
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

          {/* Streak Card */}
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

          {/* Game Mode Grid */}
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

          {/* Daily Challenge Banner */}
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
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Nav — pinned outside ScrollView */}
      <View style={[homeStyles.bottomNav, { paddingBottom: insets.bottom || 8 }]}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={homeStyles.navItem}
            onPress={() => { setActiveTab(item.id); item.onPress(); }}
            activeOpacity={0.7}
          >
            {activeTab === item.id && <View style={homeStyles.navActiveIndicator} />}
            <Ionicons
              name={activeTab === item.id ? item.iconNameActive : item.iconName}
              size={activeTab === item.id ? 26 : 22}
              color={activeTab === item.id ? '#FF6B35' : 'rgba(255,255,255,0.4)'}
            />
            <Text style={[homeStyles.navLabel, activeTab === item.id && homeStyles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
