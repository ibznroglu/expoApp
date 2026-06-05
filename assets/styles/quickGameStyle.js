import { StyleSheet } from "react-native";
import { Colors, Radius, Spacing, Typography } from "../../constants/theme";

export const quickGameStyles = StyleSheet.create({
  // Layout shells
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  centeredFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // Loading
  loadingText: {
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: Typography.family.bold,
    marginBottom: Spacing.sm,
  },
  loadingSubText: {
    color: Colors.text.secondary,
    textAlign: 'center',
    fontFamily: Typography.family.regular,
  },

  // Error
  errorText: {
    color: Colors.text.primary,
    textAlign: 'center',
    fontFamily: Typography.family.semibold,
    marginBottom: Spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  retryButtonText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // Exit row (standalone above header)
  exitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    flexShrink: 0,
  },
  exitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header card
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(20,10,55,0.85)',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(155,89,245,0.45)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#9B59F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    flexShrink: 0,
  },
  headerSection: {
    alignItems: 'flex-start',
    minWidth: 64,
  },
  headerLabel: {
    color: Colors.text.muted,
    fontFamily: Typography.family.bold,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerValue: {
    color: Colors.accent.gold,
    fontFamily: Typography.family.black,
  },
  headerValueDim: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
  },
  timerArcWrapper: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerArcCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  timerArcNumber: {
    color: Colors.text.primary,
    fontFamily: Typography.family.black,
    lineHeight: 30,
  },
  timerArcLabel: {
    color: Colors.text.muted,
    fontFamily: Typography.family.semibold,
    letterSpacing: 0.5,
  },

  // Category block (icon + badge)
  categoryBlock: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    flexShrink: 0,
  },
  categoryIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  categoryIconGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryBadge: {
    backgroundColor: Colors.accent.purple,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  categoryBadgeText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    letterSpacing: 0.8,
  },

  // Centering wrapper for question + options
  gameContent: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Question card — gradient border wrapper
  questionCardWrapper: {
    flex: 1,
    flexShrink: 1,
    borderRadius: Radius.lg,
    shadowColor: '#9B59F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  questionCardGradientBorder: {
    flex: 1,
    padding: 1.5,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  questionCard: {
    flex: 1,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  questionText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    textAlign: 'center',
    lineHeight: 28,
  },

  // Answer options
  optionsContainer: {
    gap: 10,
    flexShrink: 1,
    marginTop: 12,
    marginBottom: 12,
  },
  optionWrapper: {
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: 'transparent',
    shadowColor: '#9B59F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  optionWrapperCorrect: {
    shadowColor: '#22C55E',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  optionWrapperWrong: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  optionDimmed: {
    opacity: 0.5,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    backgroundColor: Colors.bg.surface,
    borderWidth: 2,
    borderColor: 'rgba(155,89,245,0.8)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  optionButtonSelected: {
    borderColor: '#00D4FF',
    borderWidth: 2,
  },
  optionCorrect: {
    backgroundColor: Colors.correctBg,
    borderColor: Colors.correct,
  },
  optionWrong: {
    backgroundColor: Colors.wrongBg,
    borderColor: Colors.wrong,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(155,89,245,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetterCorrect: {
    backgroundColor: Colors.correct,
  },
  optionLetterWrong: {
    backgroundColor: Colors.wrong,
  },
  optionLetterText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },
  optionText: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    flex: 1,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // Dot progress (below header)
  dotProgressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    flexShrink: 0,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  progressDotAnswered: {
    backgroundColor: Colors.accent.purple,
    borderColor: Colors.accent.purple,
  },
  progressDotCurrent: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },

  // Joker section
  jokerSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    opacity: 0.85,
    flexShrink: 0,
  },
  jokerRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    justifyContent: 'center',
  },
  jokerItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  jokerBtn: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jokerLabel: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    textAlign: 'center',
  },
  jokerCountBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  jokerCountText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // Exit confirm modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.bright,
    padding: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.semibold,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.wrong,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },

  // Game Over
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: Colors.accent.gold,
    backgroundColor: Colors.bg.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreCircleNumber: {
    color: Colors.accent.gold,
    fontFamily: Typography.family.black,
    lineHeight: 56,
  },
  scoreCircleLabel: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    letterSpacing: 1.5,
  },
  resultSubtitle: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  coinsBadge: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent.gold,
    marginBottom: Spacing.xl,
  },
  coinsBadgeText: {
    color: Colors.accent.gold,
    fontFamily: Typography.family.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  resultButtons: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  primaryButtonText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
  },
  secondaryButton: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
  },
});
