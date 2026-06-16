import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

// Screen-level layout for the profile screen. Theme-token only (no hex literals).
export const profileStyles = StyleSheet.create({
  // Root + background
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  safeArea: { flex: 1 },

  // Scroll container
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },

  // Identity card
  identityCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg.card,
    borderWidth: 1,
    borderColor: Colors.border.default,
    marginTop: Spacing.lg,
    ...Shadows.card,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
    marginBottom: Spacing.md,
  },
  displayName: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  // Badge (guest vs member)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  badgeGuest: {
    backgroundColor: Colors.wrongBg,
    borderWidth: 1,
    borderColor: Colors.wrong,
  },
  badgeMember: {
    backgroundColor: Colors.correctBg,
    borderWidth: 1,
    borderColor: Colors.correct,
  },

  // Info rows (registered users)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border.white,
    width: '100%',
  },
  infoLabel: { flex: 1 },
  infoValue: { flex: 2 },

  // Actions section
  section: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  guestHint: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
});
