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
  cardOuter: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center' as const,
    ...Shadows.modalGlow,
  },
  cardWrapper: {
    width: '100%',
    position: 'relative' as const,
  },
  svgBackground: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  content: {
    position: 'relative' as const,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center' as const,
    gap: Spacing.md,
  },
});
