import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

// Screen-level layout for the leaderboard screen. Theme-token only (no hex literals).
export const leaderboardStyles = StyleSheet.create({
  // Root + background
  container: { flex: 1, backgroundColor: Colors.gradients.background[0] },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },

  // FlatList content
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // Podium
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },
  pedestal: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  // Pedestal block heights, ratio gold : silver : bronze = 1 : 0.8 : 0.65
  // derived from Spacing.xxxl (40): 40, 32, 26
  pedestalFirst: { height: Spacing.xxxl },
  pedestalSecond: { height: Spacing.xxxl * 0.8 },
  pedestalThird: { height: Spacing.xxxl * 0.65 },
  podiumAvatar: {
    width: Spacing.xxxl + Spacing.lg,
    height: Spacing.xxxl + Spacing.lg,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 2,
    marginBottom: Spacing.xs,
  },
  podiumAvatarText: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
  },
  podiumName: {
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: Typography.size.md,
    fontFamily: Typography.family.bold,
    color: Colors.text.primary,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: Radius.md,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  podiumRankBadge: {
    width: Spacing.xl,
    height: Spacing.xl,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  podiumSenBadge: {
    fontSize: Typography.size.xs,
    color: Colors.accent.cyan,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // List row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.bg.card,
  },
  rowSelf: {
    backgroundColor: Colors.ui.selfRowBg,
    borderWidth: 1,
    borderColor: Colors.accent.cyan,
  },
  rowRank: {
    width: Spacing.xxl,
    fontSize: Typography.size.md,
    color: Colors.text.secondary,
  },
  rowAvatar: {
    width: Spacing.xxxl,
    height: Spacing.xxxl,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
  },
  rowAvatarText: {
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
  },
  rowNameWrap: { flex: 1 },
  rowName: {
    fontSize: Typography.size.md,
    color: Colors.text.primary,
  },
  rowAccuracy: {
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
  },
  rowScore: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.bold,
    color: Colors.accent.gold,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxxl,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: Typography.size.md,
  },

  // Self-row pin bar (non-guest, rank > 50)
  pinBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  pinRank: {
    fontSize: Typography.size.md,
    color: Colors.text.secondary,
  },
  pinAvatar: {
    width: Spacing.xxxl,
    height: Spacing.xxxl,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
  },
  pinAvatarText: {
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
  },
  pinNameWrap: { flex: 1 },
  pinName: {
    fontSize: Typography.size.md,
    color: Colors.text.primary,
  },
  pinScore: {
    fontSize: Typography.size.lg,
    fontFamily: Typography.family.bold,
    color: Colors.accent.gold,
  },

  // Guest hint (optional, bottom of screen when isGuest)
  guestHint: {
    textAlign: 'center',
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
    paddingVertical: Spacing.md,
  },
});
