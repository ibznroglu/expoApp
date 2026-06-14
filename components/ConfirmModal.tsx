import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthButton from '@/components/auth/AuthButton';
import { confirmModalStyles as styles } from '@/assets/styles/confirmModalStyle';
import { playUISound } from '@/utils/sound';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: IoniconName;
  destructive?: boolean;
  singleButton?: boolean;
  loading?: boolean;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Tamam',
  cancelLabel = 'Vazgeç',
  onConfirm,
  onCancel,
  icon,
  destructive = false,
  singleButton = false,
  loading = false,
}: ConfirmModalProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      playUISound('modal');
      scale.setValue(0.9);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.9);
      opacity.setValue(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleConfirm = () => {
    playUISound('button');
    onConfirm();
  };
  const handleCancel = () => {
    playUISound('button');
    onCancel();
  };

  const handleRequestClose = () => {
    if (loading) return;
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}
    >
      {/* Backdrop — tap to cancel (guarded while loading) */}
      <Pressable style={styles.overlay} onPress={handleRequestClose}>
        {/* Inner card — stops tap propagation to backdrop; Animated.View owns sizing+transform so gradientBorder only handles visual border/depth */}
        <Animated.View style={{ width: '100%', maxWidth: 340, transform: [{ scale }], opacity }}>
          <Pressable onPress={() => {}} style={{ width: '100%' }}>
          <LinearGradient
            colors={Colors.gradients.modal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.card}>
              {/* Optional icon */}
              {icon && (
                <View
                  style={[
                    styles.iconCircle,
                    destructive && styles.iconCircleDestructive,
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={30}
                    color={destructive ? Colors.wrong : Colors.text.primary}
                  />
                </View>
              )}

              {/* Title */}
              <ThemedText weight="bold" size={Typography.size.xl} style={styles.title}>
                {title}
              </ThemedText>

              {/* Message */}
              {message && (
                <ThemedText
                  weight="regular"
                  size={Typography.size.md}
                  color={Colors.text.secondary}
                  style={styles.message}
                >
                  {message}
                </ThemedText>
              )}

              {/* Buttons */}
              {singleButton ? (
                <View style={styles.buttonRowSingle}>
                  <AuthButton
                    variant="gradient"
                    label={confirmLabel}
                    onPress={handleConfirm}
                    loading={loading}
                  />
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  {/* Cancel */}
                  <View style={styles.buttonFlex}>
                    <AuthButton
                      variant="ghost"
                      label={cancelLabel}
                      onPress={handleCancel}
                      disabled={loading}
                    />
                  </View>

                  {/* Confirm — danger styling when destructive */}
                  {destructive ? (
                    <TouchableOpacity
                      style={styles.dangerButton}
                      onPress={handleConfirm}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.text.primary} />
                      ) : (
                        <ThemedText weight="bold" size={Typography.size.md} color={Colors.text.primary}>
                          {confirmLabel}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.buttonFlex}>
                      <AuthButton
                        variant="gradient"
                        label={confirmLabel}
                        onPress={handleConfirm}
                        loading={loading}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
