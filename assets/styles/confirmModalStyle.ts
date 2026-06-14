import { StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '@/constants/theme';

export const confirmModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.ui.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  gradientBorder: {
    borderRadius: Radius.lg,
    padding: 1.5,
    overflow: 'hidden',
    ...Shadows.modalGlow,
  },
  card: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.bg.card,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.surface,
  },
  iconCircleDestructive: {
    backgroundColor: Colors.wrongBg,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  buttonRowSingle: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  buttonFlex: {
    flex: 1,
  },
  dangerButton: {
    height: 52,
    flex: 1,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.wrong,
  },
});
