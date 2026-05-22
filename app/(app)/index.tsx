import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { homeStyles } from '@/assets/styles/homeStyle';
import { Colors } from '@/constants/theme';

type GameModeTab = 'quick' | 'daily' | 'friends';

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
  const [activeMode, setActiveMode] = useState<GameModeTab>('quick');
  const [activeNav, setActiveNav] = useState('');
  const glowOpacity = useRef(new Animated.Value(0.4)).current;
  const glowScale = useRef(new Animated.Value(1.0)).current;

  const typedUser = user && typeof user !== 'boolean' ? user : null;

  const HARDCODED_COINS = 1250;
  const HARDCODED_LIVES = 5;
  const HARDCODED_STREAK =
    (typedUser?.prefs as { streakCount?: number } | undefined)?.streakCount ?? 7;
  const XP_CURRENT = 340;
  const XP_MAX = 500;
  const LEVEL = 12;
  const xpPercent = (XP_CURRENT / XP_MAX) * 100;

  const avatarInitials = useMemo<string>(() => {
    if (!typedUser?.name) return '??';
    const parts = (typedUser.name as string).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [typedUser?.name]);

  const TABS = [
    { id: 'quick' as GameModeTab, label: 'Hızlı', onPlay: () => router.push('/game/quick-game') },
    { id: 'daily' as GameModeTab, label: 'Günlük', onPlay: () => showToast.info('Yakında', 'Günlük mod yakında geliyor!') },
    { id: 'friends' as GameModeTab, label: 'Arkadaşlar', onPlay: () => showToast.info('Yakında', 'Arkadaşlar modu yakında geliyor!') },
  ];

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'leaderboard',
      iconName: 'trophy-outline',
      iconNameActive: 'trophy',
      label: 'Sıralama',
      onPress: () => showToast.info('Yakında', 'Sıralama yakında geliyor!'),
    },
    {
      id: 'profile',
      iconName: 'person-outline',
      iconNameActive: 'person',
      label: 'Profil',
      onPress: () => showToast.info('Yakında', 'Profil yakında geliyor!'),
    },
  ];

  const STATS = [
    { label: 'Bugünkü Skor', value: '2.450' },
    { label: 'En İyi Seri', value: `${HARDCODED_STREAK} gün` },
    { label: 'Toplam Oyun', value: '24' },
  ];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 1.0, duration: 900, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.4, duration: 900, useNativeDriver: true }),
          Animated.timing(glowScale, { toValue: 1.0, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => { loop.stop(); };
  }, [glowOpacity, glowScale]);

  const handlePlay = () => {
    TABS.find((t) => t.id === activeMode)?.onPlay();
  };

  return (
    <View style={homeStyles.container}>
      <LinearGradient
        colors={[Colors.bg.primary, Colors.bg.secondary, Colors.bg.card]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={homeStyles.safeArea} edges={['top']}>
        {/* Top bar */}
        <View style={homeStyles.topBar}>
          <View style={homeStyles.topBarLeft}>
            <View style={homeStyles.avatarCircle}>
              <Text style={homeStyles.avatarInitials}>{avatarInitials}</Text>
            </View>
            <Text style={homeStyles.usernameText} numberOfLines={1}>
              {(typedUser?.name as string | undefined) ?? 'Oyuncu'}
            </Text>
            <View style={homeStyles.levelBadge}>
              <Text style={homeStyles.levelBadgeText}>Sv.{LEVEL}</Text>
            </View>
          </View>
          <View style={homeStyles.topBarRight}>
            <View style={homeStyles.statChip}>
              <Ionicons name="cash-outline" size={14} color={Colors.accent.gold} />
              <Text style={homeStyles.statChipValueGold}>
                {HARDCODED_COINS.toLocaleString('tr-TR')}
              </Text>
            </View>
            <View style={homeStyles.statChip}>
              <Ionicons name="heart" size={14} color={Colors.wrong} />
              <Text style={homeStyles.statChipValueRed}>{HARDCODED_LIVES}</Text>
            </View>
            <View style={homeStyles.statChip}>
              <Ionicons name="flame" size={14} color={Colors.brand.secondary} />
              <Text style={homeStyles.statChipValueFire}>{HARDCODED_STREAK}</Text>
            </View>
          </View>
        </View>

        {/* XP bar */}
        <View style={homeStyles.xpRow}>
          <View style={homeStyles.xpBarTrack}>
            <View style={[homeStyles.xpBarFill, { width: `${xpPercent}%` as `${number}%` }]} />
          </View>
          <Text style={homeStyles.xpLabel}>{XP_CURRENT} / {XP_MAX} XP</Text>
        </View>

        {/* Main content */}
        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          {/* Mode tabs */}
          <View style={homeStyles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[homeStyles.tabButton, activeMode === tab.id && homeStyles.tabButtonActive]}
                onPress={() => setActiveMode(tab.id)}
                activeOpacity={0.8}
              >
                <Text style={[homeStyles.tabLabel, activeMode === tab.id && homeStyles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Play button */}
          <Animated.View
            style={[
              homeStyles.playWrapper,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          >
            <TouchableOpacity onPress={handlePlay} activeOpacity={0.9}>
              <LinearGradient
                colors={Colors.brand.gradient}
                style={homeStyles.playGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="play-circle" size={48} color={Colors.text.primary} />
                <Text style={homeStyles.playLabel}>OYNA</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats row */}
          <View style={homeStyles.statsRow}>
            {STATS.map((stat) => (
              <View key={stat.label} style={homeStyles.statCard}>
                <Text style={homeStyles.statCardValue}>{stat.value}</Text>
                <Text style={homeStyles.statCardLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom nav */}
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
                color={activeNav === item.id ? Colors.brand.primary : Colors.text.muted}
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
