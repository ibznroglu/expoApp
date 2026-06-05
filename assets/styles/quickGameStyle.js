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
  },
  exitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header row
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  scoreBadge: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    flex: 1,
  },
  scoreBadgeText: {
    color: Colors.text.primary,
    fontFamily: Typography.family.bold,
    textAlign: 'center',
  },
  timerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.accent.cyan,
    backgroundColor: Colors.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 12,
  },
  timerCircleUrgent: {
    borderColor: Colors.wrong,
    shadowColor: Colors.wrong,
  },
  timerText: {
    color: Colors.accent.cyan,
    fontFamily: Typography.family.black,
  },
  timerTextUrgent: {
    color: Colors.wrong,
  },
  counterBadge: {
    backgroundColor: Colors.bg.elevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  counterText: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
  },

  // Category block (icon + badge)
  categoryBlock: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
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
    justifyContent: 'flex-start',
    gap: Spacing.lg,
  },

  // Question card
  questionCard: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border.bright,
    padding: Spacing.xl,
    minHeight: 110,
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
    borderWidth: 1.5,
    borderColor: Colors.border.bright,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
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
    backgroundColor: 'rgba(155,89,245,0.25)',
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

  // Progress bar (below header)
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: 3,
  },

  // Joker section (visual only)
  jokerSection: {
    alignItems: 'center',
    gap: Spacing.sm,
    opacity: 0.5,
    marginTop: Spacing.sm,
  },
  jokerSoonLabel: {
    color: Colors.text.muted,
    fontFamily: Typography.family.bold,
    letterSpacing: 1.2,
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
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jokerLabel: {
    color: Colors.text.secondary,
    fontFamily: Typography.family.semibold,
    textAlign: 'center',
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
