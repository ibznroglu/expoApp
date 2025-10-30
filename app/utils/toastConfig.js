
import React from 'react';
import { Text, View } from 'react-native';

export const toastConfig = {
  success: (params) => (
    <View style={{ 
      backgroundColor: '#4BB543', 
      padding: 15, 
      borderRadius: 10, 
      marginHorizontal: 20,
      marginBottom: 50,
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {params.text1 || ''}
      </Text>
      {params.text2 && (
        <Text style={{ color: 'white', fontSize: 12, marginTop: 2 }}>
          {params.text2}
        </Text>
      )}
    </View>
  ),
  error: (params) => (
    <View style={{ 
      backgroundColor: '#FF5252', 
      padding: 15, 
      borderRadius: 10, 
      marginHorizontal: 20,
      marginBottom: 50,
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>
        {params.text1 || ''}
      </Text>
      {params.text2 && (
        <Text style={{ color: 'white', fontSize: 12, marginTop: 2 }}>
          {params.text2}
        </Text>
      )}
    </View>
  ),
};