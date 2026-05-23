import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@/utils/toast';
import { initSounds, playSound } from '@/utils/sound';
import { homeStyles } from '@/assets/styles/homeStyle';
import { Colors, Spacing } from '@/constants/theme';

const BG_GRADIENT = ['#2D1B69', '#1A0A4A', '#0D0527'] as const;
const QUICK_GRADIENT = ['#FF6B35', '#FFB800'] as const;
const FRIENDS_GRADIENT = ['#1565C0', '#42A5F5'] as const;
const NAV_GRADIENT = ['#3D1580', '#1A0A4A'] as const;
const DAY_REWARDS = [50, 100, 140, 170, 190, 200, 300];
const NAV_WAVE_H = 16;
const SCREEN_W = Dimensions.get('window').width;

type NavId = 'home' | 'leaderboard' | 'quests' | 'profile';

interface NavItem {
  id: NavId;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconNameActive: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  activeColor: string;
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

function NavWave() {
  const w = SCREEN_W;
  const h = NAV_WAVE_H;
  const d = `M0,${h} Q${w * 0.25},0 ${w * 0.5},${h * 0.5} Q${w * 0.75},${h} ${w},${h * 0.3} L${w},${h} Z`;
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: -(h - 1), left: 0 }}>
      <Path d={d} fill="#3D1580" />
    </Svg>
  );
}

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

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeNav, setActiveNav] = useState<NavId>('home');
  const [rewardModalVisible, setRewardModalVisible] = useState(false);
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const rainbowAnim = useRef(new Animated.Value(0)).current;

  const typedUser = user && typeof user !== 'boolean' ? user : null;

  const HARDCODED_COINS = 1250;
  const HARDCODED_LIVES = 5;
  const HARDCODED_STREAK =
    (typedUser?.prefs as { streakCount?: number } | undefined)?.streakCount ?? 7;
  const currentDay = Math.min(Math.max(HARDCODED_STREAK, 1), 7);
  const XP_CURRENT = 340;
  const XP_MAX = 500;
  const LEVEL = 12;
  const xpPercent = (XP_CURRENT / XP_MAX) * 100;

  useEffect(() => {
    initSounds().catch(() => {});
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.timing(rainbowAnim, { toValue: 1, duration: 2700, useNativeDriver: false })
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      gradientColors: ['#059669', '#10B981'] as [string, string],
      buttonLabel: '▶ Keşfet',
      onPress: () => { playSound('correct'); showToast.info('Yakında', 'Turnuvalar yakında geliyor!'); },
    },
  ];

  const NAV_ITEMS: NavItem[] = [
    { id: 'home',        iconName: 'home-outline',  iconNameActive: 'home',   label: 'Ana Sayfa', activeColor: '#FF6B35', onPress: () => {} },
    { id: 'leaderboard', iconName: 'bar-chart-outline', iconNameActive: 'bar-chart', label: 'Sıralama',  activeColor: '#00D4FF', onPress: () => showToast.info('Yakında', 'Sıralama yakında geliyor!') },
    { id: 'quests',      iconName: 'gift-outline',   iconNameActive: 'gift',   label: 'Görevler',  activeColor: '#22C55E', onPress: () => showToast.info('Yakında', 'Görevler yakında geliyor!') },
    { id: 'profile',     iconName: 'person-outline', iconNameActive: 'person', label: 'Profil',    activeColor: '#A78BFA', onPress: () => showToast.info('Yakında', 'Profil yakında geliyor!') },
  ];

  return (
    <View style={homeStyles.container}>
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={homeStyles.safeArea} edges={['top']}>

        <View style={homeStyles.mainContent}>
          {/* User card */}
          <View style={[homeStyles.userCard, { marginHorizontal: 16, marginTop: 8 }]}>
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
            <View style={homeStyles.statRow}>
              <View style={homeStyles.statItem}>
                <Ionicons name="diamond" size={24} color={Colors.accent.gold} />
                <Text style={homeStyles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {HARDCODED_COINS.toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={homeStyles.statItem}>
                <Ionicons name="heart" size={24} color={Colors.wrong} />
                <Text style={homeStyles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {HARDCODED_LIVES}
                </Text>
              </View>
            </View>
          </View>

          {/* Section header */}
          <View style={homeStyles.sectionHeader}>
            <View style={homeStyles.sectionHeaderLeft}>
              <Ionicons name="game-controller" size={20} color={Colors.text.primary} />
              <Text style={homeStyles.sectionHeaderTitle}>Oyun Modları</Text>
            </View>
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

          {/* Daily reward pulse button */}
          <View style={{ alignItems: 'flex-start', marginLeft: 24, marginVertical: Spacing.md }}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setRewardModalVisible(true)}>
              <Animated.View
                style={[
                  homeStyles.rewardPulse,
                  {
                    borderColor: rainbowAnim.interpolate({
                      inputRange: [0, 0.33, 0.66, 1],
                      outputRange: ['#FF6B35', '#A855F7', '#00D4FF', '#FF6B35'],
                    }),
                  },
                ]}
              >
                <Animated.View
                  style={{
                    opacity: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.0] }),
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Text style={homeStyles.rewardPulseEmoji}>🎁</Text>
                  <Text style={homeStyles.rewardPulseLabel}>Günlük Ödül</Text>
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom nav — dark gradient with wave top edge */}
        <View style={{ overflow: 'visible' }}>
          <LinearGradient
            colors={NAV_GRADIENT}
            style={[homeStyles.bottomNav, { paddingBottom: insets.bottom || 8 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={homeStyles.navItem}
                  onPress={() => { setActiveNav(item.id); item.onPress(); }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isActive ? item.iconNameActive : item.iconName}
                    size={isActive ? 30 : 26}
                    color={isActive ? item.activeColor : 'rgba(255,255,255,0.4)'}
                  />
                  <Text style={[homeStyles.navLabel, isActive && homeStyles.navLabelActive, isActive && { color: item.activeColor }]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <View style={[homeStyles.navDot, { backgroundColor: item.activeColor }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </LinearGradient>
          <NavWave />
        </View>

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

      </SafeAreaView>
    </View>
  );
}
