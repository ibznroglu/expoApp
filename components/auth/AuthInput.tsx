import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface AuthInputProps {
  icon: IoniconName;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureToggle?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  editable?: boolean;
  // Optional trailing action button (e.g. reroll nickname).
  trailingIcon?: IoniconName;
  onTrailingPress?: () => void;
}

/**
 * Themed text input with a leading icon, cyan focus border + glow,
 * an optional show/hide toggle, and an error state.
 */
const AuthInput: React.FC<AuthInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureToggle = false,
  keyboardType,
  autoCapitalize = 'none',
  error,
  editable = true,
  trailingIcon,
  onTrailingPress,
}) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureToggle);

  const hasError = Boolean(error);
  const borderColor = hasError
    ? Colors.wrong
    : focused
      ? Colors.accent.cyan
      : Colors.border.bright;
  const iconColor = focused ? Colors.accent.cyan : Colors.text.muted;

  return (
    <View>
      <View
        style={[
          styles.field,
          { borderColor },
          focused && !hasError && styles.focusGlow,
        ]}
      >
        <Ionicons name={icon} size={20} color={iconColor} style={styles.leadingIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.muted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureToggle && (
          <TouchableOpacity
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.text.muted}
            />
          </TouchableOpacity>
        )}
        {!secureToggle && trailingIcon && (
          <TouchableOpacity
            onPress={onTrailingPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={trailingIcon} size={20} color={Colors.accent.cyan} />
          </TouchableOpacity>
        )}
      </View>
      {hasError && (
        <ThemedText
          size={Typography.size.sm}
          color={Colors.wrong}
          style={styles.errorText}
        >
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    backgroundColor: Colors.bg.surface,
    paddingHorizontal: Spacing.md,
  },
  focusGlow: {
    shadowColor: Colors.accent.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  leadingIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: Typography.family.semibold,
    fontSize: Typography.size.md,
    color: Colors.text.primary,
  },
  errorText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default AuthInput;
