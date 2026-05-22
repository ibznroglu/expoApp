import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

export const homeStyles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  safeArea: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
  },
  usernameText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
    maxWidth: 90,
  },
  levelBadge: {
    backgroundColor: Colors.accent.purple,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  levelBadgeText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xs,
    color: Colors.text.primary,
  },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statChipValueGold: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.sm,
    color: Colors.accent.gold,
  },
  statChipValueRed: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.sm,
    color: Colors.wrong,
  },
  statChipValueFire: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.sm,
    color: Colors.brand.secondary,
  },

  // XP bar
  xpRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm, gap: 4 },
  xpBarTrack: {
    height: 5,
    backgroundColor: Colors.border.white,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 5,
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
  },
  xpLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
    textAlign: 'right',
  },

  // Mode tabs
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    alignItems: 'center',
    backgroundColor: Colors.bg.surface,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  tabButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  tabLabel: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.sm,
    color: Colors.text.muted,
  },
  tabLabelActive: { color: Colors.text.primary },

  // Play button
  playWrapper: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radius.xl,
    ...Shadows.button,
  },
  playGradient: {
    height: 110,
    minHeight: 90,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  playLabel: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.xxxl,
    color: Colors.text.primary,
    letterSpacing: 3,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  statCardValue: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statCardLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
    textAlign: 'center',
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.bg.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
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
    color: Colors.text.muted,
  },
  navLabelActive: { color: Colors.brand.primary },
  navActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.primary,
  },
});
