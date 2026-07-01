import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import BackButton from '@/components/BackButton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { leaderboardStyles } from '@/assets/styles/leaderboardStyle';
import { getLeaderboard, getUserStats } from '@/services/scoreService';

// scoreService is JS; the row shape is typed locally for this screen.
type LeaderboardEntry = {
  id: string;
  userId: string;
  userName: string;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  totalCorrect: number;
  totalQuestions: number;
  lastPlayedAt: string;
  accuracy: number | null;
  rank: number;
};

// Derives up to two initials from a display name.
// Mirrors the avatarInitials logic in app/(app)/index.tsx.
function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

// Rendered only when the board is genuinely empty (entries.length === 0).
function EmptyState() {
  return (
    <View style={leaderboardStyles.emptyWrap}>
      <ThemedText style={leaderboardStyles.emptyText}>
        {'Henüz kimse oynamamış.\nİlk oyunu sen oyna!'}
      </ThemedText>
    </View>
  );
}

// A single Olympic podium slot (one of the top-3 players).
function PodiumSlot({
  entry,
  currentUserId,
}: {
  entry: LeaderboardEntry;
  currentUserId?: string;
}) {
  const isFirst = entry.rank === 1;
  const isSecond = entry.rank === 2;
  const rankColor = isFirst
    ? Colors.rank.gold
    : isSecond
      ? Colors.rank.silver
      : Colors.rank.bronze;
  const heightStyle = isFirst
    ? leaderboardStyles.pedestalFirst
    : isSecond
      ? leaderboardStyles.pedestalSecond
      : leaderboardStyles.pedestalThird;
  const isSelf = !!currentUserId && entry.userId === currentUserId;
  const goldGradient = [Colors.modes.leaderboard.from, Colors.modes.leaderboard.to] as [string, string];

  const rankNumber = (
    <ThemedText weight="black" size={Typography.size.sm} color={Colors.text.dark}>
      {entry.rank}
    </ThemedText>
  );

  return (
    <View style={leaderboardStyles.pedestal}>
      <View style={[leaderboardStyles.podiumAvatar, { borderColor: rankColor }]}>
        <ThemedText style={leaderboardStyles.podiumAvatarText}>
          {getInitials(entry.userName)}
        </ThemedText>
      </View>
      <ThemedText style={leaderboardStyles.podiumName} numberOfLines={1}>
        {entry.userName}
      </ThemedText>
      {isSelf && <ThemedText style={leaderboardStyles.podiumSenBadge}>Sen</ThemedText>}
      <ThemedText style={leaderboardStyles.podiumScore}>
        {entry.totalScore.toLocaleString('tr-TR')}
      </ThemedText>
      {isFirst ? (
        <LinearGradient colors={goldGradient} style={[leaderboardStyles.podiumBlock, heightStyle]}>
          <LinearGradient colors={goldGradient} style={leaderboardStyles.podiumRankBadge}>
            {rankNumber}
          </LinearGradient>
        </LinearGradient>
      ) : (
        <View style={[leaderboardStyles.podiumBlock, heightStyle]}>
          <View style={[leaderboardStyles.podiumRankBadge, { backgroundColor: rankColor }]}>
            {rankNumber}
          </View>
        </View>
      )}
    </View>
  );
}

// Olympic top-3 podium; renders only the present slots (no empty placeholders).
// Layout left -> right: rank 2 (silver), rank 1 (gold, center), rank 3 (bronze).
function Podium({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}): React.JSX.Element | null {
  if (entries.length === 0) return null;
  const [first, second, third] = entries;
  const ordered =
    entries.length === 1
      ? [first]
      : entries.length === 2
        ? [second, first]
        : [second, first, third];
  return (
    <View style={leaderboardStyles.podiumWrap}>
      {ordered.map((entry) => (
        <PodiumSlot key={entry.id} entry={entry} currentUserId={currentUserId} />
      ))}
    </View>
  );
}

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selfStats, setSelfStats] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, isGuest } = useAuth();
  const typedUser = user && typeof user !== 'boolean' ? user : null;
  const currentUserId: string | undefined = typedUser?.$id as string | undefined;

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
    return () => {
      cancelled = true;
    };
  }, [isGuest, typedUser]);

  if (loading) {
    return <LoadingSpinner fullscreen label="Yükleniyor..." />;
  }

  // Ranks 4+; podium (top-3) is rendered as the FlatList header.
  const listEntries = entries.slice(3);
  const podiumEntries = entries.slice(0, 3);

  return (
    <View style={leaderboardStyles.container}>
      <LinearGradient colors={Colors.gradients.background} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={leaderboardStyles.safeArea}>
        <View style={leaderboardStyles.header}>
          <BackButton />
          <ThemedText weight="bold" size={Typography.size.xxl}>Sıralama</ThemedText>
        </View>
        <FlatList<LeaderboardEntry>
          data={listEntries}
          keyExtractor={(item) => item.id}
          renderItem={null}
          ListHeaderComponent={
            podiumEntries.length > 0 ? (
              <Podium entries={podiumEntries} currentUserId={currentUserId} />
            ) : null
          }
          ListEmptyComponent={entries.length === 0 ? <EmptyState /> : null}
          contentContainerStyle={leaderboardStyles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}
