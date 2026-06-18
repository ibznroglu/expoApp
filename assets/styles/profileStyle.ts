import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

// Screen-level layout for the profile screen. Theme-token only (no hex literals).
export const profileStyles = StyleSheet.create({
  // Root + background
  container: { flex: 1, backgroundColor: Colors.gradients.profileBg[0] },
  safeArea: { flex: 1 },

  // Scroll container
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },

  // Actions section
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  guestHint: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  saveWrap: {
    position: 'relative' as const,
  },
  soonBadge: {
    position: 'absolute' as const,
    top: -6,
    right: -6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.gold,
    borderWidth: 1,
    borderColor: Colors.accent.goldDark,
  },
});
