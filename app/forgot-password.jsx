import { useAuth } from '@/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SignInStyles } from '../assets/styles/signinStyle.js';
import { showToast } from "./utils/toast.js";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { createPasswordRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      showToast.error('Eksik Bilgi', 'Lütfen e-posta adresinizi giriniz');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast.error('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    setLoading(true);
    try {
      console.log('⏳ createPasswordRecovery çağrılıyor...');
      const result = await createPasswordRecovery(email);
      
      if (result.success) {
        console.log('✅ Sonuç:', result);
        showToast.success(
          'Başarılı', 
          'Şifre sıfırlama linki e-posta adresinize gönderildi'
        );
        
        // 2 saniye sonra geri dön
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        let errorMessage = 'Şifre sıfırlama başarısız';
        let errorDescription = 'Lütfen tekrar deneyin.';
        
        if (result.error?.includes('user') || result.error?.includes('found')) {
          errorMessage = 'Kullanıcı Bulunamadı';
          errorDescription = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
        } else if (result.error?.includes('rate limit') || result.error?.includes('too many')) {
          errorMessage = 'Çok Fazla İstek';
          errorDescription = 'Lütfen bir süre bekleyip tekrar deneyin.';
        }
        
        showToast.error(errorMessage, errorDescription);
      }
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      
      let errorMessage = 'Şifre Sıfırlama Hatası';
      let errorDescription = 'Bir hata oluştu, lütfen tekrar deneyin.';
      
      if (error.message?.includes('network') || error.code === 0) {
        errorMessage = 'Ağ Hatası';
        errorDescription = 'İnternet bağlantınızı kontrol edin.';
      }
      
      showToast.error(errorMessage, errorDescription);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Şifremi Unuttum' }} />
      
      <View style={SignInStyles.bg}>
        <View style={SignInStyles.overlay} />
        <View style={SignInStyles.container}>
          <Text style={SignInStyles.forgotPasswordHeadline}>Şifremi Unuttum</Text>
          <Text style={SignInStyles.forgotPasswordSubHeadline}>
            Şifre sıfırlama linkini almak için{"\n"}e-posta adresinizi girin
          </Text>

          <View style={SignInStyles.form}>
            <TextInput
              style={SignInStyles.input}
              placeholder="E-posta adresiniz"
              placeholderTextColor="#eee"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
              editable={!loading}
            />

            <TouchableOpacity 
              style={[
                SignInStyles.button,
                loading && SignInStyles.buttonDisabled
              ]}
              onPress={handleSendResetLink}
              disabled={loading}
            >
              <Text style={SignInStyles.buttonText}>
                {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={SignInStyles.forgotPasswordButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={SignInStyles.forgotPasswordText}>Giriş Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}