import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export const homeStyles = StyleSheet.create({
  // Layout
  container: { flex: 1, backgroundColor: '#0D0527' }, // match dark gradient bottom
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
    backgroundColor: '#3B1F8C', // no light-card token in theme
    padding: Spacing.md,
    ...Shadows.button,
  },
  userCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  userCardLeft: { flex: 1, marginRight: Spacing.sm },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: '#FF8C42', // avatar orange — no theme token
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
    maxWidth: 130,
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
    backgroundColor: 'rgba(0,0,0,0.3)', // dark track inside dark card
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

  // User card stat boxes (right side)
  statBoxArea: {
    backgroundColor: 'rgba(0,0,0,0.25)', // overlay on dark card
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.08)', // subtle tint
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    minWidth: 72,
  },
  statBoxValue: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.xxl,
    color: Colors.text.primary,
  },
  statBoxLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.75)', // subtitle on gradient card — no theme token
    marginBottom: Spacing.sm,
  },
  gameModePlayBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', // translucent white pill
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
    color: 'rgba(255,255,255,0.15)', // decorative — no theme token
    fontSize: 28,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // light theme nav — no theme token
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)', // nav border on light bg — no theme token
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
    fontSize: Typography.size.xs,
    color: '#9CA3AF', // inactive gray on light bg — no theme token
  },
  navLabelActive: { color: Colors.accent.purple },
  navActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.purple,
  },

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
});
