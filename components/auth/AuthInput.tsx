import React, { useRef, useState } from 'react';
import {
  Animated,
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
  const [hidden, setHidden] = useState(secureToggle);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const hasError = Boolean(error);

  const handleFocus = () => {
    Animated.timing(focusAnim, { toValue: 1, duration: 180, useNativeDriver: false }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  };

  const animatedBorderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border.cyanSoft, Colors.accent.cyan],
  });

  const borderColor = hasError ? Colors.wrong : animatedBorderColor;

  return (
    <View>
      <Animated.View style={[styles.field, { borderColor }]}>
        <Ionicons name={icon} size={20} color={Colors.text.muted} style={styles.leadingIcon} />
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
          onFocus={handleFocus}
          onBlur={handleBlur}
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
      </Animated.View>
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
    backgroundColor: Colors.bg.input,
    paddingHorizontal: Spacing.md,
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
