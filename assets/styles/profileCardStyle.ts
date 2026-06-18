import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

export const profileCardStyles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    position: 'relative',
    maxWidth: 380,
    alignSelf: 'center',
    ...Shadows.modalGlow,
  },
  svgBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  content: {
    position: 'relative',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  name: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  badgeGuest: {
    backgroundColor: Colors.wrongBg,
    borderColor: Colors.brand.primary,
  },
  badgeMember: {
    backgroundColor: Colors.correctBg,
    borderColor: Colors.accent.teal,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    width: '100%',
  },
  chipSkor: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.ui.chipTeal,
    borderWidth: 1.5,
    borderColor: Colors.accent.teal,
    gap: Spacing.xs,
  },
  chipGold: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.ui.chipGold,
    borderWidth: 1.5,
    borderColor: Colors.accent.gold,
    gap: Spacing.xs,
  },
});
