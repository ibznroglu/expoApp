import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Account, Client } from 'react-native-appwrite';

export default function ResetPasswordScreen() {
  const { userId, secret } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const client = new Client()
        .setEndpoint('https://fra.cloud.appwrite.io/v1')
        .setProject('686b1f5f0031e12b789a');

      const account = new Account(client);
      
      await account.updateRecovery(userId, secret, newPassword);
      
      Alert.alert(
        'Başarılı!', 
        'Şifreniz başarıyla sıfırlandı.',
        [{ text: 'Tamam', onPress: () => router.replace('/signin') }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Şifre sıfırlama başarısız');
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

        <TextInput
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 16, marginBottom: 16, borderRadius: 12 }}
          placeholder="Yeni şifre"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        
        <TextInput
          style={{ borderWidth: 1, borderColor: '#ddd', padding: 16, marginBottom: 24, borderRadius: 12 }}
          placeholder="Şifreyi onayla"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
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