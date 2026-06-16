import React, { useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { playUISound } from '@/utils/sound';

const ARROW_FILL = Colors.gradients.modal[1]; // '#00B8D4' — mid-teal body
const ARROW_HIGHLIGHT = Colors.accent.teal; // '#00E5CC' — leading-edge highlight
const ARROW_SHADOW = Colors.gradients.modal[2]; // '#0091A7' — trailing-edge shadow
const COMIC_STROKE = '#000000'; // thick comic outline

// Solid left-pointing arrow: tip at (4,20), shaft to right edge x=52
const ARROW_BODY_PATH = 'M4 20 L20 6 L20 14 L52 14 L52 26 L20 26 L20 34 Z';

// Bright leading-edge highlight — a wedge hugging the pointed left tip
const ARROW_HIGHLIGHT_PATH = 'M4 20 L20 6 L20 10 L11 20 L20 30 L20 34 Z';

// Dark shadow sliver along the bottom/right of the shaft
const ARROW_SHADOW_PATH = 'M20 26 L52 26 L52 28 L20 28 Z M20 26 L20 34 L17 31 Z';

interface BackButtonProps {
  onPress?: () => void;
  size?: number; // backward compat — sets width; height scales to keep ratio
  width?: number; // explicit width override
  height?: number; // explicit height override
  style?: StyleProp<ViewStyle>;
}

export default function BackButton({
  onPress,
  size,
  width: widthProp,
  height: heightProp,
  style,
}: BackButtonProps) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const w = widthProp ?? size ?? 68;
  const h = heightProp ?? (size ? Math.round((size * 40) / 56) : 50);

  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.92,
      duration: 90,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    playUISound('button');
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Geri"
      style={[
        { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={w} height={h} viewBox="0 0 56 40">
          {/* trailing shadow (rendered first / behind) */}
          <Path d={ARROW_SHADOW_PATH} fill={ARROW_SHADOW} />
          {/* main body with comic outline */}
          <Path
            d={ARROW_BODY_PATH}
            fill={ARROW_FILL}
            stroke={COMIC_STROKE}
            strokeWidth={5}
            strokeLinejoin="round"
          />
          {/* leading-edge highlight (on top) */}
          <Path d={ARROW_HIGHLIGHT_PATH} fill={ARROW_HIGHLIGHT} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
