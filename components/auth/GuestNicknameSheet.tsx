import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthInput from '@/components/auth/AuthInput';
import AuthButton from '@/components/auth/AuthButton';
import { randomNickname } from '@/utils/nicknameSuggest';

interface GuestNicknameSheetProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (nickname: string) => void;
}

/**
 * Bottom sheet for picking a guest nickname before entering the game.
 * Prefilled with a random suggestion; a refresh icon re-rolls it.
 */
const GuestNicknameSheet: React.FC<GuestNicknameSheetProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [nickname, setNickname] = useState(() => randomNickname());
  const [error, setError] = useState<string | undefined>(undefined);

  // Re-roll a fresh suggestion each time the sheet is opened.
  useEffect(() => {
    if (visible) {
      setNickname(randomNickname());
      setError(undefined);
    }
  }, [visible]);

  const handleReroll = () => {
    setNickname(randomNickname());
    setError(undefined);
  };

  const handleSubmit = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) {
      setError('En az 2 karakter');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetWrapper} onPress={() => {}}>
          <LinearGradient
            colors={[Colors.bg.card, Colors.bg.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheet}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerBadge}>
                <Ionicons name="person" size={22} color={Colors.text.primary} />
              </View>
              <View style={styles.headerTextBlock}>
                <ThemedText weight="bold" size={Typography.size.lg}>
                  Bir takma ad seç
                </ThemedText>
                <ThemedText
                  weight="regular"
                  size={Typography.size.sm}
                  color={Colors.text.muted}
                >
                  Sıralama tablosunda bu isimle görüneceksin
                </ThemedText>
              </View>
            </View>

            {/* Nickname input with reroll */}
            <View style={styles.inputBlock}>
              <AuthInput
                icon="sparkles"
                placeholder="Takma ad"
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  if (error) setError(undefined);
                }}
                autoCapitalize="words"
                error={error}
                trailingIcon="refresh"
                onTrailingPress={handleReroll}
              />
            </View>

            <AuthButton variant="gradient" label="Oyna" onPress={handleSubmit} />

            <View style={styles.footer}>
              <Pressable onPress={onClose} hitSlop={8}>
                <ThemedText
                  weight="semibold"
                  size={Typography.size.md}
                  color={Colors.text.muted}
                >
                  Vazgeç
                </ThemedText>
              </Pressable>
            </View>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.ui.overlay,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderTopWidth: 1,
    borderColor: Colors.border.bright,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
    gap: 2,
  },
  inputBlock: {
    marginTop: Spacing.xs,
  },
  footer: {
    alignItems: 'center',
  },
});

export default GuestNicknameSheet;
