import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Colors, Typography } from '@/constants/theme';
import ThemedText from '@/components/ThemedText';
import AuthButton from '@/components/auth/AuthButton';
import { profileStyles } from '@/assets/styles/profileStyle';
import { showToast } from '@/utils/toast';
import ConfirmModal from '@/components/ConfirmModal';
import BackButton from '@/components/BackButton';
import ProfileCard from '@/components/ProfileCard';

export default function ProfileScreen() {
  const { user, isGuest, signout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const typedUser = user && typeof user !== 'boolean' ? user : null;
  const displayName: string = (typedUser?.name as string | undefined) ?? 'Oyuncu';
  const email: string = (typedUser?.email as string | undefined) ?? '';

  const handleSignout = () => {
    setLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setSigningOut(true);
    try {
      await signout();
      // Session becomes null → app/(app)/_layout.tsx redirects to /signin automatically.
      // Do NOT reset signingOut here — component unmounts.
    } catch {
      setSigningOut(false);
      setLogoutModalVisible(false);
      showToast.error('Hata', 'Çıkış yapılamadı, tekrar dene');
    }
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };

  return (
    <View style={profileStyles.container}>
      <LinearGradient colors={Colors.gradients.profileBg} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={profileStyles.safeArea} edges={['top']}>
        {/* Header — pinned at top, outside the ScrollView */}
        <View style={profileStyles.header}>
          <BackButton />
          <ThemedText weight="bold" size={Typography.size.xxl} color={Colors.text.dark}>Profil</ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={profileStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identity Card */}
          <ProfileCard name={displayName} email={email} isGuest={isGuest} />

          {/* Actions */}
          <View style={profileStyles.section}>
            {isGuest && (
              <>
                <ThemedText
                  size={Typography.size.sm}
                  color={Colors.text.darkMuted}
                  style={profileStyles.guestHint}
                >
                  Misafir olarak oynuyorsun. İlerlemeni kaydetmek için hesap oluştur.
                </ThemedText>
                <View style={profileStyles.saveWrap}>
                  <AuthButton
                    variant="gradient"
                    gradientColors={Colors.gradients.option}
                    label="Hesabını Kaydet"
                    icon="person-add"
                    onPress={() => {}}
                    disabled
                  />
                  <View style={profileStyles.soonBadge}>
                    <ThemedText weight="bold" size={Typography.size.xs} color={Colors.bg.primary}>
                      Yakında
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
            <AuthButton
              variant="solid"
              solidColor={Colors.brand.primary}
              label="Çıkış Yap"
              icon="log-out-outline"
              onPress={handleSignout}
              loading={signingOut}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <ConfirmModal
        visible={logoutModalVisible}
        icon="log-out-outline"
        title="Çıkış Yap"
        message={"Hesabından çıkmak istediğine\nemin misin?"}
        confirmLabel="Çıkış Yap"
        cancelLabel="Vazgeç"
        destructive
        loading={signingOut}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </View>
  );
}
