import Toast from "react-native-toast-message";

type ToastDescription = string | null | undefined;

export const showToast = {
  success: (message: string, description: ToastDescription = undefined) => {
    Toast.show({
      type: "success",
      text1: message,
      text2: description ?? undefined,
      position: "bottom",
      visibilityTime: 4000,
    });
  },
  error: (message: string, description: ToastDescription = undefined) => {
    Toast.show({
      type: "error",
      text1: message,
      text2: description ?? undefined,
      position: "bottom",
      visibilityTime: 5000,
    });
  },
  info: (message: string, description: ToastDescription = undefined) => {
    Toast.show({
      type: "info",
      text1: message,
      text2: description ?? undefined,
      position: "bottom",
      visibilityTime: 3000,
    });
  },
};