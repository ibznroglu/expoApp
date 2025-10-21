import { useAuth } from '@/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SignInStyles } from '../assets/styles/signinStyle.js';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { createPasswordRecovery } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi giriniz');
      return;
    }
    setLoading(true);
    try {
        console.log('⏳ createPasswordRecovery çağrılıyor...');
      const result = await createPasswordRecovery(email);
      if (result.success) {
        console.log('✅ Sonuç:', result);
        Alert.alert(
          'Başarılı',
          'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin.',
          [{ text: 'Tamam', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Hata', result.error || 'Bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Şifre sıfırlama başarısız');
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
            />

            <TouchableOpacity 
              style={[
                SignInStyles.button,
                loading && { opacity: 0.7 }
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
            >
              <Text style={SignInStyles.forgotPasswordText}>Giriş Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}