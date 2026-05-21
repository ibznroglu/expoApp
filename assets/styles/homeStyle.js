import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, Radius, Typography, Shadows } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

export const homeStyles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topBarSlot: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  topBarIcon: { fontSize: Typography.size.xl },
  topBarValue: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.lg,
    color: Colors.accent.gold,
  },
  topBarLives: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.lg,
    color: Colors.wrong,
  },

  // User card
  userCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.default,
    ...Shadows.card,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
  },
  userInfo: { flex: 1 },
  userName: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent.purple,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
  },
  levelBadgeText: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.xs,
    color: Colors.text.primary,
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: Colors.border.white,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: 6,
    backgroundColor: Colors.brand.primary,
    borderRadius: Radius.full,
  },
  xpLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
    marginTop: 3,
  },

  // Streak card
  streakCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bg.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.default,
    ...Shadows.card,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  streakIcon: { fontSize: Typography.size.xl },
  streakTitle: {
    fontFamily: Typography.family.extrabold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
  },
  streakDaysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: Colors.brand.primary, ...Shadows.button },
  dayLabel: {
    fontFamily: Typography.family.semibold,
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
  },
  dayLabelActive: { color: Colors.text.primary },

  // Game mode grid
  sectionTitle: {
    fontFamily: Typography.family.extrabold,
    fontSize: Typography.size.lg,
    color: Colors.text.primary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  modeCard: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 130,
    ...Shadows.card,
  },
  modeIcon: { fontSize: 32, marginBottom: Spacing.sm },
  modeTitle: {
    fontFamily: Typography.family.extrabold,
    fontSize: Typography.size.md,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modeSubtitle: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Daily challenge banner
  challengeBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    ...Shadows.glow,
  },
  challengeBannerTitle: {
    fontFamily: Typography.family.black,
    fontSize: Typography.size.xl,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  challengeBannerDesc: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  challengeCtaButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.text.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    ...Shadows.button,
  },
  challengeCtaText: {
    fontFamily: Typography.family.extrabold,
    fontSize: Typography.size.md,
    color: Colors.modes.daily.from,
  },

  // Bottom nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: Colors.bg.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border.default,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.sm,
  },
  navIcon: { fontSize: 22, marginBottom: 2 },
  navLabel: {
    fontFamily: Typography.family.semibold,
    fontSize: Typography.size.xs,
    color: Colors.text.muted,
  },
  navLabelActive: { color: Colors.brand.primary },
  navActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.primary,
  },
});
