import { Slot } from "expo-router";
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../context/AuthContext';
import { toastConfig } from './utils/toastConfig';

export default function RootLayout() {
  return (<>
  <AuthProvider><Slot /></AuthProvider>
  <Toast config={toastConfig}/>
  </>)
}