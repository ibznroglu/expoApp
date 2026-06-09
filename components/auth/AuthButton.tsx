import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type AuthButtonVariant = 'gradient' | 'social' | 'ghost';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  variant: AuthButtonVariant;
  icon?: IoniconName;
  loading?: boolean;
  disabled?: boolean;
}

const VARIANT_ICON_COLOR: Record<AuthButtonVariant, string> = {
  gradient: Colors.text.primary,
  social: Colors.text.primary,
  ghost: Colors.text.primary,
};

/**
 * Button used across the auth screens.
 * - gradient: brand CTA (orange/gold gradient, white bold label).
 * - social: translucent surface with a thin border (Google / Apple).
 * - ghost: transparent with a dashed accent border (guest / secondary actions).
 */
const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onPress,
  variant,
  icon,
  loading = false,
  disabled = false,
}) => {
  const isDisabled = disabled || loading;
  const iconColor = VARIANT_ICON_COLOR[variant];
  const labelColor = Colors.text.primary;

  const content = loading ? (
    <ActivityIndicator color={Colors.text.primary} />
  ) : (
    <View style={styles.contentRow}>
      {icon && <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />}
      <ThemedText weight="bold" size={Typography.size.lg} color={labelColor}>
        {label}
      </ThemedText>
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={isDisabled}
        style={[isDisabled && styles.disabled]}
      >
        <LinearGradient
          colors={Colors.gradients.brandButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, styles.gradient]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'social' ? styles.social : styles.ghost,
        isDisabled && styles.disabled,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  gradient: {
    ...Shadows.button,
  },
  social: {
    backgroundColor: Colors.ui.socialBg,
    borderWidth: 1,
    borderColor: Colors.ui.socialBorder,
  },
  ghost: {
    backgroundColor: Colors.ui.socialBg,
    borderWidth: 1.5,
    borderColor: Colors.border.bright,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AuthButton;
