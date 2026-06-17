import React, { useEffect, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthButton from '@/components/auth/AuthButton';
import { confirmModalStyles as styles } from '@/assets/styles/confirmModalStyle';
import { playUISound } from '@/utils/sound';
import { octagonPath, octagonInnerPath } from '@/utils/octagonPath';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const CORNER_CUT = 16;
const BORDER_THICKNESS = 3;
const DEFAULT_CARD = { width: 300, height: 200 };

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
  const [cardSize, setCardSize] = useState(DEFAULT_CARD);

  const handleCardLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCardSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    }
  };

  useEffect(() => {
    if (visible) {
      playUISound('modal');
    }
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
        <View style={styles.cardOuter}>
          {/* Inner card — stops tap propagation to backdrop */}
          <Pressable onPress={() => {}} style={styles.cardWrapper} onLayout={handleCardLayout}>
            <Svg
              width={cardSize.width}
              height={cardSize.height}
              style={styles.svgBackground}
              pointerEvents="none"
            >
              <Defs>
                <SvgLinearGradient id="frameGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={Colors.gradients.modalFrame[0]} />
                  <Stop offset="1" stopColor={Colors.gradients.modalFrame[1]} />
                </SvgLinearGradient>
                <SvgLinearGradient id="fillGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={Colors.gradients.modalFill[0]} />
                  <Stop offset="1" stopColor={Colors.gradients.modalFill[1]} />
                </SvgLinearGradient>
              </Defs>
              <Path
                d={octagonPath({ width: cardSize.width, height: cardSize.height, cut: CORNER_CUT })}
                fill="url(#frameGrad)"
              />
              <Path
                d={octagonInnerPath(
                  { width: cardSize.width, height: cardSize.height, cut: CORNER_CUT },
                  BORDER_THICKNESS,
                )}
                fill="url(#fillGrad)"
              />
            </Svg>

            <View style={styles.content}>
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
                    size={26}
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
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
