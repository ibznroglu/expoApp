import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';

interface BrandMarkProps {
  size?: 'sm' | 'md';
}

/**
 * Brand badge (gradient square with a flash icon) plus the "Bilgi Arenası"
 * wordmark and a subtitle. Shared header for the auth screens.
 */
const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md' }) => {
  const badgeSize = size === 'md' ? 76 : 60;
  const iconSize = size === 'md' ? 40 : 32;
  const wordSize = size === 'md' ? 27 : 22;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.brandButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          { width: badgeSize, height: badgeSize },
        ]}
      >
        <Ionicons name="flash" size={iconSize} color={Colors.text.primary} />
      </LinearGradient>
      <ThemedText weight="black" size={wordSize} style={styles.wordmark}>
        Bilgi Arenası
      </ThemedText>
      <ThemedText
        weight="regular"
        size={Typography.size.md}
        color={Colors.text.muted}
        style={{ marginTop: Spacing.xs }}
      >
        Zekânı yarıştır
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
  },
  wordmark: {
    marginTop: Spacing.lg,
  },
});

export default BrandMark;
