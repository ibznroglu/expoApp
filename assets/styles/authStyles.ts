import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '@/constants/theme';

// Shared screen-level layout for auth screens (signin, signup, forgot, verify).
// Screen-specific content composes these with the auth primitives.
export const authStyles = StyleSheet.create({
  // Root + background
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  // Ambient glows behind the content
  glowTopLeft: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: Radius.full,
    backgroundColor: Colors.brand.primary,
    opacity: 0.18,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -140,
    right: -110,
    width: 340,
    height: 340,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.cyan,
    opacity: 0.14,
  },

  // Scroll container
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },

  // Brand block
  brandBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },

  // Form block
  form: {
    gap: Spacing.md,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -Spacing.xs,
  },
  forgotLink: {
    fontFamily: Typography.family.semibold,
    fontSize: Typography.size.sm,
    color: Colors.accent.gold,
  },

  // Divider with centered label
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border.white,
  },
  dividerLabel: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.sm,
    color: Colors.text.muted,
  },

  // Social button row
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialItem: {
    flex: 1,
  },

  // Footer (e.g. "Hesabın yok mu? Kayıt ol")
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: Spacing.xs,
  },
  footerText: {
    fontFamily: Typography.family.regular,
    fontSize: Typography.size.md,
    color: Colors.text.secondary,
  },
  footerLink: {
    fontFamily: Typography.family.bold,
    fontSize: Typography.size.md,
    color: Colors.accent.purpleLight,
  },

  // Inline banner (e.g. unverified email notice)
  banner: {
    backgroundColor: Colors.wrongBg,
    borderColor: Colors.wrong,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  bannerText: {
    fontFamily: Typography.family.semibold,
    fontSize: Typography.size.sm,
    color: Colors.text.primary,
  },
});
