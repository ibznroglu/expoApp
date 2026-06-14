import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthButton from '@/components/auth/AuthButton';
import { profileStyles } from '@/assets/styles/profileStyle';
import { showToast } from '@/utils/toast';

export default function ProfileScreen() {
  const { user, isGuest, signout } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const typedUser = user && typeof user !== 'boolean' ? user : null;
  const displayName: string = (typedUser?.name as string | undefined) ?? 'Oyuncu';
  const email: string = (typedUser?.email as string | undefined) ?? '';

  const avatarInitials = useMemo(() => {
    if (!displayName) return '??';
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return displayName.substring(0, 2).toUpperCase();
  }, [displayName]);

  const handleSignout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            try {
              await signout();
              // Session becomes null → app/(app)/_layout.tsx redirects to /signin automatically.
              // Do NOT reset signingOut here — component unmounts.
            } catch {
              setSigningOut(false);
              showToast.error('Hata', 'Çıkış yapılamadı, tekrar dene');
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={profileStyles.container}>
      <LinearGradient colors={Colors.gradients.background} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={profileStyles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={profileStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={profileStyles.header}>
            <TouchableOpacity
              style={profileStyles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <ThemedText weight="bold" size={Typography.size.xl}>Profil</ThemedText>
          </View>

          {/* Identity Card */}
          <View style={profileStyles.identityCard}>
            <View style={profileStyles.avatarCircle}>
              <ThemedText weight="black" size={Typography.size.xxl} color={Colors.text.primary}>
                {avatarInitials}
              </ThemedText>
            </View>
            <ThemedText
              weight="bold"
              size={Typography.size.xl}
              numberOfLines={1}
              style={profileStyles.displayName}
            >
              {displayName}
            </ThemedText>
            <View style={[profileStyles.badge, isGuest ? profileStyles.badgeGuest : profileStyles.badgeMember]}>
              <Ionicons
                name={isGuest ? 'person-outline' : 'shield-checkmark'}
                size={14}
                color={isGuest ? Colors.wrong : Colors.correct}
              />
              <ThemedText
                weight="semibold"
                size={Typography.size.xs}
                color={isGuest ? Colors.wrong : Colors.correct}
              >
                {isGuest ? 'Misafir' : 'Üye'}
              </ThemedText>
            </View>

            {/* Registered-only: info rows */}
            {!isGuest && (
              <>
                <View style={profileStyles.infoRow}>
                  <ThemedText weight="semibold" size={Typography.size.sm} color={Colors.text.muted} style={profileStyles.infoLabel}>Ad</ThemedText>
                  <ThemedText weight="regular" size={Typography.size.sm} style={profileStyles.infoValue}>{displayName}</ThemedText>
                </View>
                {email !== '' && (
                  <View style={profileStyles.infoRow}>
                    <ThemedText weight="semibold" size={Typography.size.sm} color={Colors.text.muted} style={profileStyles.infoLabel}>E-posta</ThemedText>
                    <ThemedText weight="regular" size={Typography.size.sm} numberOfLines={1} style={profileStyles.infoValue}>{email}</ThemedText>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Actions */}
          <View style={profileStyles.section}>
            {isGuest && (
              <>
                <ThemedText
                  size={Typography.size.sm}
                  color={Colors.text.secondary}
                  style={profileStyles.guestHint}
                >
                  Misafir olarak oynuyorsun. İlerlemeni kaydetmek için hesap oluştur.
                </ThemedText>
                <AuthButton
                  variant="gradient"
                  label="Hesabını Kaydet"
                  icon="person-add"
                  onPress={() => router.push('/signup')}
                  disabled={signingOut}
                />
              </>
            )}
            <AuthButton
              variant="ghost"
              label="Çıkış Yap"
              icon="log-out-outline"
              onPress={handleSignout}
              loading={signingOut}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
