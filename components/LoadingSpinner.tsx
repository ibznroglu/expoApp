import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface LoadingSpinnerProps {
  size?: number;
  label?: string;
  fullscreen?: boolean;
}

function LoadingSpinner({
  size = 64,
  label,
  fullscreen = false,
}: LoadingSpinnerProps) {
  const strokeWidth = Math.max(2, Math.round(size / 12));
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * 0.25; // 270° arc = 25% gap

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => {
      anim.stop();
    };
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinner = (
    <Animated.View style={[{ width: size, height: size }, { transform: [{ rotate }] }]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="loadingSpinnerGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={Colors.brand.primary} />
            <Stop offset="1" stopColor={Colors.accent.gold} />
          </SvgLinearGradient>
        </Defs>
        {/* Track ring — renders FIRST (behind arc) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={Colors.border.white}
          strokeWidth={strokeWidth}
        />
        {/* Arc — 270° sweep, on top of track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#loadingSpinnerGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-135}
          origin={`${center}, ${center}`}
        />
        {/* Leading dot */}
        <Circle
          cx={center + radius * Math.cos((135 * Math.PI) / 180)}
          cy={center + radius * Math.sin((135 * Math.PI) / 180)}
          r={strokeWidth * 0.6}
          fill={Colors.accent.gold}
        />
      </Svg>
    </Animated.View>
  );

  return (
    <View style={fullscreen ? styles.fullscreen : styles.inline}>
      {spinner}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inline: {
    alignItems: 'center',
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg.primary,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.sm,
    color: Colors.text.secondary,
  },
});

export default LoadingSpinner;
