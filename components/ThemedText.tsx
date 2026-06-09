import React, { ReactNode } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type FontWeight = 'regular' | 'semibold' | 'bold' | 'extrabold' | 'black';

interface ThemedTextProps {
  weight?: FontWeight;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  children: ReactNode;
}

/**
 * Text primitive that applies the correct Nunito family for the given weight
 * and the theme's default text color. Keeps typography consistent across
 * the auth screens.
 */
const ThemedText: React.FC<ThemedTextProps> = ({
  weight = 'regular',
  size = Typography.size.md,
  color = Colors.text.primary,
  style,
  numberOfLines,
  children,
}) => {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: Typography.family[weight],
          fontSize: size,
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default ThemedText;
