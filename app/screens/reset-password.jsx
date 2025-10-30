import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Account, Client } from 'react-native-appwrite';
import { showToast } from "../utils/toast.js";

export default function ResetPasswordScreen() {
  const { userId, secret } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast.error('Eksik Bilgi', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword.length < 6) {
      showToast.error('Geçersiz Şifre', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const client = new Client()
        .setEndpoint('https://fra.cloud.appwrite.io/v1')
        .setProject('686b1f5f0031e12b789a');

      const account = new Account(client);
      
      await account.updateRecovery(userId, secret, newPassword);
      
      showToast.success(
        'Başarılı!', 
        'Şifreniz başarıyla sıfırlandı'
      );
      
      // 2 saniye sonra signin sayfasına yönlendir
      setTimeout(() => {
        router.replace('/signin');
      }, 2000);
      
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      
      let errorMessage = 'Şifre Sıfırlama Başarısız';
      let errorDescription = 'Lütfen tekrar deneyin.';
      
      if (error.code === 401 || error.message?.includes('invalid')) {
        errorMessage = 'Geçersiz Link';
        errorDescription = 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.';
      } else if (error.code === 429) {
        errorMessage = 'Çok Fazla İstek';
        errorDescription = 'Lütfen bir süre bekleyip tekrar deneyin.';
      } else if (error.message?.includes('network') || error.code === 0) {
        errorMessage = 'Ağ Hatası';
        errorDescription = 'İnternet bağlantınızı kontrol edin.';
      }
      
      showToast.error(errorMessage, errorDescription);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' }}>
      <Stack.Screen options={{ title: 'Şifre Sıfırlama' }} />
      
      <View style={{ backgroundColor: 'white', padding: 24, borderRadius: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
          Yeni Şifre Belirleyin
        </Text>
        
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
          Lütfen yeni şifrenizi belirleyin
        </Text>

        <TextInput
          style={{ 
            borderWidth: 1, 
            borderColor: '#ddd', 
            padding: 16, 
            marginBottom: 16, 
            borderRadius: 12,
            backgroundColor: loading ? '#f9f9f9' : 'white'
          }}
          placeholder="Yeni şifre (en az 6 karakter)"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TextInput
          style={{ 
            borderWidth: 1, 
            borderColor: '#ddd', 
            padding: 16, 
            marginBottom: 24, 
            borderRadius: 12,
            backgroundColor: loading ? '#f9f9f9' : 'white'
          }}
          placeholder="Şifreyi onayla"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />
        
        <TouchableOpacity 
          onPress={handleResetPassword}
          disabled={loading}
          style={{ 
            backgroundColor: loading ? '#ccc' : '#FF8C00', 
            padding: 16, 
            borderRadius: 12,
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {loading ? 'İşleniyor...' : 'Şifreyi Sıfırla'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}