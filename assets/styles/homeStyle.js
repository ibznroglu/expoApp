import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export const homeStyles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#0D0527' },
  safeArea: { flex: 1 },
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },

  // User card
  userCard: {
    borderRadius: Radius.lg,
    backgroundColor: '#3B1F8C',
    padding: Spacing.md,
    ...Shadows.button,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
  },
  userNameText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
    maxWidth: 200,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent.purple,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  levelBadgeText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
  },
  xpRow: { marginTop: Spacing.sm, gap: 4 },
  xpBarTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 6,
    backgroundColor: Colors.accent.gold,
    borderRadius: Radius.full,
  },
  xpLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },

  // Stat row (below XP bar, full-width horizontal, no box frame)
  statRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.xxl,
    color: Colors.text.primary,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  sectionHeaderTitle: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
  },

  // Game mode grid
  gameModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  gameModeCard: {
    width: '47%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.button,
  },
  gameModeGradient: {
    minHeight: 160,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  gameModeIcon: { marginBottom: Spacing.xs },
  gameModeTitle: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.md,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  gameModeSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: Spacing.sm,
  },
  gameModePlayBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gameModePlayText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xs,
    color: Colors.text.primary,
  },
  gameModeStar: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.15)',
    fontSize: 28,
  },

  // Bottom nav (LinearGradient wrapper in JSX)
  bottomNav: {
    flexDirection: 'row',
    minHeight: 72,
    paddingTop: Spacing.sm,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingBottom: Spacing.sm,
  },
  navLabel: {
    fontFamily: Typography.family.semibold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  navLabelActive: {
    fontFamily: Typography.family.bold,
  },

  // Daily reward pulse button
  rewardHaloOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(168,85,247,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardHaloInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,107,53,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardPulseEmoji: {
    fontSize: 40,
  },
  rewardPulseLabel: {
    fontFamily: Typography.family.bold,
    fontSize: 12,
    color: Colors.text.primary,
  },

  // Daily reward modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
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
    color: Colors.bg.primary,
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
    fontSize: 13,
    color: Colors.accent.gold,
  },
});
