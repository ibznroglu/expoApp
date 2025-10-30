
import Toast from 'react-native-toast-message';

export const showToast = {
  success: (message, description = null) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: description,
      position: 'bottom',
      visibilityTime: 4000,
    });
  },
  error: (message, description = null) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
      position: 'bottom',
      visibilityTime: 5000,
    });
  },
  info: (message, description = null) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: description,
      position: 'bottom',
      visibilityTime: 3000,
    });
  },
};